<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$driver = DB::getDriverName();

Schema::create('offerings', function (Blueprint $table) use ($driver): void {
    $table->uuid('id');
    $table->primary('id');
    $table->string('external_offering_id')->nullable()->collation($driver === 'mysql' ? 'utf8mb4_bin' : null)->unique();
    $table->foreignUuid('curriculum_course_id')->nullable()->constrained('curriculum_courses');
    $table->foreignUuid('semester_id')->nullable()->constrained('semesters');
    $table->string('section')->nullable();
    $table->string('status')->default('draft');
    $table->string('delivery_mode')->nullable();
    $table->jsonb('activity_order')->nullable();
    $table->foreignUuid('approved_by')->nullable()->constrained('users');
    $table->timestampTz('approved_at')->nullable();
    $table->foreignUuid('copied_from')->nullable()->constrained('offerings');
    $table->timestampTz('created_at')->nullable();
    $table->timestampTz('updated_at')->nullable();
    $table->unique(['semester_id', 'curriculum_course_id', 'section'], 'offerings_semester_curriculum_course_section_uq');
});

Schema::create('teaching_allocations', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('lecturer_id')->constrained('lecturers');
    $table->foreignUuid('offering_id')->constrained('offerings');
    $table->unique(['lecturer_id', 'offering_id'], 'teaching_allocations_lecturer_offering_uq');
});

Schema::create('enrolments', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('offering_id')->constrained('offerings');
    $table->foreignUuid('student_id')->constrained('students');
    $table->string('status');
    $table->integer('source_revision');
    $table->timestampTz('enrolled_at')->nullable();
    $table->timestampTz('completed_at')->nullable();
    $table->timestampTz('created_at')->nullable();
    $table->timestampTz('updated_at')->nullable();
    $table->unique(['offering_id', 'student_id'], 'enrolments_offering_student_uq');
    $table->index(['student_id', 'status'], 'enrolments_student_id_status_idx');
});
