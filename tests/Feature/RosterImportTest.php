<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RosterImportTest extends TestCase
{
    use RefreshDatabase;

    private function loadRows(string $rows, int $expectedExit = 0): void
    {
        $path = tempnam(sys_get_temp_dir(), 'roster-');
        try {
            file_put_contents($path, "student_id,offering_id,status,revision\n".$rows);
            $this->artisan('roster:import', ['file' => $path])->assertExitCode($expectedExit);
        } finally {
            unlink($path);
        }
    }

    public function test_replays_and_stale_registration_preserve_withdrawn_record(): void
    {
        $this->loadRows('S1,C1,registered,1');
        $id = DB::table('enrolments')->sole()->id;
        $this->loadRows("S1,C1,registered,1\nS1,C1,withdrawn,2\nS1,C1,registered,1");
        $this->assertDatabaseCount('enrolments', 1);
        $this->assertDatabaseHas('enrolments', ['id' => $id, 'status' => 'withdrawn', 'source_revision' => 2]);
    }

    public function test_conflicting_revision_and_invalid_rows_roll_back_whole_file(): void
    {
        foreach (['S1,C1,withdrawn,1', 'S2,,registered,1', 'S2,C1,unknown,2'] as $bad) {
            $this->loadRows("S1,C1,registered,1\n".$bad, 1);
            $this->assertDatabaseCount('enrolments', 0);
            $this->assertDatabaseCount('students', 0);
        }
    }

    public function test_operator_cannot_reassign_an_existing_identity(): void
    {
        $this->loadRows("S1,C1,registered,1\nS2,C1,registered,1");
        $user = User::factory()->create();
        $other = User::factory()->create();
        $this->artisan('roster:link', ['student' => 'S1', 'user' => $user->id])->assertSuccessful();
        $this->artisan('roster:link', ['student' => 'S1', 'user' => $other->id])->assertFailed();
        $this->artisan('roster:link', ['student' => 'S2', 'user' => $user->id])->assertFailed();
        $this->assertDatabaseHas('students', ['external_student_id' => 'S1', 'user_id' => $user->id]);
    }
}
