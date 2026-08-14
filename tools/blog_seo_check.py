"""SEO/GEO-перевірка згенерованої сторінки статті."""
import html
import re
import sys
from pathlib import Path

for s in (sys.stdout, sys.stderr):
    try:
        s.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

src = (Path(__file__).parent / "f.html").read_text(encoding="utf-8")


def one(pattern: str) -> str:
    m = re.search(pattern, src)
    return html.unescape(m.group(1)) if m else "— НЕМАЄ"


title = one(r"<title>(.*?)</title>")
desc = one(r'<meta name="description" content="(.*?)"')
types = sorted(set(re.findall(r'"@type":"(Article|BreadcrumbList|FAQPage|Question)"', src)))
h1 = re.sub(r"<[^>]+>", "", one(r"<h1[^>]*>(.*?)</h1>"))

print(f"title       ({len(title)} симв.): {title}")
print(f"description ({len(desc)} симв.): {desc[:95]}…")
print(f"canonical   : {one(chr(60) + 'link rel=.canonical. href=.(.*?).')}")
print(f"H1          : {h1[:80]}")
print(f"H2 у статті : {len(re.findall(r'<h2', src))}")
print(f"schema      : {types}")
print(f"Question    : {len(re.findall(chr(34) + '@type' + chr(34) + ':' + chr(34) + 'Question' + chr(34), src))}")
leaked = len(re.findall(r"\[\[(product|rates|callout|faq)", src))
print(f"datePublished: {'є' if 'datePublished' in src else 'НЕМАЄ'}")
print(f"маркери в тексті: {leaked} (має бути 0)")
