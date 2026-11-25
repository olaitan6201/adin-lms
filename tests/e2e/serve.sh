#!/usr/bin/env bash
set -euo pipefail

# Always use a unique, empty SQLite database. Never reset the developer's DB.
run=${PORTAL_E2E_RUN:?run via Playwright}
[[ "$run" == "$PWD"/.agent-work/browser-tests/run-* && ! -e "$run/portal.sqlite" ]]
umask 077
export DB_CONNECTION=sqlite DB_DATABASE="$run/portal.sqlite" DB_URL=''
export APP_ENV=testing APP_DEBUG=false
export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
export SESSION_DRIVER=file CACHE_STORE=array MAIL_MAILER=array QUEUE_CONNECTION=sync
export APP_URL="http://127.0.0.1:${PORTAL_TEST_PORT:-19173}"
touch "$DB_DATABASE"
php artisan migrate --seed --force
php tests/e2e/enroll-test-staff.php
mkdir "$run/public"
cp -r public/build public/brand public/portal* public/favicon.ico "$run/public/"
exec php -S "127.0.0.1:${PORTAL_TEST_PORT:-19173}" -t "$run/public" tests/e2e/router.php
