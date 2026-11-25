<?php

namespace App\Services\Assessment;

use App\Models\AssessmentItem;
use App\Models\Assignment;
use App\Models\AssignmentReference;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ConfigureAssignment
{
    public function __construct(private PrivateScripts $files) {}

    public function run(AssessmentItem $item, array $data, ?UploadedFile $reference): void
    {
        DB::transaction(function () use ($item, $data, $reference) {
            AssessmentItem::lockForUpdate()->findOrFail($item->id);
            abort_if(Assignment::where('item_id', $item->id)->exists(), 409);
            $assignment = Assignment::forceCreate([
                'item_id' => $item->id,
                'instructions' => $data['instructions'],
                'opens_at' => $data['opens_at'],
                'due_at' => $data['due_at'],
                'closes_at' => $data['closes_at'],
                'max_bytes' => $data['max_bytes'],
                'accepted_formats' => $data['formats'],
                'editable' => (bool) ($data['editable'] ?? false),
                'group_work' => (bool) ($data['group_work'] ?? false),
                'late_policy' => ['allow' => (bool) ($data['allow_late'] ?? false)],
            ]);
            if ($reference) {
                AssignmentReference::forceCreate([
                    'assignment_id' => $assignment->id,
                    'file_id' => $this->files->store($reference)->id,
                ]);
            }
        });
    }
}
