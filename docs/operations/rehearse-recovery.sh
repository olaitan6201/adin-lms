#!/usr/bin/env bash
# From the checkout root, as an unprivileged Unix user with PostgreSQL client/server tools installed.
set -euo pipefail
umask 077
test -f artisan
mkdir -p .agent-work
root=$(mktemp -d "$PWD/.agent-work/recovery.XXXXXX")
pg=$(pg_config --bindir)
export REHEARSAL_DIR="$root" DB_CONNECTION=pgsql DB_HOST="$root" PGHOST="$root"
export DB_DATABASE=s18_source DB_PORT=5432 PGPORT=5432 DB_USERNAME="$(id -un)" DB_PASSWORD='' DB_URL=''
export PGUSER="$DB_USERNAME" APP_ENV=testing APP_CONFIG_CACHE="$root/config.php" CACHE_STORE=array QUEUE_CONNECTION=sync MAIL_MAILER=array
unset PGSERVICE PGOPTIONS PGSERVICEFILE
"$pg/initdb" -D "$root/cluster" --auth-local=trust --auth-host=reject >/dev/null
"$pg/pg_ctl" -D "$root/cluster" -o "-k '$root' -p 5432 -c listen_addresses=''" -l "$root/server.log" -w start >/dev/null
trap '"$pg/pg_ctl" -D "$root/cluster" -m fast -w stop >/dev/null' EXIT
for db in s18_source s18_restored; do "$pg/createdb" "$db"; done
mkdir "$root/objects" "$root/restored-objects"
php artisan migrate --no-interaction >/dev/null
php artisan db:seed --class=DemoCampusSeeder --no-interaction >/dev/null
php tests/Fixtures/operations/recovery.php
"$pg/pg_dump" -Fc -f "$root/course.dump" s18_source
tar -cf "$root/objects.tar" -C "$root/objects" field.txt
"$pg/pg_restore" --exit-on-error --single-transaction -d s18_restored "$root/course.dump"
tar -xf "$root/objects.tar" -C "$root/restored-objects"
for db in s18_source s18_restored; do
    "$pg/psql" -XAt -v ON_ERROR_STOP=1 -d "$db" -c \
        'SELECT id, attempt_question_id, revision, answer, saved_at FROM examination_responses ORDER BY id' > "$root/$db.rows"
done
test "$(wc -l < "$root/s18_source.rows")" -eq 2
cmp "$root/s18_source.rows" "$root/s18_restored.rows"
expected=$("$pg/psql" -XAt -d s18_restored -c "SELECT checksum FROM files WHERE object_key='field.txt'")
test "${#expected}" -eq 64
(cd "$root/restored-objects" && echo "$expected  field.txt" | sha256sum -c -)
"$pg/postgres" --version
echo "PASS: both saved response revisions, identifiers, timestamps and private fixture bytes restored."
echo "Disposable evidence: $root"
