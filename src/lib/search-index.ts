// src/lib/search-index.ts — Sprint 3.4
// Unified search index over all entity types. Used by /search and the ⌘K modal.
//
// v1: client-side over the static data sources. Reranks by simple Arabic-aware
// substring score. Postgres FTS can replace this later — the public shape of
// `searchAll(query)` stays the same.

import { UNIVERSITIES } from '@/app/universities/data';
import { TRACKS, INSTITUTES } from '@/app/vocational/data';
// NOTE: schools are NOT indexed here anymore. The 240 real schools live in
// Supabase (country-first), so they are searched live via searchSchools() and
// merged in the same way as searchSocial(). The old static @/app/schools/data
// list held ~16 demo rows and made real-school searches return nothing.

export type SearchHit = {
  id: string;
  type: 'university' | 'school' | 'vocational' | 'major' | 'career' | 'scholarship' | 'blog' | 'page' | 'person' | 'community';
  emoji: string;
  title: string;
  subtitle?: string;
  href: string;
  score: number;
};

// Static blog + guide slugs (sync with sitemap)
const BLOG = [
  { slug: 'university-comparison',   title: 'الجامعات اللبنانية: مقارنة شاملة' },
  { slug: 'prepare-job-market',      title: 'كيف تستعد لسوق العمل من السنة الأولى' },
  { slug: 'remote-work-lebanon',     title: 'العمل عن بُعد للشباب اللبناني' },
  { slug: 'future-careers-2030',     title: 'مهن المستقبل 2025-2030' },
  { slug: 'scholarships-guide',      title: 'دليل المنح من AUB وLAU' },
  { slug: 'riasec-explained',        title: 'ما هو اختبار RIASEC' },
];

const GUIDES = [
  { slug: 'how-to-choose-university-lebanon', title: 'كيف تختار الجامعة المناسبة' },
  { slug: 'best-majors-gulf-market',          title: 'أفضل التخصصات المطلوبة بالخليج' },
  { slug: 'from-bac-to-university',           title: 'من البكالوريا للجامعة' },
  { slug: 'cover-letter-tips',                title: 'كيف تكتب رسالة دوافع قوية' },
  { slug: 'interview-success',                title: 'نصائح للتفوق بمقابلة العمل' },
];

const PAGES = [
  { title: 'Career DNA',                href: '/career-dna',           emoji: '🧬', desc: 'اكتشف مسارك المهني' },
  { title: 'اختبار اليوم',               href: '/quiz/today',           emoji: '🎯', desc: 'سؤال يومي لتختبر معارفك' },
  { title: 'بناء السيرة الذاتية CV',      href: '/tools/cv-builder',     emoji: '📄', desc: 'قالب احترافي بدقايق' },
  { title: 'حاسبة كلفة الجامعة',          href: '/tools/cost-calculator',emoji: '💰', desc: 'احسب التكلفة الإجمالية' },
  { title: 'التحضير للمقابلة',            href: '/tools/interview-prep', emoji: '🎤', desc: 'تمرّن على الأسئلة الشائعة' },
  { title: 'مستشار المهنة AI',           href: '/tools/career-ai',      emoji: '🤖', desc: 'اسأل عن أي تخصص' },
  { title: 'فريق مسارك',                 href: '/team',                 emoji: '👥', desc: 'عن المنصة والمؤسس' },
  { title: 'تواصل معنا',                 href: '/contact',              emoji: '✉️', desc: 'اتصل بفريق مسارك' },
];

/** Normalize Arabic letters: strip tashkeel, unify ا أ إ آ → ا, ى → ي, ة → ه. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')   // tashkeel + tatweel
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

function score(haystack: string, needle: string): number {
  const h = normalize(haystack);
  const n = normalize(needle);
  if (!n) return 0;
  const idx = h.indexOf(n);
  if (idx < 0) return 0;
  // Higher score for: exact start match, shorter haystack, more occurrences.
  let s = 100;
  if (idx === 0) s += 50;
  if (h === n) s += 100;
  s += Math.max(0, 50 - h.length);
  return s;
}

export function searchAll(query: string, limit = 30): SearchHit[] {
  const hits: SearchHit[] = [];
  const q = query.trim();
  if (!q) return [];

  // Universities
  for (const u of UNIVERSITIES) {
    const s = Math.max(
      score(u.name, q),
      score(u.short, q) + 20,  // short codes (AUB, LAU) boosted
      score(u.region, q) / 2,
      score(u.majors.join(' '), q) / 3,
    );
    if (s > 0) hits.push({
      id: `uni-${u.id}`, type: 'university', emoji: u.emoji,
      title: u.name, subtitle: `${u.short} · ${u.region}`,
      href: `/universities/${u.id}`, score: s,
    });
  }

  // Schools are searched live from Supabase via searchSchools() (merged by the
  // caller), not from a static list — see the note at the top of this file.

  // Vocational tracks + institutes
  for (const t of TRACKS) {
    const s = score(t.name || '', q);
    if (s > 0) hits.push({
      id: `voc-t-${t.id}`, type: 'vocational', emoji: '🛠️',
      title: t.name, subtitle: 'مسار مهني',
      href: `/vocational/${t.id}`, score: s,
    });
  }
  for (const i of INSTITUTES) {
    const s = score(i.name || '', q);
    if (s > 0) hits.push({
      id: `voc-i-${i.id}`, type: 'vocational', emoji: '🏫',
      title: i.name, subtitle: 'معهد مهني',
      href: `/vocational/institute/${i.id}`, score: s,
    });
  }

  // Blog
  for (const b of BLOG) {
    const s = score(b.title, q);
    if (s > 0) hits.push({
      id: `blog-${b.slug}`, type: 'blog', emoji: '📰',
      title: b.title, subtitle: 'مقال',
      href: `/blog/${b.slug}`, score: s,
    });
  }
  // Guides
  for (const g of GUIDES) {
    const s = score(g.title, q);
    if (s > 0) hits.push({
      id: `gd-${g.slug}`, type: 'blog', emoji: '📚',
      title: g.title, subtitle: 'دليل',
      href: `/guides/${g.slug}`, score: s,
    });
  }

  // Pages / tools
  for (const p of PAGES) {
    const s = Math.max(score(p.title, q), score(p.desc, q) / 2);
    if (s > 0) hits.push({
      id: `page-${p.href}`, type: 'page', emoji: p.emoji,
      title: p.title, subtitle: p.desc,
      href: p.href, score: s,
    });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
