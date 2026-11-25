<?php

namespace App\Services\Roster;

use App\Enums\StudentStatus;
use App\Models\AcademicLevel;
use App\Models\AcademicSession;
use App\Models\Programme;
use App\Models\Student;
use App\Models\StudentSession;
use DomainException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ImportStudentProfiles
{
    private const HEADER = [
        'student_id',
        'matric_number',
        'name',
        'email',
        'programme',
        'level',
        'session',
        'status',
    ];

    public function __construct(private readonly ProfileSheet $sheet) {}

    public function import(string $path): int
    {
        return DB::transaction(function () use ($path): int {
            $header = null;
            $count = 0;
            foreach ($this->sheet->rows($path) as $row) {
                if ($header === null) {
                    $header = $row;
                    if ($row !== self::HEADER && $row !== [...self::HEADER, 'photo']) {
                        throw new DomainException(
                            'Expected header: '.implode(',', self::HEADER).'[,photo]',
                        );
                    }

                    continue;
                }
                $record = ++$count + 1;
                if (count($row) < 8 || count($row) > count($header)) {
                    throw new DomainException("Record {$record}: unexpected number of columns.");
                }
                $data = $this->validatedFields($row, $record);
                $this->saveProfile($data, $this->academicReferences($data, $record), $record);
            }
            if ($header === null) {
                throw new DomainException('Missing profile sheet header.');
            }

            return $count;
        });
    }

    private function validatedFields(array $row, int $record): array
    {
        $data = array_combine(self::HEADER, array_map('trim', array_slice($row, 0, 8)));
        $rules = array_fill_keys(self::HEADER, 'required|string|max:191');
        $rules['student_id'] .= '|regex:/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/D';
        $rules['email'] .= '|email:rfc';
        $rules['status'] = ['required', Rule::enum(StudentStatus::class)];
        $validation = Validator::make($data, $rules);
        if ($validation->fails()) {
            throw new DomainException("Record {$record}: ".$validation->errors()->first());
        }

        return $data;
    }

    private function academicReferences(array $data, int $record): array
    {
        $references = [
            'programme_id' => Programme::where('code', $data['programme'])->value('id'),
            'level_id' => AcademicLevel::where('label', $data['level'])->value('id'),
            'session_id' => AcademicSession::where('label', $data['session'])->value('id'),
        ];
        foreach ($references as $key => $id) {
            if ($id === null) {
                throw new DomainException("Record {$record}: unknown {$key} reference.");
            }
        }

        return $references;
    }

    private function saveProfile(array $data, array $references, int $record): void
    {
        $student =
            Student::where('external_student_id', $data['student_id'])->lockForUpdate()->first() ??
            new Student;
        try {
            $student
                ->forceFill([
                    'external_student_id' => $data['student_id'],
                    'matric_number' => $data['matric_number'],
                    'source_name' => $data['name'],
                    'source_email' => $data['email'],
                    'status' => $data['status'],
                ])
                ->save();
        } catch (UniqueConstraintViolationException) {
            throw new DomainException("Record {$record}: conflicting student identity.");
        }
        $session =
            StudentSession::where('student_id', $student->id)
                ->where('session_id', $references['session_id'])
                ->first() ?? new StudentSession;
        $session->forceFill(['student_id' => $student->id] + $references)->save();
    }
}
