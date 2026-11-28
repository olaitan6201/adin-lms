<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\ApprovePlacementRequest;
use App\Http\Requests\Admin\LinkPlacementEnrolmentRequest;
use App\Http\Requests\Admin\UploadPlacementCsvRequest;
use App\Http\Resources\Admin\PlacementDeskLocation;
use App\Http\Resources\Admin\PlacementDeskResource;
use App\Models\PlacementUpdate;
use App\Services\Academics\EnrolmentContextRegister;
use App\Services\Academics\OfficialPlacementRegister;
use App\Services\Academics\PlacementCsv;
use App\Services\Academics\PlacementDeskPage;
use App\Services\Academics\PlacementReferenceCsv;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class PlacementDeskController
{
    public function index(Request $request, PlacementDeskPage $page, ?PlacementUpdate $update = null): Response
    {
        $location = PlacementDeskLocation::fromRequest($request);
        $data = $page->read($request->user(), $update, $location->page);

        return Inertia::render('Admin/PlacementDesk', (new PlacementDeskResource($data, $location))->resolve($request));
    }

    public function template(PlacementCsv $csv): HttpResponse
    {
        return response($csv->template(), 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="student-placements.csv"',
        ]);
    }

    public function references(Request $request, PlacementReferenceCsv $csv): StreamedResponse
    {
        return response()->streamDownload(
            $csv->stream($request->user()),
            'placement-reference-ids.csv',
            ['Content-Type' => 'text/csv; charset=UTF-8'],
        );
    }

    public function upload(UploadPlacementCsvRequest $request, PlacementCsv $csv, OfficialPlacementRegister $register): RedirectResponse
    {
        $register->upload($request->user(), $csv->read($request->placementFile()));

        return redirect()->to(PlacementDeskLocation::fromRequest($request)->urlFor());
    }

    public function approve(ApprovePlacementRequest $request, PlacementUpdate $update, OfficialPlacementRegister $register): RedirectResponse
    {
        $register->accept($request->user(), $update, $request->reason());

        return redirect()->to(PlacementDeskLocation::fromRequest($request)->urlFor(update: $update->id));
    }

    public function link(LinkPlacementEnrolmentRequest $request, PlacementUpdate $update, EnrolmentContextRegister $contexts): RedirectResponse
    {
        $contexts->linkUpdate($request->user(), $update, $request->enrolmentId());

        return redirect()->to(PlacementDeskLocation::fromRequest($request)->urlFor(update: $update->id));
    }
}
