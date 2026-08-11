import type { Metadata } from 'next';
import { rateCoverage } from '@/lib/cultures';
import { getCulturePages } from '@/lib/cms';
import { ArrowRight, LeadForm, Reveal, ScrollToTop } from '../interactive';
import { SiteHeader } from '../site-header';
import { SiteFooter } from '../site-footer';
import { BlogHero } from '../blog/blog-ui';

import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Препарати за культурами — норми застосування | Родоніт',
  description:
    'Препарати Родоніт Агро за 22 культурами: зернові, кукурудза, ріпак, соняшник, соя, овочеві, ягідні та плодові. Норми витрати й фази внесення на кожній сторінці.',
  alternates: { canonical: '/kultury' },
};

export const revalidate = 300;

export default async function Page() {
  const culturePages = await getCulturePages();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Культури',
    url: `${SITE}/kultury`,
    isPartOf: { '@type': 'WebSite', name: 'Родоніт Агро', url: SITE },
  };

  return (
    <div className="page-frame">
      <SiteHeader />
      <ScrollToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <BlogHero
        breadcrumbs={[{ label: 'Головна', href: '/' }, { label: 'Культури' }]}
        eyebrow="Культури"
        title="Оберіть свою "
        accent="культуру"
        description="Під кожну культуру — препарати портфеля з нормами застосування, типові задачі в полі та матеріали."
      />

      <section className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {culturePages.map((c, i) => {
              const { total, withRate } = rateCoverage(c);
              return (
                <Reveal key={c.slug} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                  <a
                    href={`/kultury/${c.slug}`}
                    data-testid={`culture-card-${c.slug}`}
                    className="card-hover flex h-full flex-col rounded-[24px] bg-[var(--color-surface)] p-7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        {/* Ілюстрація вже має власний темний фон бренду, тож
                            коло не фарбуємо — просто обрізаємо по радіусу. */}
                        <img
                          src={`/cultures/${c.slug}.png`}
                          alt=""
                          loading="lazy"
                          className="h-14 w-14 shrink-0 rounded-full object-cover"
                        />
                        <h2 className="text-[21px] font-[500] leading-[1.25] text-[var(--color-dark)]">
                          {c.name}
                        </h2>
                      </div>
                      <span className="shrink-0 rounded-full bg-[var(--color-bg)] px-3 py-1 text-[12px] font-[700] text-[rgba(14,15,12,0.5)]">
                        {total}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-[15px] leading-[1.6] text-[rgba(14,15,12,0.6)]">
                      {c.intro}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-6">
                      {/* Чесний бейдж покриття: видно і нам, і замовнику,
                          де ще бракує регламентів. */}
                      <span className="text-[12px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.4)]">
                        {withRate === total ? 'Норми прописані' : `Норм: ${withRate} із ${total}`}
                      </span>
                      <span className="link-arrow flex items-center gap-2 text-[13px] font-[700] text-[var(--color-dark)]">
                        Детальніше <ArrowRight size={14} />
                      </span>
                    </div>
                  </a>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* id="cta" — тут стоїть LeadForm, тож кнопка «Консультація» з хедера
          й футера скролить сюди, а не веде на /contacts (див. CtaLink). */}
      <section id="cta" className="rounded-[32px] bg-[var(--color-surface)]">
        <div className="container-page py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20 [&>*]:min-w-0">
            <Reveal>
              <div>
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Не знайшли свою культуру?</p>
                <h2 className="text-h3 mt-3 max-w-[460px]">Підберемо схему під ваше поле</h2>
                <p className="mt-6 max-w-[520px] text-[17px] leading-[1.7] text-[rgba(14,15,12,0.7)]">
                  Регламенти прописані під основні культури українського виробництва. Якщо вашої
                  немає у списку — зателефонуйте, консультант підкаже, що з портфеля підійде.
                </p>
                <a
                  href="/preparaty"
                  className="link-arrow mt-8 flex w-fit items-center gap-2 text-[15px] font-[700] text-[var(--color-dark)]"
                >
                  Каталог препаратів <ArrowRight size={14} />
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
