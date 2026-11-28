<?php

namespace App\Models;

use App\Models\Concerns\AppendOnly;

final class PlacementAcceptance extends DomainModel
{
    use AppendOnly;

    public $timestamps = false;

    protected $fillable = ['placement_update_id', 'curriculum_adoption_decision_id', 'approved_by', 'approved_at', 'effective_at', 'approval_note'];

    /** @return array{approved_at: 'immutable_datetime', effective_at: 'immutable_datetime'} */
    protected function casts(): array
    {
        return ['approved_at' => 'immutable_datetime', 'effective_at' => 'immutable_datetime'];
    }
}
