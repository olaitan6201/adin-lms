<?php

namespace App\Services\Operations;

use App\Models\Forum;
use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;

final class NativeBackup
{
    public function entries(Offering $offering): array
    {
        $entries = [];
        $lessons = [];
        $budget = 0;
        foreach (Module::where('offering_id', $offering->id)->orderBy('position')->limit(51)->cursor() as $module) {
            if ($module->opens_at || $module->closes_at || count($lessons) >= 50) {
                TextAssetArchive::reject('Backups support up to 50 unscheduled lessons.');
            }

            $materials = [];
            foreach (LearningMaterial::where('module_id', $module->id)->orderBy('id')->limit(21)->cursor() as $material) {
                if ($material->opens_at || $material->closes_at || $material->restrictions || count($materials) >= 20) {
                    TextAssetArchive::reject('Backups support up to 20 unrestricted, unscheduled materials per lesson.');
                }

                $version = MaterialVersion::where('material_id', $material->id)->latest('revision')->first();
                if (! $version || $version->caption_file_id) {
                    TextAssetArchive::reject('A current material revision without a separate caption file is required.');
                }

                $budget += strlen($version->body ?? '') + strlen($version->transcript ?? '') + strlen($version->external_url ?? '');
                if ($budget > 1048576) {
                    TextAssetArchive::reject('The native manifest exceeds 1 MiB.');
                }

                $materials[] = [
                    'title' => $material->title, 'download' => $material->download_allowed,
                    'body' => $version->body, 'url' => $version->external_url, 'transcript' => $version->transcript,
                    'attachment' => $version->file ? PackageAttachments::export($version->file, $entries) : null,
                ];
            }

            $budget += strlen($module->body ?? '');
            if ($budget > 1048576) {
                TextAssetArchive::reject('The native manifest exceeds 1 MiB.');
            }

            $lessons[] = ['title' => $module->title, 'kind' => $module->kind, 'body' => $module->body, 'materials' => $materials];
        }

        $forums = [];
        foreach (Forum::where('offering_id', $offering->id)->orderBy('id')->limit(51)->cursor() as $forum) {
            if ($forum->group_id || count($forums) >= 50) {
                TextAssetArchive::reject('Only whole-offering discussion forums (up to 50) are portable.');
            }

            $forums[] = $forum->title;
        }

        $entries['backup.json'] = json_encode(['format' => 'adin-course-2', 'lessons' => $lessons, 'forums' => $forums], JSON_THROW_ON_ERROR);
        (new NativeManifest)->decode($entries);

        return $entries;
    }
}
