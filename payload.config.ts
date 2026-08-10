import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { collections } from './payload/collections';
import { globals } from './payload/globals';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.POSTGRES_URL ?? '';
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Схема БД. На проді — звичайна public. Локально пишемо в окрему схему,
 * бо для розробки поки використовується та сама база Neon, що й у
 * попереднього сайту Родоніту: чужі таблиці в public чіпати не можна.
 */
const schemaName = process.env.PAYLOAD_DB_SCHEMA || undefined;

export default buildConfig({
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
    push: process.env.NODE_ENV !== 'production',
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
