<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$driver = DB::getDriverName();

Schema::create('students', function (Blueprint $table) use ($driver): void {
    $table->uuid('id')->primary();
    $table->string('external_student_id')->collation($driver === 'mysql' ? 'utf8mb4_bin' : null)->unique();
    $table->foreignUuid('user_id')->nullable()->unique()->constrained('users');
    $table->string('matric_number')->nullable()->unique();
    $table->string('source_name')->nullable();
    $table->string('source_email')->nullable();
    $table->string('status')->nullable();
    $table->timestampTz('created_at')->nullable();
    $table->timestampTz('updated_at')->nullable();
});

Schema::create('student_sessions', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('student_id')->constrained('students');
    $table->foreignUuid('session_id')->constrained('academic_sessions');
    $table->foreignUuid('programme_id')->constrained('programmes');
    $table->foreignUuid('level_id')->constrained('academic_levels');
    $table->unique(['student_id', 'session_id'], 'student_sessions_student_session_uq');
});

Schema::create('lecturers', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('user_id')->unique()->constrained('users');
    $table->string('staff_number')->unique();
    $table->foreignUuid('department_id')->constrained('departments');
});

Schema::create('guardian_access', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('guardian_id')->constrained('users');
    $table->foreignUuid('student_id')->constrained('students');
    $table->foreignUuid('approved_by')->constrained('users');
    $table->jsonb('allowed_fields');
    $table->timestampTz('revoked_at')->nullable();
    $table->unique(['guardian_id', 'student_id'], 'guardian_access_guardian_student_uq');
});
