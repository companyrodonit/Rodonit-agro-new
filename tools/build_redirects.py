# -*- coding: utf-8 -*-
"""Складає чернетку карти 301 зі знятих 174 URL старого сайту."""
import csv, json, os, re

SP = (r"C:\Users\devic\AppData\Local\Temp\claude"
      r"\C--Users-devic\179a2a4f-58d6-4497-87c1-10c58bad20a2\scratchpad")
PROJ = r"C:\Users\devic\Desktop\rodonit-agro-redesign"
OUT = os.path.join(PROJ, "tools", "redirects-draft.csv")

old = json.load(open(os.path.join(SP, "old-site.json"), encoding="utf-8"))

# ── Ручні відповідники ───────────────────────────────────────────────────
# Культури: слаг старого сайту (транслітерація з російської) → наш слаг.
CULTURE = {
    "zernovyeja-kultury": "zernovi-kultury", "podsolnuh": "soniashnyk",
    "kukuruza": "kukurudza", "raps": "ripak", "soya": "soia",
    "goroh": "horokh", "svekla-saharnaya": "buriak-tsukrovyi",
    "perec": "perets", "tomat": "tomat", "ogurec": "ohirok",
    "baklazhan": "baklazhan", "kartofel": "kartoplia", "kapusta": "kapusta",
    "luk": "tsybulia", "buryak": "buriak-stolovyi", "seeds": "zerniatkovi",
    "vinograd": "vynohrad", "kostochkovye-kultury": "kistochkovi-kultury",
    "bahchevye-kultury": "bashtanni-kultury", "cvetochnye-kultury": "kvitkovi-kultury",
    "klubnika2": "polunytsia", "malina": "malina",
    # morkov — у новому сайті моркви немає
}

# «Результати застосування» лягають на ті самі культури.
RESULT = {
    "primenenie-na-zernovyx-kulturax": "zernovi-kultury",
    "primenenie-na-podsolnuxe": "soniashnyk",
    "primenenie-na-kukuruze": "kukurudza",
    "primenenie-na-rapse": "ripak",
    "primenenie-na-saxarnoj-svekle": "buriak-tsukrovyi",
    "priminenie-na-soye": "soia",
    "primenenie-na-kartofele": "kartoplia",
    "primenenie-na-tomate": "tomat",
    "primenenie-na-kapuste": "kapusta",
    "primenenie-na-ogurce": "ohirok",
    "priminenie-na-stolovoi-svekle": "buriak-stolovyi",
    "primenenie-na-luke": "tsybulia",
    "primenenie-na-goroxe": "horokh",
    "primenenie-na-vinograde": "vynohrad",
    "primenenie-na-yabloke": "zerniatkovi",
    # primenenie-na-morkovi — моркви немає
}

# Препарати. product_id зі старої БД і ЧПУ-слаги.
PRODUCT_ID = {
    "56": "mira-rk", "57": "hydrolip", "85": "verno-sav",
    "83": "verno-fg", "84": "nordoks",
    "63": "mira-rk",   # Лігногумат = теперішня Міра, РК
    "58": None,        # Міра ЛИП
    "61": None,        # Ризобакт «Гуміфікатор»
}
PRODUCT_SLUG = {
    "zerebra-agro": "silver-mix",   # перейменовано на Сільвер Мікс
    "mira-life-s1": None,
    "mira-life-s2": None,
}

STATIC = {
    "/uk": "/about",
    "/uk/": "/about",
    "/uk/contacts": "/contacts",
    "/uk/preparaty": "/preparaty",
    "/uk/problem": "/rishennia",
    "/uk/result": "/kultury",
    "/uk/tehno-shemi": "/kultury",
    "/uk/infoteck": "/blog",
    "/uk/novosti": "/blog/category/novyny",
    "/uk/usilenie-deystviya-pestitsidov-i-udobreniy": "/rishennia/posylennia-dii-zzr",
    "/uk/rastreskivaniya-struchkov": "/rishennia/roztriskuvannia-struchkiv",
}


def target(rec):
    """→ (нова адреса | None, впевненість, коментар)"""
    path, sec = rec["path"], rec["section"]
    clean = path.split("?")[0].rstrip("/") or "/uk"

    if clean in STATIC or path in STATIC:
        return STATIC.get(clean) or STATIC[path], "точний", ""

    slug = clean.rsplit("/", 1)[-1]

    if sec == "product":
        m = re.search(r"product_id=(\d+)", path)
        t = PRODUCT_ID.get(m.group(1)) if m else PRODUCT_SLUG.get(slug, "нема")
        if t:
            return f"/preparaty/{t}", "точний", ""
        return "/preparaty", "розділ", "препарату немає в новому портфелі"

    if sec == "diagram":
        t = CULTURE.get(slug)
        if t:
            return f"/kultury/{t}", "точний", ""
        return "/kultury", "розділ", "культури немає в новому сайті"

    if sec == "result":
        t = RESULT.get(slug)
        if t:
            return f"/kultury/{t}", "близький", "сторінка результатів → сторінка культури"
        return "/kultury", "розділ", "культури немає в новому сайті"

    if sec == "problem":
        return "/rishennia", "розділ", "проблеми немає в новому сайті"

    if sec == "category":
        return "/preparaty", "точний", ""

    return None, "ПОТРЕБУЄ РІШЕННЯ", "інфосторінка — вирішує замовник"


rows = []
for r in sorted(old, key=lambda x: (x["section"], x["path"])):
    t, conf, note = target(r)
    rows.append({
        "розділ": r["section"],
        "стара адреса": r["path"],
        "заголовок": (r["h1"] or r["title"]).replace("&quot;", '"')[:90],
        "слів": r["words"],
        "нова адреса": t or "",
        "впевненість": conf,
        "коментар": note,
    })

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys()), delimiter=";")
    w.writeheader()
    w.writerows(rows)

from collections import Counter
c = Counter(r["впевненість"] for r in rows)
print("Усього URL:", len(rows))
for k, v in c.most_common():
    print(f"  {k:<18} {v}")
print("\nФайл:", OUT)
