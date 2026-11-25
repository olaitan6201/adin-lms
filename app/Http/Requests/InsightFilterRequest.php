<?php

namespace App\Http\Requests;

use App\Enums\ReportFamily;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InsightFilterRequest extends FormRequest
{
    public function rules(): array
    {
        return array_fill_keys(['session', 'term', 'offering'], ['sometimes', 'required', 'uuid'])
            + ['family' => ['sometimes', 'required', Rule::enum(ReportFamily::class)]];
    }
}
