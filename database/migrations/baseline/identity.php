<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$driver = DB::getDriverName();

Schema::create('users', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->string('email')->unique();
    $table->string('full_name');
    $table->string('password_hash')->nullable();
    $table->foreignUuid('photo_id')->nullable()->constrained('files');
    $table->string('status')->default('active');
    $table->unsignedInteger('auth_version')->default(1);
    $table->rememberToken();
    $table->timestampTz('email_verified_at')->nullable();
    $table->timestampTz('created_at')->nullable();
    $table->timestampTz('updated_at')->nullable();
});

Schema::create('login_events', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('user_id')->nullable()->constrained('users');
    $table->timestampTz('occurred_at');
    $table->string('outcome');
    $table->index(['user_id', 'occurred_at'], 'login_events_user_id_occurred_at_idx');
    $table->index(['outcome', 'occurred_at', 'user_id'], 'usage_auth_window_idx');
});

Schema::create('auth_sessions', function (Blueprint $table) use ($driver): void {
    $table->uuid('id')->primary();
    $table->string('token_digest')->collation($driver === 'mysql' ? 'utf8mb4_bin' : null)->unique();
    $table->foreignUuid('user_id')->constrained('users');
    $table->timestampTz('last_seen');
    $table->timestampTz('expires_at');
    $table->timestampTz('revoked_at')->nullable();
});

Schema::create('credentials', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('user_id')->constrained('users');
    $table->string('kind');
    $table->text('protected_value');
    $table->char('lookup_digest', 64);
    $table->timestampTz('expires_at')->nullable();
    $table->unique(['kind', 'lookup_digest'], 'credentials_kind_lookup_digest_uq');
});

Schema::create('roles', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->string('code')->unique();
});

Schema::create('permissions', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->string('code')->unique();
});

Schema::create('role_permissions', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('role_id')->constrained('roles');
    $table->foreignUuid('permission_id')->constrained('permissions');
    $table->unique(['role_id', 'permission_id'], 'role_permissions_role_permission_uq');
});
