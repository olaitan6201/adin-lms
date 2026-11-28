# Adin LMS agent guide

Custom Laravel 13 application with Inertia 3, React 19 and strict TypeScript. PostgreSQL and MySQL 8.0.16+ are supported server databases; SQLite is supported locally. Laravel owns navigation, authorization and validation. Moodle is a content exchange target only.

## Mandatory orchestration point — every task, every agent

Start at `.agents/design-principles/design-principles/SKILL.md` and its authoritative
`references/governance/adaptive-workflow.md`. This local pack governs discovery,
design, implementation, review, verification and handover. Framework guidance,
sprint handoffs and tooling below support that workflow; none replaces it.
The same entry point applies to delegated work and resumed sessions.
Before planning, editing, delegating or reviewing, read `agents/bootstrap.md`
and `agents/registry.yaml` in that pack, then read and follow the instruction
file for each applicable role. Use the role's stated scope, write permissions
and evidence requirements. Give delegated agents the exact role file to read.
If the user's intent is unresolved after checking the instructions and the
repository, ask the user rather than making the product decision for them.
`.agents/` is intentionally local: if the pack is missing, stop and request
it rather than substituting another copy or claiming compliance.

1. **At intake, before any edits:** select the smallest sufficient adaptive
   workflow mode. Map acceptance criteria to observable outcomes and select
   named pack roles by affected surface, risk and stage; record why roles apply
   or do not. Use `.agents/product-requirements.md` and `.agents/docs/` for LMS
   requirements. Quick work stays Quick; do not add inapplicable roles or stages.
2. **At each applicable stage:** Adin LMS requires actual separate host
   subagent invocations for the selected named pack roles, from discovery and
   planning through implementation, testing and review as applicable. A generic
   host wrapper counts only if explicitly assigned the exact registry role and
   its instruction file. Give each role its scoped authority and expected evidence;
   keep one implementation owner per scope. Apply specialist guidance when the
   work is done, not as a final QA substitute. Record role IDs, invocation IDs,
   stages, boundaries, owners, decisions, evidence and blockers in `.agent-work/`.
3. **Before handover:** invoke a separate `senior-qa-engineer` who did not
   author the candidate for independent, evidence-backed qualification. Use the
   `design-principles` MCP together with the required local pack; apply
   `references/qa/qualification-protocol.md` and
   `references/qualification/enterprise-qualification.md`. Inventory the exact
   final candidate across staged, unstaged and untracked changes, distinguishing
   task changes from unrelated work. Check each [Engineering Bar](#engineering-bars)
   against every local task change, inspecting whole affected files, controllers
   and contracts, not only edited lines. Record evidence or a specific
   not-applicable reason for each bar, and verify real workflows and failure
   cases at the required boundaries. If candidate bytes change, re-review the
   changes and rerun affected checks before qualifying the new candidate.
   Self-review or generic final QA does not replace independent qualification or
   an applicable specialist. A confirmed mandatory failure is **NOT QUALIFIED**;
   otherwise a missing required actor or blocked, missing or unverified required
   check is **INCONCLUSIVE**, not a pass or N/A. Report only the evidence-backed
   verdict for the assessed scope; passing tests, compiling or finishing a sprint
   is not acceptance of a complete product.

## Frontend boundaries

- Put application stylesheets in `resources/css/`, grouped by surface or domain.
- Keep illustrative records in `resources/js/data/<domain>/`. Route/page
  composition supplies them to views through typed inputs. Reusable components,
  hooks and layouts must not import sample records or contain substitute records.
- Keep page components in their functional or role directory under
  `resources/js/pages/`, and shared SVGs in `resources/js/components/icons/`.

### React component readability

- Use `resources/js/components/assessments/AttendanceDesk.tsx` as the reference for authored TSX, including pages, layouts, and shared controls.
- Write one statement per line. Expand control-flow and callback bodies; put the condition and its action on separate lines. Give multi-step actions such as saving a register a named handler rather than embedding the workflow in JSX.
- Wrap multiline JSX returns in parentheses. Put nested elements and sibling controls on separate, indented lines. For an element with four or more props, put each prop on its own line.
- Split by responsibility: keep the committed record with its owner and unsaved inputs with the editor. Meeting the line limit does not make compressed or mixed-purpose code readable.

## Commands

Keep agent-only work (scratch files, implementation logs, test evidence and screenshots) under `.agent-work/`, which is gitignored. Keep deliverable code, tests and developer documentation in their normal project paths.

See `README.md` for local setup. Run `php artisan test`, `vendor/bin/pint --test`, `npm run typecheck` and `npm run build` for a cross-stack change. Verify locking and production-specific migrations on PostgreSQL.

Run `npm run lint` for frontend changes. It includes the TSX layout check (`npm run lint:components`); review component ownership separately.

## Non-negotiables

- Application, admission and official registration belong to the existing platform. Key roster imports by stable upstream student and offering IDs; replay safely and revoke withdrawn access without deleting academic history.
- Enforce offering scope, enrolment and ownership in policies, including downloads and exports. Never expose answer keys or unreleased grades in Inertia props.
- Persist exam answers before acknowledging autosave. Enforce deadlines and attempt limits on the server under concurrency. Version submissions, score changes and published results. Audit grading, moderation and release.
- Every domain table has a Laravel-generated UUIDv7 `id`; use UUID foreign keys and a default string length of 191; enforce natural uniqueness separately. Store exact scores and use institutional grading policies.

## Engineering Bars

- In each `routes/web/` module, put imports before route registration. Group
  endpoints by resource prefix or controller under one common middleware group;
  keep guest, authenticated and provider callbacks separate where access differs.
  Name endpoints at declaration and preserve public URLs on refactors.
- Model closed sets of domain states and audit outcomes with string-backed
  enums. Cast persisted values at the model and serialize the wire value at
  the response boundary. Human-readable copy and unique route names are not enums.

- Keep controllers thin. Use Form Requests, policies, API Resources for outbound records, backed enums on string columns, and domain services under `app/Services/<Domain>/`. Split routes by prefix as modules grow. Prefer Laravel facilities before adding packages.
- Target 150 lines per authored PHP/TS/TSX file, tests included; 200 is the hard review limit. Split by responsibility. One statement per line.
- Use PHPUnit feature tests at HTTP and persistence boundaries; place React tests beside the module in `__tests__/` when introducing Vitest. Verify material UI changes on mobile and desktop, including keyboard use, empty/error states and WCAG 2.2 AA.
- One logical change per scoped conventional commit. Use evidence proportionate to the change and state which checks ran.

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

## Foundational Context

This application is a Laravel application running on PHP 8.4. Always use the APIs that match the installed major version of each package — do not assume a version.

Before relying on a package's API, confirm its installed version:
- PHP packages: run `composer show --direct` to list direct dependencies with versions, or `composer show <vendor/package>` for a single package.
- JS packages: check `package.json` for the installed versions.

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If a frontend change doesn't show in the UI or you get a "Unable to locate file in Vite manifest" error, run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Use `search-docs` before changes that depend on Laravel ecosystem APIs, behavior, configuration, or version-specific syntax. Skip it for copy-only edits and other changes where package documentation is irrelevant. Reuse sufficient results already in context instead of searching again.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Project Rules

- This project contains committed, area-grouped rules in `.ai/rules` when that directory exists, including path-scoped framework guidelines under `.ai/rules/boost`. Before you enter plan mode or create/edit any file, you MUST first: open @.ai/rules/index.md (it maps file globs to rule files), read every rule file whose globs cover the path(s) in scope, and run `grep -rin 'keyword' .ai/rules` to catch what a path match alone misses. Do not write code until you have read and are following every matching rule. If `.ai/rules` does not exist, continue without it.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.
- Activate the `deploying-to-cloud` skill whenever deploying to Laravel Cloud, configuring Cloud environments or resources, using the Cloud CLI, or troubleshooting Cloud deployments.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/Pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== phpunit/core rules ===

# PHPUnit

- This project uses PHPUnit. Create tests with `php artisan make:test --phpunit {name}`.
- Do not include the test suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read the `testing-best-practices` skill for guidance on coverage, naming, structure, dependency isolation, and review.

## Running Tests

- Run the narrowest set of tests that covers the change. Pass a file path or `--filter=testName` to `php artisan test --compact`.
- Rerun a test after each change to it.
- Run `vendor/bin/phpunit` to call the test runner directly. It accepts the same file path and `--filter=testName` arguments.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>
