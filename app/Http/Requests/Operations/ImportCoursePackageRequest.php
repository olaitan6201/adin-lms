<?php

namespace App\Http\Requests\Operations;

use Illuminate\Foundation\Http\FormRequest;

final class ImportCoursePackageRequest extends FormRequest
{
    public function rules(): array
    {
        return ['package' => 'required|file|max:1024'];
    }
}
