<?php

namespace App\Services\Academics;

use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class StructureImportWorkflow
{
    public function __construct(private StructureSpreadsheet $spreadsheet, private StructureImport $import) {}

    /** @return list<string> */
    public function columns(UploadedFile $file): array
    {
        $rows = $this->spreadsheet->read($file);

        return $rows[1];
    }

    public function preview(UploadedFile $file, array $columns, User $actor, string $session): array
    {
        $rows = $this->spreadsheet->read($file);
        $plan = $this->import->plan($rows, $columns);
        $confirmation = $plan['errors'] ? null : $this->confirmation($file, $columns, $actor, $session, $plan);

        return $plan + ['confirmation' => $confirmation];
    }

    public function commit(UploadedFile $file, array $columns, User $actor, string $session, string $confirmation): int
    {
        $rows = $this->spreadsheet->read($file);
        try {
            return DB::transaction(function () use ($file, $columns, $actor, $session, $confirmation, $rows): int {
                $plan = $this->import->plan($rows, $columns, lock: true);
                $expected = $this->confirmation($file, $columns, $actor, $session, $plan);
                if ($plan['errors'] || ! hash_equals($expected, $confirmation)) {
                    throw ValidationException::withMessages(['confirmation' => 'The import has changed. Preview it again before saving.']);
                }

                return $this->import->apply($actor, $plan['items']);
            }, 3);
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['confirmation' => 'The structure has changed. Preview it again before saving.']);
        }
    }

    public function writeTemplate(): void
    {
        $output = fopen('php://output', 'w');
        fputcsv($output, StructureImport::FIELDS, escape: '');
        fputcsv($output, ['faculty', 'FAC', 'Example Faculty', ''], escape: '');
        fputcsv($output, ['department', 'DEPT', 'Example Department', 'FAC'], escape: '');
        fputcsv($output, ['programme', 'PROG', 'Example Programme', 'DEPT'], escape: '');
        fclose($output);
    }

    private function confirmation(UploadedFile $file, array $columns, User $actor, string $session, array $plan): string
    {
        $digest = hash_file('sha256', $file->getPathname());
        $proof = json_encode([$actor->id, $session, $columns, $digest, $plan], JSON_THROW_ON_ERROR);

        return hash_hmac('sha256', $proof, config('app.key'));
    }
}
