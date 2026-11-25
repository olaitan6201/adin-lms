<?php

namespace App\Http\Controllers\Assessment;

use App\Enums\Assessment\ItemKind;
use App\Http\Controllers\Controller;
use App\Models\AssessmentItem;
use App\Models\Examination;
use App\Policies\AssessmentItemPolicy;
use App\Services\Assessment\QuestionBankBrowser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class QuestionSelectionController extends Controller
{
    public function __invoke(
        Request $request,
        AssessmentItem $item,
        AssessmentItemPolicy $access,
        QuestionBankBrowser $browser,
    ): Response {
        Gate::authorize('mark', $item);
        abort_unless($item->kind === ItemKind::Exam, 422);
        abort_if(Examination::where('item_id', $item->id)->exists(), 409, 'Examination already exists.');
        $questions = $browser->latest($item->courseId());

        return Inertia::render('Assessments/SelectQuestions', [
            'item' => $item->id,
            'title' => $item->title,
            'maximum' => (string) $item->maximum_score,
            'questions' => $questions,
            'bank' => '/courses/'.$item->gradebook->offering_id.'/question-banks',
        ]);
    }
}
