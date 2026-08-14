/**
 * Розрив між схемою в базі і колекціями в коді (тільки читання).
 *
 * Payload оновлює схему через drizzle push у dev або через міграції на проді.
 * Якщо колекцію додали в код, а ні того, ні того не зробили — база лишається
 * старою, і падає не читання (сайт працює), а перший же запис: Payload чіпає
 * payload_locked_documents_rels, де на кожну колекцію є свій стовпчик.
 *
 * Запуск:  node --env-file=.env.local tools/db_schema_gap.mjs
 */
import pg from 'pg';

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
const schema = process.env.PAYLOAD_DB_SCHEMA || 'public';
if (!connectionString) {
  console.error('Немає POSTGRES_URL — запускайте з --env-file=.env.local');
  process.exit(1);
}

// Колекції з payload/collections.ts, у порядку оголошення.
const COLLECTIONS = [
  'users', 'leads', 'media', 'categories', 'products',
  'cultures', 'solutions', 'distributors', 'blog-categories', 'posts',
];

const client = new pg.Client({ connectionString });
await client.connect();

const { rows: tables } = await client.query(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema = $1 AND table_type = 'BASE TABLE'`,
  [schema],
);
const have = new Set(tables.map((t) => t.table_name));

console.log(`схема: ${schema}\n`);
console.log('колекція            таблиця   locked_rels');
let gaps = 0;

const { rows: lockedCols } = await client.query(
  `SELECT column_name FROM information_schema.columns
   WHERE table_schema = $1 AND table_name = 'payload_locked_documents_rels'`,
  [schema],
);
const lockedHave = new Set(lockedCols.map((c) => c.column_name));

for (const slug of COLLECTIONS) {
  const table = slug.replace(/-/g, '_');
  const relCol = `${table}_id`;
  const okTable = have.has(table);
  const okRel = lockedHave.has(relCol);
  if (!okTable || !okRel) gaps += 1;
  console.log(
    `${slug.padEnd(20)}${(okTable ? 'є' : 'НЕМАЄ').padEnd(10)}${okRel ? 'є' : 'НЕМАЄ'}`,
  );
}

console.log(`\nрозривів: ${gaps}`);
console.log(`міграцій у payload_migrations: ${
  (await client.query(`SELECT count(*)::int AS n FROM "${schema}".payload_migrations`)).rows[0].n
}`);

await client.end();
