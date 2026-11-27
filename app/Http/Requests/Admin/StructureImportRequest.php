<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

final class StructureImportRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = ['file' => ['required', 'file', 'max:2048', 'extensions:csv,xlsx']];
        if (! $this->routeIs('admin.structure.import.columns')) {
            $rules['columns'] = ['required', 'array:kind,code,name,parent_code'];
            foreach (['kind', 'code', 'name', 'parent_code'] as $field) {
                $rules["columns.$field"] = ['required', 'integer', 'between:0,31'];
            }
        }
        if ($this->routeIs('admin.structure.import.store')) {
            $rules['confirmation'] = ['required', 'string', 'size:64'];
        }

        return $rules;
    }
}
