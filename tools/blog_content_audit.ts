/**
 * Аудит тіла статей блогу: шукає сліди краулу старого сайту.
 *
 * Що ловить:
 *  - розсипані таблиці (абзаци-«труби» `| комірка |`);
 *  - короткі абзаци, які насправді були підзаголовками чи лід-ін;
 *  - абзаци з залишками розмітки, порожні блоки й порожні пункти списків.
 *
 * Запуск:  npx tsx tools/blog_content_audit.ts
 */
import { parseMarker, posts } from '../lib/posts';

const SHORT = 46;

let problems = 0;

for (const post of posts) {
  const found: string[] = [];
  let pipes = 0;

  post.blocks.forEach((block, i) => {
    if (block.type === 'list') {
      if (!block.items.length) found.push(`#${i} порожній список`);
      block.items.forEach((it, j) => {
        if (!it.trim()) found.push(`#${i}.${j} порожній пункт`);
      });
      return;
    }
    const text = block.text ?? '';
    if (!text.trim()) {
      found.push(`#${i} порожній ${block.type}`);
      return;
    }
    if (block.type !== 'paragraph') return;

    if (/^\|.*\|$/.test(text.trim())) {
      pipes += 1;
      return;
    }
    // Маркер-дизайн-блок — не звичайний текст: у нього свій синтаксис,
    // а таблиця легально містить переноси рядків.
    if (text.startsWith('[[')) {
      if (!parseMarker(text)) found.push(`#${i} маркер не розібрався: «${text.slice(0, 60)}…»`);
      return;
    }
    if (text.length < SHORT) {
      found.push(`#${i} короткий абзац (${text.length}): «${text}»`);
    }
    if (/\n|\s{3,}|&nbsp;|<[a-z]/i.test(text)) {
      found.push(`#${i} залишки розмітки: «${text.slice(0, 60)}…»`);
    }
  });

  if (pipes) found.unshift(`розсипана таблиця: ${pipes} абзаців-труб`);

  const stats = post.blocks.reduce<Record<string, number>>((acc, b) => {
    acc[b.type] = (acc[b.type] ?? 0) + 1;
    return acc;
  }, {});
  const line = `${post.slug.slice(0, 50).padEnd(52)} `
    + `h=${String(stats.heading ?? 0).padStart(2)} `
    + `p=${String(stats.paragraph ?? 0).padStart(2)} `
    + `l=${String(stats.list ?? 0).padStart(2)}`;
  console.log(found.length ? `${line}  ⚠ ${found.length}` : line);
  for (const f of found) console.log(`      ${f}`);
  problems += found.length;
}

console.log(`\nстатей: ${posts.length}, зауважень: ${problems}`);
