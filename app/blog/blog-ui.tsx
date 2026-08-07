import Image from 'next/image';
import type { Post, PostBlock } from '@/lib/posts';
import { headingSlug } from '@/lib/posts';
import { ArrowRight, Reveal } from '../interactive';

/* Серверні блоки блогу. Свідомо повторюють крій, який уже є на сайті:
   картка поста — той самий прийом із білою карткою внапуск на фото, що в
   секції «Новини» на головній; шапка — та сама, що на /distributors. */

/* ------------------------------------------------------------ шапка сторінки */

export function BlogHero({
  eyebrow,
  title,
  accent,
  description,
  breadcrumbs,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  breadcrumbs: { label: string; href?: string }[];
}) {
  return (
    <section id="top" className="gradient-dark on-dark rounded-b-[32px] pt-[104px]">
      <div className="container-page pb-20 pt-8">
        <nav aria-label="Хлібні крихти" className="text-[14px] text-[rgba(255,255,255,0.45)]">
          {breadcrumbs.map((b, i) => (
            <span key={b.label}>
              {i > 0 && ' / '}
              {b.href ? (
                <a href={b.href} className="hover:text-[var(--color-bg)]">
                  {b.label}
                </a>
              ) : (
                <span className="text-[var(--color-bg)]">{b.label}</span>
              )}
            </span>
          ))}
        </nav>

        <Reveal>
          <p className="eyebrow mt-10 text-[var(--color-accent)]">{eyebrow}</p>
          <h1 className="text-h2 mt-4 max-w-[900px] !text-[var(--color-bg)]">
            {title}
            {accent && <em className="accent-word">{accent}</em>}
          </h1>
          {description && (
            <p className="mt-6 max-w-[640px] text-[17px] leading-[1.6] text-[rgba(255,255,255,0.7)]">
              {description}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- картка поста */

export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      data-testid={`post-card-${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-[var(--color-dark)]"
    >
      {post.cover && (
        <Image
          src={post.cover}
          alt=""
          width={560}
          height={360}
          priority={priority}
          className="h-[260px] w-full object-cover"
        />
      )}
      {/* Біла картка внапуск на фото — той самий прийом, що в новинах на головній. */}
      <div className="relative -mt-14 mx-3 mb-3 flex flex-1 flex-col rounded-[20px] bg-[var(--color-bg)] p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[12px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.45)]">
            {post.category}
          </span>
          <span className="shrink-0 text-[12px] text-[rgba(14,15,12,0.35)]">
            {post.readMinutes} хв
          </span>
        </div>
        <h3 className="mt-2 line-clamp-3 text-[20px] font-[700] leading-[1.3] text-[var(--color-dark)]">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-[15px] leading-[1.6] text-[rgba(14,15,12,0.6)]">
          {post.excerpt}
        </p>
        <span className="link-arrow mt-auto flex items-center justify-end gap-2 pt-5 text-[14px] font-[700] text-[var(--color-dark)]">
          Читати <ArrowRight size={14} />
        </span>
      </div>
    </a>
  );
}

export function PostGrid({ items }: { items: Post[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((p, i) => (
        <Reveal key={p.slug} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
          <PostCard post={p} priority={i < 3} />
        </Reveal>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- тіло статті */

function Block({ block }: { block: PostBlock }) {
  if (block.type === 'heading') {
    return (
      <h2
        id={headingSlug(block.text)}
        className="text-h4 mt-14 scroll-mt-[120px] first:mt-0 !text-[var(--color-dark)]"
      >
        {block.text}
      </h2>
    );
  }
  if (block.type === 'list') {
    return (
      <ul className="mt-5 space-y-3">
        {block.items.map((item) => (
          <li key={item} className="flex gap-3 text-[17px] leading-[1.7] text-[rgba(14,15,12,0.75)]">
            <span className="mt-[10px] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--color-accent)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="mt-5 text-[17px] leading-[1.75] text-[rgba(14,15,12,0.75)]">{block.text}</p>;
}

export function PostBody({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div data-testid="post-body" className="max-w-[720px]">
      {blocks.map((b, i) => (
        <Block key={`${b.type}-${i}`} block={b} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- дрібне */

export function TagList({ tags }: { tags: Post['tags'] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <a
          key={t.slug}
          href={`/blog/tag/${t.slug}`}
          className="rounded-full bg-[var(--color-surface)] px-4 py-2 text-[13px] font-[500] text-[var(--color-dark)] transition-colors hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)]"
        >
          {t.label}
        </a>
      ))}
    </div>
  );
}

/** Порожній стан — щоб категорія чи тег без матеріалів не давали білу діру. */
export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-[var(--color-surface)] p-10 text-center">
      <p className="text-[17px] text-[rgba(14,15,12,0.6)]">{text}</p>
      <a href="/blog" className="btn btn-primary mt-6">
        Усі матеріали <ArrowRight size={14} />
      </a>
    </div>
  );
}
