"""Ubuntu /usr/bin/python3 (stdlib test SMTP sink); run from checkout root."""
from collections import Counter
from email import policy
from email.parser import BytesParser
from email.utils import getaddresses
import hashlib
import os
from pathlib import Path
import secrets
import sqlite3
import subprocess
from tempfile import TemporaryDirectory
import threading
from test.support import asyncore, smtpd

receipts = []


class Sink(smtpd.SMTPServer):
    def process_message(self, peer, mailfrom, rcpttos, data, **kwargs):
        message = BytesParser(policy=policy.default).parsebytes(data)
        recipients = [addr for _, addr in getaddresses(message.get_all("to", []))]
        if (peer[0] != "127.0.0.1" or recipients != rcpttos or len(rcpttos) != 1
                or not rcpttos[0].endswith("@demo.example.test")
                or message["Subject"] != "New LMS notification"
                or message.get_body().get_content().strip()
                != "You have a new notification. Sign in to the LMS to view your inbox."):
            return "550 unexpected test message"
        receipts.append((rcpttos[0], str(message["Message-ID"]), hashlib.sha256(data).hexdigest()))


work = Path(".agent-work/qualification-runs")
work.mkdir(parents=True, exist_ok=True)
with TemporaryDirectory(dir=work.resolve()) as tmp:
    base = Path(tmp)
    sha = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
    print("Source", sha)
    with subprocess.Popen(["git", "archive", sha], stdout=subprocess.PIPE) as archive:
        subprocess.run(["tar", "xf", "-", "-C", tmp], stdin=archive.stdout, check=True)
        assert archive.wait() == 0
    subprocess.run(["cp", "-a", "--reflink=auto", "vendor", tmp], check=True)
    db = base / "mail.sqlite"
    db.touch()
    sink = Sink(("127.0.0.1", 0), None)
    threading.Thread(target=asyncore.loop, kwargs={"timeout": 0.2}, daemon=True).start()
    env = dict(PATH=os.environ["PATH"], HOME=tmp, APP_ENV="testing", APP_KEY=secrets.token_hex(16),
               APP_URL="http://localhost", DB_CONNECTION="sqlite", DB_DATABASE=str(db),
               CACHE_STORE="database", QUEUE_CONNECTION="database", MAIL_MAILER="smtp",
               MAIL_HOST="127.0.0.1", MAIL_PORT=str(sink.socket.getsockname()[1]),
               MAIL_FROM_ADDRESS="notice@example.test")

    def run(*args):
        subprocess.run(["php", "artisan", *args, "--no-interaction"], cwd=base,
                       env=env, stdout=subprocess.DEVNULL, timeout=45, check=True)

    run("migrate", "--seed")
    run("community:notify")
    run("community:notify")
    run("queue:work", "database", "--stop-when-empty", "--sleep=0", "--tries=1")
    run("community:notify")
    with sqlite3.connect(db) as conn:
        expected = Counter(row[0] for row in conn.execute(
            "SELECT u.email FROM notification_deliveries d JOIN notifications n ON n.id=d.notification_id "
            "JOIN users u ON u.id=n.recipient_id WHERE d.status='delivered' AND d.delivered_at IS NOT NULL "
            "AND d.attempt_count=1"))
        assert sum(expected.values()) == conn.execute("SELECT count(*) FROM notification_deliveries").fetchone()[0]
        assert not conn.execute("SELECT id FROM jobs UNION ALL SELECT id FROM failed_jobs").fetchall()
    assert receipts and expected == Counter(r[0] for r in receipts)
    assert all(r[1] for r in receipts) and len(set(r[1] for r in receipts)) == len(receipts)
    for recipient, mid, digest in receipts:
        print("SMTP receipt", recipient, mid, digest)
    print("PASS:", len(receipts), "MIME envelopes/bodies matched database deliveries; rescan queued none.")
    sink.close()
