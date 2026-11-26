<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Student;
use App\Services\Authority\ScopedAuthority;
use App\Services\Roster\ImportRosterFile;
use App\Services\Roster\ImportStudentProfiles;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StudentDirectoryController extends Controller
{
    public function index(Request $request, ScopedAuthority $authority): Response
    {
        abort_unless($authority->institutionAllows($request->user(), 'roster.read'), 403);
        $search = $request->validate(['q' => 'nullable|string|max:191'])['q'] ?? '';
        $students = Student::query()->when($search !== '', fn ($q) => $q->where(fn ($q) => $q
            ->whereLike('source_name', "%$search%")->orWhereLike('external_student_id', "%$search%")
            ->orWhereLike('matric_number', "%$search%")))->orderBy('external_student_id')
            ->simplePaginate(40, ['id', 'external_student_id', 'matric_number', 'source_name', 'status'])->withQueryString();

        return Inertia::render('Student/Directory', [
            'students' => $students->items(), 'q' => $search,
            'next' => $students->nextPageUrl(), 'previous' => $students->previousPageUrl(),
            'manage' => $authority->institutionAllows($request->user(), 'academics.manage'),
            'link' => $authority->institutionAllows($request->user(), 'accounts.manage') && $authority->institutionAllows($request->user(), 'academics.manage'),
            'receipt' => $request->session()->get('roster_receipt'),
        ]);
    }

    public function import(Request $request, string $kind, ScopedAuthority $authority, ImportRosterFile $roster, ImportStudentProfiles $profiles): RedirectResponse
    {
        abort_unless($authority->institutionAllows($request->user(), 'academics.manage'), 403);
        $extensions = $kind === 'profiles' ? 'csv,xlsx' : 'csv';
        $request->validate(['feed' => "required|file|max:7800|extensions:$extensions"]);
        $file = $request->file('feed');
        try {
            $count = DB::transaction(function () use ($kind, $file, $profiles, $roster, $request): int {
                $count = $kind === 'profiles'
                    ? $profiles->import($file->getPathname(), strtolower($file->getClientOriginalExtension()))
                    : $roster->import($file->getPathname());
                AuditLog::forceCreate(['subject_key' => "feed:$kind", 'action' => 'feed.reconciled',
                    'actor_id' => $request->user()->id, 'occurred_at' => now(), 'details' => ['count' => $count]]);

                return $count;
            });
        } catch (DomainException $error) {
            throw ValidationException::withMessages(['feed' => $error->getMessage()]);
        }

        return to_route('students.index')->with('roster_receipt', $kind === 'profiles' ? "$count profile rows processed." : "$count registration changes applied.");
    }
}
