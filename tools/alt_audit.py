"""
Аудит alt-текстів на живому сайті.

Порожній alt — не завжди помилка: якщо картинка декоративна і поруч стоїть той
самий текст (обкладинка в картці статті, де заголовок під нею), правильно саме
alt="", інакше скрінрідер читає підпис двічі. Помилка — це відсутній атрибут,
alt, що дослівно дублює сусідній заголовок, і осмислене фото без підпису.

Запуск:  py tools/alt_audit.py [https://rodonit.com.ua]
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

PAGES = [
    "/", "/preparaty", "/preparaty/nordoks", "/kultury", "/kultury/zernovi-kultury",
    "/rishennia", "/distributors", "/about", "/contacts",
    "/blog", "/blog/tserkosporoz-tsukrovoho-buriaku-ostanni-obrobky",
    "/blog/vershynna-hnyl-tomativ-verno-cab",
]

COLLECT = """() => [...document.images].map(img => {
  const a = img.getAttribute('alt');
  // Найближчий заголовок або посилання-обгортка — щоб зрозуміти, чи є поруч
  // текст, який робить картинку декоративною
  const near = img.closest('a')?.innerText?.trim().slice(0, 80) ?? '';
  return {
    src: (img.currentSrc || img.src).split('?')[0].split('/').pop().slice(0, 44),
    alt: a,
    w: img.naturalWidth,
    near,
  };
})"""


def main() -> int:
    missing, dupes, empty, ok = [], [], 0, 0
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        for path in PAGES:
            try:
                page.goto(f"{BASE}{path}", wait_until="networkidle", timeout=90000)
            except Exception as e:  # сторінки може не бути — це теж результат
                print(f"{path}: не відкрилась ({type(e).__name__})")
                continue
            page.evaluate("""async () => {
              for (let y = 0; y < document.body.scrollHeight; y += 600) {
                window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60));
              }
            }""")
            page.wait_for_timeout(500)
            for img in page.evaluate(COLLECT):
                alt = img["alt"]
                if alt is None:
                    missing.append((path, img["src"]))
                elif not alt.strip():
                    empty += 1
                elif img["near"] and alt.strip() and alt.strip() in img["near"]:
                    dupes.append((path, img["src"], alt[:56]))
                else:
                    ok += 1
        browser.close()

    print(f"осмислений alt : {ok}")
    print(f"порожній alt   : {empty}  (норма для декоративних)")
    print(f"БЕЗ атрибута   : {len(missing)}")
    for path, src in missing[:20]:
        print(f"   {path}  →  {src}")
    print(f"дублює сусідній текст: {len(dupes)}")
    for path, src, alt in dupes[:20]:
        print(f"   {path}  →  {src}  «{alt}»")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
