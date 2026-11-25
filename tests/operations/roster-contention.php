<?php

use App\Services\Roster\ImportRosterFile;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
set_exception_handler(static function (Throwable $failure): never {
    fwrite(STDERR, $failure->getMessage().PHP_EOL);
    exit(1);
});
$root = getenv('QA_ROOT');
$pg = DB::getDriverName() === 'pgsql';
$socket = $pg ? DB::connection()->getConfig('host') : DB::connection()->getConfig('unix_socket');
if (base_path() !== $root.'/app' || ! app()->environment('testing') || DB::getDatabaseName() !== 'qa_source'
    || $socket !== $root.($pg ? '/socket' : '/socket/mysql.sock')) {
    throw new LogicException('Use the disposable extended rehearsal.');
}

$importer = app(ImportRosterFile::class);
if (($argv[1] ?? null) === 'contender') {
    echo DB::scalar($pg ? 'SELECT pg_backend_pid()' : 'SELECT CONNECTION_ID()'), PHP_EOL;
    flush();
    echo $importer->import($root.'/registered.csv'), PHP_EOL;
    exit;
}

foreach (['registered' => 1, 'withdrawn' => 2] as $status => $revision) {
    file_put_contents("$root/$status.csv", "student_id,offering_id,status,revision\nRACE-1,RACE-1,$status,$revision\n");
}

$waitQuery = $pg
    ? 'SELECT EXISTS(SELECT 1 FROM pg_locks WHERE pid=? AND NOT granted)'
    : 'SELECT EXISTS(SELECT 1 FROM performance_schema.data_lock_waits w
        JOIN performance_schema.threads t ON t.thread_id=w.requesting_thread_id WHERE t.processlist_id=?)';
$original = null;
foreach (['registered' => 1, 'withdrawn' => 2] as $state => $revision) {
    DB::beginTransaction();
    if ($importer->import("$root/$state.csv") !== 1) {
        throw new RuntimeException('Expected a new source revision.');
    }
    $proc = proc_open([PHP_BINARY, __FILE__, 'contender'], [1 => ['pipe', 'w']], $pipes);
    $pid = (int) fgets($pipes[1]);
    $until = microtime(true) + 8;
    do {
        $waiting = DB::scalar($waitQuery, [$pid]);
        if (! $waiting) {
            usleep(20000);
        }
    } while (! $waiting && microtime(true) < $until);
    DB::commit();
    $changes = trim(stream_get_contents($pipes[1]));
    fclose($pipes[1]);
    if (proc_close($proc) !== 0 || ! $waiting || $changes !== '0') {
        throw new RuntimeException('Expected observed contender lock wait and replay no-op.');
    }
    $student = DB::table('students')->where('external_student_id', 'RACE-1')->sole();
    $offering = DB::table('offerings')->where('external_offering_id', 'RACE-1')->sole();
    $row = DB::table('enrolments')->where('student_id', $student->id)->where('offering_id', $offering->id)->sole();
    $original ??= $row->id;
    if ($row->id !== $original || $row->status !== $state || (int) $row->source_revision !== $revision
        || DB::table('audit_logs')->where('subject_key', $original)->where('action', 'roster.registration.started')->count() !== 1) {
        throw new RuntimeException('Replay changed committed state or registration history.');
    }
    echo "PASS roster: contender $pid waited; revision $revision $state preserved; same enrolment and one interval.\n";
}
