<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('curricula', function (Blueprint $table): void {
            $table->uuid('academic_pathway_id')->nullable();
            $table->uuid('academic_programme_id')->nullable();
            $table->unique(['academic_pathway_id', 'version'], 'curricula_pathway_version_uq');
            $table->unique(['id', 'academic_programme_id'], 'curricula_programme_fk_key');
            $table->unique(['id', 'academic_pathway_id'], 'curricula_pathway_fk_key');
            $table->foreign(['academic_pathway_id', 'academic_programme_id'], 'curricula_pathway_programme_fk')
                ->references(['id', 'academic_programme_id'])->on('academic_pathways');
        });

        Schema::table('curriculum_courses', function (Blueprint $table): void {
            $table->uuid('course_revision_id')->nullable();
            $table->uuid('academic_programme_id')->nullable();
            $table->uuid('programme_level_id')->nullable();
            $table->string('category')->nullable();
            $table->string('requirement_mode')->nullable();
            $table->unique(['id', 'curriculum_id'], 'curriculum_courses_version_fk_key');
            $table->foreign(['curriculum_id', 'academic_programme_id'], 'cur_courses_curriculum_programme_fk')
                ->references(['id', 'academic_programme_id'])->on('curricula');
            $table->foreign(['programme_level_id', 'academic_programme_id'], 'cur_courses_level_programme_fk')
                ->references(['id', 'academic_programme_id'])->on('programme_levels');
            $table->foreign(['course_revision_id', 'course_id'], 'cur_courses_revision_course_fk')
                ->references(['id', 'course_id'])->on('course_revisions');
        });

        $this->requireCompleteTuple('curricula', ['academic_pathway_id', 'academic_programme_id']);
        $this->requireCompleteTuple('curriculum_courses', [
            'course_revision_id', 'academic_programme_id', 'programme_level_id', 'category', 'requirement_mode',
        ]);

        if (DB::getDriverName() === 'sqlite') {
            // Rebuilding offerings would discard its legacy publication triggers.
            DB::statement('ALTER TABLE offerings ADD COLUMN taught_course_revision_id VARCHAR NULL REFERENCES course_revisions (id)');

            return;
        }

        Schema::table('offerings', function (Blueprint $table): void {
            $table->foreignUuid('taught_course_revision_id')->nullable()->constrained('course_revisions');
        });
    }

    /** @param list<string> $columns */
    private function requireCompleteTuple(string $table, array $columns): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            $condition = $this->completeTuple($columns);
            DB::statement("ALTER TABLE {$table} ADD CONSTRAINT {$table}_core_tuple CHECK ({$condition})");

            return;
        }

        $condition = $this->completeTuple($columns, 'NEW.');
        foreach (['INSERT', 'UPDATE'] as $event) {
            DB::statement("CREATE TRIGGER {$table}_core_{$event} BEFORE {$event} ON {$table}
                WHEN NOT ({$condition}) BEGIN SELECT RAISE(ABORT, 'Incomplete academic core tuple'); END");
        }
    }

    /** @param list<string> $columns */
    private function completeTuple(array $columns, string $prefix = ''): string
    {
        $absent = implode(' IS NULL AND ', array_map(fn (string $column): string => $prefix.$column, $columns));
        $present = implode(' IS NOT NULL AND ', array_map(fn (string $column): string => $prefix.$column, $columns));

        return "({$absent} IS NULL) OR ({$present} IS NOT NULL)";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new LogicException('Academic core expansion is forward-only; use a reviewed forward fix or restore.');
    }
};
