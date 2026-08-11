/**
 * Перевірка SMTP: спершу лише авторизація (verify), нікому нічого не шлемо.
 * З аргументом — надсилає один тестовий лист на вказану адресу.
 *
 *   npx tsx --env-file=<env> scripts/check-smtp.ts
 *   npx tsx --env-file=<env> scripts/check-smtp.ts комусь@пошта
 */
import nodemailer from 'nodemailer';

async function run() {
  const host = process.env.SMTP_HOST || 'mail.adm.tools';
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  console.log(`SMTP ${user} @ ${host}:${port}`);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transport.verify();
    console.log('Авторизація пройшла — сервер приймає наші креди.');
  } catch (e) {
    console.error('Авторизація НЕ пройшла:', (e as Error).message);
    process.exit(1);
  }

  const to = process.argv[2];
  if (!to) {
    console.log('Тестовий лист не надсилаю (адресу не передано).');
    process.exit(0);
  }

  const info = await transport.sendMail({
    from: `"Родоніт Агро — сайт" <${user}>`,
    to,
    subject: 'Перевірка відправки з нового сайту',
    text: 'Якщо ви це читаєте — сайт уміє надсилати листи. Це технічна перевірка.',
  });
  console.log('Надіслано:', info.messageId, '| прийнято:', info.accepted.join(', '));
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
