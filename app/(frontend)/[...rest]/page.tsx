import { notFound } from 'next/navigation';

/**
 * Ловець невідомих адрес.
 *
 * У проєкті два route group — (frontend) і (payload) — і кожна має свій root
 * layout. Для адреси, яка не збігається з жодним маршрутом, Next не може
 * вирішити, чий layout брати, тому мовчки віддає власну вбудовану заглушку
 * «This page could not be found» замість нашої not-found.tsx. Та сама
 * родина граблів, що й з іконками та robots у route group.
 *
 * Цей catch-all «заводить» будь-яку невідому адресу всередину (frontend) —
 * і далі вже штатно спрацьовує app/(frontend)/not-found.tsx з правильним
 * layout, хедером і кодом 404. Реальні маршрути специфічніші за [...rest],
 * тож він їх не перехоплює: ні сторінки, ні /admin, ні route-хендлери
 * robots.txt / sitemap.xml / llms.txt.
 *
 * ⚠️ Не видаляти. Після переїзду на rodonit.com.ua сюди приходитиме
 * найбільший потік 404 — 101 стара адреса інфотеки.
 */
export default function CatchAll() {
  notFound();
}
