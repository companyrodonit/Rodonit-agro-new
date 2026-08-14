"""
Перескладає широке фото-порівняння під пропорції обкладинки.

Задача: вихідник — дві половини «уражене / здорове» з підписами, разом 2,41:1.
Обкладинка потребує 1,9:1. Прямий шлях програє в обидва боки: вписати з полями —
у картці блогу зверху й знизу видно смуги; зрізати з боків — ріже підписи, бо
вони стоять по краях кадру.

Рішення: різати не спільний кадр, а кожну половину окремо. Тоді зникає саме та
ширина, що між половинами й по краях, а підпис у центрі половини лишається
цілим. Вертикаль не чіпаємо — смуг не буде.

Запуск:
    py tools/recompose_split_cover.py <вихідник> <slug> [--parts 2] [--gap 8]
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "blog"
WIDTH, HEIGHT = 2400, 1260


def caption_span(img: Image.Image) -> tuple[float, float] | None:
    """
    Горизонтальний центр підпису — по білому тексту в нижній частині кадру.

    Кропити половину по її геометричному центру не можна: підпис на фото стоїть
    не строго посередині, і центральний зріз відрізає йому початок. Тому
    орієнтуємось на сам текст.
    """
    w, h = img.size
    # Орієнтуємось на саму плашку, а не на текст: білі відблиски на листі
    # зміщували центр і підпис усе одно виїжджав за кадр. Плашка — рівний
    # темно-зелений прямокутник у самому низу, її колір ні з чим не сплутати.
    band = img.crop((0, int(h * 0.86), w, h)).convert("RGB")
    px = band.load()
    rows = list(range(0, band.height, 2))

    def is_plate(p: tuple[int, int, int]) -> bool:
        r, g, b = p
        return r < 70 and 45 < g < 110 and b < 85 and g - r > 18 and g - b > 10

    cols = [x for x in range(0, w, 2)
            if sum(1 for y in rows if is_plate(px[x, y])) > len(rows) * 0.35]
    if len(cols) < 20:
        return None

    # Найдовший суцільний відрізок — це і є плашка; дрібні розриви зшиваємо
    runs, start, prev = [], cols[0], cols[0]
    for x in cols[1:]:
        if x - prev > 40:
            runs.append((start, prev))
            start = x
        prev = x
    runs.append((start, prev))
    a, b = max(runs, key=lambda r: r[1] - r[0])
    return float(a), float(b)


def crop_cover(img: Image.Image, w: int, h: int, anchor: float | None = None) -> Image.Image:
    """
    Вписати з заповненням. `anchor` — точка вихідника (у пікселях по X), яку
    треба лишити в центрі кадру; без неї ріжемо симетрично.
    """
    scale = max(w / img.width, h / img.height)
    big = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    if anchor is None:
        left = (big.width - w) // 2
    else:
        left = round(anchor * scale - w / 2)
        left = max(0, min(left, big.width - w))
    top = (big.height - h) // 2
    return big.crop((left, top, left + w, top + h))


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    src_path, slug = Path(sys.argv[1]), sys.argv[2]
    parts = int(sys.argv[sys.argv.index("--parts") + 1]) if "--parts" in sys.argv else 2
    gap = int(sys.argv[sys.argv.index("--gap") + 1]) if "--gap" in sys.argv else 8

    src = Image.open(src_path).convert("RGB")
    print(f"вихідник: {src.width}x{src.height}, ділимо на {parts}")

    step = src.width // parts
    chunks = [src.crop((i * step, 0, (i + 1) * step, src.height)) for i in range(parts)]
    spans = [caption_span(c) for c in chunks]

    # Ширину між частинами ділимо не порівну, а за довжиною підписів: у рівному
    # поділі довшому підпису бракувало кількох пікселів і в нього зрізало першу
    # літеру, тоді як у сусіда лишався запас.
    free = WIDTH - gap * (parts - 1)
    scales = [HEIGHT / c.height for c in chunks]
    need = [
        (s[1] - s[0]) * sc * 1.06 if s else free / parts
        for s, sc in zip(spans, scales)
    ]
    total = sum(need)
    widths = [max(round(free * n / total), 1) for n in need]
    widths[-1] += free - sum(widths)  # добираємо залишок від округлень

    canvas = Image.new("RGB", (WIDTH, HEIGHT), (255, 255, 255))
    x = 0
    for i, (chunk, span, part_w) in enumerate(zip(chunks, spans, widths)):
        anchor = (span[0] + span[1]) / 2 if span else None
        canvas.paste(crop_cover(chunk, part_w, HEIGHT, anchor), (x, 0))
        x += part_w + gap
        fits = "підпис влазить" if span and (span[1] - span[0]) * scales[i] <= part_w else "тісно"
        print(f"  частина {i + 1}: {chunk.width}x{chunk.height} → {part_w}x{HEIGHT}"
              f"  (підпис {round((span[1] - span[0]) * scales[i]) if span else '?'}px, {fits})")

    target = OUT_DIR / f"{slug}.jpg"
    canvas.save(target, "JPEG", quality=88, subsampling=0, optimize=True, progressive=True)
    print(f"готово: {target.relative_to(ROOT)}  {WIDTH}x{HEIGHT}  "
          f"{target.stat().st_size / 1024:.0f} КБ")
    return 0


if __name__ == "__main__":
    sys.exit(main())
