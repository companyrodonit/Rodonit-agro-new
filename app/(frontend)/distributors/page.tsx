import type { Metadata } from 'next';
import { getContacts, getDistributorFilters, getDistributors } from '@/lib/cms';
import { ArrowRight, DistributorList, LeadForm, Mail, Phone, Reveal, ScrollToTop } from '../interactive';
import { SiteHeader } from '../site-header';
import { SiteFooter } from '../site-footer';

export const metadata: Metadata = {
  title: 'Дистрибʼютори | Родоніт Агро',
  description:
    'Офіційні дистрибʼютори Родоніт Агро по регіонах і напрямках: садівництво, технічні культури, овочівництво, центральний регіон.',
};

/* Сторінка зібрана з наявних блоків, нічого нового не малювалось:
   DistributorList — той самий, що в секції 8 головної (фільтри + картки),
   LeadForm і контакти — ті самі, що в CTA головної та сторінок препаратів.
   Контент узято зі старого rodonit-new.vercel.app/distributors; він уже
   лежав у lib/content.ts, бо ця ж четвірка партнерів показується на головній. */

export const revalidate = 300;

export default async function Page() {
  const [contacts, distributors, distributorFilters] = await Promise.all([
    getContacts(), getDistributors(), getDistributorFilters(),
  ]);
  return (
    <div className="page-frame">
      <SiteHeader />
      <ScrollToTop />

      {/* ═══════════════════════════════════════════ 1 — ЗАГОЛОВОК */}
      <section id="top" className="gradient-dark on-dark rounded-b-[32px] pt-[104px]">
        <div className="container-page pb-20 pt-8">
          <nav aria-label="Хлібні крихти" className="text-[14px] text-[rgba(255,255,255,0.45)]">
            <a href="/" className="hover:text-[var(--color-bg)]">
              Головна
            </a>
            {' / '}
            <span className="text-[var(--color-bg)]">Дистрибʼютори</span>
          </nav>

          <Reveal>
            <p className="eyebrow mt-10 text-[var(--color-accent)]">Де купити</p>
            <h1 className="text-h2 mt-4 max-w-[900px] !text-[var(--color-bg)]">
              Офіційні партнери <em className="accent-word">у вашому регіоні</em>
            </h1>
            <p className="mt-6 max-w-[620px] text-[17px] leading-[1.6] text-[rgba(255,255,255,0.7)]">
              Препарати Родоніт Агро постачають чотири офіційні дистрибʼютори. Оберіть напрямок —
              покажемо партнера, який працює з вашим сегментом.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 2 — СПИСОК ПАРТНЕРІВ */}
      <section id="distributors" className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <DistributorList items={distributors} filters={distributorFilters} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 3 — ЯК СТАТИ ПАРТНЕРОМ */}
      {/* Окремий якір, бо id секції вже зайнятий під #partnership (лишаємо —
          на нього могли посилатися ззовні). Тут LeadForm, тож «Консультація»
          з хедера/футера скролить сюди, а не веде на /contacts (див. CtaLink).
          Відступ під фіксований хедер дає глобальне [id]{scroll-margin-top}. */}
      <div id="cta" aria-hidden="true" />
      <section id="partnership" className="rounded-[32px] bg-[var(--color-surface)]">
        <div className="container-page py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 [&>*]:min-w-0">
            <Reveal>
              <div>
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Співпраця</p>
                <h2 className="text-h3 mt-3 max-w-[520px]">
                  Хочете представляти наші препарати у своєму регіоні?
                </h2>
                <p className="mt-6 max-w-[520px] text-[17px] leading-[1.7] text-[rgba(14,15,12,0.7)]">
                  Ми розширюємо дистрибуцію по областях і напрямках. Залиште контакт — обговоримо
                  умови, обсяги та підтримку по агрономії.
                </p>
                <div className="mt-8 space-y-3">
                  {contacts.phones.map((p) => (
                    <a
                      key={p.value}
                      href={p.href}
                      className="flex items-center gap-3 text-[17px] font-[500] text-[var(--color-dark)] hover:text-[color:#03594C]"
                    >
                      <Phone size={16} /> {p.value}
                      <span className="text-[13px] font-[400] text-[rgba(14,15,12,0.45)]">
                        — {p.label}
                      </span>
                    </a>
                  ))}
                  <a
                    href={`mailto:${contacts.email}`}
                    className="flex items-center gap-3 text-[17px] font-[500] text-[var(--color-dark)] hover:text-[color:#03594C]"
                  >
                    <Mail size={16} /> {contacts.email}
                  </a>
                </div>
                <a
                  href="/preparaty"
                  className="link-arrow mt-8 flex w-fit items-center gap-2 text-[15px] font-[700] text-[var(--color-dark)]"
                >
                  Подивитись портфель препаратів <ArrowRight size={14} />
                </a>
              </div>
            </Reveal>
            <Reveal delay={2}>
              <LeadForm />
            </Reveal>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
