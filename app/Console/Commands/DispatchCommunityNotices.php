<?php

namespace App\Console\Commands;

use App\Jobs\DeliverCommunityEmail;
use App\Models\NotificationDelivery;
use App\Services\Community\ScanAcademicNotices;
use Illuminate\Console\Command;

class DispatchCommunityNotices extends Command
{
    protected $signature = 'community:notify';

    protected $description = 'Collect available academic notices and enqueue due email deliveries';

    public function handle(ScanAcademicNotices $scanner): int
    {
        $scanner->run();
        $due = NotificationDelivery::dueEmails();
        foreach ($due->lazyById() as $delivery) {
            DeliverCommunityEmail::dispatch($delivery->id);
        }

        return self::SUCCESS;
    }
}
