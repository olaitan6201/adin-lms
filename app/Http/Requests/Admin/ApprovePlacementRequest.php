<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ApprovePlacementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('review-placements') === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array{reason: array{'nullable', 'string', 'max:191'}}
     */
    public function rules(): array
    {
        return [
            'reason' => ['nullable', 'string', 'max:191'],
        ];
    }

    public function reason(): ?string
    {
        $reason = $this->validated('reason');

        return is_string($reason) ? $reason : null;
    }
}
