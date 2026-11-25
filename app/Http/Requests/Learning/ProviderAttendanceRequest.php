<?php

namespace App\Http\Requests\Learning;

use App\Enums\BridgeSlot;
use App\Models\Lecturer;
use App\Models\Student;
use App\Services\Operations\InfrastructureDesk;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

/** Accept normalized check-ins only from the institution's trusted provider adapter. */
final class ProviderAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $key = BridgeSlot::tryFrom(app(InfrastructureDesk::class)->settings()['bridge_slot'])?->key();
        $stamp = $this->header('X-Learning-Timestamp', '');
        if (
            ! is_string($key) ||
            strlen($key) < 32 ||
            ! ctype_digit($stamp) ||
            abs(now()->timestamp - (int) $stamp) > 300 ||
            ! $this->isJson() ||
            $this->query->count()
        ) {
            return false;
        }

        $message = implode("\n", [$stamp, $this->method(), $this->getPathInfo(), $this->getContent()]);

        return hash_equals(
            hash_hmac('sha256', $message, $key),
            $this->header('X-Learning-Signature', ''),
        );
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required_without_all:external_student_id,staff_number|prohibits:external_student_id,staff_number|uuid',
            'external_student_id' => 'required_without_all:user_id,staff_number|prohibits:user_id,staff_number|string|max:191',
            'staff_number' => 'required_without_all:user_id,external_student_id|prohibits:user_id,external_student_id|string|max:191',
        ];
    }

    public function participant(): string
    {
        if ($id = $this->validated('user_id')) {
            return $id;
        }
        $id = $this->filled('external_student_id')
            ? Student::where('external_student_id', $this->validated('external_student_id'))->value('user_id')
            : Lecturer::where('staff_number', $this->validated('staff_number'))->value('user_id');

        return $id ?? throw ValidationException::withMessages(['participant' => 'No matching institutional participant.']);
    }
}
