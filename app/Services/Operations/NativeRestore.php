<?php

namespace App\Services\Operations;

use App\Models\Forum;
use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use App\Models\User;

final class NativeRestore
{
    public function store(array $backup, array $entries, Offering $target, User $actor, array &$written): int
    {
        $modules = [];
        $assessment = $backup['assessment'] ?? null;
        $restore = new NativeAssessmentRestore;
        if ($assessment) {
            $restore->preflight($assessment, $target, $actor);
        }

        foreach ($backup['lessons'] as $index => $lesson) {
            $module = Module::forceCreate([
                'offering_id' => $target->id, 'position' => $index + 1,
                'kind' => $lesson['kind'], 'title' => $lesson['title'], 'body' => $lesson['body'],
            ]);
            $modules[$index] = $module->id;
            $references = [];
            foreach ($lesson['materials'] as $row) {
                $material = LearningMaterial::forceCreate([
                    'module_id' => $module->id, 'title' => $row['title'], 'download_allowed' => $row['download'],
                ]);
                if (isset($row['ref'])) {
                    $references[$row['ref']] = $material->id;
                }
                $attachment = $row['attachment'];
                $file = $attachment ? PackageAttachments::restore($attachment, $entries[$attachment['asset']]) : null;
                if ($file) {
                    $written[] = $file->object_key;
                }

                MaterialVersion::forceCreate([
                    'material_id' => $material->id, 'revision' => 1, 'created_at' => now(), 'created_by' => $actor->id,
                    'body' => $row['body'], 'external_url' => $row['url'], 'transcript' => $row['transcript'], 'file_id' => $file?->id,
                ]);
            }

            if ($backup['format'] === NativeMaterialReferences::FORMAT) {
                $module->forceFill(['body' => NativeMaterialReferences::remap($lesson['body'], $references)])->save();
            }
        }

        foreach ($backup['forums'] as $title) {
            Forum::forceCreate(['offering_id' => $target->id, 'title' => $title]);
        }

        $count = $assessment ? $restore->store($assessment, $target, $actor, $modules, $entries, $written) : 0;

        return count($backup['lessons']) + count($backup['forums']) + $count;
    }
}
