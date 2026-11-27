<?php

namespace App\Services\Academics;

use App\Enums\AccountStatus;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class PortalIdentity
{
    public function account(Request $request): ?User
    {
        if (! $request->attributes->has(self::class)) {
            $user = $request->user();
            $ready = $user?->status === AccountStatus::Active && $request->route() && $request->hasSession()
                && ($request->session()->get('security.mfa_user') === $user->id
                    || ! app(ScopedAuthority::class)->requiresMfa($user));
            $request->attributes->set(self::class, $ready ? $user : null);
        }

        return $request->attributes->get(self::class);
    }
 
    /** 
     * TODO: This method is a temporary solution to display the user's role in the portal.
     * It should be replaced with a more robust implementation that retrieves the user's role from the database
     * and handles cases where the user has multiple roles or no role at all.
     * @return array{name: string, role: string}|null 
     * */
    public function display(?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        $roles = DB::table('role_grants')->join('roles', 'roles.id', '=', 'role_grants.role_id')
            ->where('role_grants.user_id', $user->id)->distinct()->orderBy('roles.code')->pluck('roles.code')
            ->map(fn (string $code) => Str::headline($code));
            
        $role = $roles->isNotEmpty() ? $roles->implode(', ') : match (true) {
            $user->lecturer()->exists() => 'Lecturer',
            $user->student()->exists() => 'Student',
            default => 'Portal member',
        };

        return [
            'name' => $user->full_name, 
            'role' => $role
        ];
    }
}
