<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('modules', function (Blueprint $table): void {
    $table->uuid('id');
    $table->primary('id');
    $table->foreignUuid('prerequisite_id')->nullable()->constrained('modules');
    $table->foreignUuid('offering_id')->constrained('offerings');
    $table->integer('position');
    $table->string('title');
    $table->string('kind');
    $table->text('body')->nullable();
    $table->timestampTz('opens_at')->nullable();
    $table->timestampTz('closes_at')->nullable();
    $table->unique(['offering_id', 'position'], 'modules_offering_position_uq');
});

Schema::create('learning_materials', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('module_id')->constrained('modules');
    $table->string('title');
    $table->timestampTz('opens_at')->nullable();
    $table->timestampTz('closes_at')->nullable();
    $table->boolean('download_allowed');
    $table->jsonb('restrictions')->nullable();
});

Schema::create('material_versions', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('material_id')->constrained('learning_materials');
    $table->integer('revision');
    $table->foreignUuid('file_id')->nullable()->constrained('files');
    $table->text('external_url')->nullable();
    $table->text('body')->nullable();
    $table->timestampTz('created_at');
    $table->foreignUuid('created_by')->constrained('users');
    $table->foreignUuid('caption_file_id')->nullable()->constrained('files');
    $table->text('transcript')->nullable();
    $table->unique(['material_id', 'revision'], 'material_versions_material_revision_uq');
});

Schema::create('lesson_progress', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('enrolment_id')->constrained('enrolments');
    $table->foreignUuid('module_id')->constrained('modules');
    $table->timestampTz('last_seen');
    $table->timestampTz('completed_at')->nullable();
    $table->unique(['enrolment_id', 'module_id'], 'lesson_progress_enrolment_module_uq');
});

Schema::create('classes', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('offering_id')->constrained('offerings');
    $table->string('title');
    $table->string('status');
    $table->timestampTz('starts_at');
    $table->timestampTz('ends_at');
    $table->text('meeting_url')->nullable();
    $table->foreignUuid('recording_material_id')->nullable()->constrained('learning_materials');
    $table->index(['offering_id', 'starts_at'], 'classes_offering_id_starts_at_idx');
});

Schema::create('attendance', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('class_id')->constrained('classes');
    $table->foreignUuid('user_id')->constrained('users');
    $table->string('status');
    $table->string('method');
    $table->foreignUuid('recorded_by')->nullable()->constrained('users');
    $table->timestampTz('recorded_at');
    $table->unique(['class_id', 'user_id'], 'attendance_class_user_uq');
});
