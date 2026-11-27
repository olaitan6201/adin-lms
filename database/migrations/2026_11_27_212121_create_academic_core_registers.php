<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('academic_programmes', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('status')->default('active');
        });

        Schema::create('programme_levels', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('academic_programme_id')->constrained();
            $table->string('code');
            $table->string('label');
            $table->integer('position');
            $table->unique(['academic_programme_id', 'code'], 'prog_levels_code_uq');
            $table->unique(['id', 'academic_programme_id'], 'prog_levels_programme_fk_key');
        });

        Schema::create('specializations', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('department_id')->constrained();
            $table->string('code');
            $table->string('name');
            $table->string('status')->default('active');
            $table->unique(['department_id', 'code'], 'specializations_department_code_uq');
        });

        Schema::create('academic_pathways', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('specialization_id')->constrained();
            $table->foreignUuid('academic_programme_id')->constrained();
            $table->string('status')->default('active');
            $table->unique(['specialization_id', 'academic_programme_id'], 'academic_pathways_track_programme_uq');
            $table->unique(['id', 'academic_programme_id'], 'academic_pathways_programme_fk_key');
        });

        Schema::create('course_revisions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('course_id')->constrained();
            $table->integer('revision_number');
            $table->string('title');
            $table->text('description');
            $table->text('syllabus')->nullable();
            $table->text('learning_outcomes')->nullable();
            $table->decimal('standard_units', 24, 8);
            $table->string('status')->default('draft');
            $table->foreignUuid('approved_by')->nullable()->constrained('users');
            $table->timestampTz('approved_at')->nullable();
            $table->unique(['course_id', 'revision_number'], 'course_revisions_number_uq');
            $table->unique(['id', 'course_id'], 'course_revisions_course_fk_key');
        });

        Schema::create('entry_cohorts', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('code');
            $table->string('label');
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
