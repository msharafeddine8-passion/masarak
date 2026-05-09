// src/app/sitemap.ts
// sitemap.xml ديناميكي
// =====================================================

import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_CONFIG.url;
  const now = new Date();

  // الصفحات الأساسية (priority عالٍ)
  const main: MetadataRoute.Sitemap = [
    { url: `${base}/`,             lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/universities`, lastModified: now, changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${base}/scholarships`, lastModified: now, changeFrequency: 'daily',   priority: 0.95 },
    { url: `${base}/majors`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/careers`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${base}/internships/hub`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${base}/schools`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/vocational`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
  ];

  // الأدوات
  const tools: MetadataRoute.Sitemap = [
    `/tools`,
    `/tools/career-ai`,
    `/tools/cv-builder`,
    `/tools/cost-calculator`,
    `/tools/cover-letter`,
    `/tools/interview-prep`,
    `/tools/skill-strengths`,
    `/tools/bac-equivalence`,
    `/tools/application-tracker`,
    `/tools/salary-calculator`,
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  // محتوى و�