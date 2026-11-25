<?php

namespace App\Services\Lecturer;

use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class TeachingActivity
{
    /** @return Collection<int, array{offering: string, registers: int, uploads: int, marks: int}> */
    public function byOffering(User $actor, string $from, string $until, ?string $offering = null): Collection
    {
        $registers = DB::table('attendance')
            ->join('classes', 'classes.id', '=', 'attendance.class_id')
            ->where('attendance.recorded_by', $actor->id);
        $uploads = DB::table('material_versions')
            ->join('learning_materials', 'learning_materials.id', '=', 'material_versions.material_id')
            ->join('modules', 'modules.id', '=', 'learning_materials.module_id')
            ->where('material_versions.created_by', $actor->id)->whereNotNull('material_versions.file_id');
        $marks = DB::table('assessment_scores')
            ->join('assessment_items', 'assessment_items.id', '=', 'assessment_scores.item_id')
            ->join('gradebooks', 'gradebooks.id', '=', 'assessment_items.gradebook_id')
            ->where('assessment_scores.changed_by', $actor->id);

        $summarise = function (Builder $query, string $source, string $time, string $columns) use ($from, $until, $offering): Builder {
            return $query->join('offerings', 'offerings.id', '=', $source.'.offering_id')
                ->when($offering !== null, fn (Builder $q) => $q->where('offerings.id', $offering))
                ->where($time, '>=', $from)->where($time, '<', Carbon::parse($until)->addDay())
                ->groupBy('offerings.external_offering_id')
                ->selectRaw('offerings.external_offering_id as offering, '.$columns);
        };
        $rows = $summarise($registers, 'classes', 'attendance.recorded_at', 'COUNT(DISTINCT attendance.class_id) as registers, 0 as uploads, 0 as marks')
            ->unionAll($summarise($uploads, 'modules', 'material_versions.created_at', '0, COUNT(*), 0'))
            ->unionAll($summarise($marks, 'gradebooks', 'assessment_scores.changed_at', '0, 0, COUNT(*)'));

        return DB::query()->fromSub($rows, 'activity')->groupBy('offering')->orderBy('offering')
            ->selectRaw('offering, SUM(registers) as registers, SUM(uploads) as uploads, SUM(marks) as marks')
            ->get()->map(fn ($row) => ['offering' => $row->offering, 'registers' => (int) $row->registers,
                'uploads' => (int) $row->uploads, 'marks' => (int) $row->marks]);
    }
}
