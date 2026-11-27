<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AccountStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AccountSearchRequest;
use App\Http\Requests\Admin\StoreAccountRequest;
use App\Http\Requests\Admin\UpdateAccountStatusRequest;
use App\Http\Resources\Admin\AccountSummaryResource;
use App\Models\User;
use App\Services\Identity\AccountAdministration;
use App\Services\Identity\AccountDirectory;
use DomainException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AccountDirectoryController extends Controller
{
    public function index(AccountSearchRequest $request, AccountDirectory $directory): Response
    {
        $search = $request->validated('q') ?? '';
        $accounts = $directory->search($search);
        $actor = $request->user();
        $records = AccountSummaryResource::collection($accounts->items());

        return Inertia::render('Admin/Accounts/Index', [
            'accounts' => $records->resolve($request),
            'q' => $search,
            'next' => $accounts->nextPageUrl(),
            'previous' => $accounts->previousPageUrl(),
            'self' => $actor->id,
            'grant' => $actor->can('viewAccess', User::class),
        ]);
    }

    public function store(StoreAccountRequest $request, AccountAdministration $service): RedirectResponse
    {
        $data = $request->validated();
        try {
            $service->provision($request->user()->id, $data['email'], $data['full_name']);
        } catch (DomainException|UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['email' => 'This account could not be provisioned. Check the email and your permissions.']);
        }

        return to_route('accounts.index', ['q' => $data['email']]);
    }

    public function update(UpdateAccountStatusRequest $request, User $account, AccountAdministration $service): RedirectResponse
    {
        $status = AccountStatus::from($request->validated('status'));
        try {
            $service->changeStatus($request->user()->id, $account->id, $status === AccountStatus::Suspended);
        } catch (DomainException $error) {
            throw ValidationException::withMessages(['status' => $error->getMessage()]);
        }

        return back();
    }
}
