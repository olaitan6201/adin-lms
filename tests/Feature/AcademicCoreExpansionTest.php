<?php

namespace Tests\Feature;

use App\Models\Offering;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class AcademicCoreExpansionTest extends TestCase
{
    use RefreshDatabase;

    public function test_programmes_are_shared_but_pathway_pairs_and_level_codes_are_unique(): void
    {
        $graph = $this->curriculum();
        $first = DB::table('academic_pathways')->where('id', $graph['pathway'])->first();
        $department = DB::table('specializations')->where('id', $first->specialization_id)->value('department_id');
        $secondTrack = $this->insert('specializations', ['department_id' => $department, 'code' => 'SECOND', 'name' => 'Second track']);
        $pathway = ['academic_programme_id' => $graph['programme'], 'specialization_id' => $secondTrack];

        $this->insert('academic_pathways', $pathway);
        $this->reject('academic_pathways', $pathway, 'unique');
        $this->reject('programme_levels', ['academic_programme_id' => $graph['programme'], 'code' => '100', 'label' => 'Duplicate', 'position' => 2], 'unique');

        $this->assertSame(2, DB::table('academic_pathways')->where('academic_programme_id', $graph['programme'])->count());
    }

    public function test_programme_level_and_course_revision_must_match_the_assignment(): void
    {
        $graph = $this->curriculum();
        $other = $this->curriculum();
        $assignment = $graph['assignment'];

        $this->reject('curriculum_courses', array_replace($assignment, ['programme_level_id' => $other['level']]));
        $this->reject('curriculum_courses', array_replace($assignment, ['course_revision_id' => $other['revision']]));
        $this->reject('curriculum_courses', array_replace($assignment, ['category' => null]), 'check');
        $this->reject('curricula', array_replace($graph['version'], ['version' => 2, 'academic_programme_id' => null]), 'check');
        $this->reject('curricula', array_replace($graph['version'], ['version' => 2, 'academic_programme_id' => $other['programme']]));
        $this->insert('curriculum_courses', $assignment);

        $this->assertDatabaseHas('curriculum_courses', ['curriculum_id' => $graph['curriculum'], 'course_revision_id' => $graph['revision']]);
    }

    public function test_choice_options_cannot_cross_versions_or_belong_to_multiple_groups(): void
    {
        $graph = $this->curriculum();
        $other = $this->curriculum();
        $assignment = $this->insert('curriculum_courses', $graph['assignment']);
        $group = ['curriculum_id' => $graph['curriculum'], 'minimum_selections' => 1, 'maximum_selections' => 1];
        $first = $this->insert('curriculum_choice_groups', $group + ['code' => 'first']);
        $second = $this->insert('curriculum_choice_groups', $group + ['code' => 'second']);
        $this->reject('curriculum_choice_groups', array_replace($group, ['code' => 'invalid', 'minimum_selections' => 2]), 'check');
        $otherGroup = $this->insert('curriculum_choice_groups', array_replace($group, ['code' => 'other', 'curriculum_id' => $other['curriculum']]));
        $option = ['curriculum_id' => $graph['curriculum'], 'group_id' => $first, 'curriculum_course_id' => $assignment];

        $this->reject('curriculum_choice_options', array_replace($option, ['group_id' => $otherGroup]));
        $this->reject('curriculum_choice_options', array_replace($option, ['group_id' => $otherGroup, 'curriculum_id' => $other['curriculum']]));
        $this->insert('curriculum_choice_options', $option);
        $this->reject('curriculum_choice_options', array_replace($option, ['group_id' => $second]), 'unique');
    }

    public function test_adoptions_keep_one_operative_decision_for_the_exact_tuple(): void
    {
        $graph = $this->curriculum();
        $other = $this->curriculum();
        $session = $this->insert('academic_sessions', ['label' => '2030/31', 'starts_on' => '2030-09-01', 'ends_on' => '2031-06-30']);
        $cohort = $this->insert('entry_cohorts', ['code' => '2030', 'label' => '2030 entrants']);
        $otherCohort = $this->insert('entry_cohorts', ['code' => '2029', 'label' => '2029 entrants']);
        $tuple = ['academic_pathway_id' => $graph['pathway'], 'academic_session_id' => $session, 'entry_cohort_id' => $cohort];
        $evidence = ['curriculum_id' => $graph['curriculum'], 'approved_by' => User::factory()->create()->id,
            'decision_reference' => 'DEC-1', 'reason' => 'Initial adoption', 'recorded_at' => '2030-08-01 10:00:00'];
        $decision = $this->insert('curriculum_adoption_decisions', $tuple + $evidence);
        $replacement = $this->insert('curriculum_adoption_decisions', $tuple + array_replace($evidence, ['decision_reference' => 'DEC-2']));
        $adoption = $this->insert('curriculum_adoptions', $tuple + ['active_decision_id' => $decision]);

        $this->reject('curriculum_adoptions', $tuple + ['active_decision_id' => $replacement], 'unique');
        $this->reject('curriculum_adoptions', array_replace($tuple, ['entry_cohort_id' => $otherCohort]) + ['active_decision_id' => $replacement]);
        $this->reject('curriculum_adoption_decisions', $tuple + array_replace($evidence, ['curriculum_id' => $other['curriculum']]));
        DB::table('curriculum_adoptions')->where('id', $adoption)->update(['active_decision_id' => $replacement]);

        $this->assertDatabaseHas('curriculum_adoption_decisions', ['id' => $decision]);
        $this->assertDatabaseHas('curriculum_adoptions', ['id' => $adoption, 'active_decision_id' => $replacement]);
    }

    public function test_offering_can_link_multiple_assignments_without_replacing_its_id(): void
    {
        $graph = $this->curriculum();
        $other = $this->curriculum();
        $this->reject('offerings', ['external_offering_id' => 'MISSING-REVISION', 'taught_course_revision_id' => (string) Str::uuid7()]);
        $offering = Offering::forceCreate(['external_offering_id' => 'SHARED-SECTION', 'taught_course_revision_id' => $graph['revision']]);
        $first = $this->insert('curriculum_courses', $graph['assignment']);
        $second = $this->insert('curriculum_courses', array_replace($other['assignment'], [
            'course_id' => $graph['assignment']['course_id'],
            'course_revision_id' => $graph['revision'],
        ]));
        $association = ['offering_id' => $offering->id, 'curriculum_course_id' => $first];

        $this->insert('offering_curriculum_courses', $association);
        $this->insert('offering_curriculum_courses', array_replace($association, ['curriculum_course_id' => $second]));
        $this->reject('offering_curriculum_courses', $association, 'unique');

        $this->assertDatabaseHas('offerings', ['id' => $offering->id, 'external_offering_id' => 'SHARED-SECTION', 'curriculum_course_id' => null]);
        $this->assertSame(2, DB::table('offering_curriculum_courses')->where('offering_id', $offering->id)->count());
    }

    /** @return array<string, mixed> */
    private function curriculum(): array
    {
        $code = (string) Str::uuid7();
        $faculty = $this->insert('faculties', ['code' => $code, 'name' => 'Faculty']);
        $department = $this->insert('departments', ['code' => $code, 'name' => 'Department', 'faculty_id' => $faculty]);
        $legacy = $this->insert('programmes', ['code' => $code, 'name' => 'Legacy', 'department_id' => $department]);
        $legacyLevel = $this->insert('academic_levels', ['label' => $code]);
        $programme = $this->insert('academic_programmes', ['code' => $code, 'name' => 'Programme']);
        $level = $this->insert('programme_levels', ['academic_programme_id' => $programme, 'code' => '100', 'label' => '100', 'position' => 1]);
        $track = $this->insert('specializations', ['department_id' => $department, 'code' => 'TRACK', 'name' => 'Track']);
        $pathway = $this->insert('academic_pathways', ['specialization_id' => $track, 'academic_programme_id' => $programme]);
        $course = $this->insert('courses', ['department_id' => $department, 'code' => $code]);
        $revision = $this->insert('course_revisions', [
            'course_id' => $course, 'revision_number' => 1, 'title' => 'Course', 'description' => 'Description', 'standard_units' => '3.00000000',
        ]);
        $version = ['programme_id' => $legacy, 'version' => 1, 'status' => 'draft',
            'academic_pathway_id' => $pathway, 'academic_programme_id' => $programme];
        $curriculum = $this->insert('curricula', $version);
        $assignment = ['curriculum_id' => $curriculum, 'course_id' => $course, 'title' => 'Legacy title', 'description' => 'Legacy description',
            'credits' => '3.00000000', 'level_id' => $legacyLevel, 'semester_position' => 1, 'compulsory' => true, 'academic_programme_id' => $programme,
            'programme_level_id' => $level, 'course_revision_id' => $revision, 'category' => 'core', 'requirement_mode' => 'individual'];

        return compact('programme', 'level', 'pathway', 'revision', 'version', 'curriculum', 'assignment');
    }

    private function insert(string $table, array $attributes): string
    {
        $id = (string) Str::uuid7();
        DB::table($table)->insert($attributes + ['id' => $id]);

        return $id;
    }

    private function reject(string $table, array $attributes, string $kind = 'foreign'): void
    {
        try {
            DB::transaction(fn () => $this->insert($table, $attributes));
            $this->fail("Invalid {$table} row was accepted.");
        } catch (QueryException $exception) {
            $driver = DB::getDriverName();
            match ($driver) {
                'mysql' => $this->assertSame(['foreign' => 1452, 'unique' => 1062, 'check' => 3819][$kind], $exception->errorInfo[1]),
                'pgsql' => $this->assertSame(['foreign' => '23503', 'unique' => '23505', 'check' => '23514'][$kind], $exception->errorInfo[0]),
                'sqlite' => $this->assertMatchesRegularExpression([
                    'foreign' => '/^FOREIGN KEY constraint failed/',
                    'unique' => '/^UNIQUE constraint failed/',
                    'check' => '/^(Incomplete academic core tuple|Invalid curriculum choice bounds)/',
                ][$kind], $exception->errorInfo[2]),
                default => $this->fail("Unexpected test database driver {$driver}."),
            };
        }
    }
}
