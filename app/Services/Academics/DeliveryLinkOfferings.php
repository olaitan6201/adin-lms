<?php

namespace App\Services\Academics;

use App\Enums\OfferingStatus;
use App\Models\Offering;
use Illuminate\Database\Eloquent\Builder;

final class DeliveryLinkOfferings
{
    private const ID_WHITESPACE = " \t\n\r\v\f";

    /** @return Builder<Offering> */
    public static function query(): Builder
    {
        $schoolId = 'external_offering_id';
        $whitespace = str_split(self::ID_WHITESPACE);
        foreach ($whitespace as $character) {
            $schoolId = "REPLACE($schoolId, ?, '')";
        }

        return Offering::query()
            ->where('status', OfferingStatus::Published)
            ->whereNotNull('curriculum_course_id')
            ->whereRaw("LENGTH($schoolId) > 0", $whitespace);
    }

    public static function supports(Offering $offering): bool
    {
        return $offering->status === OfferingStatus::Published
            && $offering->curriculum_course_id !== null
            && trim($offering->external_offering_id ?? '', self::ID_WHITESPACE) !== '';
    }
}
