<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class LinkPlacementEnrolmentRequest extends FormRequest
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
     * @return array{enrolment_id: array{'required', 'uuid'}}
     */
    public function rules(): array
    {
        return [
            'enrolment_id' => ['required', 'uuid'],
        ];
    }

    public function enrolmentId(): string
    {
        return (string) $this->validated('enrolment_id');
    }
}
