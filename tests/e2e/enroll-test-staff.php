<?php

use App\Models\User;
use App\Services\Security\TotpEnrollment;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$run = realpath((string) getenv('PORTAL_E2E_RUN'));
$sandbox = realpath(base_path('.agent-work/browser-tests'));
if (! $run || ! $sandbox || ! str_starts_with($run, $sandbox.'/run-')
    || ! $app->environment('testing') || DB::getDriverName() !== 'sqlite'
    || realpath(DB::connection()->getDatabaseName()) !== $run.'/portal.sqlite') {
    throw new LogicException('This fixture requires a disposable browser test database.');
}

umask(0077);
foreach (['lecturer', 'officer'] as $role) {
    $account = User::where('email', $role.'@demo.example.test')->sole();
    $secret = app(TotpEnrollment::class)->issue($account);
    file_put_contents($run.'/'.$role.'.factor', $secret, LOCK_EX);
}
