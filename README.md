# Adin LMS

Custom Laravel + Inertia application with React, TypeScript and Vite. This foundation serves a public learning-portal entry page. Applications, admissions and official registration are managed by the existing institutional platform.

## Local setup

Use PHP 8.3+ with Composer and PDO SQLite, and Node.js 24 with npm. From a fresh checkout:

```sh
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
npm ci
npm run build
php artisan serve
```

For frontend hot reload, also run `npm run dev` in another terminal. PostgreSQL is the production target; local setup uses SQLite.

## Checks

```sh
php artisan test
vendor/bin/pint --test
npm run typecheck
npm run build
```

See [AGENTS.md](AGENTS.md) for engineering rules and the location of the design artifacts.
