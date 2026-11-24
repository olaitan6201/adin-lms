<?php

namespace App\Console\Commands;

use App\Services\Authority\ChangeRoleGrant;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use InvalidArgumentException;

#[Signature('authority:grant {user : Local user UUID} {role : Role code} {scope : Canonical scope key} {--revoke}')]
#[Description('Grant or revoke a scoped LMS role from the trusted operator console')]
class ChangeAuthorityGrant extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(ChangeRoleGrant $grants): int
    {
        try {
            $grants->apply(strtolower($this->argument('user')), $this->argument('role'),
                strtolower($this->argument('scope')), (bool) $this->option('revoke'));
        } catch (InvalidArgumentException $error) {
            $this->error($error->getMessage());

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
