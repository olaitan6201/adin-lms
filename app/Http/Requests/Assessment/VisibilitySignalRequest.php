<?php

namespace App\Http\Requests\Assessment;

use App\Services\Assessment\ExamSession;
use Illuminate\Foundation\Http\FormRequest;

class VisibilitySignalRequest extends FormRequest
{
    public function authorize(ExamSession $sessions): bool
    {
        $sessions->authorize($this->user(), $this->route('attempt'));

        return true;
    }

    public function rules(): array
    {
        return ['observation_id' => 'sometimes|required|uuid:4'];
    }
}
