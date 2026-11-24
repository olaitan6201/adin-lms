<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemConfiguration extends DomainModel
{
    protected $table = 'system_configuration';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
