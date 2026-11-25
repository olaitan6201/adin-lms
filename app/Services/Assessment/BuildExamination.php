<?php

namespace App\Services\Assessment;

use App\Models\AssessmentItem;
use App\Models\Examination;
use Brick\Math\BigDecimal;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BuildExamination
{
    public function __construct(private AuthorQuestionSlot $slots) {}

    public function run(AssessmentItem $item, array $data): void
    {
        DB::transaction(function () use ($item, $data) {
            AssessmentItem::lockForUpdate()->findOrFail($item->id);
            abort_if(Examination::where('item_id', $item->id)->exists(), 409);
            $exam = Examination::forceCreate([
                'item_id' => $item->id,
                'opens_at' => $data['opens_at'],
                'closes_at' => $data['closes_at'],
                'duration_seconds' => $data['duration_seconds'],
                'max_attempts' => $data['max_attempts'],
                'shuffle_options' => (bool) ($data['shuffle'] ?? false),
            ]);
            $course = $item->courseId();
            $points = BigDecimal::zero();
            $rows = $data['selections'] ?? $data['questions'] ?? [];
            $selected = [];
            foreach (array_values($rows) as $i => $row) {
                if (isset($data['selections'])) {
                    if (in_array($row['version_id'], $selected, true)) {
                        throw ValidationException::withMessages(['selections' => 'Select each question revision only once.']);
                    }

                    $selected[] = $row['version_id'];
                    $this->slots->selectVersion($exam, $course, $i, $row);
                } else {
                    $this->slots->add($exam, $course, $i, $row);
                }

                $points = $points->plus((string) $row['points']);
            }

            $draws = array_values($data['draws'] ?? []);
            if ($draws !== []) {
                app(BankDrawSlots::class)->append($exam, $course, $draws, count($rows));
                foreach ($draws as $row) {
                    $points = $points->plus((string) $row['points']);
                }
            }

            if (! $points->isEqualTo((string) $item->maximum_score)) {
                throw ValidationException::withMessages(['questions' => 'Slot points must equal the item maximum.']);
            }
        });
    }
}
