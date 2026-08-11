# -*- coding: utf-8 -*-
"""
Скан мобільної верстки 390x844 по всіх сторінках із sitemap.

Шукає дві речі, які видно оком, але не видно в коді:
 1) «розірваний токен» — текстовий вузол, що є одним неподільним значенням
    (номер, email, домен), але відрендерений у кілька рядків, тобто
    перенесений посеред себе. Міряємо Range.getClientRects() на самому
    текстовому вузлі: у DOM він лишається одним вузлом, і інакше про розрив
    не дізнатись;
 2) горизонтальне перепевнення — елемент, що виходить за праву межу вікна
    (свідомі горизонтальні скролери на кшталт слайдера препаратів не рахуємо).
"""
import asyncio, re, urllib.request

BASE = "http://localhost:4002"

JS = r"""
() => {
  const out = { broken: [], overflow: [], docW: document.documentElement.scrollWidth };
  const vw = window.innerWidth;
  const ATOMIC = /^\s*(\+?[\d()\s-]{9,}|[^\s@]+@[^\s@]+\.[^\s@]+|https?:\/\/\S+|[\w.-]+\.(com|ua|net|org)(\.ua)?)\s*$/i;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const t = n.nodeValue;
    if (!t || !ATOMIC.test(t)) continue;
    const r = document.createRange();
    r.selectNodeContents(n);
    const rects = [...r.getClientRects()].filter(x => x.width > 0 && x.height > 0);
    const rows = new Set(rects.map(x => Math.round(x.top)));
    if (rows.size > 1) {
      out.broken.push({
        text: t.trim().slice(0, 40),
        rows: rows.size,
        cls: ((n.parentElement && n.parentElement.className) || '').toString().slice(0, 70)
      });
    }
  }

  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.right <= vw + 1) return;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed') return;
    let p = el.parentElement, scroller = false;
    while (p && p !== document.body) {
      const o = getComputedStyle(p).overflowX;
      if (o === 'auto' || o === 'scroll') { scroller = true; break; }
      p = p.parentElement;
    }
    if (scroller) return;
    out.overflow.push({
      tag: el.tagName,
      cls: (el.className || '').toString().slice(0, 70),
      right: Math.round(r.right),
      text: (el.textContent || '').trim().slice(0, 40)
    });
  });
  return out;
}
"""


def sitemap_urls():
    with urllib.request.urlopen(BASE + "/sitemap.xml", timeout=30) as r:
        return re.findall(r"<loc>(.*?)</loc>", r.read().decode())


async def main():
    from playwright.async_api import async_playwright
    urls = sitemap_urls()
    bad = 0
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        pg = await b.new_page(viewport={"width": 390, "height": 844})
        for url in urls:
            await pg.goto(url, wait_until="networkidle")
            r = await pg.evaluate(JS)
            path = url.replace(BASE, "") or "/"
            issues = []
            if r["docW"] > 391:
                issues.append(f"СТОРІНКА ШИРША ЗА ЕКРАН: {r['docW']}px")
            for x in r["broken"]:
                issues.append(f"розірвано на {x['rows']} рядки: «{x['text']}»  [{x['cls']}]")
            seen = set()
            for o in r["overflow"]:
                k = o["tag"] + o["cls"]
                if k in seen:
                    continue
                seen.add(k)
                issues.append(f"вилазить праворуч до {o['right']}px: <{o['tag']}> {o['cls']} «{o['text']}»")
            if issues:
                bad += 1
                print(f"\n### {path}")
                for i in issues[:6]:
                    print("   " + i)
                if len(issues) > 6:
                    print(f"   … ще {len(issues) - 6}")
        await b.close()
    print(f"\nПеревірено {len(urls)} сторінок, з проблемами: {bad}")


asyncio.run(main())
