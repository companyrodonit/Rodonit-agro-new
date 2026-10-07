import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';
import { legacyRedirects } from './lib/redirects';

// Заголовки безпеки (скіл web-security, 07.10.2026). До цього прод мав оцінку F:
// не було CSP, nosniff, захисту від вбудовування, а X-Powered-By видавав стек.
// Зовнішні джерела сайту — лише GA4 (gtag); соцмережі тільки посиланнями.
// Картинки з CMS браузер бере з нашого ж /api/media/file/ (Payload сам тягне їх
// із Vercel Blob на сервері), тож домен Blob тут не потрібен — перевірено 07.10:
// усі 47 записів media на проді мають url /api/media/file/…
// Додається новий сервіс (віджет, карта, піксель) — його домен треба дописати
// сюди, інакше браузер його заблокує.
const isDev = process.env.NODE_ENV === 'development';
const GA = ['https://www.googletagmanager.com'];
const GA_CONNECT = ['https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://www.googletagmanager.com'];

// Сайт: статичний CSP без nonce, щоб не втратити ISR/кеш сторінок.
// 'unsafe-inline' у script-src — через inline-ініціалізацію gtag (analytics.tsx).
const siteCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} ${GA.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${GA_CONNECT.join(' ')}`,
  "font-src 'self'",
  `connect-src 'self' ${GA_CONNECT.join(' ')}`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

// Адмінка Payload (за логіном): лише обмеження, що не можуть зламати редактор
// Lexical і аплоади, — заборона вбудовування, плагінів і підміни <base>.
// Обмежень на скрипти/стилі/з'єднання тут свідомо немає: редактор зсередини
// не перевірено, а зламана адмінка = Олег не може публікувати (рішення Бро 07.10).
const adminCsp = ["object-src 'none'", "base-uri 'self'", "frame-ancestors 'self'"].join('; ');

const commonHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: commonHeaders },
      {
        source: '/((?!admin|api).*)',
        headers: [
          { key: 'Content-Security-Policy', value: siteCsp },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: adminCsp },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
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
    // remotePatterns свідомо порожній: картинки з CMS ідуть через локальний
    // /api/media/file/…, а дозвіл на *.public.blob.vercel-storage.com робив
    // наш оптимізатор зображень проксі для БУДЬ-ЯКОГО чужого Blob-сховища.
    // Якщо колись увімкнуть disablePayloadAccessControl (прямі URL Blob) —
    // дописати сюди ТОЧНИЙ hostname сховища клієнта, не маску.
    // next/image за замовчуванням тисне до q=75. Для фотографій, які вже
    // пройшли стиснення (обкладинки статей від замовника — часто з месенджера),
    // це друге стиснення поверх першого, і на великому кадрі видно артефакти.
    // Дозволяємо 90 і ставимо його точково там, де кадр показується великим.
    // Next 16 вимагає перелічити дозволені значення явно.
    qualities: [75, 90],
  },
};

export default withPayload(nextConfig);
