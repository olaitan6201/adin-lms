<?php

namespace App\Http\Requests\Admin;

use App\Services\Academics\StructureRegisterImportRow;
use Illuminate\Foundation\Http\FormRequest;

final class StructureRegisterImportRequest extends FormRequest
{
    public function rules(): array
    {
        $rules = ['file' => ['required', 'file', 'max:2048', 'extensions:csv,xlsx']];
        if (! $this->routeIs('admin.structure.register.import.columns')) {
            $rules['columns'] = ['required', 'array:'.implode(',', StructureRegisterImportRow::FIELDS)];
            foreach (StructureRegisterImportRow::FIELDS as $field) {
                $rules["columns.$field"] = ['required', 'integer', 'between:0,31'];
            }
        }
        if ($this->routeIs('admin.structure.register.import.store')) {
            $rules['confirmation'] = ['required', 'string', 'regex:/\A[a-f0-9]{64}\z/'];
        }

        return $rules;
    }
}
