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

For frontend hot reload, also run `npm run dev` in another terminal. Select `pgsql`, `mysql` (MySQL 8.0.16+), or `sqlite` using `DB_CONNECTION` and the matching PDO driver. Use an empty database and configure host, port and credentials for server engines.

## Database baseline

`database/migrations/2026_11_25_000001_create_uuid_lms_schema.php` is a single
initial migration: 69 LMS domain tables plus seven Laravel storage tables
for sessions, password resets, cache and queues. The migration is
self-contained; it does not read the local `.agents/docs/schema.dbml`.
Domain primary keys are application-generated UUIDv7 values; foreign keys referencing them are UUIDs, including `sessions.user_id`. Framework-owned job counters and opaque session/cache keys keep their Laravel types. The default Schema string length is 191; explicit lengths override it.

Domain models live in `app/Models`; `ClassSession` maps to `classes`.
Laravel authenticates against `users.password_hash` and displays
`users.full_name`. Roster tables retain their operational timestamps.

This is a **fresh-database baseline**, not an in-place upgrade of the
earlier roster pilot. If a database already contains users or registrations,
keep it intact: migrate a new database, transfer and reconcile the pilot
records (map legacy numeric IDs to new UUIDs and translate all dependent links; preserve password hashes and roster revisions),
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

### Identity and scoped access

Run the updated baseline on a fresh database and seed the role catalogue with
`php artisan db:seed --class=AuthoritySeeder`. Existing UUID baseline installations
also need the new `users.auth_version` integer column (`NOT NULL DEFAULT 1`);
editing the initial migration does not upgrade a database that already ran it.

- Students can sign in with their matric number or email; lecturers can use
  their staff number or email. An account link does not itself grant course
  registration. `/profile` edits only the signed-in user's name.
- Use a trusted operator console to bootstrap an institutional administrator:
  `php artisan authority:grant <user-uuid> institutional_admin institution`.
  Use `faculty:<uuid>` for a dean, `department:<uuid>` for a HoD and
  `offering:<uuid>` for a lecturer. A lecturer also needs a teaching allocation.
  Append `--revoke` to remove the grant.
- Use `php artisan identity:account provision <email> --actor=<admin-uuid>
  --name="Full Name"` for new accounts. `suspend` and `reactivate` take the
  target account UUID. Configure mail and run `php artisan queue:work` for
  account setup and password recovery. The repository does not supply a
  production administrator account.
- After verifying the staff member's identity, run
  `php artisan security:issue-authenticator <user-uuid>` and deliver the
  enrollment secret privately. Staff must complete the authenticator challenge
  after password login. Do not copy secrets into tickets or agent logs.
- Set `SESSION_LIFETIME` in minutes for idle expiry. To revoke access from
  all browsers use `php artisan security:revoke-sessions <user-uuid>`.
  Authorised ICT users can inspect authentication outcomes at `/security/login-events`.

### Roster pilot

An operator can import registration changes from a UTF-8 CSV (no BOM). Each row is a delta: omission does not withdraw a student. Use stable, case-sensitive student and semester-specific offering IDs; the positive revision increases per student/offering pair. Replays and older revisions are ignored. Invalid rows and same-revision conflicts roll back the whole file.

```csv
student_id,offering_id,status,revision
S100,CSC101-2026-1,registered,1
```

```sh
php artisan roster:import /path/to/roster.csv
php artisan roster:link S100 019ad123-4567-789a-bcde-0123456789ab
```

Replace the example UUID with the **existing** LMS user ID. Verify the person's institutional identity before linking; the import never matches on email or creates credentials. Sign in at `/login` with that account to see `/courses`. To revoke access, import `S100,CSC101-2026-1,withdrawn,2` with the same header. This preserves the enrolment ID and any associated learning history. This pilot format requires agreement with the registration platform before live use.

### Student profiles and staff allocations

Use `php artisan roster:profiles /path/to/profiles.csv` for an authorised
student profile extract. A single-sheet `.xlsx` with literal cells in the
same columns is also supported (PHP `zip` and `simplexml` extensions).
Use programme code, level label and session label from the academic catalogue.
An optional final `photo` column may be blank; the import does not fetch photos.

```csv
student_id,matric_number,name,email,programme,level,session,status,photo
DEMO-ADA,DEMO/26/ADA,Ada Demo,ada@demo.example.test,DEMO-BSC,100 (demo),2026/27 (demo),active,
```

`active`, `graduated` and `suspended` describe the source student profile.
The feed neither assigns course access nor modifies login credentials.
Students can open **Academic history** from **My courses** to view their
record, including withdrawals and released grades.

The local `officer@demo.example.test` and `lecturer@demo.example.test`
accounts require the authenticator setup described above. On the officer's
**My courses** page, choose **Manage lecturers**. Verify a staff member's
account UUID against the institutional record before registration.
To try an allocation change, remove `DEMO-L1` from `DEMO-CSC101-2026-1`,
check that lecturer access is revoked, then assign it again.

### Qualification commands

```sh
php artisan test
vendor/bin/pint --test
npm run typecheck
npm run build
```

See [AGENTS.md](AGENTS.md) for engineering rules and the location of the design artifacts.
