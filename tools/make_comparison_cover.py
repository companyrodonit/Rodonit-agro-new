"""
Обкладинка-порівняння «до / після» з власними підписами.

Навіщо переробляти те, що вже є на вихідному фото: оригінальні плашки з
підписами тягнуться майже на всю ширину кожної половини. Кадр обкладинки
вужчий за вихідник (1,9 проти 2,41), тому будь-який зріз з боків ріже їм
початок, а вписати з полями не можна — у картці блогу поля читаються як
приклеєні смуги. Єдиний спосіб мати і повний кадр, і цілі підписи — зрізати
оригінальну плашку разом із нижньою смугою фото й підписати самому, коротше.

Шрифт беремо той самий, що на сайті (Onest із кешу збірки), тому підпис
виглядає як частина сайту, а не як напис поверх картинки.

Запуск:
    py tools/make_comparison_cover.py <вихідник> <slug> "Лівий підпис" "Правий підпис"
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "blog"
FONT_DIR = ROOT / "public" / "fonts"

WIDTH, HEIGHT = 2400, 1260
GAP = 8
PLATE = (14, 74, 47)          # темно-зелений, як у фірмових плашках
PLATE_H = 108
FONT_SIZE = 46


def load_font() -> ImageFont.FreeTypeFont:
    """Onest, якщо є у проєкті; інакше системний — краще будь-який, ніж падіння."""
    for pattern in ("*Onest*.ttf", "*Onest*.otf", "*.ttf"):
        for path in sorted(FONT_DIR.glob(pattern)) if FONT_DIR.exists() else []:
            try:
                return ImageFont.truetype(str(path), FONT_SIZE)
            except OSError:
                continue
    for name in ("segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"):
        try:
            return ImageFont.truetype(name, FONT_SIZE)
        except OSError:
            continue
    print("! шрифт не знайдено, підпис буде системним дрібним")
    return ImageFont.load_default()


def crop_cover(img: Image.Image, w: int, h: int) -> Image.Image:
    scale = max(w / img.width, h / img.height)
    big = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    return big.crop(((big.width - w) // 2, (big.height - h) // 2,
                     (big.width - w) // 2 + w, (big.height - h) // 2 + h))


def main() -> int:
    if len(sys.argv) < 5:
        print(__doc__)
        return 1
    src_path, slug = Path(sys.argv[1]), sys.argv[2]
    captions = sys.argv[3:5]

    src = Image.open(src_path).convert("RGB")
    # Нижні 8% — місце оригінальних плашок, вони нам більше не потрібні
    src = src.crop((0, 0, src.width, int(src.height * 0.92)))
    print(f"вихідник без оригінальних плашок: {src.width}x{src.height}")

    part_w = (WIDTH - GAP) // 2
    canvas = Image.new("RGB", (WIDTH, HEIGHT), (255, 255, 255))
    step = src.width // 2
    for i in range(2):
        chunk = src.crop((i * step, 0, (i + 1) * step, src.height))
        canvas.paste(crop_cover(chunk, part_w, HEIGHT), (i * (part_w + GAP), 0))

    draw = ImageDraw.Draw(canvas)
    font = load_font()
    for i, text in enumerate(captions):
        x0 = i * (part_w + GAP)
        box = draw.textbbox((0, 0), text, font=font)
        tw, th = box[2] - box[0], box[3] - box[1]
        if tw > part_w - 80:
            print(f"! підпис «{text}» ширший за половину ({tw}px) — скоротіть")
        plate_top = HEIGHT - PLATE_H
        draw.rectangle([x0, plate_top, x0 + part_w, HEIGHT], fill=PLATE)
        draw.text((x0 + (part_w - tw) / 2 - box[0],
                   plate_top + (PLATE_H - th) / 2 - box[1]),
                  text, font=font, fill=(255, 255, 255))
        print(f"  підпис {i + 1}: «{text}» {tw}px у полі {part_w}px")

    target = OUT_DIR / f"{slug}.jpg"
    canvas.save(target, "JPEG", quality=88, subsampling=0, optimize=True, progressive=True)
    print(f"готово: {target.relative_to(ROOT)}  {WIDTH}x{HEIGHT}  "
          f"{target.stat().st_size / 1024:.0f} КБ")
    return 0


if __name__ == "__main__":
    sys.exit(main())
