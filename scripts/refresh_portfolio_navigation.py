#!/usr/bin/env python3
"""Ensure all portal pages reference up-to-date site-wide navigation.
Run after shared navigation changes; harmless when pages are already current.
"""
from pathlib import Path
import re
ROOT=Path(".")
COUNT=0
for page in ROOT.rglob("*.html"):
    if ".git" in page.parts or "phase1-preview" in page.parts: continue
    text=page.read_text(encoding="utf-8")
    if 'site-header' not in text: continue
    updated=re.sub(r'(assets/js/main\.js)(?:\?v=[^"\']*)?',r'\1?v=20261011-pwa-refresh',text)
    updated=re.sub(r'(assets/js/navigation-v2\.js)(?:\?v=[^"\']*)?',r'\1?v=20261011-pwa-refresh',updated)
    if 'assets/js/main.js' not in updated and 'assets/js/navigation-v2.js' not in updated and '</body>' in updated:
        depth=len(page.parts)-1
        prefix="../"*depth
        updated=updated.replace("</body>", f'<script src="{prefix}assets/js/navigation-v2.js?v=20261011-pwa-refresh"></script></body>')
    if updated != text:
        page.write_text(updated,encoding="utf-8")
        COUNT+=1
print(f"Updated shared nav references in {COUNT} portal pages")
