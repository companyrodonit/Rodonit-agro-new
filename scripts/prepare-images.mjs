/**
 * Готові webp-копії картинок ДО запуску сайту (запускається в prebuild/predev).
 *
 * Навіщо (05.11.2026): next/image на Vercel стискає кожну картинку «на льоту»
 * при першому запиті. Сайт має малий трафік, тож майже кожен перший показ
 * препарату чи статті — це холодне стискання 0,4–3,5 с, і весь цей час на
 * сторінці порожня сіра картка. Кеш Vercel до того ж ділиться за точним
 * заголовком Accept браузера, тому «прогріти» його наперед не вийде.
 *
 * Тому стискаємо самі під час збірки: пакшоти (PNG ≤ 600 px) — одна webp у
 * повному розмірі, фото (обкладинки статей) — 800, 1000 і 1600 px. Файли лягають у
 * public/_img/ з хешем вмісту в імені (можна кешувати назавжди), а карта
 * «вихідна адреса → готові файли» — у lib/img-manifest.json. Сайт бере
 * готовий файл через lib/fast-image.ts.
 *
 * Чого тут немає — того сайт не ламає: картинка, яку Олег залив у CMS ПІСЛЯ
 * збірки, просто йде старим шляхом через next/image до наступного деплою.
 * Будь-яка помилка тут — попередження, а не зламана збірка.
 */
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'public', '_img');
const manifestPath = path.join(root, 'lib', 'img-manifest.json');

const IMAGE_RE = /\.(png|jpe?g|webp)$/i;
// Payload кладе зменшені копії поруч як «назва-640x480.jpg» — вони нам не потрібні.
const PAYLOAD_SIZE_RE = /-\d+x\d+\.[a-z]+$/i;
// 1000 — для карток блогу (кадр ~500 px на екрані, ×2 на ретину): без неї
// картка брала 1600 і важила ~200 КБ замість ~90 (обкладинки на проді 2400 px).
const PHOTO_WIDTHS = [800, 1000, 1600];

/** Джерела: [адреса, як її бачить сайт; функція, що дає байти]. */
async function collectSources() {
  const sources = [];

  // 1. Медіа з CMS. На Vercel — зі сховища Blob, локально — з public/uploads.
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    try {
      const { list } = await import('@vercel/blob');
      let cursor;
      do {
        const page = await list({ token, cursor, limit: 1000 });
        for (const b of page.blobs) {
          const name = path.posix.basename(b.pathname);
          if (!IMAGE_RE.test(name) || PAYLOAD_SIZE_RE.test(name)) continue;
          sources.push({
            key: `/api/media/file/${name}`,
            name,
            load: async () => Buffer.from(await (await fetch(b.url)).arrayBuffer()),
          });
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
    } catch (e) {
      console.warn(`[prepare-images] Blob недоступний, медіа CMS підуть через next/image: ${e.message}`);
    }
  } else {
    for (const name of await safeReaddir(path.join(root, 'public', 'uploads'))) {
      if (!IMAGE_RE.test(name) || PAYLOAD_SIZE_RE.test(name)) continue;
      sources.push({ key: `/api/media/file/${name}`, name, load: () => readFile(path.join(root, 'public', 'uploads', name)) });
    }
  }

  // 2. Статичні запасні картинки з репозиторію.
  for (const dir of ['products', 'blog']) {
    for (const name of await safeReaddir(path.join(root, 'public', dir))) {
      if (!IMAGE_RE.test(name)) continue;
      sources.push({ key: `/${dir}/${name}`, name, load: () => readFile(path.join(root, 'public', dir, name)) });
    }
  }
  return sources;
}

async function safeReaddir(dir) {
  try {
    return await readdir(dir);
  } catch {
    return [];
  }
}

async function processOne(src) {
  const buf = await src.load();
  const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8);
  const base = src.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]/gi, '-');
  const meta = await sharp(buf).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const isPhoto = /\.jpe?g$/i.test(src.name) || width > 1000;

  const targets = isPhoto ? PHOTO_WIDTHS.filter((w) => w < width).concat(width <= 1600 ? [width] : []) : [width];
  const files = {};
  for (const w of [...new Set(targets)]) {
    const file = `${base}-${hash}-${w}.webp`;
    await sharp(buf)
      .resize({ width: w, withoutEnlargement: true })
      // 86 для фото: обкладинки статей часто вже стиснуті месенджером, і нижча
      // якість поверх цього дає видимі артефакти на великому кадрі.
      .webp({ quality: 86, alphaQuality: 90, effort: 5 })
      .toFile(path.join(outDir, file));
    files[w] = `/_img/${file}`;
  }
  return { width, height, files };
}

async function main() {
  const started = Date.now();
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const sources = await collectSources();
  const manifest = {};
  let failed = 0;
  const queue = [...sources];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (queue.length) {
        const src = queue.shift();
        try {
          manifest[src.key] = await processOne(src);
        } catch (e) {
          failed++;
          console.warn(`[prepare-images] пропущено ${src.key}: ${e.message}`);
        }
      }
    }),
  );

  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(manifestPath, JSON.stringify(sorted, null, 1) + '\n');
  console.log(
    `[prepare-images] ${Object.keys(sorted).length} картинок готово` +
      (failed ? `, ${failed} пропущено` : '') +
      ` за ${((Date.now() - started) / 1000).toFixed(1)} с`,
  );
}

main().catch(async (e) => {
  // Збірку не валимо: без карти сайт просто працює через next/image, як раніше.
  console.warn(`[prepare-images] не вдалося: ${e.message}`);
  await writeFile(manifestPath, '{}\n').catch(() => {});
});
