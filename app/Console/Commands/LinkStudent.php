<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('roster:link {student : Upstream student ID} {user : Verified local user ID}')]
#[Description('Bind a verified institutional student to their existing LMS account')]
class LinkStudent extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $id = filter_var($this->argument('user'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $linked = $id && DB::transaction(function () use ($id) {
            $user = DB::table('users')->where('id', $id)->lockForUpdate()->first();
            $student = DB::table('students')->where('external_student_id', $this->argument('student'))->lockForUpdate()->first();
            if (! $user || ! $student || ($student->user_id !== null && (int) $student->user_id !== $id)) {
                return false;
            }
            if (DB::table('students')->where('user_id', $id)->where('id', '!=', $student->id)->exists()) {
                return false;
            }
            DB::table('students')->where('id', $student->id)->update(['user_id' => $id, 'updated_at' => now()]);

            return true;
        });
        if (! $linked) {
            $this->error('Unknown student/account or conflicting identity link.');

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
