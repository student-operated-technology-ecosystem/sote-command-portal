#!/usr/bin/env python3
"""Generate a public-safe continuity work projection from SOTE-framework issues."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

PREFIX = "CONTINUITY |"
STATUS_PREFIX = "status:"


def extract_parent(body: str):
    match = re.search(r"\*\*Parent[^\n]*:\*\*\s*#(\d+)", body or "", re.I)
    return int(match.group(1)) if match else None


def extract_controls(body: str):
    match = re.search(r"\*\*Continuity controls:\*\*\s*([^\n]+)", body or "", re.I)
    if not match:
        return []
    controls = []
    for value in match.group(1).split(","):
        normalized = re.sub(r"[^a-z0-9]+", "_", value.strip().lower()).strip("_")
        if normalized:
            controls.append(normalized)
    return controls


def extract_section(body: str, heading: str):
    pattern = rf"(?ims)^##\s+{re.escape(heading)}\s*$\s*(.*?)(?=^##\s+|\Z)"
    match = re.search(pattern, body or "")
    if not match:
        return None
    text = re.sub(r"\s+", " ", match.group(1)).strip()
    text = re.sub(r"^[-*]\s+", "", text)
    return text[:500] if text else None


def issue_status(issue: dict):
    for label in issue.get("labels") or []:
        name = label.get("name") if isinstance(label, dict) else str(label)
        if name and name.startswith(STATUS_PREFIX):
            return name[len(STATUS_PREFIX) :]
    return issue.get("state") or "open"


def project(issue: dict):
    title = issue.get("title") or ""
    body = issue.get("body") or ""
    short_title = title[len(PREFIX) :].strip() if title.startswith(PREFIX) else title
    return {
        "id": f"continuity-{issue['number']}",
        "title": short_title,
        "status": issue_status(issue),
        "issue": issue["number"],
        "url": issue.get("html_url"),
        "parent_issue": extract_parent(body),
        "controls": extract_controls(body),
        "assignees": [a.get("login") for a in (issue.get("assignees") or []) if a.get("login")],
        "summary": extract_section(body, "Objective"),
        "completion_rule": extract_section(body, "Completion Rule"),
        "updated_at": issue.get("updated_at"),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("issues_json")
    parser.add_argument("output_json")
    parser.add_argument("--generated-at", required=True)
    args = parser.parse_args()

    issues = json.loads(Path(args.issues_json).read_text())
    actions = [project(i) for i in issues if (i.get("title") or "").startswith(PREFIX)]
    actions.sort(key=lambda a: a["issue"], reverse=True)

    payload = {
        "schema_version": "1.1",
        "generated_at": args.generated_at,
        "generated_for": "visibility-layer-phase2",
        "source_model": "Automatically generated public-safe continuity work projection backed by canonical SOTE-framework GitHub issues",
        "source_rule": "Open GitHub issues whose titles begin with CONTINUITY |",
        "actions": actions,
    }
    Path(args.output_json).write_text(json.dumps(payload, indent=2) + "\n")


if __name__ == "__main__":
    main()
