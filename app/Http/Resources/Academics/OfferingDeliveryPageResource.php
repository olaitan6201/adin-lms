<?php

namespace App\Http\Resources\Academics;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class OfferingDeliveryPageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $page = $this->resource;

        return [
            'offerings' => $page['offerings']->map($this->offering(...))->all(),
            'entries' => $page['entries']->map($this->entry(...))->all(),
            'terms' => $page['terms']->map($this->term(...))->all(),
            'modes' => $page['modes'],
            'pendingPlans' => $page['pendingPlans']->map($this->plan(...))->all(),
        ];
    }

    private function offering(object $row): array
    {
        return [
            'id' => $row->id,
            'external_offering_id' => $row->external_offering_id,
            'status' => $row->status,
            'curriculum_course_id' => $row->curriculum_course_id,
            'semester_id' => $row->semester_id,
            'section' => $row->section,
            'delivery_mode' => $row->delivery_mode,
            'copied_from' => $row->copied_from,
        ];
    }

    private function entry(object $row): array
    {
        return [
            'id' => $row->id,
            'title' => $row->title,
            'code' => $row->code,
            'version' => (int) $row->version,
            'name' => $row->name,
        ];
    }

    private function term(object $row): array
    {
        return [
            'id' => $row->id,
            'label' => $row->label,
            'position' => (int) $row->position,
        ];
    }

    private function plan(object $row): array
    {
        return [
            'offering_id' => $row->offering_id,
            'external_offering_id' => $row->external_offering_id,
            'revision' => (int) $row->revision,
        ];
    }
}
