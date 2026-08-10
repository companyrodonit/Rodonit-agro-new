import Image from 'next/image';
import {
  getAbout,
  getCategories,
  getContacts,
  getCta,
  getCulturesIndex,
  getDistributorFilters,
  getDistributors,
  getHero,
  getNews,
  getProblems,
  getProductImages,
  getProducts,
  getTrust,
} from '@/lib/cms';
import { ArrowRight, CategoryIconFor, DistributorList, HeroBackground, LeadForm, Mail, Phone, ProblemSolution, ProductSlider, Reveal, ScrollToTop, Tooltip } from './interactive';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';
import { TrustArtFor } from './trust-art';

/** ISR: правки в адмінці зʼявляються на сайті протягом ~5 хвилин. */
export const revalidate = 300;

/* ------------------------------------------------------------- helpers */

function SectionHead({
  eyebrow,
  title,
  subtitle,
  center = false,
  onDark = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  onDark?: boolean;
}) {
  return (
    <div className={center ? 'text-center' : ''}>
      <p className={`eyebrow ${onDark ? 'text-[var(--color-accent)]' : 'text-[rgba(14,15,12,0.4)]'}`}>{eyebrow}</p>
      <h2 className={`text-h3 mt-3 ${onDark ? '!text-[var(--color-bg)]' : ''} ${center ? 'mx-auto max-w-[820px]' : 'max-w-[820px]'}`}>
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-[17px] leading-[1.6] ${center ? 'mx-auto' : ''} max-w-[640px] ${
            onDark ? 'text-[rgba(255,255,255,0.65)]' : 'text-[rgba(14,15,12,0.6)]'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* Портфель — рівна сітка без featured-карток: 6 препаратів лягають у 3×2 без дірок. */

/* ================================================================= PAGE */

export default async function Page() {
  const [hero, categories, cultures, about, trust, cta, contacts, news] = await Promise.all([
    getHero(), getCategories(), getCulturesIndex(), getAbout(),
    getTrust(), getCta(), getContacts(), getNews(),
  ]);
  const [products, productImages, problems, distributors, distributorFilters] = await Promise.all([
    getProducts(), getProductImages(), getProblems(), getDistributors(), getDistributorFilters(),
  ]);
  return (
    /* Зовнішня рамка 6px по колу сторінки (правка замовника 28.07).
       Хедер і кнопка «нагору» лишаються поза нею — вони fixed і рахуються
       від вікна, а не від цієї обгортки. */
    <div className="page-frame">
      <SiteHeader />
      <ScrollToTop />

      {/* ═══════════════════════════════════════════ 1 — HERO
          Композиція за макетом від 28.07: текстовий блок ліворуч угорі,
          кнопки притиснуті до низу першого екрана.
          Статистику (2019 / 6 / 22) із героя прибрано на вимогу замовника.
          Пізніше того ж дня її зняли і з «Про компанію», тож на головній її
          більше немає ніде — hero.stats у lib/content.ts лежить без ужитку. */}
      <section
        id="top"
        /* Висота — менше з двох: висота вікна або 750px. min-h, а не h:
           на вузьких екранах контент може бути вищим за 750, і жорстка
           висота його б обрізала. */
        className="relative isolate flex min-h-[min(100svh,750px)] flex-col overflow-hidden rounded-b-[32px] bg-[var(--color-dark)]"
      >
        <HeroBackground src={hero.background} />

        {/* w-full обов'язковий: .container-page має margin-inline:auto, і як
            флекс-елемент секції він інакше стискається під ширину контенту й
            сам себе центрує. Поки в рядку стояла статистика, контент розпирав
            його до 1280 і це не було видно — після її зняття текст поїхав у
            центр екрана. */}
        <div className="on-dark container-page relative flex w-full flex-1 flex-col justify-between pb-14 pt-[120px] text-[var(--color-bg)] sm:pb-24 sm:pt-[150px]">
          {/* 780px — щоб «Технології підвищення» стало в один рядок: на стелі
              76px воно займає 756px. Вужче — і рядок ламається посередині. */}
          <div className="max-w-[780px]">
            <p className="eyebrow text-[var(--color-accent)]">{hero.eyebrow}</p>
            <h1 className="text-h1 mt-6 !text-[var(--color-bg)]">
              {hero.titleBefore}
              <em className="accent-word">{hero.titleAccent}</em>
            </h1>
            <p className="text-body-l mt-8 max-w-[480px] text-[rgba(255,255,255,0.85)]">{hero.subtitle}</p>
          </div>

          <div className="mt-16 flex flex-wrap gap-4">
            <a href="#portfolio" className="btn btn-primary">
              {hero.primaryCta} <ArrowRight size={14} />
            </a>
            <a href="#cta" className="btn btn-glass">
              {hero.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 2 — ПОРТФЕЛЬ */}
      <section id="portfolio" className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHead
                eyebrow="Портфель"
                title="Препарати"
                subtitle="Шість продуктів, що працюють від обробки насіння до захисту врожаю."
              />
              <a
                href="/preparaty"
                className="link-arrow flex items-center gap-2 text-[12px] font-[800] uppercase tracking-[0.04em] text-[var(--color-dark)]"
              >
                Подивитись усі препарати <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>

          <div className="mt-12">
            <ProductSlider products={products} images={productImages} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 3 — КАТЕГОРІЇ */}
      <section id="categories" className="rounded-[32px] bg-[var(--color-surface)]">
        <div className="container-page py-24">
          <Reveal>
            <SectionHead eyebrow="Категорії" title="6 препаратів у 4 категоріях для всіх основних культур" />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                {/* Іконка вгорі, текст притиснутий до низу, між ними повітря —
                    за макетом від 28.07. mt-auto стоїть на заголовку, а не на
                    лічильнику: інакше вільний простір ділився б між ними
                    навпіл і текст висів би посеред картки.
                    min-height лише від sm: на одноколонковій мобільній сітці
                    картка широка, контенту в ній мало, і 400px давали голу
                    діру між іконкою та заголовком. */}
                <a
                  href={`/preparaty?cat=${c.slug}`}
                  className="card-hover flex h-full flex-col rounded-[24px] bg-[var(--color-bg)] p-8 sm:min-h-[400px]"
                >
                  {/* Коло 44 → 56px: на 44 іконка в 20px губилась і читалась
                      зеленою плямою. Той самий розмір, що в картці «Рішення». */}
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-dark)] text-[var(--color-accent)]">
                    <CategoryIconFor name={c.icon} />
                  </span>
                  <h3 className="mt-auto pt-10 text-[19px] font-[500] text-[var(--color-dark)]">{c.name}</h3>
                  {/* Мінімум 3 рядки (14px × 1.6 × 3): описи різної довжини, і
                      без цього заголовки й лічильники стояли на різній висоті
                      в сусідніх картках. Це підлога, довший текст її розсуне. */}
                  <p className="mt-3 min-h-[67px] text-[14px] leading-[1.6] text-[rgba(14,15,12,0.6)]">
                    {c.description}
                  </p>
                  <span className="pt-6 text-[12px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.4)]">
                    {c.count}
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 4 — КУЛЬТУРИ */}
      <section id="cultures" className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <Reveal>
            <SectionHead
              eyebrow="Культури"
              title="Виберіть за культурою"
              subtitle="Регламенти застосування прописані під кожну культуру — оберіть свою й побачите препарати з нормами."
              center
            />
          </Reveal>
          <Reveal delay={1}>
            <div className="mx-auto mt-12 flex max-w-[1000px] flex-wrap justify-center gap-3">
              {cultures.map((c) => (
                <a
                  key={c.slug}
                  href={`/kultury/${c.slug}`}
                  data-testid={`culture-${c.slug}`}
                  className="group flex items-center gap-2 rounded-full bg-[var(--color-surface)] py-1.5 pl-1.5 pr-5 text-[15px] transition-colors hover:bg-[var(--color-dark)] hover:text-[var(--color-bg)]"
                >
                  {/* Ліве поле зменшене до 1.5 — картинка сама тримає відступ
                      своїм фоном, інакше чип виглядав би роздутим. */}
                  <img
                    src={`/cultures/${c.slug}.png`}
                    alt=""
                    loading="lazy"
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                  {c.name}
                  <span className="rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-[12px] font-[700] text-[rgba(14,15,12,0.5)] transition-colors group-hover:bg-[var(--color-accent)] group-hover:text-[var(--color-text)]">
                    {c.count}
                  </span>
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 5 — ПРОБЛЕМА → РІШЕННЯ (єдина темна) */}
      {/* rounded без overflow-hidden: обрізка зламала б position:sticky у
          картці рішення (sticky не працює всередині overflow-контейнера).
          Фон тут — власний градієнт секції, його border-radius клипає сам. */}
      <section id="problems" className="gradient-dark on-dark rounded-[32px]">
        <div className="container-page py-24">
          <Reveal>
            <SectionHead
              eyebrow="Типові задачі в полі"
              title="З чим приходять аграрії"
              subtitle="Оберіть проблему — покажемо препарат, який її закриває, і чому саме він."
              onDark
            />
          </Reveal>
          <div className="mt-12">
            <ProblemSolution items={problems} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 6 — ПРО КОМПАНІЮ
          Перероблено 28.07: замість двох колонок (текст + сітка статистики) —
          одна широка заява. Сам абзац і став заголовком секції: окремого
          «Вітаємо на сайті» більше немає, а плитки 2019 / 6 / 22 і «Науково-
          виробничі досліди» зняті на вимогу замовника. */}
      <section id="about" className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <Reveal>
            <p className="eyebrow text-[rgba(14,15,12,0.4)]">{about.eyebrow}</p>
            {/* 1100px — щоб заява лягла в 4 рядки, як у макеті: на 1000px
                вона розсипалась на 5 і остання лишалась коротким недогризком. */}
            <h2 className="text-h3 mt-6 max-w-[1100px] leading-[1.16]">{about.text}</h2>
            <a
              href="/about"
              className="link-arrow mt-10 flex w-fit items-center gap-2 text-[15px] font-[700] text-[var(--color-dark)]"
            >
              {about.link} <ArrowRight size={14} />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 7 — ДОВІРА */}
      <section id="trust" className="bg-[var(--color-surface)]">
        <div className="container-page py-24">
          <Reveal>
            <SectionHead
              eyebrow="Чому нам довіряють"
              title="Підтверджена якість, а не обіцянки"
              center
            />
          </Reveal>
          <Reveal delay={1}>
            {/* Той самий крій, що в картках категорій: іконка вгорі ліворуч,
                підпис притиснутий до низу. Раніше тут був однаковий чекмарк
                на всіх чотирьох — саме тому середина картки була голою.
                Іконка лишається навігаційним символом (той самий резолвер,
                що в категоріях), а згенероване тематичне фото між іконкою і
                підписом і заповнює простір, і пояснює пункт наочно. */}
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {trust.map((t) => (
                <div
                  key={t.label}
                  className="flex h-full flex-col rounded-[24px] bg-[var(--color-bg)] p-8 sm:min-h-[300px]"
                >
                  {/* Кружок-чекмарк (h-12 w-12, bg dark, accent-іконка, Check
                      size 20, shrink-0, першим елементом перед ілюстрацією)
                      прибрано на прохання — лишити тут на пам'ять, якщо
                      знадобиться повернути. */}
                  <div className="w-full flex-1 overflow-hidden rounded-[16px]">
                    <TrustArtFor name={t.icon} />
                  </div>
                  <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[17px] font-[500] leading-[1.35] text-[var(--color-dark)]">
                    {t.label} <Tooltip label={t.tooltip} />
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 8 — ДИСТРИБʼЮТОРИ */}
      <section id="distributors" className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <Reveal>
            <SectionHead
              eyebrow="Де купити"
              title="Офіційні дистрибʼютори"
              subtitle="Оберіть напрямок — покажемо партнера, який працює з вашим сегментом."
            />
          </Reveal>
          <div className="mt-12">
            <DistributorList items={distributors} filters={distributorFilters} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 9 — НОВИНИ */}
      <section id="news" className="bg-[var(--color-surface)]">
        <div className="container-page py-24">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHead eyebrow="Новини та статті" title="Події компанії та корисне про агрономію" />
              <a href="/blog" className="link-arrow flex items-center gap-2 text-[15px] font-[700] text-[var(--color-dark)]">
                Усі статті <ArrowRight size={14} />
              </a>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((n, i) => (
              <Reveal key={n.slug} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <a
                  href={`/blog/${n.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-[var(--color-dark)]"
                >
                  <Image
                    src={n.cover}
                    alt=""
                    width={560}
                    height={360}
                    className="h-[260px] w-full object-cover"
                  />
                  {/* Біла картка внапуск на фото — прийом із референсу */}
                  <div className="relative -mt-14 mx-3 mb-3 flex flex-1 flex-col rounded-[20px] bg-[var(--color-bg)] p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[12px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.45)]">
                        {n.tag}
                      </span>
                      <span className="shrink-0 text-[12px] text-[rgba(14,15,12,0.35)]">{n.read}</span>
                    </div>
                    <h3 className="mt-2 text-[20px] font-[700] leading-[1.3] text-[var(--color-dark)]">
                      {n.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-[15px] leading-[1.6] text-[rgba(14,15,12,0.6)]">
                      {n.excerpt}
                    </p>
                    <span className="link-arrow mt-auto flex items-center justify-end gap-2 pt-5 text-[14px] font-[700] text-[var(--color-dark)]">
                      Читати <ArrowRight size={14} />
                    </span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 10 — CTA + ФОРМА */}
      <section id="cta" className="bg-[var(--color-bg)]">
        <div className="container-page py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20 [&>*]:min-w-0">
            <Reveal>
              <div>
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">{cta.eyebrow}</p>
                <h2 className="text-h3 mt-3">{cta.title}</h2>
                <p className="mt-4 text-[17px] leading-[1.6] text-[rgba(14,15,12,0.6)]">{cta.subtitle}</p>
                <div className="mt-8 space-y-3">
                  {contacts.phones.map((p) => (
                    <a key={p.value} href={p.href} className="flex items-center gap-3 text-[17px] font-[500] text-[var(--color-dark)] hover:text-[color:#03594C]">
                      <Phone size={16} /> {p.value}
                      <span className="text-[13px] font-[400] text-[rgba(14,15,12,0.45)]">— {p.label}</span>
                    </a>
                  ))}
                  <a href={`mailto:${contacts.email}`} className="flex items-center gap-3 text-[17px] font-[500] text-[var(--color-dark)] hover:text-[color:#03594C]">
                    <Mail size={16} /> {contacts.email}
                  </a>
                </div>
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
