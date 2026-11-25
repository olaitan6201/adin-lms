<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('question_banks', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('course_id')->constrained('courses');
    $table->string('topic');
    $table->unique(['course_id', 'topic'], 'question_banks_course_topic_uq');
});

Schema::create('questions', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('bank_id')->constrained('question_banks');
    $table->index(['bank_id'], 'questions_bank_id_idx');
});

Schema::create('question_versions', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('question_id')->constrained('questions');
    $table->integer('revision');
    $table->string('kind');
    $table->text('prompt');
    $table->jsonb('options')->nullable();
    $table->jsonb('marking_key')->nullable();
    $table->unique(['question_id', 'revision'], 'question_versions_question_revision_uq');
});

Schema::create('examinations', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('item_id')->unique()->constrained('assessment_items');
    $table->timestampTz('opens_at');
    $table->timestampTz('closes_at');
    $table->integer('duration_seconds');
    $table->integer('max_attempts');
    $table->boolean('shuffle_options');
    $table->jsonb('security_policy')->nullable();
});

Schema::create('exam_slots', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('exam_id')->constrained('examinations');
    $table->integer('position');
    $table->foreignUuid('fixed_version_id')->nullable()->constrained('question_versions');
    $table->foreignUuid('draw_from_bank_id')->nullable()->constrained('question_banks');
    $table->decimal('points', 24, 8);
    $table->unique(['exam_id', 'position'], 'exam_slots_exam_position_uq');
});

Schema::create('accommodations', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('exam_id')->constrained('examinations');
    $table->foreignUuid('enrolment_id')->constrained('enrolments');
    $table->foreignUuid('approved_by')->constrained('users');
    $table->jsonb('overrides');
    $table->unique(['exam_id', 'enrolment_id'], 'accommodations_exam_enrolment_uq');
});

Schema::create('examination_attempts', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->jsonb('visibility_receipts')->nullable();
    $table->foreignUuid('exam_id')->constrained('examinations');
    $table->foreignUuid('enrolment_id')->constrained('enrolments');
    $table->integer('ordinal');
    $table->timestampTz('started_at');
    $table->timestampTz('expires_at');
    $table->timestampTz('submitted_at')->nullable();
    $table->string('state');
    $table->unique(['exam_id', 'enrolment_id', 'ordinal'], 'examination_attempts_exam_enrolment_ordinal_uq');
    $table->index(['state', 'expires_at'], 'examination_attempts_state_expires_at_idx');
    $table->index('started_at', 'usage_exam_window_idx');
});

Schema::create('attempt_questions', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('attempt_id')->constrained('examination_attempts');
    $table->integer('position');
    $table->foreignUuid('version_id')->constrained('question_versions');
    $table->jsonb('option_order')->nullable();
    $table->decimal('possible_points', 24, 8);
    $table->decimal('awarded_points', 24, 8)->nullable();
    $table->unique(['attempt_id', 'position'], 'attempt_questions_attempt_position_uq');
});

Schema::create('examination_responses', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('attempt_question_id')->constrained('attempt_questions');
    $table->integer('revision');
    $table->jsonb('answer');
    $table->timestampTz('saved_at');
    $table->unique(['attempt_question_id', 'revision'], 'examination_responses_attempt_question_revision_uq');
});
