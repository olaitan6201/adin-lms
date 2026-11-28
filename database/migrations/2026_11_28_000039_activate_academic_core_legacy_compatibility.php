<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            $this->rebuildSqlite();

            return;
        }

        $mysql = DB::getDriverName() === 'mysql';
        $programme = $mysql ? 'MODIFY programme_id CHAR(36) NULL' : 'ALTER COLUMN programme_id DROP NOT NULL';
        $assignment = $mysql
            ? 'MODIFY title VARCHAR(191) NULL, MODIFY description TEXT NULL,
                MODIFY level_id CHAR(36) NULL, MODIFY compulsory TINYINT(1) NULL'
            : 'ALTER COLUMN title DROP NOT NULL, ALTER COLUMN description DROP NOT NULL,
                ALTER COLUMN level_id DROP NOT NULL, ALTER COLUMN compulsory DROP NOT NULL';

        $curriculumRule = $this->curriculumRule();
        $assignmentRule = $this->assignmentRule();

        DB::statement("ALTER TABLE curricula {$programme},
            ADD CONSTRAINT curricula_legacy_required CHECK ({$curriculumRule})");
        DB::statement("ALTER TABLE curriculum_courses {$assignment},
            ADD CONSTRAINT curriculum_courses_legacy_required CHECK ({$assignmentRule})");
    }

    private function rebuildSqlite(): void
    {
        // The schema builder rebuilds SQLite tables and does not preserve triggers.
        // Disable FK enforcement before the transaction, then check the whole graph before committing.
        if (DB::connection()->transactionLevel() !== 0) {
            throw new LogicException('The SQLite curriculum rebuild must start outside a transaction.');
        }

        Schema::withoutForeignKeyConstraints(function (): void {
            DB::transaction(function (): void {
                $triggers = DB::table('sqlite_master')
                    ->where('type', 'trigger')
                    ->whereIn('tbl_name', ['curricula', 'curriculum_courses'])
                    ->orderBy('rowid')
                    ->pluck('sql');

                Schema::table('curricula', function (Blueprint $table): void {
                    $table->uuid('programme_id')->nullable()->change();
                });

                Schema::table('curriculum_courses', function (Blueprint $table): void {
                    $table->string('title', 191)->nullable()->change();
                    $table->text('description')->nullable()->change();
                    $table->uuid('level_id')->nullable()->change();
                    $table->boolean('compulsory')->nullable()->change();
                });

                foreach ($triggers as $sql) {
                    DB::statement($sql);
                }

                $this->enforceSqlite('curricula', $this->curriculumRule('NEW.'));
                $this->enforceSqlite('curriculum_courses', $this->assignmentRule('NEW.'));

                if (DB::selectOne('PRAGMA foreign_key_check') !== null) {
                    throw new LogicException('The SQLite curriculum rebuild did not preserve all foreign keys.');
                }
            });
        });
    }

    private function enforceSqlite(string $table, string $condition): void
    {
        foreach (['INSERT', 'UPDATE'] as $event) {
            DB::statement("CREATE TRIGGER {$table}_legacy_required_{$event} BEFORE {$event} ON {$table}
                WHEN NOT ({$condition}) BEGIN SELECT RAISE(ABORT, 'Missing required legacy curriculum fields'); END");
        }
    }

    private function curriculumRule(string $prefix = ''): string
    {
        return "{$prefix}academic_pathway_id IS NOT NULL OR {$prefix}programme_id IS NOT NULL";
    }

    private function assignmentRule(string $prefix = ''): string
    {
        return "{$prefix}course_revision_id IS NOT NULL OR (
            {$prefix}title IS NOT NULL AND {$prefix}description IS NOT NULL
            AND {$prefix}level_id IS NOT NULL AND {$prefix}compulsory IS NOT NULL
        )";
    }

    public function down(): void
    {
        throw new LogicException('Academic core activation is forward-only; use a reviewed forward fix or restore.');
    }
};
