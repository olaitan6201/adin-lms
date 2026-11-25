# Disposable database qualification

From the checkout root on Linux, install the locked Composer dependencies (including dev) with PHP 8.4. Use an unprivileged account with Python 3, `curl`, `setsid`, GNU coreutils, and either PostgreSQL 16 client/server tools (`pg_config`) or Ubuntu MySQL 8 client/server tools (`mysqld` on `PATH`). Local dependencies must match `composer.lock` at `HEAD`.

```sh
bash tests/operations/rehearse.sh sqlite suite
bash tests/operations/rehearse.sh pgsql suite
bash tests/operations/rehearse.sh mysql suite
bash tests/operations/rehearse.sh pgsql journey
bash tests/operations/rehearse.sh mysql journey
bash tests/operations/rehearse.sh pgsql extended
bash tests/operations/rehearse.sh mysql extended
/usr/bin/python3 tests/operations/smtp_drill.py
```

Each database invocation uses `git archive HEAD` including its fixtures, a private dependency copy and a fresh temporary directory. No developer `.env` or incoming service configuration is imported. The server databases use new socket-only instances; the four-worker PHP development server listens on a temporary loopback port. Exit status is nonzero on failed assertions. The database, session data and logical dump are deleted on exit. Keep stdout for the tested commit, engine, HTTP observations and restore duration.

**Fixture:** two separately authenticated, enrolled learners on the same published offering, one objective question and one allowed attempt each. Both clients start together; each also issues a duplicate concurrent start. Each saves one answer, receives a conflict on a stale revision, reconnects, submits twice and checks the attempt limit. After logical restore to a different database, the harness reconciles persisted attempt and question IDs with the HTTP receipts, checks answer revisions and values, timestamps, one private score per learner, and compares the rows to the pre-restore state.

**Extended:** observes the competing roster import waiting on a real backend lock, then verifies duplicate registration and stale registration after withdrawal leave one original enrolment and one interval. Exercises six simultaneous CBT clients, four HTTP workers and a database restore. The shared loopback client IP is subject to the application's six sign-ins per minute limit.

**Mail:** use Ubuntu's `/usr/bin/python3` with `test.support.smtpd` and `test.support.asyncore` available. An isolated seeded SQLite archive, real database worker and non-forwarding loopback SMTP sink compare envelope recipient counts, decoded MIME subjects/bodies and distinct message IDs against durable delivery records. Repeated scans must leave no queued or failed jobs. This does not contact an institutional relay or test TLS or mailbox routing.

**Interpretation:** timings are client-observed loopback HTTP response times, including connection and body transfer, without browser rendering. The restore timer covers database import only. A small dataset, four PHP workers, local storage and no think time are reproducible synthetic assumptions, not agreed institutional capacity. No claim about production tails, monthly uptime, external backups, private-object recovery, RTO/RPO, UAT or a signed support SLA follows from these runs. Agree workload, environment, failure scenarios, targets and evidence owners before a release rehearsal.
