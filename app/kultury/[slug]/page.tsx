import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { culturePages, getCulture, rateCoverage } from '@/lib/cultures';
import { problems } from '@/lib/content';
import { postsByTag } from '@/lib/posts';
import { ArrowRight, LeadForm, Phone, Reveal, ScrollToTop, SiteHeader } from '../../interactive';
import { SiteFooter } from '../../site-footer';
import { BlogHero, PostCard } from '../../blog/blog-ui';

const SITE = 'https://rodonit-redesign.vercel.app';

export function generateStaticParams() {
  return culturePages.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCulture(slug);
  if (!c) return {};
  return {
    title: `${c.name} — препарати та норми | Родоніт Агро`,
    description: `${c.name}: ${c.products.length} препаратів Родоніт Агро з нормами застосування — захист, живлення та утримання розчину.`,
    alternates: { canonical: `/kultury/${c.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const culture = getCulture(slug);
  if (!culture) notFound();

  const { total, withRate } = rateCoverage(culture);

  // Задача і препарат — одна думка, тому зшиваємо їх в один запис, а не
  // показуємо двома блоками: «ось проблема → ось чим і в якій нормі».
  // У портфелі кожен препарат закриває рівно одну задачу з problems[],
  // тож мапа 1:1 і жоден препарат не випадає.
  const solutions = culture.products.map((p) => ({
    ...p,
    problem: problems.find((pr) => pr.slug === p.slug),
  }));

  const relatedPosts = postsByTag(culture.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Препарати для культури «${culture.name}»`,
    numberOfItems: culture.products.length,
    itemListElement: culture.products.map((p, i) => ({
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
        breadcrumbs={[
          { label: 'Головна', href: '/' },
          { label: 'Культури', href: '/kultury' },
          { label: culture.name },
        ]}
        eyebrow="Культура"
        title={culture.name}
        description={culture.intro}
      />

      {/* ═══════════════════════ ЗАДАЧА → ПРЕПАРАТ → НОРМА (один блок) */}
      <section className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Що застосовувати</p>
                <h2 className="text-h3 mt-3 max-w-[620px]">З чим приходять на цій культурі</h2>
              </div>
              <a
                href={`/preparaty?culture=${culture.slug}`}
                className="link-arrow flex items-center gap-2 text-[13px] font-[800] uppercase tracking-[0.04em] text-[var(--color-dark)]"
              >
                Відкрити в каталозі <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>

          <div className="mt-12 space-y-6">
            {solutions.map((s, i) => (
              <Reveal key={s.slug} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <div
                  data-testid={`culture-product-${s.slug}`}
                  className="grid gap-8 rounded-[24px] bg-[var(--color-surface)] p-6 sm:p-8 lg:grid-cols-[1fr_360px] lg:gap-12"
                >
                  {/* Ліворуч — задача в полі, мовою аграрія */}
                  <div className="min-w-0">
                    <p className="text-[11px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.4)]">
                      Задача
                    </p>
                    <h3 className="mt-2 text-[22px] font-[500] leading-[1.3] text-[var(--color-dark)]">
                      {s.problem?.shortTitle ?? s.problem?.problem ?? s.name}
                    </h3>
                    {s.problem && (
                      <p className="mt-3 max-w-[560px] text-[16px] leading-[1.7] text-[rgba(14,15,12,0.65)]">
                        {s.problem.answer}
                      </p>
                    )}
                  </div>

                  {/* Праворуч — чим закривати і в якій нормі саме на цій культурі */}
                  <div className="rounded-[20px] bg-[var(--color-bg)] p-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={`/products/${s.slug}.png`}
                        alt={s.name}
                        loading="lazy"
                        className="h-[56px] w-auto max-w-[56px] object-contain"
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.4)]">
                          {s.category}
                        </p>
                        <p className="mt-1 text-[17px] font-[500] leading-[1.25] text-[var(--color-dark)]">
                          {s.name}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-[rgba(0,0,0,0.08)] pt-4">
                      <p className="text-[11px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.4)]">
                        Норма на {culture.name.toLowerCase()}
                      </p>
                      {s.rate ? (
                        <p className="mt-1.5 text-[15px] leading-[1.6] text-[var(--color-text)]">{s.rate}</p>
                      ) : (
                        /* Порожній регламент показуємо як є. Підставити норму
                           «за аналогією» з іншої культури не можна: це вказівка
                           з обробки поля, а не текст. */
                        <p className="mt-1.5 text-[15px] leading-[1.6] text-[rgba(14,15,12,0.5)]">
                          Уточнюйте в консультанта.
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <a href={`/preparaty/${s.slug}`} className="btn btn-primary btn-sm whitespace-nowrap">
                        До препарату <ArrowRight size={14} />
                      </a>
                      {!s.rate && (
                        <a href="#cta" className="btn btn-outline btn-sm whitespace-nowrap">
                          Запитати норму
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {withRate < total && (
            <p className="mt-8 max-w-[720px] text-[14px] leading-[1.6] text-[rgba(14,15,12,0.5)]">
              Норми наведені з регламентів застосування виробника. Для{' '}
              {total - withRate} із {total} препаратів регламент саме під цю культуру ще уточнюється —
              зателефонуйте, і консультант підкаже норму й фазу внесення.
            </p>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ СТАТТІ */}
      {relatedPosts.length > 0 && (
        <section className="rounded-[32px] bg-[var(--color-surface)]">
          <div className="container-page py-24">
            <Reveal>
              <p className="eyebrow text-[rgba(14,15,12,0.4)]">Матеріали</p>
              <h2 className="text-h3 mt-3">Читати про цю культуру</h2>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((p, i) => (
                <Reveal key={p.slug} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                  <PostCard post={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════ CTA */}
      <section id="cta" className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20 [&>*]:min-w-0">
            <Reveal>
              <div>
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Консультація</p>
                <h2 className="text-h3 mt-3 max-w-[460px]">
                  Підберемо схему під {culture.name.toLowerCase()}
                </h2>
                <p className="mt-4 max-w-[520px] text-[17px] leading-[1.6] text-[rgba(14,15,12,0.6)]">
                  Залиште номер — консультант підкаже норму, фазу внесення й сумісність препаратів
                  у вашій системі захисту.
                </p>
                <a
                  href="tel:+380444995049"
                  className="mt-8 flex w-fit items-center gap-3 text-[18px] font-[500] text-[var(--color-dark)] hover:text-[color:#03594C]"
                >
                  <Phone size={16} /> +38 (044) 499-50-49
                </a>
                <a
                  href="/kultury"
                  className="link-arrow mt-8 flex w-fit items-center gap-2 text-[15px] font-[700] text-[var(--color-dark)]"
                >
                  Усі культури <ArrowRight size={14} />
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
