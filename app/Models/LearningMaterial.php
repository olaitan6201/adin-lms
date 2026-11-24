<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningMaterial extends Model
{
    protected $table = 'learning_materials';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'opens_at' => 'immutable_datetime',
            'closes_at' => 'immutable_datetime',
            'download_allowed' => 'boolean',
            'restrictions' => 'array',
        ];
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }
}
