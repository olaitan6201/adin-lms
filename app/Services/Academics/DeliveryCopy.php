<?php

namespace App\Services\Academics;

use App\Models\Offering;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DeliveryCopy
{
    public function into(Offering $target, string $sourceId): void
    {
        $source = Offering::lockForUpdate()->findOrFail($sourceId);
        if (
            ! $target->semester_id ||
            ! $source->semester_id ||
            $target->semester_id === $source->semester_id ||
            ! $source->curriculumCourse ||
            $source->curriculumCourse->course_id !== $target->curriculumCourse?->course_id ||
            $target->copied_from
        ) {
            throw ValidationException::withMessages([
                'source_id' => 'Select another term of the same course and a destination that has not been copied.',
            ]);
        }

        foreach (['modules', 'gradebooks', 'enrolments', 'forums', 'study_groups', 'classes'] as $table) {
            if (DB::table($table)->where('offering_id', $target->id)->exists()) {
                throw ValidationException::withMessages([
                    'source_id' => 'Copy into an empty offering before importing registrations or adding activities.',
                ]);
            }
        }

        $days = (int) CarbonImmutable::parse($source->semester->starts_on)->diffInDays(
            CarbonImmutable::parse($target->semester->starts_on),
        );
        $modules = $this->copyRows('modules', 'offering_id', $sourceId, $target->id, days: $days, defaults: ['prerequisite_id' => null]);
        foreach (DB::table('modules')->where('offering_id', $sourceId)->whereNotNull('prerequisite_id')->get() as $lesson) {
            if (! isset($modules[$lesson->prerequisite_id])) {
                throw ValidationException::withMessages(['source_id' => 'A prerequisite belongs to another offering.']);
            }
            DB::table('modules')->where('id', $modules[$lesson->id])->update(['prerequisite_id' => $modules[$lesson->prerequisite_id]]);
        }
        $resources = [];
        foreach ($modules as $old => $new) {
            $materials = $this->copyRows('learning_materials', 'module_id', $old, $new, days: $days);
            $resources += $materials;
            foreach ($materials as $original => $copied) {
                $this->copyRows('material_versions', 'material_id', $original, $copied);
            }
        }

        $groups = $this->copyRows('study_groups', 'offering_id', $sourceId, $target->id);
        $classes = $this->copyRows(
            'classes',
            'offering_id',
            $sourceId,
            $target->id,
            days: $days,
            defaults: [
                'meeting_url' => null,
                'recording_material_id' => null,
                'status' => 'scheduled',
            ],
        );
        $forums = $this->copyRows('forums', 'offering_id', $sourceId, $target->id, ['group_id' => $groups]);
        $activityMap = $modules + $classes + $forums;
        $quizLinks = [];
        $books = $this->copyRows('gradebooks', 'offering_id', $sourceId, $target->id);
        foreach ($books as $old => $new) {
            $items = $this->copyRows('assessment_items', 'gradebook_id', $old, $new, [
                'module_id' => $modules,
            ]);
            foreach ($items as $original => $copied) {
                $activityMap[$original] = $copied;
                $quizLinks["/courses/$sourceId/assessments#item-$original"] = "/courses/$target->id/assessments#item-$copied";
                $assignments = $this->copyRows('assignments', 'item_id', $original, $copied, days: $days);
                foreach ($assignments as $before => $after) {
                    $this->copyRows('assignment_references', 'assignment_id', $before, $after);
                }

                $exams = $this->copyRows('examinations', 'item_id', $original, $copied, days: $days);
                foreach ($exams as $before => $after) {
                    $this->copyRows('exam_slots', 'exam_id', $before, $after);
                }
            }
        }

        foreach ($resources as $old => $new) {
            $quizLinks['{{resource:'.$old.'}}'] = '{{resource:'.$new.'}}';
        }

        foreach (DB::table('modules')->whereIn('id', $modules)->whereNotNull('body')->get(['id', 'body']) as $chapter) {
            $body = strtr($chapter->body, $quizLinks);
            if ($body !== $chapter->body) {
                DB::table('modules')->where('id', $chapter->id)->update(['body' => $body]);
            }
        }

        $target->activity_order = collect($source->activity_order ?? [])->filter(fn ($id) => isset($activityMap[$id]))
            ->map(fn ($id) => $activityMap[$id])->values()->all();
        $target->copied_from = $sourceId;
    }

    /** @return array<string,string> Map old IDs to independent destination records. */
    private function copyRows(
        string $table,
        string $parent,
        string $source,
        string $target,
        array $references = [],
        int $days = 0,
        array $defaults = [],
    ): array {
        $map = [];
        foreach (DB::table($table)->where($parent, $source)->get() as $row) {
            $data = $defaults + (array) $row;
            $data[$parent] = $target;
            $data['id'] = (string) Str::uuid7();
            $map[$row->id] = $data['id'];
            foreach ($references as $key => $ids) {
                if ($data[$key] !== null) {
                    if (! isset($ids[$data[$key]])) {
                        throw ValidationException::withMessages([
                            'source_id' => 'An activity references a record outside the source offering.',
                        ]);
                    }

                    $data[$key] = $ids[$data[$key]];
                }
            }

            foreach (['opens_at', 'due_at', 'closes_at', 'starts_at', 'ends_at'] as $key) {
                if (isset($data[$key])) {
                    $data[$key] = CarbonImmutable::parse($data[$key])->addDays($days);
                }
            }

            DB::table($table)->insert($data);
        }

        return $map;
    }
}
