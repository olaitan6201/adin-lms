<?php

namespace App\Services\Learning;

use App\Enums\EnrolmentStatus;
use App\Enums\OfferingStatus;
use App\Models\MaterialVersion;
use App\Models\Student;
use App\Policies\LearningPolicy;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

final class StudentDownloads
{
    public function __construct(private LearningPolicy $policy) {}

    public function forStudent(Student $student): Collection
    {
        $registered = $student->enrolments()->select('offering_id')->where('status', EnrolmentStatus::Registered);
        $unlocked = LessonAccess::unlocked($student->user_id)->whereIn('lesson.offering_id', $registered);

        return MaterialVersion::query()
            ->with(['file', 'material.module.offering.curriculumCourse.course'])
            ->whereHas('material', fn ($query) => $query->where('download_allowed', true)->whereIn('module_id', $unlocked))
            ->whereHas('material.module.offering', fn ($query) => $query->where('status', OfferingStatus::Published))
            ->whereHas('file', fn ($query) => $query->where('validation_status', PrivateUpload::VALIDATED))
            ->whereNotExists(fn ($query) => $query->selectRaw('1')->from('material_versions as newer')
                ->whereColumn('newer.material_id', 'material_versions.material_id')
                ->whereColumn('newer.revision', '>', 'material_versions.revision'))
            ->orderByDesc('created_at')->orderBy('id')->get()
            ->filter(fn (MaterialVersion $version) => $this->policy->released($version->material->module)
                && $this->policy->released($version->material)
                && str_starts_with($version->file->object_key, PrivateUpload::DIRECTORY.'/')
                && Storage::disk('academic')->exists($version->file->object_key))
            ->map(function (MaterialVersion $version): array {
                $offering = $version->material->module->offering;
                $curriculum = $offering->curriculumCourse;

                return [
                    'id' => $version->id,
                    'title' => $version->material->title,
                    'course' => $curriculum->course->code.' · '.$curriculum->title,
                    'filename' => $version->file->filename,
                    'bytes' => (int) $version->file->size_bytes,
                    'download' => route('learning.download', [$offering, $version]),
                ];
            })->values();
    }
}
