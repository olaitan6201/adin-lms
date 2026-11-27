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
        $this->choices();
        $this->adoptions();

        Schema::create('offering_curriculum_courses', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('offering_id')->constrained();
            $table->foreignUuid('curriculum_course_id')->constrained();
            $table->string('equivalence_reference')->nullable();
            $table->unique(['offering_id', 'curriculum_course_id'], 'offering_cur_courses_pair_uq');
        });
    }

    private function choices(): void
    {
        Schema::create('curriculum_choice_groups', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('curriculum_id')->constrained();
            $table->string('code');
            $table->integer('minimum_selections');
            $table->integer('maximum_selections');
            $table->unique(['curriculum_id', 'code'], 'cur_choice_groups_code_uq');
            $table->unique(['id', 'curriculum_id'], 'cur_choice_groups_version_fk_key');
        });

        Schema::create('curriculum_choice_options', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('curriculum_id');
            $table->uuid('group_id');
            $table->uuid('curriculum_course_id')->unique();
            $table->foreign(['group_id', 'curriculum_id'], 'cur_choice_options_group_version_fk')
                ->references(['id', 'curriculum_id'])->on('curriculum_choice_groups');
            $table->foreign(['curriculum_course_id', 'curriculum_id'], 'cur_choice_options_course_version_fk')
                ->references(['id', 'curriculum_id'])->on('curriculum_courses');
        });

        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE curriculum_choice_groups ADD CONSTRAINT cur_choice_groups_bounds CHECK
                (minimum_selections >= 0 AND maximum_selections >= minimum_selections)');

            return;
        }

        foreach (['INSERT', 'UPDATE'] as $event) {
            DB::statement("CREATE TRIGGER cur_choice_groups_bounds_{$event} BEFORE {$event} ON curriculum_choice_groups
                WHEN NEW.minimum_selections < 0 OR NEW.maximum_selections < NEW.minimum_selections
                BEGIN SELECT RAISE(ABORT, 'Invalid curriculum choice bounds'); END");
        }
    }

    private function adoptions(): void
    {
        $tuple = ['academic_pathway_id', 'academic_session_id', 'entry_cohort_id'];
        $decisionKey = ['id', ...$tuple];

        Schema::create('curriculum_adoption_decisions', function (Blueprint $table) use ($decisionKey): void {
            $table->uuid('id')->primary();
            $table->uuid('academic_pathway_id');
            $table->foreignUuid('academic_session_id')->constrained();
            $table->foreignUuid('entry_cohort_id')->constrained();
            $table->uuid('curriculum_id');
            $table->string('decision_reference');
            $table->foreignUuid('approved_by')->constrained('users');
            $table->text('reason');
            $table->timestampTz('recorded_at');
            $table->unique($decisionKey, 'cur_adoption_decisions_tuple_fk_key');
            $table->foreign(['curriculum_id', 'academic_pathway_id'], 'cur_adoption_decisions_version_path_fk')
                ->references(['id', 'academic_pathway_id'])->on('curricula');
        });

        Schema::create('curriculum_adoptions', function (Blueprint $table) use ($tuple, $decisionKey): void {
            $table->uuid('id')->primary();
            $table->uuid('academic_pathway_id');
            $table->uuid('academic_session_id');
            $table->uuid('entry_cohort_id');
            $table->uuid('active_decision_id');
            $table->unique($tuple, 'cur_adoptions_tuple_uq');
            $table->foreign(['active_decision_id', ...$tuple], 'cur_adoptions_decision_tuple_fk')
                ->references($decisionKey)->on('curriculum_adoption_decisions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new LogicException('Academic core expansion is forward-only; use a reviewed forward fix or restore.');
    }
};
