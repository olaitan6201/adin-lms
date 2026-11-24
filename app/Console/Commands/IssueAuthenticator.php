<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\Security\TotpEnrollment;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use LogicException;

class IssueAuthenticator extends Command
{
    protected $signature = 'security:issue-authenticator {user : Verified account UUID}';

    protected $description = 'Issue a 15-minute setup key for secure out-of-band delivery after identity verification';

    public function handle(TotpEnrollment $enrollment): int
    {
        $id = $this->argument('user');
        $user = Str::isUuid($id) ? User::find($id) : null;
        if (! $user) {
            $this->error('Unknown account.');

            return self::FAILURE;
        }
        try {
            $this->line($enrollment->issue($user));
        } catch (LogicException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
