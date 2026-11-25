#!/usr/bin/env bash
set -euo pipefail
umask 077
mkdir -p .agent-work/browser-tests
run=$(mktemp -d "$PWD/.agent-work/browser-tests/run-scorm-XXXXXX")
export PORTAL_E2E_RUN="$run" PORTAL_TEST_PORT="${SCORM_APP_PORT:-19291}"
export APP_URL="http://127.0.0.1:$PORTAL_TEST_PORT"
export SCORM_STATIC_ORIGIN="http://localhost:${SCORM_PLAYER_PORT:-19292}"
export APP_CONFIG_CACHE="$run/config.php"
for port in "$PORTAL_TEST_PORT" "${SCORM_PLAYER_PORT:-19292}"; do
    [[ "$port" =~ ^[1-9][0-9]{3,4}$ ]]
    if curl -s --max-time 1 "http://127.0.0.1:$port/" >/dev/null; then exit 1; fi
done
zip -qj "$run/reading.zip" resources/scorm-profile/imsmanifest.xml resources/scorm-static/reading.{js,html} tests/Fixtures/scorm/lesson.txt
sed -e "s|LMS_ORIGIN|$APP_URL|g" -e "s|STATIC_ORIGIN|$SCORM_STATIC_ORIGIN|g" \
    resources/scorm-profile/static.nginx.conf.example > "$run/static.conf"
cat > "$run/nginx.conf" <<EOF
pid "$run/nginx.pid";
error_log "$run/nginx.log";
events {}
http {
    server {
        listen 127.0.0.1:${SCORM_PLAYER_PORT:-19292};
        server_name localhost;
        root "$PWD/resources/scorm-static";
        include "$run/static.conf";
    }
}
EOF
nginx -p "$run" -c "$run/nginx.conf" -g 'daemon off; master_process off;' >"$run/static.log" 2>&1 &
static=$!
# Run the actual disposable app server without Artisan's child process wrapper.
(
    export APP_ENV=testing APP_DEBUG=false DB_CONNECTION=sqlite DB_DATABASE="$run/portal.sqlite" DB_URL=''
    export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
    export SESSION_DRIVER=file CACHE_STORE=array MAIL_MAILER=array QUEUE_CONNECTION=sync
    touch "$DB_DATABASE"
    php artisan migrate --seed --force --no-interaction
    php tests/e2e/enroll-test-staff.php
    cd public
    exec php -S "127.0.0.1:$PORTAL_TEST_PORT" ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
) >"$run/lms.log" 2>&1 &
lms=$!
trap 'kill "$lms" "$static" 2>/dev/null || true; rm -f "$run"/*.factor' EXIT
for i in {1..80}; do
    if curl -fs "$APP_URL/up" >/dev/null && curl -fs "$SCORM_STATIC_ORIGIN/player.html" >/dev/null; then break; fi
    kill -0 "$lms" "$static"
    sleep .25
done
export SCORM_OFFERING=$(sqlite3 "$run/portal.sqlite" "select id from offerings where external_offering_id='DEMO-CSC101-2026-1'")
node tests/scorm-browser/reading.cjs
