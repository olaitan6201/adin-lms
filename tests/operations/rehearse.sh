#!/usr/bin/env bash
# As an unprivileged user from the checkout root; dependencies installed from composer.lock.
set -euo pipefail
umask 077
test "$(id -u)" -ne 0
if [[ ${1:-} != --clean ]]; then
    exec env -i PATH="$PATH" HOME="$HOME" bash "$0" --clean "$@"
fi
shift
export DB_CONNECTION=${1:-pgsql}
mode=${2:-journey}
[[ "$DB_CONNECTION" =~ ^(mysql|pgsql|sqlite)$ && "$mode" =~ ^(suite|journey|extended)$ ]]
[[ $DB_CONNECTION != sqlite || $mode == suite ]]
revision=$(git rev-parse HEAD)
test -f vendor/autoload.php
export QA_ROOT
mkdir -p "$PWD/.agent-work/qualification-runs"
QA_ROOT=$(mktemp -d "$PWD/.agent-work/qualification-runs/q.XXXXXX")
server=''
cleanup() {
    if [[ -n "$server" ]]; then kill -- "-$server" 2>/dev/null || true; fi
    if [[ -f "$QA_ROOT/db/postmaster.pid" ]]; then "$pg/pg_ctl" -D "$QA_ROOT/db" -m fast -w stop >/dev/null; fi
    if [[ -S "$QA_ROOT/socket/mysql.sock" ]]; then
        mysqladmin --no-defaults --socket="$DB_SOCKET" -uroot shutdown
    fi
    rm -rf -- "$QA_ROOT"
}
trap cleanup EXIT
mkdir "$QA_ROOT"/{app,socket}
git archive "$revision" | tar -x -C "$QA_ROOT/app"
cp -a --reflink=auto vendor "$QA_ROOT/app/"
cd "$QA_ROOT/app"
source tests/operations/engines.sh
export APP_ENV=testing APP_DEBUG=false
export APP_CONFIG_CACHE="$QA_ROOT/config.php" CACHE_STORE=database SESSION_DRIVER=database
export MAIL_MAILER=array QUEUE_CONNECTION=sync LOG_CHANNEL=stderr
export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
echo "Source $revision; PHP $(php -r 'echo PHP_VERSION;'); $DB_CONNECTION $mode"
start_engine
if [[ $mode == suite ]]; then
    export SESSION_DRIVER=array CACHE_STORE=array BCRYPT_ROUNDS=4
    vendor/bin/phpunit --do-not-cache-result --fail-on-skipped --fail-on-empty-test-suite
    exit 0
fi
php artisan migrate --seed --no-interaction >/dev/null
export QA_LEARNERS=2
if [[ $mode == extended ]]; then
    timeout 40 php tests/operations/roster-contention.php
    # One client IP: respect the six logins per minute configured by identity.php.
    export QA_LEARNERS=6
fi
php tests/operations/fixture.php > "$QA_ROOT/ids.json"
export QA_PORT
QA_PORT=$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1])')
export APP_URL="http://127.0.0.1:$QA_PORT"
router="$PWD/vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php"
cd public
setsid env PHP_CLI_SERVER_WORKERS=4 php -S "127.0.0.1:$QA_PORT" "$router" >"$QA_ROOT/http.log" 2>&1 &
server=$!
cd ..
for _ in {1..50}; do
    kill -0 "$server"
    if curl --noproxy '*' -fsS "$APP_URL/up" -o /dev/null 2>/dev/null; then break; fi
    sleep .1
done
kill -0 "$server"
echo "$QA_LEARNERS learners, 4 HTTP workers, loopback"
python3 tests/operations/journey.py > "$QA_ROOT/results.json"
cat "$QA_ROOT/results.json"
restore_and_compare
python3 - "$QA_ROOT" <<'PY'
import json, pathlib, sys
root = pathlib.Path(sys.argv[1])
rows = (root / 'qa_restored.rows').read_text().splitlines()
reports = json.loads((root / 'results.json').read_text())
import os
if len(rows) != int(os.environ['QA_LEARNERS']) or len(rows) != len(reports):
    sys.exit("restored attempt count differs from fixture")
for row, report in zip(rows, reports):
    a, q, email, state, ordinal, rev, answer, saved, scored, submitted = row.split('\t')
    name = email.split('@')[0]
    value = json.loads(answer)['value']
    expected = (report['attempt'], report['question'], report['learner'])
    if (a, q, name) != expected or (state, ordinal, rev, value) != ('submitted','1','1',name):
        sys.exit("restored attempt differs from HTTP acknowledgement")
    if not saved or not submitted or scored != '1':
        sys.exit("missing timestamps, duplicate/incorrect score or premature release")
print(f"PASS: {len(rows)} submitted receipts, acknowledged answers and unreleased scores survived restore.")
PY
