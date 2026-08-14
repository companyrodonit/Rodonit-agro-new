"""
Перевіряє блоки FAQ на живому сайті: скільки питань у кожній статті,
чи рендеряться вони одним блоком і чи потрапляють у розмітку FAQPage.

Запуск:  py tools/blog_faq_check.py [https://rodonit.com.ua]
"""

import json
import re
import sys
import urllib.request

for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://rodonit.com.ua"


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 rodonit-check"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "replace")


def main() -> int:
    slugs = sorted(set(re.findall(r'href="/blog/([a-z0-9-]+)"', fetch(f"{BASE}/blog"))))
    print(f"статей у блозі: {len(slugs)}\n")
    print(f"{'стаття':50} {'<details>':>10} {'FAQPage':>9} {'блоків FAQ':>11}")

    problems = 0
    for slug in slugs:
        html = fetch(f"{BASE}/blog/{slug}")
        details = len(re.findall(r"<details", html))
        # Питання з JSON-LD: рахуємо саме FAQPage, а не будь-яку розмітку
        faq_questions = 0
        for raw in re.findall(
            r'<script type="application/ld\+json">(.*?)</script>', html, re.S
        ):
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue
            for item in data if isinstance(data, list) else [data]:
                if isinstance(item, dict) and item.get("@type") == "FAQPage":
                    faq_questions = len(item.get("mainEntity", []))
        # Скільки окремих блоків-рамок FAQ на сторінці. Шукаємо саме розмітку
        # (>текст<), бо той самий рядок дублюється у службових даних Next і
        # простий підрахунок входжень показував удвічі більше блоків.
        wrappers = len(re.findall(r">\s*Питання та відповіді\s*<", html))

        flag = ""
        if details and not faq_questions:
            flag, problems = "  ⚠ є акордеон без FAQPage", problems + 1
        elif details and details != faq_questions:
            flag, problems = f"  ⚠ {details} проти {faq_questions} у розмітці", problems + 1
        elif details and wrappers > 1:
            flag, problems = "  ⚠ FAQ розбитий на кілька блоків", problems + 1
        print(f"{slug[:50]:50} {details:>10} {faq_questions:>9} {wrappers:>11}{flag}")

    print(f"\nзауважень: {problems}")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
