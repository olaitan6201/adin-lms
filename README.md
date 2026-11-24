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

## Database baseline

`database/migrations/2026_11_25_000000_create_lms_schema.php` is a single
initial migration: 69 LMS domain tables plus seven Laravel storage tables
for sessions, password resets, cache and queues. The migration is
self-contained; it does not read the local `.agents/docs/schema.dbml`.
Domain models live in `app/Models`; `ClassSession` maps to `classes`.
Laravel authenticates against `users.password_hash` and displays
`users.full_name`. Roster tables retain their operational timestamps.

This is a **fresh-database baseline**, not an in-place upgrade of the
earlier roster pilot. If a database already contains users or registrations,
keep it intact: migrate a new database, transfer and reconcile the pilot
records (including IDs, account links, password hashes and roster revisions),
then switch connections. Rolling back this baseline drops the whole schema.

## Demo data

After migrating the baseline, run `php artisan db:seed` in a **local** environment.
The demo creates a computing programme, lecturer, two published course offerings,
chapter readings and linked student accounts. Running it again fills missing
fixtures without duplicating the campus or resetting existing records.

Sign in at `/login` with the local demo password `password`:

| Email | Expected course list |
|---|---|
| `ada@demo.example.test` | CSC101 and CSC102 |
| `tunde@demo.example.test` | CSC101 only; the CSC102 enrolment is withdrawn |

For isolated tests, use factories instead of seeding the whole campus, e.g.
`Enrolment::factory()->withdrawn()->create()`. The default seeder skips demo
data outside `local` and `testing`.

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
