'use client';

import { useMemo, useState } from 'react';
import {
  catalogCategories,
  catalogCultures,
  catalogProducts,
  filterCatalog,
  type CatalogProduct,
} from '@/lib/catalog';
import { ArrowRight, Check, Chevron, Close } from '../interactive';

/* Фільтр каталогу. Два зрізи, якими аграрій реально шукає препарат:
   категорія (що це за продукт) і культура (що в мене в полі).
   Стан живе в URL — посилання на відфільтрований каталог можна переслати. */

function updateUrl(cat: string, culture: string) {
  const params = new URLSearchParams();
  if (cat) params.set('cat', cat);
  if (culture) params.set('culture', culture);
  const qs = params.toString();
  // replaceState, а не router.push: перемальовувати серверний компонент на
  // кожен клік по чипу не треба, а історія браузера не має засмічуватись
  // десятком проміжних станів фільтра.
  window.history.replaceState(null, '', qs ? `/preparaty?${qs}` : '/preparaty');
}

function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <a
      href={`/preparaty/${product.slug}`}
      data-testid={`catalog-card-${product.slug}`}
      className="card-hover flex h-full flex-col rounded-[24px] bg-[var(--color-surface)] p-6"
    >
      {/* Фото менше, ніж у слайдері на головній: там 210px, тут 150px —
          картка каталогу має показувати шість штук, а не три. */}
      <div className="mb-5 grid h-[150px] place-items-center">
        <img
          src={`/products/${product.slug}.png`}
          alt={product.name}
          loading="lazy"
          className="max-h-[140px] w-auto max-w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.14)]"
        />
      </div>
      <p className="text-[12px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.4)]">
        {product.category}
      </p>
      <h3 className="mt-2 text-[19px] font-[500] leading-[1.25] text-[var(--color-dark)]">
        {product.name}
      </h3>
      <p className="mt-2 line-clamp-2 text-[14px] leading-[1.55] text-[rgba(14,15,12,0.6)]">
        {product.tagline}
      </p>
      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="text-[12px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.4)]">
          {product.cultures.length} культур
        </span>
        <span className="link-arrow flex items-center gap-2 text-[13px] font-[700] text-[var(--color-dark)]">
          Детальніше <ArrowRight size={14} />
        </span>
      </div>
    </a>
  );
}

export function Catalog({
  initialCategory = '',
  initialCulture = '',
}: {
  initialCategory?: string;
  initialCulture?: string;
}) {
  const [cat, setCat] = useState(initialCategory);
  const [culture, setCulture] = useState(initialCulture);
  const [cultureOpen, setCultureOpen] = useState(false);

  const shown = useMemo(() => filterCatalog(cat, culture), [cat, culture]);
  const activeCulture = catalogCultures.find((c) => c.slug === culture);
  const hasFilter = Boolean(cat || culture);

  const pick = (nextCat: string, nextCulture: string) => {
    setCat(nextCat);
    setCulture(nextCulture);
    updateUrl(nextCat, nextCulture);
  };

  const chip = (active: boolean) =>
    `rounded-full px-5 py-2.5 text-[14px] transition-colors ${
      active
        ? 'bg-[var(--color-dark)] font-[700] text-[var(--color-bg)]'
        : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[rgba(0,0,0,0.07)]'
    }`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => pick('', culture)} className={chip(!cat)}>
          Усі препарати
        </button>
        {catalogCategories.map((c) => (
          <button
            key={c.slug}
            type="button"
            data-testid={`cat-${c.slug}`}
            onClick={() => pick(c.slug, culture)}
            className={chip(cat === c.slug)}
          >
            {c.name}
            <span className="ml-2 text-[12px] opacity-60">{c.count}</span>
          </button>
        ))}
      </div>

      {/* Культур 22 — чипами вони б зайняли пів екрана, тому список, що
          розкривається. Вибрана культура лишається видимою поруч. */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <button
            type="button"
            data-testid="culture-toggle"
            aria-expanded={cultureOpen}
            onClick={() => setCultureOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.12)] px-5 py-2.5 text-[14px] font-[500] text-[var(--color-dark)] transition-colors hover:bg-[var(--color-surface)]"
          >
            {/* Завжди «Культура»: обрану показує лаймовий чип поруч, і
                дублювати назву в обох місцях — шум. */}
            Культура
            <Chevron size={16} className={cultureOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>

          {cultureOpen && (
            <div
              data-testid="culture-menu"
              className="absolute left-0 top-[calc(100%+8px)] z-30 max-h-[340px] w-[300px] overflow-y-auto rounded-[20px] border border-[rgba(0,0,0,0.1)] bg-[var(--color-bg)] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
            >
              {catalogCultures.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => {
                    pick(cat, culture === c.slug ? '' : c.slug);
                    setCultureOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-[14px] px-4 py-2.5 text-left text-[15px] transition-colors ${
                    culture === c.slug
                      ? 'bg-[var(--color-dark)] text-[var(--color-bg)]'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {culture === c.slug && <Check size={13} />}
                    {c.name}
                  </span>
                  <span className="text-[12px] opacity-55">{c.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {activeCulture && (
          <button
            type="button"
            onClick={() => pick(cat, '')}
            className="flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-[14px] font-[700] text-[var(--color-text)]"
          >
            {activeCulture.name}
            <Close size={14} />
          </button>
        )}

        <span className="text-[14px] text-[rgba(14,15,12,0.45)]">
          {shown.length} із {catalogProducts.length}
        </span>

        {hasFilter && (
          <button
            type="button"
            onClick={() => pick('', '')}
            className="text-[14px] font-[700] text-[var(--color-dark)] underline underline-offset-4 hover:text-[color:#03594C]"
          >
            Скинути
          </button>
        )}
      </div>

      <div data-testid="catalog-grid" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>

      {shown.length === 0 && (
        <div className="mt-10 rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-[var(--color-surface)] p-10 text-center">
          <p className="text-[17px] text-[rgba(14,15,12,0.6)]">
            За цим поєднанням препаратів немає. Спробуйте іншу культуру або скиньте фільтр.
          </p>
          <button type="button" onClick={() => pick('', '')} className="btn btn-primary mt-6">
            Показати всі препарати
          </button>
        </div>
      )}
    </div>
  );
}
