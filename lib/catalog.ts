/**
 * Каталог: які культури закриває кожен препарат.
 *
 * Джерело — таблиця products_cultures зі старого Payload (rodonit.db).
 * Це авторитетні дані, а не витяг із регламентів: у регламентах культури
 * записані вільним текстом у 25 варіантах із синонімами («Зернові колосові»
 * і «Зернові», «Буряки цукрові» і «Цукрові буряки»), і зіставляти їх на око
 * означало б вигадувати. Звірено: лічильники, порахувані з цієї мапи,
 * збігаються з усіма 22 значеннями cultures[].count у lib/content.ts.
 */

export const productCultures: Record<string, string[]> = {
  'silver-mix': ['soniashnyk', 'kukurudza', 'soia', 'ripak', 'zernovi-kultury'],
  'mira-rk': ['soniashnyk', 'kukurudza', 'soia', 'ripak', 'zernovi-kultury', 'buriak-tsukrovyi', 'buriak-stolovyi', 'malyna'],
  'verno-sav': ['soniashnyk', 'kukurudza', 'soia', 'ripak', 'zernovi-kultury', 'ohirok', 'perets', 'kartoplia', 'tomat', 'buriak-tsukrovyi', 'buriak-stolovyi', 'kistochkovi-kultury', 'vynohrad', 'polunytsia', 'malyna', 'kvitkovi-kultury', 'zerniatkovi'],
  'verno-fg': ['soniashnyk', 'kukurudza', 'soia', 'ripak', 'zernovi-kultury', 'tomat', 'kapusta', 'buriak-tsukrovyi', 'buriak-stolovyi', 'kistochkovi-kultury', 'vynohrad', 'polunytsia', 'bashtanni-kultury', 'tsybulia', 'horokh', 'zerniatkovi'],
  'nordoks': ['soniashnyk', 'kukurudza', 'soia', 'ripak', 'zernovi-kultury', 'ohirok', 'baklazhan', 'perets', 'kartoplia', 'tomat', 'kapusta', 'buriak-stolovyi', 'kistochkovi-kultury', 'vynohrad', 'polunytsia', 'bashtanni-kultury', 'malyna', 'kvitkovi-kultury', 'tsybulia', 'horokh', 'zerniatkovi'],
  'hydrolip': ['kukurudza', 'ripak', 'zernovi-kultury', 'perets', 'vynohrad', 'polunytsia', 'bashtanni-kultury', 'horokh'],
};
import { categories, cultures, products, type Product } from './content';
import { productDetails } from './products-detail';

export type CatalogProduct = Product & {
  categorySlug: string;
  tagline: string;
  cultures: string[];
};

/** Картка каталогу = базовий продукт + категорія-слаг, тизер і культури. */
export const catalogProducts: CatalogProduct[] = products.map((p) => {
  const detail = productDetails.find((d) => d.slug === p.slug);
  return {
    ...p,
    categorySlug: detail?.categorySlug ?? '',
    tagline: detail?.tagline ?? p.description,
    cultures: productCultures[p.slug] ?? [],
  };
});

/** Категорії з реальними лічильниками, порахованими з каталогу. */
export const catalogCategories = categories.map((c) => ({
  slug: c.slug,
  name: c.name,
  count: catalogProducts.filter((p) => p.categorySlug === c.slug).length,
}));

/**
 * Культури для фільтра. Лічильник тут — скільки препаратів закривають
 * культуру, тому беремо його з мапи, а не з cultures[].count: якщо портфель
 * зміниться, друге поле доведеться правити руками, а це — ні.
 */
export const catalogCultures = cultures
  .map((c) => ({
    slug: c.slug,
    name: c.name,
    count: catalogProducts.filter((p) => p.cultures.includes(c.slug)).length,
  }))
  .filter((c) => c.count > 0)
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

export function filterCatalog(categorySlug?: string, cultureSlug?: string): CatalogProduct[] {
  return catalogProducts.filter(
    (p) =>
      (!categorySlug || p.categorySlug === categorySlug) &&
      (!cultureSlug || p.cultures.includes(cultureSlug))
  );
}
