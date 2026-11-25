<?php

namespace App\Services\Learning;

use App\Http\Requests\Learning\RevisionRequest;
use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Module;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

final class RevisionWriter
{
    public function __construct(private PrivateUpload $uploads) {}

    public function append(RevisionRequest $request, Module $lesson, ?LearningMaterial $material): void
    {
        $files = [];
        try {
            DB::transaction(function () use ($request, $lesson, $material, &$files): void {
                Module::whereKey($lesson->id)->lockForUpdate()->firstOrFail();
                $material ??= new LearningMaterial;
                $material
                    ->forceFill([
                        ...$request->safe()->only(['title', 'download_allowed']),
                        'module_id' => $lesson->id,
                        'opens_at' => $request->date('opens_at')?->utc(),
                        'closes_at' => $request->date('closes_at')?->utc(),
                    ])
                    ->save();
                if ($request->hasFile('file')) {
                    $files['file'] = $this->uploads->store($request->file('file'));
                }

                if ($request->hasFile('caption')) {
                    $files['caption'] = $this->uploads->store($request->file('caption'), caption: true);
                }

                $revision = MaterialVersion::where('material_id', $material->id)->max('revision') + 1;
                new MaterialVersion()
                    ->forceFill([
                        ...$request->safe()->only(['body', 'external_url', 'transcript']),
                        'material_id' => $material->id,
                        'revision' => $revision,
                        'file_id' => $files['file']->id ?? null,
                        'caption_file_id' => $files['caption']->id ?? null,
                        'created_at' => now(),
                        'created_by' => $request->user()->id,
                    ])
                    ->save();
            });
        } catch (Throwable $e) {
            foreach ($files as $file) {
                Storage::disk('local')->delete($file->object_key);
            }

            throw $e;
        }
    }
}
