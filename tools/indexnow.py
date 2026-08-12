# -*- coding: utf-8 -*-
"""Повідомляє Bing (і Yandex) про наші сторінки через IndexNow.

Навіщо: кабінет Bing Webmaster у серпні 2026 не пускав ні через Google, ні
через Microsoft (їхня помилка на боці сервера). IndexNow дає той самий
результат — адреси потрапляють у чергу на обхід — і не вимагає жодного
кабінету. Bing потрібен не сам по собі: пошук ChatGPT читає його індекс.

Як працює: на сайті лежить файл-ключ `public/<KEY>.txt` із тим самим ключем
усередині. Ним IndexNow перевіряє, що адреси надсилає власник сайту.

Запуск (без аргументів бере всі адреси з sitemap):
    python tools/indexnow.py
    python tools/indexnow.py https://rodonit.com.ua/preparaty/nordoks
"""
import json
import re
import sys
import urllib.error
import urllib.request

HOST = 'rodonit.com.ua'
KEY = 'edae636c1be93146eb0533eae0228e61'
SITE = f'https://{HOST}'
ENDPOINT = 'https://api.indexnow.org/indexnow'


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'indexnow-submit'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode('utf-8', 'replace')


urls = sys.argv[1:]
if not urls:
    urls = re.findall(r'<loc>([^<]+)</loc>', get(f'{SITE}/sitemap.xml'))
    print(f'адрес із sitemap: {len(urls)}')

# Ключ мусить лежати на самому сайті — інакше IndexNow відхилить заявку.
key_url = f'{SITE}/{KEY}.txt'
try:
    if get(key_url).strip() != KEY:
        print(f'✗ {key_url} віддає не той вміст'); sys.exit(1)
    print(f'файл-ключ на місці: {key_url}')
except Exception as e:
    print(f'✗ файл-ключ недоступний ({e}) — спершу задеплой сайт'); sys.exit(1)

body = json.dumps({
    'host': HOST,
    'key': KEY,
    'keyLocation': key_url,
    'urlList': urls,
}).encode('utf-8')

req = urllib.request.Request(
    ENDPOINT, data=body, method='POST',
    headers={'Content-Type': 'application/json; charset=utf-8'},
)
try:
    with urllib.request.urlopen(req, timeout=60) as r:
        code = r.status
except urllib.error.HTTPError as e:
    code = e.code

# 200 — прийнято, 202 — прийнято й поставлено в чергу на перевірку ключа.
print(f'відповідь IndexNow: {code}', '— прийнято' if code in (200, 202) else '— ПОМИЛКА')
if code == 403:
    print('  403 = ключ не збігається з файлом на сайті')
if code == 422:
    print('  422 = адреси не з того домену, що в host')
