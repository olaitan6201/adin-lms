<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

final class AdminOverviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $overview = $this->resource;
        $examinations = $overview['examinations'];
        $approvals = $overview['approvals']
            ->map(fn (array $row): array => [
                'id' => $row['href'],
                'title' => $row['title'],
                'meta' => $row['context'],
                'status' => $row['kind'],
                'href' => $row['href'],
            ])
            ->all();
        $activity = $overview['activity']
            ->map(fn (array $event): array => [
                'id' => $event['kind'],
                'who' => $event['course'] ?? 'Course activity',
                'action' => $event['kind'],
                'when' => $event['at'],
            ])
            ->all();
        $examRecords = $overview['canManageExams']
            ? $examinations['exams']
                ->map(fn (object $exam): array => $this->exam($exam, $examinations['asOf']))
                ->all()
            : [];

        return [
            'description' => $overview['description'],
            'tiles' => $overview['tiles'],
            'enrolment' => $overview['enrolment'],
            'service' => $overview['service'],
            'approvals' => $approvals,
            'examinations' => [
                'available' => $overview['canManageExams'],
                'bank' => $examinations['bank'],
                'subtitle' => $examinations['subtitle'],
                'exams' => $examRecords,
            ],
            'delivery' => $overview['delivery'],
            'participation' => $overview['participation'],
            'activity' => $activity,
            'links' => $overview['links'],
        ];
    }

    private function exam(object $row, Carbon $asOf): array
    {
        $opens = Carbon::parse($row->opens_at, 'UTC');
        $scheduled = $asOf->lt($opens);
        $boundary = $scheduled ? $opens : Carbon::parse($row->closes_at, 'UTC');
        $time = $boundary->utc()
            ->format('j M Y, H:i');
        $timing = $scheduled ? "Opens $time UTC" : "Closes $time UTC";

        return [
            'id' => $row->id,
            'title' => $row->title,
            'meta' => $row->external_offering_id ? "{$row->external_offering_id} · $timing" : $timing,
            'status' => $scheduled ? 'Scheduled' : 'Open',
        ];
    }
}
