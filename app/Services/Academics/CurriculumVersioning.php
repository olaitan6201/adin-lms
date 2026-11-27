<?php

namespace App\Services\Academics;

use App\Enums\CurriculumStatus;
use App\Models\CourseOutcome;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\OutcomeMapping;
use App\Models\Prerequisite;
use App\Models\Programme;
use App\Models\ProgrammeOutcome;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CurriculumVersioning
{
    public function create(string $programme, string $revision): Curriculum
    {
        return DB::transaction(function () use ($programme, $revision) {
            Programme::lockForUpdate()->findOrFail($programme);
            $version = Curriculum::where('programme_id', $programme)->max('version') + 1;

            return Curriculum::forceCreate([
                'programme_id' => $programme,
                'version' => $version,
                'framework_revision' => $revision,
                'status' => CurriculumStatus::Draft,
            ]);
        });
    }

    public function change(string $id, string $action, array $data, User $actor): Curriculum
    {
        return DB::transaction(function () use ($id, $action, $data, $actor) {
            $version = Curriculum::lockForUpdate()->findOrFail($id);
            $expected = match ($action) {
                'approve' => CurriculumStatus::Reviewed,
                'fork' => CurriculumStatus::Approved,
                default => CurriculumStatus::Draft,
            };
            if ($version->status !== $expected) {
                throw ValidationException::withMessages([
                    'status' => "This action requires a {$expected->value} version.",
                ]);
            }

            if ($action === 'fork') {
                return $this->fork($version);
            }

            if ($action === 'review') {
                $version->forceFill(['status' => CurriculumStatus::Reviewed])->save();
            } elseif ($action === 'approve') {
                Programme::lockForUpdate()->findOrFail($version->programme_id);
                $version
                    ->forceFill([
                        'status' => CurriculumStatus::Approved,
                        'approved_by' => $actor->id,
                        'approved_at' => now(),
                    ])
                    ->save();
            } else {
                app(CurriculumEditing::class)->apply($version, $action, $data);
            }

            return $version;
        });
    }

    private function fork(Curriculum $source): Curriculum
    {
        $draft = $this->create($source->programme_id, $source->framework_revision ?? 'Unspecified');
        $outcomes = [];
        foreach (ProgrammeOutcome::where('curriculum_id', $source->id)->get() as $outcome) {
            $outcomes[$outcome->id] = ProgrammeOutcome::forceCreate([
                'curriculum_id' => $draft->id,
                'statement' => $outcome->statement,
            ])->id;
        }

        foreach (CurriculumCourse::where('curriculum_id', $source->id)->get() as $entry) {
            $new = $entry->replicate()->forceFill(['curriculum_id' => $draft->id]);
            $new->save();
            foreach (Prerequisite::where('curriculum_course_id', $entry->id)->get() as $edge) {
                $edge
                    ->replicate()
                    ->forceFill(['curriculum_course_id' => $new->id])
                    ->save();
            }

            foreach (CourseOutcome::where('curriculum_course_id', $entry->id)->get() as $outcome) {
                $copy = CourseOutcome::forceCreate([
                    'curriculum_course_id' => $new->id,
                    'statement' => $outcome->statement,
                ]);
                foreach (OutcomeMapping::where('course_outcome_id', $outcome->id)->get() as $map) {
                    OutcomeMapping::forceCreate([
                        'course_outcome_id' => $copy->id,
                        'programme_outcome_id' => $outcomes[$map->programme_outcome_id],
                    ]);
                }
            }
        }

        return $draft;
    }
}
