<?php

namespace App\Http\Controllers\Academics;

use App\Http\Requests\OfferingPreparationRequest;
use App\Http\Resources\Academics\OfferingDeliveryPageResource;
use App\Models\Offering;
use App\Services\Academics\OfferingDeliveryPage;
use App\Services\Academics\OfferingLifecycle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OfferingDeliveryController
{
    public function index(Request $request, OfferingDeliveryPage $delivery): Response
    {
        $resource = new OfferingDeliveryPageResource($delivery->read($request->user()));

        return Inertia::render('Academics/Delivery', $resource->resolve($request));
    }

    public function change(
        OfferingPreparationRequest $request,
        OfferingLifecycle $lifecycle,
        Offering $offering,
        string $action,
    ): RedirectResponse {
        $lifecycle->change($offering, $action, $request->validated(), $request->user());

        return to_route('academics.delivery');
    }
}
