import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

/**
 * Приймає заявку з форми «Отримати консультацію».
 *
 * Раніше форма нікуди не відправляла: чекала секунду і малювала «дякуємо».
 * Тепер заявка лягає в колекцію leads — її видно в адмінці навіть якщо
 * пошта не налаштована або лист пішов у спам.
 *
 * Валідація дублює клієнтську навмисно: на клієнтську покладатися не можна,
 * запит прилетить і в обхід форми.
 */
export async function POST(req: Request) {
  let body: { name?: unknown; phone?: unknown; comment?: unknown; page?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 2000) : '';
  const page = typeof body.page === 'string' ? body.page.slice(0, 200) : '';

  // Телефон приймаємо в будь-якому форматі, але хочемо мінімум 9 цифр —
  // менше не буває навіть у міського номера без коду.
  const digits = phone.replace(/\D/g, '');
  if (name.length < 2 || digits.length < 9) {
    return NextResponse.json({ error: 'Заповніть імʼя і телефон' }, { status: 422 });
  }

  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: 'leads',
      data: { name: name.slice(0, 200), phone: phone.slice(0, 50), comment, page, status: 'new' },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Логуємо, але користувачу не показуємо кишки.
    console.error('lead: не вдалося зберегти', e);
    return NextResponse.json({ error: 'Не вдалося надіслати. Зателефонуйте нам.' }, { status: 500 });
  }
}
