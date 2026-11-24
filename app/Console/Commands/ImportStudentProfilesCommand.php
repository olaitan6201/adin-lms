<?php

namespace App\Console\Commands;

use App\Services\Roster\ImportStudentProfiles;
use DomainException;
use Illuminate\Console\Command;

class ImportStudentProfilesCommand extends Command
{
    protected $signature = 'roster:profiles {file}';

    protected $description = 'Import an authorised local student profile CSV or single-sheet XLSX';

    public function handle(ImportStudentProfiles $importer): int
    {
        try {
            $count = $importer->import($this->argument('file'));
        } catch (DomainException $error) {
            $this->error($error->getMessage());

            return self::FAILURE;
        }
        $this->info("Processed {$count} profile records.");

        return self::SUCCESS;
    }
}
