import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogCategories, postsByCategory } from '@/lib/posts';
import { ScrollToTop, SiteHeader } from '../../../interactive';
import { SiteFooter } from '../../../site-footer';
import { BlogHero, EmptyState, PostGrid } from '../../blog-ui';

const SITE = 'https://rodonit-redesign.vercel.app';

const getCategory = (slug: string) => blogCategories.find((c) => c.slug === slug);

export function generateStaticParams() {
  return blogCategories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return {};
  return {
    title: `${cat.name} | Блог Родоніт Агро`,
    description: cat.description,
    alternates: { canonical: `/blog/category/${cat.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();

  const items = postsByCategory(cat.slug);

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
