// Social system · Phase 9 — Moderation client helpers.
import { supabase } from '@/lib/supabase';
import type { PersonCard } from '@/lib/social/friends';

export type Report = {
  id: number;
  target_type: string;
  target_id: string;
  reason: string | null;
  status: 'open' | 'reviewed' | 'dismissed';
  created_at: string;
  reporter: PersonCard;
  content: {
    body: string; author: PersonCard; community_slug: string; community_name: string;
    post_id: number; is_removed: boolean;
  } | null;
};

export async function listReports(status = 'open', limit = 50): Promise<Report[]> {
  const { data } = await supabase.rpc('list_reports', { p_status: status, p_limit: limit });
  return (data as Report[]) || [];
}

export const resolveReport = (id: number, action: 'remove' | 'dismiss' | 'reviewed') =>
  supabase.rpc('resolve_report', { p_id: id, p_action: action });
