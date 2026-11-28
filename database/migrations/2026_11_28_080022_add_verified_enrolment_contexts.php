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
        Schema::table('enrolments', function (Blueprint $table): void {
            $table->unique(['id', 'offering_id'], 'enrolments_id_offering_unique');
        });

        Schema::table('offering_curriculum_courses', function (Blueprint $table): void {
            $table->unique(['id', 'offering_id'], 'offering_curriculum_courses_id_offering_unique');
        });

        Schema::create('enrolment_academic_contexts', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('enrolment_id')->unique();
            $table->uuid('offering_id');
            $table->uuid('offering_curriculum_course_id');
            $table->foreignUuid('placement_acceptance_id')->constrained(indexName: 'enrolment_contexts_placement_fk');
            $table->foreignUuid('linked_by')->constrained('users');
            $table->timestampTz('created_at');
            $table->foreign(['enrolment_id', 'offering_id'], 'enrolment_contexts_enrolment_offering_fk')
                ->references(['id', 'offering_id'])->on('enrolments');
            $table->foreign(['offering_curriculum_course_id', 'offering_id'], 'enrolment_contexts_assignment_offering_fk')
                ->references(['id', 'offering_id'])->on('offering_curriculum_courses');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new LogicException('Enrolment academic contexts are forward-only.');
    }
};
