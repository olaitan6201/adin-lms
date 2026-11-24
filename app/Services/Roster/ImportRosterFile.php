<?php

namespace App\Services\Roster;

use App\Enums\EnrolmentStatus;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use SplFileObject;

final class ImportRosterFile
{
    private const HEADER = ['student_id', 'offering_id', 'status', 'revision'];

    public function import(string $path): int
    {
        if (! is_file($path) || ! is_readable($path)) {
            throw new DomainException('Provide a readable local CSV file.');
        }

        $file = new SplFileObject($path, 'r');
        if ($file->fgetcsv(',', '"', '') !== self::HEADER) {
            throw new DomainException('Expected CSV header: '.implode(',', self::HEADER));
        }

        return DB::transaction(function () use ($file) {
            $changed = 0;
            $record = 1;
            while (! $file->eof()) {
                $row = $file->fgetcsv(',', '"', '');
                $record++;
                if ($row === [null] || $row === false) {
                    continue;
                }
                if (count($row) !== 4 || ! $this->validId($row[0]) || ! $this->validId($row[1])) {
                    throw new DomainException("Record {$record}: expected four fields and valid identifiers.");
                }

                [$student, $offering, $state, $revision] = $row;
                $status = EnrolmentStatus::tryFrom($state);
                if (! $status || ! preg_match('/^[1-9][0-9]{0,8}$/D', $revision)) {
                    throw new DomainException("Record {$record}: invalid status or revision.");
                }
                $changed += (int) $this->apply($student, $offering, $status, (int) $revision, $record);
            }

            return $changed;
        });
    }

    private function validId(string $value): bool
    {
        return (bool) preg_match('/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/D', $value);
    }

    private function apply(string $student, string $offering, EnrolmentStatus $status, int $revision, int $record): bool
    {
        $now = now();
        $timestamps = ['created_at' => $now, 'updated_at' => $now];
        DB::table('students')->insertOrIgnore(['id' => (string) Str::uuid7(), 'external_student_id' => $student] + $timestamps);
        $studentId = DB::table('students')->where('external_student_id', $student)->lockForUpdate()->firstOrFail()->id;
        DB::table('offerings')->insertOrIgnore(['id' => (string) Str::uuid7(), 'external_offering_id' => $offering] + $timestamps);
        $offeringId = DB::table('offerings')->where('external_offering_id', $offering)->value('id');
        $key = ['student_id' => $studentId, 'offering_id' => $offeringId];
        $query = DB::table('enrolments')->where($key);
        $current = $query->first();
        if ($current && $current->source_revision >= $revision) {
            if ((int) $current->source_revision === $revision && $current->status !== $status->value) {
                throw new DomainException("Record {$record}: conflicting status at the same revision.");
            }

            return false;
        }

        $values = ['status' => $status->value, 'source_revision' => $revision];
        if ($current) {
            $query->update($values + ['updated_at' => $now]);
        } else {
            DB::table('enrolments')->insert(['id' => (string) Str::uuid7()] + $key + $values + $timestamps);
        }

        return true;
    }
}
