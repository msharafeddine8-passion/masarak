// Social system · Phase 4 — Communities client helpers (over the RPCs in
// 20260702_social_phase4_communities.sql).
import { supabase } from '@/lib/supabase';
import type { PersonCard } from '@/lib/social/friends';

export type CommunityRole = 'admin' | 'moderator' | 'member' | null;

export type CommunitySummary = {
  id: number; slug: string; name: string; description: string | null;
  icon: string; category: string | null; member_count: number; post_count: number;
  is_official: boolean; my_role: CommunityRole;
};
export type Community = CommunitySummary & { cover_url: string | null; rules: string | null };
export type MyCommunity = { id: number; slug: string; name: string; icon: string; member_count: number; my_role: CommunityRole };

export type Post = {
  id: number; body: string; image_url: string | null; tags: string[] | null;
  is_pinned: boolean; like_count: number; comment_count: number; created_at: string;
  author: PersonCard; liked: boolean;
};
export type Comment = {
  id: number; parent_id: number | null; body: string; like_count: number;
  created_at: string; author: PersonCard; liked: boolean;
};

export const CATEGORIES = [
  { key: 'major',       icon: '🎓', ar: 'تخصصات' },
  { key: 'destination', icon: '🌍', ar: 'وجهات دراسة' },
  { key: 'topic',       icon: '💬', ar: 'مواضيع' },
  { key: 'stage',       icon: '🎒', ar: 'مراحل' },
] as const;

export async function listCommunities(q?: string, category?: string): Promise<CommunitySummary[]> {
  const { data } = await supabase.rpc('list_communities', { p_q: q ?? null, p_category: category ?? null });
  return (data as CommunitySummary[]) || [];
}
export async function getCommunity(slug: string): Promise<Community | null> {
  const { data } = await supabase.rpc('get_community', { p_slug: slug });
  return (data as Community) ?? null;
}
export async function myCommunities(): Promise<MyCommunity[]> {
  const { data } = await supabase.rpc('my_communities');
  return (data as MyCommunity[]) || [];
}
export async function listPosts(communityId: number, before?: string, limit = 20): Promise<Post[]> {
  const { data } = await supabase.rpc('list_posts', { p_community: communityId, p_before: before ?? null, p_limit: limit });
  return (data as Post[]) || [];
}
export async function listComments(postId: number): Promise<Comment[]> {
  const { data } = await supabase.rpc('list_comments', { p_post: postId });
  return (data as Comment[]) || [];
}

export const createCommunity = (p: { slug: string; name: string; description?: string; icon?: string; category?: string; rules?: string }) =>
  supabase.rpc('create_community', { p_slug: p.slug, p_name: p.name, p_description: p.description ?? null, p_icon: p.icon ?? '👥', p_category: p.category ?? 'topic', p_rules: p.rules ?? null });
export const joinCommunity  = (id: number) => supabase.rpc('join_community',  { p_community: id });
export const leaveCommunity = (id: number) => supabase.rpc('leave_community', { p_community: id });
export const createPost    = (communityId: number, body: string, imageUrl?: string, tags?: string[]) =>
  supabase.rpc('create_post', { p_community: communityId, p_body: body, p_image_url: imageUrl ?? null, p_tags: tags ?? [] });
export const createComment = (postId: number, body: string, parentId?: number) =>
  supabase.rpc('create_comment', { p_post: postId, p_body: body, p_parent: parentId ?? null });
export async function toggleReaction(targetType: 'post' | 'comment', targetId: number): Promise<boolean> {
  const { data } = await supabase.rpc('toggle_reaction', { p_target_type: targetType, p_target_id: targetId });
  return !!data;
}
export const pinPost       = (postId: number, pinned: boolean) => supabase.rpc('pin_post', { p_post: postId, p_pinned: pinned });
export const removePost    = (postId: number) => supabase.rpc('remove_post', { p_post: postId });
export const removeComment = (commentId: number) => supabase.rpc('remove_comment', { p_comment: commentId });
export const reportContent = (targetType: string, targetId: string, reason?: string) =>
  supabase.rpc('report_content', { p_target_type: targetType, p_target_id: targetId, p_reason: reason ?? null });

export const isMod = (role: CommunityRole) => role === 'admin' || role === 'moderator';
