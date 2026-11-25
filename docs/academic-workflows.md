# Academic workflow handoff

| Seeded official | Academic portal access |
| --- | --- |
| Institutional administrator | Configure organisation and calendar, edit and review curriculum drafts, prepare and publish offerings. |
| Super administrator | Same access, plus approval of reviewed curriculum versions. |
| QA officer | Read-only curriculum and outcome coverage. |
| Dean / head of department | Read the hierarchy within the granted faculty / department. |
| Student | Registered course detail and board; no academic administration links or actions. |

`AuthoritySeeder` defines role permissions. Assign roles through the existing scoped grant workflow. Navigation is refreshed from grants on Inertia responses; controllers independently enforce access on direct requests. Run the seeder through the institution's deployment process to update an existing database.

`Offering::status` and `Curriculum::status` are string-backed `OfferingStatus` and `CurriculumStatus` enum cases. Compare model attributes to cases. JSON and query-builder projections carry lowercase strings. Approved versions remain immutable: editing starts a separate numbered draft. Course structure copies target an empty offering of the same course in another semester.

## Verification record

- PostgreSQL **16.15** and MySQL **8.0.46**, each in its own newly initialized socket-only instance. A first transaction held its change uncommitted; an independent PHP process issued the same operation. Backend lock tables confirmed the second connection was waiting before the first transaction committed.
- **Approve:** the second approval was rejected after reading the committed status. **Fork:** both requests succeeded under distinct version numbers (2 and 3). **Copy:** a second copy into the same offering was rejected; exactly one destination module persisted.
- Scoped HTTP and persistence tests used SQLite, including the unmodified `AuthoritySeeder` and the real scoped role-assignment command. Browser checks at 390px and 1280px covered keyboard-operated academic forms and learner course-board navigation.
- Per-run logs and browser evidence: `.agent-work/academics-delivery.md`. These results concern the listed operations, not all possible concurrent writers or deployment environments.
