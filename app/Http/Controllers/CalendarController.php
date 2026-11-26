<?php

namespace App\Http\Controllers;

use App\Enums\Learning\ClassStatus;
use App\Services\Insights\InsightScope;
use App\Services\Insights\ReportAudience;
use App\Services\Insights\StudentAgenda;
use App\Services\Insights\TeachingSnapshot;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

final class CalendarController extends Controller
{
    public function __invoke(Request $request, InsightScope $visibility, StudentAgenda $agenda, TeachingSnapshot $teaching): Response
    {
        $user = $request->user();
        $audience = $visibility->audience($user);
        $scope = $visibility->offerings($user, $audience);
        $terms = (clone $scope)->reorder()->whereNotNull('t.id')
            ->select('s.label', 't.position', 't.starts_on', 't.ends_on')->distinct()
            ->orderBy('t.starts_on')->get();
        $events = collect();
        if ($audience === ReportAudience::Student) {
            $events = $agenda->forUser($user, $scope);
        } elseif ($audience === ReportAudience::Lecturer) {
            $classes = (clone $scope)->reorder()->join('classes as cl', 'cl.offering_id', '=', 'o.id')
                ->where('cl.status', ClassStatus::Scheduled)->where('cl.ends_at', '>', now())
                ->orderBy('cl.starts_at')->orderBy('cl.id')->limit(12)
                ->select('o.id', 'o.external_offering_id', 'cl.title', 'cl.starts_at')->get()->map(fn ($row) => [
                    'title' => $row->title, 'context' => $row->external_offering_id, 'kind' => 'Scheduled class',
                    'at' => Carbon::parse($row->starts_at)->toIso8601String(), 'href' => route('learning.classes', $row->id, false),
                ]);
            $snapshot = $teaching->forUser($user, $scope);
            $events = $snapshot['assignments']->map(fn ($row) => $row + ['kind' => 'Assignment due'])
                ->concat($snapshot['exams']->map(fn ($row) => $row + ['kind' => 'Exam opens']))->concat($classes);
        }

        return Inertia::render('Calendar/Index', [
            'events' => $events->map(fn ($row) => collect($row)->only('title', 'context', 'at', 'kind', 'href'))->values(),
            'terms' => $terms,
        ]);
    }
}
