import type { Metadata } from 'next';
import { ArrowRight, Phone, ScrollToTop } from './interactive';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';
import { getContacts } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Сторінку не знайдено | Родоніт Агро',
  // Сторінка помилки не має потрапляти в індекс: інакше в пошуку зʼявляються
  // «привиди» неіснуючих URL із нашим титулом.
  robots: { index: false, follow: true },
};

/* Куди вести з глухого кута. Не «на головну і все» — людина сюди потрапляє
   зі старого посилання чи закладки, тож даємо чотири реальні входи. */
const exits = [
  { href: '/preparaty', title: 'Каталог препаратів', text: 'Шість продуктів із фільтром за категорією і культурою.' },
  { href: '/kultury', title: 'Культури', text: 'Двадцять дві культури з нормами застосування.' },
  { href: '/blog', title: 'Новини та статті', text: 'Агрономія по суті: мідь, кальцій, бор у полі.' },
  { href: '/distributors', title: 'Де купити', text: 'Офіційні дистрибʼютори по регіонах і напрямках.' },
];

export default async function NotFound() {
  const contacts = await getContacts();
  const mainPhone = contacts.phones[0];
  return (
    <div className="page-frame">
      <SiteHeader />
      <ScrollToTop />

      <section className="gradient-dark on-dark rounded-b-[32px] pt-[104px]">
        <div className="container-page pb-20 pt-8">
          <p className="eyebrow text-[var(--color-accent)]">Помилка 404</p>
          <h1 className="text-h2 mt-4 max-w-[820px] !text-[var(--color-bg)]">
            Такої сторінки <em className="accent-word">немає</em>
          </h1>
          <p className="mt-6 max-w-[560px] text-[17px] leading-[1.6] text-[rgba(255,255,255,0.7)]">
            Можливо, посилання застаріло або в адресі є помилка. Ось куди можна перейти.
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <div className="grid gap-6 sm:grid-cols-2">
            {exits.map((e) => (
              <a
                key={e.href}
                href={e.href}
                className="card-hover flex h-full flex-col rounded-[24px] bg-[var(--color-surface)] p-8"
              >
                <h2 className="text-[21px] font-[500] text-[var(--color-dark)]">{e.title}</h2>
                <p className="mt-3 text-[15px] leading-[1.6] text-[rgba(14,15,12,0.6)]">{e.text}</p>
                <span className="link-arrow mt-auto flex items-center gap-2 pt-6 text-[13px] font-[700] text-[var(--color-dark)]">
                  Перейти <ArrowRight size={14} />
                </span>
              </a>
            ))}
          </div>

          <div className="mt-14 rounded-[24px] bg-[var(--color-surface)] p-8 sm:p-10">
            <p className="eyebrow text-[rgba(14,15,12,0.4)]">Не знайшли потрібне?</p>
            <h2 className="text-h4 mt-3 max-w-[520px]">Зателефонуйте — підкажемо</h2>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href={mainPhone?.href ?? 'tel:+380444995049'}
                className="flex items-center gap-3 text-[18px] font-[500] text-[var(--color-dark)] hover:text-[color:#03594C]"
              >
                <Phone size={16} /> {mainPhone?.value ?? '+38 (044) 499-50-49'}
              </a>
              <a href="/contacts" className="btn btn-primary">
                Усі контакти <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
