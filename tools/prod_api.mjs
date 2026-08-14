/**
 * Робота з прод-CMS через Payload REST API — без доступу до бази.
 *
 * Навіщо: прод крутиться на ВЛАСНІЙ базі клієнта (team Rodonit, змінна
 * DATABASE_URL у Vercel), а .env.local дивиться в базу розробки — стару Neon
 * від rodonit-new, схема `redesign`. Це різні бази з однаковим сідом, тому
 * плутанина не помітна доти, доки не почнеш писати. Vercel CLI прив'язаний до
 * старого проєкту й доступу до env клієнта не має.
 *
 * REST API адмінки цю прірву обходить: логінимось тим самим користувачем, що
 * й в /admin, і працюємо з колекціями по HTTP.
 *
 * Креди беремо з оточення, у файл їх не пишемо:
 *   $env:RODONIT_ADMIN_EMAIL / $env:RODONIT_ADMIN_PASSWORD
 *
 * Запуск:  node tools/prod_api.mjs whoami
 *          node tools/prod_api.mjs posts
 */
const BASE = process.env.RODONIT_BASE || 'https://rodonit.com.ua';
const email = process.env.RODONIT_ADMIN_EMAIL;
const password = process.env.RODONIT_ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Задайте RODONIT_ADMIN_EMAIL і RODONIT_ADMIN_PASSWORD в оточенні');
  process.exit(1);
}

export async function login() {
  const r = await fetch(`${BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) {
    console.error(`логін не пройшов: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
    process.exit(1);
  }
  const { token, user } = await r.json();
  return { token, user };
}

const cmd = process.argv[2] ?? 'whoami';
const { token, user } = await login();
console.log(`✓ залогінено: ${user.email} (id=${user.id})`);

if (cmd === 'posts') {
  const r = await fetch(`${BASE}/api/posts?limit=100&depth=1&sort=-date`, {
    headers: { Authorization: `JWT ${token}` },
  });
  const data = await r.json();
  console.log(`\nстатей у прод-CMS: ${data.totalDocs} (у порядку, який віддає sort=-date)\n`);
  console.log('id  дата         рубрика  обкладинка  блоків маркерів  excerpt  slug');
  for (const p of data.docs) {
    const date = p.date ? String(p.date).slice(0, 10) : 'НЕМАЄ    ';
    const cover = p.cover?.filename
      ? (p.cover.filename.includes('covers') || p.cover.alt?.includes('плашка') ? 'плашка' : 'фото')
      : 'НЕМАЄ';
    const markers = (p.blocks ?? []).filter((b) => (b.text ?? '').startsWith('[[')).length;
    const kinds = new Set((p.blocks ?? []).map((b) => {
      const m = /^\[\[([a-z]+)/.exec(b.text ?? '');
      return m ? m[1] : null;
    }).filter(Boolean));
    console.log(
      `${String(p.id).padStart(2)}  ${date}  `
      + `${(p.category?.slug ?? '?').padEnd(7)}  ${cover.padEnd(10)}  `
      + `${String(p.blocks?.length ?? 0).padStart(6)} ${String(markers).padStart(8)}  `
      + `${String(p.excerpt?.length ?? 0).padStart(7)}  ${p.slug.slice(0, 40)}`
      + (kinds.size ? `\n      блоки: ${[...kinds].join(', ')}` : ''),
    );
  }
  console.log('\nобкладинки детально:');
  for (const p of data.docs) {
    console.log(`  ${String(p.id).padStart(2)}  ${p.cover?.filename ?? '— НЕМАЄ —'}`
      + `${p.cover?.width ? `  ${p.cover.width}x${p.cover.height}` : ''}`);
  }
}

if (cmd === 'leads') {
  // Чи існує колекція заявок на проді — та сама діра, що була в базі розробки
  const r = await fetch(`${BASE}/api/leads?limit=1`, {
    headers: { Authorization: `JWT ${token}` },
  });
  console.log(`\n/api/leads → HTTP ${r.status}`);
  console.log((await r.text()).slice(0, 300));
}

/**
 * Заливка статті з lib/posts.ts у прод-CMS.
 *
 * Той самий сенс, що в scripts/publish-post.ts, але по HTTP: до бази прода
 * ми не дотягуємось, а адмінка доступна. Без --apply — сухий прогін.
 */
if (cmd === 'publish') {
  const slug = process.argv[3];
  const apply = process.argv.includes('--apply');
  const publish = process.argv.includes('--publish');
  const { posts } = await import('../lib/posts.ts');
  const post = posts.find((p) => p.slug === slug);
  if (!post) {
    console.error(`Статті «${slug}» немає в lib/posts.ts`);
    process.exit(1);
  }

  const auth = { Authorization: `JWT ${token}` };
  const json = { ...auth, 'Content-Type': 'application/json' };
  const api = async (path, init = {}) => {
    const r = await fetch(`${BASE}/api/${path}`, init);
    const text = await r.text();
    if (!r.ok) throw new Error(`HTTP ${r.status} на ${path}: ${text.slice(0, 300)}`);
    return text ? JSON.parse(text) : null;
  };

  const cats = await api(`blog-categories?where[slug][equals]=${post.categorySlug}&limit=1`,
    { headers: auth });
  if (!cats.docs.length) throw new Error(`немає рубрики ${post.categorySlug}`);

  const found = await api(`posts?where[slug][equals]=${post.slug}&limit=1&depth=0`,
    { headers: auth });
  const current = found.docs[0];
  console.log(`\nСтаття: ${post.title}`);
  console.log(`  у прод-CMS: ${current ? `є, id=${current.id}` : 'НЕМАЄ — буде створена'}`);
  if (current) console.log(`  блоків: ${current.blocks?.length ?? 0} → ${post.blocks.length}`);

  // Обкладинка. У наявної статті її не чіпаємо: у CMS вона вже прикріплена, а
  // імʼя файлу в Blob не збігається з нашим — пошук її не знайде і ми заллємо
  // дубль тієї самої картинки. Замінити свідомо — прапорець --cover.
  const forceCover = process.argv.includes('--cover');
  let coverId;
  if (post.cover && current?.cover && !forceCover) {
    console.log('  обкладинка вже прикріплена в CMS — не чіпаємо (--cover щоб замінити)');
  } else if (post.cover && forceCover && apply) {
    const { readFile } = await import('node:fs/promises');
    const filename = post.cover.split('/').pop();
    const buf = await readFile(new URL(`../public${post.cover}`, import.meta.url));
    const form = new FormData();
    form.append('file', new Blob([buf], { type: 'image/jpeg' }), filename);
    form.append('_payload', JSON.stringify({ alt: post.title }));
    const up = await api('media', { method: 'POST', headers: auth, body: form });
    coverId = up.doc.id;
    console.log(`  обкладинка ЗАМІНЕНА: id=${coverId}, ${up.doc.width}x${up.doc.height}`);
  } else if (post.cover) {
    const filename = post.cover.split('/').pop();
    const media = await api(`media?where[filename][equals]=${filename}&limit=1`, { headers: auth });
    if (media.docs.length) {
      coverId = media.docs[0].id;
      console.log(`  обкладинка вже в медіа: id=${coverId}`);
    } else if (!apply) {
      console.log(`  обкладинка буде залита: ${filename}`);
    } else {
      const { readFile } = await import('node:fs/promises');
      const buf = await readFile(new URL(`../public${post.cover}`, import.meta.url));
      const form = new FormData();
      form.append('file', new Blob([buf], { type: 'image/jpeg' }), filename);
      form.append('_payload', JSON.stringify({ alt: post.title }));
      const up = await api('media', { method: 'POST', headers: auth, body: form });
      coverId = up.doc.id;
      console.log(`  обкладинка залита: id=${coverId}`);
    }
  }

  const data = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: cats.docs[0].id,
    ...(coverId && { cover: coverId }),
    ...(post.date && { date: new Date(post.date).toISOString() }),
    ...(post.author && { author: post.author }),
    ...(post.seoTitle && { seoTitle: post.seoTitle }),
    ...(post.metaDescription && { metaDescription: post.metaDescription }),
    readMinutes: post.readMinutes,
    tags: post.tags.map((t) => ({ label: t.label, slug: t.slug, kind: t.kind })),
    blocks: post.blocks.map((b) =>
      b.type === 'list'
        ? { kind: 'list', items: b.items.map((text) => ({ text })) }
        : { kind: b.type, text: b.text }),
    published: current ? current.published : publish,
  };

  if (!apply) {
    console.log('\nСухий прогін. Щоб записати — додайте --apply');
    process.exit(0);
  }

  const res = current
    ? await api(`posts/${current.id}`,
      { method: 'PATCH', headers: json, body: JSON.stringify(data) })
    : await api('posts', { method: 'POST', headers: json, body: JSON.stringify(data) });
  console.log(`✓ ${current ? 'оновлено' : 'створено'} id=${res.doc.id}, `
    + `published=${res.doc.published}`);
  console.log(`  ${BASE}/blog/${post.slug}`);
}
