// Social system · Phase 8 — blends people + communities into the global search.
// Returns SearchHit[] so it merges seamlessly with the static entity index.
import { supabase } from '@/lib/supabase';
import type { SearchHit } from '@/lib/search-index';
import type { PersonCard } from '@/lib/social/friends';
import type { CommunitySummary } from '@/lib/social/community';

export async function searchSocial(q: string, limit = 6): Promise<SearchHit[]> {
  if (q.trim().length < 2) return [];
  // search_people is authenticated-only (opt-in, is_public); it just returns []
  // for logged-out users. list_communities is public.
  const [people, comms] = await Promise.all([
    supabase.rpc('search_people', { p_q: q, p_limit: limit }),
    supabase.rpc('list_communities', { p_q: q, p_category: null }),
  ]);

  const hits: SearchHit[] = [];
  for (const p of ((people.data as PersonCard[]) || [])) {
    if (!p.slug) continue;
    hits.push({
      id: `person-${p.user_id}`, type: 'person', emoji: '👤',
      title: p.full_name || 'طالب',
      subtitle: [p.major, p.university_name || p.school_name].filter(Boolean).join(' · ') || undefined,
      href: `/u/${p.slug}`, score: 55,
    });
  }
  for (const c of ((comms.data as CommunitySummary[]) || []).slice(0, limit)) {
    hits.push({
      id: `community-${c.id}`, type: 'community', emoji: c.icon || '🌐',
      title: c.name, subtitle: c.description || undefined,
      href: `/community/${c.slug}`, score: 50,
    });
  }
  return hits;
}
