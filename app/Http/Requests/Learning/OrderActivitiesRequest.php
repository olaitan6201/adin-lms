<?php

namespace App\Http\Requests\Learning;

use App\Policies\LearningPolicy;
use Illuminate\Foundation\Http\FormRequest;

final class OrderActivitiesRequest extends FormRequest
{
    public function authorize(LearningPolicy $access): bool
    {
        return $access->allocated($this->user()->id, $this->route('offering'));
    }

    public function rules(): array
    {
        return [
            'activities' => 'required|array|list|max:2000',
            'activities.*' => 'required|uuid|distinct:strict',
        ];
    }
}
