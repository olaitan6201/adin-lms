<?php

namespace App\Services\Operations;

use App\Enums\OperationsEvent;
use App\Models\SystemConfiguration;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

final class InstitutionBranding
{
    private const SETTINGS = 'branding.identity';

    private const LOGO = 'branding.logo';

    /** @return array{institution:string,logoWhite:string,logoFull:string} */
    public function display(): array
    {
        $settings = Schema::hasTable('system_configuration')
            ? SystemConfiguration::where('key', self::SETTINGS)->first()?->value : null;
        $logo = isset($settings['logo_id']) ? route('branding.logo', $settings['logo_id'], false) : null;

        return [
            'institution' => $settings['institution'] ?? config('branding.institution'),
            'logoWhite' => $logo ?? asset(config('branding.logo_white')),
            'logoFull' => $logo ?? asset(config('branding.logo_full')),
        ];
    }

    public function change(User $actor, ?string $institution, ?UploadedFile $logo, bool $restore): void
    {
        $pixels = $logo ? $this->normalize($logo) : null;
        DB::transaction(function () use ($actor, $institution, $pixels, $restore): void {
            $identity = SystemConfiguration::unguarded(fn () => SystemConfiguration::firstOrCreate(
                ['key' => self::SETTINGS], ['value' => [], 'updated_by' => $actor->id],
            ));
            $identity = SystemConfiguration::whereKey($identity->id)->lockForUpdate()->firstOrFail();
            $logoId = $identity->value['logo_id'] ?? null;
            if ($restore || $pixels !== null) {
                SystemConfiguration::where('key', self::LOGO)->delete();
                $logoId = $pixels === null ? null : SystemConfiguration::forceCreate([
                    'key' => self::LOGO, 'value' => ['png' => base64_encode($pixels)], 'updated_by' => $actor->id,
                ])->id;
            }
            $identity->forceFill(['value' => ['institution' => $institution, 'logo_id' => $logoId], 'updated_by' => $actor->id])->save();
            OperationsAudit::record($actor, OperationsEvent::BrandingChanged, self::SETTINGS, [
                'institution' => $institution ?? '(configured default)', 'logo' => $logoId ?? '(configured default)',
            ]);
        }, 3);
    }

    public function image(string $id): string
    {
        $row = SystemConfiguration::where('key', self::LOGO)->whereKey($id)->firstOrFail();

        return base64_decode($row->value['png'], true);
    }

    private function normalize(UploadedFile $file): string
    {
        $image = @imagecreatefromstring($file->getContent());
        if ($image === false) {
            throw ValidationException::withMessages(['logo' => 'Choose a readable PNG or JPEG image.']);
        }
        imagesavealpha($image, true);
        ob_start();
        try {
            imagepng($image);

            return (string) ob_get_contents();
        } finally {
            ob_end_clean();
        }
    }
}
