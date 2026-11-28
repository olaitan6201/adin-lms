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
        Schema::create('official_registrations', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('registration_code', 128);
            $table->char('registration_key', 64)->unique();
            $table->foreignUuid('student_id')->constrained();
            $table->timestampTz('created_at');
        });

        Schema::create('placement_updates', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('official_registration_id')->constrained();
            $table->unsignedInteger('update_number');
            $table->foreignUuid('academic_pathway_id')->constrained();
            $table->foreignUuid('academic_session_id')->constrained();
            $table->foreignUuid('entry_cohort_id')->constrained();
            $table->foreignUuid('programme_level_id')->constrained();
            $table->date('effective_on');
            $table->foreignUuid('submitted_by')->constrained('users');
            $table->timestampTz('created_at');
            $table->unique(['official_registration_id', 'update_number'], 'placement_updates_registration_number_unique');
        });

        Schema::create('placement_acceptances', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('placement_update_id')->unique()->constrained();
            $table->foreignUuid('curriculum_adoption_decision_id')->constrained(indexName: 'placement_acceptances_decision_fk');
            $table->foreignUuid('approved_by')->constrained('users');
            $table->timestampTz('approved_at');
            $table->timestampTz('effective_at');
            $table->string('approval_note')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new LogicException('The official placement review register is forward-only.');
    }
};
