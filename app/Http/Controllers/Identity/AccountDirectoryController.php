<?php

namespace App\Http\Controllers\Identity;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use App\Services\Identity\AccountAdministration;
use DomainException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AccountDirectoryController extends Controller
{
    public function __construct(private readonly ScopedAuthority $authority) {}

    public function index(Request $request): Response
    {
        $this->authorizeDirectory($request);
        $search = $request->validate(['q' => 'nullable|string|max:191'])['q'] ?? '';
        $accounts = User::query()->when($search !== '', fn ($q) => $q->where(fn ($q) => $q
            ->whereLike('full_name', "%$search%")->orWhereLike('email', "%$search%")))
            ->orderBy('email')->simplePaginate(40, ['id', 'email', 'full_name', 'status'])->withQueryString();

        return Inertia::render('Identity/Accounts', ['accounts' => $accounts->items(), 'q' => $search,
            'next' => $accounts->nextPageUrl(), 'previous' => $accounts->previousPageUrl(),
            'self' => $request->user()->id, 'grant' => $this->authority->institutionAllows($request->user(), 'grants.manage')]);
    }

    public function store(Request $request, AccountAdministration $service): RedirectResponse
    {
        $this->authorizeDirectory($request);
        $data = $request->validate(['email' => 'required|email|max:191', 'full_name' => 'required|string|max:191']);
        try {
            $service->provision($request->user()->id, $data['email'], $data['full_name']);
        } catch (DomainException|UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['email' => 'This account could not be provisioned. Check the email and your permissions.']);
        }

        return to_route('accounts.index', ['q' => $data['email']]);
    }

    public function update(Request $request, User $account, AccountAdministration $service): RedirectResponse
    {
        $this->authorizeDirectory($request);
        $status = $request->validate(['status' => 'required|in:active,suspended'])['status'];
        try {
            $service->changeStatus($request->user()->id, $account->id, $status === 'suspended');
        } catch (DomainException $error) {
            throw ValidationException::withMessages(['status' => $error->getMessage()]);
        }

        return back();
    }

    private function authorizeDirectory(Request $request): void
    {
        abort_unless($this->authority->institutionAllows($request->user(), 'accounts.manage'), 403);
    }
}
