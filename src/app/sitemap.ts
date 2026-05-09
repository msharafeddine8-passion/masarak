// src/app/sitemap.ts
// sitemap.xml ديناميكي
// =====================================================

import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_CONFIG.url;
  const now = new Date();

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

  const content: MetadataRoute.Sitemap = [
    { url: `${base}/blog`,        lastModified: now, changeFrequency: 'daily',   priority: 0.85 },
    { url: `${base}/guides`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.75 },
    { url: `${base}/community`,   lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${base}/mentorship`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/jobs`,        lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${base}/courses`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/changelog`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.4 },
  ];

  const audiences: MetadataRoute.Sitemap = [
    '/for-students',
    '/for-parents',
    '/for-schools',
    '/for-universities',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const info: MetadataRoute.Sitemap = [
    { url: `${base}/about`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.6 },
    { url: `${base}/faq`,      lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/referral`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms`,    lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ];

  return [...main, ...tools, ...content, ...audiences, ...info];
}
