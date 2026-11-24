<?php

namespace App\Http\Controllers\Assessment;

use App\Models\Accommodation;
use App\Models\AssessmentItem;
use App\Models\AttemptQuestion;
use App\Models\Enrolment;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationResponse;
use App\Models\ExamSlot;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionVersion;
use App\Services\Assessment\ScoreLedger;
use App\Services\Authority\ScopedAuthority;
use Brick\Math\BigDecimal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ExamAuthorController
{
    public function create(Request $request, AssessmentItem $item): RedirectResponse
    {
        Gate::authorize('mark', $item);
        abort_unless($item->kind === 'exam', 422);
        $data = $request->validate(['opens_at' => 'required|date', 'closes_at' => 'required|date|after:opens_at', 'duration_seconds' => 'required|integer|between:1,86400', 'max_attempts' => 'required|integer|between:1,100', 'shuffle' => 'nullable|boolean', 'questions' => 'required|array|min:1|max:200', 'questions.*.topic' => 'required|string|max:191', 'questions.*.kind' => 'required|in:mcq,true_false,gap_fill,matching,short_answer,essay,programming,practical', 'questions.*.prompt' => 'required|string|max:12000', 'questions.*.options' => 'nullable|string|max:5000', 'questions.*.key' => 'nullable|string|max:5000', 'questions.*.points' => 'required|decimal:0,8|gt:0|max:1000000', 'questions.*.draw' => 'nullable|boolean']);
        DB::transaction(function () use ($request, $item, $data) {
            AssessmentItem::lockForUpdate()->findOrFail($item->id);
            abort_if(Examination::where('item_id', $item->id)->exists(), 409);
            $exam = Examination::forceCreate(['item_id' => $item->id, 'opens_at' => $data['opens_at'], 'closes_at' => $data['closes_at'], 'duration_seconds' => $data['duration_seconds'], 'max_attempts' => $data['max_attempts'], 'shuffle_options' => $request->boolean('shuffle')]);
            $course = $item->gradebook->offering->curriculumCourse?->course_id ?? abort(422, 'Offering needs a curriculum course.');
            $points = BigDecimal::zero();
            foreach (array_values($data['questions']) as $i => $row) {
                $bank = QuestionBank::where('course_id', $course)->where('topic', $row['topic'])->first() ?? QuestionBank::forceCreate(['course_id' => $course, 'topic' => $row['topic']]);
                $q = Question::forceCreate(['bank_id' => $bank->id]);
                $options = in_array($row['kind'], ['mcq', 'true_false'], true) ? array_values(array_unique(preg_split('/\R/', trim($row['options'] ?? ''), -1, PREG_SPLIT_NO_EMPTY))) : [];
                $key = $row['key'] ?? null;
                if ((in_array($row['kind'], ['mcq', 'true_false'], true) && (count($options) < 2 || ! in_array($key, $options, true))) || (in_array($row['kind'], ['matching', 'gap_fill'], true) && $key === null)) {
                    throw ValidationException::withMessages(["questions.$i.key" => 'Supply a valid objective answer and matching choices.']);
                }
                $v = QuestionVersion::forceCreate(['question_id' => $q->id, 'revision' => 1, 'kind' => $row['kind'], 'prompt' => $row['prompt'], 'options' => $options, 'marking_key' => ['accepted' => [$key]]]);
                $random = $row['draw'] ?? false;
                ExamSlot::forceCreate(['exam_id' => $exam->id, 'position' => $i + 1, 'points' => $row['points'], 'fixed_version_id' => $random ? null : $v->id, 'draw_from_bank_id' => $random ? $bank->id : null]);
                $points = $points->plus((string) $row['points']);
            }
            if (! $points->isEqualTo((string) $item->maximum_score)) {
                throw ValidationException::withMessages(['questions' => 'Slot points must equal the item maximum.']);
            }
        });

        return back();
    }

    public function accommodate(Request $request, Examination $exam, ScopedAuthority $authority, ScoreLedger $events): RedirectResponse
    {
        abort_unless($authority->institutionAllows($request->user(), 'examinations.manage'), 403);
        $d = $request->validate(['enrolment' => 'required|uuid', 'duration_seconds' => 'required|integer|between:1,172800', 'max_attempts' => 'required|integer|between:1,100', 'opens_at' => 'required|date', 'closes_at' => 'required|date|after:opens_at']);
        Enrolment::where('offering_id', $exam->item->gradebook->offering_id)->findOrFail($d['enrolment']);
        DB::transaction(function () use ($exam, $request, $d, $events) {
            Examination::lockForUpdate()->findOrFail($exam->id);
            $record = Accommodation::where('exam_id', $exam->id)->where('enrolment_id', $d['enrolment'])->first() ?? new Accommodation;
            $record->forceFill(['exam_id' => $exam->id, 'enrolment_id' => $d['enrolment'], 'approved_by' => $request->user()->id, 'overrides' => array_diff_key($d, ['enrolment' => true])])->save();
            $events->audit('exam.accommodation', $record->id, $request->user()->id, $record->overrides);
        });

        return back();
    }

    public function script(ExaminationAttempt $attempt): Response
    {
        Gate::authorize('mark', $attempt->exam->item);
        abort_unless($attempt->submitted_at, 409);
        $questions = AttemptQuestion::with('version')->where('attempt_id', $attempt->id)->orderBy('position')->get()->map(fn ($q) => ['prompt' => $q->version->prompt, 'answer' => ExaminationResponse::where('attempt_question_id', $q->id)->latest('revision')->first()?->answer['value'] ?? '', 'possible' => $q->possible_points, 'automatic' => $q->awarded_points]);

        return Inertia::render('Assessments/MarkPaper', ['attempt' => $attempt->id, 'questions' => $questions]);
    }

    public function mark(Request $request, ExaminationAttempt $attempt, ScoreLedger $ledger): RedirectResponse
    {
        Gate::authorize('mark', $attempt->exam->item);
        abort_unless($attempt->submitted_at, 409);
        $data = $request->validate(['points' => 'required|decimal:0,8|min:0', 'reason' => 'required|string|max:2000', 'release' => 'nullable|boolean']);
        DB::transaction(function () use ($ledger, $attempt, $request, $data) {
            $ledger->append($attempt->exam->item, $attempt->enrolment_id, (string) $data['points'], $data['reason'], $request->user()->id, ['attempt_id' => $attempt->id, 'released_at' => $request->boolean('release') ? now() : null]);
            $attempt->forceFill(['state' => 'marked'])->save();
        });

        return back();
    }
}
