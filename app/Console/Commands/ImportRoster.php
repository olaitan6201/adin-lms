<?php

namespace App\Console\Commands;

use App\Services\Roster\ImportRosterFile;
use DomainException;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('roster:import {file}')]
#[Description('Apply a registration delta file atomically')]
class ImportRoster extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(ImportRosterFile $importer): int
    {
        try {
            $count = $importer->import($this->argument('file'));
        } catch (DomainException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->info("Applied {$count} enrolment changes.");

        return self::SUCCESS;
    }
}
