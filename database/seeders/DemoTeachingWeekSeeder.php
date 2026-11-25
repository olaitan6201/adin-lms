<?php

namespace Database\Seeders;

use App\Enums\Assessment\ItemKind;
use App\Enums\Assessment\RoundingRule;
use App\Enums\Learning\ClassStatus;
use App\Models\AssessmentItem;
use App\Models\Assignment;
use App\Models\ClassSession;
use App\Models\Forum;
use App\Models\Gradebook;
use App\Models\GradeBoundary;
use App\Models\GradingPolicy;
use App\Models\Offering;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use LogicException;

final class DemoTeachingWeekSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local', 'testing')) {
            throw new LogicException('The teaching-week fixture is for local and test databases only.');
        }

        DB::transaction(function (): void {
            $course = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->sole();
            $this->assignment($course);

            Forum::firstOrCreate([
                'offering_id' => $course->id,
                'title' => 'Computing seminar',
            ]);

            ClassSession::firstOrCreate([
                'offering_id' => $course->id,
                'title' => 'Algorithms in everyday life',
            ], [
                'status' => ClassStatus::Scheduled,
                'starts_at' => now()->addDay()->setTime(9, 0),
                'ends_at' => now()->addDay()->setTime(10, 0),
            ]);
        });
    }

    private function assignment(Offering $course): void
    {
        $policy = GradingPolicy::firstOrCreate([
            'name' => 'Demo teaching week',
            'version' => 1,
        ], ['rounding_rule' => RoundingRule::HalfUp]);

        foreach ([0 => 'F', 40 => 'E', 45 => 'D', 50 => 'C', 60 => 'B', 70 => 'A'] as $minimum => $grade) {
            GradeBoundary::firstOrCreate([
                'policy_id' => $policy->id,
                'minimum_percent' => $minimum,
            ], ['grade' => $grade]);
        }

        $book = Gradebook::firstOrCreate(['offering_id' => $course->id], ['policy_id' => $policy->id]);
        $item = AssessmentItem::firstOrCreate([
            'gradebook_id' => $book->id,
            'title' => 'Computing reflection',
        ], [
            'kind' => ItemKind::Assignment,
            'weight_percent' => 100,
            'maximum_score' => 10,
        ]);

        Assignment::firstOrCreate(['item_id' => $item->id], [
            'instructions' => 'Choose one everyday task. Describe its inputs, the steps and the result.',
            'opens_at' => now()->subDay(),
            'due_at' => now()->addDays(2),
            'closes_at' => now()->addDays(3),
            'accepted_formats' => ['txt', 'pdf'],
            'late_policy' => ['allow' => true],
            'max_bytes' => 1048576,
            'editable' => true,
            'group_work' => false,
        ]);
    }
}
