import { getContacts } from '@/lib/cms';
import { legalEntity } from '@/lib/legal';
import { SITE } from '@/lib/site';

/**
 * Загальносайтова розмітка: хто ми (Organization) і що це за сайт (WebSite).
 *
 * Рендериться в layout, тобто на КОЖНІЙ сторінці — і саме тому має `@id`.
 * До цього Organization описувався окремо на /about і на /contacts, без
 * ідентифікатора: для Google це два різні описи однієї назви, і він не
 * зобовʼязаний схлопнути їх в одну сутність. Тепер канонічний опис один,
 * а сторінки лише посилаються на `#org`.
 *
 * SearchAction свідомо НЕ додано: пошуку по сайту не існує (на /preparaty
 * є фільтр у межах сторінки, це не те саме). SearchAction без робочого
 * ендпоінта — обіцянка, яку Google перевіряє і не виконує.
 */
export async function SiteSchema() {
  const contacts = await getContacts();

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE}/#org`,
      name: legalEntity.name,
      alternateName: legalEntity.shortName,
      url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/apple-icon.png`, width: 180, height: 180 },
      email: contacts.email,
      // Один основний номер. Решта відділу — у contactPoint нижче: Google
      // очікує в telephone скаляр, і масив із шести номерів читає непередбачувано.
      telephone: contacts.phones[0]?.value,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'вул. Юрія Шумського, 1б, оф. 117',
        addressLocality: 'Київ',
        postalCode: '02098',
        addressCountry: 'UA',
      },
      foundingDate: '2019-10-04',
      taxID: legalEntity.edrpou,
      contactPoint: contacts.allPhones.map((g) => ({
        '@type': 'ContactPoint',
        contactType: g.group,
        telephone: g.numbers,
        areaServed: 'UA',
        availableLanguage: ['uk'],
      })),
      sameAs: contacts.socials.map((s) => s.href),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: SITE,
      name: legalEntity.shortName,
      inLanguage: 'uk-UA',
      publisher: { '@id': `${SITE}/#org` },
    },
  ];

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
