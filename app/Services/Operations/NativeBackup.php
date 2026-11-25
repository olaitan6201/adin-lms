<?php

namespace App\Services\Operations;

use App\Models\Announcement;
use App\Models\ClassSession;
use App\Models\Forum;
use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use App\Models\User;

final class NativeBackup
{
    public function entries(Offering $offering, User $actor): array
    {
        $entries = [];
        NativeRules::check(! $offering->activity_order && ! ClassSession::where('offering_id', $offering->id)->exists()
            && ! Announcement::where('offering_id', $offering->id)->exists(), 'Custom activity order, class meetings and announcements cannot be backed up.');
        $modules = [];
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

            $modules[$module->id] = count($lessons);
            $lessons[] = ['title' => $module->title, 'kind' => $module->kind, 'body' => $module->body, 'materials' => $materials];
        }

        $forums = [];
        foreach (Forum::where('offering_id', $offering->id)->orderBy('id')->limit(51)->cursor() as $forum) {
            if ($forum->group_id || count($forums) >= 50) {
                TextAssetArchive::reject('Only whole-offering discussion forums (up to 50) are portable.');
            }

            $forums[] = $forum->title;
        }

        $assessment = (new NativeAssessmentSnapshot)->collect($offering, $actor, $modules, $entries);
        $manifest = ['format' => $assessment ? 'adin-course-3' : 'adin-course-2', 'lessons' => $lessons, 'forums' => $forums];
        if ($assessment) {
            $manifest['assessment'] = $assessment;
        }
        $entries['backup.json'] = json_encode($manifest, JSON_THROW_ON_ERROR);
        NativeRules::check(strlen($entries['backup.json']) <= 1048576, 'Course manifest exceeds 1 MiB.');
        (new NativeManifest)->decode($entries);

        return $entries;
    }
}
