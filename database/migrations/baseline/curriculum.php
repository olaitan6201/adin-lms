<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('curricula', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('programme_id')->constrained('programmes');
    $table->integer('version');
    $table->string('framework_revision')->nullable();
    $table->string('status');
    $table->foreignUuid('approved_by')->nullable()->constrained('users');
    $table->timestampTz('approved_at')->nullable();
    $table->unique(['programme_id', 'version'], 'curricula_programme_version_uq');
});

Schema::create('courses', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('department_id')->constrained('departments');
    $table->string('code')->unique();
});

Schema::create('curriculum_courses', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('curriculum_id')->constrained('curricula');
    $table->foreignUuid('course_id')->constrained('courses');
    $table->string('title');
    $table->text('description');
    $table->text('outline')->nullable();
    $table->decimal('credits', 24, 8);
    $table->foreignUuid('level_id')->constrained('academic_levels');
    $table->integer('semester_position');
    $table->boolean('compulsory');
    $table->unique(['curriculum_id', 'course_id'], 'curriculum_courses_curriculum_course_uq');
});

Schema::create('prerequisites', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('curriculum_course_id')->constrained('curriculum_courses');
    $table->foreignUuid('required_course_id')->constrained('courses');
    $table->unique(['curriculum_course_id', 'required_course_id'], 'prerequisites_curriculum_course_required_course_uq');
});

Schema::create('programme_outcomes', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('curriculum_id')->constrained('curricula');
    $table->text('statement');
});

Schema::create('course_outcomes', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('curriculum_course_id')->constrained('curriculum_courses');
    $table->text('statement');
});

Schema::create('outcome_mappings', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('course_outcome_id')->constrained('course_outcomes');
    $table->foreignUuid('programme_outcome_id')->constrained('programme_outcomes');
    $table->unique(['course_outcome_id', 'programme_outcome_id'], 'outcome_mappings_course_outcome_programme_outcome_uq');
});
