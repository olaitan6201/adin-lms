<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

Schema::create('grading_policies', function (Blueprint $table): void {
    $table->uuid('id');
    $table->primary('id');
    $table->foreignUuid('offering_id')->nullable()->constrained('offerings');
    $table->foreignUuid('supersedes_id')->nullable()->constrained('grading_policies');
    $table->foreignUuid('created_by')->nullable()->constrained('users');
    $table->timestampTz('created_at')->nullable();
    $table->text('amendment_reason')->nullable();
    $table->index(['offering_id', 'version'], 'grading_policies_offering_version_idx');
    $table->string('name');
    $table->integer('version');
    $table->string('rounding_rule');
    $table->unique(['name', 'version'], 'grading_policies_name_version_uq');
});

Schema::create('grade_boundaries', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('policy_id')->constrained('grading_policies');
    $table->decimal('minimum_percent', 24, 8);
    $table->string('grade');
    $table->unique(['policy_id', 'minimum_percent'], 'grade_boundaries_policy_minimum_percent_uq');
});

Schema::create('gradebooks', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('offering_id')->unique()->constrained('offerings');
    $table->foreignUuid('policy_id')->constrained('grading_policies');
});

Schema::create('assessment_items', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('gradebook_id')->constrained('gradebooks');
    $table->foreignUuid('module_id')->nullable()->constrained('modules');
    $table->string('title');
    $table->string('kind');
    $table->decimal('weight_percent', 24, 8);
    $table->decimal('maximum_score', 24, 8);
    $table->jsonb('rubric')->nullable();
});
