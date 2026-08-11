# -*- coding: utf-8 -*-
"""Проганяє всі старі URL із redirects-draft.csv по локальному next start
і перевіряє, що кожен віддає 301 саме туди, куди задумано.

Після перемикання домену цим самим скриптом перевіряємо бойовий rodonit.com.ua:
    python tools/check_redirects.py https://rodonit.com.ua
"""
import csv
import io
import os
import sys
import urllib.request
from urllib.parse import urlparse

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4002"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "redirects-draft.csv")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **kw):
        return None


opener = urllib.request.build_opener(NoRedirect)

rows = list(csv.DictReader(io.open(SRC, encoding="utf-8"), delimiter=";"))
ok, bad, skipped = 0, [], 0

for r in rows:
    old = (r["стара адреса"] or "").strip()
    new = (r["нова адреса"] or "").strip()
    if not old or not new:
        skipped += 1
        continue
    try:
        req = urllib.request.Request(BASE + old, headers={"User-Agent": "redirect-check"})
        resp = opener.open(req, timeout=20)
        code, loc = resp.status, resp.headers.get("Location", "")
    except urllib.error.HTTPError as e:
        code, loc = e.code, e.headers.get("Location", "")
    except Exception as e:  # мережа/таймаут
        bad.append((old, "—", str(e)[:50], new))
        continue

    got = urlparse(loc).path if loc else ""
    if code == 308 and got == new:
        # Next за замовчуванням віддає 308 (permanent, зі збереженням методу).
        # Для SEO Google трактує 308 як 301 — це ок.
        ok += 1
    elif code in (301, 308) and got == new:
        ok += 1
    else:
        bad.append((old, code, got or "(немає Location)", new))

print(f"База: {BASE}")
print(f"Перевірено: {ok + len(bad)} | OK: {ok} | помилок: {len(bad)} | без призначення: {skipped}")
for old, code, got, want in bad:
    print(f"  ✗ {old}\n      код {code}, веде на {got}, треба {want}")
