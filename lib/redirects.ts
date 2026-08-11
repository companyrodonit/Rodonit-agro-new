// ⚠️ ЗГЕНЕРОВАНО. Не правити руками — джерело tools/redirects-draft.csv,
// генератор tools/gen_redirects.py. Правки в CSV → перезапустити скрипт.
//
// Карта 301 зі старого OpenCart на новий сайт. Вмикається в момент
// перемикання домену rodonit.com.ua; до того ці адреси на нашому
// vercel.app просто ніхто не запитує, шкоди від них немає.
//
// Сторінок старого сайту: 174. Тут: 72.
// Без адреси призначення (чекають рішення замовника): 102.

import type { NextConfig } from 'next';

type Redirect = Awaited<ReturnType<NonNullable<NextConfig['redirects']>>>[number];

export const legacyRedirects: Redirect[] = [
  // Міра, РК [точний]
  { source: '/index.php', has: [{ type: 'query', key: 'route', value: 'product/product' }, { type: 'query', key: 'product_id', value: '56' }], destination: '/preparaty/mira-rk', permanent: true },
  // Гідролип [точний]
  { source: '/index.php', has: [{ type: 'query', key: 'route', value: 'product/product' }, { type: 'query', key: 'product_id', value: '57' }], destination: '/preparaty/hydrolip', permanent: true },
  // Міра ЛИП [розділ]
  { source: '/index.php', has: [{ type: 'query', key: 'route', value: 'product/product' }, { type: 'query', key: 'product_id', value: '58' }], destination: '/preparaty', permanent: true },
  // Ризобакт "Гуміфікатор" [розділ]
  { source: '/index.php', has: [{ type: 'query', key: 'route', value: 'product/product' }, { type: 'query', key: 'product_id', value: '61' }], destination: '/preparaty', permanent: true },
  // Лігногумат [точний]
  { source: '/index.php', has: [{ type: 'query', key: 'route', value: 'product/product' }, { type: 'query', key: 'product_id', value: '63' }], destination: '/preparaty/mira-rk', permanent: true },
  // Верно FG Cu30 + Zn30 [точний]
  { source: '/index.php', has: [{ type: 'query', key: 'route', value: 'product/product' }, { type: 'query', key: 'product_id', value: '83' }], destination: '/preparaty/verno-fg', permanent: true },
  // НОРДОКС 75 WG — концентрована мідь, яка працює на захист і результат ( [точний]
  { source: '/index.php', has: [{ type: 'query', key: 'route', value: 'product/product' }, { type: 'query', key: 'product_id', value: '84' }], destination: '/preparaty/nordoks', permanent: true },
  // Верно СаВ — корекція кальцію й бору, яка реально працює [точний]
  { source: '/index.php', has: [{ type: 'query', key: 'route', value: 'product/product' }, { type: 'query', key: 'product_id', value: '85' }], destination: '/preparaty/verno-sav', permanent: true },
  // Про компанію [точний]
  { source: '/uk', destination: '/about', permanent: true },
  // Баштанні культури [точний]
  { source: '/uk/bahchevye-kultury', destination: '/kultury/bashtanni-kultury', permanent: true },
  // Баклажан [точний]
  { source: '/uk/baklazhan', destination: '/kultury/baklazhan', permanent: true },
  // Бактеріальний опік [розділ]
  { source: '/uk/bakterialnyiy-ozhog', destination: '/rishennia', permanent: true },
  // Бактеріози [розділ]
  { source: '/uk/bakterioz', destination: '/rishennia', permanent: true },
  // Буряк столовий [точний]
  { source: '/uk/buryak', destination: '/kultury/buriak-stolovyi', permanent: true },
  // Надмірна вологість [розділ]
  { source: '/uk/chrezmernaya-vlazhnost', destination: '/rishennia', permanent: true },
  // Контакти [точний]
  { source: '/uk/contacts', destination: '/contacts', permanent: true },
  // Квіткові культури [точний]
  { source: '/uk/cvetochnye-kultury', destination: '/kultury/kvitkovi-kultury', permanent: true },
  // Дезінфекція [розділ]
  { source: '/uk/dezinfektsiya', destination: '/rishennia', permanent: true },
  // Гербіцидний стрес [розділ]
  { source: '/uk/gerbetsidnyiy-stress', destination: '/rishennia', permanent: true },
  // Горох [точний]
  { source: '/uk/goroh', destination: '/kultury/horokh', permanent: true },
  // Градобій [розділ]
  { source: '/uk/gradoboy', destination: '/rishennia', permanent: true },
  // Інфотека [точний]
  { source: '/uk/infoteck', destination: '/blog', permanent: true },
  // Капуста [точний]
  { source: '/uk/kapusta', destination: '/kultury/kapusta', permanent: true },
  // Картопля [точний]
  { source: '/uk/kartofel', destination: '/kultury/kartoplia', permanent: true },
  // Полуниця [точний]
  { source: '/uk/klubnika2', destination: '/kultury/polunytsia', permanent: true },
  // Кісточкові культури [точний]
  { source: '/uk/kostochkovye-kultury', destination: '/kultury/kistochkovi-kultury', permanent: true },
  // Кукурудза [точний]
  { source: '/uk/kukuruza', destination: '/kultury/kukurudza', permanent: true },
  // Цибуля [точний]
  { source: '/uk/luk', destination: '/kultury/tsybulia', permanent: true },
  // Малина [точний]
  { source: '/uk/malina', destination: '/kultury/malyna', permanent: true },
  // MIRA LIFE S1 [розділ]
  { source: '/uk/mira-life-s1', destination: '/preparaty', permanent: true },
  // MIRA LIFE S2 [розділ]
  { source: '/uk/mira-life-s2', destination: '/preparaty', permanent: true },
  // Морква [розділ]
  { source: '/uk/morkov', destination: '/kultury', permanent: true },
  // Новини [точний]
  { source: '/uk/novosti', destination: '/blog/category/novyny', permanent: true },
  // Огірок [точний]
  { source: '/uk/ogurec', destination: '/kultury/ohirok', permanent: true },
  // Перець [точний]
  { source: '/uk/perec', destination: '/kultury/perets', permanent: true },
  // Соняшник [точний]
  { source: '/uk/podsolnuh', destination: '/kultury/soniashnyk', permanent: true },
  // Стимулятори і регулятори росту рослин [точний]
  { source: '/uk/preparaty', destination: '/preparaty', permanent: true },
  // Застосування препаратів на горосі [близький]
  { source: '/uk/primenenie-na-goroxe', destination: '/kultury/horokh', permanent: true },
  // Застосування препаратів на капусті [близький]
  { source: '/uk/primenenie-na-kapuste', destination: '/kultury/kapusta', permanent: true },
  // Застосування препаратів на картоплі [близький]
  { source: '/uk/primenenie-na-kartofele', destination: '/kultury/kartoplia', permanent: true },
  // Застосування препаратів на кукурудзі [близький]
  { source: '/uk/primenenie-na-kukuruze', destination: '/kultury/kukurudza', permanent: true },
  // Застосування препаратів на цибулі [близький]
  { source: '/uk/primenenie-na-luke', destination: '/kultury/tsybulia', permanent: true },
  // Застосування препаратів на моркві [розділ]
  { source: '/uk/primenenie-na-morkovi', destination: '/kultury', permanent: true },
  // Застосування препаратів на огірку [близький]
  { source: '/uk/primenenie-na-ogurce', destination: '/kultury/ohirok', permanent: true },
  // Застосування препаратів на соняшнику [близький]
  { source: '/uk/primenenie-na-podsolnuxe', destination: '/kultury/soniashnyk', permanent: true },
  // Застосування препаратів на рапсі [близький]
  { source: '/uk/primenenie-na-rapse', destination: '/kultury/ripak', permanent: true },
  // Застосування препаратів на цукровому буряку [близький]
  { source: '/uk/primenenie-na-saxarnoj-svekle', destination: '/kultury/buriak-tsukrovyi', permanent: true },
  // Застосування препаратів на томаті [близький]
  { source: '/uk/primenenie-na-tomate', destination: '/kultury/tomat', permanent: true },
  // Застосування препаратів на винограді [близький]
  { source: '/uk/primenenie-na-vinograde', destination: '/kultury/vynohrad', permanent: true },
  // Застосування препаратів на плодових [близький]
  { source: '/uk/primenenie-na-yabloke', destination: '/kultury/zerniatkovi', permanent: true },
  // Застосування препаратів на зернових культурах [близький]
  { source: '/uk/primenenie-na-zernovyx-kulturax', destination: '/kultury/zernovi-kultury', permanent: true },
  // Застосування препаратів на сої [близький]
  { source: '/uk/priminenie-na-soye', destination: '/kultury/soia', permanent: true },
  // Застосування препаратів на столовому буряку [розділ]
  { source: '/uk/primineniye-na-stolovoi-svekle', destination: '/kultury', permanent: true },
  // Вирішення проблем [точний]
  { source: '/uk/problem', destination: '/rishennia', permanent: true },
  // Ріпак [точний]
  { source: '/uk/raps', destination: '/kultury/ripak', permanent: true },
  // Розтріскування стручків [точний]
  { source: '/uk/rastreskivaniya-struchkov', destination: '/rishennia/roztriskuvannia-struchkiv', permanent: true },
  // Результати застосування [точний]
  { source: '/uk/result', destination: '/kultury', permanent: true },
  // Зерняткові [точний]
  { source: '/uk/seeds', destination: '/kultury/zerniatkovi', permanent: true },
  // Cлабка коренева система [розділ]
  { source: '/uk/slabaya-kornevaya-sistema', destination: '/rishennia', permanent: true },
  // Соя [точний]
  { source: '/uk/soya', destination: '/kultury/soia', permanent: true },
  // Буряк цукровий [точний]
  { source: '/uk/svekla-saharnaya', destination: '/kultury/buriak-tsukrovyi', permanent: true },
  // Технологічні схеми [точний]
  { source: '/uk/tehno-shemi', destination: '/kultury', permanent: true },
  // Томат [точний]
  { source: '/uk/tomat', destination: '/kultury/tomat', permanent: true },
  // Управління рослинними рештками [розділ]
  { source: '/uk/upravlenie-rastitelnyimi-ostatkami', destination: '/rishennia', permanent: true },
  // Посилення дії ЗЗР і добрив [точний]
  { source: '/uk/usilenie-deystviya-pestitsidov-i-udobreniy', destination: '/rishennia/posylennia-dii-zzr', permanent: true },
  // Весняні заморозки [розділ]
  { source: '/uk/vesennie-zamorozki', destination: '/rishennia', permanent: true },
  // Виноград [точний]
  { source: '/uk/vinograd', destination: '/kultury/vynohrad', permanent: true },
  // Вірусні захворювання [розділ]
  { source: '/uk/virusnyie-zabolevaniya', destination: '/rishennia', permanent: true },
  // Вихід із зими [розділ]
  { source: '/uk/vyihod-iz-zimyi', destination: '/rishennia', permanent: true },
  // Посуха [розділ]
  { source: '/uk/zasuha', destination: '/rishennia', permanent: true },
  // Зеребра Агро [точний]
  { source: '/uk/zerebra-agro', destination: '/preparaty/silver-mix', permanent: true },
  // Зернові культури [точний]
  { source: '/uk/zernovyeja-kultury', destination: '/kultury/zernovi-kultury', permanent: true },
];
