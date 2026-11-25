<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$driver = DB::getDriverName();

Schema::create('system_configuration', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->string('key')->unique();
    $table->jsonb('value');
    $table->foreignUuid('updated_by')->constrained('users');
});

Schema::create('audit_logs', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('actor_id')->nullable()->constrained('users');
    $table->foreignUuid('attempt_id')->nullable()->constrained('examination_attempts');
    $table->timestampTz('occurred_at');
    $table->string('action');
    $table->string('subject_key');
    $table->jsonb('details')->nullable();
    $table->index(['subject_key', 'occurred_at'], 'audit_logs_subject_key_occurred_at_idx');
    $table->index(['attempt_id', 'occurred_at'], 'audit_logs_attempt_id_occurred_at_idx');
    $table->index(['actor_id', 'occurred_at'], 'audit_logs_actor_id_occurred_at_idx');
});

Schema::create('privacy_case_files', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->string('reference')->unique();
    $table->string('kind');
    $table->string('stage');
    $table->string('evidence');
    $table->foreignUuid('owner_id')->constrained('users');
    $table->foreignUuid('subject_id')->nullable()->constrained('users');
    $table->timestampsTz();
    $table->index(['subject_id', 'kind', 'stage'], 'privacy_cases_subject_kind_stage_idx');
});

Schema::create('privacy_consents', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('user_id')->constrained('users');
    $table->string('purpose');
    $table->string('notice_version');
    $table->timestampTz('granted_at');
    $table->timestampTz('withdrawn_at')->nullable();
});

Schema::create('access_scopes', function (Blueprint $table) use ($driver): void {
    $table->uuid('id')->primary();
    $table->string('scope_key')->collation($driver === 'mysql' ? 'utf8mb4_bin' : null)->unique();
    $table->foreignUuid('faculty_id')->nullable()->unique()->constrained('faculties');
    $table->foreignUuid('department_id')->nullable()->unique()->constrained('departments');
    $table->foreignUuid('offering_id')->nullable()->unique()->constrained('offerings');
});

Schema::create('role_grants', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('user_id')->constrained('users');
    $table->foreignUuid('role_id')->constrained('roles');
    $table->foreignUuid('scope_id')->constrained('access_scopes');
    $table->unique(['user_id', 'role_id', 'scope_id'], 'role_grants_user_role_scope_uq');
});
