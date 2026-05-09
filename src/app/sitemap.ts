// src/app/sitemap.ts
// sitemap.xml ديناميكي
// =====================================================

import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_CONFIG.url;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/universities`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/majors`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/scholarships`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${base}/careers`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${base}/internships/hub`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/schools`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/vocational`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/career-dna`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/gamification`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  return staticPages;
}
