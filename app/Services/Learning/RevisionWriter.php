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
        $file = null;
        try {
            DB::transaction(function () use ($request, $lesson, $material, &$file): void {
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
                $file = $request->hasFile('file') ? $this->uploads->store($request->file('file')) : null;
                $revision = MaterialVersion::where('material_id', $material->id)->max('revision') + 1;
                new MaterialVersion()
                    ->forceFill([
                        ...$request->safe()->only(['body', 'external_url']),
                        'material_id' => $material->id,
                        'revision' => $revision,
                        'file_id' => $file?->id,
                        'created_at' => now(),
                        'created_by' => $request->user()->id,
                    ])
                    ->save();
            });
        } catch (Throwable $e) {
            if ($file) {
                Storage::disk('local')->delete($file->object_key);
            }

            throw $e;
        }
    }
}
