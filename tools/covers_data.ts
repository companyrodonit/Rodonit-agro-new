/**
 * Віддає JSON зі статтями, чия обкладинка — згенерована плашка (/blog/covers/).
 * Потрібен tools/make_covers.py, щоб дані для плашок бралися з posts.ts,
 * а не дублювалися в скрипті: змінився заголовок в одному місці — і плашка
 * перегенерується з новим.
 *
 * Запуск:  npx tsx tools/covers_data.ts
 */
import { posts } from '../lib/posts';

const data = posts
  .filter((p) => p.cover?.startsWith('/blog/covers/'))
  .map((p) => ({
    file: p.cover!.replace('/blog/covers/', ''),
    title: p.title,
    category: p.category,
    readMinutes: p.readMinutes,
    tags: p.tags.map((t) => t.label),
  }));

process.stdout.write(JSON.stringify(data, null, 2));
