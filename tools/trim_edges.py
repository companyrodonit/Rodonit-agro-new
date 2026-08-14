"""
Зрізає артефактні краї згенерованих зображень.

Генератори лишають на межі кадру вузьку смугу — світлу, темну або змазану,
яка не належить сцені. На сайті вона впадає в око одразу: фото має рівний край
і рамку, тому будь-який шов виглядає як помилка верстки.

Як шукаємо: беремо медіанний профіль кольору по «здоровій» частині кадру й
рухаємось від краю всередину, поки колонка помітно відрізняється від сусідніх.
Знайдену смугу відрізаємо з усіх чотирьох боків, а кадр повертаємо до вихідного
розміру — пропорція й геометрія обкладинки не змінюються.

Запуск:
    py tools/trim_edges.py public/blog/файл.jpg [ще файли...]
    py tools/trim_edges.py --check public/blog/*.jpg     (тільки показати)
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

# Наскільки далеко від краю взагалі може сидіти артефакт і з якого порогу
# різниці вважаємо колонку чужою для кадру.
MAX_BAND = 40
THRESHOLD = 14.0


def line_diff(img: Image.Image, i: int, horizontal: bool) -> float:
    """Середня різниця між сусідніми лініями (колонками або рядками)."""
    w, h = img.size
    px = img.load()
    if horizontal:
        span = range(0, h, max(1, h // 80))
        a = [px[i, y] for y in span]
        b = [px[i + 1, y] for y in span]
    else:
        span = range(0, w, max(1, w // 80))
        a = [px[x, i] for x in span]
        b = [px[x, i + 1] for x in span]
    return sum(abs(p[c] - q[c]) for p, q in zip(a, b) for c in range(3)) / (len(a) * 3)


def band_width(img: Image.Image, side: str) -> int:
    """Ширина артефактної смуги з боку `side`. 0 — краю немає."""
    w, h = img.size
    horizontal = side in ("left", "right")
    size = w if horizontal else h
    idx = lambda k: k if side in ("left", "top") else size - 2 - k  # noqa: E731

    diffs = [line_diff(img, idx(k), horizontal) for k in range(min(MAX_BAND, size // 4))]
    # Спокійний рівень кадру — медіана далеких від краю відліків
    calm = sorted(diffs[MAX_BAND // 2:])[len(diffs[MAX_BAND // 2:]) // 2] if len(diffs) > 4 else 0
    limit = max(THRESHOLD, calm * 3)

    last = -1
    for k, d in enumerate(diffs):
        if d > limit:
            last = k
    return last + 2 if last >= 0 else 0


def process(path: Path, check_only: bool) -> bool:
    img = Image.open(path).convert("RGB")
    w, h = img.size
    bands = {side: band_width(img, side) for side in ("left", "right", "top", "bottom")}
    if not any(bands.values()):
        print(f"{path.name[:52]:54} чисто")
        return False

    parts = ", ".join(f"{k}={v}px" for k, v in bands.items() if v)
    print(f"{path.name[:52]:54} артефакт: {parts}")
    if check_only:
        return True

    box = (bands["left"], bands["top"], w - bands["right"], h - bands["bottom"])
    fixed = img.crop(box).resize((w, h), Image.LANCZOS)
    fixed.save(path, "JPEG", quality=88, subsampling=0, optimize=True, progressive=True)
    print(f"{'':54} → зрізано й відновлено до {w}x{h}")
    return True


def force_trim(path: Path, percent: float, dest: Path | None = None) -> None:
    """
    Безумовний зріз відсотка з кожного боку.

    Потрібен, бо не всякий шов помітний по яскравості: у фото томатів зліва
    виявився вклеєний зовсім інший кадр (поле з горизонтом) — за кольором
    близький, тому автопошук його пропускав, а на сайті він читався як смуга.
    Коли артефакт видно оком, надійніше зрізати з запасом, ніж підбирати поріг.
    """
    img = Image.open(path).convert("RGB")
    w, h = img.size
    dx, dy = round(w * percent / 100), round(h * percent / 100)
    fixed = img.crop((dx, dy, w - dx, h - dy)).resize((w, h), Image.LANCZOS)
    target = dest or path
    target.parent.mkdir(parents=True, exist_ok=True)
    fixed.save(target, "JPEG", quality=88, subsampling=0, optimize=True, progressive=True)
    print(f"{path.name[:52]:54} зрізано по {dx}px з боків і {dy}px згори/знизу → {w}x{h}")


def main() -> int:
    argv = sys.argv[1:]
    check_only = "--check" in argv
    percent = 0.0
    if "--force" in argv:
        i = argv.index("--force")
        percent = float(argv[i + 1])
        argv = argv[:i] + argv[i + 2:]
    args = [a for a in argv if not a.startswith("--")]
    if not args:
        print(__doc__)
        return 1

    found = 0
    for pattern in args:
        for path in sorted(Path().glob(pattern)) or [Path(pattern)]:
            if not path.exists():
                continue
            if percent:
                force_trim(path, percent)
            else:
                found += process(path, check_only)
    if not percent:
        print(f"\nз артефактом: {found}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
