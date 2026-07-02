// src/lib/notifications/client.ts
// Client-side helpers for the in-app notification system.

import { supabase } from '@/lib/supabase';

export type Notification = {
  id: number;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  entity_type: string | null;
  entity_id: string | null;
  channel: string;
  severity: 'info' | 'success' | 'warn' | 'urgent';
  read_at: string | null;
  acted_at: string | null;
  created_at: string;
};

export async function fetchMyNotifications(limit = 20): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    if (error.code !== '42P01' && error.code !== 'PGRST205') console.debug('[notif.fetch]', error);
    return [];
  }
  return (data || []) as Notification[];
}

export async function getUnreadCount(): Promise<number> {
  const { data, error } = await supabase.rpc('my_unread_notifications_count');
  if (error) return 0;
  return Number(data) || 0;
}

export async function markRead(id: number): Promise<void> {
  await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
}

export async function markAllRead(): Promise<number> {
  const { data, error } = await supabase.rpc('mark_all_notifications_read');
  if (error) return 0;
  return Number(data) || 0;
}

/** Send an in-app notification to oneself or another user (within RLS scope) */
export async function notifyUser(args: {
  user_id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  severity?: 'info' | 'success' | 'warn' | 'urgent';
  entity_type?: string;
  entity_id?: string;
}): Promise<void> {
  const { error } = await supabase.from('notifications').insert({
    user_id: args.user_id,
    type: args.type,
    title: args.title,
    body: args.body || null,
    link: args.link || null,
    severity: args.severity || 'info',
    entity_type: args.entity_type || null,
    entity_id: args.entity_id || null,
    channel: 'in_app',
  });
  if (error) console.debug('[notifyUser]', error);
}

// ── Phase 7: type → category + icon, and preferences ────────────────────────
export type NotifCategory = 'social' | 'universities' | 'content' | 'system';

const TYPE_META: Record<string, { category: NotifCategory; icon: string }> = {
  friend_request:   { category: 'social', icon: '👤' },
  friend_accept:    { category: 'social', icon: '🤝' },
  message:          { category: 'social', icon: '💬' },
  comment:          { category: 'social', icon: '💬' },
  reply:            { category: 'social', icon: '↩️' },
  like:             { category: 'social', icon: '❤️' },
  uni_announcement: { category: 'universities', icon: '📢' },
  uni_event:        { category: 'universities', icon: '📅' },
};

export function notifMeta(type: string): { category: NotifCategory; icon: string } {
  if (TYPE_META[type]) return TYPE_META[type];
  if (type.includes('scholarship')) return { category: 'content', icon: '🏆' };
  if (type.startsWith('student.'))  return { category: 'content', icon: '🎓' };
  return { category: 'system', icon: '🔔' };
}

export type NotifPrefs = { global_mute: boolean; social: boolean; universities: boolean; content: boolean; system: boolean };

export async function getNotifPrefs(): Promise<NotifPrefs> {
  const { data } = await supabase.rpc('get_notif_prefs');
  return (data as NotifPrefs) || { global_mute: false, social: true, universities: true, content: true, system: true };
}
export const setNotifPref = (category: string, enabled: boolean) => supabase.rpc('set_notif_pref', { p_category: category, p_enabled: enabled });
export const setGlobalMute = (b: boolean) => supabase.rpc('set_global_mute', { p_bool: b });
