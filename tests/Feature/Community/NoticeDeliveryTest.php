<?php

namespace Tests\Feature\Community;

use App\Jobs\DeliverCommunityEmail;
use App\Mail\CommunityNoticeMail;
use App\Models\Announcement;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Symfony\Component\Mailer\Exception\TransportException;

class NoticeDeliveryTest extends CommunityTestCase
{
    public function test_database_worker_delivers_once_after_repeated_scans(): void
    {
        config(['queue.default' => 'database', 'mail.default' => 'array']);
        $this->artisan('community:notify')->assertSuccessful();
        $this->artisan('community:notify')->assertSuccessful();
        $count = NotificationDelivery::count();
        $this->assertGreaterThan(0, $count);
        $this->assertDatabaseCount('jobs', $count);
        $this->artisan('queue:work', [
            'connection' => 'database',
            '--stop-when-empty' => true,
            '--sleep' => 0,
            '--tries' => 1,
        ])->assertSuccessful();
        $this->assertSame(
            $count,
            NotificationDelivery::where('status', 'delivered')->where('attempt_count', 1)->count(),
        );
        $this->artisan('community:notify')->assertSuccessful();
        $this->assertDatabaseEmpty('jobs');
        $this->assertCount($count, Mail::mailer('array')->getSymfonyTransport()->messages());
    }

    public function test_durable_inbox_survives_email_failure_and_replay(): void
    {
        Queue::fake();
        $course = $this->course();
        $recipient = $this->person('ada');
        $announcement = Announcement::forceCreate([
            'author_id' => $this->person('lecturer')->id,
            'offering_id' => $course->id,
            'published_at' => now(),
            'body' => 'Bring notes',
        ]);
        $this->artisan('community:notify')->assertSuccessful();
        $this->artisan('community:notify')->assertSuccessful();
        $notice = Notification::where('event_key', 'announcement:'.$announcement->id)
            ->where('recipient_id', $recipient->id)
            ->sole();
        $delivery = NotificationDelivery::where('notification_id', $notice->id)->sole();
        Queue::assertPushed(DeliverCommunityEmail::class, fn ($job) => $job->deliveryId === $delivery->id);
        $mailer = Mail::getFacadeRoot();
        Mail::shouldReceive('to')
            ->once()
            ->with($recipient->email)
            ->andThrow(new TransportException('unavailable'));
        $job = new DeliverCommunityEmail($delivery->id);
        $job->handle();
        $this->assertDatabaseHas('notification_deliveries', [
            'id' => $delivery->id,
            'status' => 'pending',
            'attempt_count' => 1,
            'last_error_code' => 'mail_transport_failed',
        ]);
        $read = route('community.notifications.read', $notice);
        $this->actingAs($this->person('tunde'))
            ->patch($read, ['read' => true])
            ->assertNotFound();
        $this->actingAs($recipient)
            ->patch($read, ['read' => true])
            ->assertRedirect();
        $this->assertNotNull($notice->fresh()->read_at);
        $this->patch($read, ['read' => false])->assertRedirect();
        $this->assertNull($notice->fresh()->read_at);
        Mail::swap($mailer);
        Mail::fake();
        $job->handle();
        Mail::assertNothingSent();
        $this->travel(2)->minutes();
        $job->handle();
        $job->handle();
        Mail::assertSentCount(1);
        Mail::assertSent(CommunityNoticeMail::class, fn ($mail) => $mail->hasTo($recipient->email));
        $this->assertDatabaseHas('notification_deliveries', [
            'id' => $delivery->id,
            'status' => 'delivered',
            'attempt_count' => 2,
        ]);
    }

    public function test_exhausted_transport_retries_stop_without_losing_the_notice(): void
    {
        Queue::fake();
        $this->artisan('community:notify')->assertSuccessful();
        $delivery = NotificationDelivery::firstOrFail();
        Mail::shouldReceive('to')->times(5)->andThrow(new TransportException('unavailable'));
        $job = new DeliverCommunityEmail($delivery->id);
        foreach ([1, 2, 4, 8, 16] as $minutes) {
            $job->handle();
            $this->travel($minutes)->minutes();
        }

        $job->handle();
        $this->assertDatabaseHas('notification_deliveries', [
            'id' => $delivery->id,
            'status' => 'failed',
            'attempt_count' => 5,
            'next_attempt_at' => null,
        ]);
        $this->assertDatabaseHas('notifications', ['id' => $delivery->notification_id, 'read_at' => null]);
    }
}
