# Adin LMS

Adin is the institution’s standalone learning management system, built with Laravel, Inertia, React and TypeScript. Lecturers teach and assess in Adin; students study, submit work and view released results here.

## Standalone adoption path

| Responsibility | System of record |
|---|---|
| Applications, admissions and official registration | Existing institutional platform. Adin consumes roster revisions keyed by upstream student and offering IDs. A withdrawal removes access without erasing academic history. |
| Teaching, assignments, question banks, timed exams, marking, moderation, released grades and reporting | Adin. These workflows must work without a Moodle installation or an external gradebook. |
| Moving reusable course material | File exchange. The operations desk supports a subset of SCORM 1.2 text resources, IMS Common Cartridge 1.1 text imports and native Adin backups. It does not restore Moodle `.mbz` archives. |

For a first course, import the roster, allocate the lecturer, prepare an offering and publish its lessons. Run a learner through an assignment and a timed exam, then have staff mark, moderate and release a result. Check that the student can reopen the submission receipt and see only released grades. Repeat with a withdrawn registration to check access and history. Preserve the Weekline student workspace as the entry point.

Prioritise improvements that complete a real teaching workflow in Adin. For example, a student should be able to download a readable copy of a published result; a department migrating materials should be able to tell which content the importer will preserve. Expand exchange formats against representative course files rather than adding a second LMS runtime.

## Local setup

If a delayed material notice reports “Missing rule history” after upgrading from the
intermediate `1409944` build, use a trusted backup or change record to establish the
previous prerequisite and the edit time. Run `php artisan community:reconcile-rule
<change-uuid> <prior-lesson-uuid-or-none> <microsecond> <evidence-reference>` as an
operator. This appends evidence; it does not change the lesson or send a notice.
Let the scheduled worker retry, or use `php artisan queue:retry <failed-job-uuid>`
if its retries were exhausted. Do not guess a missing rule or time.

Use PHP 8.4.1 or later in the PHP 8 series with Composer and PDO SQLite, and Node.js 24 with npm. PHP 8.4.1 is the minimum for the locked dependencies; use a current patch release for deployment. From a fresh checkout:

```sh
composer install
composer check-platform-reqs
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
initial migration: the LMS domain schema plus seven Laravel storage tables
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

### Transfer an existing `7259a81` or `98fbfe3` UUID database

Use `database/upgrades/7259a81/run.php` offline. Ordinary `artisan migrate`
skips the already-recorded filename. The transfer accepts the pinned inventory
of the original UUID schema or the previous `98fbfe3` baseline. Use a restored source and a new, **unseeded** destination on the
same engine. It never reads `.env`. First rehearse locally:
`bash tests/Fixtures/Upgrade7259a81/rehearse.sh sqlite` (also `pgsql` and `mysql`;
install PHP PDO drivers and local PostgreSQL or MySQL server/client binaries).
Pass `previous` after the engine to rehearse `98fbfe3`. Its existing SCORM,
feedback, privacy and other domain records are copied and reconciled. Both
paths leave the new module prerequisite and visibility receipt fields null.

1. Stop application writes, workers, scheduled jobs and integrations. Keep the
   old app/database intact. Back up the database, matching private files and
   encryption keys; verify restoration in isolation. Keep the backup artifact
   and the restored source immutable. Budget space for a full copy, indexes
   and a single transaction’s journal/WAL. Do not expose either copy to traffic.
2. Prepare a separate destination using this checkout's `php artisan migrate`
   pointed **only** at the empty target, without seeders. Prepare per engine:

   | Engine | `UPGRADE_SOURCE` | `UPGRADE_DSN` (destination) |
   |---|---|---|
   | SQLite | absolute path to restored, checkpointed SQLite file | `sqlite:/absolute/path/new.sqlite` |
   | MySQL | database name of restored dump on destination server | `mysql:unix_socket=/path/mysql.sock;dbname=new_lms` |
   | PostgreSQL | `legacy` | `pgsql:host=/path/to/socket;dbname=new_lms` |

   For PostgreSQL, restore the old dump into a **new isolated database**
   first, rename its restored `public` schema to `legacy`, create a fresh
   `public`, then run the target migration there. Use a target owner without
   superuser privileges and grant read access to the restored tables and
   sequences; use normal constraint enforcement. For MySQL grant SELECT on
   the restored source, and DML plus ALTER on the isolated InnoDB target.
   Keep runtime users away from the restored schema.
3. Export the two variables above and `UPGRADE_BACKUP` (path to the nonempty
   backup that was restored). Supply server credentials through
   `UPGRADE_USER` / `UPGRADE_PASSWORD` in the private operator environment.
   From the checkout root:

   ```sh
   umask 077
   php database/upgrades/7259a81/run.php plan > "$PRIVATE_DIR/plan.json"
   # Review the backup, target hash, counts, digests and history_exceptions.
   # Complete registrar reconciliation below before apply if the count is nonzero.
   php database/upgrades/7259a81/run.php "apply:$PLAN_HASH" > "$PRIVATE_DIR/receipt.json"
   php database/upgrades/7259a81/run.php "cutover:$PLAN_HASH" > "$PRIVATE_DIR/cutover.json"
   ```

   Set `PRIVATE_DIR` to a private directory outside the checkout and `PLAN_HASH`
   to the reviewed 64-character `plan` value. The read-only plan binds the
   backup, data and target location. Apply recomputes it, copies original
   values/UUIDs with constraints enabled, restores self-links, verifies counts
   and every original column in primary-key order, and commits together.
   It preserves recorded policy/grade history; it does not invent historical
   rubric snapshots. New tables start empty and new nullable fields stay null.
4. On any error keep traffic on the old installation. Discard **only the
   isolated candidate**, prepare a fresh one, diagnose and re-plan. MySQL
   auto-increment counters can advance even after a failed transaction.
   Never run `migrate:fresh` or `migrate:rollback` on the source. On success,
   retain the private receipt and independently verify an actual receipt,
   published grade, withdrawal/access denial and file readback before any
   approved switch. Review role-catalogue changes separately. Before admitting
   writes rollback means pointing the old code at its untouched database;
   after new writes, freeze and reconcile them before reverting or they will
   be lost. The transfer neither switches connections nor deploys code.

**Registrar reconciliation (before apply and again immediately before switching).**
The old history page showed the highest published revision with an approval
timestamp. The new page also requires an approver and `approved` moderation.
The planner counts affected enrolments, including withdrawals, when the old
visible result would disappear or fall back to an earlier approved revision.
It checks publication times at execution; a newly visible exception invalidates
the old plan. The transfer never sets moderation or changes a grade.

If `history_exceptions` is nonzero:

1. Set `UPGRADE_REVIEW_DIR` to an empty, access-controlled `0700` directory
   outside the checkout and web root. Run `php database/upgrades/7259a81/run.php
   report`. It creates `review.json` exclusively (`0600`). Only this private
   report contains the affected grade UUIDs and any fallback grade UUIDs.
   Treat both as student records: send by the registrar’s restricted channel,
   never in tickets with public access, console logs or source control.
2. The registrar/exams office looks up each UUID in its authorized records
   and documents its decision in the institutional case system. If it accepts
   the stricter visibility for that case, set `decision` to
   `accept_candidate_visibility` and `case_ref` to an opaque case reference
   (1–64 letters, digits, hyphens or underscores). Preserve the plan, row
   order and UUIDs. Leave disputed or unevidenced cases unresolved: **stop
   cutover**. If academic action is required, use the authorized academic
   process, then take a new backup and plan. Never edit the restored grades.
3. The designated registrar signs the exact reviewed file in their own
   trusted environment, e.g. `openssl dgst -sha256 -sign registrar-private.pem
   -out review.sig review.json`. Return both files privately. Set
   `UPGRADE_REGISTRAR_PUBLIC_KEY` to the institution’s independently verified,
   operator-protected registrar public key, **not a key supplied with the
   report**. The private key must never be on the transfer host. Archive
   the signed review, receipt and cutover check under institutional retention.
4. Both `apply` and the read-only `cutover` command recompute the cases and
   verify complete signed coverage. Zero exceptions require no signature.
   A receipt alone does not clear cutover: keep the candidate offline,
   run `cutover` against the reconciled candidate and immutable source just
   before switching, and require success plus normal release authorization.
   If the data, plan or visibility changes, keep the old installation serving
   and repeat the transfer workflow against a fresh isolated candidate.

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

The local demo includes a teaching week with a reading, class, forum and open
assignment. The example grade boundaries belong only to this demo scenario.

### Repeatable browser journey

After `composer install` and `npm ci`, install a browser with
`npx playwright install chromium`, then run `npm run test:e2e`. Alternatively,
set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to an installed Chrome executable.
The runner builds the frontend, launches its own loopback-only Laravel server,
migrates and seeds a new SQLite database, then verifies real assignment
submission and readback on phone and desktop. It never resets the developer
database. Artifacts stay in `.agent-work/browser-tests/`.

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
