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

### Roster pilot

An operator can import registration changes from a UTF-8 CSV (no BOM). Each row is a delta: omission does not withdraw a student. Use stable, case-sensitive student and semester-specific offering IDs; the positive revision increases per student/offering pair. Replays and older revisions are ignored. Invalid rows and same-revision conflicts roll back the whole file.

```csv
student_id,offering_id,status,revision
S100,CSC101-2026-1,registered,1
```

```sh
php artisan roster:import /path/to/roster.csv
php artisan roster:link S100 42
```

`42` is an **existing** LMS user ID. Verify the person's institutional identity before linking; the import never matches on email or creates credentials. Sign in at `/login` with that account to see `/courses`. To revoke access, import `S100,CSC101-2026-1,withdrawn,2` with the same header. This preserves the enrolment ID and any associated learning history. This pilot format requires agreement with the registration platform before live use.

### Qualification commands

```sh
php artisan test
vendor/bin/pint --test
npm run typecheck
npm run build
```

See [AGENTS.md](AGENTS.md) for engineering rules and the location of the design artifacts.
