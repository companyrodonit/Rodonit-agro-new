import type { Metadata } from 'next';
import { solutions } from '@/lib/solutions';
import { problems, products } from '@/lib/content';
import { ArrowRight, LeadForm, Reveal, ScrollToTop, SiteHeader } from '../interactive';
import { SiteFooter } from '../site-footer';
import { BlogHero } from '../blog/blog-ui';

import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Вирішення проблем | Родоніт Агро',
  description:
    'Типові задачі в полі та препарати, які їх закривають: змив робочого розчину, бактеріальний опік, розтріскування стручків.',
  alternates: { canonical: '/rishennia' },
};

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Вирішення проблем',
    url: `${SITE}/rishennia`,
    isPartOf: { '@type': 'WebSite', name: 'Родоніт Агро', url: SITE },
  };

  return (
    <div className="page-frame">
      <SiteHeader />
      <ScrollToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <BlogHero
        breadcrumbs={[{ label: 'Головна', href: '/' }, { label: 'Вирішення проблем' }]}
        eyebrow="Задачі в полі"
        title="Знайдіть свою "
        accent="проблему"
        description="Аграрій шукає не «фунгіцид», а відповідь на те, що зараз коїться в полі. Тут задачі описані так, як вони виглядають на практиці."
      />

      {/* Розгорнуті матеріали — ті, під які є повний текст */}
      <section className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <Reveal>
            <p className="eyebrow text-[rgba(14,15,12,0.4)]">Розбори</p>
            <h2 className="text-h3 mt-3 max-w-[620px]">Задачі з детальним розбором</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {solutions.map((s, i) => (
              <Reveal key={s.slug} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <a
                  href={`/rishennia/${s.slug}`}
                  data-testid={`solution-card-${s.slug}`}
                  className="card-hover flex h-full flex-col rounded-[24px] bg-[var(--color-surface)] p-8"
                >
                  <h3 className="text-[21px] font-[500] leading-[1.25] text-[var(--color-dark)]">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.6] text-[rgba(14,15,12,0.6)]">{s.lead}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {s.productSlugs.map((ps) => {
                      const p = products.find((x) => x.slug === ps);
                      return p ? (
                        <span
                          key={ps}
                          className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-[12px] font-[700] text-[rgba(14,15,12,0.55)]"
                        >
                          {p.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <span className="link-arrow mt-auto flex items-center gap-2 pt-6 text-[13px] font-[700] text-[var(--color-dark)]">
                    Читати розбір <ArrowRight size={14} />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Короткі задачі — ті самі шість, що на головній. Ведуть одразу до
          препарату: розгорнутого тексту під них немає, і вигадувати його
          ми не будемо. */}
      <section className="rounded-[32px] bg-[var(--color-surface)]">
        <div className="container-page py-24">
          <Reveal>
            <p className="eyebrow text-[rgba(14,15,12,0.4)]">Коротко</p>
            <h2 className="text-h3 mt-3 max-w-[620px]">Що ще закриває портфель</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {problems.map((p, i) => (
              <Reveal key={p.problem} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <a
                  href={`/preparaty/${p.slug}`}
                  className="card-hover flex h-full flex-col rounded-[24px] bg-[var(--color-bg)] p-7"
                >
                  <h3 className="text-[19px] font-[500] leading-[1.3] text-[var(--color-dark)]">
                    {p.problem}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[15px] leading-[1.6] text-[rgba(14,15,12,0.6)]">
                    {p.answer}
                  </p>
                  <span className="link-arrow mt-auto flex items-center gap-2 pt-6 text-[13px] font-[700] text-[var(--color-dark)]">
                    {p.product} <ArrowRight size={14} />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* id="cta" — тут стоїть LeadForm, тож кнопка «Консультація» з хедера
          й футера скролить сюди, а не веде на /contacts (див. CtaLink). */}
      <section id="cta" className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20 [&>*]:min-w-0">
            <Reveal>
              <div>
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Не знайшли свою задачу?</p>
                <h2 className="text-h3 mt-3 max-w-[460px]">Опишіть, що в полі — підберемо схему</h2>
                <a
                  href="/kultury"
                  className="link-arrow mt-8 flex w-fit items-center gap-2 text-[15px] font-[700] text-[var(--color-dark)]"
                >
                  Або оберіть за культурою <ArrowRight size={14} />
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
