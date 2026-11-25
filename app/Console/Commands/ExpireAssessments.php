<?php

namespace App\Console\Commands;

use App\Models\ExaminationAttempt;
use App\Services\Assessment\ExamSession;
use Illuminate\Console\Command;

class ExpireAssessments extends Command
{
    protected $signature = 'assessments:expire';

    protected $description = 'Submit expired examination attempts idempotently';

    public function handle(ExamSession $sessions): int
    {
        foreach (ExaminationAttempt::whereNull('submitted_at')
            ->where('expires_at', '<=', now())->lazyById() as $attempt) {
            $sessions->finish($attempt);
        }

        return self::SUCCESS;
    }
}
