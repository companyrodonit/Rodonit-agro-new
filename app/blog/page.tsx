import type { Metadata } from 'next';
import { allTags, blogCategories, posts } from '@/lib/posts';
import { ArrowRight, LeadForm, Reveal, ScrollToTop, SiteHeader } from '../interactive';
import { SiteFooter } from '../site-footer';
import { BlogHero, EmptyState, PostGrid } from './blog-ui';

const PER_PAGE = 9;
const SITE = 'https://rodonit-redesign.vercel.app';

export const metadata: Metadata = {
  title: 'Новини та статті | Родоніт Агро',
  description:
    'Агрономія по суті: мідь у захисті зернових, кальцій і бор проти вершинної гнилі, події та конференції за участі Родоніт Агро.',
  alternates: { canonical: '/blog' },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const total = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  // Некоректний ?page схлопуємо до першої сторінки, а не в 404: посилання
  // з поламаним параметром має показувати блог, а не помилку.
  const current = Math.min(total, Math.max(1, Number(page) || 1));
  const shown = posts.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Новини та статті',
    url: `${SITE}/blog`,
    isPartOf: { '@type': 'WebSite', name: 'Родоніт Агро', url: SITE },
    hasPart: posts.map((p) => ({
      '@type': 'Article',
      headline: p.title,
      url: `${SITE}/blog/${p.slug}`,
    })),
  };

  return (
    <div className="page-frame">
      <SiteHeader />
      <ScrollToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <BlogHero
        breadcrumbs={[{ label: 'Головна', href: '/' }, { label: 'Блог' }]}
        eyebrow="Новини та статті"
        title="Події компанії та корисне про "
        accent="агрономію"
        description="Як працює мідь, кальцій і бор у полі, коли вносити й що це дає врожаю — без води й обіцянок."
      />

      {/* Категорії та теги — окремими маршрутами, а не query-фільтром:
          так кожен зріз має власний URL, canonical і потрапляє в sitemap. */}
      <section className="bg-[var(--color-bg)]">
        <div className="container-page py-16">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--color-dark)] px-5 py-2.5 text-[14px] font-[700] text-[var(--color-bg)]">
                Усі матеріали
              </span>
              {blogCategories.map((c) => (
                <a
                  key={c.slug}
                  href={`/blog/category/${c.slug}`}
                  className="rounded-full bg-[var(--color-surface)] px-5 py-2.5 text-[14px] text-[var(--color-text)] transition-colors hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)]"
                >
                  {c.name}
                </a>
              ))}
            </div>
          </Reveal>

          <div className="mt-12">
            {shown.length ? <PostGrid items={shown} /> : <EmptyState text="Матеріалів поки немає." />}
          </div>

          {total > 1 && (
            <nav aria-label="Сторінки" className="mt-14 flex items-center justify-center gap-2">
              {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
                <a
                  key={n}
                  href={n === 1 ? '/blog' : `/blog?page=${n}`}
                  aria-current={n === current ? 'page' : undefined}
                  className={`grid h-11 min-w-11 place-items-center rounded-full px-4 text-[15px] font-[700] transition-colors ${
                    n === current
                      ? 'bg-[var(--color-dark)] text-[var(--color-bg)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[rgba(0,0,0,0.08)]'
                  }`}
                >
                  {n}
                </a>
              ))}
            </nav>
          )}
        </div>
      </section>

      <section className="rounded-[32px] bg-[var(--color-surface)]">
        <div className="container-page py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 [&>*]:min-w-0">
            <Reveal>
              <div>
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Теми</p>
                <h2 className="text-h3 mt-3 max-w-[460px]">Шукаєте щось конкретне?</h2>
                <p className="mt-6 max-w-[520px] text-[17px] leading-[1.7] text-[rgba(14,15,12,0.7)]">
                  Матеріали розмічені за препаратами й культурами — оберіть тег і побачите все,
                  що стосується вашого поля.
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {allTags.map((t) => (
                    <a
                      key={t.slug}
                      href={`/blog/tag/${t.slug}`}
                      className="group flex items-center gap-2 rounded-full bg-[var(--color-bg)] px-5 py-2.5 text-[15px] transition-colors hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)]"
                    >
                      {t.label}
                      <span className="rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-[12px] font-[700] text-[rgba(14,15,12,0.5)] transition-colors group-hover:bg-[var(--color-accent)] group-hover:text-[var(--color-text)]">
                        {t.count}
                      </span>
                    </a>
                  ))}
                </div>
                <a
                  href="/preparaty"
                  className="link-arrow mt-10 flex w-fit items-center gap-2 text-[15px] font-[700] text-[var(--color-dark)]"
                >
                  Подивитись портфель препаратів <ArrowRight size={14} />
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
