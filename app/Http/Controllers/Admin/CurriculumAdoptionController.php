<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\StoreCurriculumAdoptionRequest;
use App\Http\Requests\Admin\StoreEntryCohortRequest;
use App\Services\Academics\CurriculumAdoptionRegister;
use Illuminate\Http\RedirectResponse;

final class CurriculumAdoptionController
{
    public function cohort(StoreEntryCohortRequest $request, CurriculumAdoptionRegister $register): RedirectResponse
    {
        $register->createCohort($request->validated(), $request->user());

        return to_route('admin.academic-core');
    }

    public function store(StoreCurriculumAdoptionRequest $request, CurriculumAdoptionRegister $register): RedirectResponse
    {
        $input = $request->validated();
        $register->adopt($input, $request->user());

        return to_route('admin.academic-core', ['curriculum' => $input['curriculum_id']]);
    }
}
