<?php

namespace App\Models;

use App\Models\Concerns\AppendOnly;
use Illuminate\Database\Eloquent\Relations\HasOne;

final class PlacementUpdate extends DomainModel
{
    use AppendOnly;

    public const UPDATED_AT = null;

    protected $fillable = [
        'official_registration_id', 'update_number', 'academic_pathway_id', 'academic_session_id',
        'entry_cohort_id', 'programme_level_id', 'effective_on', 'submitted_by',
    ];

    /** @return array{update_number: 'integer', effective_on: 'immutable_date'} */
    protected function casts(): array
    {
        return ['update_number' => 'integer', 'effective_on' => 'immutable_date'];
    }

    /** @return HasOne<PlacementAcceptance, $this> */
    public function acceptance(): HasOne
    {
        return $this->hasOne(PlacementAcceptance::class);
    }
}
