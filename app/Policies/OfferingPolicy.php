<?php

namespace App\Policies;

use App\Enums\AccountStatus;
use App\Enums\PermissionCode;
use App\Models\Offering;
use App\Models\User;
use App\Services\Academics\DeliveryLinkOfferings;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Auth\Access\Response;

class OfferingPolicy
{
    public function __construct(private readonly ScopedAuthority $authority) {}

    public function viewRoster(User $user, Offering $offering): bool
    {
        return $this->authority->rosterAllows($user, $offering);
    }

    public function manageDeliveryLinks(User $user, ?Offering $offering = null): bool|Response
    {
        if (! $this->authority->institutionAllows($user, PermissionCode::OfferingsManage)
            || ! User::query()->whereKey($user->id)->where('status', AccountStatus::Active)->exists()) {
            return false;
        }

        if ($offering !== null && ! DeliveryLinkOfferings::supports($offering)) {
            return Response::denyAsNotFound();
        }

        return true;
    }
}
