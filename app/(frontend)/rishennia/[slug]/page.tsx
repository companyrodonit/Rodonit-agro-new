import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContacts, getProducts, getSolutionBySlug, getSolutions } from '@/lib/cms';
import { ArrowRight, LeadForm, Phone, Reveal, ScrollToTop } from '../../interactive';
import { SiteHeader } from '../../site-header';
import { SiteFooter } from '../../site-footer';
import { BlogHero } from '../../blog/blog-ui';

import { SITE } from '@/lib/site';

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getSolutions()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSolutionBySlug(slug);
  if (!s) return {};
  const products = await getProducts();
  const named = s.productSlugs
    .map((ps) => products.find((p) => p.slug === ps)?.name)
    .filter((n): n is string => Boolean(n));
  return {
    title: `${s.title} | Родоніт Агро`,
    // lead — заголовковий підзаголовок на 90-108 символів. Для видачі
    // додаємо, чим саме задача закривається: назви препаратів тягнуть
    // брендові запити, а користувач одразу бачить відповідь, а не анонс.
    description: named.length ? `${s.lead} Рішення: ${named.join(', ')}.` : s.lead,
    alternates: { canonical: `/rishennia/${s.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const contacts = await getContacts();
  const mainPhone = contacts.phones[0];
  const { slug } = await params;
  const solution = await getSolutionBySlug(slug);
  const [products, solutions] = await Promise.all([getProducts(), getSolutions()]);
  if (!solution) notFound();

  const recommended = solution.productSlugs
    .map((ps) => products.find((p) => p.slug === ps))
    .filter((p): p is (typeof products)[number] => Boolean(p));

  const others = solutions.filter((s) => s.slug !== solution.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: solution.title,
    description: solution.lead,
    url: `${SITE}/rishennia/${solution.slug}`,
    inLanguage: 'uk-UA',
    publisher: { '@type': 'Organization', name: 'Родоніт Агро', url: SITE },
  };

  return (
    <div className="page-frame">
      <SiteHeader />
      <ScrollToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <BlogHero
        breadcrumbs={[
          { label: 'Головна', href: '/' },
          { label: 'Вирішення проблем', href: '/rishennia' },
          { label: solution.title },
        ]}
        eyebrow="Задача в полі"
        title={solution.title}
        description={solution.lead}
      />

      <section className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
            <div className="min-w-0 max-w-[720px]">
              {solution.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="mt-5 text-[17px] leading-[1.75] text-[rgba(14,15,12,0.75)] first:mt-0"
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Рекомендація — липким блоком: це відповідь на питання,
                заради якого сторінку й відкрили. */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[24px] bg-[var(--color-surface)] p-7">
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Чим закривати</p>
                <div className="mt-6 space-y-5">
                  {recommended.map((p) => (
                    <a
                      key={p.slug}
                      href={`/preparaty/${p.slug}`}
                      className="flex items-center gap-4 rounded-[18px] bg-[var(--color-bg)] p-4 transition-colors hover:bg-[rgba(0,0,0,0.04)]"
                    >
                      <img
                        src={`/products/${p.slug}.png`}
                        alt={p.name}
                        loading="lazy"
                        className="h-[52px] w-auto max-w-[52px] object-contain"
                      />
                      <span className="min-w-0">
                        <span className="block text-[11px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.4)]">
                          {p.category}
                        </span>
                        <span className="mt-1 block text-[16px] font-[500] leading-[1.25] text-[var(--color-dark)]">
                          {p.name}
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
                <a href="#cta" className="btn btn-primary mt-6 w-full">
                  Запитати схему <ArrowRight size={14} />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="rounded-[32px] bg-[var(--color-surface)]">
          <div className="container-page py-24">
            <Reveal>
              <p className="eyebrow text-[rgba(14,15,12,0.4)]">Інші задачі</p>
              <h2 className="text-h3 mt-3">З чим іще приходять</h2>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {others.map((s, i) => (
                <Reveal key={s.slug} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                  <a
                    href={`/rishennia/${s.slug}`}
                    className="card-hover flex h-full flex-col rounded-[24px] bg-[var(--color-bg)] p-8"
                  >
                    <h3 className="text-[21px] font-[500] leading-[1.25] text-[var(--color-dark)]">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-[1.6] text-[rgba(14,15,12,0.6)]">{s.lead}</p>
                    <span className="link-arrow mt-auto flex items-center gap-2 pt-6 text-[13px] font-[700] text-[var(--color-dark)]">
                      Читати <ArrowRight size={14} />
                    </span>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="cta" className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20 [&>*]:min-w-0">
            <Reveal>
              <div>
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Консультація</p>
                <h2 className="text-h3 mt-3 max-w-[460px]">Підберемо схему під ваше поле</h2>
                <p className="mt-4 max-w-[520px] text-[17px] leading-[1.6] text-[rgba(14,15,12,0.6)]">
                  Залиште номер — консультант підкаже норму, фазу внесення й сумісність препаратів.
                </p>
                <a
                  href={mainPhone?.href ?? 'tel:+380444995049'}
                  className="mt-8 flex w-fit items-center gap-3 text-[18px] font-[500] text-[var(--color-dark)] hover:text-[color:#03594C]"
                >
                  <Phone size={16} className="shrink-0" /> <span className="whitespace-nowrap">{mainPhone?.value ?? '+38 (044) 499-50-49'}</span>
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
