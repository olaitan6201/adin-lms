<?php

namespace Database\Seeders;

use App\Models\Forum;
use App\Models\Offering;
use Illuminate\Database\Seeder;
use LogicException;

final class CommunityDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local', 'testing')) {
            throw new LogicException('Community demo forums require local or testing mode.');
        }

        $this->call(DemoCampusSeeder::class);
        $course = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->sole();
        Forum::firstOrCreate(['offering_id' => $course->id, 'group_id' => null, 'title' => 'Computing seminar']);
    }
}
