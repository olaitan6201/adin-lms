<?php

namespace App\Services\Identity;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class AccountLookup
{
    public function loginId(string $identifier): ?string
    {
        $accounts = $this->emailQuery($identifier)
            ->orWhereHas('student', fn (Builder $q) => $q->where('matric_number', $identifier))
            ->orWhereHas('lecturer', fn (Builder $q) => $q->where('staff_number', $identifier))
            ->limit(2)->pluck('id');

        return $accounts->count() === 1 ? $accounts->first() : null;
    }

    public function emailQuery(string $email): Builder
    {
        return User::query()->whereRaw('LOWER(TRIM(email)) = ?', [User::canonicalEmail($email)]);
    }
}
