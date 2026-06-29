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
import { CAREERS } from '@/app/careers/data';
import { MAJORS } from '@/app/majors/data';

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
  'study-abroad-guide-lebanese-students',
  'how-to-get-scholarship-lebanon',
  'top-tech-skills-2026',
  'build-your-cv-from-scratch',
  'university-vs-vocational-which-is-right',
  'prepare-for-job-market-before-graduation',
  'vocational-education-guide-lebanon',
  'study-in-germany-free',
  'cheapest-countries-to-study-abroad',
  'study-abroad-without-ielts',
  'study-abroad-step-by-step',
  'study-in-turkey-scholarship',
];

// Pull career slugs from the shared data module so /careers/[slug] SSR pages
// and the sitemap stay in sync.
const CAREER_SLUGS = CAREERS.map(c => c.id);

function url(path: string, opts?: Partial<MetadataRoute.Sitemap[number]>): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_CONFIG.url}${path}`,
    lastModified: NOW,
    changeFrequency: 'weekly',
    priority: 0.7,
    ...opts,
  };
}

// Masarak Global — pull live scholarship slugs from Supabase (auto-updates as
// the global database grows). Fails open to an empty list.
async function getGlobalScholarshipSlugs(): Promise<string[]> {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!u || !k) return [];
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const { data } = await createClient(u, k).from('scholarships_global').select('slug').neq('status', 'draft');
    return (data || []).map((r: { slug: string }) => r.slug);
  } catch {
    return [];
  }
}

// Destination-country page slugs (/study-abroad/{country}). Fails open.
async function getDestinationCountrySlugs(): Promise<string[]> {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!u || !k) return [];
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const { data } = await createClient(u, k).from('countries').select('slug').eq('is_destination', true).eq('is_active', true);
    return (data || []).map((r: { slug: string }) => r.slug);
  } catch {
    return [];
  }
}

// Global university detail paths (/universities/country/{country}/{uni}). Lebanon
// is excluded — it has its own detailed pages under /universities/{id}. Fails open.
async function getGlobalUniversityPaths(): Promise<{ country: string; uni: string }[]> {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!u || !k) return [];
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const { data } = await createClient(u, k)
      .from('universities_global').select('slug, countries ( slug )')
      .neq('status', 'draft').neq('country_code', 'LB');
    return ((data || []) as unknown as { slug: string; countries: { slug: string } | null }[])
      .filter(r => r.countries)
      .map(r => ({ country: r.countries!.slug, uni: r.slug }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ─── Top-level pages ─────────────────────────────────────────
  const top: MetadataRoute.Sitemap = [
    url('/',                  { changeFrequency: 'daily',   priority: 1.0 }),
    url('/universities',      { changeFrequency: 'weekly',  priority: 0.95 }),
    url('/universities/map',  { changeFrequency: 'monthly', priority: 0.7 }),
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
    '/tools/major-match',
    '/quiz/today', '/career-dna', '/premium', '/xp',
  ].map(p => url(p, { changeFrequency: 'monthly', priority: 0.75 }));

  // ─── Content hub pages ───────────────────────────────────────
  const hubs: MetadataRoute.Sitemap = [
    url('/blog',       { changeFrequency: 'daily',  priority: 0.85 }),
    url('/glossary',   { changeFrequency: 'monthly', priority: 0.85 }),
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
  const blog: MetadataRoute.Sitemap = BLOG_SLUGS.map(slug =>
    url(`/blog/${slug}`, { changeFrequency: 'monthly', priority: 0.7 })
  );
  const guides: MetadataRoute.Sitemap = GUIDE_SLUGS.map(slug =>
    url(`/guides/${slug}`, { changeFrequency: 'monthly', priority: 0.7 })
  );
  const majors: MetadataRoute.Sitemap = MAJORS.map(m =>
    url(`/majors/${m.slug}`, { changeFrequency: 'monthly', priority: 0.8 })
  );

  // ─── Masarak Global — study abroad ───────────────────────────
  const [globalSlugs, destSlugs, uniPaths] = await Promise.all([
    getGlobalScholarshipSlugs(),
    getDestinationCountrySlugs(),
    getGlobalUniversityPaths(),
  ]);
  const studyAbroad: MetadataRoute.Sitemap = [
    url('/study-abroad',              { changeFrequency: 'weekly', priority: 0.9 }),
    url('/study-abroad/scholarships', { changeFrequency: 'daily',  priority: 0.9 }),
    ...destSlugs.map(slug =>
      url(`/study-abroad/${slug}`, { changeFrequency: 'weekly', priority: 0.85 })
    ),
    ...globalSlugs.map(slug =>
      url(`/study-abroad/scholarships/${slug}`, { changeFrequency: 'weekly', priority: 0.8 })
    ),
  ];

  // ─── Masarak Global — universities by country (country-first browse) ─────────
  const uniCountrySlugs = [...new Set(uniPaths.map(p => p.country))];
  const globalUnis: MetadataRoute.Sitemap = [
    url('/universities/lebanon', { changeFrequency: 'weekly', priority: 0.9 }),
    ...uniCountrySlugs.map(slug =>
      url(`/universities/country/${slug}`, { changeFrequency: 'weekly', priority: 0.85 })
    ),
    ...uniPaths.map(p =>
      url(`/universities/country/${p.country}/${p.uni}`, { changeFrequency: 'monthly', priority: 0.75 })
    ),
  ];

  return [
    ...top, ...tools, ...hubs, ...audiences, ...info,
    ...universities, ...schools, ...tracks, ...institutes,
    ...careers, ...blog, ...guides, ...majors, ...studyAbroad, ...globalUnis,
  ];
}
