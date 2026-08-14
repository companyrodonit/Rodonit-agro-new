/**
 * Заливка ОДНІЄЇ статті з lib/posts.ts у Payload.
 *
 * Навіщо окремо від seed.ts: сід чистить колекції цілком і після здачі сайту
 * зітер би все, що редактор наробив в адмінці. Цей скрипт чіпає рівно одну
 * статтю — створює її або переписує тіло, решту колекцій не торкає.
 *
 * За замовчуванням це СУХИЙ ПРОГІН: показує, що саме зміниться, і нічого не
 * пише. Запис — тільки з явним --apply.
 *
 * Запуск:
 *   npx tsx --env-file=.env.local scripts/publish-post.ts <slug>
 *   npx tsx --env-file=.env.local scripts/publish-post.ts <slug> --apply
 *   npx tsx --env-file=.env.local scripts/publish-post.ts <slug> --apply --publish
 *
 * Без --publish стаття лягає чернеткою (published: false): getPosts бере лише
 * published, тому на сайті вона не зʼявиться, поки її не подивляться в адмінці.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { getPayload, type Payload } from 'payload';
import { posts, type PostBlock } from '../lib/posts';

// ВАЖЛИВО, до імпорту конфіга. Скрипт піднімає Payload з NODE_ENV=development,
// а з ним вмикається drizzle push — і схему починає синхронізувати прямо на
// базі з .env.local, тобто на живій. Нам треба лише читати й писати рядки.
process.env.PAYLOAD_DB_PUSH = 'off';
const { default: config } = await import('../payload.config');

const dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = (p: string) => path.resolve(dirname, '..', 'public', p.replace(/^\//, ''));

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const apply = args.includes('--apply');
const publish = args.includes('--publish');

/** Блок статті у формі колекції Posts (kind + text | items). */
const toCmsBlock = (b: PostBlock) =>
  b.type === 'list'
    ? { kind: 'list' as const, items: b.items.map((text) => ({ text })) }
    : { kind: b.type, text: b.text };

/** Короткий підпис блоку для дифу — щоб у консолі було видно, що змінилось. */
const preview = (b: { kind?: string; type?: string; text?: string; items?: unknown }) => {
  const kind = b.kind ?? b.type;
  const text =
    kind === 'list'
      ? `${(b.items as unknown[])?.length ?? 0} пунктів`
      : (b.text ?? '').replace(/\s+/g, ' ').slice(0, 68);
  return `${(kind ?? '?').padEnd(9)} ${text}`;
};

/**
 * Обкладинка. Файл із public/ заливається в media один раз: якщо документ із
 * таким же alt уже є, беремо його — інакше кожен повторний прогін плодив би
 * копії картинки у Vercel Blob.
 */
async function ensureCover(payload: Payload, cover: string, alt: string) {
  const filename = cover.split('/').pop()!;
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  });
  if (existing.docs.length) {
    console.log(`  обкладинка вже в медіа: id=${existing.docs[0].id} (${filename})`);
    return existing.docs[0].id as number;
  }
  if (!apply) {
    console.log(`  обкладинка буде залита: ${filename}`);
    return undefined;
  }
  const doc = await payload.create({ collection: 'media', data: { alt }, filePath: pub(cover) });
  console.log(`  обкладинка залита: id=${doc.id} (${filename})`);
  return doc.id as number;
}

async function run() {
  if (!slug) {
    console.error('Вкажіть слаг статті. Доступні:');
    for (const p of posts) console.error(`  ${p.slug}`);
    process.exit(1);
  }
  const post = posts.find((p) => p.slug === slug);
  if (!post) {
    console.error(`Статті «${slug}» немає в lib/posts.ts`);
    process.exit(1);
  }

  const payload = await getPayload({ config });
  console.log(`Payload піднято, схема: ${process.env.PAYLOAD_DB_SCHEMA || 'public'}`);
  console.log(apply ? '\nРЕЖИМ: ЗАПИС\n' : '\nРЕЖИМ: сухий прогін, нічого не пишемо\n');

  const cats = await payload.find({
    collection: 'blog-categories',
    where: { slug: { equals: post.categorySlug } },
    limit: 1,
  });
  if (!cats.docs.length) {
    console.error(`У CMS немає рубрики «${post.categorySlug}» — створіть її в адмінці.`);
    process.exit(1);
  }
  const categoryId = cats.docs[0].id as number;

  const found = await payload.find({
    collection: 'posts',
    where: { slug: { equals: post.slug } },
    limit: 1,
  });
  const current = found.docs[0];

  console.log(`Стаття: ${post.title}`);
  console.log(`  у CMS: ${current ? `є, id=${current.id}` : 'НЕМАЄ — буде створена'}`);

  const blocks = post.blocks.map(toCmsBlock);
  if (current) {
    const old = (current.blocks as { kind: string; text?: string; items?: unknown }[]) ?? [];
    console.log(`  блоків: ${old.length} → ${blocks.length}`);
    const max = Math.max(old.length, blocks.length);
    let shown = 0;
    for (let i = 0; i < max; i += 1) {
      const a = old[i] ? preview(old[i]) : '—';
      const b = blocks[i] ? preview(blocks[i]) : '—';
      if (a === b) continue;
      if (shown === 0) console.log('\n  що зміниться (було → стане):');
      console.log(`   #${String(i).padStart(2)} було : ${a}`);
      console.log(`       стане: ${b}`);
      shown += 1;
    }
    if (!shown) console.log('  тіло статті збігається — змін немає');
    console.log('');
  }

  const coverId = post.cover ? await ensureCover(payload, post.cover, post.title) : undefined;

  const data = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: categoryId,
    ...(coverId && { cover: coverId }),
    ...(post.date && { date: new Date(post.date).toISOString() }),
    ...(post.author && { author: post.author }),
    ...(post.seoTitle && { seoTitle: post.seoTitle }),
    ...(post.metaDescription && { metaDescription: post.metaDescription }),
    readMinutes: post.readMinutes,
    tags: post.tags.map((t) => ({ label: t.label, slug: t.slug, kind: t.kind })),
    blocks,
    // Наявній статті статус не чіпаємо: якщо вона вже опублікована, правка
    // тіла не має її ховати. Новій ставимо чернетку, поки не сказали інакше.
    published: current ? (current.published as boolean) : publish,
  };

  if (!apply) {
    console.log('Сухий прогін завершено. Щоб записати — додайте --apply');
    process.exit(0);
  }

  if (current) {
    await payload.update({ collection: 'posts', id: current.id, data });
    console.log(`✓ оновлено id=${current.id}, published=${data.published}`);
  } else {
    const doc = await payload.create({ collection: 'posts', data });
    console.log(`✓ створено id=${doc.id}, published=${data.published}`);
  }
  console.log(`  /blog/${post.slug}`);
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
