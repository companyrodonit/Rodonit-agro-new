"""
Заміри вирівнювання карток у сітці блогу.

Перевіряє те, на що скаржився замовник: чи стоять бейдж, заголовок і мета-рядок
на одній лінії в усіх картках ряду, чи стрибають залежно від довжини заголовка,
і яку щільність картинки реально отримує браузер.

Запуск:  py tools/blog_cards_align.py [https://rodonit.com.ua]
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

MEASURE = """() => [...document.querySelectorAll("[data-testid^='post-card-']")].map(c => {
  const box = c.getBoundingClientRect();
  const img = c.querySelector('img');
  const white = c.querySelector(':scope > div');
  const h3 = c.querySelector('h3');
  const meta = c.querySelector(':scope > div > div');
  const rel = el => el ? Math.round(el.getBoundingClientRect().top - box.top) : null;
  return {
    slug: c.dataset.testid.replace('post-card-', ''),
    h: Math.round(box.height),
    white: rel(white),
    meta: rel(meta),
    title: rel(h3),
    titleLines: h3 ? Math.round(h3.getBoundingClientRect().height / 26) : 0,
    imgW: img ? img.naturalWidth : 0,
    cssW: img ? Math.round(img.getBoundingClientRect().width) : 0,
    src: img ? (img.currentSrc.match(/[?&]w=(\\d+)/) || [])[1] || '' : '',
  };
})"""


def main() -> int:
    OUT.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 1100}, device_scale_factor=2)
        page.goto(f"{BASE}/blog", wait_until="networkidle", timeout=90000)
        page.evaluate("""async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 400) {
            window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90));
          }
          window.scrollTo(0, 0);
        }""")
        # naturalWidth до decode бреше (ловився на цьому: показував 400 для
        # кадру 1280). Чекаємо, поки всі картинки сітки реально завантажаться.
        page.wait_for_function(
            """() => [...document.querySelectorAll("[data-testid^='post-card-'] img")]
                 .every(i => i.complete && i.naturalWidth > 0)""",
            timeout=30000,
        )
        page.wait_for_timeout(800)

        rows = page.evaluate(MEASURE)
        # Щільність картинки тут НЕ міряємо: naturalWidth у headless стабільно
        # віддає ширину слота, а не кадру (ловився двічі — показував 475 там,
        # де сервер віддає 2400). Реальний розмір дивитись у розмірах файлу
        # в CMS: `npx tsx tools/prod_api.mjs posts`.
        print(f"{'стаття':44} {'висота':>6} {'біла':>5} {'мета':>5} {'загол':>6} {'рядків':>6}")
        for r in rows:
            print(f"{r['slug'][:44]:44} {r['h']:>6} {r['white']:>5} {r['meta']:>5} "
                  f"{r['title']:>6} {r['titleLines']:>6}")

        for field, label in (("h", "висота картки"), ("white", "початок білої частини"),
                             ("meta", "рядок рубрики"), ("title", "заголовок")):
            vals = sorted({r[field] for r in rows if r[field] is not None})
            ok = "однаково ✅" if len(vals) == 1 else f"РІЗНЯТЬСЯ: {vals}"
            print(f"{label:26} {ok}")

        grid = page.locator("[data-testid^='post-card-']").first.locator("xpath=../..")
        grid.screenshot(path=str(OUT / "cards-align.png"))
        browser.close()
    print(f"\nскрін: {OUT / 'cards-align.png'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
