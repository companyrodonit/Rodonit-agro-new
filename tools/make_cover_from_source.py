"""
Обкладинка статті з вихідного фото.

Навіщо окремо: hero і картка блогу показують кадр у пропорції 1200×630 з
`object-cover`, тобто все, що не влазить, вони зрізають з боків. Для фото-
порівнянь із підписами це смерть — підписи стоять по краях і зникають першими.
Тому фото вписується цілком, а вільне місце зверху й знизу заливається темним
кольором бренду: композиція лишається, нічого не втрачається.

Рендер 2400×1260 — подвійна щільність під колонку 1200px, щоб на retina
не мʼякшало. Це і був корінь скарги на «низьку якість»: у попередній
обкладинці було 1280px на 1248 CSS-px, тобто половина потрібних пікселів.

Запуск:
    py tools/make_cover_from_source.py <вихідне фото> <slug> [--fit cover|contain]
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageFilter

for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "blog"

WIDTH, HEIGHT = 2400, 1260
BRAND_DARK = (1, 54, 46)


def blurred_backdrop(src: Image.Image) -> Image.Image:
    """
    Підкладка з самого фото — збільшена до кадру й сильно розмита.

    Плаский колір під поля не годиться: у картці блогу фон свій, і смуги
    зверху й знизу читаються як приклеєні. Розмите продовження сцени зливається
    з фото і працює на будь-якому тлі.
    """
    scale = max(WIDTH / src.width, HEIGHT / src.height)
    big = src.resize((round(src.width * scale), round(src.height * scale)), Image.LANCZOS)
    left = (big.width - WIDTH) // 2
    top = (big.height - HEIGHT) // 2
    return (
        big.crop((left, top, left + WIDTH, top + HEIGHT))
        .filter(ImageFilter.GaussianBlur(radius=WIDTH // 40))
        .point(lambda v: int(v * 0.72))  # притемнюємо, щоб фото читалось як головне
    )


def build(src_path: Path, slug: str, fit: str) -> Path:
    src = Image.open(src_path).convert("RGB")
    canvas = blurred_backdrop(src) if fit == "contain" else Image.new(
        "RGB", (WIDTH, HEIGHT), BRAND_DARK)

    scale = (
        max(WIDTH / src.width, HEIGHT / src.height)
        if fit == "cover"
        else min(WIDTH / src.width, HEIGHT / src.height)
    )
    new_size = (round(src.width * scale), round(src.height * scale))
    resized = src.resize(new_size, Image.LANCZOS)

    if fit == "cover":
        left = (new_size[0] - WIDTH) // 2
        top = (new_size[1] - HEIGHT) // 2
        canvas = resized.crop((left, top, left + WIDTH, top + HEIGHT))
        lost = 100 - round(WIDTH * HEIGHT / (new_size[0] * new_size[1]) * 100)
        print(f"  режим cover: зрізано ~{lost}% кадру")
    else:
        canvas.paste(resized, ((WIDTH - new_size[0]) // 2, (HEIGHT - new_size[1]) // 2))
        pad = (HEIGHT - new_size[1]) // 2
        print(f"  режим contain: фото цілком, поля по {pad}px зверху й знизу")

    target = OUT_DIR / f"{slug}.jpg"
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    # q=88 з субдискретизацією 4:4:4: на дрібних підписах 4:2:0 дає кольорову
    # кашу навколо білих літер.
    canvas.save(target, "JPEG", quality=88, subsampling=0, optimize=True, progressive=True)
    return target


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    src_path = Path(sys.argv[1])
    slug = sys.argv[2]
    fit = "contain"
    if "--fit" in sys.argv:
        fit = sys.argv[sys.argv.index("--fit") + 1]
    if not src_path.exists():
        print(f"немає файлу: {src_path}")
        return 1

    src = Image.open(src_path)
    print(f"вихідник: {src.width}x{src.height}  ({src_path.name})")
    target = build(src_path, slug, fit)
    size_kb = target.stat().st_size / 1024
    print(f"готово: {target.relative_to(ROOT)}  {WIDTH}x{HEIGHT}  {size_kb:.0f} КБ")
    return 0


if __name__ == "__main__":
    sys.exit(main())
