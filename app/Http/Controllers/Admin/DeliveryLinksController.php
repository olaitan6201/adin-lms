<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\StoreDeliveryLinkRequest;
use App\Http\Resources\Admin\DeliveryLinksResource;
use App\Models\Offering;
use App\Services\Academics\DeliveryLinkRegister;
use App\Services\Academics\DeliveryLinksPage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class DeliveryLinksController
{
    public function index(Request $request, DeliveryLinksPage $page, ?Offering $offering = null): Response
    {
        $pageNumber = DeliveryLinksPage::pageNumber($request->query('page'));
        $resource = new DeliveryLinksResource($page->read($request->user(), $offering, $pageNumber));

        return Inertia::render('Admin/DeliveryLinks', $resource->resolve($request));
    }

    public function store(StoreDeliveryLinkRequest $request, Offering $offering, DeliveryLinkRegister $register): RedirectResponse
    {
        $register->link($request->user(), $offering, $request->assignmentId(), $request->attestation());

        $pageNumber = DeliveryLinksPage::pageNumber($request->query('page'));

        return to_route('admin.delivery-links.index', ['offering' => $offering] + DeliveryLinksPage::pageQuery($pageNumber));
    }
}
