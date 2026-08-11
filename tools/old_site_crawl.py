# -*- coding: utf-8 -*-
"""
Знімає повний перелік URL старого rodonit.com.ua з його sitemap-індексу,
з заголовком і H1 кожної сторінки. Це вихідні дані для карти 301.

Тільки читання. Нічого на чужому сайті не змінюємо.
"""
import json, re, time, urllib.request, urllib.error, concurrent.futures as cf

BASE = "https://rodonit.com.ua"
SECTIONS = ["product", "category", "information", "problem", "result", "diagram"]
OUT = (r"C:\Users\devic\AppData\Local\Temp\claude"
       r"\C--Users-devic\179a2a4f-58d6-4497-87c1-10c58bad20a2\scratchpad\old-site.json")

HDR = {"User-Agent": "Mozilla/5.0 (compatible; RodonitMigrationAudit/1.0)"}


def fetch(url, timeout=45):
    req = urllib.request.Request(url, headers=HDR)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read().decode("utf-8", "replace")


def collect_urls():
    seen = {}
    for sec in SECTIONS:
        try:
            _, xml = fetch(f"{BASE}/index.php?route=feed/advanced_sitemap/{sec}")
        except Exception as e:
            print(f"  ! {sec}: {e}")
            continue
        for loc in re.findall(r"<loc>(.*?)</loc>", xml):
            loc = loc.replace("&amp;", "&").strip()
            seen.setdefault(loc, sec)
        print(f"  {sec}: {sum(1 for v in seen.values() if v == sec)} унікальних")
    return seen


TAG = re.compile(r"<[^>]+>")


def strip(h):
    h = re.sub(r"(?is)<(script|style|svg|noscript)[^>]*>.*?</\1>", " ", h)
    return re.sub(r"\s+", " ", TAG.sub(" ", h)).strip()


def probe(item):
    url, section = item
    rec = {"url": url, "section": section, "path": url.replace(BASE, "")}
    try:
        status, html = fetch(url)
    except urllib.error.HTTPError as e:
        rec["status"] = e.code
        return rec
    except Exception as e:
        rec["error"] = str(e)[:80]
        return rec

    rec["status"] = status
    t = re.search(r"(?is)<title[^>]*>(.*?)</title>", html)
    rec["title"] = strip(t.group(1))[:150] if t else ""
    h1 = re.findall(r"(?is)<h1[^>]*>(.*?)</h1>", html)
    rec["h1"] = strip(h1[0])[:120] if h1 else ""
    rec["words"] = len(strip(html).split())
    return rec


print("Збираю URL зі sitemap…")
urls = collect_urls()
print(f"Разом унікальних: {len(urls)}\n")

print("Читаю сторінки…")
items = list(urls.items())
res = []
with cf.ThreadPoolExecutor(max_workers=5) as ex:
    for i, r in enumerate(ex.map(probe, items), 1):
        res.append(r)
        if i % 25 == 0:
            print(f"  {i}/{len(items)}")

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(res, f, ensure_ascii=False, indent=1)

ok = sum(1 for r in res if r.get("status") == 200)
print(f"\nГотово: {len(res)} URL, з них 200 → {ok}, інші → {len(res) - ok}")
print("Файл:", OUT)
