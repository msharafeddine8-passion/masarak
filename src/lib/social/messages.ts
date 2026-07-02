// Social system · Phase 3 — Messaging client helpers (over the SECURITY DEFINER
// RPCs in 20260702_social_phase3_messaging.sql). Realtime is wired in the page.
import { supabase } from '@/lib/supabase';
import type { PersonCard } from '@/lib/social/friends';

export type AttachmentType = 'image' | 'pdf' | 'file';
export type ShareType = 'scholarship' | 'university' | 'major' | 'article';

export type Message = {
  id: number;
  sender_id: string;
  body: string | null;
  attachment_url: string | null;
  attachment_type: AttachmentType | null;
  share_type: ShareType | null;
  share_ref: string | null;
  share_data: { title?: string; subtitle?: string; emoji?: string; href?: string } | null;
  created_at: string;
  edited_at: string | null;
};

export type ConvSummary = {
  conversation_id: number;
  last_message_at: string;
  is_pinned: boolean;
  is_muted: boolean;
  other: PersonCard;
  last_message: { body: string | null; share_type: ShareType | null; attachment_type: AttachmentType | null; sender_id: string; created_at: string } | null;
  unread: number;
};

export async function getOrCreateDm(otherUserId: string): Promise<number | null> {
  const { data, error } = await supabase.rpc('get_or_create_dm', { p_other: otherUserId });
  if (error) { console.debug('[getOrCreateDm]', error.message); return null; }
  return data as number;
}

export function sendMessage(conversationId: number, opts: {
  body?: string; attachment_url?: string; attachment_type?: AttachmentType;
  share_type?: ShareType; share_ref?: string; share_data?: Message['share_data'];
}) {
  return supabase.rpc('send_message', {
    p_conversation: conversationId,
    p_body: opts.body ?? null,
    p_attachment_url: opts.attachment_url ?? null,
    p_attachment_type: opts.attachment_type ?? null,
    p_share_type: opts.share_type ?? null,
    p_share_ref: opts.share_ref ?? null,
    p_share_data: opts.share_data ?? null,
  });
}

export async function listConversations(): Promise<ConvSummary[]> {
  const { data } = await supabase.rpc('list_conversations');
  return (data as ConvSummary[]) || [];
}
export async function getMessages(conversationId: number, before?: string, limit = 40): Promise<Message[]> {
  const { data } = await supabase.rpc('get_messages', { p_conversation: conversationId, p_before: before ?? null, p_limit: limit });
  return (data as Message[]) || [];
}
export const markConversationRead = (conversationId: number) => supabase.rpc('mark_conversation_read', { p_conversation: conversationId });
export const togglePinConversation = (conversationId: number, pinned: boolean) => supabase.rpc('toggle_pin_conversation', { p_conversation: conversationId, p_pinned: pinned });
export const touchLastSeen = () => supabase.rpc('touch_last_seen');
export async function totalUnreadMessages(): Promise<number> {
  const { data } = await supabase.rpc('total_unread_messages');
  return Number(data) || 0;
}

// Upload a chat attachment to the existing public `images` bucket.
// Returns { url, type } or null on failure.
export async function uploadAttachment(userId: string, file: File): Promise<{ url: string; type: AttachmentType } | null> {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || ext === 'pdf';
  const path = `chat/${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('images').upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) { console.debug('[uploadAttachment]', error.message); return null; }
  const { data } = supabase.storage.from('images').getPublicUrl(path);
  return { url: data.publicUrl, type: isImage ? 'image' : isPdf ? 'pdf' : 'file' };
}
