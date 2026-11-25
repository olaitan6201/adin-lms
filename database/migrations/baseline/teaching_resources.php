<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('teaching_plans', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('offering_id')->constrained();
    $table->foreignUuid('author_id')->constrained('users');
    $table->integer('revision');
    $table->string('status');
    $table->jsonb('snapshot');
    $table->timestampTz('submitted_at');
    $table->foreignUuid('reviewer_id')->nullable()->constrained('users');
    $table->timestampTz('reviewed_at')->nullable();
    $table->text('reason')->nullable();
    $table->unique(['offering_id', 'revision']);
});

Schema::create('student_photos', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('student_id')->unique()->constrained('students')->cascadeOnDelete();
    $table->mediumText('jpeg_base64');
});

Schema::create('scorm_packages', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('offering_id')->constrained();
    $table->string('title', 160);
    $table->text('lesson');
    $table->unique(['offering_id', 'title']);
});

Schema::create('scorm_progress', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('package_id')->constrained('scorm_packages');
    $table->foreignUuid('enrolment_id')->constrained();
    $table->text('state');
    $table->string('grant_hash', 64)->nullable();
    $table->timestamp('expires_at');
    $table->unique(['package_id', 'enrolment_id']);
});
