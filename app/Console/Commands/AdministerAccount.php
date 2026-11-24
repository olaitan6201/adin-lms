<?php

namespace App\Console\Commands;

use App\Services\Identity\AccountAdministration;
use DomainException;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Validator;

#[Signature('identity:account {action : provision, suspend or reactivate} {target : Email for provision, otherwise account UUID} {--actor= : Authorizing administrator UUID} {--name= : Full name for provision}')]
#[Description('Provision or change an LMS account under institutional authority')]
class AdministerAccount extends Command
{
    public function handle(AccountAdministration $accounts): int
    {
        $action = $this->argument('action');
        $target = trim($this->argument('target'));
        $actor = $this->option('actor');
        $name = trim((string) $this->option('name'));
        $validator = Validator::make(compact('action', 'actor', 'target', 'name'), [
            'action' => ['required', 'in:provision,suspend,reactivate'],
            'actor' => ['required', 'uuid'],
            'target' => $action === 'provision' ? ['required', 'email', 'max:191'] : ['required', 'uuid'],
            'name' => ['required_if:action,provision', 'max:191'],
        ]);
        if ($validator->fails()) {
            $this->error($validator->errors()->first());

            return self::FAILURE;
        }
        try {
            if ($action === 'provision') {
                $user = $accounts->provision($actor, $target, $name);
                $this->info("Provisioned {$user->id}. Password setup requested.");
            } else {
                $accounts->changeStatus($actor, $target, $action === 'suspend');
                $this->info('Account status updated.');
            }
        } catch (DomainException $error) {
            $this->error($error->getMessage());

            return self::FAILURE;
        } catch (UniqueConstraintViolationException) {
            $this->error('Account conflicts with an existing record.');

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
