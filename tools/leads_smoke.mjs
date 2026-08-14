/**
 * Перевірка, що заявка тепер справді записується — тим самим шляхом, яким
 * ходить роут /api/lead: через Payload, а не голим SQL.
 *
 * Падало саме на рівні Payload (він чіпає payload_locked_documents_rels), тому
 * успішний create доводить, що форма полагоджена. Тестовий запис одразу
 * видаляється, щоб не смітити в адмінці клієнта.
 *
 * Листа не шле навмисно: сповіщення живе в роуті, а не тут, і зайвий лист
 * замовнику нікому не потрібен.
 *
 * Запуск:  npx tsx --env-file=.env.local tools/leads_smoke.mjs
 */
process.env.PAYLOAD_DB_PUSH = 'off';
const { getPayload } = await import('payload');
const { default: config } = await import('../payload.config.ts');

const payload = await getPayload({ config });

const lead = await payload.create({
  collection: 'leads',
  data: {
    name: 'Технічна перевірка',
    phone: '+380000000000',
    comment: 'Автоматична перевірка форми після добудови схеми. Запис видаляється одразу.',
    page: '/tools/leads_smoke',
    status: 'spam',
  },
});
console.log(`✓ заявка створена: id=${lead.id}`);

await payload.delete({ collection: 'leads', id: lead.id });
console.log('✓ тестову заявку видалено');

const left = await payload.find({ collection: 'leads', limit: 5 });
console.log(`заявок у колекції лишилось: ${left.totalDocs}`);
process.exit(0);
