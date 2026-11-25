<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('faculties', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->string('code')->unique();
    $table->string('name');
});

Schema::create('departments', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('faculty_id')->constrained('faculties');
    $table->string('code')->unique();
    $table->string('name');
});

Schema::create('programmes', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('department_id')->constrained('departments');
    $table->string('code')->unique();
    $table->string('name');
});

Schema::create('academic_levels', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->string('label')->unique();
});

Schema::create('academic_sessions', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->string('label')->unique();
    $table->date('starts_on');
    $table->date('ends_on');
});

Schema::create('semesters', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('session_id')->constrained('academic_sessions');
    $table->integer('position');
    $table->date('starts_on');
    $table->date('ends_on');
    $table->unique(['session_id', 'position'], 'semesters_session_position_uq');
});

Schema::create('files', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->string('object_key')->unique();
    $table->string('filename');
    $table->string('media_type');
    $table->bigInteger('size_bytes');
    $table->string('checksum');
    $table->string('validation_status');
});
