<?php

namespace App\Http\Resources\Admin;

use App\Enums\PathwayCurriculumAuditAction;
use App\Models\AuditLog;
use App\Models\CurriculumCourse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

final class AcademicCoreVersionHistoryResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $source = $this->resource['source'];

        return [
            'sourceVersion' => (int) $source->version,
            'sourceUrl' => route('admin.academic-core', ['curriculum' => $source->id], false),
            'changes' => $this->resource['changes']->map(fn (AuditLog $row) => [
                'id' => $row->id,
                'description' => $this->description($row, $this->resource['entries']),
            ])->all(),
        ];
    }

    /** @param Collection<string, CurriculumCourse> $entries */
    private function description(AuditLog $row, Collection $entries): string
    {
        $detail = $row->details;
        $entry = $entries->get($detail['curriculum_course_id'] ?? $detail['entry_id'] ?? '');

        return match ($row->pathway_curriculum_action) {
            PathwayCurriculumAuditAction::Assigned => $entry ? "Assigned {$entry->code}." : 'Added a course assignment.',
            PathwayCurriculumAuditAction::AssignmentUpdated => $this->assignmentChange($entry, $detail),
            PathwayCurriculumAuditAction::ChoiceAdded => 'Added choice group '.($detail['code'] ?? '')
                .' (choose '.($detail['minimum_selections'] ?? '?').'–'.($detail['maximum_selections'] ?? '?').').',
            PathwayCurriculumAuditAction::PrerequisiteAdded => $this->prerequisite($entry, $entries->get($detail['required_entry_id'] ?? '')),
            PathwayCurriculumAuditAction::CourseOutcomeAdded => 'Added course outcome: '.($detail['statement'] ?? ''),
            PathwayCurriculumAuditAction::ProgrammeOutcomeAdded => 'Added programme outcome: '.($detail['statement'] ?? ''),
            PathwayCurriculumAuditAction::OutcomeMapped => 'Mapped a course outcome to a programme outcome.',
            default => 'Updated the curriculum.',
        };
    }

    private function assignmentChange(?CurriculumCourse $entry, array $detail): string
    {
        $description = $entry ? "Updated the assignment for {$entry->code}." : 'Updated a course assignment.';
        $before = $detail['before'] ?? [];
        $after = $detail['after'] ?? [];
        $fields = [];
        foreach ([
            'course_revision_id' => 'course revision',
            'programme_level_id' => 'programme level',
            'category' => 'category',
            'credits' => 'effective units',
            'semester_position' => 'semester position',
        ] as $key => $label) {
            if (isset($before[$key], $after[$key]) && $before[$key] !== $after[$key]) {
                $fields[] = str_ends_with($key, '_id') ? $label : "$label: {$before[$key]} → {$after[$key]}";
            }
        }

        return $fields === [] ? "$description No field values changed." : "$description ".implode('; ', $fields).'.';
    }

    private function prerequisite(?CurriculumCourse $entry, ?CurriculumCourse $required): string
    {
        return $entry && $required ? "Added {$required->code} as a prerequisite for {$entry->code}." : 'Added a prerequisite.';
    }
}
