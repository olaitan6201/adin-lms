<?php

namespace App\Http\Requests\Admin;

use App\Models\Offering;
use App\Services\Academics\DeliveryLinkAttestation;
use Illuminate\Auth\Access\Response;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

final class StoreDeliveryLinkRequest extends FormRequest
{
    public function authorize(): Response
    {
        $offering = $this->route('offering');

        if (! $offering instanceof Offering) {
            return Response::deny();
        }

        return Gate::forUser($this->user())->inspect('manageDeliveryLinks', $offering);
    }

    /** @return array{assignment: array{'required', 'uuid'}, confirmation: array{'required', 'string', string}} */
    public function rules(): array
    {
        return [
            'assignment' => ['required', 'uuid'],
            'confirmation' => ['required', 'string', 'max:'.DeliveryLinkAttestation::MAX_LENGTH],
        ];
    }

    public function assignmentId(): string
    {
        return $this->validated('assignment');
    }

    public function attestation(): string
    {
        return $this->validated('confirmation');
    }
}
