<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();
        if (! in_array($driver, ['pgsql', 'sqlite', 'mysql'], true)) {
            throw new LogicException('Unsupported LMS database engine.');
        }

        if ($driver === 'mysql' && version_compare(DB::connection()->getServerVersion(), '8.0.16', '<')) {
            throw new LogicException('MySQL 8.0.16 or later is required for enforced CHECK constraints.');
        }

        if (Schema::hasTable('users')) {
            throw new LogicException('Install this baseline in a new database; preserve existing pilot data.');
        }

        require __DIR__.'/baseline/institution.php';
        require __DIR__.'/baseline/identity.php';
        require __DIR__.'/baseline/people.php';
        require __DIR__.'/baseline/curriculum.php';
        require __DIR__.'/baseline/offerings.php';
        require __DIR__.'/baseline/learning.php';
        require __DIR__.'/baseline/assessment_planning.php';
        require __DIR__.'/baseline/coursework.php';
        require __DIR__.'/baseline/examinations.php';
        require __DIR__.'/baseline/grading.php';
        require __DIR__.'/baseline/communications.php';
        require __DIR__.'/baseline/governance.php';
        require __DIR__.'/baseline/teaching_resources.php';
        require __DIR__.'/baseline/framework.php';

        $this->enforce('offerings',
            "status <> 'published' OR (curriculum_course_id IS NOT NULL AND semester_id IS NOT NULL AND section IS NOT NULL AND delivery_mode IS NOT NULL AND approved_by IS NOT NULL AND approved_at IS NOT NULL)",
            "NEW.status <> 'published' OR (NEW.curriculum_course_id IS NOT NULL AND NEW.semester_id IS NOT NULL AND NEW.section IS NOT NULL AND NEW.delivery_mode IS NOT NULL AND NEW.approved_by IS NOT NULL AND NEW.approved_at IS NOT NULL)",
        );
        $this->enforce('submissions',
            '(enrolment_id IS NULL) <> (group_id IS NULL)',
            '(NEW.enrolment_id IS NULL) <> (NEW.group_id IS NULL)',
        );
        $this->enforce('exam_slots',
            '(fixed_version_id IS NULL) <> (draw_from_bank_id IS NULL)',
            '(NEW.fixed_version_id IS NULL) <> (NEW.draw_from_bank_id IS NULL)',
        );
        $this->enforce('grades',
            'published_at IS NULL OR (approved_by IS NOT NULL AND approved_at <= published_at AND approved_at IS NOT NULL)',
            'NEW.published_at IS NULL OR (NEW.approved_by IS NOT NULL AND NEW.approved_at <= NEW.published_at AND NEW.approved_at IS NOT NULL)',
        );
        $this->enforce('access_scopes',
            "(scope_key = 'institution' AND faculty_id IS NULL AND department_id IS NULL AND offering_id IS NULL) OR (faculty_id IS NOT NULL AND scope_key = CONCAT('faculty:', faculty_id) AND department_id IS NULL AND offering_id IS NULL) OR (department_id IS NOT NULL AND scope_key = CONCAT('department:', department_id) AND faculty_id IS NULL AND offering_id IS NULL) OR (offering_id IS NOT NULL AND scope_key = CONCAT('offering:', offering_id) AND faculty_id IS NULL AND department_id IS NULL)",
            "(NEW.scope_key = 'institution' AND NEW.faculty_id IS NULL AND NEW.department_id IS NULL AND NEW.offering_id IS NULL) OR (NEW.faculty_id IS NOT NULL AND NEW.scope_key = ('faculty:' || NEW.faculty_id) AND NEW.department_id IS NULL AND NEW.offering_id IS NULL) OR (NEW.department_id IS NOT NULL AND NEW.scope_key = ('department:' || NEW.department_id) AND NEW.faculty_id IS NULL AND NEW.offering_id IS NULL) OR (NEW.offering_id IS NOT NULL AND NEW.scope_key = ('offering:' || NEW.offering_id) AND NEW.faculty_id IS NULL AND NEW.department_id IS NULL)",
        );
    }

    // Blueprint has no CHECK command. SQLite cannot add CHECK with ALTER TABLE.
    private function enforce(string $table, string $condition, string $newRowCondition): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE {$table} ADD CONSTRAINT {$table}_valid CHECK ({$condition})");

            return;
        }

        foreach (['INSERT', 'UPDATE'] as $event) {
            DB::statement("CREATE TRIGGER {$table}_valid_{$event} BEFORE {$event} ON {$table}
                WHEN NOT ({$newRowCondition}) BEGIN SELECT RAISE(ABORT, 'Invalid {$table} row'); END");
        }
    }

    public function down(): void
    {
        require __DIR__.'/baseline/rollback.php';
    }
};
