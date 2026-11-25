<?php

namespace App\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

class MarkExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('mark', $this->route('attempt')->exam->item);
    }

    public function rules(): array
    {
        return [
            'base_revision' => 'required|integer|min:0',
            'awards' => 'sometimes|array|max:200',
            'awards.*' => 'required|decimal:0,8|between:0,1000000',
            'points' => 'prohibited',
            'reason' => 'required|string|max:2000',
            'release' => 'sometimes|boolean',
        ];
    }
}
