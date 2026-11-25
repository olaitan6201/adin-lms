<?php

namespace Tests\Unit;

use App\Enums\Assessment\ItemKind;
use App\Services\Assessment\AssessmentPolicy;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AssessmentPolicyTest extends TestCase
{
    public function test_scored_policy_uses_exact_weights_and_generates_stable_definition_ids(): void
    {
        $policy = AssessmentPolicy::normalize($this->policy());

        $this->assertSame('100', $policy['items'][0]['weight_percent']);
        $this->assertCount(2, $policy['items'][0]['rubric']['criteria']);
        $this->assertSame('4', $policy['items'][0]['rubric']['criteria'][0]['levels'][1]['points']);
        $this->assertSame('6', $policy['items'][0]['rubric']['criteria'][1]['levels'][1]['points']);
        $this->assertNotSame(
            $policy['items'][0]['rubric']['criteria'][0]['id'],
            $policy['items'][0]['rubric']['criteria'][0]['levels'][0]['id'],
        );
    }

    public function test_weights_must_total_one_hundred_exactly(): void
    {
        $data = $this->policy();
        $data['items'][0]['weight'] = '99.99999999';

        $this->expectException(ValidationException::class);
        AssessmentPolicy::normalize($data);
    }

    public function test_criterion_maxima_must_total_the_assignment_maximum(): void
    {
        $data = $this->policy();
        $data['items'][0]['criteria'][1]['levels'][1]['points'] = '5';

        $this->expectException(ValidationException::class);
        AssessmentPolicy::normalize($data);
    }

    public function test_only_assignments_can_have_scored_criteria(): void
    {
        $data = $this->policy();
        $data['items'][0]['kind'] = ItemKind::Manual->value;

        $this->expectException(ValidationException::class);
        AssessmentPolicy::normalize($data);
    }

    private function policy(): array
    {
        return [
            'rounding' => 'half_up',
            'boundaries' => [['minimum' => '0', 'grade' => 'F'], ['minimum' => '70', 'grade' => 'A']],
            'items' => [[
                'title' => 'Essay',
                'kind' => 'assignment',
                'weight' => '100',
                'maximum' => '10',
                'criteria' => [
                    ['title' => 'Argument', 'levels' => [
                        ['label' => 'Missing', 'points' => '0'],
                        ['label' => 'Complete', 'points' => '4'],
                    ]],
                    ['title' => 'Evidence', 'levels' => [
                        ['label' => 'Missing', 'points' => '0'],
                        ['label' => 'Complete', 'points' => '6'],
                    ]],
                ],
            ]],
        ];
    }
}
