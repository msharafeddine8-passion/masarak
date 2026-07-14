'use client';
// Smart actions bar for a school profile (Rebuild Wave 1): save (reused
// SaveButton) + follow (generic follows layer) + share (Web Share / WhatsApp).
// Renders inside the server page hero; resolves its own auth state.
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { isFollowing, toggleFollow, followersCount } from '@/lib/social/follows';
import SaveButton from '@/components/SaveButton';

export default function SchoolActions({ schoolId, schoolName }: { schoolId: number; schoolName: string }) {
  const tid = String(schoolId);
  const [loggedIn, setLoggedIn] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: { user } }, n] = await Promise.all([
        supabase.auth.getUser(),
        followersCount('school', tid).catch(() => 0),
      ]);
      if (!alive) return;
      setFollowers(n);
      if (user) {
        setLoggedIn(true);
        isFollowing('school', tid).then((v) => { if (alive) setFollowing(v); }).catch(() => {});
      }
    })();
    return () => { alive = false; };
  }, [tid]);

  async function onFollow() {
    if (!loggedIn || busy) return;
    setBusy(true);
    try {
      const now = await toggleFollow('school', tid);
      setFollowing(now);
      setFollowers((n) => Math.max(0, n + (now ? 1 : -1)));
    } catch { /* best-effort */ }
    setBusy(false);
  }

  function share() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `${schoolName} — ملف المدرسة على مسارك`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: schoolName, text, url }).catch(() => { /* cancelled */ });
    } else if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank', 'noopener');
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SaveButton entityType="school" entityId={schoolId} entityName={schoolName}
        className="!bg-white/15 !text-white hover:!bg-white/25 backdrop-blur rounded-xl px-4 py-2 text-sm font-bold" />
      {loggedIn && (
        <button type="button" onClick={onFollow} disabled={busy}
          className={`rounded-xl px-4 py-2 text-sm font-bold backdrop-blur transition-colors ${
            following ? 'bg-white text-primary' : 'bg-white/15 text-white hover:bg-white/25'
          }`}>
          {following ? '✓ أتابعها' : '🔔 تابِع المدرسة'}
          {followers > 0 && <span className="opacity-75 font-semibold"> · {followers}</span>}
        </button>
      )}
      <button type="button" onClick={share}
        className="bg-white/15 text-white hover:bg-white/25 backdrop-blur rounded-xl px-4 py-2 text-sm font-bold transition-colors">
        📤 مشاركة
      </button>
    </div>
  );
}
