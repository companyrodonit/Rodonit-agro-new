import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogCategories, getPostsByCategory } from '@/lib/cms';
import { ScrollToTop } from '../../../interactive';
import { SiteHeader } from '../../../site-header';
import { SiteFooter } from '../../../site-footer';
import { BlogHero, EmptyState, PostGrid } from '../../blog-ui';

import { SITE } from '@/lib/site';

const getCategory = async (slug: string) => (await getBlogCategories()).find((c) => c.slug === slug);

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getBlogCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) return {};
  return {
    title: `${cat.name} | Блог Родоніт Агро`,
    description: cat.description,
    alternates: { canonical: `/blog/category/${cat.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) notFound();

  const items = await getPostsByCategory(cat.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cat.name,
    description: cat.description,
    url: `${SITE}/blog/category/${cat.slug}`,
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
          { label: cat.name },
        ]}
        eyebrow="Категорія"
        title={cat.name}
        description={cat.description}
      />

      <section className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          {items.length ? (
            <PostGrid items={items} />
          ) : (
            <EmptyState text={`У категорії «${cat.name}» поки немає матеріалів.`} />
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
