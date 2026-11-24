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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('external_student_id')->unique();
            $table->foreignId('user_id')->nullable()->unique()->constrained()->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('offerings', function (Blueprint $table) {
            $table->id();
            $table->string('external_offering_id')->unique();
            $table->timestamps();
        });

        Schema::create('enrolments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->restrictOnDelete();
            $table->foreignId('offering_id')->constrained()->restrictOnDelete();
            $table->string('status');
            $table->unsignedInteger('source_revision');
            $table->timestamps();
            $table->unique(['student_id', 'offering_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrolments');
        Schema::dropIfExists('offerings');
        Schema::dropIfExists('students');
    }
};
