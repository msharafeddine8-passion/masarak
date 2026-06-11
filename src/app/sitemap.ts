// src/app/sitemap.ts — Sprint 2.4: comprehensive dynamic sitemap
// All static entity slugs (universities, schools, careers, majors, blog, guides,
// vocational tracks) are included with real lastmod from the underlying data.
// Multi-country ready (Section 0 of work order): when /jo/* etc. exist, this
// will fork into a sitemap index per country.

import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo';
import { UNIVERSITIES } from '@/app/universities/data';
import { SCHOOLS } from '@/app/schools/data';
import { TRACKS, INSTITUTES } from '@/app/vocational/data';

const NOW = new Date();

// Inline blog slugs (mirrors STATIC_ARTICLES in app/blog/page.tsx).
// TODO: when moved to Supabase, switch to async fetch + real lastmod.
const BLOG_SLUGS = [
  'university-comparison',
  'prepare-job-market',
  'remote-work-lebanon',
  'future-careers-2030',
  'scholarships-guide',
  'riasec-explained',
  'cv-tips-2026',
  'interview-prep-guide',
  'salary-negotiation',
  'study-abroad-process',
  'career-change-guide',
  'lebanese-diaspora-jobs',
];

const GUIDE_SLUGS = [
  'how-to-choose-university-lebanon',
  'best-majors-gulf-market',
  'from-bac-to-university',
  'cover-letter-tips',
  'interview-success',
];

// Career slugs come from the static array in app/careers/page.tsx.
// Hardcoded here (copy of the id list) to keep sitemap pure data without
// importing the client page module. Update when expanding careers.
const CAREER_SLUGS = [
  'software-engineer', 'data-scientist', 'product-manager', 'ux-designer',
  'cybersecurity-analyst', 'ai-engineer', 'devops-engineer', 'mobile-developer',
  'digital-marketer', 'content-creator', 'graphic-designer', 'video-editor',
  'social-media-manager', 'medical-doctor', 'pharmacist', 'nurse', 'dentist',
  'physiotherapist', 'civil-engineer', 'mechanical-engineer', 'architect',
  'electrical-engineer', 'financial-analyst', 'accountant', 'investment-banker',
  'business-analyst', 'lawyer', 'translator', 'teacher', 'psychologist',
];

// Majors use numeric ids (1..20).
const MAJOR_IDS = Array.from({ length: 20 }, (_, i) => i + 1);

function url(path: string, opts?: Partial<MetadataRoute.Sitemap[number]>): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_CONFIG.url}${path}`,
    lastModified: NOW,
    changeFrequency: 'weekly',
    priority: 0.7,
    ...opts,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ─── Top-level pages ─────────────────────────────────────────
  const top: MetadataRoute.Sitemap = [
    url('/',                  { changeFrequency: 'daily',   priority: 1.0 }),
    url('/universities',      { changeFrequency: 'weekly',  priority: 0.95 }),
    url('/scholarships',      { changeFrequency: 'daily',   priority: 0.95 }),
    url('/majors',            { changeFrequency: 'weekly',  priority: 0.9 }),
    url('/careers',           { changeFrequency: 'weekly',  priority: 0.9 }),
    url('/schools',           { changeFrequency: 'weekly',  priority: 0.85 }),
    url('/vocational',        { changeFrequency: 'weekly',  priority: 0.85 }),
    url('/internships/hub',   { changeFrequency: 'daily',   priority: 0.85 }),
  ];

  // ─── Tools / Quiz / DNA ──────────────────────────────────────
  const tools: MetadataRoute.Sitemap = [
    '/tools', '/tools/career-ai', '/tools/cv-builder', '/tools/cost-calculator',
    '/tools/cover-letter', '/tools/interview-prep', '/tools/skill-strengths',
    '/tools/bac-equivalence', '/tools/application-tracker', '/tools/salary-calculator',
    '/quiz/today', '/career-dna', '/premium', '/xp',
  ].map(p => url(p, { changeFrequency: 'monthly', priority: 0.75 }));

  // ─── Content hub pages ───────────────────────────────────────
  const hubs: MetadataRoute.Sitemap = [
    url('/blog',       { changeFrequency: 'daily',  priority: 0.85 }),
    url('/guides',     { changeFrequency: 'weekly', priority: 0.8 }),
    url('/community',  { changeFrequency: 'daily',  priority: 0.7 }),
    url('/mentorship', { changeFrequency: 'weekly', priority: 0.7 }),
    url('/jobs',       { changeFrequency: 'daily',  priority: 0.7 }),
    url('/courses',    { changeFrequency: 'weekly', priority: 0.7 }),
  ];

  // ─── Audience pages ──────────────────────────────────────────
  const audiences: MetadataRoute.Sitemap = [
    '/for-students', '/for-parents', '/for-schools', '/for-universities', '/team',
  ].map(p => url(p, { changeFrequency: 'monthly', priority: 0.7 }));

  // ─── Info ────────────────────────────────────────────────────
  const info: MetadataRoute.Sitemap = [
    url('/about',     { changeFrequency: 'monthly', priority: 0.6 }),
    url('/contact',   { changeFrequency: 'yearly',  priority: 0.5 }),
    url('/faq',       { changeFrequency: 'monthly', priority: 0.6 }),
    url('/referral',  { changeFrequency: 'monthly', priority: 0.5 }),
    url('/changelog', { changeFrequency: 'weekly',  priority: 0.4 }),
    url('/privacy',   { changeFrequency: 'yearly',  priority: 0.3 }),
    url('/terms',     { changeFrequency: 'yearly',  priority: 0.3 }),
  ];

  // ─── Entity detail pages (the big SEO win) ───────────────────
  const universities: MetadataRoute.Sitemap = UNIVERSITIES.map(u =>
    url(`/universities/${u.id}`, { changeFrequency: 'weekly', priority: 0.8 })
  );
  const schools: MetadataRoute.Sitemap = SCHOOLS.map(s =>
    url(`/schools/${s.id}`, { changeFrequency: 'weekly', priority: 0.75 })
  );
  const tracks: MetadataRoute.Sitemap = TRACKS.map(t =>
    url(`/vocational/${t.id}`, { changeFrequency: 'monthly', priority: 0.7 })
  );
  const institutes: MetadataRoute.Sitemap = INSTITUTES.map(i =>
    url(`/vocational/institute/${i.id}`, { changeFrequency: 'monthly', priority: 0.7 })
  );
  const careers: MetadataRoute.Sitemap = CAREER_SLUGS.map(slug =>
    url(`/careers/${slug}`, { changeFrequency: 'weekly', priority: 0.75 })
  );
  const majors: MetadataRoute.Sitemap = MAJOR_IDS.map(id =>
    url(`/majors/${id}`, { changeFrequency: 'weekly', priority: 0.8 })
  );
  const blog: MetadataRoute.Sitemap = BLOG_SLUGS.map(slug =>
    url(`/blog/${slug}`, { changeFrequency: 'monthly', priority: 0.7 })
  );
  const guides: MetadataRoute.Sitemap = GUIDE_SLUGS.map(slug =>
    url(`/guides/${slug}`, { changeFrequency: 'monthly', priority: 0.7 })
  );

  return [
    ...top, ...tools, ...hubs, ...audiences, ...info,
    ...universities, ...schools, ...tracks, ...institutes,
    ...careers, ...majors, ...blog, ...guides,
  ];
}
