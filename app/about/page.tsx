import type { Metadata } from 'next';
import { contacts, hero } from '@/lib/content';
import {
  ArrowRight,
  CountUp,
  LeadForm,
  Leaf,
  Phone,
  Reveal,
  ScrollToTop,
  SiteHeader,
} from '../interactive';
import { SiteFooter } from '../site-footer';
import { BlogHero } from '../blog/blog-ui';
import { Timeline, type Milestone } from './timeline';

const SITE = 'https://rodonit-redesign.vercel.app';

export const metadata: Metadata = {
  title: 'Про компанію | Родоніт Агро',
  description:
    'ТОВ «Родоніт Агро» (засн. 2019) — аграрний сектор України. Шість препаратів для захисту й живлення рослин, власні науково-виробничі досліди.',
  alternates: { canonical: '/about' },
};

/* Текст розбитий на смислові блоки з шести абзаців сторінки /about старого
   сайту. Дослівно, нічого не дописано — лише перерозподілено по секціях. */

const milestones: Milestone[] = [
  {
    marker: '2019',
    title: 'Заснування',
    text: 'Компанія працює з різними видами продукції, щоб закріпитися на ринку та сформувати стабільну клієнтську базу.',
  },
  {
    marker: 'Згодом',
    title: 'Фокус на аграрний сектор',
    text: 'Напрямок звужується: із широкого асортименту компанія переходить до роботи саме з агросектором.',
  },
  {
    marker: 'Сьогодні',
    title: 'Шість препаратів у портфелі',
    text: 'Усвідомлений вибір: продукти, що закривають ключові потреби аграріїв у захисті рослин і живленні — від контролю хвороб до профілактики дефіциту мікроелементів.',
  },
  {
    marker: 'Щороку',
    title: 'Науково-виробничі досліди',
    text: 'Результати дослідів ідуть у вдосконалення продуктової лінійки та рекомендацій для клієнтів.',
  },
];

/**
 * Плейсхолдер під фото. Навмисно виглядає плейсхолдером, а не «дизайном»:
 * поки замовник не дасть реальні знімки, сторінка має чесно показувати, що
 * тут буде фото, а не імітувати його градієнтом.
 */
function PhotoPlaceholder({
  label,
  className = '',
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`grid place-items-center rounded-[24px] border border-dashed border-[rgba(0,0,0,0.16)] bg-[var(--color-surface)] ${className}`}
    >
      <div className="px-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--color-dark)] text-[var(--color-accent)]">
          <Leaf size={20} />
        </span>
        <p className="mt-4 text-[13px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.4)]">
          Фото
        </p>
        <p className="mt-1 text-[14px] leading-[1.5] text-[rgba(14,15,12,0.45)]">{label}</p>
      </div>
    </div>
  );
}

const team = [
  'Керівництво',
  'Агрономічний супровід',
  'Відділ продажу',
  'Наукові досліди',
];

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ТОВ «Родоніт Агро»',
    url: SITE,
    logo: `${SITE}/og.jpg`,
    foundingDate: '2019',
    description:
      'Аграрний сектор України: препарати для захисту й живлення рослин, власні науково-виробничі досліди.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'вул. Юрія Шумського, 1б, оф. 117',
      addressLocality: 'Київ',
      postalCode: '02098',
      addressCountry: 'UA',
    },
    telephone: contacts.phones[0]?.value,
    email: contacts.email,
  };

  return (
    <div className="page-frame">
      <SiteHeader />
      <ScrollToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <BlogHero
        breadcrumbs={[{ label: 'Головна', href: '/' }, { label: 'Про компанію' }]}
        eyebrow="Про компанію"
        title="Поруч із аграрієм на кожному етапі "
        accent="технології"
        description="ТОВ «Родоніт Агро» — заснована у 2019 році, аграрний сектор України. Шість препаратів, власні науково-виробничі досліди."
      />

      {/* ═══════════════════════════════════════════ 1 — ХТО МИ */}
      <section className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20 [&>*]:min-w-0">
            <Reveal>
              <div>
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Хто ми</p>
                <h2 className="text-h3 mt-3 max-w-[560px]">
                  Компанія «Родоніт Агро» заснована у 2019 році
                </h2>
                <p className="mt-6 max-w-[560px] text-[17px] leading-[1.75] text-[rgba(14,15,12,0.7)]">
                  На початковому етапі напрямок діяльності був широким: компанія працювала з
                  різними видами продукції, щоб закріпитися на ринку та сформувати стабільну
                  клієнтську базу. З часом фокус змістився, і сьогодні основним напрямком роботи
                  «Родоніт Агро» є аграрний сектор.
                </p>
              </div>
            </Reveal>
            <Reveal delay={2}>
              <PhotoPlaceholder label="Команда або офіс — горизонтальний кадр" className="aspect-[4/3]" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 2 — ТАЙМЛАЙН */}
      <section id="timeline" className="rounded-[32px] bg-[var(--color-surface)]">
        <div className="container-page py-24">
          <Reveal>
            <p className="eyebrow text-center text-[rgba(14,15,12,0.4)]">Шлях компанії</p>
            <h2 className="text-h3 mx-auto mt-3 max-w-[620px] text-center">
              Від широкого асортименту до шести препаратів
            </h2>
          </Reveal>
          <div className="mx-auto mt-16 max-w-[980px]">
            <Timeline items={milestones} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 3 — ПОРТФЕЛЬ */}
      <section className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20 [&>*]:min-w-0">
            <Reveal>
              <PhotoPlaceholder label="Препарати в полі або на складі" className="aspect-[4/3]" />
            </Reveal>
            <Reveal delay={2}>
              <div>
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Портфель</p>
                <h2 className="text-h3 mt-3 max-w-[520px]">Шість препаратів — це усвідомлений вибір</h2>
                <p className="mt-6 max-w-[560px] text-[17px] leading-[1.75] text-[rgba(14,15,12,0.7)]">
                  Замість широкого асортименту ми зосередились на продуктах, які закривають ключові
                  потреби аграріїв у захисті рослин та живленні — від контролю хвороб до
                  профілактики дефіциту мікроелементів на основних культурах українського
                  виробництва.
                </p>
                <p className="mt-5 max-w-[560px] text-[17px] leading-[1.75] text-[rgba(14,15,12,0.7)]">
                  Препарати орієнтовані на практичний результат для аграрія: зниження хімічного
                  навантаження на продукцію та стабільність урожайності при обґрунтованій вартості
                  технології.
                </p>
                <a href="/preparaty" className="btn btn-primary mt-8">
                  Переглянути препарати <ArrowRight size={14} />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 4 — НАУКА (темна) */}
      <section className="gradient-dark on-dark rounded-[32px]">
        <div className="container-page py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 [&>*]:min-w-0">
            <Reveal>
              <div>
                <p className="eyebrow text-[var(--color-accent)]">Наука</p>
                <h2 className="text-h3 mt-3 max-w-[520px] !text-[var(--color-bg)]">
                  Наука є складовою частиною нашої роботи
                </h2>
                <p className="mt-6 max-w-[560px] text-[17px] leading-[1.75] text-[rgba(255,255,255,0.72)]">
                  Ми співпрацюємо з науковими підрозділами партнерів і постачальників, а фахівці
                  компанії мають профільну агрономічну підготовку та практичний досвід застосування
                  продуктів у польових умовах. Щороку ми закладаємо науково-виробничі досліди,
                  результати яких використовуємо для вдосконалення продуктової лінійки та
                  рекомендацій для клієнтів.
                </p>
                <p className="mt-5 max-w-[560px] text-[17px] leading-[1.75] text-[rgba(255,255,255,0.72)]">
                  Ми продовжуємо шукати нові продукти та технології, які відповідають актуальним
                  запитам аграрного виробництва в Україні.
                </p>
              </div>
            </Reveal>

            {/* Показники з /about старого сайту. На головній ми їх зняли —
                тут вони на своєму місці, це сторінка про компанію. */}
            <Reveal delay={2}>
              <div className="grid gap-6 sm:grid-cols-2">
                {hero.stats.slice(0, 2).map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col justify-center rounded-[24px] bg-[rgba(255,255,255,0.07)] p-8"
                  >
                    <p className="text-stat !text-[var(--color-bg)]">
                      <CountUp to={s.value} />
                    </p>
                    <p className="mt-2 text-[12px] font-[700] uppercase tracking-[0.04em] text-[rgba(255,255,255,0.55)]">
                      {s.label}
                    </p>
                  </div>
                ))}
                <div className="flex flex-col justify-center rounded-[24px] bg-[var(--color-accent)] p-8 sm:col-span-2">
                  <p className="text-[28px] font-[500] leading-[1.2] text-[var(--color-text)]">
                    Щороку
                  </p>
                  <p className="mt-2 text-[12px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.55)]">
                    науково-виробничі досліди
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 5 — КОМАНДА */}
      <section id="team" className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <Reveal>
            <p className="eyebrow text-[rgba(14,15,12,0.4)]">Команда</p>
            <h2 className="text-h3 mt-3 max-w-[620px]">
              Фахівці з профільною агрономічною підготовкою
            </h2>
            <p className="mt-6 max-w-[620px] text-[17px] leading-[1.7] text-[rgba(14,15,12,0.6)]">
              Блок чекає на фото й підписи від замовника — імена та посади ми не вигадуємо.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((role, i) => (
              <Reveal key={role} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <div>
                  <PhotoPlaceholder label="Портрет 4:5" className="aspect-[4/5]" />
                  <p className="mt-4 text-[17px] font-[500] text-[var(--color-dark)]">
                    Імʼя Прізвище
                  </p>
                  <p className="mt-1 text-[14px] text-[rgba(14,15,12,0.5)]">{role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 6 — CTA */}
      <section id="cta" className="rounded-[32px] bg-[var(--color-surface)]">
        <div className="container-page py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20 [&>*]:min-w-0">
            <Reveal>
              <div>
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Звʼязок</p>
                <h2 className="text-h3 mt-3 max-w-[460px]">
                  Поруч із аграрієм на кожному етапі технології
                </h2>
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
                    <span className="grid h-4 w-4 place-items-center">@</span> {contacts.email}
                  </a>
                </div>
                <p className="mt-6 text-[15px] leading-[1.6] text-[rgba(14,15,12,0.55)]">
                  вул. Юрія Шумського, 1б, оф. 117
                  <br />
                  Київ, 02098, Україна
                </p>
                <a
                  href="/distributors"
                  className="link-arrow mt-8 flex w-fit items-center gap-2 text-[15px] font-[700] text-[var(--color-dark)]"
                >
                  Де купити — офіційні дистрибʼютори <ArrowRight size={14} />
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
