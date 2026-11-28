<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use LogicException;

class UploadPlacementCsvRequest extends FormRequest
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
     * @return array{file: array{'required', 'file', 'max:256'}}
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:256'],
        ];
    }

    public function placementFile(): UploadedFile
    {
        $file = $this->validated('file');
        if (! $file instanceof UploadedFile) {
            throw new LogicException('Expected a validated placement CSV upload.');
        }

        return $file;
    }
}
