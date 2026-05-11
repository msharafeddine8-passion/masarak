import { supabase } from '@/lib/supabase';

export async function getSavedItems(userId: string) {
  const { data } = await supabase.from('saved_items').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}

export async function saveItem(userId: string, itemType: string, itemId: string, itemData: any) {
  return supabase.from('saved_items').upsert({ user_id: userId, item_type: itemType, item_id: itemId, item_data: itemData }, { onConflict: 'user_id,item_type,item_id' });
}

export async function unsaveItem(userId: string, itemType: string, itemId: string) {
  return supabase.from('saved_items').delete().eq('user_id', userId).eq('item_type', itemType).eq('item_id', itemId);
}

export async function logActivity(userId: string, action: string, entityType?: string, entityId?: string, meta?: any) {
  return supabase.from('activity_log').insert({ user_id: userId, action, entity_type: entityType, entity_id: entityId, meta: meta || {} });
}

export async function getActivity(userId: string, limit = 20) {
  const { data } = await supabase.from('activity_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
  return data || [];
}
