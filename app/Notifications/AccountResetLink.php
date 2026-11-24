<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;

class AccountResetLink extends ResetPassword
{
    protected function resetUrl(mixed $notifiable): string
    {
        $path = route('password.reset', ['token' => $this->token, 'email' => $notifiable->getEmailForPasswordReset()], false);

        return rtrim(config('app.url'), '/').$path;
    }
}
