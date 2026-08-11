# -*- coding: utf-8 -*-
"""Краул проду Родоніт по sitemap: title/desc/H1/H2/alt/schema/canonical/OG/слова."""
import json, re, sys, urllib.request, concurrent.futures as cf

BASE = "https://rodonit-agro-new.vercel.app"

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 SEO-Audit"})
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.status, r.read().decode("utf-8", "replace")

_, sm = get(BASE + "/sitemap.xml")
urls = re.findall(r"<loc>(.*?)</loc>", sm)

TAG = re.compile(r"<[^>]+>")

def strip_tags(h):
    h = re.sub(r"(?is)<(script|style|svg|noscript)[^>]*>.*?</\1>", " ", h)
    return re.sub(r"\s+", " ", TAG.sub(" ", h)).strip()

def analyse(url):
    try:
        status, html = get(url)
    except Exception as e:
        return {"url": url, "error": str(e)}

    def one(pat):
        m = re.search(pat, html, re.I | re.S)
        return m.group(1).strip() if m else None

    title = one(r"<title[^>]*>(.*?)</title>")
    desc = one(r'<meta[^>]+name="description"[^>]+content="(.*?)"') or \
           one(r'<meta[^>]+content="(.*?)"[^>]+name="description"')
    canon = one(r'<link[^>]+rel="canonical"[^>]+href="(.*?)"')
    ogt = one(r'<meta[^>]+property="og:title"[^>]+content="(.*?)"')
    ogi = one(r'<meta[^>]+property="og:image[^"]*"[^>]+content="(.*?)"')
    robots = one(r'<meta[^>]+name="robots"[^>]+content="(.*?)"')

    h1 = [strip_tags(x) for x in re.findall(r"(?is)<h1[^>]*>(.*?)</h1>", html)]
    h2 = [strip_tags(x) for x in re.findall(r"(?is)<h2[^>]*>(.*?)</h2>", html)]
    h3 = re.findall(r"(?is)<h3[^>]*>", html)

    imgs = re.findall(r"(?is)<img\s[^>]*>", html)
    no_alt = [i for i in imgs if not re.search(r'\salt\s*=\s*"[^"]+"', i)]

    schemas = []
    for blob in re.findall(r'(?is)<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html):
        try:
            d = json.loads(blob)
            items = d if isinstance(d, list) else [d]
            for it in items:
                g = it.get("@graph")
                for n in (g if isinstance(g, list) else [it]):
                    if isinstance(n, dict) and n.get("@type"):
                        schemas.append(n["@type"])
        except Exception:
            schemas.append("PARSE_ERROR")

    text = strip_tags(html)
    words = len(text.split())

    body = re.search(r"(?is)<main[^>]*>(.*?)</main>", html)
    scope = body.group(1) if body else html
    internal = set(re.findall(r'(?is)<a[^>]+href="(/[^"#?]*)"', scope))

    return {
        "url": url, "status": status,
        "title": title, "tlen": len(title) if title else 0,
        "desc": desc, "dlen": len(desc) if desc else 0,
        "canonical": canon, "og_title": bool(ogt), "og_image": ogi,
        "robots": robots,
        "h1": h1, "h1n": len(h1), "h2n": len(h2), "h3n": len(h3),
        "imgs": len(imgs), "no_alt": len(no_alt),
        "schema": sorted(set(schemas)), "words": words,
        "internal": len(internal),
        "faq": bool(re.search(r"(?i)(часті запитання|поширені запитання|FAQ)", text)),
        "html_bytes": len(html),
    }

with cf.ThreadPoolExecutor(max_workers=8) as ex:
    res = list(ex.map(analyse, urls))

out = r"C:\Users\devic\AppData\Local\Temp\claude\C--Users-devic\179a2a4f-58d6-4497-87c1-10c58bad20a2\scratchpad\crawl.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(res, f, ensure_ascii=False, indent=1)

print("Сторінок:", len(res))
print("Помилок:", sum(1 for r in res if r.get("error")))
