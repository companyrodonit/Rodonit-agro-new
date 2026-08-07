import type { MetadataRoute } from 'next';

const SITE = 'https://rodonit-redesign.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
