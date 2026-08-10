/**
 * Канонічна адреса сайту — єдине джерело правди.
 *
 * Раніше рядок 'https://rodonit-redesign.vercel.app' був продубльований у 14 файлах
 * (canonical, OG, sitemap, robots, RSS). Після переїзду на клієнтський Vercel це означало,
 * що сайт віддає пошуковику canonical на ЧУЖИЙ домен — Google схлопує сторінки на нього
 * і бойовий домен просто не індексується. Тому адреса рахується один раз і з оточення.
 *
 * Пріоритет:
 *  1. NEXT_PUBLIC_SITE_URL — виставляємо вручну, коли підключимо бойовий домен;
 *  2. VERCEL_PROJECT_PRODUCTION_URL — стабільний прод-URL проєкту на Vercel
 *     (саме production, а не VERCEL_URL, який унікальний для кожного деплою
 *     і перетворив би canonical на сміття);
 *  3. локальний dev.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return `https://${vercelProduction.replace(/\/+$/, '')}`;

  return 'http://localhost:4002';
}

export const SITE = resolveSiteUrl();
