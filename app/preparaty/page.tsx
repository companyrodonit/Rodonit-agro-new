import type { Metadata } from 'next';
import { catalogCategories, catalogProducts } from '@/lib/catalog';
import { contacts } from '@/lib/content';
import { ArrowRight, LeadForm, Phone, Reveal, ScrollToTop, SiteHeader } from '../interactive';
import { SiteFooter } from '../site-footer';
import { BlogHero } from '../blog/blog-ui';
import { Catalog } from './catalog';

const SITE = 'https://rodonit-redesign.vercel.app';

export const metadata: Metadata = {
  title: 'Препарати | Родоніт Агро',
  description:
    'Каталог препаратів Родоніт Агро: стимулятори росту, мікродобрива, фунгіциди та прилипачі. Фільтр за категорією і культурою.',
  // canonical на чистий /preparaty: фільтр живе в ?cat= і ?culture=, і всі
  // 90+ комбінацій не мають потрапляти в індекс окремими сторінками.
  alternates: { canonical: '/preparaty' },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; culture?: string }>;
}) {
  const { cat, culture } = await searchParams;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Препарати Родоніт Агро',
    numberOfItems: catalogProducts.length,
    itemListElement: catalogProducts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${SITE}/preparaty/${p.slug}`,
    })),
  };

  return (
    <div className="page-frame">
      <SiteHeader />
      <ScrollToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <BlogHero
        breadcrumbs={[{ label: 'Головна', href: '/' }, { label: 'Препарати' }]}
        eyebrow="Портфель"
        title="Шість препаратів для "
        accent="вашого поля"
        description="Оберіть категорію або культуру — покажемо препарати, у регламенти яких вона входить."
      />

      <section className="bg-[var(--color-bg)]">
        <div className="container-page py-16">
          <Catalog initialCategory={cat ?? ''} initialCulture={culture ?? ''} />
        </div>
      </section>

      {/* Категорії текстом — щоб зрізи каталогу були в HTML і без JS:
          фільтр клієнтський, а ці посилання бачить і бот, і людина без скриптів. */}
      <section className="rounded-[32px] bg-[var(--color-surface)]">
        <div className="container-page py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 [&>*]:min-w-0">
            <Reveal>
              <div>
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Не знаєте, що обрати?</p>
                <h2 className="text-h3 mt-3 max-w-[460px]">Підберемо схему під вашу культуру</h2>
                <p className="mt-6 max-w-[520px] text-[17px] leading-[1.7] text-[rgba(14,15,12,0.7)]">
                  Залиште номер — консультант підкаже норму, фазу внесення й сумісність препаратів
                  у вашій системі захисту.
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                  {catalogCategories.map((c) => (
                    <a
                      key={c.slug}
                      href={`/preparaty?cat=${c.slug}`}
                      className="group flex items-center gap-2 rounded-full bg-[var(--color-bg)] px-5 py-2.5 text-[15px] transition-colors hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)]"
                    >
                      {c.name}
                      <span className="rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-[12px] font-[700] text-[rgba(14,15,12,0.5)] transition-colors group-hover:bg-[var(--color-accent)] group-hover:text-[var(--color-text)]">
                        {c.count}
                      </span>
                    </a>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  {contacts.phones.slice(0, 2).map((p) => (
                    <a
                      key={p.value}
                      href={p.href}
                      className="flex items-center gap-3 text-[17px] font-[500] text-[var(--color-dark)] hover:text-[color:#03594C]"
                    >
                      <Phone size={16} /> {p.value}
                      <span className="text-[13px] font-[400] text-[rgba(14,15,12,0.45)]">
                        — {p.label}
                      </span>
                    </a>
                  ))}
                </div>

                <a
                  href="/distributors"
                  className="link-arrow mt-8 flex w-fit items-center gap-2 text-[15px] font-[700] text-[var(--color-dark)]"
                >
                  Де купити — офіційні дистрибʼютори <ArrowRight size={14} />
                </a>
              </div>
            </Reveal>
            <Reveal delay={2}>
              <LeadForm />
            </Reveal>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
