"""
Генератор обкладинок-плашок для статей без фото (public/blog/covers/).

Навіщо: у попередніх плашках текстовий блок був центрований по вертикалі, тому
в сітці блогу бейдж «Родоніт Агро» стрибав по висоті — заголовок в один рядок
опускав його нижче, у два рядки піднімав вище. Тут кожен елемент має фіксовану
позицію, тому всі плашки вирівняні між собою незалежно від довжини заголовка.

Геометрія прорахована під картку блогу. По вертикалі: зображення показується
висотою 260px, біла картка накриває його з 204px — видно верхні ~78%. По
горизонталі гірше: картка має пропорцію 1.46, плашка 1.90, тому object-cover
зрізає приблизно по 11% з кожного боку. Тому і текст, і поля тримаємо в
центральних ~77% ширини — інакше довгий заголовок в сітці впирається в край.

Рендер у 2x (2400x1260) — щоб на retina плашка лишалась чіткою.

Запуск (з кореня проєкту, dev-сервер не потрібен):
    py tools/make_covers.py
"""

from __future__ import annotations

import base64
import json
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "blog" / "covers"
FONT_DIR = ROOT / ".next" / "static" / "media"

WIDTH, HEIGHT, SCALE = 1200, 630, 2

# Сітка в координатах 1200x630. По вертикалі все у верхніх 490px, по
# горизонталі — у центральних 900px: саме стільки видно в картці блогу.
#
# Рядок метаданих (культура + час читання) прибрано свідомо: рівно те саме
# стоїть у білій картці під плашкою, а дубль на двох рівнях виглядав як
# недогляд. Плашка тепер несе тільки бренд і заголовок.
TOP_BRAND = 150
TOP_TITLE = 240
SIDE = 150


def font_face() -> str:
    """Onest із кешу збірки — той самий шрифт, що на сайті."""
    files = sorted(FONT_DIR.glob("*.woff2"), key=lambda p: p.stat().st_size, reverse=True)
    if not files:
        print("! Шрифт не знайдено — рендер піде системним. Зроби спершу npm run build.")
        return ""
    faces = []
    for f in files[:2]:  # найбільші два субсети покривають латиницю й кирилицю
        b64 = base64.b64encode(f.read_bytes()).decode("ascii")
        faces.append(
            "@font-face{font-family:'Onest';font-weight:100 900;font-style:normal;"
            f"src:url(data:font/woff2;base64,{b64}) format('woff2');}}"
        )
    return "".join(faces)


def load_posts() -> list[dict]:
    """Дані беремо з lib/posts.ts, щоб плашка не розʼїжджалася з текстом статті."""
    raw = subprocess.run(
        ["npx", "tsx", "tools/covers_data.ts"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        shell=True,
        check=True,
    ).stdout
    return json.loads(raw[raw.index("[") :])


def page_html(post: dict, fonts: str) -> str:
    accent = "accent" if post["category"].lower().startswith("нов") else ""
    return f"""<!doctype html><meta charset="utf-8"><style>
{fonts}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:{WIDTH}px;height:{HEIGHT}px;overflow:hidden;
  font-family:'Onest',system-ui,sans-serif;background:#01362E;color:#FEFEFE}}
.wrap{{position:relative;width:{WIDTH}px;height:{HEIGHT}px;overflow:hidden;
  background:
    radial-gradient(760px 520px at 88% 6%, rgba(149,227,98,.20), transparent 62%),
    radial-gradient(680px 460px at 4% 96%, rgba(0,0,0,.34), transparent 60%),
    #01362E;}}
/* Тонка діагональна штриховка — фактура, що вже є на темних блоках сайту. */
.wrap::before{{content:'';position:absolute;inset:0;
  background:repeating-linear-gradient(135deg,
    rgba(255,255,255,.035) 0 1px, transparent 1px 15px);}}
.row{{position:absolute;left:0;right:0;display:flex;justify-content:center;
  align-items:center;gap:14px;padding:0 {SIDE}px}}
.brand{{top:{TOP_BRAND}px}}
.mark{{width:46px;height:46px;border-radius:999px;background:#95E362;color:#0E0F0C;
  display:grid;place-items:center;flex:0 0 auto}}
.mark svg{{width:24px;height:24px}}
.brand-name{{font-size:26px;font-weight:800;letter-spacing:-.02em}}
.pill{{font-size:14px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  padding:9px 18px;border-radius:999px;
  background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.24)}}
.pill.accent{{background:#95E362;border-color:#95E362;color:#0E0F0C}}
h1{{position:absolute;top:{TOP_TITLE}px;left:{SIDE}px;right:{SIDE}px;
  font-size:50px;font-weight:700;line-height:1.16;letter-spacing:-.03em;
  text-align:center;text-wrap:balance;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}}
</style>
<div class="wrap">
  <div class="row brand">
    <span class="mark"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4c0 8-5 13-12 13H5v-1c0-7 5-12 12-12h3zM5 21c0-4 2-7 5-9"
      stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg></span>
    <span class="brand-name">Родоніт Агро</span>
    <span class="pill {accent}">{post['category']}</span>
  </div>
  <h1>{post['title']}</h1>
</div>"""


def main() -> None:
    posts = load_posts()
    fonts = font_face()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(
            viewport={"width": WIDTH, "height": HEIGHT}, device_scale_factor=SCALE
        )
        for post in posts:
            page.set_content(page_html(post, fonts), wait_until="load")
            page.wait_for_timeout(150)
            target = OUT_DIR / post["file"]
            page.screenshot(path=str(target), type="jpeg", quality=92)
            size_kb = target.stat().st_size / 1024
            print(f"{post['file']:52} {WIDTH * SCALE}x{HEIGHT * SCALE}  {size_kb:5.0f} КБ")
        browser.close()

    print(f"\nготово: {len(posts)} плашок у {OUT_DIR}")


if __name__ == "__main__":
    main()
