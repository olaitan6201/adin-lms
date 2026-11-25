<?php

namespace Tests\Feature\Learning;

use App\Models\Offering;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use ZipArchive;

class ScormRuntimeTest extends LearningTestCase
{
    private string $url;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.url' => 'https://campus.example.edu', 'scorm_runtime.origin' => 'https://reader.example.org']);
        $this->url = 'https://campus.example.edu/courses/'.$this->offering->id.'/scorm';
    }

    public function test_import_requires_exact_profile_and_allocated_owner(): void
    {
        $this->actingAs($this->learner)->post($this->url, $this->upload())->assertNotFound();
        $this->actingAs($this->teacher)->withSession(['security.mfa_user' => $this->teacher->id]);
        $this->post($this->url, $this->upload(true))->assertSessionHasErrors('package');
        $this->assertDatabaseEmpty('scorm_packages');
        $this->post($this->url, $this->upload())->assertRedirect();
        $this->assertDatabaseHas('scorm_packages', ['title' => 'Observation', 'lesson' => 'Synthetic reading']);
    }

    public function test_disabled_or_unsafe_origins_fail_closed(): void
    {
        $this->actingAs($this->learner);
        foreach ([null, 'https://campus.example.edu', 'https://reader.example.edu', 'http://reader.example.org',
            'https://reader.example.org/path', 'https://campus.example.edu@reader.example.org'] as $origin) {
            config(['scorm_runtime.origin' => $origin]);
            $this->get($this->url)->assertNotFound();
        }
    }

    public function test_one_use_signed_snapshot_is_bounded_and_revocable(): void
    {
        $this->actingAs($this->teacher)->withSession(['security.mfa_user' => $this->teacher->id])
            ->post($this->url, $this->upload())->assertRedirect();
        $path = $this->url.'/'.DB::table('scorm_packages')->value('id');
        $this->actingAs($this->learner);
        $this->withCookie(config('session.cookie'), session()->getId());
        $open = fn () => $this->post($path.'/launch')->assertOk()->viewData('reading');
        $state = ['cmi.core.exit' => 'suspend', 'cmi.core.lesson_status' => 'incomplete',
            'cmi.core.score.raw' => '0', 'cmi.suspend_data' => 'Bookmark'];
        $save = function (array $reading, array $data, bool $valid = true) use ($path) {
            $bytes = json_encode($data);

            return $this->call('POST', $path.'/progress', cookies: $this->prepareCookiesForRequest(), server: ['CONTENT_TYPE' => 'application/json',
                'HTTP_X_READING_GRANT' => $reading['grant'], 'HTTP_X_READING_SIGNATURE' => $valid
                    ? hash_hmac('sha256', $bytes, $reading['grant']) : 'invalid'], content: $bytes);
        };
        $old = $open();
        $current = $open();
        $this->post(str_replace($this->offering->id, Offering::factory()->create()->id, $path).'/launch')->assertNotFound();
        $this->actingAs(User::whereEmail('tunde@demo.example.test')->sole());
        $this->assertContains($save($current, $state)->status(), [404, 409]);
        $this->actingAs($this->learner);
        $cookie = config('session.cookie');
        $session = session()->getId();
        $this->withCookie($cookie, str_repeat('f', 40));
        $save($current, $state)->assertConflict();
        $this->withCookie($cookie, $session);
        $save($old, $state)->assertConflict();
        $save($current, $state, false)->assertForbidden();
        $save($current, $state + ['extra' => 'value'])->assertUnprocessable();
        $save($current, ['cmi.suspend_data' => str_repeat('é', 2049)] + $state)->assertUnprocessable();
        $save($current, ['cmi.core.score.raw' => '999'] + $state)->assertUnprocessable();
        $save($current, $state)->assertNoContent();
        $save($current, $state)->assertConflict();
        $current = $open();
        $this->assertEquals($state, $current['state']);
        $this->travel(31)->minutes();
        $save($current, $state)->assertConflict();
        $current = $open();
        $this->withdraw();
        $save($current, $state)->assertNotFound();
        $this->post($path.'/launch')->assertNotFound();
    }

    private function upload(bool $altered = false): array
    {
        $temp = tmpfile();
        $path = stream_get_meta_data($temp)['uri'];
        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::OVERWRITE);
        $zip->addFile(resource_path('scorm-profile/imsmanifest.xml'), 'imsmanifest.xml');
        $zip->addFile(resource_path('scorm-static/reading.html'), 'reading.html');
        $zip->addFromString('reading.js', $altered ? 'unsupported' : file_get_contents(resource_path('scorm-static/reading.js')));
        $zip->addFromString('lesson.txt', 'Synthetic reading');
        $zip->close();
        $file = UploadedFile::fake()->createWithContent('reading.zip', file_get_contents($path));
        fclose($temp);

        return ['title' => 'Observation', 'package' => $file];
    }
}
