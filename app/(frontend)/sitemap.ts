import type { MetadataRoute } from 'next';
import {
  getAllTags,
  getBlogCategories,
  getCulturePages,
  getPosts,
  getProducts,
  getSolutions,
} from '@/lib/cms';

import { SITE } from '@/lib/site';

/**
 * Sitemap. lastModified свідомо не проставляємо там, де реальної дати немає:
 * поточна дата в lastmod бреше пошуковику про свіжість і з часом привчає його
 * ігнорувати поле. Дати зʼявляться разом із published_date у постах.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, culturePages, solutions, posts, blogCategories, allTags] = await Promise.all([
    getProducts(), getCulturePages(), getSolutions(), getPosts(), getBlogCategories(), getAllTags(),
  ]);
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE}/preparaty`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/kultury`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/rishennia`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/contacts`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${SITE}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE}/about`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${SITE}/distributors`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/blog`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE}/preparaty/${p.slug}`,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    changeFrequency: 'yearly',
    priority: 0.7,
  }));

  const culturePagesUrls: MetadataRoute.Sitemap = culturePages.map((c) => ({
    url: `${SITE}/kultury/${c.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const solutionPages: MetadataRoute.Sitemap = solutions.map((s) => ({
    url: `${SITE}/rishennia/${s.slug}`,
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  const categoryPages: MetadataRoute.Sitemap = blogCategories.map((c) => ({
    url: `${SITE}/blog/category/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  const tagPages: MetadataRoute.Sitemap = allTags.map((t) => ({
    url: `${SITE}/blog/tag/${t.slug}`,
    changeFrequency: 'weekly',
    priority: 0.4,
  }));

  return [...staticPages, ...productPages, ...culturePagesUrls, ...solutionPages, ...postPages, ...categoryPages, ...tagPages];
}
