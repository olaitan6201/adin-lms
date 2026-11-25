<?php

namespace App\Services\Operations;

use App\Enums\BackupOutcome;

final class BackupMonitor
{
    /** @return array{state:string,finished_at?:string,run?:string,overdue?:bool|null} */
    public function reading(): array
    {
        $path = config('operations.backup_status_file');
        if (! is_string($path) || $path === '') {
            return ['state' => 'not_configured'];
        }

        // Only the host service writes this bounded, local status document.
        $contents = str_starts_with($path, '/') && is_file($path) && is_readable($path)
            ? @file_get_contents($path, false, null, 0, 1025) : false;
        $report = is_string($contents) && strlen($contents) <= 1024 ? json_decode($contents, true) : null;
        $state = $report['state'] ?? null;
        $time = $report['finished_at'] ?? null;
        $run = $report['run'] ?? null;
        if (! in_array($state, [BackupOutcome::Snapshot->value, BackupOutcome::Failed->value], true)
            || ! is_int($time) || $time <= 0 || $time > now()->timestamp
            || ! is_string($run) || ! preg_match('/\A[A-Za-z0-9_-]{1,64}\z/', $run)) {
            return ['state' => 'unavailable'];
        }

        $budget = filter_var(config('operations.backup_max_age_hours'), FILTER_VALIDATE_INT);

        return [
            'state' => $state, 'run' => $run, 'finished_at' => gmdate(DATE_ATOM, $time),
            'overdue' => $budget > 0 ? now()->timestamp - $time > $budget * 3600 : null,
        ];
    }
}
