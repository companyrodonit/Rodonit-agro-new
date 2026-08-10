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

export function GET(): Response {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: ${SITE}/sitemap.xml`,
    `Host: ${SITE}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
