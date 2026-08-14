"""Скріни статті: цілком + прицільно по дизайн-блоках."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

for s in (sys.stdout, sys.stderr):
    try:
        s.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

URL = "http://localhost:4005/blog/tserkosporoz-tsukrovoho-buriaku-ostanni-obrobky"
OUT = Path(__file__).parent

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto(URL, wait_until="networkidle")

    page.screenshot(path=str(OUT / "article-full.png"), full_page=True)

    # Прицільно: картка препарату, таблиця норм, callout, FAQ
    targets = {
        "block-product": "aside:has(a[href='/preparaty/nordoks'])",
        "block-rates": "figure:has(table)",
        "block-callout": "aside:has-text('Важливо')",
        "block-faq": "details",
    }
    for name, sel in targets.items():
        el = page.locator(sel).first
        if el.count():
            el.scroll_into_view_if_needed()
            page.wait_for_timeout(250)
            el.screenshot(path=str(OUT / f"{name}.png"))
            print(f"{name}: OK")
        else:
            print(f"{name}: НЕ ЗНАЙДЕНО ({sel})")

    # Мобільна перевірка — 390px, таблиця не має ламати сторінку
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(URL, wait_until="networkidle")
    overflow = page.evaluate(
        "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"
    )
    print(f"горизонтальне переповнення на 390px: {overflow}px")
    page.screenshot(path=str(OUT / "article-mobile.png"), full_page=True)

    browser.close()
print("готово")
