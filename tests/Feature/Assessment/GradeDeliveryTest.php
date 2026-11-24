<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\Enrolment;
use App\Models\Grade;
use Inertia\Testing\AssertableInertia as Page;

class GradeDeliveryTest extends AssessmentCase
{
    public function test_weight_validation_published_boundary_and_regrade_evidence(): void
    {
        $this->as($this->marker)->post($this->desk, ['rounding' => 'half_up', 'items' => [['kind' => 'manual', 'title' => 'mark', 'weight' => '99.99999999', 'maximum' => 10]], 'boundaries' => [['minimum' => 0, 'grade' => 'F']]])->assertSessionHasErrors('items');
        $this->assertDatabaseCount('gradebooks', 0);
        $this->setupItems(['manual', 'attendance']);
        $items = AssessmentItem::orderBy('id')->get();
        $score = function (int $i, string $points) use ($items) {
            $this->post('/assessment-items/'.$items[$i]->id.'/score', ['enrolment' => $this->member->id, 'points' => $points, 'reason' => 'Checked evidence'])->assertRedirect();
        };
        $score(0, '7.125');
        $score(1, '7.875');
        $compute = '/gradebooks/'.$items[0]->gradebook_id.'/compute/'.$this->member->id;
        $this->post($compute)->assertRedirect();
        $grade = Grade::firstOrFail();
        $this->assertEquals('75', $grade->total_percent);
        $this->assertSame('A', $grade->grade);
        $sheet = "/grades/$grade->id/sheet";
        $review = "/grades/$grade->id/review";
        $decision = fn ($d) => ['decision' => $d, 'reason' => 'Reviewed frozen evidence'];
        $this->as($this->member->student->user)->get($sheet)->assertNotFound();
        $this->get($this->desk)->assertInertia(fn (Page $p) => $p->has('grades', 0));
        $this->as($this->marker)->post($review, $decision('approve'))->assertForbidden();
        $this->as($this->officer)->post($review, $decision('publish'))->assertConflict();
        $this->post($review, $decision('approve'))->assertRedirect();
        $this->as($this->member->student->user)->get($sheet)->assertNotFound();
        $this->as($this->officer)->post($review, $decision('publish'))->assertRedirect();
        $first = $this->as($this->member->student->user)->get($sheet)->assertOk()->assertJsonPath('inputs.0.points', '7.125')->getContent();
        $this->get($this->desk)->assertInertia(fn (Page $p) => $p->has('grades', 1));
        $outsider = Enrolment::factory()->create(['offering_id' => $this->offering->id]);
        $this->as($outsider->student->user)->get($sheet)->assertNotFound();
        $this->as($this->marker);
        $score(0, '5.125');
        $this->post($compute)->assertRedirect();
        $revised = Grade::where('revision', 2)->firstOrFail();
        $this->assertEquals('65', $revised->total_percent);
        $this->as($this->officer)->post("/grades/$revised->id/review", $decision('correct'))->assertRedirect();
        $this->post("/grades/$revised->id/review", $decision('approve'))->assertConflict();
        $this->as($this->member->student->user)->get($sheet)->assertContent($first);
        $this->get("/grades/$revised->id/sheet")->assertNotFound();
        $this->member->forceFill(['status' => 'withdrawn'])->save();
        $this->get($sheet)->assertNotFound();
    }
}
