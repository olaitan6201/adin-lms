<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Enrolment;
use App\Models\File;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use App\Models\User;
use Database\Seeders\DemoCampusSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File as Filesystem;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\Support\OperationsAccess;
use Tests\TestCase;

class AcademicStorageTest extends TestCase
{
    use OperationsAccess;

    public function test_another_instance_streams_authorized_files_and_rolls_back_failed_restores(): void
    {
        $scope = 'eng03-'.Str::uuid();
        $root = storage_path('framework/testing/'.$scope);
        Filesystem::ensureDirectoryExists($root);
        touch($root.'/database.sqlite');
        $this->configureNode($root, $scope, 'writer');
        $disk = Storage::disk('academic');
        try {
            $this->artisan('migrate', ['--force' => true])->assertSuccessful();
            $this->seed(DemoCampusSeeder::class);
            $offering = Offering::whereExternalOfferingId('DEMO-CSC101-2026-1')->sole();
            $lesson = Module::whereOfferingId($offering->id)->sole();
            $bytes = "Private reading\n";
            $this->actingAs(User::whereEmail('lecturer@demo.example.test')->sole())
                ->post(route('learning.revisions.store', [$offering, $lesson]), [
                    'title' => 'Notes', 'download_allowed' => 1,
                    'file' => UploadedFile::fake()->createWithContent('notes.txt', $bytes),
                ])->assertRedirect()->assertSessionHasNoErrors();
            $file = File::sole();
            $version = MaterialVersion::whereFileId($file->id)->sole();
            $download = route('learning.download', [$offering, $version]);
            if (config('filesystems.disks.academic.driver') === 's3') {
                $this->assertContains(Http::withoutRedirecting()->get($disk->url($file->object_key))->status(), [403, 404]);
            } else {
                $this->assertSame('private', $disk->getVisibility($file->object_key));
            }
            $this->assertSame([], Storage::disk('public')->allFiles());
            $this->assertSame([], Storage::disk('local')->allFiles());

            $this->refreshApplication();
            $this->withoutVite();
            $this->configureNode($root, $scope, 'reader');
            $learner = User::whereEmail('ada@demo.example.test')->sole();
            $response = $this->actingAs($learner)->get($download)->assertDownload('notes.txt');
            $this->assertSame(hash('sha256', $bytes), hash('sha256', $response->streamedContent()));
            Enrolment::whereOfferingId($offering->id)->whereStudentId($learner->student->id)->update(['status' => 'withdrawn']);
            $this->get($download)->assertNotFound();

            $this->operator();
            $archive = $this->get("/operations/courses/$offering->id/export/native")->assertOk()->getContent();
            $upload = fn () => UploadedFile::fake()->createWithContent('backup.zip', $archive);
            $target = Offering::factory()->create();
            $this->postJson("/operations/courses/$target->id/import", ['package' => $upload()])->assertCreated();
            $restored = File::where('id', '!=', $file->id)->sole();
            $this->assertSame($bytes, $disk->get($restored->object_key));
            $before = $disk->allFiles();
            $this->assertCount(2, $before);
            $other = Offering::factory()->create();
            AuditLog::creating(function () use ($disk): void {
                $this->assertCount(3, $disk->allFiles());
                abort(409, 'Simulated failure after object write.');
            });
            $this->postJson("/operations/courses/$other->id/import", ['package' => $upload()])->assertConflict();
            $this->assertEqualsCanonicalizing($before, $disk->allFiles());
            $this->assertDatabaseCount('files', 2);
            $this->assertDatabaseMissing('modules', ['offering_id' => $other->id]);
        } finally {
            $disk->deleteDirectory('learning');
            Filesystem::deleteDirectory($root);
        }
    }

    private function configureNode(string $root, string $scope, string $node): void
    {
        $s3 = config('filesystems.disks.academic.driver') === 's3';
        if ($s3) {
            $this->assertContains(parse_url((string) config('filesystems.disks.academic.endpoint'), PHP_URL_HOST), ['127.0.0.1', 'localhost']);
        }

        config([
            'database.default' => 'sqlite',
            'database.connections.sqlite.url' => null,
            'database.connections.sqlite.database' => $root.'/database.sqlite',
            'filesystems.default' => 'public',
            'filesystems.disks.academic.url' => null,
            'filesystems.disks.academic.use_path_style_endpoint' => true,
            'filesystems.disks.local.root' => "$root/$node/private",
            'filesystems.disks.public.root' => "$root/$node/public",
            'filesystems.disks.academic.root' => $s3 ? $scope : "$root/shared",
        ]);
        DB::purge('sqlite');
    }
}
