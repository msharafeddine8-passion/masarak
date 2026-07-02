// Social system · Phase 6 — Smart Feed client helpers.
import { supabase } from '@/lib/supabase';
import type { PersonCard } from '@/lib/social/friends';

export type FeedItem =
  | { kind: 'community_post'; ts: string; data: {
      post_id: number; community: { slug: string; name: string; icon: string };
      author: PersonCard; body: string; like_count: number; comment_count: number; reason: 'community' | 'friend';
    } }
  | { kind: 'uni_announcement'; ts: string; data: {
      uni_id: number; uni_name: string; title: string; body: string;
    } };

export type UpcomingItem = { uni_id: number; uni_name: string; title: string; location: string | null; event_type: string; starts_at: string };

export async function getFeed(limit = 30, before?: string): Promise<FeedItem[]> {
  const { data } = await supabase.rpc('get_feed', { p_limit: limit, p_before: before ?? null });
  return (data as FeedItem[]) || [];
}
export async function getUpcoming(limit = 6): Promise<UpcomingItem[]> {
  const { data } = await supabase.rpc('get_upcoming', { p_limit: limit });
  return (data as UpcomingItem[]) || [];
}
