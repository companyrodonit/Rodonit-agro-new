import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';
import { legacyRedirects } from './lib/redirects';

const nextConfig: NextConfig = {
  // Карта 301 зі старого OpenCart. Генерується з tools/redirects-draft.csv,
  // працює лише після перемикання домену — на vercel.app цих адрес ніхто
  // не питає. 102 інфосторінки поки без призначення: чекають рішення Олега.
  redirects: async () => legacyRedirects,
  // drizzle-kit лишається зовнішнім пакетом: інакше Turbopack намагається
  // трансформувати require('drizzle-kit/api') всередині Payload і збірка падає.
  serverExternalPackages: ['drizzle-kit'],
  // На Desktop лежить сторонній package-lock.json — без явного root
  // Turbopack приймає його за корінь воркспейсу.
  turbopack: { root: import.meta.dirname },
  images: {
    // Картинки, залиті через адмінку, на проді лежать у Vercel Blob. Без
    // цього дозволу next/image на них падає з «hostname is not configured»,
    // і фон героя, замінений Олегом у CMS, просто не відрендериться.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
};

export default withPayload(nextConfig);
