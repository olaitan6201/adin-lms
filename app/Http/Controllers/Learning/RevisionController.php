<?php

namespace App\Http\Controllers\Learning;

use App\Http\Requests\Learning\RevisionRequest;
use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use App\Policies\LearningPolicy;
use App\Services\Learning\LessonAccess;
use App\Services\Learning\PrivateUpload;
use App\Services\Learning\ResourceFileFormat;
use App\Services\Learning\RevisionWriter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class RevisionController
{
    public function store(
        RevisionRequest $request,
        Offering $offering,
        Module $lesson,
        RevisionWriter $writer,
        ?LearningMaterial $material = null,
    ): RedirectResponse {
        abort_unless(
            $lesson->offering_id === $offering->id &&
                (! $material || $material->module_id === $lesson->id),
            404,
        );
        $writer->append($request, $lesson, $material);

        return to_route('learning.index', $offering);
    }

    public function download(
        Request $request,
        Offering $offering,
        MaterialVersion $version,
        LearningPolicy $policy,
    ): StreamedResponse {
        $material = $version->material;
        abort_unless($material->module->offering_id === $offering->id, 404);
        $staff = $policy->audience($request->user(), $offering);
        abort_unless(
            $staff ||
                ($policy->released($material->module) &&
                    LessonAccess::unlocked($request->user()->id)->where('lesson.id', $material->module_id)->exists() &&
                    $policy->released($material) &&
                    $material->download_allowed &&
                    ! MaterialVersion::where('material_id', $material->id)
                        ->where('revision', '>', $version->revision)
                        ->exists()),
            404,
        );
        $caption = $request->boolean('caption');
        $file = $caption ? $version->captionFile : $version->file;
        abort_unless(
            $file &&
                $file->validation_status === PrivateUpload::VALIDATED &&
                str_starts_with($file->object_key, PrivateUpload::DIRECTORY.'/'),
            404,
        );
        if ($caption || $request->boolean('preview')) {
            $types = $caption ? ['text/vtt'] : [...ResourceFileFormat::INLINE_IMAGES, ...ResourceFileFormat::INLINE_MEDIA];
            abort_unless(in_array($file->media_type, $types, true), 404);

            return Storage::disk('local')->response($file->object_key, $file->filename, [
                'Content-Type' => $file->media_type,
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control' => 'private, no-store',
            ]);
        }

        return Storage::disk('local')->download($file->object_key, $file->filename, [
            'Content-Type' => 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-store',
        ]);
    }
}
