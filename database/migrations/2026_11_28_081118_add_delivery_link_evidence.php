<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('ALTER TABLE offering_curriculum_courses ADD COLUMN linked_by VARCHAR NULL REFERENCES users (id)');
            DB::statement('ALTER TABLE offering_curriculum_courses ADD COLUMN confirmation_note VARCHAR(191) NULL');
            DB::statement('ALTER TABLE offering_curriculum_courses ADD COLUMN confirmed_at DATETIME NULL');
            DB::statement('ALTER TABLE offering_curriculum_courses ADD COLUMN created_at DATETIME NULL');

            return;
        }

        Schema::table('offering_curriculum_courses', function (Blueprint $table): void {
            $table->foreignUuid('linked_by')->nullable()->constrained('users');
            $table->string('confirmation_note')->nullable();
            $table->timestampTz('confirmed_at')->nullable();
            $table->timestampTz('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        throw new LogicException('Delivery link evidence is forward-only.');
    }
};
