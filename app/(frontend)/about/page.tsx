import type { Metadata } from 'next';
import { getContacts, getHero } from '@/lib/cms';
import { ArrowRight, CountUp, LeadForm, Mail, Phone, Reveal, ScrollToTop } from '../interactive';
import { SiteHeader } from '../site-header';
import { SiteFooter } from '../site-footer';
import { BlogHero } from '../blog/blog-ui';
import { Timeline, type Milestone } from './timeline';

import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Про компанію Родоніт Агро — препарати для агробізнесу',
  description:
    'ТОВ «Родоніт Агро» працює з 2019 року: шість препаратів для захисту й живлення рослин, власні науково-виробничі досліди, мережа офіційних дистрибʼюторів.',
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

/* Тільки підтверджені замовником люди — імена й посади не вигадуємо,
   а заглушку замість людини відвідувачу не показуємо. Нову людину
   додавати сюди разом із фото 4:5 у public/about. */
const team: { role: string; name: string; degree?: string; photo: string }[] = [
  {
    role: 'Директор',
    name: 'Олег Дубина',
    photo: '/about/oleh-dubyna.jpg',
  },
  {
    role: 'Агрономічний супровід',
    name: 'Матусевич Галина',
    degree: 'кандидат сільськогосподарських наук',
    photo: '/about/halyna.jpg',
  },
];

export const revalidate = 300;

export default async function Page() {
  const [contacts, hero] = await Promise.all([getContacts(), getHero()]);
  /* Організацію описує site-schema.tsx (рендериться в layout) під @id `#org`.
     Тут лише дописуємо те, що стосується саме цієї сторінки, і посилаємось на
     той самий @id — інакше Google бачить два незалежні описи однієї компанії. */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: `${SITE}/about`,
    name: 'Про компанію Родоніт Агро',
    inLanguage: 'uk-UA',
    mainEntity: {
      '@id': `${SITE}/#org`,
      description:
        'Аграрний сектор України: препарати для захисту й живлення рослин, власні науково-виробничі досліди.',
    },
    isPartOf: { '@id': `${SITE}/#website` },
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
              {/* Фото від клієнта: директор Олег Дубина з лінійкою препаратів,
                  вертикальний кадр 3:4 (банери по боках обрізані). Пробували
                  ще горизонтальний 4:3 і вирізану постать на повний зріст —
                  клієнт обрав саме цей варіант. */}
              <img
                src="/about/director.jpg"
                alt="Олег Дубина, директор «Родоніт Агро», з препаратами компанії"
                width={900}
                height={1200}
                className="mx-auto aspect-[3/4] w-full max-w-[420px] rounded-[24px] object-cover"
              />
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
              {/* Колаж зібрано зі студійних фото самих препаратів
                  (public/products, прозорий фон) — два рівні без вертикального
                  перекриття, щоб усі шість читались. Скрипт складання:
                  scratchpad/collage2.py, фон = --color-surface. */}
              <img
                src="/about/portfolio.jpg"
                alt="Шість препаратів Родоніт Агро: Нордокс 75 WG, Верно СаВ, Верно FG, Гідролип, Міра РК, Сільвер Мікс"
                width={1200}
                height={900}
                className="aspect-[4/3] w-full rounded-[24px] object-cover"
              />
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
          </Reveal>
          {/* Показуємо тільки людей, яких підтвердив замовник. Порожніх
              карток-заглушок тут більше немає — «Імʼя Прізвище» і «Портрет 4:5»
              бачив кінцевий відвідувач. */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <Reveal key={m.role} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <div>
                  <img
                    src={m.photo}
                    alt={`${m.name} — ${m.role}, «Родоніт Агро»`}
                    width={480}
                    height={600}
                    className="aspect-[4/5] w-full rounded-[24px] object-cover"
                  />
                  <p className="mt-4 text-[17px] font-[500] text-[var(--color-dark)]">{m.name}</p>
                  <p className="mt-1 text-[14px] text-[rgba(14,15,12,0.5)]">{m.role}</p>
                  {m.degree && (
                    <p className="mt-1 text-[13px] leading-[1.45] text-[rgba(14,15,12,0.4)]">
                      {m.degree}
                    </p>
                  )}
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
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[17px] font-[500] text-[var(--color-dark)] hover:text-[color:#03594C]"
                    >
                      <Phone size={16} className="shrink-0" /> <span className="whitespace-nowrap">{p.value}</span>
                      <span className="text-[13px] font-[400] text-[rgba(14,15,12,0.45)]">
                        — {p.label}
                      </span>
                    </a>
                  ))}
                  <a
                    href={`mailto:${contacts.email}`}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[17px] font-[500] text-[var(--color-dark)] hover:text-[color:#03594C]"
                  >
                    <Mail size={16} className="shrink-0" /> <span className="whitespace-nowrap">{contacts.email}</span>
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
