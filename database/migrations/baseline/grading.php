<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('assessment_scores', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('item_id')->constrained('assessment_items');
    $table->foreignUuid('enrolment_id')->constrained('enrolments');
    $table->integer('revision');
    $table->decimal('points', 24, 8);
    $table->foreignUuid('submission_version_id')->nullable()->constrained('submission_versions');
    $table->foreignUuid('attempt_id')->nullable()->constrained('examination_attempts');
    $table->foreignUuid('marked_file_id')->nullable()->constrained('files');
    $table->text('feedback')->nullable();
    $table->foreignUuid('changed_by')->nullable()->constrained('users');
    $table->timestampTz('changed_at');
    $table->text('reason');
    $table->timestampTz('released_at')->nullable();
    $table->unique(['item_id', 'enrolment_id', 'revision'], 'assessment_scores_item_enrolment_revision_uq');
});

Schema::create('grading_policy_items', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('policy_id')->constrained('grading_policies');
    $table->foreignUuid('assessment_item_id')->constrained('assessment_items');
    $table->unsignedInteger('position');
    $table->string('title');
    $table->string('kind');
    $table->decimal('weight_percent', 24, 8);
    $table->decimal('maximum_score', 24, 8);
    $table->json('rubric')->nullable();
    $table->unique(['policy_id', 'assessment_item_id'], 'grading_policy_items_policy_item_uq');
    $table->index(['policy_id', 'position'], 'grading_policy_items_policy_position_idx');
});

Schema::create('assessment_criterion_feedback', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('score_id')->constrained('assessment_scores');
    $table->string('criterion_key');
    $table->string('criterion_title');
    $table->text('criterion_description')->nullable();
    $table->string('level_key');
    $table->string('level_label');
    $table->text('level_description')->nullable();
    $table->decimal('points', 24, 8);
    $table->text('feedback')->nullable();
    $table->unsignedInteger('position');
    $table->unique(['score_id', 'criterion_key'], 'assessment_criterion_feedback_score_criterion_uq');
    $table->index(['score_id', 'position'], 'assessment_criterion_feedback_score_position_idx');
});

Schema::create('grades', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('enrolment_id')->constrained('enrolments');
    $table->foreignUuid('policy_id')->constrained('grading_policies');
    $table->integer('revision');
    $table->decimal('total_percent', 24, 8);
    $table->string('grade');
    $table->foreignUuid('moderated_by')->nullable()->constrained('users');
    $table->timestampTz('moderated_at')->nullable();
    $table->string('moderation_status')->default('pending');
    $table->text('moderation_note')->nullable();
    $table->foreignUuid('approved_by')->nullable()->constrained('users');
    $table->timestampTz('approved_at')->nullable();
    $table->timestampTz('published_at')->nullable();
    $table->unique(['enrolment_id', 'revision'], 'grades_enrolment_revision_uq');
});

Schema::create('grade_inputs', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('grade_id')->constrained('grades');
    $table->foreignUuid('score_id')->constrained('assessment_scores');
    $table->decimal('applied_weight', 24, 8);
    $table->decimal('maximum_score', 24, 8);
    $table->unique(['grade_id', 'score_id'], 'grade_inputs_grade_score_uq');
});
