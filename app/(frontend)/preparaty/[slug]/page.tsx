import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { delivery, packaging, products } from '@/lib/content';
import { getProduct, productDetails } from '@/lib/products-detail';
import {
  ArrowRight,
  Check,
  CultureApplications,
  DeliveryIcon,
  LeadForm,
  Phone,
  ProductAccordion,
  RegulationTable,
  Reveal,
  ScrollToTop,
  SiteHeader,
} from '../../interactive';
import { SiteFooter } from '../../site-footer';

export function generateStaticParams() {
  return productDetails.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return { title: `${p.name} | Родоніт Агро`, description: p.metaDescription };
}

/* ------------------------------------------------------------- helpers */

function Prose({ items }: { items: string[] }) {
  return (
    <div className="max-w-[900px] space-y-4">
      {items.map((t, i) => (
        <p key={i} className="text-[16px] leading-[1.7] text-[rgba(14,15,12,0.75)]">
          {t}
        </p>
      ))}
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="max-w-[900px] space-y-4">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--color-accent)] text-[var(--color-text)]">
            <Check size={12} />
          </span>
          <span className="text-[16px] leading-[1.65] text-[rgba(14,15,12,0.75)]">{t}</span>
        </li>
      ))}
    </ul>
  );
}

/* ================================================================= PAGE */

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();

  const packs = packaging[p.slug] ?? [];
  const related = products.filter((x) => x.slug !== p.slug).slice(0, 3);

  const sections = [
    p.specs.length && {
      key: 'opys',
      label: 'Опис продукту',
      render: (
        <div className="max-w-[900px] space-y-8">
          {p.specs.map((s) => (
            <div key={s.title}>
              <h3 className="text-[18px] font-[700] text-[var(--color-dark)]">{s.title}</h3>
              <div className="mt-3 space-y-3">
                {s.body.map((b, i) => (
                  <p key={i} className="text-[16px] leading-[1.7] text-[rgba(14,15,12,0.72)]">
                    {b}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    p.advantages.length && {
      key: 'perevahy',
      label: 'Переваги',
      render: <CheckList items={p.advantages} />,
    },
    p.regulations.length && {
      key: 'rehlament',
      label: 'Регламент застосування',
      render: <RegulationTable rows={p.regulations} />,
    },
    p.usage.length && {
      key: 'osoblyvosti',
      label: 'Особливості застосування',
      render: <CheckList items={p.usage} />,
    },
    p.mixing.length && {
      key: 'rozchyn',
      label: 'Приготування робочого розчину',
      render: <Prose items={p.mixing} />,
    },
    p.compatibility.length && {
      key: 'sumisnist',
      label: 'Сумісність і безпечність',
      render: <Prose items={p.compatibility} />,
    },
    p.storage.length && {
      key: 'zberihannia',
      label: 'Умови зберігання',
      render: <Prose items={p.storage} />,
    },
    p.problems.length && {
      key: 'problemy',
      label: 'Вирішує проблеми',
      render: (
        <div className="grid gap-6 md:grid-cols-2">
          {p.problems.map((pr) => (
            <div key={pr.title} className="rounded-[20px] bg-[var(--color-surface)] p-6">
              <p className="text-[17px] font-[500] text-[var(--color-dark)]">{pr.title}</p>
              {pr.body.map((b, j) => (
                <p key={j} className="mt-3 text-[15px] leading-[1.65] text-[rgba(14,15,12,0.7)]">
                  {b}
                </p>
              ))}
            </div>
          ))}
        </div>
      ),
    },
  ].filter(Boolean) as { key: string; label: string; render: React.ReactNode }[];

  return (
    <>
      <SiteHeader />
      <ScrollToTop />

      {/* ═══════════════════════════════════════════ 1 — ПЕРШИЙ ЕКРАН */}
      <section id="top" className="bg-[var(--color-bg)] pt-[104px]">
        <div className="container-page py-8">
          <nav aria-label="Хлібні крихти" className="text-[14px] text-[rgba(14,15,12,0.4)]">
            <a href="/" className="hover:text-[var(--color-text)]">
              Головна
            </a>
            {' / '}
            <a href="/preparaty" className="hover:text-[var(--color-text)]">
              Препарати
            </a>
            {' / '}
            <a href={`/preparaty?cat=${p.categorySlug}`} className="hover:text-[var(--color-text)]">
              {p.category}
            </a>
            {' / '}
            <span className="text-[var(--color-text)]">{p.shortName}</span>
          </nav>

          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
            {/* Картка з фото */}
            <div className="grid place-items-center rounded-[24px] bg-[var(--color-surface)] p-8">
              <Image
                src={`/products/${p.slug}.png`}
                alt={p.name}
                width={600}
                height={790}
                priority
                className="max-h-[360px] w-auto object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.16)]"
              />
            </div>

            {/* Основна інформація */}
            <div>
              <span className="inline-block rounded-full bg-[rgba(149,227,98,0.22)] px-4 py-1.5 text-[13px] font-[500] text-[color:#03594C]">
                {p.category}
              </span>

              <h1 className="text-h4 mt-4">{p.name}</h1>
              <p className="mt-2 text-[17px] leading-[1.45] text-[rgba(14,15,12,0.65)]">{p.tagline}</p>

              {/* Ключові характеристики — те, що на старому сайті стояло в першому екрані */}
              {p.keySpecs.length > 0 && (
                <dl className="mt-6 grid border-t border-[rgba(0,0,0,0.1)] lg:grid-cols-2 lg:gap-x-10">
                  {p.keySpecs.map((k) => (
                    <div
                      key={k.label}
                      className="border-b border-[rgba(0,0,0,0.06)] py-3"
                    >
                      <dt className="text-[13px] text-[rgba(14,15,12,0.45)]">{k.label}</dt>
                      <dd className="mt-1 text-[15px] leading-[1.5] text-[var(--color-text)]">{k.value}</dd>
                    </div>
                  ))}
                  {packs.length > 0 && (
                    <div className="border-b border-[rgba(0,0,0,0.06)] py-3">
                      <dt className="text-[13px] text-[rgba(14,15,12,0.45)]">Фасування</dt>
                      <dd className="mt-1 text-[15px] leading-[1.5] text-[var(--color-text)]">
                        {packs.join(' · ')}
                      </dd>
                    </div>
                  )}
                </dl>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#cta" className="btn btn-primary">
                  Замовити консультацію <ArrowRight size={14} />
                </a>
                <a href="/preparaty" className="btn btn-outline">
                  Усі препарати
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 2 — ДОСТАВКА */}
      <section id="delivery" className="bg-[var(--color-bg)]">
        <div className="container-page pb-12">
          <div className="rounded-[24px] border border-[rgba(0,0,0,0.1)] p-7">
            <p className="text-[18px] font-[700] text-[var(--color-dark)]">Доставка</p>
            <div className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {delivery.map((d) => (
                <div key={d.title} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-[var(--color-dark)]">
                    <DeliveryIcon kind={d.icon} />
                  </span>
                  <span>
                    <span className="block text-[15px] text-[var(--color-text)]">{d.title}</span>
                    <span className="block text-[14px] text-[rgba(14,15,12,0.45)]">{d.note}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 3 — ЗАСТОСУВАННЯ НА КУЛЬТУРАХ */}
      {p.regulations.length > 0 && (
        <section id="cultures" className="bg-[var(--color-bg)]">
          <div className="container-page pb-16">
            <Reveal>
              <h2 className="text-h4">Застосування на культурах</h2>
              <p className="mt-3 max-w-[640px] text-[16px] text-[rgba(14,15,12,0.6)]">
                Оберіть культуру — покажемо норму й спосіб внесення.
              </p>
            </Reveal>
            <div className="mt-8">
              <CultureApplications rows={p.regulations} />
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════ 4 — ДЕТАЛЬНА ІНФОРМАЦІЯ */}
      <section id="details" className="bg-[var(--color-bg)]">
        <div className="container-page pb-20">
          <Reveal>
            <h2 className="text-h4">Детальна інформація</h2>
          </Reveal>
          <div className="mt-8">
            <ProductAccordion sections={sections} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 5 — СХОЖІ ПРЕПАРАТИ */}
      <section id="related" className="bg-[var(--color-surface)]">
        <div className="container-page py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Портфель</p>
                <h2 className="text-h3 mt-3">Інші препарати</h2>
              </div>
              <a
                href="/preparaty"
                className="link-arrow flex items-center gap-2 text-[12px] font-[800] uppercase tracking-[0.04em] text-[var(--color-dark)]"
              >
                Подивитись усі препарати <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <Reveal key={r.slug} delay={((i % 4) + 1) as 1 | 2 | 3 | 4}>
                <a
                  href={`/preparaty/${r.slug}`}
                  className="group flex h-full flex-col rounded-[24px] bg-[var(--color-bg)] p-7 text-center"
                >
                  <div className="mb-6 grid h-[190px] place-items-center overflow-hidden">
                    <Image
                      src={`/products/${r.slug}.png`}
                      alt={r.name}
                      width={600}
                      height={790}
                      className="max-h-[180px] w-auto object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.15)]"
                    />
                  </div>
                  <p className="text-[12px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.4)]">
                    {r.category}
                  </p>
                  <h3 className="mt-2 text-[20px] font-[500] text-[var(--color-dark)]">{r.name}</h3>
                  <p className="mt-3 line-clamp-2 text-[15px] leading-[1.55] text-[rgba(14,15,12,0.6)]">
                    {r.description}
                  </p>
                  <span className="mt-auto w-full pt-6">
                    <span className="btn btn-primary w-full">
                      Детальніше <ArrowRight size={14} />
                    </span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ 6 — CTA */}
      <section id="cta" className="bg-[var(--color-bg)]">
        <div className="container-page py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20 [&>*]:min-w-0">
            <Reveal>
              <div>
                <p className="eyebrow text-[rgba(14,15,12,0.4)]">Зворотний звʼязок</p>
                <h2 className="text-h3 mt-3">Підберемо схему під вашу культуру</h2>
                <p className="mt-4 text-[17px] leading-[1.6] text-[rgba(14,15,12,0.6)]">
                  Залиште номер — консультант підкаже норму, фазу внесення й сумісність {p.shortName} у
                  вашій системі захисту.
                </p>
                <a
                  href="tel:+380444995049"
                  className="mt-8 flex w-fit items-center gap-3 text-[18px] font-[500] text-[var(--color-dark)] hover:text-[color:#03594C]"
                >
                  <Phone size={16} /> +38 (044) 499-50-49
                </a>
              </div>
            </Reveal>
            <Reveal delay={2}>
              <LeadForm />
            </Reveal>
          </div>
        </div>
        <div className="gradient-shelf h-[160px]" />
      </section>

      <SiteFooter />
    </>
  );
}
