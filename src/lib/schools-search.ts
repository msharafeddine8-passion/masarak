// Global search over the LIVE Supabase schools directory (240+ rows). Replaces
// the stale static `@/app/schools/data` list the ⌘K index used to read — that
// list held ~16 demo schools, so searching a real school by name found nothing
// and linked to the legacy /schools/{id} route. This queries the real table and
// returns proper /schools/{country}/{slug} links. Merged like searchSocial().
import { supabase } from '@/lib/supabase';
import type { SearchHit } from '@/lib/search-index';

type Row = { id: number; name: string; name_en: string | null; slug: string | null; governorate: string | null; country_code: string };

export async function searchSchools(q: string, limit = 6): Promise<SearchHit[]> {
  // Whitelist letters/numbers/space (Arabic included) — everything else is
  // stripped so the value can't break out of the PostgREST .or() filter grammar.
  const safe = q.replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (safe.length < 2) return [];

  const [{ data: rows }, { data: countries }] = await Promise.all([
    supabase
      .from('schools')
      .select('id, name, name_en, slug, governorate, country_code')
      .eq('is_active', true)
      .or(`name.ilike.%${safe}%,name_en.ilike.%${safe}%`)
      .limit(limit),
    supabase.from('countries').select('code, slug').eq('is_active', true),
  ]);

  const codeToSlug = new Map<string, string>();
  for (const c of ((countries as { code: string; slug: string }[]) || [])) codeToSlug.set(c.code, c.slug);

  const hits: SearchHit[] = [];
  for (const s of ((rows as Row[]) || [])) {
    const cslug = codeToSlug.get(s.country_code);
    // Prefer the canonical slug URL; fall back to the legacy id route (301s).
    const href = cslug && s.slug ? `/schools/${cslug}/${s.slug}` : `/schools/${s.id}`;
    hits.push({
      id: `school-${s.id}`, type: 'school', emoji: '🏫',
      title: s.name, subtitle: s.governorate || undefined,
      href, score: 60,
    });
  }
  return hits;
}
