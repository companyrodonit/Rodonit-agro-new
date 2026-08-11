import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { postHeadings } from '@/lib/posts';
import { getContacts, getPostBySlug, getPosts, getRelatedPosts } from '@/lib/cms';
import { ArrowRight, LeadForm, Phone, Reveal, ScrollToTop } from '../../interactive';
import { SiteHeader } from '../../site-header';
import { SiteFooter } from '../../site-footer';
import { BlogHero, PostBody, PostCard, TagList } from '../blog-ui';
import { ReadProgressBar, ShareButtons, TableOfContents } from '../blog-client';

import { SITE } from '@/lib/site';

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const title = post.seoTitle || `${clamp(post.title, 45)} | Родоніт Агро`;
  const description = post.metaDescription || clamp(post.excerpt, 158);
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      // В OG лишається ПОВНИЙ заголовок: у стрічці Facebook чи Telegram
      // нічого не обрізається на 60 символах, і різати там нема сенсу.
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      images: post.cover ? [{ url: post.cover, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.cover ? [post.cover] : undefined,
    },
  };
}

/**
 * Обрізає по межі слова, з еліпсисом. Потрібно, бо заголовки статей у
 * блозі — журналістські, до 119 символів, а Google показує ~60 і решту
 * зрізає посеред слова. Те саме з excerpt: він писався як анонс на картці,
 * не як meta description, і подекуди йде за 180 символів.
 *
 * Це фолбек. Коли в статті заповнені SEO-поля в адмінці, беруться вони.
 */
function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:—-]+$/, '')}…`;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const contacts = await getContacts();
  const mainPhone = contacts.phones[0];
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const headings = postHeadings(post);
  const related = await getRelatedPosts(post.slug);
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
      // datePublished зʼявляється лише тоді, коли дата справді є в CMS.
      // Реальних дат немає ні в краулі, ні в старій БД, а вигадана дата в
      // JSON-LD — це заявлений Google факт, тому краще не заявляти нічого.
      // Поле «Дата публікації» в адмінці є: щойно Олег заповнить — підхопиться.
      ...(post.date && { datePublished: post.date, dateModified: post.date }),
      // Автор потрібен Google для Article rich result і читається як сигнал
      // E-E-A-T. Іменного автора в перенесених статтях немає, тому за
      // замовчуванням автор — сама компанія; це правда, а не заглушка.
      author: post.author
        ? { '@type': 'Person', name: post.author }
        : { '@id': `${SITE}/#org` },
      publisher: { '@id': `${SITE}/#org` },
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
                  href={mainPhone?.href ?? 'tel:+380444995049'}
                  className="mt-8 flex w-fit items-center gap-3 text-[18px] font-[500] text-[var(--color-dark)] hover:text-[color:#03594C]"
                >
                  <Phone size={16} className="shrink-0" /> <span className="whitespace-nowrap">{mainPhone?.value ?? '+38 (044) 499-50-49'}</span>
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
