// src/lib/saved.ts — Sprint 4.1 client helpers for saved_items.
// Gracefully handles the empty-table case (returns []).

import { supabase } from '@/lib/supabase';

export type EntityType =
  | 'university' | 'school' | 'major' | 'scholarship'
  | 'career' | 'internship' | 'vocational';

export type SavedItem = {
  id: number;
  entity_type: EntityType;
  entity_id: string;
  notes?: string | null;
  created_at: string;
};

/** Whether the current user has this entity saved. Returns false when signed out. */
export async function isSaved(entity_type: EntityType, entity_id: string | number): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from('saved_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('entity_type', entity_type)
    .eq('entity_id', String(entity_id))
    .maybeSingle();
  return Boolean(data);
}

/** Toggle save/unsave for the current user. Returns the new saved state. */
export async function toggleSave(entity_type: EntityType, entity_id: string | number): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Caller should handle by redirecting to /auth/register
    throw new Error('not_signed_in');
  }
  const id = String(entity_id);
  // Check current state
  const { data: existing } = await supabase
    .from('saved_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('entity_type', entity_type)
    .eq('entity_id', id)
    .maybeSingle();

  if (existing) {
    await supabase.from('saved_items').delete().eq('id', existing.id);
    return false;
  }
  await supabase.from('saved_items').insert({
    user_id: user.id,
    entity_type,
    entity_id: id,
  });
  return true;
}

/** All saved items for the signed-in user, newest first. */
export async function listSaved(): Promise<SavedItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('saved_items')
    .select('id, entity_type, entity_id, notes, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []) as SavedItem[];
}
