"""Скрін сітки блогу з розкритими Reveal + заміри вирівнювання плашок."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

for s in (sys.stdout, sys.stderr):
    try:
        s.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

BASE = "http://localhost:4009"
OUT = Path(__file__).parent

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.goto(f"{BASE}/blog", wait_until="networkidle")

    # Reveal розкривається по скролу — прокручуємо всю сторінку, щоб картки зʼявились
    page.evaluate("""async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 90));
      }
      window.scrollTo(0, 0);
    }""")
    page.wait_for_timeout(700)

    grid = page.locator("[data-testid^='post-card-']").first.locator("xpath=../..")
    grid.screenshot(path=str(OUT / "grid-after.png"))

    # Заміри: де в кожній картці починається біла частина і чи однакова висота
    rows = page.evaluate("""() => [...document.querySelectorAll("[data-testid^='post-card-']")]
      .map(c => {
        const img = c.querySelector('img');
        const white = c.querySelector('div');
        const cb = c.getBoundingClientRect(), wb = white.getBoundingClientRect();
        return {
          slug: c.dataset.testid.replace('post-card-',''),
          img: img ? img.currentSrc.split('&w=')[1] || '' : 'НЕМАЄ',
          h: Math.round(cb.height),
          white: Math.round(wb.top - cb.top),
        };
      })""")
    print(f"{'стаття':46} {'висота':>7} {'біла з':>7}  джерело")
    for r in rows:
        print(f"{r['slug'][:46]:46} {r['h']:>7} {r['white']:>7}  w={r['img']}")
    heights = {r["h"] for r in rows}
    whites = {r["white"] for r in rows}
    print(f"\nунікальних висот карток: {sorted(heights)}")
    print(f"унікальних зсувів білої частини: {sorted(whites)}")

    browser.close()
print("готово")
