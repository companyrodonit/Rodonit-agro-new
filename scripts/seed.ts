/**
 * Сід: переливає ВЕСЬ хардкод із lib/ у Payload, включно з картинками.
 *
 * Ідемпотентний: перед заливкою чистить контентні колекції (users не чіпає),
 * тому його можна ганяти повторно після правок у lib/ — поки джерелом правди
 * ще є код. Після здачі сайту джерело правди — адмінка, і сід більше не ганяти:
 * він зітре те, що Олег наредагував.
 *
 * Запуск:  npm run seed          (бере .env.local)
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { getPayload, type Payload } from 'payload';
import config from '../payload.config';

import {
  hero, products as productCards, categories, problems, about, trust,
  distributors, cta, contacts, nav, footerColumns, delivery, packaging,
} from '../lib/content';
import { productDetails } from '../lib/products-detail';
import { culturePages } from '../lib/cultures';
import { solutions } from '../lib/solutions';
import { blogCategories, posts } from '../lib/posts';
import { legalEntity, legalUpdated } from '../lib/legal';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = (p: string) => path.resolve(dirname, '..', 'public', p.replace(/^\//, ''));

async function uploadMedia(payload: Payload, filePath: string, alt: string): Promise<number> {
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    filePath,
  });
  return doc.id as number;
}

const t = (text: string) => ({ text });

async function clear(payload: Payload, slugs: string[]) {
  for (const slug of slugs) {
    await payload.delete({ collection: slug as never, where: { id: { exists: true } } });
    console.log(`  очищено: ${slug}`);
  }
}

async function run() {
  const payload = await getPayload({ config });
  console.log('Payload піднято, схема:', process.env.PAYLOAD_DB_SCHEMA || 'public');

  // Порядок: спершу залежні (posts, products), потім довідники, потім media.
  await clear(payload, [
    'posts', 'solutions', 'products',
    'blog-categories', 'cultures', 'categories', 'distributors', 'media',
  ]);

  /* ------------------------------------------------ Категорії препаратів */
  const catId: Record<string, number> = {};
  for (const [i, c] of categories.entries()) {
    const doc = await payload.create({
      collection: 'categories',
      data: { name: c.name, slug: c.slug, description: c.description, order: i },
    });
    catId[c.slug] = doc.id as number;
  }
  console.log(`категорії: ${categories.length}`);

  /* ---------------------------------------------------------- Препарати */
  const prodId: Record<string, number> = {};
  for (const [i, d] of productDetails.entries()) {
    const card = productCards.find((p) => p.slug === d.slug);
    const imageId = await uploadMedia(payload, pub(`/products/${d.slug}.png`), d.name);
    const doc = await payload.create({
      collection: 'products',
      data: {
        slug: d.slug,
        name: d.name,
        shortName: d.shortName,
        category: catId[d.categorySlug],
        tagline: d.tagline,
        description: card?.description ?? d.tagline,
        image: imageId,
        packaging: (packaging[d.slug] ?? []).map(t),
        intro: d.intro.map(t),
        keySpecs: d.keySpecs,
        specs: d.specs.map((s) => ({ title: s.title, body: s.body.map(t) })),
        advantages: d.advantages.map(t),
        usage: d.usage.map(t),
        mixing: d.mixing.map(t),
        compatibility: d.compatibility.map(t),
        storage: d.storage.map(t),
        regulations: d.regulations,
        problems: d.problems.map((p) => ({ title: p.title, body: p.body.map(t) })),
        metaDescription: d.metaDescription,
        featured: card?.featured ?? false,
        order: i,
      },
    });
    prodId[d.slug] = doc.id as number;
  }
  console.log(`препарати: ${productDetails.length}`);

  /* ----------------------------------------------------------- Культури */
  for (const [i, c] of culturePages.entries()) {
    await payload.create({
      collection: 'cultures',
      data: {
        name: c.name,
        slug: c.slug,
        intro: c.intro,
        products: c.products
          .filter((p) => prodId[p.slug])
          .map((p) => ({ product: prodId[p.slug], rate: p.rate ?? undefined })),
        order: i,
      },
    });
  }
  console.log(`культури: ${culturePages.length}`);

  /* ------------------------------------------------------------ Рішення */
  for (const [i, s] of solutions.entries()) {
    await payload.create({
      collection: 'solutions',
      data: {
        title: s.title,
        slug: s.slug,
        lead: s.lead,
        paragraphs: s.paragraphs.map(t),
        products: s.productSlugs.map((slug) => prodId[slug]).filter(Boolean),
        order: i,
      },
    });
  }
  console.log(`рішення: ${solutions.length}`);

  /* ------------------------------------------------------ Дистрибʼютори */
  for (const [i, d] of distributors.entries()) {
    const logoId = await uploadMedia(payload, pub(d.logo), `Логотип ${d.name}`);
    await payload.create({
      collection: 'distributors',
      data: {
        name: d.name,
        logo: logoId,
        direction: d.direction,
        role: d.role,
        phones: d.phones.map((number) => ({ number })),
        address: 'address' in d ? (d as { address?: string }).address : undefined,
        order: i,
      },
    });
  }
  console.log(`дистрибʼютори: ${distributors.length}`);

  /* ---------------------------------------------------------------- Блог */
  const blogCatId: Record<string, number> = {};
  for (const [i, c] of blogCategories.entries()) {
    const doc = await payload.create({
      collection: 'blog-categories',
      data: { name: c.name, slug: c.slug, description: c.description, order: i },
    });
    blogCatId[c.slug] = doc.id as number;
  }
  for (const p of posts) {
    const coverId = p.cover
      ? await uploadMedia(payload, pub(p.cover), p.title)
      : undefined;
    await payload.create({
      collection: 'posts',
      data: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        category: blogCatId[p.categorySlug],
        cover: coverId,
        date: p.date,
        readMinutes: p.readMinutes,
        tags: p.tags,
        blocks: p.blocks.map((b) =>
          b.type === 'list'
            ? { kind: 'list' as const, items: b.items.map(t) }
            : { kind: b.type, text: b.text },
        ),
        published: true,
      },
    });
  }
  console.log(`блог: ${blogCategories.length} рубрики, ${posts.length} статей`);

  /* ------------------------------------------------------ Глобал: Home */
  const heroBgId = await uploadMedia(
    payload, pub('/hero/00-STARYI-fon.jpg'), 'Сад на світанку — фон першого екрана',
  );
  await payload.updateGlobal({
    slug: 'home',
    data: {
      eyebrow: hero.eyebrow,
      titleBefore: hero.titleBefore,
      titleAccent: hero.titleAccent,
      subtitle: hero.subtitle,
      background: heroBgId,
      stats: hero.stats.map((s) => ({ value: String(s.value), label: s.label })),
      primaryCta: hero.primaryCta,
      secondaryCta: hero.secondaryCta,
      aboutEyebrow: about.eyebrow,
      aboutTitle: about.title,
      aboutText: about.text,
      aboutLink: about.link,
      trust: trust.map((c) => ({
        title: c.label,
        text: c.tooltip,
        icon: (c.icon === 'safe-class' ? 'safe' : c.icon) as
          'certificate' | 'organic' | 'micron' | 'safe',
      })),
      ctaEyebrow: cta.eyebrow,
      ctaTitle: cta.title,
      ctaSubtitle: cta.subtitle,
      ctaSubmit: cta.submit,
      ctaLegal: cta.legal,
    },
  });
  console.log('глобал home: записано');

  /* -------------------------------------------------- Глобал: Settings */
  await payload.updateGlobal({
    slug: 'settings',
    data: {
      company: contacts.company,
      phones: contacts.phones,
      allPhones: contacts.allPhones.map((g) => ({
        group: g.group,
        numbers: g.numbers.map((number) => ({ number })),
      })),
      email: contacts.email,
      address: contacts.address,
      socials: contacts.socials.map((s) => ({
        name: s.name.toLowerCase() as 'facebook' | 'instagram' | 'youtube' | 'tiktok',
        href: s.href,
      })),
      nav,
      footerColumns: footerColumns.map((c) => ({ title: c.title, links: c.links })),
      legalName: legalEntity.name,
      edrpou: legalEntity.edrpou,
      legalAddress: legalEntity.legalAddress,
      postalAddress: legalEntity.postalAddress,
      legalUpdated,
      delivery,
    },
  });
  console.log('глобал settings: записано');

  console.log('\nСід завершено без помилок.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
