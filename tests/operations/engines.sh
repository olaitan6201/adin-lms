# Sourced inside the clean, throwaway tree created by rehearse.sh.
start_engine() {
    export DB_DATABASE=qa_source DB_URL='' DB_PASSWORD=''
    if [[ $DB_CONNECTION == sqlite ]]; then
        export DB_DATABASE="$QA_ROOT/test.sqlite"
        touch "$DB_DATABASE"
    elif [[ $DB_CONNECTION == pgsql ]]; then
        pg=$(pg_config --bindir)
        export PGHOST="$QA_ROOT/socket" PGPORT=5432 PGUSER="$(id -un)"
        export DB_HOST="$PGHOST" DB_PORT=5432 DB_USERNAME="$PGUSER"
        "$pg/initdb" -D "$QA_ROOT/db" --auth-local=trust --auth-host=reject >/dev/null
        "$pg/pg_ctl" -D "$QA_ROOT/db" -o "-k '$PGHOST' -c listen_addresses=''" -l "$QA_ROOT/pg.log" -w start >/dev/null
        for db in qa_source qa_restored; do "$pg/createdb" "$db"; done
        "$pg/postgres" --version
    else
        export DB_HOST=localhost DB_USERNAME=root DB_SOCKET="$QA_ROOT/socket/mysql.sock"
        # Avoid host daemon defaults and the system daemon's AppArmor data path.
        cp "$(command -v mysqld)" "$QA_ROOT/mysqld"
        local args=(--no-defaults --basedir=/usr --datadir="$QA_ROOT/db" --log-error="$QA_ROOT/mysql.log")
        "$QA_ROOT/mysqld" "${args[@]}" --initialize-insecure
        "$QA_ROOT/mysqld" "${args[@]}" --daemonize --skip-networking --mysqlx=0 \
            --pid-file="$QA_ROOT/mysql.pid" --socket="$DB_SOCKET"
        my=(mysql --no-defaults --socket="$DB_SOCKET" -uroot --batch --skip-column-names)
        "${my[@]}" -e 'CREATE DATABASE qa_source; CREATE DATABASE qa_restored; SELECT VERSION();'
    fi
}

restore_and_compare() {
    local start db
    if [[ $DB_CONNECTION == pgsql ]]; then
        "$pg/pg_dump" -Fc -f "$QA_ROOT/snapshot" qa_source
        start=$(date +%s%N)
        "$pg/pg_restore" --single-transaction --exit-on-error -d qa_restored "$QA_ROOT/snapshot"
    else
        mysqldump --no-defaults --socket="$DB_SOCKET" -uroot --single-transaction qa_source > "$QA_ROOT/snapshot"
        start=$(date +%s%N)
        "${my[@]}" qa_restored < "$QA_ROOT/snapshot"
    fi
    echo "Logical database restore only: $(( ($(date +%s%N) - start) / 1000000 )) ms"
    for db in qa_source qa_restored; do
        if [[ $DB_CONNECTION == pgsql ]]; then
            "$pg/psql" -XAt -F $'\t' -v ON_ERROR_STOP=1 -d "$db" -f scripts/qualification/reconcile.sql
        else
            "${my[@]}" "$db" < scripts/qualification/reconcile.sql
        fi > "$QA_ROOT/$db.rows"
    done
    cmp "$QA_ROOT"/{qa_source,qa_restored}.rows
}
