import type { Metadata } from 'next';
import { Onest } from 'next/font/google';
import { SITE } from '@/lib/site';
import { SiteSchema } from './site-schema';
import { Analytics } from './analytics';
import './globals.css';

// Figtree/Switzer зі стайлгайду — латиниця-онлі. Для українського контенту
// потрібен гротеск із кирилицею: Onest тримає ту саму нейтральну основу.
const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-figtree',
  display: 'swap',
});

const title = 'Родоніт Агро — препарати для захисту та стимуляції рослин';
const description =
  'Препарати для агробізнесу України: стимулятори росту, мікродобрива, фунгіциди, прилипачі. Сільвер Мікс, Міра РК, Верно, Гідролип, Нордокс 75 WG.';

export const metadata: Metadata = {
  // metadataBase обов'язковий: без нього Next віддає відносний /og.jpg, а
  // Facebook, LinkedIn і Telegram відносних шляхів не розуміють і показують
  // посилання взагалі без картинки.
  metadataBase: new URL(SITE),
  title,
  description,
  // ⚠️ canonical тут НЕ ставити. alternates із root layout успадковується
  // кожною сторінкою, яка його не перевизначає, — і всі такі сторінки почали б
  // віддавати canonical на головну. Canonical живе в metadata самої сторінки,
  // головна — в app/(frontend)/page.tsx.
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    siteName: 'Родоніт Агро',
    url: '/',
    title,
    description,
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Родоніт Агро — технології підвищення врожайності',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={onest.variable}>
      <body>
        <SiteSchema />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
