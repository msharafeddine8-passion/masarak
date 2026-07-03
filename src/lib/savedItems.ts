// src/lib/savedItems.ts — activity_log helpers.
//
// FIX (audit C4): the saved_items read/write helpers that used to live here
// (getSavedItems / saveItem / unsaveItem) were removed. They were a SECOND,
// unguarded write path to the saved_items table — no error handling, `any`
// payloads — and nothing imported them: all real saving goes through the typed,
// error-handling lib/saved.ts (SaveButton, /profile/saved). Keeping two paths to
// the same table risks semantic drift, so the dead path is gone. This module now
// holds only the activity_log helpers (getActivity is used by the profile
// Overview/Activity tabs).
import { supabase } from '@/lib/supabase';

export async function logActivity(
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  meta?: Record<string, unknown>
) {
  return supabase.from('activity_log').insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    meta: meta || {},
  });
}

export async function getActivity(userId: string, limit = 20) {
  const { data } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}
