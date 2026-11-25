<?php

namespace App\Services\Operations;

use App\Enums\PermissionCode;
use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\Assignment;
use App\Models\AssignmentReference;
use App\Models\Examination;
use App\Models\ExamSlot;
use App\Models\Gradebook;
use App\Models\GradeBoundary;
use App\Models\GradingPolicyItem;
use App\Models\Offering;
use App\Models\QuestionBank;
use App\Models\SubmissionFile;
use App\Models\User;
use App\Policies\AssessmentItemPolicy;
use App\Services\Authority\ScopedAuthority;

final class NativeAssessmentSnapshot
{
    public static function authorize(User $actor, Offering $offering): void
    {
        $authority = app(ScopedAuthority::class);
        abort_unless($authority->institutionAllows($actor, PermissionCode::PortabilityManage)
            && app(AssessmentItemPolicy::class)->teaches($actor, $offering), 403, 'Assessment packages require exchange permission and teaching authority for this offering.');
    }

    public function collect(Offering $source, User $actor, array $modules, array &$entries): ?array
    {
        $book = Gradebook::where('offering_id', $source->id)->first();
        $course = $source->curriculumCourse?->course_id;
        if (! $book && ! QuestionBank::where('course_id', $course)->exists()) {
            return null;
        }
        self::authorize($actor, $source);
        $banks = new NativeBankSnapshot($course);
        $policy = null;
        $items = [];
        if ($book) {
            NativeRules::check(! $book->policy->offering_id || $book->policy->offering_id === $source->id, 'Policy belongs to another offering.');
            $boundaries = GradeBoundary::where('policy_id', $book->policy_id)->orderBy('minimum_percent')->limit(41)->get()
                ->map(fn ($row) => ['minimum' => (string) $row->minimum_percent, 'grade' => $row->grade])->all();
            $policy = ['rounding' => $book->policy->rounding_rule->value, 'boundaries' => $boundaries];
            $budget = 0;
            $positions = GradingPolicyItem::where('policy_id', $book->policy_id)->orderBy('position')->limit(51)->pluck('assessment_item_id')->flip();
            $records = AssessmentItem::where('gradebook_id', $book->id)->orderBy('id')->limit(51)->get();
            NativeRules::check($positions->isEmpty() || ($positions->count() === $records->count() && ! $positions->keys()->diff($records->modelKeys())->count()),
                'Assessment policy items must belong to the current offering.');
            foreach ($records->sortBy(fn ($item) => $positions[$item->id] ?? 0)->values() as $i => $item) {
                NativeRules::check($i < 50 && (! $item->module_id || isset($modules[$item->module_id])), 'Too many items or an item links to a different offering.');
                $assignment = Assignment::where('item_id', $item->id)->first();
                $exam = Examination::where('item_id', $item->id)->first();
                NativeRules::check((bool) $assignment === ($item->kind->value === 'assignment') && (bool) $exam === ($item->kind->value === 'exam'),
                    'An assessment configuration is missing or inconsistent.');
                $row = ['title' => $item->title, 'kind' => $item->kind->value, 'module' => $modules[$item->module_id] ?? null,
                    'weight' => (string) $item->weight_percent, 'maximum' => (string) $item->maximum_score, 'rubric' => NativeRubric::portable($item->rubric),
                    'definition' => $assignment ? $this->assignment($assignment, $entries) : ($exam ? $this->exam($exam, $banks) : null)];
                $budget += strlen(json_encode($row, JSON_THROW_ON_ERROR));
                NativeRules::check($budget <= 1048576, 'Assessment definitions exceed the manifest limit.');
                $items[] = $row;
            }
        }

        return ['policy' => $policy, 'items' => $items, 'banks' => $banks->banks];
    }

    private function assignment(Assignment $assignment, array &$entries): array
    {
        $references = [];
        foreach (AssignmentReference::where('assignment_id', $assignment->id)->orderBy('id')->limit(11)->cursor() as $i => $ref) {
            NativeRules::check($i < 10 && ! SubmissionFile::where('file_id', $ref->file_id)->exists()
                && ! AssessmentScore::where('marked_file_id', $ref->file_id)->exists()
                && ! AssignmentReference::where('file_id', $ref->file_id)->where('assignment_id', '!=', $assignment->id)->exists(), 'Not an exclusively owned assignment reference.');
            $references[] = PackageAttachments::export($ref->file, $entries, true);
        }

        return [
            ...$assignment->only('instructions', 'max_bytes', 'accepted_formats', 'editable', 'group_work', 'late_policy'),
            'opens_at' => $assignment->opens_at->utc()->format('Y-m-d\TH:i:s\Z'), 'due_at' => $assignment->due_at->utc()->format('Y-m-d\TH:i:s\Z'),
            'closes_at' => $assignment->closes_at->utc()->format('Y-m-d\TH:i:s\Z'), 'references' => $references,
        ];
    }

    private function exam(Examination $exam, NativeBankSnapshot $banks): array
    {
        NativeRules::check(! $exam->security_policy, 'Custom exam security policies are not portable.');
        $slots = [];
        foreach (ExamSlot::where('exam_id', $exam->id)->orderBy('position')->limit(201)->cursor() as $slot) {
            NativeRules::check((bool) $slot->fixed_version_id !== (bool) $slot->draw_from_bank_id);
            NativeRules::check($slot->fixed_version_id ? isset($banks->versionIndex[$slot->fixed_version_id]) : isset($banks->bankIndex[$slot->draw_from_bank_id]),
                'Exam slot references a different course.');
            $slots[] = ['points' => (string) $slot->points, 'fixed' => $banks->versionIndex[$slot->fixed_version_id] ?? null,
                'draw' => $banks->bankIndex[$slot->draw_from_bank_id] ?? null];
        }

        return [...$exam->only('duration_seconds', 'max_attempts', 'shuffle_options'), 'slots' => $slots,
            'opens_at' => $exam->opens_at->utc()->format('Y-m-d\TH:i:s\Z'), 'closes_at' => $exam->closes_at->utc()->format('Y-m-d\TH:i:s\Z')];
    }
}
