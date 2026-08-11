# -*- coding: utf-8 -*-
import json, sys, collections
io = sys.stdout
p = r"C:\Users\devic\AppData\Local\Temp\claude\C--Users-devic\179a2a4f-58d6-4497-87c1-10c58bad20a2\scratchpad\crawl.json"
d = json.load(open(p, encoding="utf-8"))
BASE = "https://rodonit-agro-new.vercel.app"

def path(u): return u.replace(BASE, "") or "/"

print("=== ЗАГАЛЬНЕ ===")
print("сторінок:", len(d))
print("не-200:", [path(r["url"]) for r in d if r.get("status") != 200])
print("noindex:", [path(r["url"]) for r in d if r.get("robots") and "noindex" in r["robots"]])

print("\n=== TITLE ===")
short = [(path(r["url"]), r["tlen"], r["title"]) for r in d if r["tlen"] and r["tlen"] < 30]
longt = [(path(r["url"]), r["tlen"], r["title"]) for r in d if r["tlen"] > 60]
notitle = [path(r["url"]) for r in d if not r["title"]]
print("немає:", notitle)
print("<30:", len(short))
for x in short: print("   ", x)
print(">60:", len(longt))
for x in sorted(longt, key=lambda x: -x[1]): print(f"   {x[1]:>3}  {x[0]}  | {x[2]}")

dup = collections.Counter(r["title"] for r in d if r["title"])
print("\nдублікати title:", {k: v for k, v in dup.items() if v > 1})

print("\n=== META DESCRIPTION ===")
nodesc = [path(r["url"]) for r in d if not r["desc"]]
print("немає:", nodesc)
bad = [(path(r["url"]), r["dlen"]) for r in d if r["desc"] and (r["dlen"] < 120 or r["dlen"] > 165)]
print("поза 120-165:", len(bad))
for x in sorted(bad, key=lambda x: -x[1]): print("   ", x)
dupd = collections.Counter(r["desc"] for r in d if r["desc"])
print("дублікати desc:", {(k[:60] + "…"): v for k, v in dupd.items() if v > 1})

print("\n=== H1 ===")
print("немає H1:", [path(r["url"]) for r in d if r["h1n"] == 0])
print("більше 1:", [(path(r["url"]), r["h1n"], r["h1"]) for r in d if r["h1n"] > 1])
print("немає H2:", [path(r["url"]) for r in d if r["h2n"] == 0])

print("\n=== CANONICAL ===")
print("немає:", [path(r["url"]) for r in d if not r["canonical"]])
mism = [(path(r["url"]), r["canonical"]) for r in d if r["canonical"] and r["canonical"].rstrip("/") != r["url"].rstrip("/")]
print("не збігається з URL:", mism)

print("\n=== OG ===")
print("немає og:title:", [path(r["url"]) for r in d if not r["og_title"]])
ogi = collections.Counter(r["og_image"] for r in d)
print("og:image варіанти:", dict(ogi))

print("\n=== ЗОБРАЖЕННЯ ===")
tot_no_alt = sum(r["no_alt"] for r in d)
print("усього img:", sum(r["imgs"] for r in d), "| без alt:", tot_no_alt)
for r in sorted(d, key=lambda r: -r["no_alt"])[:10]:
    if r["no_alt"]: print(f"   {r['no_alt']:>2} / {r['imgs']:>2}  {path(r['url'])}")

print("\n=== SCHEMA ===")
noschema = [path(r["url"]) for r in d if not r["schema"]]
print("немає schema:", len(noschema))
for x in noschema: print("   ", x)
sc = collections.Counter(t for r in d for t in r["schema"])
print("типи:", dict(sc))

print("\n=== ОБСЯГ ТЕКСТУ ===")
thin = sorted([(r["words"], path(r["url"])) for r in d if r["words"] < 300])
print("<300 слів:", len(thin))
for w, u in thin: print(f"   {w:>4}  {u}")
print("медіана слів:", sorted(r["words"] for r in d)[len(d)//2])

print("\n=== FAQ ===")
print("сторінок із FAQ:", sum(1 for r in d if r["faq"]), "з", len(d))
print("є на:", [path(r["url"]) for r in d if r["faq"]][:20])

print("\n=== INTERNAL LINKS (у <main>) ===")
low = sorted([(r["internal"], path(r["url"])) for r in d if r["internal"] < 3])
print("<3 внутрішніх:", low)
