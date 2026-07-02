// Social system · Phase 5 — Follows client helpers.
import { supabase } from '@/lib/supabase';

export async function isFollowing(type: string, id: string): Promise<boolean> {
  const { data } = await supabase.rpc('is_following', { p_target_type: type, p_target_id: id });
  return !!data;
}
export async function followersCount(type: string, id: string): Promise<number> {
  const { data } = await supabase.rpc('followers_count', { p_target_type: type, p_target_id: id });
  return Number(data) || 0;
}
export async function toggleFollow(type: string, id: string): Promise<boolean> {
  const { data } = await supabase.rpc('toggle_follow', { p_target_type: type, p_target_id: id });
  return !!data;
}
export async function myFollows(type: string): Promise<string[]> {
  const { data } = await supabase.rpc('my_follows', { p_target_type: type });
  return (data as string[]) || [];
}

// Message a university — only allowed for premium universities (Phase 12).
export async function canMessageUniversity(uniId: number): Promise<boolean> {
  const { data } = await supabase.rpc('university_can_message', { p_uni_id: uniId });
  return !!data;
}
export const messageUniversity = (uniId: number, body: string) =>
  supabase.rpc('message_university', { p_uni_id: uniId, p_body: body });
