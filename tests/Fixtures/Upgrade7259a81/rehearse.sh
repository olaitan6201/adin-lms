#!/usr/bin/env bash
set -euo pipefail
umask 077
test "$(id -u)" -ne 0
if [[ ${1:-} != --clean ]]; then exec env -i HOME="$HOME" PATH="$PATH" bash "$0" --clean "$@"; fi
shift
export DB_CONNECTION=${1:?sqlite, pgsql or mysql}
[[ $DB_CONNECTION =~ ^(sqlite|pgsql|mysql)$ ]]
repo=$PWD
scripts=tests/Fixtures/Upgrade7259a81
baseline=2026_11_25_000001_create_uuid_lms_schema.php
old=7259a816a9f17adc19c208ed92e415b12aafd62b
mkdir -p .agent-work/redesign/continuity
export QA_ROOT
QA_ROOT=$(mktemp -d "$PWD/.agent-work/redesign/continuity/r.XXXXXX")
mkdir "$QA_ROOT"/{app,socket}
source "$repo/$scripts/engines.sh"
cleanup() {
    if [[ -f "$QA_ROOT/db/postmaster.pid" ]]; then "$pg/pg_ctl" -D "$QA_ROOT/db" -m fast -w stop >/dev/null; fi
    if [[ -S "$QA_ROOT/socket/mysql.sock" ]]; then mysqladmin --no-defaults --socket="$DB_SOCKET" -uroot shutdown; fi
    rm -rf -- "$QA_ROOT"
}
trap cleanup EXIT
git archive "$old" | tar -xC "$QA_ROOT/app"
cp -a --reflink=auto vendor "$QA_ROOT/app/"
cd "$QA_ROOT/app"
export APP_ENV=testing LOG_CHANNEL=stderr SESSION_DRIVER=array CACHE_STORE=array BCRYPT_ROUNDS=4
export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
start_engine
export UPGRADE_BACKUP="$QA_ROOT/snapshot"
sql() {
    case $DB_CONNECTION in
        sqlite) sqlite3 -batch -bail "$DB_DATABASE" ;;
        pgsql) "$pg/psql" -XAtq -v ON_ERROR_STOP=1 -d "$DB_DATABASE" ;;
        mysql) "${my[@]}" "$DB_DATABASE" ;;
    esac
}
echo "Source $old; target $(sha256sum "$repo/database/migrations/$baseline" | cut -d' ' -f1); $DB_CONNECTION"
php artisan migrate --seed --no-interaction >/dev/null
sql < "$repo/$scripts/test-history.sql"
case $DB_CONNECTION in
    sqlite)
        sql <<<".backup '$UPGRADE_BACKUP'"
        export UPGRADE_SOURCE="$QA_ROOT/legacy.sqlite"
        cp "$UPGRADE_BACKUP" "$UPGRADE_SOURCE"
        export DB_DATABASE="$QA_ROOT/target.sqlite" UPGRADE_DSN="sqlite:$QA_ROOT/target.sqlite"
        touch "$DB_DATABASE" ;;
    mysql)
        mysqldump --no-defaults --socket="$DB_SOCKET" -uroot --single-transaction qa_source > "$UPGRADE_BACKUP"
        "${my[@]}" qa_restored < "$UPGRADE_BACKUP"
        "${my[@]}" -e 'CREATE DATABASE qa_target'
        export DB_DATABASE=qa_target UPGRADE_SOURCE=qa_restored UPGRADE_USER=root
        export UPGRADE_DSN="mysql:unix_socket=$DB_SOCKET;dbname=qa_target" ;;
    pgsql)
        "$pg/pg_dump" -Fc -f "$UPGRADE_BACKUP" qa_source
        export DB_DATABASE=qa_restored UPGRADE_SOURCE=legacy UPGRADE_USER="$DB_USERNAME"
        "$pg/pg_restore" --single-transaction --exit-on-error -d qa_restored "$UPGRADE_BACKUP"
        sql <<<'ALTER SCHEMA public RENAME TO legacy; CREATE SCHEMA public;'
        export UPGRADE_DSN="pgsql:host=$DB_HOST;dbname=qa_restored" ;;
esac
cp "$repo/database/migrations/$baseline" "database/migrations/$baseline"
php artisan migrate --no-interaction >/dev/null
cli=(php "$repo/database/upgrades/7259a81/run.php")
"${cli[@]}" plan > "$QA_ROOT/plan"
plan=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["plan"])' "$QA_ROOT/plan")
if "${cli[@]}" "apply:$(printf '%064d' 0)"; then exit 1; fi
# Late failure after earlier tables have been populated; verify transaction rollback.
sql <<<'CREATE UNIQUE INDEX rehearsal_reject ON enrolments(status);'
if "${cli[@]}" "apply:$plan"; then exit 1; fi
[[ $(sql <<<'SELECT COUNT(*) FROM users') == 0 ]]
if [[ $DB_CONNECTION == mysql ]]; then sql <<<'DROP INDEX rehearsal_reject ON enrolments;'; else sql <<<'DROP INDEX rehearsal_reject;'; fi
"${cli[@]}" "apply:$plan" > "$QA_ROOT/receipt"
python3 - "$QA_ROOT" <<'PY'
import json,sys,pathlib
p=pathlib.Path(sys.argv[1])
plan=json.loads((p/'plan').read_text())
receipt=json.loads((p/'receipt').read_text())
assert plan.pop('plan') == receipt.pop('committed') and plan == receipt
print(f"Reconciled {len(plan['tables'])} tables, {sum(t['count'] for t in plan['tables'].values())} rows.")
PY
[[ $(sql <<'SQL'
SELECT count(*) FROM grades g JOIN grade_inputs i ON i.grade_id=g.id
JOIN assessment_scores s ON i.score_id=s.id JOIN submission_versions v ON v.id=s.submission_version_id
JOIN submission_recipients r ON r.version_id=v.id AND r.enrolment_id=g.enrolment_id
JOIN enrolments e ON e.id=r.enrolment_id JOIN students t ON t.id=e.student_id
WHERE v.receipt='ARCHIVE-42' AND e.status='withdrawn' AND e.source_revision=2
AND t.external_student_id='DEMO-TUNDE' AND g.revision=1 AND g.published_at IS NOT NULL
AND g.total_percent=83.12345678 AND s.points=g.total_percent;
SQL
) == 1 ]]
if "${cli[@]}" "apply:$plan"; then exit 1; fi
[[ $(sql <<<'SELECT count(*) FROM offerings a JOIN offerings b ON a.copied_from=b.id WHERE a.external_offering_id=b.external_offering_id') == 0 ]]
[[ $(sql <<<'SELECT count(*) FROM offerings a JOIN offerings b ON a.copied_from=b.id') == 1 ]]
sql <<<"INSERT INTO jobs (queue,payload,attempts,available_at,created_at) VALUES ('probe','{}',0,1,1);"
[[ $(sql <<<"SELECT id FROM jobs WHERE queue='probe'") -ge 3 ]]
echo 'PASS: restored backup, stale-plan refusal, atomic failure/retry, exact history readback, populated-target refusal.'
