<?php

namespace App\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

class AnswerSaveRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'revision' => 'required|integer|min:0',
            'answer' => ['present', 'nullable', function (string $attribute, mixed $value, \Closure $fail): void {
                if ($value === null) {
                    return;
                }

                if (is_string($value) && mb_strlen($value) <= 100000) {
                    return;
                }

                if (is_array($value) && count($value) <= 20) {
                    foreach ($value as $left => $right) {
                        if (is_string($left) && is_string($right) && mb_strlen($left) <= 191 && mb_strlen($right) <= 191) {
                            continue;
                        }

                        $fail('The matching answer is invalid.');

                        return;
                    }

                    return;
                }

                $fail('The answer must be text or a matching map.');
            }],
        ];
    }
}
