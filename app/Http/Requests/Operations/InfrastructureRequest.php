<?php

namespace App\Http\Requests\Operations;

use App\Enums\BridgeSlot;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class InfrastructureRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'storage_mib' => ['required', 'integer', 'between:1,100000000'],
            'probe_ms' => ['required', 'integer', 'between:1,60000'],
            'bridge_slot' => ['required', Rule::enum(BridgeSlot::class)],
        ];
    }
}
