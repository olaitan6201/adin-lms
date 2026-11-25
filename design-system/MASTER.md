# Adin learning portal — product design contract

**Scope:** the Laravel/Inertia LMS. This is a design and acceptance contract, not a claim of university brand approval. Admissions and official registration remain upstream. The runtime design tokens live in `resources/css/`; the asset configuration lives in `config/branding.php`.

## Visual direction

Use an institutional editorial hierarchy: a legible masthead, compact navigation, clear academic titles, and ruled sequences of work. The primary object is a course, assessment or decision—not a metric card. Forest green carries identity and primary actions. Warm gold is an accent on appropriately contrasting surfaces, not small text on white. Keep status understandable without colour. The initial palette is sampled from a secondary reproduction, not an official brand manual. Do not present an independently drawn product mark as the university crest.

## Workspaces

| Entry | User’s first decision | Required destination |
|---|---|---|
| Student home | What is due or ready to resume? | The actual released activity in the registered course. If nothing is due, present the next useful action rather than twelve zero counters. |
| Lecturer home | What needs my attention? | An allocated course, pending submission or teaching session. Prefer student/course names, dates and marking status to internal identifiers. |
| Officer/administrator home | Which exception or approval can I resolve? | The scoped pending record and its evidence. Omit actions the user cannot take. |
| Course | Where am I in this teaching week? | Ordered sections, resources, assessments, completion state and a next step. Teaching mode adds authoring and a clearly labelled learner preview. |
| Reports | Which outcomes do these figures represent? | A filtered report with defined numerator/denominator, period, population, and export. Reports do not double as a role’s home page. |

## Interaction and implementation

- Global navigation describes destinations; course navigation describes the selected offering. A mobile menu must expose equivalent actions, restore keyboard focus on close and identify the current destination.
- Use a real heading hierarchy, labelled native controls and visible focus. Forms communicate validation inline and preserve recoverable input. Submission and release actions show authoritative saved state, not optimistic proof of receipt.
- Use text and responsive spacing before decoration. Long names, empty cohorts, missed deadlines, narrow screens and large text are normal input states.
- Do not copy Moodle's theme. Emulate the interaction contracts that matter: a learner-visible course index, discoverable activity authoring, group ownership, per-question scoring and explicit grade release.
- Source-backed permissions and release predicates belong on the server. Navigation may hide a link; the endpoint enforces the rule independently.

## Review before release

Review the built application with seeded **student, lecturer and officer** accounts. At desktop and phone widths, use keyboard and pointer to follow one teaching week through publication, submission, marking and moderation. Check direct links after withdrawal. Record the revision, fixture, screenshot, failed states and persistent result in `.agent-work/`. A successful component build or attractive static screenshot does not qualify that journey.
