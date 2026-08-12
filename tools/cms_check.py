# -*- coding: utf-8 -*-
"""Наскрізна перевірка адмінки: чи кожне поле CMS реально доїжджає на сайт.

Логіка на кожне поле: підставити мітку → відкрити сторінку → пошукати мітку
→ повернути початкове значення. Пишемо через REST API Payload, тобто тим
самим шляхом, яким зберігає редактор — тому спрацьовують і хуки скидання кешу.

Запуск (сервер має бути піднятий на тій самій базі):
    python tools/cms_check.py http://localhost:4050
"""
import json
import sys
import time
import urllib.error
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4050').rstrip('/')
EMAIL = 'reklama@rodonit.com.ua'
PASSWORD = 'Rodonit-2026-Redesign!'
MARK = 'ZZQ7'  # мітка, якої не буває в контенті

token = None


def api(method, path, body=None):
    req = urllib.request.Request(
        BASE + path,
        method=method,
        data=json.dumps(body).encode('utf-8') if body is not None else None,
        headers={
            'Content-Type': 'application/json',
            **({'Authorization': f'JWT {token}'} if token else {}),
        },
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode('utf-8'))


def page(path):
    req = urllib.request.Request(BASE + path, headers={'User-Agent': 'cms-check'})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return f'HTTP {e.code}'


def login():
    global token
    r = api('POST', '/api/users/login', {'email': EMAIL, 'password': PASSWORD})
    token = r['token']


def set_deep(obj, path, value):
    """path виду 'trust.0.title' — повертає копію з підміненим значенням."""
    parts = path.split('.')
    cur = obj
    for p in parts[:-1]:
        cur = cur[int(p)] if p.isdigit() else cur[p]
    last = parts[-1]
    if last.isdigit():
        cur[int(last)] = value
    else:
        cur[last] = value
    return obj


def get_deep(obj, path):
    cur = obj
    for p in path.split('.'):
        cur = cur[int(p)] if p.isdigit() else cur[p]
    return cur


results = []


def check(label, read, write, restore, urls):
    """read() -> поточне значення; write(v) -> записати; urls -> де шукати."""
    try:
        original = read()
    except Exception as e:
        results.append((label, 'ПРОПУЩЕНО', f'немає значення ({str(e)[:40]})'))
        return
    if original is None:
        original = ''
    if not isinstance(original, str):
        results.append((label, 'ПРОПУЩЕНО', 'не текстове поле'))
        return

    # Порожні поля теж перевіряємо: саме серед них ховаються непідключені.
    probe = (original + MARK) if original.strip() else f'Перевірка {MARK}'
    try:
        write(probe)
    except Exception as e:
        results.append((label, 'ПОМИЛКА', f'не записалось: {str(e)[:60]}'))
        return

    time.sleep(1.0)
    found_on = None
    for u in urls:
        if MARK in page(u):
            found_on = u
            break

    try:
        restore(original)
    except Exception as e:
        results.append((label, 'УВАГА', f'НЕ ПОВЕРНУЛОСЬ: {str(e)[:60]}'))
        return

    results.append(
        (label, 'ok' if found_on else 'НЕ ВИДНО', found_on or ', '.join(urls))
    )


def check_global(slug, path, urls):
    def read():
        return get_deep(api('GET', f'/api/globals/{slug}?depth=0'), path)

    def write(v):
        doc = api('GET', f'/api/globals/{slug}?depth=0')
        api('POST', f'/api/globals/{slug}', set_deep(doc, path, v))

    check(f'{slug}.{path}', read, write, write, urls)


def check_doc(coll, doc_id, path, urls):
    def read():
        return get_deep(api('GET', f'/api/{coll}/{doc_id}?depth=0'), path)

    def write(v):
        doc = api('GET', f'/api/{coll}/{doc_id}?depth=0')
        api('PATCH', f'/api/{coll}/{doc_id}', set_deep(doc, path, v))

    check(f'{coll}.{path}', read, write, write, urls)


login()
print(f'База: {BASE}\n')

# ── Глобал «Головна сторінка»
for f in ['eyebrow', 'titleBefore', 'titleAccent', 'subtitle',
          'primaryCta', 'secondaryCta',
          'aboutEyebrow', 'aboutText', 'aboutLink',
          'ctaEyebrow', 'ctaTitle', 'ctaSubtitle',
          'trust.0.title', 'trust.0.text']:
    check_global('home', f, ['/'])

# ── Глобал «Контакти й налаштування»
for f, urls in [
    ('phones.0.label', ['/contacts', '/']),
    ('phones.0.value', ['/', '/contacts']),
    ('allPhones.0.group', ['/contacts']),
    ('email', ['/contacts', '/']),
    ('address', ['/contacts']),
    ('socials.0.href', ['/', '/contacts']),
    ('nav.0.label', ['/']),
    ('footerColumns.0.title', ['/']),
    ('legalName', ['/contacts']),
    ('edrpou', ['/contacts']),
    ('legalAddress', ['/contacts']),
    ('postalAddress', ['/contacts']),
    ('delivery.0.title', ['/preparaty/nordoks']),
]:
    check_global('settings', f, urls)

# ── Колекції: беремо перший документ кожної
def first(coll, sort='order'):
    r = api('GET', f'/api/{coll}?limit=1&depth=0&sort={sort}')
    return r['docs'][0] if r['docs'] else None


prod = first('products')
if prod:
    u = [f"/preparaty/{prod['slug']}", '/preparaty', '/']
    for f in ['name', 'shortName', 'tagline', 'description',
              'keySpecs.0.label', 'keySpecs.0.value', 'specs.0.title',
              'regulations.0.rate', 'problems.0.title', 'faq.0.question',
              'faq.0.answer', 'seoTitle', 'metaDescription']:
        check_doc('products', prod['id'], f, u)

cult = first('cultures')
if cult:
    for f in ['name', 'intro']:
        check_doc('cultures', cult['id'], f, [f"/kultury/{cult['slug']}", '/kultury', '/'])

sol = first('solutions')
if sol:
    for f in ['title', 'lead']:
        check_doc('solutions', sol['id'], f, [f"/rishennia/{sol['slug']}", '/rishennia', '/'])

dist = first('distributors')
if dist:
    for f in ['name', 'role', 'address']:
        check_doc('distributors', dist['id'], f, ['/distributors'])

cat = first('categories')
if cat:
    for f in ['name', 'description']:
        check_doc('categories', cat['id'], f, ['/', '/preparaty'])

bcat = first('blog-categories')
if bcat:
    for f in ['name', 'description']:
        check_doc('blog-categories', bcat['id'], f,
                  [f"/blog/category/{bcat['slug']}", '/blog'])

post = first('posts', sort='-date')
if post:
    for f in ['title', 'excerpt', 'seoTitle', 'metaDescription']:
        check_doc('posts', post['id'], f, [f"/blog/{post['slug']}", '/blog'])

# alt перевіряємо на тій картинці, що реально стоїть у першого препарату,
# а не на випадковому файлі з бібліотеки.
if prod:
    full = api('GET', f"/api/products/{prod['id']}?depth=1")
    img = full.get('image')
    if isinstance(img, dict) and img.get('id'):
        check_doc('media', img['id'], 'alt',
                  [f"/preparaty/{prod['slug']}", '/preparaty'])
    else:
        results.append(('media.alt', 'ПРОПУЩЕНО', 'у препарату немає фото'))

print(f"{'поле':38} {'стан':12} де")
print('-' * 92)
bad = 0
for label, state, where in results:
    if state not in ('ok', 'ПРОПУЩЕНО'):
        bad += 1
    print(f'{label:38} {state:12} {where[:40]}')

print('\n' + '=' * 92)
print(f'усього перевірено: {len(results)} | проблем: {bad}')
