import type { Metadata } from 'next';
import { contacts } from '@/lib/content';
import { legalEntity } from '@/lib/legal';
import { ArrowRight, LeadForm, Phone, Reveal, ScrollToTop, SiteHeader } from '../interactive';
import { SiteFooter } from '../site-footer';
import { SocialIcon } from '../social-icons';
import { BlogHero } from '../blog/blog-ui';

import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Контакти | Родоніт Агро',
  description:
    "Зв'яжіться з нами: телефони відділу продажу, email, поштова адреса. Консультація спеціаліста з підбору препаратів.",
  alternates: { canonical: '/contacts' },
};

const tel = (v: string) => `tel:${v.replace(/[^\d+]/g, '')}`;

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: legalEntity.name,
    alternateName: legalEntity.shortName,
    url: SITE,
    email: contacts.email,
    telephone: contacts.allPhones[0].numbers,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'вул. Юрія Шумського, 1б, оф. 117',
      addressLocality: 'Київ',
      postalCode: '02098',
      addressCountry: 'UA',
    },
    sameAs: contacts.socials.map((s) => s.href),
  };

  return (
    <div className="page-frame">
      <SiteHeader />
      <ScrollToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <BlogHero
        breadcrumbs={[{ label: 'Головна', href: '/' }, { label: 'Контакти' }]}
        eyebrow="Контакти"
        title="Готові проконсультувати з "
        accent="будь-яких питань"
        description="Зателефонуйте у відділ продажу або залиште заявку — консультант підбере схему під вашу культуру."
      />

      {/* id="cta" — сюди веде кнопка «Консультація» з хедера/футера на
          сторінках, де власної CTA-секції немає (див. CtaLink). */}
      <section id="cta" className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 [&>*]:min-w-0">
            <Reveal>
              <div>
                {/* Телефонів сім — групуємо за відділами, як на старому сайті,
                    інакше це просто стовпчик цифр без сенсу. */}
                {contacts.allPhones.map((g) => (
                  <div key={g.group} className="mb-10">
                    <p className="eyebrow text-[rgba(14,15,12,0.4)]">{g.group}</p>
                    <div className="mt-4 space-y-2">
                      {g.numbers.map((n) => (
                        <a
                          key={n}
                          href={tel(n)}
                          className="flex items-center gap-3 text-[18px] font-[500] text-[var(--color-dark)] hover:text-[color:#03594C]"
                        >
                          <Phone size={16} /> {n}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mb-10">
                  <p className="eyebrow text-[rgba(14,15,12,0.4)]">Email</p>
                  <a
                    href={`mailto:${contacts.email}`}
                    className="mt-4 flex w-fit items-center gap-3 text-[18px] font-[500] text-[var(--color-dark)] hover:text-[color:#03594C]"
                  >
                    <span className="grid h-4 w-4 place-items-center">@</span> {contacts.email}
                  </a>
                </div>

                <div className="mb-10">
                  <p className="eyebrow text-[rgba(14,15,12,0.4)]">Поштова адреса</p>
                  <p className="mt-4 text-[17px] leading-[1.6] text-[rgba(14,15,12,0.75)]">
                    вул. Юрія Шумського, 1б, оф. 117
                    <br />
                    Київ, 02098, Україна
                  </p>
                </div>

                <div>
                  <p className="eyebrow text-[rgba(14,15,12,0.4)]">Соціальні мережі</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {contacts.socials.map((s) => (
                      <a
                        key={s.name}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-full bg-[var(--color-surface)] py-2.5 pl-4 pr-5 text-[15px] text-[var(--color-text)] transition-colors hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)]"
                      >
                        <SocialIcon name={s.name} />
                        {s.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={2}>
              <div className="lg:sticky lg:top-28">
                <LeadForm />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Реквізити — потрібні і для довіри, і для легальних сторінок,
          які на них посилаються. Дані з ЄДР, не з голови. */}
      <section className="rounded-[32px] bg-[var(--color-surface)]">
        <div className="container-page py-24">
          <Reveal>
            <p className="eyebrow text-[rgba(14,15,12,0.4)]">Реквізити</p>
            <h2 className="text-h3 mt-3 max-w-[560px]">{legalEntity.name}</h2>
          </Reveal>
          <Reveal delay={1}>
            <dl className="mt-10 grid max-w-[900px] gap-6 sm:grid-cols-2">
              {[
                ['Код ЄДРПОУ', legalEntity.edrpou],
                ['Дата реєстрації', legalEntity.registered],
                ['Юридична адреса', legalEntity.legalAddress],
                ['Поштова адреса', legalEntity.postalAddress],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[20px] bg-[var(--color-bg)] p-6">
                  <dt className="text-[12px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.4)]">
                    {k}
                  </dt>
                  <dd className="mt-2 text-[16px] leading-[1.6] text-[var(--color-text)]">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={2}>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="/privacy" className="btn btn-outline">
                Політика конфіденційності
              </a>
              <a href="/terms" className="btn btn-outline">
                Умови використання
              </a>
              <a href="/distributors" className="btn btn-primary">
                Де купити <ArrowRight size={14} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
