#!/usr/bin/env bash
set -euo pipefail

# Always use a unique, empty SQLite database. Never reset the developer's DB.
mkdir -p .agent-work/browser-tests
run=$(mktemp -d "$PWD/.agent-work/browser-tests/run.XXXXXX")
export DB_CONNECTION=sqlite DB_DATABASE="$run/portal.sqlite" DB_URL=''
export APP_ENV=testing APP_DEBUG=false
export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
export SESSION_DRIVER=file CACHE_STORE=array MAIL_MAILER=array QUEUE_CONNECTION=sync
export APP_URL="http://127.0.0.1:${PORTAL_TEST_PORT:-19173}"
touch "$DB_DATABASE"
php artisan migrate --seed --force
exec php artisan serve --no-reload --host=127.0.0.1 --port="${PORTAL_TEST_PORT:-19173}"
