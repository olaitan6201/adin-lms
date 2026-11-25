<?php

namespace App\Services\Operations;

use App\Enums\CoursePackageFormat;
use App\Enums\Learning\LessonKind;
use App\Enums\OfferingStatus;
use App\Enums\OperationsEvent;
use App\Models\Announcement;
use App\Models\ClassSession;
use App\Models\Forum;
use App\Models\Gradebook;
use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

final class CourseTransfer
{
    public function import(User $actor, Offering $offering, string $path): int
    {
        $entries = TextAssetArchive::read($path);
        $backup = isset($entries['backup.json']) ? (new NativeManifest)->decode($entries, fn () => NativeAssessmentSnapshot::authorize($actor, $offering)) : null;
        $chapters = $backup ? [] : (new CoursePackage)->unpack($entries);
        $written = [];

        try {
            return DB::transaction(function () use ($actor, $offering, $chapters, $backup, $entries, &$written): int {
                $target = Offering::whereKey($offering->id)->lockForUpdate()->firstOrFail();
                $hasModules = Module::where('offering_id', $target->id)->exists();
                if ($backup) {
                    abort_if($target->activity_order || Announcement::where('offering_id', $target->id)->exists(),
                        409, 'Select an empty draft offering without announcements or a custom activity order.');
                }

                abort_if($target->status !== OfferingStatus::Draft || $hasModules || Forum::where('offering_id', $target->id)->exists()
                    || Gradebook::where('offering_id', $target->id)->exists() || ClassSession::where('offering_id', $target->id)->exists()
                    || $target->enrolments()->exists(), 409, 'Select an empty draft offering without enrolments, lessons, forums, classes or a gradebook.');

                foreach ($chapters as $index => $chapter) {
                    $this->storeChapter($actor, $target, $index + 1, $chapter);
                }

                $count = $backup ? (new NativeRestore)->store($backup, $entries, $target, $actor, $written) : count($chapters);
                OperationsAudit::record($actor, OperationsEvent::CourseImported, $target->id, ['items' => $count]);

                return $count;
            });
        } catch (Throwable $failure) {
            if ($written) {
                Storage::disk('local')->delete($written);
            }

            throw $failure;
        }
    }

    private function storeChapter(User $actor, Offering $target, int $position, PortableChapter $chapter): void
    {
        $module = Module::forceCreate([
            'offering_id' => $target->id,
            'position' => $position,
            'title' => $chapter->title,
            'kind' => LessonKind::Chapter->value,
            'body' => $chapter->body,
        ]);

        foreach ($chapter->links as $link) {
            $material = LearningMaterial::forceCreate([
                'module_id' => $module->id,
                'title' => $link['title'],
                'download_allowed' => false,
            ]);

            MaterialVersion::forceCreate([
                'material_id' => $material->id,
                'revision' => 1,
                'external_url' => $link['url'],
                'created_at' => now(),
                'created_by' => $actor->id,
            ]);
        }
    }

    public function export(User $actor, Offering $offering, CoursePackageFormat $format): string
    {
        if ($format === CoursePackageFormat::Native) {
            $bytes = TextAssetArchive::write((new NativeBackup)->entries($offering, $actor));
            OperationsAudit::record($actor, OperationsEvent::CourseExported, $offering->id, ['format' => $format->value]);

            return $bytes;
        }

        if (Forum::where('offering_id', $offering->id)->exists()) {
            TextAssetArchive::reject('Use the native backup to include forums.');
        }

        $entries = [];
        $chapters = [];
        $modules = Module::where('offering_id', $offering->id)->orderBy('position')->limit(51)->cursor();
        $total = 0;
        foreach ($modules as $index => $module) {
            $total += strlen($module->body ?? '');
            if ($index >= 50 || $module->kind !== LessonKind::Chapter->value || $module->opens_at || $module->closes_at
                || $total > TextAssetArchive::MAX_TOTAL_BYTES) {
                TextAssetArchive::reject('Only 1–50 unscheduled text chapters within the size limit can be exchanged.');
            }

            $file = 'chapter-'.($index + 1).'.txt';
            $entries[$file] = $module->body ?? '';
            if (LearningMaterial::where('module_id', $module->id)->exists()) {
                TextAssetArchive::reject('Use the native backup to include lesson materials.');
            }

            $chapters[] = ['title' => $module->title, 'file' => $file, 'links' => []];
        }

        $entries[$format->manifestName()] = (new ScormWriter)->manifest($chapters);
        (new CoursePackage)->unpack($entries);
        $bytes = TextAssetArchive::write($entries);
        OperationsAudit::record($actor, OperationsEvent::CourseExported, $offering->id, [
            'format' => $format->value,
            'chapters' => count($chapters),
        ]);

        return $bytes;
    }
}
