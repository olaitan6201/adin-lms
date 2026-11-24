<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Module extends Model
{
    use HasFactory;

    protected $table = 'modules';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'opens_at' => 'immutable_datetime',
            'closes_at' => 'immutable_datetime',
        ];
    }

    public function offering(): BelongsTo
    {
        return $this->belongsTo(Offering::class, 'offering_id');
    }
}
