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
        foreach (['course_revisions', 'curricula', 'curriculum_courses', 'curriculum_adoptions'] as $name) {
            Schema::table($name, function (Blueprint $table): void {
                $table->timestampsTz();
            });
        }

        foreach (['courses', 'entry_cohorts', 'curriculum_choice_groups', 'curriculum_choice_options'] as $name) {
            Schema::table($name, function (Blueprint $table): void {
                $table->timestampTz('created_at')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new LogicException('Academic lifecycle timestamps are forward-only; use a reviewed forward fix or restore.');
    }
};
