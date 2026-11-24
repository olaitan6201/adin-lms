# Operating Adin LMS

Start with the project's `README.md` for installation. For a practice session use a fresh local checkout, disposable database, demo seeder, local mail sink and synthetic users. Never seed demonstration identities into production.

## Who does what

[Watch the silent walkthrough](operations-walkthrough.webm): an authorised operator saves a retention period in a disposable database; a subject gives and withdraws optional consent. The closing screens show the four desks at mobile and desktop widths. The demo value is illustrative, not a policy recommendation.

| Role | Training exercise | Check |
|---|---|---|
| Student | Sign in, open My courses, follow a registered offering; open `/operations/consent`, read notice 1, give and withdraw consent. | The choice changes on reload. Consent is optional and does not enrol or withdraw the learner. |
| Lecturer | Use the allocated offering and roster; compare it with an unallocated offering. Review materials and assessment access with a test learner before teaching. | Withdrawn learners lose delivery access; course copying does not grant access to another class. |
| Academic administration | Verify the upstream offering and student identifiers; use `php artisan help roster:import` for the registration-delta contract. Apply the same test delta twice, then a later withdrawal. | No duplicate enrolment; preserve history. Correct registration at source. |
| ICT | After MFA, open `/operations`. Interpret session count as live, unrevoked sessions, not unique people. Check failed password/MFA events over 24h and currently failed deliveries. Inspect `/security/login-events` with separate authority. | Confirm timestamps and queue-worker health before retrying delivery. Never paste credentials or mail content into tickets. |
| Exams and QA | Exercise autosave, refresh, close and compare the saved revision on a synthetic paper; repeat after the [recovery rehearsal](recovery.md). Verify unpublished grades remain private. | Retain revision and result evidence with no identifying data. |
| Privacy officer | Follow the [case procedure](privacy.md), including denial, expiry, incident referral and a two-person export or limited purge. | Verify the subject, approval, audit receipt and secure delivery channel. |

## Source, data and maintenance

- The authoritative install schema is `database/migrations/2026_11_25_000001_create_uuid_lms_schema.php`. Models live in `app/Models`; trusted administrative commands in `app/Console/Commands`; permission rules in `app/Services/Authority`. Official registration remains upstream.
- `php artisan route:list --path=operations` describes the installed session-authenticated web endpoints. The routes in `routes/web/operations.php` use the existing authenticated web stack, CSRF and privileged-session checks. There is no bearer-token export API. Permission gates are `operations.manage`, `privacy.manage`, `portability.manage`; subject consent needs an active session only.
- On the approved maintenance host run `php artisan schedule:list` and `php artisan queue:failed` to inspect scheduled work and queue failures. Check that the service manager actually runs the scheduler and workers. Confirm storage free space, DB growth, certificate expiry, backup age and an independent restore. A successful dump is not a successful restore.
- For updates: capture revision, locked dependencies and recoverable snapshot; build/test the candidate against a restored staging copy (`php artisan test`, `vendor/bin/pint --test`, `npm run typecheck`, `npm run build`). Rehearse migrations and rollback, then promote only the approved revision during a change window. Coordinate workers, caches and static assets with the release. Never run `migrate:fresh` on operational data.
- To disable S18, withdraw its route entry and grants in a maintenance release and revert its scoped code commits. Keep audit and consent history. Restoring a whole database to undo one import or purge would also rewind unrelated changes: instead use an isolated restore for selective recovery under approval.

## Transfer and acceptance register

Transfer source and build instructions, locked dependency inventory (`composer licenses --format=json`, package-lock licence metadata), original asset licences, private object store inventory, deployment configuration and recovery keys through institution-owned channels. Record custody and rotation separately; never commit real keys. Third-party licences are distinct from institutional rights to custom code, imported content and recordings. Obtain a written rights statement and licence exceptions from the rights holders.

Before release, ICT and the institution must name the primary/deputy for hosting, databases, backups, privacy, academic data, security, and vendor escalation. Agree service hours, reporting channel, severity rules, response **and** resolution targets, escalation path, support funding and the start/end of a signed arrangement of at least 12 months. This guide does not constitute that agreement.

Record the approved peak CBT concurrency, test mix, browser/network profiles, measurement windows and RTO/RPO **before** measuring. Time normal pages against the approximate 3-second target; test slow/interrupted connections and simultaneous exam saves. Check the 99.5% monthly objective with external probes against an agreed denominator and exclusions. A local smoke check cannot prove monthly availability.

Collect separate dated UAT evidence from ICT, academic administrators, lecturers, students, exams and QA; log open findings with severity, owner and retest. Do not mark acceptance while high/critical issues remain. Institution-specific contacts, interoperability fixture agreement, disaster-recovery targets, load results, signed support and UAT are outstanding until supplied.
