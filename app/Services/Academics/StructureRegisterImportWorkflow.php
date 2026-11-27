<?php

namespace App\Services\Academics;

use App\Enums\OrganisationAuditAction;
use App\Enums\StructureRegisterKind;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Contracts\Database\ConcurrencyErrorDetector;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use PDOException;

final class StructureRegisterImportWorkflow
{
    private const string PROOF_DOMAIN = 'academic-structure-register-import:v1';

    public function __construct(
        private StructureSpreadsheet $spreadsheet,
        private StructureRegisterImportPlan $planner,
        private ConcurrencyErrorDetector $concurrency,
    ) {}

    /** @return list<string> */
    public function columns(UploadedFile $file): array
    {
        return $this->spreadsheet->read($file)[1];
    }

    public function preview(UploadedFile $file, array $columns, User $actor, string $session): array
    {
        $rows = $this->spreadsheet->read($file);
        $mapping = StructureRegisterImportRow::mapping($columns, $rows[1]);
        $plan = $this->planner->build($rows, $mapping);
        $proof = $plan['errors'] ? null : $this->proof($this->digest($file), $mapping, $actor, $session, $plan);

        return $plan + ['confirmation' => $proof];
    }

    public function commit(UploadedFile $file, array $columns, User $actor, string $session, string $confirmation): int
    {
        $rows = $this->spreadsheet->read($file);
        $mapping = StructureRegisterImportRow::mapping($columns, $rows[1]);
        $digest = $this->digest($file);
        try {
            return DB::transaction(function () use ($rows, $mapping, $digest, $actor, $session, $confirmation): int {
                $plan = $this->planner->build($rows, $mapping, lock: true);
                $expected = $this->proof($digest, $mapping, $actor, $session, $plan);
                if ($plan['errors'] || ! hash_equals($expected, $confirmation)) {
                    $this->changed();
                }

                return $this->apply($actor, $plan['items']);
            }, 3);
        } catch (PDOException $exception) {
            if ($exception instanceof UniqueConstraintViolationException || $this->concurrency->causedByConcurrencyError($exception)) {
                $this->changed();
            }

            throw $exception;
        }
    }

    public function writeTemplate(): void
    {
        $output = fopen('php://output', 'w');
        fputcsv($output, StructureRegisterImportRow::FIELDS, escape: '');
        fputcsv($output, [StructureRegisterKind::Programme->value, 'CS', 'Computing', '', '', '', ''], escape: '');
        fputcsv($output, [StructureRegisterKind::Level->value, 'FIRST', 'First year', '', 'CS', '', '1'], escape: '');
        fputcsv($output, [StructureRegisterKind::Specialization->value, 'AI', 'Intelligence', 'EXISTING-DEPARTMENT', '', '', ''], escape: '');
        fputcsv($output, [StructureRegisterKind::Pathway->value, '', '', 'EXISTING-DEPARTMENT', 'CS', 'AI', ''], escape: '');
        fclose($output);
    }

    private function digest(UploadedFile $file): string
    {
        return hash_file('sha256', $file->getPathname());
    }

    private function proof(string $digest, array $mapping, User $actor, string $session, array $plan): string
    {
        $message = json_encode([self::PROOF_DOMAIN, $actor->id, $session, $digest, $mapping, $plan], JSON_THROW_ON_ERROR);

        return hash_hmac('sha256', $message, config('app.key'));
    }

    private function apply(User $actor, array $items): int
    {
        $createdIds = [];
        foreach ($items as $item) {
            if ($item['id'] !== null) {
                continue;
            }
            $attributes = $item['attributes'];
            foreach (['academic_programme_id', 'specialization_id'] as $field) {
                if (is_int($attributes[$field] ?? null)) {
                    $attributes[$field] = $createdIds[$attributes[$field]];
                }
            }
            $kind = StructureRegisterKind::from($item['kind']);
            $model = StructureRegisterImportLookup::model($kind);
            $record = $model::query()->create($attributes);
            $createdIds[$item['line']] = $record->getKey();
            AuditLog::forceCreate([
                'actor_id' => $actor->id,
                'subject_key' => $record->getTable().':'.$record->getKey(),
                'action' => OrganisationAuditAction::Imported,
                'occurred_at' => now(),
                'details' => ['row' => $item['line'], 'kind' => $kind->value, 'attributes' => $attributes],
            ]);
        }

        return count($createdIds);
    }

    private function changed(): never
    {
        throw ValidationException::withMessages(['confirmation' => 'The register import has changed. Preview it again before saving.']);
    }
}
