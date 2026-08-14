/**
 * Добудовує в базі те, чого бракує для колекції Leads.
 *
 * Передісторія: колекцію заявок додали в код, але схему до бази не докотили —
 * drizzle push вимкнений на проді, а міграцій ніхто не ганяв. Наслідок видно
 * не одразу: читання працює (сайт живий), а перший же запис падає, бо Payload
 * чіпає payload_locked_documents_rels, де на кожну колекцію є свій стовпчик.
 * Через це і форма «Отримати консультацію» повертала помилку, і скрипт
 * заливки статей не міг оновити пост.
 *
 * Операція ТІЛЬКИ додає: тип, таблицю, три індекси, стовпчик і зовнішній ключ.
 * Нічого не перейменовує, не змінює й не видаляє — наявні дані поза грою.
 * Кожен крок ідемпотентний (IF NOT EXISTS), тож повторний запуск безпечний.
 *
 * DDL узятий дослівно з міграції, яку згенерував сам Payload
 * (`payload migrate:create`), — щоб типи й індекси збіглися з тим, що очікує
 * ORM. Саму міграцію застосовувати не можна: без знімка попереднього стану
 * вона згенерувалась «від нуля» і намагалась створити всю схему заново.
 *
 * Запуск:
 *   node --env-file=.env.local tools/fix_leads_schema.mjs           (сухий прогін)
 *   node --env-file=.env.local tools/fix_leads_schema.mjs --apply
 */
import pg from 'pg';

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
const schema = process.env.PAYLOAD_DB_SCHEMA || 'public';
const apply = process.argv.includes('--apply');

if (!connectionString) {
  console.error('Немає POSTGRES_URL — запускайте з --env-file=.env.local');
  process.exit(1);
}

const steps = [
  {
    name: 'тип enum_leads_status',
    check: `SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
            WHERE t.typname = 'enum_leads_status' AND n.nspname = $1`,
    sql: `CREATE TYPE "${schema}"."enum_leads_status"
          AS ENUM('new', 'in-progress', 'done', 'spam')`,
  },
  {
    name: 'таблиця leads',
    check: `SELECT 1 FROM information_schema.tables
            WHERE table_schema = $1 AND table_name = 'leads'`,
    sql: `CREATE TABLE "${schema}"."leads" (
            "id" serial PRIMARY KEY NOT NULL,
            "name" varchar NOT NULL,
            "phone" varchar NOT NULL,
            "comment" varchar,
            "status" "${schema}"."enum_leads_status" DEFAULT 'new',
            "page" varchar,
            "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
            "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
          )`,
  },
  {
    name: 'індекс leads_updated_at_idx',
    check: `SELECT 1 FROM pg_indexes WHERE schemaname = $1 AND indexname = 'leads_updated_at_idx'`,
    sql: `CREATE INDEX "leads_updated_at_idx" ON "${schema}"."leads" USING btree ("updated_at")`,
  },
  {
    name: 'індекс leads_created_at_idx',
    check: `SELECT 1 FROM pg_indexes WHERE schemaname = $1 AND indexname = 'leads_created_at_idx'`,
    sql: `CREATE INDEX "leads_created_at_idx" ON "${schema}"."leads" USING btree ("created_at")`,
  },
  {
    name: 'стовпчик payload_locked_documents_rels.leads_id',
    check: `SELECT 1 FROM information_schema.columns
            WHERE table_schema = $1 AND table_name = 'payload_locked_documents_rels'
              AND column_name = 'leads_id'`,
    sql: `ALTER TABLE "${schema}"."payload_locked_documents_rels"
          ADD COLUMN "leads_id" integer`,
  },
  {
    name: 'зовнішній ключ на leads',
    check: `SELECT 1 FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE n.nspname = $1 AND c.conname = 'payload_locked_documents_rels_leads_fk'`,
    sql: `ALTER TABLE "${schema}"."payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_leads_fk"
          FOREIGN KEY ("leads_id") REFERENCES "${schema}"."leads"("id")
          ON DELETE cascade ON UPDATE no action`,
  },
  {
    name: 'індекс payload_locked_documents_rels_leads_id_idx',
    check: `SELECT 1 FROM pg_indexes
            WHERE schemaname = $1 AND indexname = 'payload_locked_documents_rels_leads_id_idx'`,
    sql: `CREATE INDEX "payload_locked_documents_rels_leads_id_idx"
          ON "${schema}"."payload_locked_documents_rels" USING btree ("leads_id")`,
  },
];

const client = new pg.Client({ connectionString });
await client.connect();
console.log(`схема: ${schema}`);
console.log(apply ? 'РЕЖИМ: ЗАПИС\n' : 'РЕЖИМ: сухий прогін, нічого не пишемо\n');

let todo = 0;
// Одна транзакція: або схема добудовується цілком, або лишається як була.
if (apply) await client.query('BEGIN');
try {
  for (const step of steps) {
    const { rows } = await client.query(step.check, [schema]);
    if (rows.length) {
      console.log(`  вже є     ${step.name}`);
      continue;
    }
    todo += 1;
    if (!apply) {
      console.log(`  БРАКУЄ    ${step.name}`);
      continue;
    }
    await client.query(step.sql);
    console.log(`  ✓ додано  ${step.name}`);
  }
  if (apply) await client.query('COMMIT');
} catch (e) {
  if (apply) await client.query('ROLLBACK');
  console.error('\nвідкотили транзакцію:', e.message);
  await client.end();
  process.exit(1);
}

console.log(
  todo === 0
    ? '\nсхема вже повна, робити нічого'
    : apply
      ? `\nготово: додано ${todo}`
      : `\nбракує кроків: ${todo}. Щоб застосувати — додайте --apply`,
);
await client.end();
