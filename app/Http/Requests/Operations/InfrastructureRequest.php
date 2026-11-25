<?php

namespace App\Http\Requests\Operations;

use App\Enums\BridgeSlot;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Validator;

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

    /** @return list<callable(Validator):void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if (array_diff(array_keys($this->all()), ['_token', 'storage_mib', 'probe_ms', 'bridge_slot']) !== []) {
                $validator->errors()->add('bridge_slot', 'Only warning levels and the key slot are accepted.');
            }
        }];
    }

    protected function failedValidation(ValidatorContract $validator): void
    {
        if (! $this->expectsJson()) {
            throw new ValidationException($validator, back()->withErrors($validator));
        }

        parent::failedValidation($validator);
    }
}
