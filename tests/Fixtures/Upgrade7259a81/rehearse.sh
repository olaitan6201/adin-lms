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
source_profile=${2:-legacy}
case $source_profile in
    previous) old=98fbfe38ba79e2d2c97347aa15a822069b37470c ;;
    legacy) ;;
    *) exit 2 ;;
esac
candidate=$(git rev-parse "${3:-HEAD}")
mkdir -p .agent-work/redesign/continuity
export QA_ROOT
QA_ROOT=$(mktemp -d "$PWD/.agent-work/redesign/continuity/r.XXXXXX")
mkdir "$QA_ROOT"/{app,target,socket}
source "$repo/$scripts/engines.sh"
cleanup() {
    if [[ -f "$QA_ROOT/db/postmaster.pid" ]]; then "$pg/pg_ctl" -D "$QA_ROOT/db" -m fast -w stop >/dev/null; fi
    if [[ -S "$QA_ROOT/socket/mysql.sock" ]]; then mysqladmin --no-defaults --socket="$DB_SOCKET" -uroot shutdown; fi
    rm -rf -- "$QA_ROOT"
}
trap cleanup EXIT
git archive "$old" | tar -xC "$QA_ROOT/app"
git archive "$candidate" | tar -xC "$QA_ROOT/target"
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
echo "Source $old; candidate $candidate; target $(sha256sum "$QA_ROOT/target/database/migrations/$baseline" | cut -d' ' -f1); $DB_CONNECTION"
php artisan migrate --no-interaction >/dev/null
for seeder in AuthoritySeeder DemoCampusSeeder DemoStaffAuthoritySeeder; do php artisan db:seed --class="$seeder" --no-interaction >/dev/null; done
sql < "$repo/$scripts/test-history.sql"
sql < "$repo/$scripts/approved-control.sql"
if [[ $source_profile == previous ]]; then sql < "$repo/$scripts/previous-history.sql"; fi
history() {
    if ! QA_HISTORY_SIDE="$1" vendor/bin/phpunit --do-not-cache-result "$repo/$scripts/OwnerHistoryTest.php" > "$QA_ROOT/owner-$1" 2>&1; then
        echo "Owner history assertion failed on $1." >&2
        return 1
    fi
}
history "$source_profile"
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
cd "$QA_ROOT/target"
mv "$QA_ROOT/app/vendor" .
php artisan migrate --no-interaction
[[ $(sql <<<'SELECT migration FROM migrations') == "${baseline%.php}" ]]
cli=(php database/upgrades/7259a81/run.php)
"${cli[@]}" plan > "$QA_ROOT/plan"
plan=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["plan"])' "$QA_ROOT/plan")
refuse() {
    local expected=$1
    shift
    if "${cli[@]}" "$@" > "$QA_ROOT/refusal" 2>&1; then return 1; fi
    grep -Fq "$expected" "$QA_ROOT/refusal"
    if grep -Eiq '019aaa00-|ARCHIVE-42|83\.12345678|PRIVATE-CASE-1|@demo\.example' "$QA_ROOT/refusal"; then return 1; fi
    echo "Refused: $expected"
}
# Probe the isolated candidate only. Never normalize a real migration ledger.
part=database/migrations/baseline/grading.php
mv "$part" "$QA_ROOT/reviewed"
refuse 'Unreviewed target migration revision' plan
cp "$QA_ROOT/reviewed" "$part"
echo >> "$part"
refuse 'Unreviewed target migration revision' "apply:$plan"
rm "$part"
ln -s "$QA_ROOT/reviewed" "$part"
refuse 'Unreviewed target migration layout' "cutover:$plan"
rm "$part"
mv "$QA_ROOT/reviewed" "$part"
touch database/migrations/baseline/.unexpected
refuse 'Unreviewed target migration layout' plan
rm database/migrations/baseline/.unexpected
touch database/migrations/extra.php
refuse 'Unreviewed target migration layout' plan
rm database/migrations/extra.php
legacy_sql() {
    case $DB_CONNECTION in
        sqlite|mysql) DB_DATABASE="$UPGRADE_SOURCE" sql ;;
        pgsql) { echo 'SET search_path TO legacy;'; cat; } | sql ;;
    esac
}
legacy_sql <<<"UPDATE migrations SET migration='unexpected_migration' WHERE migration='${baseline%.php}';"
refuse 'Unexpected source migration history' plan
legacy_sql <<<"UPDATE migrations SET migration='${baseline%.php}' WHERE migration='unexpected_migration';"
sql <<<"INSERT INTO migrations(migration,batch) VALUES ('unexpected_migration',2);"
refuse 'Unexpected target migration history' "apply:$plan"
sql <<<"DELETE FROM migrations WHERE migration='unexpected_migration';"
sql <<<'CREATE TABLE unexpected_table (id INTEGER);'
refuse 'Unexpected target table/column inventory' plan
sql <<<'DROP TABLE unexpected_table;'
drop_index() {
    if [[ $DB_CONNECTION == mysql ]]; then sql <<<"DROP INDEX $1 ON $2;"; else sql <<<"DROP INDEX $1;"; fi
}
drop_index usage_auth_window_idx login_events
sql <<<'CREATE INDEX usage_auth_window_idx ON login_events(user_id,outcome,occurred_at);'
refuse 'Unexpected target index' plan
drop_index usage_auth_window_idx login_events
sql <<<'CREATE INDEX usage_auth_window_idx ON login_events(outcome,occurred_at,user_id);'
cp "$UPGRADE_BACKUP" "$QA_ROOT/changed"
echo probe >> "$QA_ROOT/changed"
UPGRADE_BACKUP="$QA_ROOT/changed" refuse 'Plan changed' "apply:$plan"
source "$repo/$scripts/registrar.sh"
registrar_review
# Late failure after earlier tables have been populated; verify transaction rollback.
sql <<<'CREATE UNIQUE INDEX rehearsal_reject ON enrolments(status);'
refuse 'copy enrolments: Database error' "apply:$plan"
[[ $(sql <<<'SELECT COUNT(*) FROM users') == 0 ]]
drop_index rehearsal_reject enrolments
"${cli[@]}" "apply:$plan" > "$QA_ROOT/receipt"
python3 - "$QA_ROOT" <<'PY'
import json,sys,pathlib
p=pathlib.Path(sys.argv[1])
plan=json.loads((p/'plan').read_text())
receipt=json.loads((p/'receipt').read_text())
assert len(receipt.pop('review_digest')) == 64
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
AND g.total_percent=83.12345678 AND s.points=g.total_percent AND g.moderation_status='pending';
SQL
) == 1 ]]
refuse 'is not empty' "apply:$plan"
check_cutover
history candidate
[[ $(sql <<<'SELECT count(*) FROM modules WHERE prerequisite_id IS NOT NULL') == 0 ]]
[[ $(sql <<<'SELECT count(*) FROM examination_attempts WHERE visibility_receipts IS NOT NULL') == 0 ]]
[[ $(sql <<<'SELECT count(*) FROM offerings a JOIN offerings b ON a.copied_from=b.id WHERE a.external_offering_id=b.external_offering_id') == 0 ]]
[[ $(sql <<<'SELECT count(*) FROM offerings a JOIN offerings b ON a.copied_from=b.id') == 1 ]]
sql <<<"INSERT INTO jobs (queue,payload,attempts,available_at,created_at) VALUES ('probe','{}',0,1,1);"
[[ $(sql <<<"SELECT id FROM jobs WHERE queue='probe'") -ge 3 ]]
echo 'PASS: restored backup, stale-plan refusal, atomic failure/retry, exact history readback, populated-target refusal.'
