<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\Enrolment;
use App\Models\Grade;
use App\Models\Gradebook;
use App\Models\GradingPolicy;
use Brick\Math\BigDecimal;
use Inertia\Testing\AssertableInertia as Page;

class GradeDeliveryTest extends AssessmentCase
{
    public function test_officer_can_reach_offerings_without_a_teaching_allocation(): void
    {
        $this->as($this->officer->refresh())->get('/examinations-office')->assertInertia(fn (Page $p) => $p
            ->where('offerings.data.0.href', $this->desk)->where('academicLinks.0.href', '/examinations-office'));
        $this->as($this->member->student->user)->get('/examinations-office')->assertForbidden();
    }

    public function test_previously_approved_result_cannot_publish_under_a_replaced_policy(): void
    {
        $this->setupItems(['manual']);
        $item = AssessmentItem::sole();
        $this->post("/assessment-items/$item->id/score", [
            'enrolment' => $this->member->id, 'points' => 8, 'reason' => 'Verified answer',
        ])->assertRedirect();
        $this->post("/gradebooks/$item->gradebook_id/compute/{$this->member->id}")->assertRedirect();
        $grade = Grade::sole();
        $review = "/grades/$grade->id/review";
        $this->as($this->officer)->post($review, ['decision' => 'approve', 'reason' => 'Checked'])->assertRedirect();
        $replacement = GradingPolicy::forceCreate(['name' => 'Revised', 'version' => 2, 'rounding_rule' => 'half_even']);
        Gradebook::sole()->forceFill(['policy_id' => $replacement->id])->save();
        $this->post($review, ['decision' => 'publish', 'reason' => 'Release'])->assertConflict();
        $this->assertNull($grade->refresh()->published_at);
        $this->as($this->member->student->user)->get("/grades/$grade->id/sheet")->assertNotFound();
    }

    public function test_weight_validation_published_boundary_and_regrade_evidence(): void
    {
        $this->as($this->marker)->post($this->desk, [
            'rounding' => 'half_up',
            'items' => [[
                'kind' => 'manual',
                'title' => 'mark',
                'weight' => '99.99999999',
                'maximum' => 10,
            ]],
            'boundaries' => [['minimum' => 0, 'grade' => 'F']],
        ])->assertSessionHasErrors('items');
        $this->assertDatabaseCount('gradebooks', 0);
        $this->setupItems(['manual', 'attendance']);
        $items = AssessmentItem::orderBy('id')->get();
        $score = function (int $i, string $points) use ($items) {
            $this->post('/assessment-items/'.$items[$i]->id.'/score', [
                'enrolment' => $this->member->id,
                'points' => $points,
                'reason' => 'Checked evidence',
            ])->assertRedirect();
        };
        $score(0, '7.125');
        $score(1, '7.875');
        $compute = '/gradebooks/'.$items[0]->gradebook_id.'/compute/'.$this->member->id;
        $this->post($compute)->assertRedirect();
        $grade = Grade::firstOrFail();
        $this->assertTrue(BigDecimal::of($grade->total_percent)->isEqualTo('75'));
        $this->assertSame('A', $grade->grade);
        $sheet = "/grades/$grade->id/sheet";
        $review = "/grades/$grade->id/review";
        $decision = fn ($d) => [
            'decision' => $d,
            'reason' => 'Reviewed frozen evidence',
        ];
        $this->as($this->member->student->user)->get($sheet)->assertNotFound();
        $this->get("/grades/$grade->id/evidence")->assertNotFound();
        $this->get($this->desk)->assertInertia(fn (Page $p) => $p->has('grades', 0));
        $this->as($this->marker)->post($review, $decision('approve'))->assertForbidden();
        $this->get("/grades/$grade->id/evidence")->assertNotFound();
        $this->as($this->officer)->get("/grades/$grade->id/evidence")->assertInertia(fn (Page $p) => $p
            ->has('inputs', 2)->where('inputs.0.points', fn (string $v) => BigDecimal::of($v)->isEqualTo('7.125'))
            ->where('policy.rounding_rule', 'half_up')->has('boundaries', 2)
            ->where('history.0.actor', $this->marker->full_name));
        $this->as($this->officer)->post($review, $decision('publish'))->assertConflict();
        $this->post($review, $decision('approve'))->assertRedirect();
        $this->as($this->member->student->user)->get($sheet)->assertNotFound();
        $this->as($this->officer)->post($review, $decision('publish'))->assertRedirect();
        $first = $this->as($this->member->student->user)
            ->get($sheet)
            ->assertOk()
            ->assertJsonPath('inputs.0.points', fn (string $v) => BigDecimal::of($v)->isEqualTo('7.125'))
            ->getContent();
        $this->get($this->desk)->assertInertia(fn (Page $p) => $p->has('grades', 1));
        $outsider = Enrolment::factory()->create(['offering_id' => $this->offering->id]);
        $this->as($outsider->student->user)->get($sheet)->assertNotFound();
        $this->as($this->marker);
        $score(0, '5.125');
        $this->post($compute)->assertRedirect();
        $revised = Grade::where('revision', 2)->firstOrFail();
        $this->assertTrue(BigDecimal::of($revised->total_percent)->isEqualTo('65'));
        $this->as($this->officer)->post("/grades/$revised->id/review", $decision('correct'))->assertRedirect();
        $this->post("/grades/$revised->id/review", $decision('approve'))->assertConflict();
        $this->as($this->member->student->user)->get($sheet)->assertContent($first);
        $frozen = json_decode($first, true, flags: JSON_THROW_ON_ERROR);
        $replayed = BigDecimal::zero();
        foreach ($frozen['inputs'] as $input) {
            $replayed = $replayed->plus(BigDecimal::of($input['points'])
                ->multipliedBy($input['weight'])->dividedBy($input['maximum'], 8));
        }
        $this->assertTrue($replayed->isEqualTo($frozen['total']));
        $this->assertSame($frozen['grade'], collect($frozen['boundaries'])
            ->first(fn ($boundary) => $replayed->isGreaterThanOrEqualTo((string) $boundary['minimum_percent']))['grade']);
        $this->get("/grades/$revised->id/sheet")->assertNotFound();
        $this->member->forceFill(['status' => 'withdrawn'])->save();
        $this->get($sheet)->assertNotFound();
    }
}
