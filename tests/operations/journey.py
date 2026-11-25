"""Isolated HTTP clients. No external target parameter or redirect following."""

from concurrent.futures import ThreadPoolExecutor
from http.client import HTTPConnection
from http.cookies import SimpleCookie
import json
import os
from pathlib import Path
import re
from threading import Barrier
from time import perf_counter
from urllib.parse import unquote, urlsplit


def require(ok, message):
    if not ok:
        raise RuntimeError(message)


def learner(name, course, exam, barrier):
    cookies = {}
    timings = []

    def hit(label, method, path, expected, payload=None, rotate=True):
        headers = {"Accept": "application/json", "X-Inertia": "true"}
        if cookies:
            headers["Cookie"] = "; ".join(f"{k}={v}" for k, v in cookies.items())
            headers["X-XSRF-TOKEN"] = unquote(cookies["XSRF-TOKEN"])
        if payload is not None:
            headers["Content-Type"] = "application/json"
        connection = HTTPConnection("127.0.0.1", int(os.environ["QA_PORT"]), timeout=10)
        start = perf_counter()
        try:
            connection.request(method, path, json.dumps(payload) if payload is not None else None, headers)
            response = connection.getresponse()
            data = response.read()
            timings.append([label, round((perf_counter() - start) * 1000, 2), response.status])
            require(response.status == expected, f"{name} {label}: {response.status} != {expected}")
            for key, value in response.getheaders():
                if rotate and key.lower() == "set-cookie":
                    cookies.update({k: v.value for k, v in SimpleCookie(value).items()})
            if expected == 302:
                return urlsplit(response.getheader("Location")).path
            return json.loads(data) if expected == 200 else None
        finally:
            connection.close()

    barrier.wait(timeout=10)
    hit("login form", "GET", "/login", 200)
    hit("sign in", "POST", "/login", 302, {"email": f"{name}@demo.example.test", "password": "password"})
    page = hit("course", "GET", f"/courses/{course}", 200)
    require(page["props"]["course"]["id"] == course, "wrong course")
    barrier.wait(timeout=10)
    start = f"/examinations/{exam}/start"
    with ThreadPoolExecutor(2) as retry:
        starts = [retry.submit(hit, "simultaneous start", "POST", start, 302, None, False) for _ in range(2)]
        paper, duplicate = [task.result() for task in starts]
    require(paper == duplicate, "duplicate attempt on concurrent start")
    require(re.fullmatch(r"/attempts/[\da-f-]{36}", paper), "no attempt issued")
    page = hit("paper", "GET", paper, 200)
    q = page["props"]["questions"][0]["id"]
    save = f"{paper}/answers/{q}"
    ack = hit("autosave", "PUT", save, 200, {"answer": name, "revision": 0})
    require(ack == {"revision": 1}, "missing acknowledgement")
    hit("stale save", "PUT", save, 409, {"answer": "stale", "revision": 0})
    record = hit("reconnect", "GET", paper, 200)["props"]["questions"][0]
    require((record["value"], record["revision"]) == (name, 1), "acknowledged value lost")
    for label in ["submit", "retry submit"]:
        require(hit(label, "POST", paper + "/finish", 302) == paper, "wrong receipt")
    require(hit("receipt", "GET", paper, 200)["props"]["attempt"]["state"] == "submitted", "not submitted")
    hit("attempt cap", "POST", start, 409)
    return {"learner": name, "attempt": paper.split("/")[-1], "question": q, "requests_ms": timings}


if __name__ == "__main__":
    root = Path(os.environ["QA_ROOT"])
    course_id, exam_id, names = json.loads((root / "ids.json").read_text())
    gate = Barrier(len(names))
    with ThreadPoolExecutor(len(names)) as pool:
        tasks = [pool.submit(learner, n, course_id, exam_id, gate) for n in names]
        failures = [f"{name}: {task.exception()!r}" for name, task in zip(names, tasks) if task.exception()]
        require(not failures, "; ".join(failures))
        results = [t.result() for t in tasks]
    print(json.dumps(results, indent=2))
