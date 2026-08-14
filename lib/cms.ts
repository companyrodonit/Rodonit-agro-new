/**
 * Шар даних поверх Payload. Правила:
 *
 * 1. Кожен геттер віддає РІВНО ту саму структуру, що й статичні lib/content.ts,
 *    lib/posts.ts тощо — сторінки не мусять знати, звідки прийшли дані.
 * 2. Якщо БД недоступна або колекція порожня — повертається статичний фолбек
 *    з lib/. Сайт не може впасти через базу; найгірший сценарій — старий текст.
 * 3. Сторінки культур і фільтр каталогу НЕ мають власних даних: вони
 *    збираються з регламентів препаратів. Одна норма внесення живе в одному
 *    місці (препарат), тому розійтись їй нема з чим.
 */
import { cache } from 'react';
import { getPayload, type Payload } from 'payload';
import config from '@/payload.config';

import {
  hero as heroStatic, products as productsStatic, categories as categoriesStatic,
  cultures as culturesStatic, problems as problemsStatic, about as aboutStatic,
  trust as trustStatic, distributors as distributorsStatic,
  distributorFilters as distributorFiltersStatic, news as newsStatic,
  cta as ctaStatic, contacts as contactsStatic, nav as navStatic,
  footerColumns as footerColumnsStatic, delivery as deliveryStatic,
  packaging as packagingStatic, type Product,
} from '@/lib/content';
import { productDetails as productDetailsStatic, type ProductDetail } from '@/lib/products-detail';
import { culturePages as culturePagesStatic, type Culture, type CultureProduct } from '@/lib/cultures';
import { solutions as solutionsStatic, type Solution } from '@/lib/solutions';
import {
  posts as postsStatic, blogCategories as blogCategoriesStatic,
  type Post, type PostBlock, type PostTag,
} from '@/lib/posts';

/* ------------------------------------------------------------------ базове */

const getClient = cache(async (): Promise<Payload | null> => {
  try {
    return await getPayload({ config });
  } catch (e) {
    console.error('[cms] Payload недоступний, працюємо на статичних даних:', e);
    return null;
  }
});

/** media-поле → URL. Вміє і локальні файли, і Vercel Blob. */
type MediaDoc = { url?: string | null; alt?: string | null } | number | null | undefined;
const mediaUrl = (m: MediaDoc, fallback: string): string =>
  (typeof m === 'object' && m?.url) || fallback;

/**
 * Назва категорії у картці препарату — в однині («Фунгіцид»), а колекція
 * категорій — у множині («Фунгіциди»). Невідома категорія показується як є.
 */
const CATEGORY_SINGULAR: Record<string, string> = {
  'Стимулятори росту': 'Стимулятор росту',
  'Мікродобрива': 'Мікродобриво',
  'Фунгіциди': 'Фунгіцид',
  'Прилипачі': 'Прилипач',
};
const singular = (name: string) => CATEGORY_SINGULAR[name] ?? name;

const uaPlural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

type Rel = { name?: string; slug?: string } | number | null | undefined;
const relName = (r: Rel) => (typeof r === 'object' && r?.name) || '';
const relSlug = (r: Rel) => (typeof r === 'object' && r?.slug) || '';

const texts = (arr: unknown): string[] =>
  Array.isArray(arr) ? arr.map((x) => (x as { text?: string })?.text ?? '').filter(Boolean) : [];

/* -------------------------------------------------------- сирі колекції */

const fetchProductsRaw = cache(async () => {
  const payload = await getClient();
  if (!payload) return null;
  try {
    const r = await payload.find({
      collection: 'products', sort: 'order', limit: 100, depth: 1,
    });
    return r.docs.length ? r.docs : null;
  } catch (e) {
    console.error('[cms] products:', e);
    return null;
  }
});

const fetchCulturesRaw = cache(async () => {
  const payload = await getClient();
  if (!payload) return null;
  try {
    const r = await payload.find({ collection: 'cultures', sort: 'order', limit: 200, depth: 1 });
    return r.docs.length ? r.docs : null;
  } catch (e) {
    console.error('[cms] cultures:', e);
    return null;
  }
});

const fetchHome = cache(async () => {
  const payload = await getClient();
  if (!payload) return null;
  try {
    return await payload.findGlobal({ slug: 'home', depth: 1 });
  } catch (e) {
    console.error('[cms] home:', e);
    return null;
  }
});

const fetchSettings = cache(async () => {
  const payload = await getClient();
  if (!payload) return null;
  try {
    return await payload.findGlobal({ slug: 'settings' });
  } catch (e) {
    console.error('[cms] settings:', e);
    return null;
  }
});

/* ------------------------------------------------------------- препарати */

export const getProducts = cache(async (): Promise<Product[]> => {
  const docs = await fetchProductsRaw();
  if (!docs) return productsStatic;
  return docs.map((d) => ({
    slug: d.slug as string,
    name: d.name as string,
    category: singular(relName(d.category as Rel)),
    description: (d.description as string) ?? '',
    featured: Boolean(d.featured),
  }));
});

export const getProductDetails = cache(async (): Promise<ProductDetail[]> => {
  const docs = await fetchProductsRaw();
  if (!docs) return productDetailsStatic;
  return docs.map((d) => ({
    slug: d.slug as string,
    name: d.name as string,
    shortName: (d.shortName as string) || (d.name as string),
    category: singular(relName(d.category as Rel)),
    categorySlug: relSlug(d.category as Rel),
    tagline: (d.tagline as string) ?? '',
    seoTitle: (d.seoTitle as string) ?? '',
    metaDescription: (d.metaDescription as string) ?? '',
    keySpecs: ((d.keySpecs as { label: string; value: string }[]) ?? []).map(
      ({ label, value }) => ({ label, value }),
    ),
    intro: texts(d.intro),
    specs: ((d.specs as { title: string; body: unknown }[]) ?? []).map((s) => ({
      title: s.title,
      body: texts(s.body),
    })),
    advantages: texts(d.advantages),
    regulations: ((d.regulations as { culture: string; rate: string }[]) ?? []).map(
      ({ culture, rate }) => ({ culture, rate }),
    ),
    usage: texts(d.usage),
    mixing: texts(d.mixing),
    compatibility: texts(d.compatibility),
    storage: texts(d.storage),
    problems: ((d.problems as { title: string; body: unknown }[]) ?? []).map((p) => ({
      title: p.title,
      body: texts(p.body),
    })),
    faq: ((d.faq as { question: string; answer: string }[]) ?? []).map(
      ({ question, answer }) => ({ question, answer }),
    ),
  }));
});

export const getProductBySlug = async (slug: string) =>
  (await getProductDetails()).find((p) => p.slug === slug);

/** Фото упаковки. Ключ — слаг препарату. */
export const getProductImages = cache(async (): Promise<Record<string, string>> => {
  const docs = await fetchProductsRaw();
  const out: Record<string, string> = {};
  for (const p of productsStatic) out[p.slug] = `/products/${p.slug}.png`;
  if (docs) {
    for (const d of docs) {
      out[d.slug as string] = mediaUrl(d.image as MediaDoc, `/products/${d.slug}.png`);
    }
  }
  return out;
});

/**
 * Підписи (alt) до фото препаратів із медіатеки.
 *
 * Поле alt обовʼязкове при завантаженні, тож редактор його заповнює — але
 * до 12.08 воно нікуди не йшло, а в розмітку підставлялася назва препарату.
 * Тепер працює як задумано: є свій alt — беремо його, немає — назва.
 */
export const getProductImageAlts = cache(async (): Promise<Record<string, string>> => {
  const docs = await fetchProductsRaw();
  const out: Record<string, string> = {};
  if (docs) {
    for (const d of docs) {
      const img = d.image as MediaDoc;
      const alt = typeof img === 'object' && img ? (img.alt as string | undefined) : undefined;
      if (alt?.trim()) out[d.slug as string] = alt.trim();
    }
  }
  return out;
});

export const getPackaging = cache(async (): Promise<Record<string, string[]>> => {
  const docs = await fetchProductsRaw();
  if (!docs) return packagingStatic;
  const out: Record<string, string[]> = {};
  for (const d of docs) out[d.slug as string] = texts(d.packaging);
  return out;
});

/* ------------------------------------------------------------- категорії */

export const getCategories = cache(async (): Promise<typeof categoriesStatic> => {
  const payload = await getClient();
  if (!payload) return categoriesStatic;
  try {
    const [cats, products] = await Promise.all([
      payload.find({ collection: 'categories', sort: 'order', limit: 50 }),
      getProducts(),
    ]);
    if (!cats.docs.length) return categoriesStatic;
    return cats.docs.map((c) => {
      const n = products.filter((p) => p.category === singular(c.name as string)).length;
      const iconStatic = categoriesStatic.find((s) => s.slug === c.slug)?.icon ?? 'growth';
      return {
        slug: c.slug as string,
        icon: iconStatic,
        name: c.name as string,
        description: (c.description as string) ?? '',
        count: `${n} ${uaPlural(n, 'препарат', 'препарати', 'препаратів')}`,
      };
    });
  } catch (e) {
    console.error('[cms] categories:', e);
    return categoriesStatic;
  }
});

/* ----------------------------------------- культури (похідні від регламентів) */

export const getCulturePages = cache(async (): Promise<Culture[]> => {
  const cultureDocs = await fetchCulturesRaw();
  if (!cultureDocs) return culturePagesStatic;
  return cultureDocs.map((c) => {
    const rows = (c.products as { product: Rel; rate?: string | null }[]) ?? [];
    const products: CultureProduct[] = rows
      .filter((r) => typeof r.product === 'object' && r.product)
      .map((r) => {
        const p = r.product as { slug?: string; name?: string; category?: Rel };
        return {
          slug: p.slug ?? '',
          name: p.name ?? '',
          category: singular(relName(p.category)),
          rate: r.rate ?? null,
        };
      });
    return {
      slug: c.slug as string,
      name: c.name as string,
      intro: (c.intro as string) ?? '',
      products,
    };
  });
});

export const getCultureBySlug = async (slug: string) =>
  (await getCulturePages()).find((c) => c.slug === slug);

/** Список культур для головної: назва + кількість препаратів. */
export const getCulturesIndex = cache(async (): Promise<typeof culturesStatic> => {
  const pages = await getCulturePages();
  if (pages === culturePagesStatic) return culturesStatic;
  return pages
    .map((c) => ({ slug: c.slug, name: c.name, count: c.products.length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
});

/* ---------------------------------------------------------------- каталог */

import {
  catalogProducts as catalogProductsStatic,
  catalogCategories as catalogCategoriesStatic,
  catalogCultures as catalogCulturesStatic,
  type CatalogProduct,
} from '@/lib/catalog';

export type CatalogData = {
  products: CatalogProduct[];
  categories: { slug: string; name: string; count: number }[];
  cultures: { slug: string; name: string; count: number }[];
  images: Record<string, string>;
};

/**
 * Дані фільтра каталогу. Членство «препарат ↔ культура» береться з рядків
 * культур (див. коментар у колекції Cultures) — одне джерело і для сторінок
 * культур, і для фільтра.
 */
export const getCatalog = cache(async (): Promise<CatalogData> => {
  const [details, cards, culturePages, images] = await Promise.all([
    getProductDetails(), getProducts(), getCulturePages(), getProductImages(),
  ]);
  if (details === productDetailsStatic) {
    return {
      products: catalogProductsStatic,
      categories: catalogCategoriesStatic,
      cultures: catalogCulturesStatic,
      images,
    };
  }
  const culturesOfProduct = new Map<string, string[]>();
  for (const c of culturePages) {
    for (const p of c.products) {
      culturesOfProduct.set(p.slug, [...(culturesOfProduct.get(p.slug) ?? []), c.slug]);
    }
  }
  const products: CatalogProduct[] = cards.map((card) => {
    const d = details.find((x) => x.slug === card.slug);
    return {
      ...card,
      categorySlug: d?.categorySlug ?? '',
      tagline: d?.tagline || card.description,
      cultures: culturesOfProduct.get(card.slug) ?? [],
    };
  });
  const categories = (await getCategories()).map((c) => ({
    slug: c.slug,
    name: c.name,
    count: products.filter((p) => p.categorySlug === c.slug).length,
  }));
  const cultures = culturePages
    .map((c) => ({ slug: c.slug, name: c.name, count: c.products.length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return { products, categories, cultures, images };
});

/* --------------------------------------------------------------- рішення */

export const getSolutions = cache(async (): Promise<Solution[]> => {
  const payload = await getClient();
  if (!payload) return solutionsStatic;
  try {
    const r = await payload.find({ collection: 'solutions', sort: 'order', limit: 50, depth: 1 });
    if (!r.docs.length) return solutionsStatic;
    return r.docs.map((s) => ({
      slug: s.slug as string,
      title: s.title as string,
      lead: (s.lead as string) ?? '',
      paragraphs: texts(s.paragraphs),
      productSlugs: ((s.products as Rel[]) ?? []).map(relSlug).filter(Boolean),
    }));
  } catch (e) {
    console.error('[cms] solutions:', e);
    return solutionsStatic;
  }
});

export const getSolutionBySlug = async (slug: string) =>
  (await getSolutions()).find((s) => s.slug === slug);

/* --------------------------------------------------------- дистрибʼютори */

export const getDistributors = cache(async (): Promise<typeof distributorsStatic> => {
  const payload = await getClient();
  if (!payload) return distributorsStatic;
  try {
    const r = await payload.find({ collection: 'distributors', sort: 'order', limit: 100, depth: 1 });
    if (!r.docs.length) return distributorsStatic;
    return r.docs.map((d) => ({
      name: d.name as string,
      direction: (d.direction as string) ?? '',
      role: (d.role as string) ?? '',
      logo: mediaUrl(d.logo as MediaDoc, ''),
      phones: ((d.phones as { number: string }[]) ?? []).map((p) => p.number),
      ...(d.address ? { address: d.address as string } : {}),
    })) as typeof distributorsStatic;
  } catch (e) {
    console.error('[cms] distributors:', e);
    return distributorsStatic;
  }
});

export const getDistributorFilters = cache(async (): Promise<string[]> => {
  const list = await getDistributors();
  if (list === distributorsStatic) return distributorFiltersStatic;
  const directions = [...new Set(list.map((d) => d.direction).filter(Boolean))];
  return ['Усі напрямки', ...directions];
});

/* ------------------------------------------------------------------- блог */

export const getBlogCategories = cache(async (): Promise<typeof blogCategoriesStatic> => {
  const payload = await getClient();
  if (!payload) return blogCategoriesStatic;
  try {
    const r = await payload.find({ collection: 'blog-categories', sort: 'order', limit: 50 });
    if (!r.docs.length) return blogCategoriesStatic;
    return r.docs.map((c) => ({
      slug: c.slug as string,
      name: c.name as string,
      description: (c.description as string) ?? '',
    })) as unknown as typeof blogCategoriesStatic;
  } catch (e) {
    console.error('[cms] blog-categories:', e);
    return blogCategoriesStatic;
  }
});

export const getPosts = cache(async (): Promise<Post[]> => {
  const payload = await getClient();
  if (!payload) return postsStatic;
  try {
    const r = await payload.find({
      // Сортуємо вже отримане, а не в запиті: у перенесених статтях `date`
      // порожній, а Postgres у сортуванні за спаданням ставить NULL ПЕРШИМИ —
      // через це свіжа стаття з датою опинялась у самому кінці блогу.
      collection: 'posts', sort: '-createdAt', limit: 500, depth: 1,
      where: { published: { equals: true } },
    });
    if (!r.docs.length) return postsStatic;
    // Дата публікації, а якщо її не проставили — коли документ завели в CMS.
    const when = (p: { date?: unknown; createdAt?: unknown }) =>
      new Date((p.date as string) || (p.createdAt as string) || 0).getTime();
    return [...r.docs].sort((a, b) => when(b) - when(a)).map((p) => {
      const blocks: PostBlock[] = ((p.blocks as {
        kind: 'paragraph' | 'heading' | 'list'; text?: string; items?: unknown;
      }[]) ?? []).map((b) =>
        b.kind === 'list'
          ? { type: 'list', items: texts(b.items) }
          : { type: b.kind, text: b.text ?? '' },
      );
      const words = blocks.reduce((acc, b) =>
        acc + ('text' in b ? b.text.split(/\s+/).length : b.items.join(' ').split(/\s+/).length), 0);
      const cat = p.category as Rel;
      return {
        slug: p.slug as string,
        title: p.title as string,
        excerpt: (p.excerpt as string) ?? '',
        category: relName(cat),
        categorySlug: relSlug(cat),
        readMinutes: (p.readMinutes as number) || Math.max(1, Math.round(words / 180)),
        cover: mediaUrl(p.cover as MediaDoc, '') || undefined,
        date: (p.date as string | undefined)?.slice(0, 10) || undefined,
        author: (p.author as string | undefined) || undefined,
        seoTitle: (p.seoTitle as string | undefined) || undefined,
        metaDescription: (p.metaDescription as string | undefined) || undefined,
        tags: ((p.tags as PostTag[]) ?? []).map(({ slug, label, kind }) => ({ slug, label, kind })),
        blocks,
      };
    });
  } catch (e) {
    console.error('[cms] posts:', e);
    return postsStatic;
  }
});

export const getPostBySlug = async (slug: string) =>
  (await getPosts()).find((p) => p.slug === slug);

export const getPostsByCategory = async (categorySlug: string) =>
  (await getPosts()).filter((p) => p.categorySlug === categorySlug);

export const getPostsByTag = async (tagSlug: string) =>
  (await getPosts()).filter((p) => p.tags.some((t) => t.slug === tagSlug));

export const getAllTags = cache(async (): Promise<(PostTag & { count: number })[]> => {
  const posts = await getPosts();
  const map = new Map<string, PostTag & { count: number }>();
  for (const p of posts) {
    for (const t of p.tags) {
      const prev = map.get(t.slug);
      map.set(t.slug, { ...t, count: (prev?.count ?? 0) + 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
});

/**
 * Скільки статей має бути під тегом, щоб його сторінку пускати в індекс.
 *
 * Тег з однією статтею — це та сама стаття, показана вдруге: 120-200 слів,
 * жодного власного тексту. Для Google це thin content, і масив таких сторінок
 * псує оцінку домену цілком, а crawl budget витрачається на них замість
 * сторінок препаратів. Такі теги лишаються робочими посиланнями для людей,
 * але віддають `noindex, follow` і не потрапляють у sitemap.
 *
 * Поріг у трьох місцях мусить бути один — тому живе тут, а не в сторінках.
 */
export const TAG_INDEX_THRESHOLD = 3;

/** Теги, чиї сторінки достатньо наповнені, щоб їх індексувати. */
export const getIndexableTags = cache(async () =>
  (await getAllTags()).filter((t) => t.count >= TAG_INDEX_THRESHOLD),
);

/** Та сама логіка, що relatedPosts у lib/posts, але поверх CMS-даних. */
export const getRelatedPosts = async (slug: string, limit = 3): Promise<Post[]> => {
  const posts = await getPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return [];
  const tagSlugs = new Set(post.tags.map((t) => t.slug));
  const scored = posts
    .filter((p) => p.slug !== slug)
    .map((p) => ({ p, score: p.tags.filter((t) => tagSlugs.has(t.slug)).length }))
    .sort((a, b) => b.score - a.score || a.p.title.localeCompare(b.p.title));
  const picked = scored.filter((s) => s.score > 0).map((s) => s.p);
  if (picked.length >= limit) return picked.slice(0, limit);
  const filler = posts.filter(
    (p) => p.slug !== slug && !picked.includes(p) && p.categorySlug === post.categorySlug,
  );
  return [...picked, ...filler].slice(0, limit);
};

/** Три останні матеріали для секції «Новини» на головній. */
export const getNews = cache(
  async (): Promise<((typeof newsStatic)[number] & { cover: string })[]> => {
    const posts = await getPosts();
    if (posts === postsStatic) {
      return newsStatic.map((n) => ({ ...n, cover: `/blog/${n.slug}.jpg` }));
    }
    return posts.slice(0, 3).map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      tag: p.tags[0]?.label ?? p.category,
      read: `${p.readMinutes} хв`,
      cover: p.cover ?? `/blog/${p.slug}.jpg`,
    }));
  },
);

/* ------------------------------------------------------- глобал: головна */

export const getHero = cache(async (): Promise<typeof heroStatic & { background: string }> => {
  const home = await fetchHome();
  const fallbackBg = '/hero/00-STARYI-fon.jpg';
  if (!home) return { ...heroStatic, background: fallbackBg };
  return {
    eyebrow: (home.eyebrow as string) ?? heroStatic.eyebrow,
    titleBefore: (home.titleBefore as string) ?? heroStatic.titleBefore,
    titleAccent: (home.titleAccent as string) ?? heroStatic.titleAccent,
    subtitle: (home.subtitle as string) ?? heroStatic.subtitle,
    stats: ((home.stats as { value: string; label: string }[]) ?? []).length
      ? (home.stats as { value: string; label: string }[]).map((s) => ({
          value: Number(s.value) || 0, label: s.label, suffix: '',
        }))
      : heroStatic.stats,
    primaryCta: (home.primaryCta as string) ?? heroStatic.primaryCta,
    secondaryCta: (home.secondaryCta as string) ?? heroStatic.secondaryCta,
    background: mediaUrl(home.background as MediaDoc, fallbackBg),
  };
});

export const getAbout = cache(async (): Promise<typeof aboutStatic> => {
  const home = await fetchHome();
  if (!home) return aboutStatic;
  return {
    eyebrow: (home.aboutEyebrow as string) ?? aboutStatic.eyebrow,
    title: (home.aboutTitle as string) ?? aboutStatic.title,
    text: (home.aboutText as string) ?? aboutStatic.text,
    link: (home.aboutLink as string) ?? aboutStatic.link,
  };
});

export const getTrust = cache(async (): Promise<typeof trustStatic> => {
  const home = await fetchHome();
  const cards = home?.trust as { title: string; text: string; icon: string }[] | undefined;
  if (!cards?.length) return trustStatic;
  return cards.map((c) => ({
    label: c.title,
    icon: c.icon === 'safe' ? 'safe-class' : c.icon,
    tooltip: c.text,
  })) as typeof trustStatic;
});

export const getCta = cache(async (): Promise<typeof ctaStatic> => {
  const home = await fetchHome();
  if (!home) return ctaStatic;
  return {
    eyebrow: (home.ctaEyebrow as string) ?? ctaStatic.eyebrow,
    title: (home.ctaTitle as string) ?? ctaStatic.title,
    subtitle: (home.ctaSubtitle as string) ?? ctaStatic.subtitle,
    submit: (home.ctaSubmit as string) ?? ctaStatic.submit,
    legal: (home.ctaLegal as string) ?? ctaStatic.legal,
  };
});

/** Блок «Проблема → препарат». Поки лишається статичним (тексти авторські). */
export const getProblems = cache(async (): Promise<typeof problemsStatic> => problemsStatic);

/* ------------------------------------------------------ глобал: settings */

export const getContacts = cache(async (): Promise<typeof contactsStatic> => {
  const s = await fetchSettings();
  if (!s) return contactsStatic;
  const phones = (s.phones as { label: string; value: string; href: string }[]) ?? [];
  const allPhones = (s.allPhones as { group: string; numbers?: { number: string }[] }[]) ?? [];
  const socials = (s.socials as { name: string; href: string }[]) ?? [];
  const cap: Record<string, string> = {
    facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok',
  };
  return {
    company: (s.company as string) ?? contactsStatic.company,
    phones: phones.length
      ? phones.map(({ label, value, href }) => ({ label, value, href }))
      : contactsStatic.phones,
    allPhones: allPhones.length
      ? allPhones.map((g) => ({ group: g.group, numbers: (g.numbers ?? []).map((n) => n.number) }))
      : contactsStatic.allPhones,
    email: (s.email as string) ?? contactsStatic.email,
    address: (s.address as string) ?? contactsStatic.address,
    socials: socials.length
      ? socials.map((x) => ({ name: cap[x.name] ?? x.name, href: x.href }))
      : contactsStatic.socials,
  };
});

export const getNav = cache(async (): Promise<typeof navStatic> => {
  const s = await fetchSettings();
  const items = (s?.nav as { label: string; href: string }[]) ?? [];
  return items.length ? items.map(({ label, href }) => ({ label, href })) : navStatic;
});

export const getFooterColumns = cache(async (): Promise<typeof footerColumnsStatic> => {
  const s = await fetchSettings();
  const cols = (s?.footerColumns as {
    title: string; links?: { label: string; href: string }[];
  }[]) ?? [];
  return cols.length
    ? cols.map((c) => ({ title: c.title, links: (c.links ?? []).map(({ label, href }) => ({ label, href })) }))
    : footerColumnsStatic;
});

export const getDelivery = cache(async (): Promise<typeof deliveryStatic> => {
  const s = await fetchSettings();
  const items = (s?.delivery as { title: string; note?: string; icon?: 'truck' | 'pin' }[]) ?? [];
  return items.length
    ? items.map((d) => ({ title: d.title, note: d.note ?? '', icon: d.icon ?? 'truck' }))
    : deliveryStatic;
});

export const getLegal = cache(async () => {
  const s = await fetchSettings();
  return {
    name: (s?.legalName as string) || 'ТОВ «РОДОНІТ АГРО»',
    edrpou: (s?.edrpou as string) || '43270258',
    legalAddress: (s?.legalAddress as string) || '',
    postalAddress: (s?.postalAddress as string) || '',
    updated: (s?.legalUpdated as string) || '',
  };
});
