'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isSaved, toggleSave, type EntityType } from '@/lib/saved';
import { track } from '@/lib/analytics';

type Props = {
  entityType: EntityType;
  entityId: string | number;
  entityName?: string;
  className?: string;
};

/**
 * Sprint 4.1: Save ⭐ button. Anonymous click → redirect to signup with context.
 * Authed click → instant toggle in DB.
 */
export default function SaveButton({ entityType, entityId, entityName, className = '' }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    isSaved(entityType, entityId).then((v) => { setSaved(v); setLoading(false); });
  }, [entityType, entityId]);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    try {
      const newState = await toggleSave(entityType, entityId);
      setSaved(newState);
      track('save_item', { type: entityType, id: String(entityId), saved: newState });
    } catch (e) {
      // Not signed in — redirect to signup with contextual message
      const next = encodeURIComponent(window.location.pathname);
      const context = entityName ? `&saveContext=${encodeURIComponent(entityName)}` : '';
      router.push(`/auth/register?role=student&next=${next}${context}`);
      track('cta_click', { id: 'save_signup_gate', location: 'save_button', type: entityType });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <button disabled className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-400 text-sm ${className}`}>
        <span>⭐</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? 'إزالة من قائمتي' : 'احفظ في قائمتي'}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
        saved
          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700'
      } ${className}`}
    >
      <span aria-hidden="true">{saved ? '⭐' : '☆'}</span>
      <span>{saved ? 'محفوظ' : 'احفظ'}</span>
    </button>
  );
}
