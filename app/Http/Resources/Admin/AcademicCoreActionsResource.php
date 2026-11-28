<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class AcademicCoreActionsResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $course = $this->resource['course'];
        $version = $this->resource['curriculum']['version'] ?? null;
        $actions = [
            'courseStore' => route('admin.academic-core.courses.store', absolute: false),
            'revisionStore' => $course === null ? null : route('admin.academic-core.revisions.store', $course['course']->id, false),
            'revisions' => $course === null ? (object) [] : (object) $course['revisions']->mapWithKeys(
                fn ($row) => [$row->id => $this->revisionRoutes($row->id)],
            )->all(),
            'curriculumStore' => route('admin.academic-core.curricula.store', absolute: false),
            'cohort' => route('admin.academic-core.cohorts.store', absolute: false),
            'adoption' => route('admin.academic-core.adoptions.store', absolute: false),
            'assignmentUpdates' => $version === null ? (object) [] : (object) $this->resource['curriculum']['entries']->mapWithKeys(
                fn ($entry) => [$entry->id => route('admin.academic-core.curricula.assignments.update', [$version->id, $entry->id], false)],
            )->all(),
        ];
        foreach ([
            'assignment' => 'assignment',
            'choice' => 'choice',
            'prerequisite' => 'prerequisite',
            'courseOutcome' => 'course-outcome',
            'programmeOutcome' => 'programme-outcome',
            'mapping' => 'mapping',
            'review' => 'review',
            'approve' => 'approve',
            'fork' => 'fork',
        ] as $field => $name) {
            $actions[$field] = $version === null ? null : route("admin.academic-core.curricula.$name", $version->id, false);
        }

        return $actions;
    }

    /** @return array{review: string, approve: string, update: string} */
    private function revisionRoutes(string $id): array
    {
        return [
            'review' => route('admin.academic-core.revisions.review', $id, false),
            'approve' => route('admin.academic-core.revisions.approve', $id, false),
            'update' => route('admin.academic-core.revisions.update', $id, false),
        ];
    }
}
