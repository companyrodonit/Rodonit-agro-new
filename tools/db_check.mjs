/**
 * Читання-тільки перевірка стану прод-бази: таблиці, лічильники, свіжі зміни.
 *
 * Навіщо: Payload у скриптах піднімається з push=true (бо NODE_ENV не
 * production), і drizzle починає синхронізувати схему прямо на живій базі.
 * Після будь-якого такого запуску треба переконатись, що структура ціла.
 *
 * Запуск:  node --env-file=.env.local tools/db_check.mjs
 */
import pg from 'pg';

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Немає POSTGRES_URL — запускайте з --env-file=.env.local');
  process.exit(1);
}

// Схема редизайну задається змінною; public у цій базі — таблиці попереднього
// сайту Родоніту, їх не чіпаємо навіть читанням лічильників.
const schema = process.env.PAYLOAD_DB_SCHEMA || 'public';

const client = new pg.Client({ connectionString });
await client.connect();

const { rows: schemas } = await client.query(`
  SELECT nspname FROM pg_namespace
  WHERE nspname NOT LIKE 'pg_%' AND nspname <> 'information_schema'
  ORDER BY nspname
`);
console.log(`схеми в базі: ${schemas.map((s) => s.nspname).join(', ')}`);
console.log(`дивимось схему: ${schema}\n`);

const { rows: tables } = await client.query(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema = $1 AND table_type = 'BASE TABLE'
   ORDER BY table_name`,
  [schema],
);
console.log(`таблиць у ${schema}: ${tables.length}`);

const counts = [];
for (const { table_name: name } of tables) {
  const { rows } = await client.query(`SELECT count(*)::int AS n FROM "${schema}"."${name}"`);
  counts.push([name, rows[0].n]);
}
for (const [name, n] of counts) {
  if (n) console.log(`  ${name.padEnd(34)} ${String(n).padStart(5)}`);
}
console.log(`  (порожніх таблиць: ${counts.filter(([, n]) => !n).length})`);

// Статті: що саме лежить у CMS і коли востаннє чіпали
const { rows: posts } = await client.query(
  `SELECT id, slug, published, updated_at FROM "${schema}".posts ORDER BY updated_at DESC`,
);
console.log(`\nстатей у CMS: ${posts.length}`);
for (const p of posts) {
  const when = new Date(p.updated_at).toISOString().replace('T', ' ').slice(0, 16);
  console.log(`  ${String(p.id).padStart(3)}  ${p.published ? '✓' : ' '}  ${when}  ${p.slug}`);
}

await client.end();
