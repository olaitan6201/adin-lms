<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\Assignment;
use App\Models\GroupMember;
use App\Models\StudyGroup;
use App\Models\SubmissionVersion;

abstract class ScoredAssignmentCase extends AssessmentCase
{
    /** @return array{item:AssessmentItem,assignment:Assignment,version:SubmissionVersion,rubric:array} */
    protected function scoredAssignment(bool $groupWork = false, ?StudyGroup $group = null): array
    {
        $this->as($this->officer)->post($this->desk, $this->scoredPolicy())
            ->assertSessionHasNoErrors()->assertRedirect();
        $item = AssessmentItem::firstOrFail();
        $this->as($this->marker)->post("/assessment-items/$item->id/assignment", [
            'instructions' => 'Explain the evidence for your argument.',
            'opens_at' => now()->subHour(),
            'due_at' => now()->addHour(),
            'closes_at' => now()->addDay(),
            'formats' => ['txt'],
            'max_bytes' => 1000,
            'editable' => 1,
            'group_work' => $groupWork ? 1 : 0,
        ])->assertSessionHasNoErrors()->assertRedirect();
        $assignment = Assignment::firstOrFail();
        if ($groupWork) {
            abort_if($group === null, 500, 'Group work requires a study group.');
            GroupMember::firstOrCreate([
                'group_id' => $group->id,
                'enrolment_id' => $this->member->id,
            ]);
        }
        $this->as($this->member->student->user)->post("/assignments/$assignment->id", [
            'body' => 'My argument and supporting evidence.',
            'group_id' => $groupWork ? $group?->id : null,
        ])->assertSessionHasNoErrors()->assertRedirect();
        $version = SubmissionVersion::firstOrFail();

        return [
            'item' => $item,
            'assignment' => $assignment,
            'version' => $version,
            'rubric' => $item->rubric,
        ];
    }

    protected function scoredPolicy(): array
    {
        return [
            'rounding' => 'half_up',
            'boundaries' => [['minimum' => '0', 'grade' => 'F'], ['minimum' => '70', 'grade' => 'A']],
            'items' => [[
                'title' => 'Evidence essay',
                'kind' => 'assignment',
                'weight' => '100',
                'maximum' => '10',
                'criteria' => [
                    ['title' => 'Argument', 'description' => 'State a clear claim.', 'levels' => [
                        ['label' => 'Missing', 'points' => '0', 'description' => 'No claim.'],
                        ['label' => 'Complete', 'points' => '4', 'description' => 'Clear claim.'],
                    ]],
                    ['title' => 'Evidence', 'description' => 'Support the claim.', 'levels' => [
                        ['label' => 'Missing', 'points' => '0', 'description' => 'No evidence.'],
                        ['label' => 'Partial', 'points' => '2', 'description' => 'Some evidence.'],
                        ['label' => 'Complete', 'points' => '6', 'description' => 'Strong evidence.'],
                    ]],
                ],
            ]],
        ];
    }

    /** @return list<array{criterion:string,level:string,feedback?:string}> */
    protected function selections(array $rubric, int $argument = 1, int $evidence = 1): array
    {
        return [
            [
                'criterion' => $rubric['criteria'][0]['id'],
                'level' => $rubric['criteria'][0]['levels'][$argument]['id'],
                'feedback' => 'Clear claim.',
            ],
            [
                'criterion' => $rubric['criteria'][1]['id'],
                'level' => $rubric['criteria'][1]['levels'][$evidence]['id'],
                'feedback' => 'Add one more source.',
            ],
        ];
    }
}
