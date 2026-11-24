<?php

namespace App\Services\Security;

use App\Models\Credential;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use LogicException;
use PragmaRX\Google2FA\Google2FA;

class TotpEnrollment
{
    public function __construct(private Google2FA $totp) {}

    public function issue(User $user): string
    {
        return DB::transaction(function () use ($user): string {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $factor = $this->factor($user)->lockForUpdate()->first();
            if ($factor && ($factor->expires_at === null || $factor->expires_at->isFuture())) {
                throw new LogicException('An active authenticator or pending enrollment already exists.');
            }
            $secret = $this->totp->generateSecretKey();
            $factor ??= new Credential;
            $factor->forceFill([
                'user_id' => $user->id, 'kind' => 'totp', 'expires_at' => now()->addMinutes(15),
                'protected_value' => Crypt::encrypt(['secret' => $secret, 'step' => 0]),
            ])->save();
            AuthEvents::record($user, 'mfa.issued');

            return $secret;
        });
    }

    public function verify(User $user, #[\SensitiveParameter] string $code): bool
    {
        return DB::transaction(function () use ($user, $code): bool {
            $factor = $this->factor($user)->lockForUpdate()->first();
            if ($factor && ! $factor->expires_at?->lte(now()) && preg_match('/\A[0-9]{6}\z/', $code)) {
                $value = Crypt::decrypt($factor->protected_value);
                $step = $this->totp->verifyKeyNewer($value['secret'], $code, $value['step'], 1, intdiv(now()->timestamp, 30));
                if (is_int($step)) {
                    AuthEvents::record($user, $factor->expires_at === null ? 'mfa.accepted' : 'mfa.enrolled');
                    $factor->expires_at = null;
                    $factor->protected_value = Crypt::encrypt(['secret' => $value['secret'], 'step' => $step]);
                    $factor->save();

                    return true;
                }
            }
            AuthEvents::record($user, 'mfa.failed');

            return false;
        });
    }

    private function factor(User $user): Builder
    {
        return Credential::where('user_id', $user->id)->where('kind', 'totp');
    }
}
