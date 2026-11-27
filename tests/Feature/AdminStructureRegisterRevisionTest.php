<?php

namespace Tests\Feature;

use App\Enums\OrganisationAuditAction;
use App\Models\AcademicProgramme;
use App\Models\AuditLog;
use App\Models\DomainModel;
use App\Models\ProgrammeLevel;
use App\Models\Specialization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class AdminStructureRegisterRevisionTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    #[DataProvider('editableRecords')]
    public function test_same_second_reversal_does_not_revalidate_the_original_revision(
        string $kind,
        string $register,
        string $model,
        string $field,
    ): void {
        $this->academicUser();
        $createdAt = Carbon::parse('2030-05-14 10:30:00');
        $this->travelTo(Carbon::parse('2030-05-15 10:30:00'));
        $record = $model::factory()->create([
            $field => 'Original description',
            'created_at' => $createdAt,
            'updated_at' => now(),
        ]);
        $initial = $this->registerRow($register, $record);
        $url = route('admin.structure.register.update', [$kind, $record->id]);
        $change = array_replace($initial, [$field => 'Corrected description', 'revision_number' => 99]);

        $this->patch($url, $change)->assertSessionHasNoErrors()->assertRedirectToRoute('admin.structure');
        $afterChange = $record->fresh();
        $changed = $this->registerRow($register, $record);
        $this->patch($url, array_replace($initial, ['revision' => $changed['revision']]))
            ->assertSessionHasNoErrors()
            ->assertRedirectToRoute('admin.structure');
        $reversed = $this->registerRow($register, $record);
        $this->patch($url, $change)->assertSessionHasErrors('revision');

        $tokens = [$initial['revision'], $changed['revision'], $reversed['revision']];
        foreach ($tokens as $token) {
            $this->assertMatchesRegularExpression('/\A[a-f0-9]{64}\z/', $token);
        }

        $this->assertCount(3, array_unique($tokens));
        $this->assertArrayNotHasKey('revision_number', $reversed);
        $this->assertSame(2, $afterChange->revision_number);
        $this->assertSame('Corrected description', $afterChange->getAttribute($field));
        $this->assertSame(3, $record->refresh()->revision_number);
        $this->assertSame($initial[$field], $record->getAttribute($field));
        $this->assertEquals($createdAt, $record->created_at);
        $this->assertEquals(now(), $record->updated_at);
        $audits = AuditLog::query()->where('subject_key', $record->getTable().':'.$record->id)->get();
        $this->assertCount(2, $audits);
        foreach ($audits as $audit) {
            $this->assertSame(OrganisationAuditAction::Corrected, $audit->organisation_action);
            $this->assertSame('organisation.corrected', $audit->getRawOriginal('action'));
            $this->assertSame('organisation.corrected', $audit->toArray()['action']);
            $this->assertArrayNotHasKey('revision_number', $audit->details['before']);
            $this->assertArrayNotHasKey('revision_number', $audit->details['after']);
        }
    }

    public function test_a_revision_cannot_be_reused_for_another_row_at_the_same_counter(): void
    {
        $this->academicUser();
        $first = AcademicProgramme::factory()->create(['code' => 'FIRST']);
        $second = AcademicProgramme::factory()->create(['code' => 'SECOND']);
        $firstRow = $this->registerRow('programmes', $first);
        $secondRow = $this->registerRow('programmes', $second);

        $this->assertNotSame($firstRow['revision'], $secondRow['revision']);
        $this->patch(route('admin.structure.register.update', ['shared-programmes', $second->id]), [
            'code' => $second->code,
            'name' => 'Unaccepted correction',
            'revision' => $firstRow['revision'],
        ])->assertSessionHasErrors('revision');

        $this->assertSame($second->name, $second->fresh()->name);
        $this->assertSame(1, $second->fresh()->revision_number);
        $this->assertDatabaseMissing('audit_logs', ['subject_key' => 'academic_programmes:'.$second->id]);
    }

    public static function editableRecords(): array
    {
        return [
            'shared programme' => ['shared-programmes', 'programmes', AcademicProgramme::class, 'name'],
            'programme level' => ['programme-levels', 'levels', ProgrammeLevel::class, 'label'],
            'specialization' => ['specializations', 'specializations', Specialization::class, 'name'],
        ];
    }

    private function registerRow(string $register, DomainModel $record): array
    {
        $page = $this->get(route('admin.structure'))->assertOk()->viewData('page');

        return collect($page['props']['register'][$register])->firstWhere('id', $record->getKey());
    }
}
