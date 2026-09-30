#!/usr/bin/env python3
"""Fail publishing if continuity projection contains unreviewed fields."""
import json
import re
import sys
from pathlib import Path

TOP = {"schema_version", "generated_at", "actions"}
ACTION = {"id", "issue", "title", "status"}
STATES = {"active", "blocked", "completed", "queued", "open"}


def check(payload):
    assert set(payload) == TOP and payload["schema_version"] == 2
    assert isinstance(payload["actions"], list)
    for action in payload["actions"]:
        assert set(action) == ACTION
        assert isinstance(action["issue"], int) and action["issue"] > 0
        assert action["id"] == f"continuity-{action['issue']}"
        assert action["title"] == f"Continuity work #{action['issue']}"
        assert action["status"] in STATES


if __name__ == "__main__":
    check(json.loads(Path(sys.argv[1]).read_text()))
    print("continuity public contract passed")
