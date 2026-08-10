import { getPosts } from '@/lib/cms';

import { SITE } from '@/lib/site';

/** Мінімальне екранування для XML — інакше «&» у заголовку ламає фід. */
const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const dynamic = 'force-static';

export const revalidate = 300;

export async function GET() {
  const posts = await getPosts();
  const items = posts
    .slice(0, 30)
    .map((p) => {
      const url = `${SITE}/blog/${p.slug}`;
      // pubDate свідомо немає: реальних дат публікації не існує ні в краулі,
      // ні в старій БД, а вигадана дата в RSS зіпсує порядок у читалках.
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.excerpt)}</description>
      <category>${esc(p.category)}</category>${
        // Обкладинка з CMS може бути вже абсолютним URL (Vercel Blob).
        p.cover
          ? `\n      <enclosure url="${p.cover.startsWith('http') ? p.cover : SITE + p.cover}" type="image/jpeg" />`
          : ''
      }
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Новини та статті — Родоніт Агро</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>Агрономія по суті: захист, живлення та події Родоніт Агро.</description>
    <language>uk</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
