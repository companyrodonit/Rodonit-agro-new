import { getContacts, getNav } from '@/lib/cms';
import { SiteHeader as SiteHeaderClient } from './interactive';

/**
 * Серверна обгортка хедера: тягне меню й телефон із CMS і передає у
 * клієнтський компонент (скрол-стан і бургер лишаються в interactive.tsx).
 * Сторінки імпортують SiteHeader звідси — їм не треба знати про Payload.
 */
export async function SiteHeader() {
  const [nav, contacts] = await Promise.all([getNav(), getContacts()]);
  const first = contacts.phones[0];
  return (
    <SiteHeaderClient
      nav={nav}
      phone={first ? { value: first.value, href: first.href } : undefined}
    />
  );
}
