<?php

namespace App\Http\Resources\Learning;

use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Offering;
use App\Services\Learning\ResourceFileFormat;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

final class MaterialResource extends JsonResource
{
    public function __construct(
        LearningMaterial $material,
        private Collection $versions,
        private Offering $offering,
        private bool $staff,
    ) {
        parent::__construct($material);
    }

    public function toArray(Request $request): array
    {
        $visibleVersions = $this->staff ? $this->versions : $this->versions->take(1);

        return [
            ...$this->resource->only(['id', 'title', 'download_allowed', 'opens_at', 'closes_at']),
            'versions' => $visibleVersions->values()->map($this->version(...)),
        ];
    }

    private function version(MaterialVersion $version): array
    {
        $canDownload = $version->file_id && ($this->staff || $this->download_allowed);
        $isImage = in_array($version->file?->media_type, ResourceFileFormat::INLINE_IMAGES, true);
        $route = [$this->offering, $version];

        return [
            ...$version->only(['revision', 'external_url', 'body', 'transcript']),
            'caption' => $version->caption_file_id && ($this->staff || $this->download_allowed)
                ? route('learning.download', [...$route, 'caption' => 1]) : null,
            'media' => $canDownload && in_array($version->file->media_type, ResourceFileFormat::INLINE_MEDIA, true)
                ? ['type' => $version->file->media_type, 'src' => route('learning.download', [...$route, 'preview' => 1])]
                : null,
            'author' => $this->staff ? $version->createdBy->full_name : null,
            'image' => $canDownload && $isImage
                    ? route('learning.download', [...$route, 'preview' => 1])
                    : null,
            'download' => $canDownload ? route('learning.download', $route) : null,
        ];
    }
}
