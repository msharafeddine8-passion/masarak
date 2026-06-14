// src/lib/notifications/client.ts
// Client-side helpers for the in-app notification system.

import { supabase } from '@/lib/supabase';

export type Notification = {
  id: number;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link_url: string | null;
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
  link_url?: string;
  severity?: 'info' | 'success' | 'warn' | 'urgent';
  entity_type?: string;
  entity_id?: string;
}): Promise<void> {
  const { error } = await supabase.from('notifications').insert({
    user_id: args.user_id,
    type: args.type,
    title: args.title,
    body: args.body || null,
    link_url: args.link_url || null,
    severity: args.severity || 'info',
    entity_type: args.entity_type || null,
    entity_id: args.entity_id || null,
    channel: 'in_app',
  });
  if (error) console.debug('[notifyUser]', error);
}
