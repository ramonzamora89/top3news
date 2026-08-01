import { getAllArticles } from '@/lib/content';
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://top3.news';
const VERTICALS = ['autos', 'tecnologia', 'peliculas', 'musica', 'comida'];

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();

  // next.config.js sets trailingSlash: true — every route redirects (301) to its
  // trailing-slash form, so the sitemap must list that form directly. Listing the
  // non-slash URL makes every sitemap entry resolve as a redirect to Google.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...VERTICALS.map((v) => ({
      url: `${BASE_URL}/${v}/`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    { url: `${BASE_URL}/agenda/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/${a.vertical}/${a.id}/`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes];
}
