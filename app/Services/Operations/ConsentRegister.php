<?php

namespace App\Services\Operations;

use App\Enums\OperationsEvent;
use App\Models\PrivacyConsent;
use App\Models\SystemConfiguration;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class ConsentRegister
{
    public const PURPOSE = 'optional-course-feedback';

    public const NOTICE = '1';

    public const SETTING = 'withdrawn_feedback_consent_days';

    public function change(User $user, bool $grant): void
    {
        DB::transaction(function () use ($user, $grant): void {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $active = PrivacyConsent::where('user_id', $user->id)->where('purpose', self::PURPOSE)
                ->where('notice_version', self::NOTICE)->whereNull('withdrawn_at')->first();
            if ($grant && ! $active) {
                PrivacyConsent::forceCreate([
                    'user_id' => $user->id,
                    'purpose' => self::PURPOSE,
                    'notice_version' => self::NOTICE,
                    'granted_at' => now(),
                ]);
            } elseif (! $grant && $active) {
                $active->forceFill(['withdrawn_at' => now()])->save();
            } else {
                return;
            }

            $event = $grant ? OperationsEvent::FeedbackGranted : OperationsEvent::FeedbackWithdrawn;
            OperationsAudit::record($user, $event, $user->id);
        });
    }

    public function days(): ?int
    {
        return SystemConfiguration::where('key', self::SETTING)->first()?->value['days'] ?? null;
    }

    public function setDays(User $actor, int $days): void
    {
        DB::transaction(function () use ($actor, $days): void {
            $setting = SystemConfiguration::where('key', self::SETTING)->lockForUpdate()->first() ?? new SystemConfiguration;
            $setting->forceFill(['key' => self::SETTING, 'value' => ['days' => $days], 'updated_by' => $actor->id])->save();
            OperationsAudit::record($actor, OperationsEvent::RetentionChanged, self::SETTING, ['days' => $days]);
        });
    }
}
