<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();
        if (! in_array($driver, ['pgsql', 'sqlite', 'mysql'], true)) {
            throw new LogicException('Unsupported LMS database engine.');
        }

        if ($driver === 'mysql' && version_compare(DB::connection()->getServerVersion(), '8.0.16', '<')) {
            throw new LogicException('MySQL 8.0.16 or later is required for enforced CHECK constraints.');
        }

        if (Schema::hasTable('users')) {
            throw new LogicException('Install this baseline in a new database; preserve existing pilot data.');
        }

        Schema::create('faculties', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
        });

        Schema::create('departments', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('faculty_id')->constrained('faculties');
            $table->string('code')->unique();
            $table->string('name');
        });

        Schema::create('programmes', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('department_id')->constrained('departments');
            $table->string('code')->unique();
            $table->string('name');
        });

        Schema::create('academic_levels', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('label')->unique();
        });

        Schema::create('academic_sessions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('label')->unique();
            $table->date('starts_on');
            $table->date('ends_on');
        });

        Schema::create('semesters', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('session_id')->constrained('academic_sessions');
            $table->integer('position');
            $table->date('starts_on');
            $table->date('ends_on');
            $table->unique(['session_id', 'position'], 'semesters_session_position_uq');
        });

        Schema::create('files', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('object_key')->unique();
            $table->string('filename');
            $table->string('media_type');
            $table->bigInteger('size_bytes');
            $table->string('checksum');
            $table->string('validation_status');
        });

        Schema::create('users', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->string('full_name');
            $table->string('password_hash')->nullable();
            $table->foreignUuid('photo_id')->nullable()->constrained('files');
            $table->string('status')->default('active');
            $table->unsignedInteger('auth_version')->default(1);
            $table->rememberToken();
            $table->timestampTz('email_verified_at')->nullable();
            $table->timestampTz('created_at')->nullable();
            $table->timestampTz('updated_at')->nullable();
        });

        Schema::create('login_events', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users');
            $table->timestampTz('occurred_at');
            $table->string('outcome');
            $table->index(['user_id', 'occurred_at'], 'login_events_user_id_occurred_at_idx');
            $table->index(['outcome', 'occurred_at', 'user_id'], 'usage_auth_window_idx');
        });

        Schema::create('auth_sessions', function (Blueprint $table) use ($driver): void {
            $table->uuid('id')->primary();
            $table->string('token_digest')->collation($driver === 'mysql' ? 'utf8mb4_bin' : null)->unique();
            $table->foreignUuid('user_id')->constrained('users');
            $table->timestampTz('last_seen');
            $table->timestampTz('expires_at');
            $table->timestampTz('revoked_at')->nullable();
        });

        Schema::create('credentials', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users');
            $table->string('kind');
            $table->text('protected_value');
            $table->char('lookup_digest', 64);
            $table->timestampTz('expires_at')->nullable();
            $table->unique(['kind', 'lookup_digest'], 'credentials_kind_lookup_digest_uq');
        });

        Schema::create('roles', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
        });

        Schema::create('permissions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
        });

        Schema::create('role_permissions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('role_id')->constrained('roles');
            $table->foreignUuid('permission_id')->constrained('permissions');
            $table->unique(['role_id', 'permission_id'], 'role_permissions_role_permission_uq');
        });

        Schema::create('students', function (Blueprint $table) use ($driver): void {
            $table->uuid('id')->primary();
            $table->string('external_student_id')->collation($driver === 'mysql' ? 'utf8mb4_bin' : null)->unique();
            $table->foreignUuid('user_id')->nullable()->unique()->constrained('users');
            $table->string('matric_number')->nullable()->unique();
            $table->string('source_name')->nullable();
            $table->string('source_email')->nullable();
            $table->string('status')->nullable();
            $table->timestampTz('created_at')->nullable();
            $table->timestampTz('updated_at')->nullable();
        });

        Schema::create('student_sessions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('students');
            $table->foreignUuid('session_id')->constrained('academic_sessions');
            $table->foreignUuid('programme_id')->constrained('programmes');
            $table->foreignUuid('level_id')->constrained('academic_levels');
            $table->unique(['student_id', 'session_id'], 'student_sessions_student_session_uq');
        });

        Schema::create('lecturers', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users');
            $table->string('staff_number')->unique();
            $table->foreignUuid('department_id')->constrained('departments');
        });

        Schema::create('guardian_access', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('guardian_id')->constrained('users');
            $table->foreignUuid('student_id')->constrained('students');
            $table->foreignUuid('approved_by')->constrained('users');
            $table->jsonb('allowed_fields');
            $table->timestampTz('revoked_at')->nullable();
            $table->unique(['guardian_id', 'student_id'], 'guardian_access_guardian_student_uq');
        });

        Schema::create('curricula', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('programme_id')->constrained('programmes');
            $table->integer('version');
            $table->string('framework_revision')->nullable();
            $table->string('status');
            $table->foreignUuid('approved_by')->nullable()->constrained('users');
            $table->timestampTz('approved_at')->nullable();
            $table->unique(['programme_id', 'version'], 'curricula_programme_version_uq');
        });

        Schema::create('courses', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('department_id')->constrained('departments');
            $table->string('code')->unique();
        });

        Schema::create('curriculum_courses', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('curriculum_id')->constrained('curricula');
            $table->foreignUuid('course_id')->constrained('courses');
            $table->string('title');
            $table->text('description');
            $table->text('outline')->nullable();
            $table->decimal('credits', 24, 8);
            $table->foreignUuid('level_id')->constrained('academic_levels');
            $table->integer('semester_position');
            $table->boolean('compulsory');
            $table->unique(['curriculum_id', 'course_id'], 'curriculum_courses_curriculum_course_uq');
        });

        Schema::create('prerequisites', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('curriculum_course_id')->constrained('curriculum_courses');
            $table->foreignUuid('required_course_id')->constrained('courses');
            $table->unique(['curriculum_course_id', 'required_course_id'], 'prerequisites_curriculum_course_required_course_uq');
        });

        Schema::create('programme_outcomes', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('curriculum_id')->constrained('curricula');
            $table->text('statement');
        });

        Schema::create('course_outcomes', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('curriculum_course_id')->constrained('curriculum_courses');
            $table->text('statement');
        });

        Schema::create('outcome_mappings', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('course_outcome_id')->constrained('course_outcomes');
            $table->foreignUuid('programme_outcome_id')->constrained('programme_outcomes');
            $table->unique(['course_outcome_id', 'programme_outcome_id'], 'outcome_mappings_course_outcome_programme_outcome_uq');
        });

        Schema::create('offerings', function (Blueprint $table) use ($driver): void {
            $table->uuid('id');
            $table->primary('id');
            $table->string('external_offering_id')->nullable()->collation($driver === 'mysql' ? 'utf8mb4_bin' : null)->unique();
            $table->foreignUuid('curriculum_course_id')->nullable()->constrained('curriculum_courses');
            $table->foreignUuid('semester_id')->nullable()->constrained('semesters');
            $table->string('section')->nullable();
            $table->string('status')->default('draft');
            $table->string('delivery_mode')->nullable();
            $table->jsonb('activity_order')->nullable();
            $table->foreignUuid('approved_by')->nullable()->constrained('users');
            $table->timestampTz('approved_at')->nullable();
            $table->foreignUuid('copied_from')->nullable()->constrained('offerings');
            $table->timestampTz('created_at')->nullable();
            $table->timestampTz('updated_at')->nullable();
            $table->unique(['semester_id', 'curriculum_course_id', 'section'], 'offerings_semester_curriculum_course_section_uq');
        });

        Schema::create('teaching_allocations', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('lecturer_id')->constrained('lecturers');
            $table->foreignUuid('offering_id')->constrained('offerings');
            $table->unique(['lecturer_id', 'offering_id'], 'teaching_allocations_lecturer_offering_uq');
        });

        Schema::create('enrolments', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('offering_id')->constrained('offerings');
            $table->foreignUuid('student_id')->constrained('students');
            $table->string('status');
            $table->integer('source_revision');
            $table->timestampTz('enrolled_at')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->timestampTz('created_at')->nullable();
            $table->timestampTz('updated_at')->nullable();
            $table->unique(['offering_id', 'student_id'], 'enrolments_offering_student_uq');
            $table->index(['student_id', 'status'], 'enrolments_student_id_status_idx');
        });

        Schema::create('modules', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('offering_id')->constrained('offerings');
            $table->integer('position');
            $table->string('title');
            $table->string('kind');
            $table->text('body')->nullable();
            $table->timestampTz('opens_at')->nullable();
            $table->timestampTz('closes_at')->nullable();
            $table->unique(['offering_id', 'position'], 'modules_offering_position_uq');
        });

        Schema::create('learning_materials', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('module_id')->constrained('modules');
            $table->string('title');
            $table->timestampTz('opens_at')->nullable();
            $table->timestampTz('closes_at')->nullable();
            $table->boolean('download_allowed');
            $table->jsonb('restrictions')->nullable();
        });

        Schema::create('material_versions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('material_id')->constrained('learning_materials');
            $table->integer('revision');
            $table->foreignUuid('file_id')->nullable()->constrained('files');
            $table->text('external_url')->nullable();
            $table->text('body')->nullable();
            $table->timestampTz('created_at');
            $table->foreignUuid('created_by')->constrained('users');
            $table->foreignUuid('caption_file_id')->nullable()->constrained('files');
            $table->text('transcript')->nullable();
            $table->unique(['material_id', 'revision'], 'material_versions_material_revision_uq');
        });

        Schema::create('lesson_progress', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('enrolment_id')->constrained('enrolments');
            $table->foreignUuid('module_id')->constrained('modules');
            $table->timestampTz('last_seen');
            $table->timestampTz('completed_at')->nullable();
            $table->unique(['enrolment_id', 'module_id'], 'lesson_progress_enrolment_module_uq');
        });

        Schema::create('classes', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('offering_id')->constrained('offerings');
            $table->string('title');
            $table->string('status');
            $table->timestampTz('starts_at');
            $table->timestampTz('ends_at');
            $table->text('meeting_url')->nullable();
            $table->foreignUuid('recording_material_id')->nullable()->constrained('learning_materials');
            $table->index(['offering_id', 'starts_at'], 'classes_offering_id_starts_at_idx');
        });

        Schema::create('attendance', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('class_id')->constrained('classes');
            $table->foreignUuid('user_id')->constrained('users');
            $table->string('status');
            $table->string('method');
            $table->foreignUuid('recorded_by')->nullable()->constrained('users');
            $table->timestampTz('recorded_at');
            $table->unique(['class_id', 'user_id'], 'attendance_class_user_uq');
        });

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

        Schema::create('announcements', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('offering_id')->nullable()->constrained('offerings');
            $table->foreignUuid('author_id')->constrained('users');
            $table->text('body');
            $table->timestampTz('published_at')->nullable();
        });

        Schema::create('forums', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('offering_id')->constrained('offerings');
            $table->foreignUuid('group_id')->nullable()->constrained('study_groups');
            $table->string('title');
        });

        Schema::create('posts', function (Blueprint $table): void {
            $table->uuid('id');
            $table->primary('id');
            $table->foreignUuid('forum_id')->constrained('forums');
            $table->foreignUuid('parent_id')->nullable()->constrained('posts');
            $table->foreignUuid('author_id')->constrained('users');
            $table->text('body');
            $table->timestampTz('posted_at');
            $table->string('moderation_state');
            $table->index(['forum_id', 'posted_at'], 'posts_forum_id_posted_at_idx');
        });

        Schema::create('private_messages', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('sender_id')->constrained('users');
            $table->foreignUuid('recipient_id')->constrained('users');
            $table->timestampTz('sent_at');
            $table->text('body');
            $table->index(['recipient_id', 'sent_at'], 'private_messages_recipient_id_sent_at_idx');
        });

        Schema::create('notifications', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('recipient_id')->constrained('users');
            $table->string('event_key');
            $table->text('body');
            $table->timestampTz('created_at');
            $table->timestampTz('read_at')->nullable();
            $table->unique(['recipient_id', 'event_key'], 'notifications_recipient_event_key_uq');
            $table->index(['recipient_id', 'read_at', 'created_at'], 'notifications_recipient_id_read_at_created_at_idx');
        });

        Schema::create('notification_deliveries', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('notification_id')->constrained('notifications');
            $table->string('channel');
            $table->string('status');
            $table->timestampTz('next_attempt_at')->nullable();
            $table->integer('attempt_count')->default(0);
            $table->timestampTz('delivered_at')->nullable();
            $table->string('last_error_code')->nullable();
            $table->unique(['notification_id', 'channel'], 'notification_deliveries_notification_channel_uq');
            $table->index(['status', 'next_attempt_at'], 'notification_deliveries_status_next_attempt_at_idx');
        });

        Schema::create('system_configuration', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('key')->unique();
            $table->jsonb('value');
            $table->foreignUuid('updated_by')->constrained('users');
        });

        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('actor_id')->nullable()->constrained('users');
            $table->foreignUuid('attempt_id')->nullable()->constrained('examination_attempts');
            $table->timestampTz('occurred_at');
            $table->string('action');
            $table->string('subject_key');
            $table->jsonb('details')->nullable();
            $table->index(['subject_key', 'occurred_at'], 'audit_logs_subject_key_occurred_at_idx');
            $table->index(['attempt_id', 'occurred_at'], 'audit_logs_attempt_id_occurred_at_idx');
            $table->index(['actor_id', 'occurred_at'], 'audit_logs_actor_id_occurred_at_idx');
        });

        Schema::create('privacy_case_files', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('reference')->unique();
            $table->string('kind');
            $table->string('stage');
            $table->string('evidence');
            $table->foreignUuid('owner_id')->constrained('users');
            $table->foreignUuid('subject_id')->nullable()->constrained('users');
            $table->timestampsTz();
            $table->index(['subject_id', 'kind', 'stage'], 'privacy_cases_subject_kind_stage_idx');
        });

        Schema::create('privacy_consents', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users');
            $table->string('purpose');
            $table->string('notice_version');
            $table->timestampTz('granted_at');
            $table->timestampTz('withdrawn_at')->nullable();
        });

        Schema::create('access_scopes', function (Blueprint $table) use ($driver): void {
            $table->uuid('id')->primary();
            $table->string('scope_key')->collation($driver === 'mysql' ? 'utf8mb4_bin' : null)->unique();
            $table->foreignUuid('faculty_id')->nullable()->unique()->constrained('faculties');
            $table->foreignUuid('department_id')->nullable()->unique()->constrained('departments');
            $table->foreignUuid('offering_id')->nullable()->unique()->constrained('offerings');
        });

        Schema::create('role_grants', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users');
            $table->foreignUuid('role_id')->constrained('roles');
            $table->foreignUuid('scope_id')->constrained('access_scopes');
            $table->unique(['user_id', 'role_id', 'scope_id'], 'role_grants_user_role_scope_uq');
        });

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

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUuid('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->bigInteger('expiration')->index();
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->bigInteger('expiration')->index();
        });

        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedSmallInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->string('connection');
            $table->string('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();

            $table->index(['connection', 'queue', 'failed_at']);
        });

        $this->enforce('offerings',
            "status <> 'published' OR (curriculum_course_id IS NOT NULL AND semester_id IS NOT NULL AND section IS NOT NULL AND delivery_mode IS NOT NULL AND approved_by IS NOT NULL AND approved_at IS NOT NULL)",
            "NEW.status <> 'published' OR (NEW.curriculum_course_id IS NOT NULL AND NEW.semester_id IS NOT NULL AND NEW.section IS NOT NULL AND NEW.delivery_mode IS NOT NULL AND NEW.approved_by IS NOT NULL AND NEW.approved_at IS NOT NULL)",
        );
        $this->enforce('submissions',
            '(enrolment_id IS NULL) <> (group_id IS NULL)',
            '(NEW.enrolment_id IS NULL) <> (NEW.group_id IS NULL)',
        );
        $this->enforce('exam_slots',
            '(fixed_version_id IS NULL) <> (draw_from_bank_id IS NULL)',
            '(NEW.fixed_version_id IS NULL) <> (NEW.draw_from_bank_id IS NULL)',
        );
        $this->enforce('grades',
            'published_at IS NULL OR (approved_by IS NOT NULL AND approved_at <= published_at AND approved_at IS NOT NULL)',
            'NEW.published_at IS NULL OR (NEW.approved_by IS NOT NULL AND NEW.approved_at <= NEW.published_at AND NEW.approved_at IS NOT NULL)',
        );
        $this->enforce('access_scopes',
            "(scope_key = 'institution' AND faculty_id IS NULL AND department_id IS NULL AND offering_id IS NULL) OR (faculty_id IS NOT NULL AND scope_key = CONCAT('faculty:', faculty_id) AND department_id IS NULL AND offering_id IS NULL) OR (department_id IS NOT NULL AND scope_key = CONCAT('department:', department_id) AND faculty_id IS NULL AND offering_id IS NULL) OR (offering_id IS NOT NULL AND scope_key = CONCAT('offering:', offering_id) AND faculty_id IS NULL AND department_id IS NULL)",
            "(NEW.scope_key = 'institution' AND NEW.faculty_id IS NULL AND NEW.department_id IS NULL AND NEW.offering_id IS NULL) OR (NEW.faculty_id IS NOT NULL AND NEW.scope_key = ('faculty:' || NEW.faculty_id) AND NEW.department_id IS NULL AND NEW.offering_id IS NULL) OR (NEW.department_id IS NOT NULL AND NEW.scope_key = ('department:' || NEW.department_id) AND NEW.faculty_id IS NULL AND NEW.offering_id IS NULL) OR (NEW.offering_id IS NOT NULL AND NEW.scope_key = ('offering:' || NEW.offering_id) AND NEW.faculty_id IS NULL AND NEW.department_id IS NULL)",
        );
    }

    // Blueprint has no CHECK command. SQLite cannot add CHECK with ALTER TABLE.
    private function enforce(string $table, string $condition, string $newRowCondition): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE {$table} ADD CONSTRAINT {$table}_valid CHECK ({$condition})");

            return;
        }

        foreach (['INSERT', 'UPDATE'] as $event) {
            DB::statement("CREATE TRIGGER {$table}_valid_{$event} BEFORE {$event} ON {$table}
                WHEN NOT ({$newRowCondition}) BEGIN SELECT RAISE(ABORT, 'Invalid {$table} row'); END");
        }
    }

    public function down(): void
    {
        Schema::drop('failed_jobs');
        Schema::drop('scorm_progress');
        Schema::drop('scorm_packages');
        Schema::drop('teaching_plans');
        Schema::drop('student_photos');
        Schema::drop('job_batches');
        Schema::drop('jobs');
        Schema::drop('cache_locks');
        Schema::drop('cache');
        Schema::drop('sessions');
        Schema::drop('password_reset_tokens');
        Schema::drop('role_grants');
        Schema::drop('access_scopes');
        Schema::drop('privacy_consents');
        Schema::drop('privacy_case_files');
        Schema::drop('audit_logs');
        Schema::drop('system_configuration');
        Schema::drop('notification_deliveries');
        Schema::drop('notifications');
        Schema::drop('private_messages');
        Schema::drop('posts');
        Schema::drop('forums');
        Schema::drop('announcements');
        Schema::drop('grade_inputs');
        Schema::drop('grades');
        Schema::drop('assessment_criterion_feedback');
        Schema::drop('grading_policy_items');
        Schema::drop('assessment_scores');
        Schema::drop('examination_responses');
        Schema::drop('attempt_questions');
        Schema::drop('examination_attempts');
        Schema::drop('accommodations');
        Schema::drop('exam_slots');
        Schema::drop('examinations');
        Schema::drop('question_versions');
        Schema::drop('questions');
        Schema::drop('question_banks');
        Schema::drop('submission_recipients');
        Schema::drop('submission_files');
        Schema::drop('submission_versions');
        Schema::drop('submissions');
        Schema::drop('group_members');
        Schema::drop('study_groups');
        Schema::drop('assignment_references');
        Schema::drop('assignments');
        Schema::drop('assessment_items');
        Schema::drop('gradebooks');
        Schema::drop('grade_boundaries');
        Schema::drop('grading_policies');
        Schema::drop('attendance');
        Schema::drop('classes');
        Schema::drop('lesson_progress');
        Schema::drop('material_versions');
        Schema::drop('learning_materials');
        Schema::drop('modules');
        Schema::drop('enrolments');
        Schema::drop('teaching_allocations');
        Schema::drop('offerings');
        Schema::drop('outcome_mappings');
        Schema::drop('course_outcomes');
        Schema::drop('programme_outcomes');
        Schema::drop('prerequisites');
        Schema::drop('curriculum_courses');
        Schema::drop('courses');
        Schema::drop('curricula');
        Schema::drop('guardian_access');
        Schema::drop('lecturers');
        Schema::drop('student_sessions');
        Schema::drop('students');
        Schema::drop('role_permissions');
        Schema::drop('permissions');
        Schema::drop('roles');
        Schema::drop('credentials');
        Schema::drop('auth_sessions');
        Schema::drop('login_events');
        Schema::drop('users');
        Schema::drop('files');
        Schema::drop('semesters');
        Schema::drop('academic_sessions');
        Schema::drop('academic_levels');
        Schema::drop('programmes');
        Schema::drop('departments');
        Schema::drop('faculties');
    }
};
