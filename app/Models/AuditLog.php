<?php

namespace App\Models;

use App\Enums\CourseCatalogueEvent;
use App\Enums\OrganisationAuditAction;
use App\Enums\PathwayCurriculumAuditAction;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends DomainModel
{
    protected $table = 'audit_logs';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'occurred_at' => 'immutable_datetime',
            'details' => 'array',
        ];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExaminationAttempt::class, 'attempt_id');
    }

    protected function action(): Attribute
    {
        return Attribute::set(
            fn (OrganisationAuditAction|CourseCatalogueEvent|PathwayCurriculumAuditAction|string $value): string => is_string($value) ? $value : $value->value,
        )->withoutObjectCaching();
    }

    /**
     * Read organisation events as a closed set without changing the shared action string.
     */
    protected function organisationAction(): Attribute
    {
        return Attribute::get(
            fn (): ?OrganisationAuditAction => OrganisationAuditAction::tryFrom($this->action ?? ''),
        )->withoutObjectCaching();
    }

    protected function courseCatalogueAction(): Attribute
    {
        return Attribute::get(
            fn (): ?CourseCatalogueEvent => CourseCatalogueEvent::tryFrom($this->action ?? ''),
        )->withoutObjectCaching();
    }

    protected function pathwayCurriculumAction(): Attribute
    {
        return Attribute::get(
            fn (): ?PathwayCurriculumAuditAction => PathwayCurriculumAuditAction::tryFrom($this->action ?? ''),
        )->withoutObjectCaching();
    }
}
