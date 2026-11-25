<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('assignments', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('item_id')->unique()->constrained('assessment_items');
    $table->text('instructions');
    $table->timestampTz('opens_at');
    $table->timestampTz('due_at');
    $table->timestampTz('closes_at');
    $table->jsonb('accepted_formats');
    $table->bigInteger('max_bytes');
    $table->jsonb('late_policy');
    $table->boolean('editable');
    $table->boolean('group_work');
});

Schema::create('assignment_references', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('assignment_id')->constrained('assignments');
    $table->foreignUuid('file_id')->constrained('files');
    $table->unique(['assignment_id', 'file_id'], 'assignment_references_assignment_file_uq');
});

Schema::create('study_groups', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('offering_id')->constrained('offerings');
    $table->string('name');
});

Schema::create('group_members', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('group_id')->constrained('study_groups');
    $table->foreignUuid('enrolment_id')->constrained('enrolments');
    $table->unique(['group_id', 'enrolment_id'], 'group_members_group_enrolment_uq');
});

Schema::create('submissions', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('assignment_id')->constrained('assignments');
    $table->foreignUuid('enrolment_id')->nullable()->constrained('enrolments');
    $table->foreignUuid('group_id')->nullable()->constrained('study_groups');
    $table->unique(['assignment_id', 'enrolment_id'], 'submissions_assignment_enrolment_uq');
    $table->unique(['assignment_id', 'group_id'], 'submissions_assignment_group_uq');
});

Schema::create('submission_versions', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('submission_id')->constrained('submissions');
    $table->integer('revision');
    $table->string('receipt')->unique();
    $table->timestampTz('submitted_at');
    $table->foreignUuid('submitted_by')->constrained('users');
    $table->text('body')->nullable();
    $table->unique(['submission_id', 'revision'], 'submission_versions_submission_revision_uq');
    $table->index('submitted_at', 'usage_submission_window_idx');
});

Schema::create('submission_files', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('version_id')->constrained('submission_versions');
    $table->foreignUuid('file_id')->constrained('files');
    $table->unique(['version_id', 'file_id'], 'submission_files_version_file_uq');
});

Schema::create('submission_recipients', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('version_id')->constrained('submission_versions');
    $table->foreignUuid('enrolment_id')->constrained('enrolments');
    $table->unique(['version_id', 'enrolment_id'], 'submission_recipients_version_enrolment_uq');
});
