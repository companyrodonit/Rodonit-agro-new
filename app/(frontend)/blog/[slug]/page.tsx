import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPost, postHeadings, posts, relatedPosts } from '@/lib/posts';
import { ArrowRight, LeadForm, Phone, Reveal, ScrollToTop, SiteHeader } from '../../interactive';
import { SiteFooter } from '../../site-footer';
import { BlogHero, PostBody, PostCard, TagList } from '../blog-ui';
import { ReadProgressBar, ShareButtons, TableOfContents } from '../blog-client';

import { SITE } from '@/lib/site';

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Родоніт Агро`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      images: post.cover ? [{ url: post.cover, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.cover ? [post.cover] : undefined,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const headings = postHeadings(post);
  const related = relatedPosts(post.slug);
  const url = `${SITE}/blog/${post.slug}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      image: post.cover ? [`${SITE}${post.cover}`] : undefined,
      articleSection: post.category,
      keywords: post.tags.map((t) => t.label).join(', '),
      inLanguage: 'uk-UA',
      // datePublished свідомо відсутній: реальних дат публікації немає
      // ні в краулі, ні в старій БД. Вигадана дата в JSON-LD — це заявлений
      // Google факт, тому краще не заявляти нічого.
      publisher: {
        '@type': 'Organization',
        name: 'Родоніт Агро',
        logo: { '@type': 'ImageObject', url: `${SITE}/og.jpg` },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Головна', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Блог', item: `${SITE}/blog` },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.category,
          item: `${SITE}/blog/category/${post.categorySlug}`,
        },
        { '@type': 'ListItem', position: 4, name: post.title, item: url },
      ],
    },
  ];

  return (
    <div className="page-frame">
      <SiteHeader />
      <ScrollToTop />
      <ReadProgressBar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <BlogHero
        breadcrumbs={[
          { label: 'Головна', href: '/' },
          { label: 'Блог', href: '/blog' },
          { label: post.category, href: `/blog/category/${post.categorySlug}` },
        ]}
        eyebrow={post.category}
        title={post.title}
        description={post.excerpt}
      />

      <article className="bg-[var(--color-bg)]">
        <div className="container-page py-16">
          {post.cover && (
            <Reveal>
              <Image
                src={post.cover}
                alt={post.title}
                width={1200}
                height={630}
                priority
                className="aspect-[1200/630] w-full rounded-[24px] object-cover"
              />
            </Reveal>
          )}

          <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
            <div className="min-w-0">
              <PostBody blocks={post.blocks} />

              <div className="mt-14 max-w-[720px] border-t border-[rgba(0,0,0,0.1)] pt-8">
                <TagList tags={post.tags} />
                <div className="mt-6">
                  <ShareButtons url={url} title={post.title} />
                </div>
              </div>
            </div>

            {/* Зміст праворуч і липкий — на мобільному ховається, там він
                займав би пів екрана перед самим текстом. */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <TableOfContents items={headings} />
            </aside>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="rounded-[32px] bg-[var(--color-surface)]">
          <div className="container-page py-24">
            <Reveal>
              <p className="eyebrow text-[rgba(14,15,12,0.4)]">Схожі матеріали</p>
              <h2 className="text-h3 mt-3">Читати далі</h2>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.slug} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                  <PostCard post={p} />
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
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Зворотний звʼязок</p>
                <h2 className="text-h3 mt-3 max-w-[460px]">Підберемо схему під вашу культуру</h2>
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
                  href="/preparaty"
                  className="link-arrow mt-8 flex w-fit items-center gap-2 text-[15px] font-[700] text-[var(--color-dark)]"
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
