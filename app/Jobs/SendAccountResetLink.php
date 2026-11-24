<?php

namespace App\Jobs;

use App\Services\Identity\PasswordRecovery;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendAccountResetLink implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    public function __construct(public readonly string $email) {}

    public function handle(PasswordRecovery $recovery): void
    {
        $recovery->send($this->email);
    }
}
