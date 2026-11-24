<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionFile extends Model
{
    protected $table = 'submission_files';

    public $timestamps = false;

    public function version(): BelongsTo
    {
        return $this->belongsTo(SubmissionVersion::class, 'version_id');
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(File::class, 'file_id');
    }
}
