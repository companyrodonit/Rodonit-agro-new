"""
Перевірка блогу на живому сайті після деплою й заливки статей.

Свідомо один прохід і мінімум запитів: Vercel Security Checkpoint блокує IP,
з якої довбають автоперевірками.

Що перевіряє:
  - сітка блогу: скільки карток, чи всі однакової висоти, який кадр картинки;
  - сторінка кожної перевіреної статті: дизайн-блоки на місці, сирих маркерів
    [[...]] і абзаців-труб «| комірка |» у тексті немає.

Запуск:  py tools/blog_prod_check.py [https://інший-домен]
"""

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://rodonit.com.ua"
OUT = Path(__file__).resolve().parent.parent / ".screenshots"
BODY = "[data-testid='post-body']"

POSTS = [
    "tserkosporoz-tsukrovoho-buriaku-ostanni-obrobky",
    "vershynna-hnyl-tomativ-verno-cab",
]

SCROLL = """async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 500) {
    window.scrollTo(0, y); await new Promise(r => setTimeout(r, 70));
  }
  window.scrollTo(0, 0);
}"""


def main() -> int:
    OUT.mkdir(exist_ok=True)
    problems = 0

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 1100})

        page.goto(f"{BASE}/blog", wait_until="networkidle", timeout=90000)
        page.evaluate(SCROLL)
        page.wait_for_timeout(900)
        page.screenshot(path=str(OUT / "prod-blog.png"), full_page=True)

        cards = page.evaluate("""() => [...document.querySelectorAll("[data-testid^='post-card-']")]
          .map(c => ({
            slug: c.dataset.testid.replace('post-card-',''),
            h: Math.round(c.getBoundingClientRect().height),
          }))""")
        heights = sorted({c["h"] for c in cards})
        print(f"{BASE}/blog — карток: {len(cards)}, висоти: {heights}")
        if len(heights) > 1:
            print("   ⚠ картки різної висоти — сітка «стрибає»")
            problems += 1

        slugs = {c["slug"] for c in cards}
        for slug in POSTS:
            if slug not in slugs:
                print(f"   ⚠ у сітці немає статті {slug}")
                problems += 1

        for slug in POSTS:
            page.goto(f"{BASE}/blog/{slug}", wait_until="networkidle", timeout=90000)
            page.evaluate(SCROLL)
            page.wait_for_timeout(700)
            page.screenshot(path=str(OUT / f"prod-{slug[:28]}.png"), full_page=True)

            text = page.locator(BODY).inner_text()
            stats = {
                "таблиці": page.locator(f"{BODY} table").count(),
                "виноски": page.locator(f"{BODY} aside").count(),
                "FAQ": page.locator(f"{BODY} details").count(),
            }
            print(f"\n{slug}")
            print("   " + "  ".join(f"{k}={v}" for k, v in stats.items()))
            if "[[" in text:
                print("   ⚠ у тексті лишились сирі маркери [[...]]")
                problems += 1
            if "| " in text and " |" in text:
                print("   ⚠ схоже на абзаци-труби «| комірка |»")
                problems += 1

        browser.close()

    print(f"\nзауважень: {problems}")
    print(f"скріни: {OUT}")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
