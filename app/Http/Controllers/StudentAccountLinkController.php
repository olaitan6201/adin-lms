<?php

namespace App\Http\Controllers;

use App\Services\Authority\ScopedAuthority;
use App\Services\Identity\AccountLookup;
use App\Services\Roster\LinkStudentAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class StudentAccountLinkController extends Controller
{
    public function __invoke(Request $request, ScopedAuthority $authority, AccountLookup $lookup, LinkStudentAccount $accounts): RedirectResponse
    {
        abort_unless($authority->institutionAllows($request->user(), 'accounts.manage')
            && $authority->institutionAllows($request->user(), 'academics.manage'), 403);
        $data = $request->validate(['student' => 'required|string|max:128', 'account' => 'required|email|max:191', 'verified' => 'accepted']);
        $ids = $lookup->emailQuery($data['account'])->limit(2)->pluck('id');
        if ($ids->count() !== 1 || ! $accounts->bind($data['student'], $ids->first(), $request->user())) {
            throw ValidationException::withMessages(['account' => 'Check the upstream student ID and active account. Existing links cannot be reassigned.']);
        }

        return to_route('students.index', ['q' => $data['student']])->with('roster_receipt', 'Verified account linked.');
    }
}
