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
    // next/image за замовчуванням тисне до q=75. Для фотографій, які вже
    // пройшли стиснення (обкладинки статей від замовника — часто з месенджера),
    // це друге стиснення поверх першого, і на великому кадрі видно артефакти.
    // Дозволяємо 90 і ставимо його точково там, де кадр показується великим.
    // Next 16 вимагає перелічити дозволені значення явно.
    qualities: [75, 90],
  },
};

export default withPayload(nextConfig);
