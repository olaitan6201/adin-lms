<?php

namespace App\Http\Controllers\Learning;

use App\Enums\Learning\AttendanceMethod;
use App\Enums\Learning\AttendanceStatus;
use App\Http\Requests\Learning\MarkRequest;
use App\Http\Requests\Learning\ProviderAttendanceRequest;
use App\Models\Attendance;
use App\Models\ClassSession;
use App\Models\Offering;
use App\Policies\LearningPolicy;
use App\Services\Learning\ClassRegister;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class RegisterController
{
    public function store(
        MarkRequest $request,
        Offering $offering,
        ClassSession $session,
        ClassRegister $register,
    ): RedirectResponse {
        $register->record(
            $offering,
            $session,
            $request->user(),
            $request->validated('user_id'),
            $request->enum('status', AttendanceStatus::class),
            AttendanceMethod::Manual,
            $request->validated('reason'),
        );

        return to_route('learning.classes', $offering);
    }

    public function provider(
        ProviderAttendanceRequest $request,
        Offering $offering,
        ClassSession $session,
        ClassRegister $register,
    ): Response {
        $register->record(
            $offering,
            $session,
            null,
            $request->validated('user_id'),
            AttendanceStatus::Present,
            AttendanceMethod::Provider,
            null,
        );

        return response()->noContent();
    }

    public function export(
        Request $request,
        Offering $offering,
        ClassSession $session,
        LearningPolicy $policy,
    ): StreamedResponse {
        abort_unless($policy->allocated($request->user()->id, $offering), 403);
        abort_unless($session->offering_id === $offering->id, 404);

        return response()->streamDownload(
            function () use ($session): void {
                $stream = fopen('php://output', 'wb');
                fputcsv(
                    $stream,
                    ['user_id', 'status', 'method', 'recorded_by', 'recorded_at'],
                    escape: '',
                );
                foreach (
                    Attendance::where('class_id', $session->id)->orderBy('user_id')->cursor() as $mark
                ) {
                    fputcsv(
                        $stream,
                        [
                            $mark->user_id,
                            $mark->status->value,
                            $mark->method->value,
                            $mark->recorded_by,
                            $mark->recorded_at->toIso8601String(),
                        ],
                        escape: '',
                    );
                }

                fclose($stream);
            },
            'register-'.$session->id.'.csv',
            ['Content-Type' => 'text/csv', 'Cache-Control' => 'private, no-store'],
        );
    }
}
