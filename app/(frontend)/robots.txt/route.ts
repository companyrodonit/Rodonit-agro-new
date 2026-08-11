import { SITE } from '@/lib/site';

/**
 * robots.txt як route handler, а НЕ як `robots.ts` (metadata-конвенція Next).
 *
 * Причина: у Next 16 файл-конвенція `robots.ts`, покладений усередину route group
 * `app/(frontend)/`, тихо не потрапляє у збірку — /robots.txt віддає 404, і збірка
 * при цьому проходить без жодного попередження. Ті самі граблі вже ловили на
 * попередньому проєкті Родоніту. Route handler групу переживає (як і blog/rss.xml).
 */
export const dynamic = 'force-static';

/**
 * Боти генеративного пошуку, яких пускаємо явно.
 *
 * Формально їх уже покриває `User-agent: *`, але явний блок вирішує дві речі.
 * По-перше, деякі з них читають ТІЛЬКИ свою секцію, якщо вона є, і тоді
 * загальні Disallow на них не поширюються — тож /admin і /api треба повторити
 * у кожній. По-друге, це фіксує рішення письмово: питання «а ми взагалі
 * пускаємо ChatGPT на сайт» більше не потребує археології.
 *
 * Розділення за призначенням важливе: GPTBot і ClaudeBot ходять по контент
 * для навчання, OAI-SearchBot і PerplexityBot — щоб процитувати сайт у
 * відповіді користувачу. Другу групу закривати не можна ніколи: це трафік.
 * Першу компанія може захотіти закрити — тоді міняється тільки цей масив.
 */
const AI_CRAWLERS = [
  'GPTBot',          // OpenAI, збір контенту
  'OAI-SearchBot',   // OpenAI, пошук у ChatGPT — джерело переходів
  'ChatGPT-User',    // ChatGPT відкриває сторінку на запит користувача
  'PerplexityBot',   // Perplexity, цитує з посиланням
  'ClaudeBot',       // Anthropic
  'Google-Extended', // керує використанням у Gemini / AI Overviews
  'Applebot-Extended',
  'Bingbot',         // індекс Bing = те, звідки читає пошук ChatGPT
];

export function GET(): Response {
  const rules = (agent: string) => [
    `User-agent: ${agent}`,
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
  ];

  const body = [
    ...rules('*'),
    ...AI_CRAWLERS.flatMap(rules),
    `Sitemap: ${SITE}/sitemap.xml`,
    `Host: ${SITE}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
