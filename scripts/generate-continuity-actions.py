#!/usr/bin/env python3
"""Publish only explicitly approved, minimal continuity metadata."""

import argparse
import json
from pathlib import Path

APPROVED = "portal-public-approved"
CONTINUITY = "portal-public-continuity"
STATES = ("active", "blocked", "completed", "queued", "open")


def labels(issue):
    return {x.get("name", "") for x in issue.get("labels", []) if isinstance(x, dict)}


def project(issue):
    names = labels(issue)
    if not {APPROVED, CONTINUITY} <= names or issue.get("pull_request"):
        return None
    number = issue.get("number")
    if not isinstance(number, int) or number < 1:
        return None
    state = next((s for s in STATES if "portal-state:" + s in names), "open")
    return {"id": f"continuity-{number}", "issue": number,
            "title": f"Continuity work #{number}", "status": state}


def build(issues, generated_at):
    actions = [item for issue in issues if (item := project(issue)) is not None]
    actions.sort(key=lambda a: a["issue"], reverse=True)
    return {"schema_version": 2, "generated_at": generated_at, "actions": actions}


def self_test():
    private = {"number": 7, "title": "PRIVATE TITLE", "body": "PRIVATE BODY",
               "assignees": [{"login": "PRIVATE USER"}], "html_url": "PRIVATE URL",
               "labels": [{"name": CONTINUITY}]}
    assert build([private], "test")["actions"] == []
    private["labels"].append({"name": APPROVED})
    result = build([private], "test")
    assert result["actions"] == [{"id": "continuity-7", "issue": 7,
                                  "title": "Continuity work #7", "status": "open"}]
    encoded = json.dumps(result)
    for secret in ("PRIVATE TITLE", "PRIVATE BODY", "PRIVATE USER", "PRIVATE URL"):
        assert secret not in encoded


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("issues_json", nargs="?")
    parser.add_argument("output_json", nargs="?")
    parser.add_argument("--generated-at")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        print("continuity synthetic projection passed")
        return
    if not all((args.issues_json, args.output_json, args.generated_at)):
        parser.error("issues_json, output_json and --generated-at required")
    payload = build(json.loads(Path(args.issues_json).read_text()), args.generated_at)
    Path(args.output_json).write_text(json.dumps(payload, indent=2) + "\n")


if __name__ == "__main__":
    main()
