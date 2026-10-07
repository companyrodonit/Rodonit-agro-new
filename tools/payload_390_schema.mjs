/**
 * Схема під Payload 3.90 (security-реліз 18.09.2026) — без drizzle push і без migrate:create.
 *
 * Чому окремий скрипт: на проді push вимкнено, міграцій у проєкті немає, а
 * `payload migrate:create` без знімка генерує «від нуля» (див. CLAUDE.md).
 * Перелік змін узятий із сухого прогону drizzle pushSchema проти обох баз
 * (прод public і dev redesign дали ІДЕНТИЧНИЙ диф, 07.10.2026):
 *   - users.reset_password_requested_at — нове поле 3.90 (тротлінг forgot-password);
 *   - media._objectkey — поле plugin-cloud-storage 3.90 (видно лише з BLOB-токеном);
 *   - DEFAULT 0 для order / login_attempts — лише значення за замовчуванням.
 * Тільки додавання, без втрати даних; сумісно зі старим кодом (3.87), тому
 * застосовується ДО деплою нового коду. Ідемпотентно, в одній транзакції.
 *
 * Запуск (сухий прогін за замовчуванням, нічого не пише):
 *   node --env-file=.env.local tools/payload_390_schema.mjs            # dev, схема з PAYLOAD_DB_SCHEMA
 *   node tools/payload_390_schema.mjs --env .env.prod-db               # прод, схема public
 *   ... --apply                                                         # виконати
 */
import fs from 'node:fs';
import pg from 'pg';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const envIdx = args.indexOf('--env');
let url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
let schema = process.env.PAYLOAD_DB_SCHEMA || 'public';
if (envIdx > -1) {
  const t = fs.readFileSync(args[envIdx + 1], 'utf8');
  url = /^DATABASE_URL=(.+)$/m.exec(t)?.[1].trim().replace(/^"|"$/g, '');
  schema = 'public';
}
if (!url) throw new Error('Нема рядка підключення');

const q = (id) => `"${id.replace(/"/g, '""')}"`;
const T = (t) => `${q(schema)}.${q(t)}`;
const steps = [
  ...['cultures', 'distributors', 'blog_categories', 'categories', 'solutions', 'products'].map((t) => ({
    what: `${t}.order DEFAULT 0`, table: t, column: 'order',
    sql: `ALTER TABLE ${T(t)} ALTER COLUMN "order" SET DEFAULT 0`,
  })),
  { what: 'users.login_attempts DEFAULT 0', table: 'users', column: 'login_attempts',
    sql: `ALTER TABLE ${T('users')} ALTER COLUMN "login_attempts" SET DEFAULT 0` },
  { what: 'users.reset_password_requested_at (нова колонка)', table: 'users', column: 'reset_password_requested_at', add: true,
    sql: `ALTER TABLE ${T('users')} ADD COLUMN IF NOT EXISTS "reset_password_requested_at" timestamp(3) with time zone` },
  // plugin-cloud-storage 3.90 додає приховане поле _objectKey у кожну колекцію
  // зі сховищем (getFields.js). Плагін вмикається лише з BLOB_READ_WRITE_TOKEN,
  // тому сухий прогін drizzle без токена (локально) цю колонку не показав —
  // знайшов Codex-рев'ю 07.10. Назва саме «_objectkey» (так її генерує drizzle,
  // перевірено сухим прогоном з токеном), не «_object_key».
  { what: 'media._objectkey (нова колонка, Blob)', table: 'media', column: '_objectkey', add: true,
    sql: `ALTER TABLE ${T('media')} ADD COLUMN IF NOT EXISTS "_objectkey" varchar` },
];

const c = new pg.Client({ connectionString: url, ...(apply ? {} : { options: '-c default_transaction_read_only=on' }) });
await c.connect();
const host = new URL(url).hostname;
console.log(`${apply ? 'APPLY' : 'DRY-RUN (read-only)'} · ${host} · схема ${schema}`);

const col = async (table, column) =>
  (await c.query(
    'select column_default from information_schema.columns where table_schema=$1 and table_name=$2 and column_name=$3',
    [schema, table, column],
  )).rows[0];

const todo = [];
for (const s of steps) {
  const cur = await col(s.table, s.column);
  if (s.add ? cur : cur?.column_default === '0') console.log(`  ✓ вже є: ${s.what}`);
  else if (!s.add && !cur) throw new Error(`Нема колонки ${s.table}.${s.column} — схема не та, зупиняюсь`);
  else { console.log(`  → треба: ${s.what}`); todo.push(s); }
}
if (!todo.length) { console.log('Нічого робити — схема вже під 3.90.'); await c.end(); process.exit(0); }
if (!apply) { console.log(`\n${todo.length} змін. Для виконання — додай --apply.`); await c.end(); process.exit(0); }

try {
  await c.query('BEGIN');
  await c.query("SET LOCAL lock_timeout = '5s'");
  for (const s of todo) await c.query(s.sql);
  await c.query('COMMIT');
  console.log(`✅ Застосовано ${todo.length} змін (одна транзакція).`);
} catch (e) {
  await c.query('ROLLBACK').catch(() => {});
  console.error('❌ Відкат транзакції:', e.message);
  process.exitCode = 1;
}
await c.end();
