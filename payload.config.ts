import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { collections } from './payload/collections';
import { globals } from './payload/globals';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// POSTGRES_URL — наше локальне ім'я (.env.local). DATABASE_URL — те, що
// створює інтеграція Neon на Vercel у 2026: перевірено на проді 11.08,
// змінної POSTGRES_URL вона більше не додає взагалі.
const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? '';
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Схема БД. На проді — звичайна public. Локально пишемо в окрему схему,
 * бо для розробки поки використовується та сама база Neon, що й у
 * попереднього сайту Родоніту: чужі таблиці в public чіпати не можна.
 */
const schemaName = process.env.PAYLOAD_DB_SCHEMA || undefined;

/**
 * Пошта. Вмикається лише коли є SMTP_PASS — без нього Payload лається
 * попередженням і пише листи в консоль, і це нормально для локальної роботи.
 *
 * Схема перевірена на сусідньому проєкті rodonit-new: adm.tools, порт 465
 * (SSL, тому secure=true). Технічна скринька reklama@ шле, Олег отримує.
 */
const smtpPass = process.env.SMTP_PASS;
const smtpUser = process.env.SMTP_USER || 'reklama@rodonit.com.ua';
const email = smtpPass
  ? nodemailerAdapter({
      defaultFromAddress: smtpUser,
      defaultFromName: 'Родоніт Агро — сайт',
      transportOptions: {
        host: process.env.SMTP_HOST || 'mail.adm.tools',
        port: Number(process.env.SMTP_PORT || 465),
        secure: Number(process.env.SMTP_PORT || 465) === 465,
        auth: { user: smtpUser, pass: smtpPass },
      },
    })
  : undefined;

export default buildConfig({
  email,
  admin: {
    user: 'users',
    meta: {
      titleSuffix: ' — Родоніт Агро',
    },
  },
  collections,
  globals,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString },
    schemaName,
    // Автоматичний push схеми лишаємо тільки для локальної розробки.
    // На проді він вішав білд попереднього проєкту на 35 хвилин: drizzle
    // впирався в інтерактивний промпт про перейменування enum і чекав
    // відповіді, якої в CI ніхто не дасть. Прод оновлюється міграціями.
    //
    // PAYLOAD_DB_PUSH=off — окремий вимикач для разових скриптів. Вони
    // піднімають Payload з NODE_ENV=development і без нього тягнуть push
    // на ту базу, на яку дивиться .env.local, тобто на живу.
    push: process.env.NODE_ENV !== 'production' && process.env.PAYLOAD_DB_PUSH !== 'off',
  }),
  plugins: blobToken
    ? [
        vercelBlobStorage({
          enabled: true,
          collections: { media: true },
          token: blobToken,
        }),
      ]
    : [],
  // Без sharp Payload не робить зменшені копії — редактор залив би
  // 6-мегабайтне фото з телефона просто у hero.
  sharp,
});
