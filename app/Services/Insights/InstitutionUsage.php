<?php

namespace App\Services\Insights;

use App\Enums\AuthenticationOutcome;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class InstitutionUsage
{
    public function population(Carbon $asOf): array
    {
        return [
            'Student profiles' => DB::table('students')->count(),
            'Lecturer profiles' => DB::table('lecturers')->count(),
            'Catalogue courses' => DB::table('courses')->count(),
            'Departments' => DB::table('departments')->count(),
            'Active academic sessions' => DB::table('academic_sessions')
                ->where('starts_on', '<=', $asOf->toDateString())->where('ends_on', '>=', $asOf->toDateString())->count(),
        ];
    }

    public function report(ReportAudience $audience, array $filters): InsightTable
    {
        abort_unless($audience === ReportAudience::Institution, 403);
        abort_if($filters !== [], 422, 'Institution usage is institution-wide; remove course, semester and session filters.');
        $end = now('UTC')->startOfSecond();
        $start = $end->copy()->subDays(7);
        $period = $start->toDateTimeString().' to '.$end->toDateTimeString().' UTC';
        $table = new InsightTable(['Measure', 'Count', 'Period (UTC)', 'Counting rule']);
        $rules = [
            'Student profiles' => 'All student records, including unlinked profiles and those without registrations.',
            'Lecturer profiles' => 'All lecturer records, including staff without teaching allocations.',
            'Catalogue courses' => 'Distinct course records; not offerings or curriculum versions.',
            'Departments' => 'All department records, including units without offerings.',
            'Active academic sessions' => 'Sessions whose inclusive start and end dates cover today (UTC).',
        ];
        foreach ($this->population($end) as $label => $count) {
            $table->rows[] = [$label, $count, 'As of '.$end->toDateTimeString(), $rules[$label]];
        }

        $auth = DB::table('login_events')->whereNotNull('user_id')->whereIn('outcome', [
            AuthenticationOutcome::PasswordAccepted, AuthenticationOutcome::InstitutionAccepted,
        ])->where('occurred_at', '>', $start)->where('occurred_at', '<=', $end)
            ->selectRaw('count(*) as events, count(distinct user_id) as accounts, max(occurred_at) as latest')->first();
        $table->rows[] = ['Accounts with accepted credentials', (int) $auth->accounts, $period,
            'Distinct accounts with a password or institutional sign-in accepted. This does not establish MFA completion.'];
        $table->rows[] = ['Credential acceptances', (int) $auth->events, $period,
            'Repeated acceptances count separately; failed checks and MFA events are excluded. '.$this->latest($auth->latest)];
        foreach ([
            ['Assignment revisions received', 'submission_versions', 'submitted_at', 'Each received submission version counts once, including group submissions.'],
            ['Exam attempts started', 'examination_attempts', 'started_at', 'Each started attempt counts once, including repeat attempts.'],
        ] as [$label, $source, $time, $rule]) {
            $activity = DB::table($source)->where($time, '>', $start)->where($time, '<=', $end)
                ->selectRaw("count(*) as events, max($time) as latest")->first();
            $table->rows[] = [$label, (int) $activity->events, $period, $rule.' '.$this->latest($activity->latest)];
        }

        return $table;
    }

    private function latest(?string $time): string
    {
        return $time === null ? 'No recorded event in this window.' : 'Last recorded: '.Carbon::parse($time)->utc()->toDateTimeString().' UTC.';
    }
}
