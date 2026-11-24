<?php

namespace App\Services\Operations;

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
        $rows = (new CoursePackage)->unpack(TextAssetArchive::read($path));

        return DB::transaction(function () use ($actor, $offering, $rows): int {
            $target = Offering::whereKey($offering->id)->lockForUpdate()->firstOrFail();
            abort_if($target->status !== 'draft' || Module::where('offering_id', $target->id)->exists(), 409, 'Select an empty draft offering.');
            foreach ($rows as $index => $row) {
                $module = Module::forceCreate(['offering_id' => $target->id, 'position' => $index + 1,
                    'title' => $row['title'], 'kind' => 'chapter', 'body' => $row['body']]);
                foreach ($row['links'] as $link) {
                    $material = LearningMaterial::forceCreate(['module_id' => $module->id, 'title' => $link['title'], 'download_allowed' => false]);
                    MaterialVersion::forceCreate(['material_id' => $material->id, 'revision' => 1,
                        'external_url' => $link['url'], 'created_at' => now(), 'created_by' => $actor->id]);
                }
            }
            OperationsAudit::record($actor, 'course.imported', $target->id, ['chapters' => count($rows)]);

            return count($rows);
        });
    }

    public function export(User $actor, Offering $offering, string $format): string
    {
        $entries = [];
        $chapters = [];
        $modules = Module::where('offering_id', $offering->id)->orderBy('position')->limit(51)->cursor();
        $total = 0;
        foreach ($modules as $index => $module) {
            if ($index >= 50 || $module->kind !== 'chapter' || $module->opens_at || $module->closes_at
                || ($total += strlen($module->body ?? '')) > 524288) {
                TextAssetArchive::reject('Only 1–50 unscheduled text chapters within the size limit can be exchanged.');
            }
            $file = 'chapter-'.($index + 1).'.txt';
            $entries[$file] = $module->body ?? '';
            $chapters[] = ['title' => $module->title, 'file' => $file, 'links' => $this->links($module)];
        }
        if ($format === 'scorm') {
            $entries['imsmanifest.xml'] = (new ScormWriter)->manifest($chapters);
        } else {
            $entries['course.json'] = json_encode(['format' => 'adin-text-1', 'chapters' => $chapters], JSON_THROW_ON_ERROR);
        }
        (new CoursePackage)->unpack($entries);
        $bytes = TextAssetArchive::write($entries);
        OperationsAudit::record($actor, 'course.exported', $offering->id, ['format' => $format, 'chapters' => count($chapters)]);

        return $bytes;
    }

    /** @return list<array{title:string,url:string}> */
    private function links(Module $module): array
    {
        $links = [];
        foreach (LearningMaterial::where('module_id', $module->id)->orderBy('id')->limit(11)->get() as $material) {
            $versions = MaterialVersion::where('material_id', $material->id)->orderByDesc('revision')->limit(2)->get();
            $v = $versions->first();
            if ($material->restrictions || $material->opens_at || $material->closes_at || $material->download_allowed
                || $versions->count() !== 1 || ! $v->external_url || $v->file_id || $v->caption_file_id || $v->body || $v->transcript) {
                TextAssetArchive::reject('Unsupported material: expected a single unrestricted, non-downloadable HTTPS link revision.');
            }
            $links[] = ['title' => $material->title, 'url' => $v->external_url];
        }

        return $links;
    }
}
