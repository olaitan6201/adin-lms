<?php

namespace App\Http\Requests\Learning;

use Illuminate\Foundation\Http\FormRequest;

/** Accept normalized check-ins only from the institution's trusted provider adapter. */
final class ProviderAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $key = config('learning.attendance_bridge_key');
        $stamp = $this->header('X-Learning-Timestamp', '');
        if (! is_string($key) || strlen($key) < 32 || ! ctype_digit($stamp) || abs(now()->timestamp - (int) $stamp) > 300 || ! $this->isJson() || $this->query->count()) {
            return false;
        }
        $message = implode("\n", [$stamp, $this->method(), $this->getPathInfo(), $this->getContent()]);

        return hash_equals(hash_hmac('sha256', $message, $key), $this->header('X-Learning-Signature', ''));
    }

    public function rules(): array
    {
        return ['user_id' => 'required|uuid'];
    }
}
