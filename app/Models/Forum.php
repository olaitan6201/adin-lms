<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Forum extends Model
{
    protected $table = 'forums';

    public $timestamps = false;

    public function offering(): BelongsTo
    {
        return $this->belongsTo(Offering::class, 'offering_id');
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(StudyGroup::class, 'group_id');
    }
}
