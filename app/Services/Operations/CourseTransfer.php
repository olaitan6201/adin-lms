<?php

namespace App\Services\Operations;

use App\Enums\CoursePackageFormat;
use App\Enums\Learning\LessonKind;
use App\Enums\OfferingStatus;
use App\Enums\OperationsEvent;
use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class CourseTransfer
{
    public function import(User $actor, Offering $offering, string $path): int
    {
        $chapters = (new CoursePackage)->unpack(TextAssetArchive::read($path));

        return DB::transaction(function () use ($actor, $offering, $chapters): int {
            $target = Offering::whereKey($offering->id)->lockForUpdate()->firstOrFail();
            $hasModules = Module::where('offering_id', $target->id)->exists();
            abort_if($target->status !== OfferingStatus::Draft || $hasModules, 409, 'Select an empty draft offering.');

            foreach ($chapters as $index => $chapter) {
                $this->storeChapter($actor, $target, $index + 1, $chapter);
            }

            $count = count($chapters);
            OperationsAudit::record($actor, OperationsEvent::CourseImported, $target->id, ['chapters' => $count]);

            return $count;
        });
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
            $chapters[] = ['title' => $module->title, 'file' => $file, 'links' => $this->links($module)];
        }

        $entries[$format->manifestName()] = match ($format) {
            CoursePackageFormat::Scorm => (new ScormWriter)->manifest($chapters),
            CoursePackageFormat::Native => json_encode(['format' => CoursePackage::NATIVE_VERSION, 'chapters' => $chapters], JSON_THROW_ON_ERROR),
        };
        (new CoursePackage)->unpack($entries);
        $bytes = TextAssetArchive::write($entries);
        OperationsAudit::record($actor, OperationsEvent::CourseExported, $offering->id, [
            'format' => $format->value,
            'chapters' => count($chapters),
        ]);

        return $bytes;
    }

    /** @return list<array{title:string,url:string}> */
    private function links(Module $module): array
    {
        $links = [];
        $materials = LearningMaterial::where('module_id', $module->id)->orderBy('id')->limit(11)->get();
        foreach ($materials as $material) {
            $links[] = ['title' => $material->title, 'url' => $this->exportableUrl($material)];
        }

        return $links;
    }

    private function exportableUrl(LearningMaterial $material): string
    {
        $versions = MaterialVersion::where('material_id', $material->id)->limit(2)->get();
        $version = $versions->first();
        $restricted = $material->restrictions || $material->opens_at || $material->closes_at || $material->download_allowed;
        $linkOnly = $version?->external_url && ! $version->file_id && ! $version->caption_file_id && ! $version->body && ! $version->transcript;

        if ($restricted || $versions->count() !== 1 || ! $linkOnly) {
            TextAssetArchive::reject('Unsupported material: expected a single unrestricted, non-downloadable HTTPS link revision.');
        }

        return $version->external_url;
    }
}
