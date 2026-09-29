#!/usr/bin/env python3
"""Verify security headers on the actual deployed response."""
import sys
import urllib.request

REQUIRED = ("content-security-policy", "strict-transport-security",
            "x-content-type-options", "referrer-policy", "permissions-policy")

def check(headers):
    missing = [name for name in REQUIRED if not headers.get(name)]
    if missing:
        raise SystemExit("missing security headers: " + ", ".join(missing))
    if headers.get("x-content-type-options", "").lower() != "nosniff":
        raise SystemExit("X-Content-Type-Options must be nosniff")
    if "default-src" not in headers["content-security-policy"]:
        raise SystemExit("CSP default-src missing")
    print("required security headers present")

if __name__ == "__main__":
    if sys.argv[1:] == ["--self-test"]:
        check({x: ("default-src 'self'" if x == "content-security-policy" else "nosniff" if x == "x-content-type-options" else "test") for x in REQUIRED})
    else:
        with urllib.request.urlopen(sys.argv[1], timeout=15) as response:
            check({k.lower(): v for k, v in response.headers.items()})
