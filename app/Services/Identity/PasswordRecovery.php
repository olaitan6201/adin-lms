<?php

namespace App\Services\Identity;

use App\Models\User;
use App\Services\Security\WebSessions;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordRecovery
{
    public function __construct(private readonly AccountLookup $lookup) {}

    public function send(string $email): void
    {
        DB::transaction(function () use ($email): void {
            Password::sendResetLink($this->credentials($email));
        });
    }

    public function reset(string $email, string $token, #[\SensitiveParameter] string $password): bool
    {
        return DB::transaction(function () use ($email, $token, $password): bool {
            $status = Password::reset($this->credentials($email) + ['password' => $password, 'token' => $token], function (User $user, string $password): void {
                $user->password_hash = Hash::make($password);
                $user->auth_version++;
                $user->setRememberToken(Str::random(60));
                $user->save();
                WebSessions::revokeAll($user);
                event(new PasswordReset($user));
            });

            return $status === Password::PASSWORD_RESET;
        });
    }

    /** @return array{id: ?string, status: string} */
    private function credentials(string $email): array
    {
        $ids = $this->lookup->emailQuery($email)->orderBy('id')->limit(2)->lockForUpdate()->pluck('id');

        return ['id' => $ids->count() === 1 ? $ids->first() : null, 'status' => 'active'];
    }
}
