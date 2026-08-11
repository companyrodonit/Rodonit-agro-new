/**
 * Створює адміністратора, якщо users порожня. Окремо від сіду навмисно:
 * сід ідемпотентний і users не чіпає, а цей скрипт безпечно ганяти повторно —
 * на наявному користувачі він просто виходить.
 *
 * Запуск (env беремо з файлу, який передали в --env-file):
 *   npx tsx --env-file=<env-файл> scripts/create-admin.ts <email> <пароль>
 */
import { getPayload } from 'payload';
import config from '../payload.config';

async function run() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Використання: create-admin.ts <email> <пароль>');
    process.exit(1);
  }

  const payload = await getPayload({ config });
  const existing = await payload.find({ collection: 'users', limit: 1 });
  if (existing.totalDocs > 0) {
    console.log(`users вже має ${existing.totalDocs} запис(ів) — нічого не роблю.`);
    process.exit(0);
  }

  await payload.create({ collection: 'users', data: { email, password } });
  console.log(`Адміністратора ${email} створено.`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
