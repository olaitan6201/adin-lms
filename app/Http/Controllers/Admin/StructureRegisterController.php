<?php

namespace App\Http\Controllers\Admin;

use App\Enums\StructureRegisterKind;
use App\Http\Requests\Admin\StructureRegisterRequest;
use App\Services\Academics\StructureRegister;
use Illuminate\Http\RedirectResponse;

final class StructureRegisterController
{
    public function store(StructureRegisterRequest $request, StructureRegister $register, string $kind): RedirectResponse
    {
        $register->create(StructureRegisterKind::from($kind), $request->user()->id, $request->validated());

        return to_route('admin.structure');
    }

    public function update(
        StructureRegisterRequest $request,
        StructureRegister $register,
        string $kind,
        string $record,
    ): RedirectResponse {
        $data = $request->validated();
        $revision = $data['revision'];
        unset($data['revision']);
        $register->correct(StructureRegisterKind::from($kind), $request->user()->id, $record, $data, $revision);

        return to_route('admin.structure');
    }
}
