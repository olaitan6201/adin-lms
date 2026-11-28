<?php

namespace App\Models;

use App\Models\Concerns\AppendOnly;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class OfficialRegistration extends DomainModel
{
    use AppendOnly;

    public const UPDATED_AT = null;

    protected $fillable = ['registration_code', 'registration_key', 'student_id'];

    /** @return BelongsTo<Student, $this> */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
