<?php

namespace App\Services\Identity;

use App\Models\User;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Database\Eloquent\Builder;

final class AccountDirectory
{
    public function search(string $term): Paginator
    {
        return User::query()
            ->when($term !== '', function (Builder $accounts) use ($term): void {
                $accounts->where(function (Builder $matching) use ($term): void {
                    $matching->whereLike('full_name', "%$term%")
                        ->orWhereLike('email', "%$term%");
                });
            })
            ->orderBy('email')
            ->simplePaginate(40, ['id', 'email', 'full_name', 'status'])
            ->withQueryString();
    }
}
