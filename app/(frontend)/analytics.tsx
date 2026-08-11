import Script from 'next/script';

/**
 * GA4. Вмикається наявністю NEXT_PUBLIC_GA_ID у середовищі — без змінної
 * не рендериться взагалі, тож локальна розробка і прев'ю не засмічують дані.
 *
 * Стара UA-115161662-1 зі старого сайту НЕ підходить: Universal Analytics
 * вимкнена 01.07.2023, властивості видалені. Потрібен новий ID виду G-XXXXXXXXXX.
 * Ставити тільки у (frontend) — адмінці Payload аналітика ні до чого.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
