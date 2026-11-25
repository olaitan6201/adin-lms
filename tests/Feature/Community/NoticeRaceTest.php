<?php

namespace Tests\Feature\Community;

use App\Models\Announcement;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\User;
use App\Services\Community\ScanAcademicNotices;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use Throwable;

final class NoticeRaceTest extends TestCase
{
    public function test_scanner_and_targeted_capture_both_see_an_absent_event_but_create_only_one_delivery(): void
    {
        if (! function_exists('pcntl_fork')) {
            $this->markTestSkipped('Requires pcntl for independent connections.');
        }

        $path = tempnam(sys_get_temp_dir(), 'notice-race-');
        config(['database.default' => 'notice_race', 'database.connections.notice_race' => [
            'driver' => 'sqlite', 'database' => $path, 'foreign_key_constraints' => true, 'busy_timeout' => 5000,
        ]]);
        try {
            $this->artisan('migrate', ['--database' => 'notice_race', '--force' => true])->assertSuccessful();
            $user = User::factory()->create();
            $notice = Announcement::withoutEvents(fn () => Announcement::forceCreate([
                'author_id' => $user->id, 'body' => 'Review timetable', 'published_at' => now(),
            ]));
            DB::purge('notice_race');
            [$a, $b] = stream_socket_pair(STREAM_PF_UNIX, STREAM_SOCK_STREAM, 0);
            $pid = pcntl_fork();
            $this->assertGreaterThanOrEqual(0, $pid);
            $socket = $pid ? $a : $b;
            fclose($pid ? $b : $a);
            stream_set_timeout($socket, 8);
            DB::listen(function (QueryExecuted $query) use ($socket): void {
                static $waiting = true;
                if ($waiting && str_contains($query->sql, 'from "notifications"')) {
                    $waiting = false;
                    fwrite($socket, '1');
                    $this->assertSame('1', fread($socket, 1));
                }
            });
            $scanner = app(ScanAcademicNotices::class);
            if (! $pid) {
                try {
                    $scanner->announcements($notice->id);
                    exit(0);
                } catch (Throwable) {
                    exit(1);
                }
            }

            $scanner->run();
            pcntl_waitpid($pid, $status);
            fclose($socket);
            $this->assertSame(0, pcntl_wexitstatus($status));
            $this->assertSame($user->id, Notification::sole()->recipient_id);
            $this->assertSame(Notification::sole()->id, NotificationDelivery::sole()->notification_id);
        } finally {
            DB::purge('notice_race');
            unlink($path);
        }
    }
}
