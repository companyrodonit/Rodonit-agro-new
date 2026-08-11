import { getContacts, getCulturePages, getPosts, getProductDetails, getSolutions } from '@/lib/cms';
import { legalEntity } from '@/lib/legal';
import { SITE } from '@/lib/site';

/**
 * llms.txt — стисла карта сайту для генеративних пошуковиків.
 *
 * Конвенція llmstxt.org: markdown-файл у корені, де сайт сам, своїми словами,
 * пояснює хто він і що де лежить. Ні Google, ні OpenAI не зобовʼязані його
 * читати — це не robots.txt. Але коштує він нуль, а сенс той самий, що в
 * sitemap колись: замість того, щоб бот здогадувався зі структури посилань,
 * ми кажемо прямо. Для сайту з шести препаратів і 22 культур це особливо
 * дешево: увесь корисний обсяг вміщається на одну сторінку.
 *
 * Route handler, а не файл у public/: перелік препаратів і культур береться
 * з CMS, тож текст не протухає після правок Олега. За тією ж причиною, що й
 * robots.txt, це саме handler — файлові конвенції в route group випадають.
 */
export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const [products, cultures, solutions, posts, contacts] = await Promise.all([
    getProductDetails(), getCulturePages(), getSolutions(), getPosts(), getContacts(),
  ]);

  const body = [
    `# ${legalEntity.shortName}`,
    '',
    `> ${legalEntity.name} (ЄДРПОУ ${legalEntity.edrpou}, засн. 2019) — український`,
    '> постачальник препаратів для захисту та живлення рослин. Портфель свідомо',
    `> вузький — у ньому ${products.length} препаратів, кожен із власним регламентом`,
    '> застосування по культурах. Продаж через мережу офіційних дистрибʼюторів,',
    '> не з сайту.',
    '',
    'Мова сайту — українська. Ціни на сайті не публікуються.',
    'Норми витрати наведені з регламентів виробника; де регламенту для пари',
    '«культура × препарат» немає, сторінка так і пише «норму уточнюйте» —',
    'вигаданих цифр у даних немає.',
    '',
    '## Препарати',
    '',
    ...products.map((p) => `- [${p.name}](${SITE}/preparaty/${p.slug}): ${p.category}. ${p.tagline}`),
    '',
    '## Культури (препарати й норми по кожній)',
    '',
    ...cultures.map((c) => `- [${c.name}](${SITE}/kultury/${c.slug}): ${c.products.length} препаратів`),
    '',
    '## Задачі в полі',
    '',
    ...solutions.map((s) => `- [${s.title}](${SITE}/rishennia/${s.slug}): ${s.lead}`),
    '',
    '## Матеріали',
    '',
    ...posts.slice(0, 20).map((p) => `- [${p.title}](${SITE}/blog/${p.slug})`),
    '',
    '## Компанія',
    '',
    `- [Про компанію](${SITE}/about)`,
    `- [Офіційні дистрибʼютори](${SITE}/distributors)`,
    `- [Контакти](${SITE}/contacts): ${contacts.phones[0]?.value}, ${contacts.email}`,
    `- Адреса: ${legalEntity.postalAddress}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
