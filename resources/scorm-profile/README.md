# Reading v1: package and player

Build a ZIP of exactly four root files with an unused output path:

```sh
zip -j reading.zip resources/scorm-profile/imsmanifest.xml \
  resources/scorm-static/reading.{html,js} tests/Fixtures/scorm/lesson.txt
```

Replace `lesson.txt` with your UTF-8 lesson (up to 32 KiB). The LMS matches all other files byte-for-byte and stores only the plain text. The package's `reading.html` remains unchanged for existing Reading v1 ZIPs. The LMS uses a separate, operator-owned `exercise.html` to display that text.

## Operator setup

1. Verify the LMS schema includes `scorm_packages` and `scorm_progress`. Set `APP_URL` to the canonical HTTPS LMS origin. Set `SCORM_STATIC_ORIGIN` to a **distinct HTTPS site**; the production policy requires different top-level domains from `com`, `org`, `net`, `edu`, `gov`, `uk`, `ng`. Use no port, path or trailing slash. Removing `SCORM_STATIC_ORIGIN` disables the workflow.
2. Serve only `player.html`, `exercise.html`, `player.js`, `reading.js` and `reader.css` from this revision’s `resources/scorm-static/` on the static site. Use the [Nginx include](static.nginx.conf.example) inside a dedicated TLS server and replace both origin placeholders. Reject unrelated hosts in the default vhost. Use a read-only root, no dynamic handlers, other tenants, cookies, SSO, redirects or service workers. Never place uploaded packages, private lessons, or the static root under the LMS document root. Do not log signed request headers or bodies.
3. On the LMS visit `/courses/{offering UUID}/scorm`. Allocated lecturers can import; registered learners can open a published offering’s reading, pause, resume or complete it. A new launch invalidates older tabs. One signed write per launch, 30-minute expiry. Notes are limited to 4096 UTF-8 bytes. Completion is final; the score is a reading indicator, not an assessed grade.
4. Run `bash tests/scorm-browser/run.sh` from the repository root for a synthetic import and save/resume on independent loopback sites. Captures go under `.agent-work/browser-tests/run-scorm-*/`. This verifies the local isolation contract, not production TLS, DNS or browser configuration.
