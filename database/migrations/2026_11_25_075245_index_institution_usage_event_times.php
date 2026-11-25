<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('login_events', fn (Blueprint $table) => $table->index(['outcome', 'occurred_at', 'user_id'], 'usage_auth_window_idx'));
        Schema::table('submission_versions', fn (Blueprint $table) => $table->index('submitted_at', 'usage_submission_window_idx'));
        Schema::table('examination_attempts', fn (Blueprint $table) => $table->index('started_at', 'usage_exam_window_idx'));
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('login_events', fn (Blueprint $table) => $table->dropIndex('usage_auth_window_idx'));
        Schema::table('submission_versions', fn (Blueprint $table) => $table->dropIndex('usage_submission_window_idx'));
        Schema::table('examination_attempts', fn (Blueprint $table) => $table->dropIndex('usage_exam_window_idx'));
    }
};
