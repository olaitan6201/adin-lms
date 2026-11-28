<?php

namespace App\Http\Resources\Admin;

use App\Models\CourseRevision;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class AcademicCoreCourseResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $course = $this->resource['course'];

        return [
            'id' => $course->id,
            'name' => $course->code,
            'revisions' => $this->resource['revisions']->map(fn (CourseRevision $row) => [
                'id' => $row->id,
                'title' => $row->title,
                'description' => $row->description,
                'syllabus' => $row->syllabus,
                'learning_outcomes' => $row->learning_outcomes,
                'standard_units' => $row->standard_units,
                'revision_number' => $row->revision_number,
                'status' => $row->status->value,
            ])->all(),
        ];
    }
}
