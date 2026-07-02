// Social system · Phase 2 — Friends client helpers (thin wrappers over the
// SECURITY DEFINER RPCs in 20260702_social_phase2_friends.sql).
import { supabase } from '@/lib/supabase';

export type FriendStatus =
  | 'self' | 'none' | 'pending_out' | 'pending_in' | 'friends' | 'blocked' | 'blocked_by';

export type PersonCard = {
  user_id: string;
  slug: string | null;
  full_name: string | null;
  avatar_url: string | null;
  major: string | null;
  university_name: string | null;
  school_name: string | null;
  city: string | null;
  country_code: string | null;
  is_public: boolean;
  status: FriendStatus;
};

export type FriendRequests = {
  incoming: { id: number; person: PersonCard }[];
  outgoing: { id: number; person: PersonCard }[];
};

// actions
export const sendFriendRequest    = (addressee: string) => supabase.rpc('send_friend_request', { p_addressee: addressee });
export const respondFriendRequest = (id: number, accept: boolean) => supabase.rpc('respond_friend_request', { p_id: id, p_accept: accept });
export const cancelFriendRequest  = (id: number) => supabase.rpc('cancel_friend_request', { p_id: id });
export const removeFriend         = (other: string) => supabase.rpc('remove_friend', { p_other: other });
export const blockUser            = (other: string) => supabase.rpc('block_user', { p_other: other });
export const unblockUser          = (other: string) => supabase.rpc('unblock_user', { p_other: other });

// queries
export async function friendshipStatus(other: string): Promise<FriendStatus> {
  const { data } = await supabase.rpc('friendship_status', { p_other: other });
  return (data as FriendStatus) || 'none';
}
export async function listMyFriends(): Promise<PersonCard[]> {
  const { data } = await supabase.rpc('list_my_friends');
  return (data as PersonCard[]) || [];
}
export async function listFriendRequests(): Promise<FriendRequests> {
  const { data } = await supabase.rpc('list_friend_requests');
  return (data as FriendRequests) || { incoming: [], outgoing: [] };
}
export async function suggestedFriends(limit = 12): Promise<PersonCard[]> {
  const { data } = await supabase.rpc('suggested_friends', { p_limit: limit });
  return (data as PersonCard[]) || [];
}
export async function searchPeople(q: string, limit = 20): Promise<PersonCard[]> {
  const { data } = await supabase.rpc('search_people', { p_q: q, p_limit: limit });
  return (data as PersonCard[]) || [];
}
export async function friendsCount(userId: string): Promise<number> {
  const { data } = await supabase.rpc('friends_count', { p_user: userId });
  return Number(data) || 0;
}
export async function mutualFriends(other: string): Promise<PersonCard[]> {
  const { data } = await supabase.rpc('mutual_friends', { p_other: other });
  return (data as PersonCard[]) || [];
}
