import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allTags, postsByTag } from '@/lib/posts';
import { ScrollToTop, SiteHeader } from '../../../interactive';
import { SiteFooter } from '../../../site-footer';
import { BlogHero, EmptyState, PostGrid } from '../../blog-ui';

import { SITE } from '@/lib/site';

const getTag = (slug: string) => allTags.find((t) => t.slug === slug);

export function generateStaticParams() {
  return allTags.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = getTag(slug);
  if (!tag) return {};
  const what = tag.kind === 'product' ? `препарат ${tag.label}` : `культуру «${tag.label}»`;
  return {
    title: `${tag.label} — матеріали | Родоніт Агро`,
    description: `Статті та новини Родоніт Агро, що згадують ${what}.`,
    alternates: { canonical: `/blog/tag/${tag.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = getTag(slug);
  if (!tag) notFound();

  const items = postsByTag(tag.slug);
  const isProduct = tag.kind === 'product';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tag.label} — матеріали`,
    url: `${SITE}/blog/tag/${tag.slug}`,
    isPartOf: { '@type': 'WebSite', name: 'Родоніт Агро', url: SITE },
  };

  return (
    <div className="page-frame">
      <SiteHeader />
      <ScrollToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <BlogHero
        breadcrumbs={[
          { label: 'Головна', href: '/' },
          { label: 'Блог', href: '/blog' },
          { label: tag.label },
        ]}
        eyebrow={isProduct ? 'Препарат' : 'Культура'}
        title={tag.label}
        description={
          isProduct
            ? `Матеріали, у яких розбираємо застосування препарату ${tag.label}.`
            : `Матеріали про захист і живлення культури «${tag.label}».`
        }
      />

      <section className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          {items.length ? (
            <PostGrid items={items} />
          ) : (
            <EmptyState text={`За тегом «${tag.label}» поки немає матеріалів.`} />
          )}

          {isProduct && (
            <div className="mt-14 rounded-[24px] bg-[var(--color-surface)] p-8 sm:p-10">
              <p className="eyebrow text-[rgba(14,15,12,0.4)]">Препарат</p>
              <h2 className="text-h4 mt-3">{tag.label}</h2>
              <a href={`/preparaty/${tag.slug}`} className="btn btn-primary mt-6">
                Перейти до препарату
              </a>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
