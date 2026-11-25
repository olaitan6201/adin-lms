<?php

namespace App\Services\Operations;

use App\Models\AssessmentItem;
use App\Models\Assignment;
use App\Models\AssignmentReference;
use App\Models\Course;
use App\Models\Examination;
use App\Models\ExamSlot;
use App\Models\Gradebook;
use App\Models\GradeBoundary;
use App\Models\GradingPolicy;
use App\Models\GradingPolicyItem;
use App\Models\Offering;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionVersion;
use App\Models\User;
use Illuminate\Support\Carbon;

final class NativeAssessmentRestore
{
    public function preflight(array $data, Offering $target, User $actor): void
    {
        NativeAssessmentSnapshot::authorize($actor, $target);
        if ($data['banks']) {
            $course = $target->curriculumCourse?->course_id;
            NativeRules::check($course !== null, 'Choose a draft linked to the destination curriculum course.');
            Course::whereKey($course)->lockForUpdate()->firstOrFail();
            $collision = QuestionBank::where('course_id', $course)->whereIn('topic', array_column($data['banks'], 'topic'))->exists();
            abort_if($collision, 409, 'A destination question bank already uses a package topic. No banks were merged.');
        }
    }

    public function store(array $data, Offering $target, User $actor, array $modules, array $entries, array &$written): int
    {
        $banks = [];
        $versions = [];
        foreach ($data['banks'] as $b => $bank) {
            $banks[$b] = QuestionBank::forceCreate(['course_id' => $target->curriculumCourse->course_id, 'topic' => $bank['topic']])->id;
            foreach ($bank['questions'] as $q => $rows) {
                $question = Question::forceCreate(['bank_id' => $banks[$b]]);
                foreach ($rows as $v => $row) {
                    $versions[$b][$q][$v] = QuestionVersion::forceCreate([
                        'question_id' => $question->id, 'revision' => $row['revision'], 'kind' => $row['kind'],
                        'prompt' => $row['prompt'], 'options' => $row['options'], 'marking_key' => $row['key'],
                    ])->id;
                }
            }
        }

        if ($data['policy'] !== null) {
            $policy = GradingPolicy::forceCreate(['name' => 'Restored '.$target->id, 'version' => 1, 'offering_id' => $target->id,
                'rounding_rule' => $data['policy']['rounding'], 'created_by' => $actor->id, 'created_at' => now()]);
            foreach ($data['policy']['boundaries'] as $boundary) {
                GradeBoundary::forceCreate(['policy_id' => $policy->id, 'minimum_percent' => $boundary['minimum'], 'grade' => $boundary['grade']]);
            }

            $book = Gradebook::forceCreate(['offering_id' => $target->id, 'policy_id' => $policy->id]);
            foreach ($data['items'] as $i => $row) {
                $fields = ['title' => $row['title'], 'kind' => $row['kind'], 'weight_percent' => $row['weight'],
                    'maximum_score' => $row['maximum'], 'rubric' => NativeRubric::restore($row['rubric'])];
                $item = AssessmentItem::forceCreate($fields + ['gradebook_id' => $book->id, 'module_id' => $modules[$row['module']] ?? null]);
                GradingPolicyItem::forceCreate($fields + ['policy_id' => $policy->id, 'assessment_item_id' => $item->id, 'position' => $i]);
                if ($row['kind'] === 'assignment') {
                    $this->assignment($item, $row['definition'], $entries, $written);
                } elseif ($row['kind'] === 'exam') {
                    $this->exam($item, $row['definition'], $banks, $versions);
                }
            }
        }

        return count($banks) + count($data['items']);
    }

    private function assignment(AssessmentItem $item, array $definition, array $entries, array &$written): void
    {
        $references = $definition['references'];
        unset($definition['references']);
        foreach (['opens_at', 'due_at', 'closes_at'] as $date) {
            $definition[$date] = Carbon::parse($definition[$date])->setTimezone(config('app.timezone'));
        }

        $assignment = Assignment::forceCreate($definition + ['item_id' => $item->id]);
        foreach ($references as $ref) {
            $file = PackageAttachments::restore($ref, $entries[$ref['asset']], true);
            $written[] = $file->object_key;
            AssignmentReference::forceCreate(['assignment_id' => $assignment->id, 'file_id' => $file->id]);
        }
    }

    private function exam(AssessmentItem $item, array $definition, array $banks, array $versions): void
    {
        $slots = $definition['slots'];
        unset($definition['slots']);
        foreach (['opens_at', 'closes_at'] as $date) {
            $definition[$date] = Carbon::parse($definition[$date])->setTimezone(config('app.timezone'));
        }

        $exam = Examination::forceCreate($definition + ['item_id' => $item->id]);
        foreach ($slots as $i => $slot) {
            $fixed = null;
            if ($slot['fixed'] !== null) {
                [$b, $q, $v] = $slot['fixed'];
                $fixed = $versions[$b][$q][$v];
            }

            ExamSlot::forceCreate(['exam_id' => $exam->id, 'position' => $i + 1, 'points' => $slot['points'],
                'fixed_version_id' => $fixed, 'draw_from_bank_id' => $banks[$slot['draw']] ?? null]);
        }
    }
}
