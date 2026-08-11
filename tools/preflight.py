# -*- coding: utf-8 -*-
"""Передпольотна перевірка перед перемиканням домену.

Ганяє всі адреси з sitemap, перевіряє коди, canonical, schema, лічильник,
404 і службові файли. Після переїзду цим самим скриптом перевіряємо бойовий:
    python tools/preflight.py https://rodonit.com.ua
"""
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'https://rodonit-agro-new.vercel.app').rstrip('/')


def get(url, timeout=30):
    req = urllib.request.Request(url, headers={'User-Agent': 'preflight'})
    try:
        r = urllib.request.urlopen(req, timeout=timeout)
        return r.status, r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace')
    except Exception as e:
        return 0, str(e)


code, sm = get(f'{BASE}/sitemap.xml')
urls = re.findall(r'<loc>([^<]+)</loc>', sm)
print(f'sitemap.xml: код {code}, адрес {len(urls)}')

problems = []


def check(u):
    path = u.replace(BASE, '') or '/'
    # Адреси в sitemap можуть бути на бойовому домені — б'ємо по BASE.
    c, html = get(BASE + re.sub(r'^https?://[^/]+', '', u))
    row = {'path': path, 'code': c}
    if c != 200:
        problems.append(f'{path}: код {c}')
        return row
    if '<link rel="canonical"' not in html:
        problems.append(f'{path}: немає canonical')
    if 'application/ld+json' not in html:
        problems.append(f'{path}: немає schema')
    t = re.search(r'<title>(.*?)</title>', html, re.S)
    if not t or len(t.group(1)) < 20:
        problems.append(f'{path}: підозрілий title')
    return row


with ThreadPoolExecutor(max_workers=8) as ex:
    rows = list(ex.map(check, urls))

print(f'сторінок 200: {sum(1 for r in rows if r["code"] == 200)} з {len(rows)}')

print('\n--- службові ---')
for p, want in [('/robots.txt', 200), ('/sitemap.xml', 200), ('/llms.txt', 200),
                ('/icon.svg', 200), ('/blog/rss.xml', 200), ('/admin', 200),
                ('/zzz-nemaje-takoyi-storinky', 404)]:
    c, html = get(BASE + p)
    ok = 'ok' if c == want else f'!!! очікували {want}'
    extra = ''
    if p == '/zzz-nemaje-takoyi-storinky':
        extra = ' | наша 404' if 'Такої сторінки' in html else ' | !!! ЧУЖА заглушка'
    print(f'{p:32} {c} {ok}{extra}')
    if c != want:
        problems.append(f'{p}: код {c}, очікували {want}')

print('\n--- аналітика й індексація на головній ---')
_, home = get(BASE + '/')
for label, needle in [('GA4', 'googletagmanager.com/gtag/js'),
                      ('Organization schema', '"@type":"Organization"'),
                      ('noindex (не має бути!)', 'noindex')]:
    print(f'{label:28} {"є" if needle in home else "немає"}')

_, robots = get(BASE + '/robots.txt')
blocks_all = bool(re.search(r'Disallow: /\s*$', robots, re.M))
print('robots: повне закриття від індексації — ' + ('Є, СТОП!' if blocks_all else 'немає, добре'))
if blocks_all:
    problems.append('robots.txt закриває весь сайт від індексації')

print('\n=== ПІДСУМОК ===')
if problems:
    print(f'проблем: {len(problems)}')
    for p in problems[:25]:
        print('  •', p)
else:
    print('Проблем не знайдено.')
