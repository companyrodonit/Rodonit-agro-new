import Image from 'next/image';
import type { Product } from '@/lib/content';
import type { Post, PostBlock } from '@/lib/posts';
import { headingSlug, parseMarker } from '@/lib/posts';
import type { ProductDetail } from '@/lib/products-detail';
import { ArrowRight, Reveal } from '../interactive';

/**
 * Дані каталогу для дизайн-блоків у тілі статті. Передаються пропсом, а не
 * читаються тут: blog-ui лишається без залежності від CMS, як і решта
 * серверних компонентів у цій теці.
 */
export type PostMedia = {
  products: Product[];
  details: ProductDetail[];
  images: Record<string, string>;
  imageAlts: Record<string, string>;
};

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
          // Без sizes next/image тягнув на картку кадр у 1200px — це зайва вага
          // на кожну картку сітки. Три колонки на десктопі, дві на планшеті.
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          quality={90}
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

/* ---------------------------------------------------- дизайн-блоки статті
   Маркер — звичайний абзац виду [[product:nordoks]]; розбирає parseMarker
   у lib/posts.ts. Дані картки й таблиці беруться з каталогу, а не дублюються
   в тексті статті: змінилась норма в адмінці — змінилась і в статті. */

/** Картка препарату всередині тексту. */
function ProductCard({ slug, media }: { slug: string; media: PostMedia }) {
  const product = media.products.find((p) => p.slug === slug);
  if (!product) return null;
  const image = media.images[slug];

  return (
    <aside className="mt-8 flex flex-col gap-5 rounded-[20px] border border-[rgba(1,54,46,0.12)] bg-[var(--color-surface)] p-6 sm:flex-row sm:items-center">
      {image && (
        <Image
          src={image}
          alt={media.imageAlts[slug] ?? product.name}
          width={120}
          height={158}
          className="h-[130px] w-auto shrink-0 self-start object-contain"
        />
      )}
      <div className="min-w-0">
        <p className="eyebrow text-[rgba(14,15,12,0.45)]">{product.category}</p>
        <p className="mt-1 text-[20px] font-[600] leading-[1.25] text-[var(--color-dark)]">
          {product.name}
        </p>
        <p className="mt-2 text-[15px] leading-[1.6] text-[rgba(14,15,12,0.7)]">
          {product.description}
        </p>
        <a
          href={`/preparaty/${product.slug}`}
          className="mt-4 inline-flex items-center gap-2 text-[14px] font-[600] text-[var(--color-dark)] underline-offset-4 hover:underline"
        >
          Картка препарату <ArrowRight size={13} />
        </a>
      </div>
    </aside>
  );
}

/** Таблиця регламенту препарату — джерело те саме, що на сторінці препарату. */
function RatesTable({
  slug,
  filter,
  media,
}: {
  slug: string;
  filter?: string;
  media: PostMedia;
}) {
  const detail = media.details.find((d) => d.slug === slug);
  if (!detail?.regulations.length) return null;

  // Фільтр звужує таблицю до культури статті. Якщо він нічого не знайшов —
  // показуємо повний регламент: краще зайві рядки, ніж порожня таблиця.
  const matched = filter
    ? detail.regulations.filter((r) => r.culture.toLowerCase().includes(filter.toLowerCase()))
    : [];
  const rows = matched.length ? matched : detail.regulations;
  const isPartial = rows.length < detail.regulations.length;

  return (
    <figure className="mt-8">
      <figcaption className="eyebrow text-[rgba(14,15,12,0.45)]">
        {detail.shortName} — норми застосування
      </figcaption>
      {/* Таблиця широка: на мобільному горизонтальний скрол лишається
          всередині цього контейнера, сторінка вбік не їде. */}
      <div className="mt-3 overflow-x-auto rounded-[16px] border border-[rgba(1,54,46,0.12)]">
        <table className="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr className="bg-[var(--color-surface)]">
              <th className="whitespace-nowrap px-4 py-3 font-[600] text-[var(--color-dark)]">
                Культура
              </th>
              <th className="px-4 py-3 font-[600] text-[var(--color-dark)]">Норма й спосіб</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.culture} className="border-t border-[rgba(1,54,46,0.1)]">
                <td className="px-4 py-3 align-top font-[500] text-[var(--color-dark)]">
                  {r.culture}
                </td>
                <td className="px-4 py-3 align-top tabular-nums text-[rgba(14,15,12,0.75)]">
                  {r.rate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isPartial && (
        <p className="mt-3 text-[14px] text-[rgba(14,15,12,0.55)]">
          Норми по інших культурах —{' '}
          <a
            href={`/preparaty/${detail.slug}`}
            className="font-[500] text-[var(--color-dark)] underline underline-offset-4"
          >
            у повному регламенті препарату
          </a>
          .
        </p>
      )}
    </figure>
  );
}

/**
 * Довільна таблиця з тексту статті.
 *
 * Потрібна окремо від RatesTable: та збирається з каталогу, а тут дані живуть
 * у самій статті — схеми обробок, фази розвитку, порівняння. При краулі старого
 * сайту такі таблиці розсипались у стовпчик абзаців «| комірка |», і сторінка
 * виглядала як помилка верстки.
 */
function DataTable({
  caption,
  head,
  rows,
}: {
  caption?: string;
  head: string[];
  rows: string[][];
}) {
  return (
    <figure className="mt-8">
      {caption && <figcaption className="eyebrow text-[rgba(14,15,12,0.45)]">{caption}</figcaption>}
      <div
        className={`overflow-x-auto rounded-[16px] border border-[rgba(1,54,46,0.12)] ${
          caption ? 'mt-3' : ''
        }`}
      >
        <table className="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr className="bg-[var(--color-surface)]">
              {head.map((cell) => (
                <th key={cell} className="px-4 py-3 font-[600] text-[var(--color-dark)]">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.join('|') || i} className="border-t border-[rgba(1,54,46,0.1)]">
                {/* Рівно стільки комірок, скільки в шапці: недобір добиваємо
                    порожніми, надлишок відрізаємо — інакше рядок «поїде». */}
                {head.map((_, j) => (
                  <td
                    key={j}
                    className={`px-4 py-3 align-top ${
                      j === 0
                        ? 'font-[500] text-[var(--color-dark)]'
                        : 'tabular-nums text-[rgba(14,15,12,0.75)]'
                    }`}
                  >
                    {row[j] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/** Виноска «Важливо» — те, що читач має не проґавити. */
function Callout({ title, text }: { title: string; text: string }) {
  return (
    <aside className="mt-8 border-l-[3px] border-[var(--color-accent)] bg-[var(--color-surface)] px-5 py-4">
      <p className="eyebrow text-[var(--color-dark)]">{title}</p>
      <p className="mt-2 text-[16px] leading-[1.7] text-[rgba(14,15,12,0.78)]">{text}</p>
    </aside>
  );
}

/**
 * Питання-відповідь. Розгорнуте за замовчуванням: у пошуковій видачі й у
 * відповідях AI-ботів важить сам текст, а прихований <details> частина
 * краулерів усе одно бачить — зате читач одразу має відповідь перед очима.
 */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details open className="mt-4 border-b border-[rgba(0,0,0,0.1)] pb-4">
      <summary className="cursor-pointer list-none text-[17px] font-[600] text-[var(--color-dark)] marker:hidden">
        {question}
      </summary>
      <p className="mt-2 text-[17px] leading-[1.75] text-[rgba(14,15,12,0.75)]">{answer}</p>
    </details>
  );
}

function Block({ block, media }: { block: PostBlock; media?: PostMedia }) {
  if (block.type === 'paragraph') {
    const marker = parseMarker(block.text);
    // Таблиця, виноска й питання живуть у самому тексті, тому рендеряться
    // завжди. Картка препарату й регламент тягнуть дані з каталогу — без
    // media показуємо абзац як є, щоб не лишити на сторінці порожнє місце.
    switch (marker?.kind) {
      case 'table':
        return <DataTable caption={marker.caption} head={marker.head} rows={marker.rows} />;
      case 'callout':
        return <Callout title={marker.title} text={marker.text} />;
      case 'faq':
        return <FaqItem question={marker.question} answer={marker.answer} />;
      case 'product':
        if (media) return <ProductCard slug={marker.slug} media={media} />;
        break;
      case 'rates':
        if (media) return <RatesTable slug={marker.slug} filter={marker.filter} media={media} />;
        break;
    }
  }

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

export function PostBody({ blocks, media }: { blocks: PostBlock[]; media?: PostMedia }) {
  return (
    <div data-testid="post-body" className="max-w-[720px]">
      {blocks.map((b, i) => (
        <Block key={`${b.type}-${i}`} block={b} media={media} />
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
