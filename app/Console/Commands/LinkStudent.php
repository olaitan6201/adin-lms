<?php

namespace App\Console\Commands;

use App\Services\Roster\LinkStudentAccount;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('roster:link {student : Upstream student ID} {user : Verified local user ID}')]
#[Description('Bind a verified institutional student to their existing LMS account')]
class LinkStudent extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(LinkStudentAccount $accounts): int
    {
        $id = strtolower($this->argument('user'));
        $linked = $accounts->bind($this->argument('student'), $id);
        if (! $linked) {
            $this->error('Unknown student/account or conflicting identity link.');

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
