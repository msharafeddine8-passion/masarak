// src/lib/saved.ts — FIX-01: aligned with actual DB columns (item_type/item_id/item_data)
import { supabase } from '@/lib/supabase';

// Must match DB CHECK constraint: item_type IN ('university','school','vocational','major','scholarship','internship')
export type EntityType =
  | 'university' | 'school' | 'vocational' | 'major' | 'scholarship' | 'internship';

export type SavedItem = {
  id: number;
  item_type: EntityType;
  item_id: string;
  item_data: Record<string, unknown>;
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

export async function isSaved(item_type: EntityType, item_id: string | number): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from('saved_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('item_type', item_type)
    .eq('item_id', String(item_id))
    .maybeSingle();
  if (error && !isMissingTable(error)) {
    console.warn('[isSaved]', error);
  }
  return Boolean(data);
}

export async function toggleSave(
  item_type: EntityType,
  item_id: string | number,
  item_data: Record<string, unknown> = {}
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new SaveError('not_signed_in', 'يجب تسجيل الدخول لحفظ العناصر');
  const id = String(item_id);

  const { data: existing, error: selErr } = await supabase
    .from('saved_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('item_type', item_type)
    .eq('item_id', id)
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

  // upsert + ignoreDuplicates: a double-tap / concurrent save is a no-op instead
  // of a unique-violation error (saved_items has UNIQUE(user_id,item_type,item_id)).
  const { error: insErr } = await supabase.from('saved_items').upsert({
    user_id: user.id,
    item_type,
    item_id: id,
    item_data,
  }, { onConflict: 'user_id,item_type,item_id', ignoreDuplicates: true });
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
    .select('id, item_type, item_id, item_data, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) {
    if (!isMissingTable(error)) console.warn('[listSaved]', error);
    return [];
  }
  return (data || []) as SavedItem[];
}
