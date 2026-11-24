<?php

namespace App\Http\Controllers\Learning;

use App\Http\Requests\Learning\ClassRequest;
use App\Models\Attendance;
use App\Models\ClassSession;
use App\Models\Enrolment;
use App\Models\LearningMaterial;
use App\Models\Offering;
use App\Models\TeachingAllocation;
use App\Models\User;
use App\Policies\LearningPolicy;
use App\Services\Learning\ClassRegister;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

final class ClassroomController
{
    public function index(Request $request, Offering $offering, LearningPolicy $policy, ClassRegister $register): Response
    {
        $staff = $policy->audience($request->user(), $offering);
        $materials = LearningMaterial::with('module')->whereHas('module', fn ($q) => $q->where('offering_id', $offering->id))->get()
            ->filter(fn ($m) => $staff || ($policy->released($m) && $policy->released($m->module)))->keyBy('id');
        $sessions = ClassSession::where('offering_id', $offering->id)->addSelect(['mark' => Attendance::select('status')->whereColumn('class_id', 'classes.id')->where('user_id', $request->user()->id)])
            ->orderBy('starts_at')->get();

        return Inertia::render('Learning/Classroom', ['base' => route('learning.index', $offering), 'title' => $offering->external_offering_id, 'staff' => $staff,
            'percentage' => $register->percentage($sessions), 'participants' => $staff ? $this->participants($offering) : [],
            'materials' => $staff ? $materials->values()->map->only(['id', 'title']) : [],
            'sessions' => $sessions->map(fn ($s) => [...$s->only(['id', 'title', 'starts_at', 'ends_at', 'status', 'mark']), 'meeting_url' => $staff || $s->status !== 'cancelled' ? $s->meeting_url : null,
                'recording_material_id' => $materials->has($s->recording_material_id) ? $s->recording_material_id : null])]);
    }

    private function participants(Offering $offering): Collection
    {
        $students = Enrolment::join('students', 'students.id', '=', 'enrolments.student_id')->where('offering_id', $offering->id)->where('enrolments.status', 'registered')->select('students.user_id');
        $staff = TeachingAllocation::join('lecturers', 'lecturers.id', '=', 'teaching_allocations.lecturer_id')->where('offering_id', $offering->id)->select('lecturers.user_id');

        return User::whereIn('id', $students->union($staff))->orderBy('full_name')->get(['id', 'full_name']);
    }

    public function save(ClassRequest $request, Offering $offering, ?ClassSession $session = null): RedirectResponse
    {
        abort_if($session && $session->offering_id !== $offering->id, 404);
        if ($request->filled('recording_material_id') && ! LearningMaterial::whereKey($request->validated('recording_material_id'))
            ->whereHas('module', fn ($m) => $m->where('offering_id', $offering->id))->exists()) {
            throw ValidationException::withMessages(['recording_material_id' => 'Choose a resource from this offering.']);
        }
        ($session ?? new ClassSession)->forceFill([...$request->validated(), 'starts_at' => $request->date('starts_at')->utc(),
            'ends_at' => $request->date('ends_at')->utc(), 'offering_id' => $offering->id])->save();

        return to_route('learning.classes', $offering);
    }
}
