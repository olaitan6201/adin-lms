<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class StructureImportPreviewResource extends JsonResource
{
    public static $wrap = null;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $items = $this->resource['items'];
        $created = 0;
        $rows = [];
        foreach ($items as $item) {
            $existing = $item['id'] !== null;
            if (! $existing) {
                $created++;
            }
            $row = [
                'line' => $item['line'],
                'kind' => $item['kind'],
                'code' => $item['code'],
                'name' => $item['name'],
                'parent' => $item['parent'],
                'existing' => $existing,
            ];
            if (isset($item['position'])) {
                $row['position'] = $item['position'];
            }
            $rows[] = $row;
        }

        return [
            'created' => $created,
            'skipped' => count($items) - $created,
            'rows' => $rows,
            'errors' => (object) $this->resource['errors'],
            'confirmation' => $this->resource['confirmation'],
        ];
    }
}
