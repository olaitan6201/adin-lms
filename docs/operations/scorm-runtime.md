# Optional SCORM 1.2 Reading v1 player

This is a single-SCO reading activity, separate from the course-exchange desk. It is **disabled without an isolated site**. There is no general SCORM certification or support for vendor courseware. Progress and the fixed reading-completion score are learner-reported, not exam evidence; nothing enters the gradebook.

## Enable on an isolated site

1. Use the LMS schema containing `scorm_packages` and `scorm_progress`. For an existing installation, verify those tables were provisioned before enabling the feature; Laravel will not rerun an already-recorded baseline migration. Disable by removing the origin setting, retaining the history.
2. On a dedicated, cookieless HTTPS site, serve **only the four reviewed files in `resources/scorm-static/`**, copied from the same revision as the LMS, from a read-only static root. Never copy ZIPs, `lesson.txt`, app files or user data there. The site must have no shell/CGI/PHP/proxy handlers, other tenants, cookie-setting middleware, redirects, SSO, service workers, or parent-domain cookies. Start with a fresh dedicated site. Use `scorm-static.nginx.conf.example` inside its TLS vhost, replace `LMS_ORIGIN`, and reject unrelated hostnames at the default vhost. Do not put this root under LMS `public/`. Keep the LMS document root at `public/`.
3. Set `APP_URL` to the canonical LMS origin and `SCORM_STATIC_ORIGIN` to the static origin, without paths or trailing slashes. The request origin must match `APP_URL` exactly. The conservative production profile requires DNS names on **different TLDs** from `com`, `org`, `net`, `edu`, `gov`, `uk`, `ng`; no custom ports. Sibling domains, HTTP and IP literals are refused. Only `APP_ENV=testing` permits the exact loopback host pair used below. Configure trusted proxies and refresh cached config as usual. Keep real sessions host-only, Secure, HttpOnly and SameSite. Do not log request bodies, capability headers, or CSRF values. Disable request-body tracing on these endpoints.
4. Link to `/courses/{offering UUID}/scorm`. An allocated lecturer imports the ZIP with a unique title. Registered learners in a published offering can open, pause, resume and complete the activity. Withdrawn access is checked on every launch/save. A new launch supersedes an earlier open tab. Copy an unsaved note before leaving a failed or expired session.

## Package contract

Build a ZIP with four root files. The three shipped files must match exactly (including line endings); arbitrary code and XML are never parsed or extracted. The only author-editable content is plain UTF-8 `lesson.txt` (1–32768 bytes), shown as text. The title is supplied at import. From the repository root, with a fresh output path:

```sh
zip -j reading.zip resources/scorm-profile/imsmanifest.xml resources/scorm-static/reading.{html,js} tests/Fixtures/scorm/lesson.txt
```

The fixed SCO uses the SCORM 1.2 synchronous `API` convention, with a private asynchronous persistence handshake before acknowledging commit/finish in this player. Supported data: `cmi.core.lesson_status` (`not attempted`, `incomplete`, `completed`), `cmi.core.score.raw` (empty initially, `0` paused, `100` completed), `cmi.core.exit` (`suspend` or empty), derived `cmi.core.entry`, and `cmi.suspend_data` (reading note, ≤4096 UTF-8 bytes). Completion is final. No grading, interactions, sequencing, arbitrary scores, author-supplied assets, general API discovery/error model, or SCORM 2004 support.

Only the LMS parent signs the exact JSON bytes. It checks both message origin and source window, retains the random one-use HMAC key, and submits same-origin with CSRF. The atomic update requires the current enrolment/package, session-bound grant digest and unexpired 30-minute lease. No grant travels in a URL or to the static site. The static site receives the lesson and current progress in memory; no private assets are public URLs. The signature does not attest that a human actually read the lesson.

Local checks: `php artisan test --filter=ScormRuntimeTest` and `bash tests/scorm-browser/run.sh`. These exercise the restricted profile only. Production TLS, DNS, cookie policies, logging and reverse-proxy settings must be verified on the actual deployment.
