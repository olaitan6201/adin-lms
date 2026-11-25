<?php

namespace App\Models;

use App\Enums\Assessment\RoundingRule;

class GradingPolicy extends DomainModel
{
    protected $table = 'grading_policies';

    public $timestamps = false;

    protected function casts(): array
    {
        return ['rounding_rule' => RoundingRule::class];
    }
}
