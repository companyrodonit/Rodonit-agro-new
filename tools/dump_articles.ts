/**
 * Вивантажує тіла статей у читабельний текст — щоб писати під них FAQ,
 * спираючись на факти зі статті, а не на памʼять.
 *
 * Запуск:  npx tsx tools/dump_articles.ts > articles.txt
 */
import { posts } from '../lib/posts';

const lines: string[] = [];

for (const post of posts) {
  lines.push('='.repeat(78));
  lines.push(`${post.slug} | ${post.categorySlug} | блоків: ${post.blocks.length}`);
  lines.push(`ЗАГОЛОВОК: ${post.title}`);
  lines.push('');
  for (const block of post.blocks) {
    if (block.type === 'heading') lines.push(`## ${block.text}`);
    else if (block.type === 'list') lines.push(block.items.map((i) => `  • ${i}`).join('\n'));
    else lines.push(block.text);
  }
  lines.push('');
}

process.stdout.write(lines.join('\n'));
