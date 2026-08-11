# -*- coding: utf-8 -*-
"""
Шукає одиниці виміру, розірвані переносом рядка: «кг/» / «га».

Браузер вважає косу риску місцем, де можна перенести, тож «1,0–3,0 кг/га»
на вузькій колонці розпадається. Це не ламає сенс так, як розірваний номер,
але виглядає неохайно — і трапляється саме там, де в аграрія головна
інформація: у нормах витрати.

Міряємо піддіапазоном: Range на конкретну підстроку всередині текстового
вузла, далі getClientRects(). Порівнювати рядки марно — у DOM це один вузол.
"""
import asyncio, re, urllib.request

BASE = "http://localhost:4002"

JS = r"""
() => {
  // Ловимо розрив УСЕРЕДИНІ одиниці («кг/» + «га») — це справжній дефект.
  // Розрив між числом і одиницею («0,2-0,5» + «кг/га») не рахуємо: це
  // нормальний перенос, і зшивати їх нерозривним пробілом на вузькій колонці
  // означало б отримати 13-символьний неподільний токен і переповнення.
  const UNIT = /(кг|г|мг|л|мл|т|Cu|Zn|шт)\/(га|т|кг|л|м|га²)/g;
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const t = n.nodeValue;
    if (!t || !/[\/]/.test(t)) continue;
    let m;
    UNIT.lastIndex = 0;
    while ((m = UNIT.exec(t))) {
      const r = document.createRange();
      r.setStart(n, m.index);
      r.setEnd(n, m.index + m[0].length);
      const rows = new Set([...r.getClientRects()]
        .filter(x => x.width > 0).map(x => Math.round(x.top)));
      if (rows.size > 1) out.push(m[0]);
    }
  }
  return out;
}
"""


def sitemap_urls():
    with urllib.request.urlopen(BASE + "/sitemap.xml", timeout=30) as r:
        return re.findall(r"<loc>(.*?)</loc>", r.read().decode())


async def main():
    from playwright.async_api import async_playwright
    urls = sitemap_urls()
    total, pages = 0, 0
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        pg = await b.new_page(viewport={"width": 390, "height": 844})
        for url in urls:
            await pg.goto(url, wait_until="networkidle")
            hits = await pg.evaluate(JS)
            if hits:
                pages += 1
                total += len(hits)
                path = url.replace(BASE, "") or "/"
                print(f"{len(hits):>3}  {path}   напр.: {', '.join(hits[:3])}")
        await b.close()
    print(f"\nСторінок із розірваними одиницями: {pages}, випадків: {total}")


asyncio.run(main())
