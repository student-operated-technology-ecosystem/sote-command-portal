#!/usr/bin/env python3
"""Generate employer-facing directory from instructor-approved GitHub issues.

Only open issues labeled portfolio-approved are shown. GitHub Pages is a static site,
so a GitHub Action materializes this JSON when submissions change.
"""
import json
import os
import re
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

OWNER_REPO = 'student-operated-technology-ecosystem/sote-command-portal'
OUT = Path('data/portfolio-directory.json')
EXAMPLE = {
    "id": "alex-morgan-example", "name": "Alex Morgan", "kind": "example",
    "program": "CIT-205 · Fictional instructional model",
    "summary": "Instructor-created example demonstrating portfolio structure and technical support evidence. This is not a real student.",
    "skills": ["Support tickets", "Knowledge base", "Validation", "Troubleshooting"],
    "site": "https://student-operated-technology-ecosystem.github.io/CIT-205-classroom/examples/exemplary-portfolio/",
    "github": "https://github.com/student-operated-technology-ecosystem/CIT-205-classroom/tree/main/examples/exemplary-portfolio",
}
def field(body, label):
    match = re.search(r'^' + re.escape(label) + r'\s*:\s*(.+?)\s*$', body, re.M | re.I)
    return match.group(1).strip() if match else ''
def safe_url(value):
    try:
        parsed = urlparse(value)
        return parsed.scheme == 'https' and bool(parsed.hostname) and not parsed.username and not parsed.password
    except ValueError:
        return False
def main():
    token = os.environ.get('GITHUB_TOKEN')
    if not token:
        raise RuntimeError('GITHUB_TOKEN is needed to pull approved portfolio submissions.')
    results = []
    page = 1
    while True:
        url = f'https://api.github.com/repos/{OWNER_REPO}/issues?state=open&labels=portfolio-approved&per_page=100&page={page}'
        req = urllib.request.Request(url, headers={
            'Accept':'application/vnd.github+json', 'Authorization':f'Bearer {token}',
            'User-Agent':'sote-portfolio-directory',
        })
        with urllib.request.urlopen(req, timeout=25) as response:
            issues = json.load(response)
        if not issues:
            break
        for issue in issues:
            if 'pull_request' in issue: continue
            body = issue.get('body') or ''
            consent = '- [x] This is my own portfolio' in body
            reviewed = '- [x] I reviewed the website' in body
            published = '- [x] My site is published' in body
            if not all((consent, reviewed, published)):
                continue
            site = field(body, 'Portfolio site URL (https://...)')
            github = field(body, 'GitHub repository URL (https://github.com/...)')
            name = field(body, 'Display name (as you want employers to see it)')
            program = field(body, 'Program or course')
            summary = field(body, 'Brief professional introduction (1-2 sentences)')
            skills = field(body, 'Skills demonstrated (comma separated)')
            if not name or not safe_url(site) or (github and (not safe_url(github) or urlparse(github).hostname != 'github.com')):
                continue
            results.append({'id':f'portfolio-{issue["number"]}', 'name':name[:120],
                            'kind':'student', 'program':program[:120], 'summary':summary[:400],
                            'skills':[s.strip()[:80] for s in skills.split(',') if s.strip()][:12],
                            'site':site, 'github':github})
        if len(issues) < 100: break
        page += 1
    entries = [EXAMPLE] + sorted(results, key=lambda p:p['name'].casefold())
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({'schema_version':1,'portfolios':entries}, indent=2, ensure_ascii=False)+'\n')
    print(f'Updated directory with {len(results)} approved student portfolios.')
if __name__ == '__main__':
    main()
