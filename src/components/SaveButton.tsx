'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isSaved, toggleSave, SaveError, type EntityType } from '@/lib/saved';
import { track } from '@/lib/analytics';
import { emit } from '@/lib/events/emit';

type Props = {
  entityType: EntityType;
  entityId: string | number;
  entityName?: string;
  className?: string;
};

export default function SaveButton({ entityType, entityId, entityName, className = '' }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'ok'|'warn'|'info'; text: string } | null>(null);

  useEffect(() => {
    isSaved(entityType, entityId).then((v) => { setSaved(v); setLoading(false); });
  }, [entityType, entityId]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const newState = await toggleSave(entityType, entityId, entityName ? { name: entityName } : {});
      setSaved(newState);
      track('save_item', { type: entityType, id: String(entityId), saved: newState });

      // Typed event → triggers notifications + lead scoring side-effects
      if (newState) {
        if (entityType === 'university') {
          void emit('student.saved_university', { entity_type: 'university', entity_id: String(entityId) });
        } else if (entityType === 'school') {
          void emit('student.saved_school', { entity_type: 'school', entity_id: String(entityId) });
        } else if (entityType === 'scholarship') {
          void emit('student.saved_scholarship', { entity_type: 'scholarship', entity_id: String(entityId) });
        }
      } else if (entityType === 'university') {
        void emit('student.unsaved_university', { entity_type: 'university', entity_id: String(entityId) });
      }

      setMsg({ tone: 'ok', text: newState ? '✓ تم الحفظ بقائمتك' : 'تم إزالة العنصر من قائمتك' });
    } catch (e) {
      if (e instanceof SaveError) {
        if (e.reason === 'not_signed_in') {
          const next = encodeURIComponent(window.location.pathname);
          const context = entityName ? '&saveContext=' + encodeURIComponent(entityName) : '';
          router.push('/auth/register?role=student&next=' + next + context);
          track('cta_click', { id: 'save_signup_gate', location: 'save_button', type: entityType });
          return;
        }
        if (e.reason === 'feature_not_ready') {
          setMsg({ tone: 'info', text: e.message });
        } else {
          setMsg({ tone: 'warn', text: e.message || 'فشل الحفظ — راجع console للتفاصيل' });
        }
      } else {
        const detail = e instanceof Error ? e.message : String(e);
        console.error('[SaveButton]', e);
        setMsg({ tone: 'warn', text: 'فشل: ' + detail.slice(0, 100) });
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <button disabled className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-400 text-sm ' + className}>
        <span>⭐</span>
      </button>
    );
  }

  const toneClass =
    msg?.tone === 'ok'   ? 'bg-green-100 text-green-700 border-green-200' :
    msg?.tone === 'warn' ? 'bg-red-100 text-red-700 border-red-200' :
                           'bg-blue-100 text-blue-700 border-blue-200';

  const btnCls = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ' +
    (saved
      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
      : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700');

  return (
    <span className={'inline-flex flex-col items-stretch gap-1 ' + className}>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-pressed={saved}
        aria-label={saved ? 'إزالة من قائمتي' : 'احفظ في قائمتي'}
        className={btnCls}
      >
        <span aria-hidden="true">{saved ? '⭐' : '☆'}</span>
        <span>{saved ? 'محفوظ' : 'احفظ'}</span>
      </button>
      {msg && (
        <span role="status" className={'text-xs font-bold px-2 py-1 rounded-lg border ' + toneClass}>
          {msg.text}
        </span>
      )}
    </span>
  );
}
