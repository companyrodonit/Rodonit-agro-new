# -*- coding: utf-8 -*-
"""Генерує lib/redirects.ts із tools/redirects-draft.csv.

Беремо тільки рядки, де є куди вести (колонка «нова адреса» заповнена).
«ПОТРЕБУЄ РІШЕННЯ» лишається порожнім і сюди не потрапляє — коли Олег
вирішить долю інфотеки, дописуємо адреси в CSV і перезапускаємо цей скрипт.

Запуск з кореня проєкту:  python tools/gen_redirects.py
"""
import csv
import io
import os
from urllib.parse import parse_qs, urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "redirects-draft.csv")
OUT = os.path.join(ROOT, "lib", "redirects.ts")

rows = list(csv.DictReader(io.open(SRC, encoding="utf-8"), delimiter=";"))

entries, skipped, seen = [], [], set()
for r in rows:
    old = (r["стара адреса"] or "").strip()
    new = (r["нова адреса"] or "").strip()
    if not old or not new:
        skipped.append((old or "(порожньо)", r["заголовок"][:60]))
        continue
    if old in seen:
        continue
    seen.add(old)

    parsed = urlparse(old)
    note = f"{r['заголовок'][:70]} [{r['впевненість']}]"
    if parsed.query:
        # OpenCart-адреси виду /index.php?route=product/product&product_id=56.
        # Next зіставляє query тільки через has, шлях сам по собі не збігається.
        qs = parse_qs(parsed.query)
        has = [
            {"type": "query", "key": k, "value": v[0]}
            for k, v in qs.items()
        ]
        entries.append((parsed.path, new, has, note))
    else:
        entries.append((old, new, None, note))

# Спершу конкретні index.php (їх розрізняє тільки has), потім звичайні шляхи.
entries.sort(key=lambda e: (e[2] is None, e[0]))


def ts_has(has):
    inner = ", ".join(
        "{{ type: '{type}', key: '{key}', value: '{value}' }}".format(**h) for h in has
    )
    return f"has: [{inner}], "


lines = [
    "// ⚠️ ЗГЕНЕРОВАНО. Не правити руками — джерело tools/redirects-draft.csv,",
    "// генератор tools/gen_redirects.py. Правки в CSV → перезапустити скрипт.",
    "//",
    "// Карта 301 зі старого OpenCart на новий сайт. Вмикається в момент",
    "// перемикання домену rodonit.com.ua; до того ці адреси на нашому",
    "// vercel.app просто ніхто не запитує, шкоди від них немає.",
    "//",
    f"// Сторінок старого сайту: {len(rows)}. Тут: {len(entries)}.",
    f"// Без адреси призначення (чекають рішення замовника): {len(skipped)}.",
    "",
    "import type { NextConfig } from 'next';",
    "",
    "type Redirect = Awaited<ReturnType<NonNullable<NextConfig['redirects']>>>[number];",
    "",
    "export const legacyRedirects: Redirect[] = [",
]
for source, dest, has, note in entries:
    lines.append(f"  // {note}")
    h = ts_has(has) if has else ""
    lines.append(
        f"  {{ source: '{source}', {h}destination: '{dest}', permanent: true }},"
    )
lines += ["];", ""]

io.open(OUT, "w", encoding="utf-8", newline="\n").write("\n".join(lines))
print(f"lib/redirects.ts: {len(entries)} редиректів, пропущено {len(skipped)}")
for s, t in skipped[:3]:
    print(f"  пропущено: {s} — {t}")
