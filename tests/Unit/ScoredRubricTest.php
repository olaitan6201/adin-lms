<?php

namespace Tests\Unit;

use App\Services\Assessment\ScoredRubric;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ScoredRubricTest extends TestCase
{
    public function test_levels_derive_exact_points_and_snapshot_fields(): void
    {
        $result = (new ScoredRubric)->score($this->rubric(), [
            ['criterion' => 'criterion-a', 'level' => 'level-a-high', 'feedback' => 'Clear claim'],
            ['criterion' => 'criterion-b', 'level' => 'level-b-low'],
        ]);

        $this->assertSame('6.000', $result['points']);
        $this->assertSame('Clear claim', $result['feedback'][0]['feedback']);
        $this->assertSame('Complete', $result['feedback'][0]['level_label']);
        $this->assertSame('Evidence', $result['feedback'][1]['criterion_title']);
        $this->assertSame('1.875', $result['feedback'][1]['points']);
    }

    public function test_every_criterion_needs_one_selection(): void
    {
        $this->expectException(ValidationException::class);
        (new ScoredRubric)->score($this->rubric(), [
            ['criterion' => 'criterion-a', 'level' => 'level-a-high'],
        ]);
    }

    public function test_level_must_belong_to_its_criterion(): void
    {
        $this->expectException(ValidationException::class);
        (new ScoredRubric)->score($this->rubric(), [
            ['criterion' => 'criterion-a', 'level' => 'level-b-low'],
            ['criterion' => 'criterion-b', 'level' => 'level-b-low'],
        ]);
    }

    public function test_duplicate_and_unknown_criteria_are_rejected(): void
    {
        $selection = ['criterion' => 'criterion-a', 'level' => 'level-a-high'];
        try {
            (new ScoredRubric)->score($this->rubric(), [$selection, $selection]);
            $this->fail('Duplicate criterion was accepted.');
        } catch (ValidationException) {
            $this->addToAssertionCount(1);
        }

        $this->expectException(ValidationException::class);
        (new ScoredRubric)->score($this->rubric(), [
            ['criterion' => 'criterion-a', 'level' => 'level-a-high'],
            ['criterion' => 'unknown', 'level' => 'level-b-low'],
        ]);
    }

    private function rubric(): array
    {
        return ['criteria' => [
            ['id' => 'criterion-a', 'title' => 'Argument', 'description' => null, 'levels' => [
                ['id' => 'level-a-low', 'label' => 'Partial', 'points' => '0', 'description' => null],
                ['id' => 'level-a-high', 'label' => 'Complete', 'points' => '4.125', 'description' => null],
            ]],
            ['id' => 'criterion-b', 'title' => 'Evidence', 'description' => null, 'levels' => [
                ['id' => 'level-b-low', 'label' => 'Partial', 'points' => '1.875', 'description' => null],
                ['id' => 'level-b-high', 'label' => 'Complete', 'points' => '6', 'description' => null],
            ]],
        ]];
    }
}
