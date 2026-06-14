// src/lib/saved.ts — Sprint 4.1 + Fix #3 + surface real errors
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

export class SaveError extends Error {
  constructor(public reason: 'not_signed_in' | 'feature_not_ready' | 'network', message: string) {
    super(message);
    this.name = 'SaveError';
  }
}

function isMissingTable(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  if (err.code === '42P01' || err.code === 'PGRST205') return true;
  const m = (err.message || '').toLowerCase();
  return (m.includes('relation') && m.includes('does not exist'))
      || (m.includes('saved_items') && m.includes('not found'));
}

export async function isSaved(entity_type: EntityType, entity_id: string | number): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from('saved_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('entity_type', entity_type)
    .eq('entity_id', String(entity_id))
    .maybeSingle();
  if (error && !isMissingTable(error)) {
    console.warn('[isSaved]', error);
  }
  return Boolean(data);
}

export async function toggleSave(entity_type: EntityType, entity_id: string | number): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new SaveError('not_signed_in', 'يجب تسجيل الدخول لحفظ العناصر');
  const id = String(entity_id);

  const { data: existing, error: selErr } = await supabase
    .from('saved_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('entity_type', entity_type)
    .eq('entity_id', id)
    .maybeSingle();

  if (selErr && isMissingTable(selErr)) {
    throw new SaveError('feature_not_ready', 'ميزة الحفظ قيد التحضير — رح تكون جاهزة قريباً!');
  }
  if (selErr) {
    console.error('[toggleSave.select]', selErr);
  }

  if (existing) {
    const { error: delErr } = await supabase.from('saved_items').delete().eq('id', existing.id);
    if (delErr) {
      console.error('[toggleSave.delete]', delErr);
      throw new SaveError('network', `فشل الحذف: ${delErr.message}`);
    }
    return false;
  }
  const { error: insErr } = await supabase.from('saved_items').insert({
    user_id: user.id,
    entity_type,
    entity_id: id,
  });
  if (insErr) {
    if (isMissingTable(insErr)) {
      throw new SaveError('feature_not_ready', 'ميزة الحفظ قيد التحضير — رح تكون جاهزة قريباً!');
    }
    console.error('[toggleSave.insert]', insErr);
    throw new SaveError('network', `فشل الحفظ: ${insErr.message || 'unknown error'}`);
  }
  return true;
}

export async function listSaved(): Promise<SavedItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('saved_items')
    .select('id, entity_type, entity_id, notes, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) {
    if (!isMissingTable(error)) console.warn('[listSaved]', error);
    return [];
  }
  return (data || []) as SavedItem[];
}
