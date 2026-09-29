#!/usr/bin/env python3
"""Fail closed if public projection gains unreviewed fields."""
import json
import pathlib
import sys

TOP = {"schema_version", "generated_at", "source", "issues", "commits"}
ISSUE = {"number", "kind", "title", "state", "updated_at", "public_summary", "portfolio_state"}
PROHIBITED = {"body", "requester", "email", "location", "assignees", "author", "html_url", "token", "password", "secret"}

def check(data):
    assert set(data) <= TOP, "unexpected top-level public field"
    assert data.get("schema_version") == 2, "unknown public schema"
    assert data.get("commits") == [], "commit messages require review"
    for issue in data["issues"]:
        assert set(issue) <= ISSUE and not (set(issue) & PROHIBITED), "unexpected issue field"
        assert issue["kind"] in ("ticket", "mission")
        assert issue["title"] == ("Ticket" if issue["kind"] == "ticket" else "Mission") + " #" + str(issue["number"])
        assert len(issue.get("public_summary", "")) <= 180
        assert "\n" not in issue.get("public_summary", "")
    return True

def self_test():
    sample = {"schema_version": 2, "issues": [{"number": 7, "kind": "ticket", "title": "Ticket #7", "state": "open", "public_summary": ""}], "commits": []}
    check(sample)
    for extra in ("body", "requester", "email", "location", "assignees", "html_url"):
        bad = json.loads(json.dumps(sample))
        bad["issues"][0][extra] = "synthetic prohibited value"
        try:
            check(bad)
        except AssertionError:
            pass
        else:
            raise AssertionError("accepted " + extra)

if __name__ == "__main__":
    if sys.argv[1:] == ["--self-test"]:
        self_test()
        print("synthetic contract checks passed")
    else:
        raw = pathlib.Path(sys.argv[1]).read_text()
        if raw.startswith("window.SOTE_PROJECT_DATA = "):
            raw = raw.removeprefix("window.SOTE_PROJECT_DATA = ").rstrip().removesuffix(";")
        check(json.loads(raw))
        print("public projection passed")
