<?php

namespace App\Services\Learning;

use App\Enums\Learning\LessonKind;
use App\Http\Requests\Learning\LessonRequest;
use App\Models\Module;
use App\Models\Offering;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class LessonWriter
{
    public function save(LessonRequest $request, Offering $offering, ?Module $lesson): void
    {
        DB::transaction(function () use ($request, $offering, $lesson): void {
            Offering::lockForUpdate()->findOrFail($offering->id);
            $modules = Module::where('offering_id', $offering->id);
            $record = $lesson ? (clone $modules)->lockForUpdate()->findOrFail($lesson->id) : new Module;
            $prior = $request->validated('prerequisite_id', $record->prerequisite_id);
            $position = $request->integer('position');
            if ($prior && ($prior === $record->id || ! (clone $modules)->whereKey($prior)->where('position', '<', $position)->exists())) {
                throw ValidationException::withMessages(['prerequisite_id' => 'Select an earlier lesson in this course.']);
            }
            if ($record->exists && (clone $modules)->where('prerequisite_id', $record->id)->where('position', '<=', $position)->exists()) {
                throw ValidationException::withMessages(['position' => 'Keep this lesson before lessons that require it.']);
            }
            $record->forceFill([
                ...$request->safe()->except(['published', 'kind']),
                'offering_id' => $offering->id,
                'opens_at' => $request->date('opens_at')?->utc(),
                'closes_at' => $request->date('closes_at')?->utc(),
                'kind' => $request->enum('kind', LessonKind::class)->stored($request->boolean('published')),
            ])->save();
        }, 3);
    }
}
