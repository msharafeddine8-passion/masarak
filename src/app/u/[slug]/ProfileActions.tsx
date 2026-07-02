'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { friendshipStatus, sendFriendRequest, type FriendStatus } from '@/lib/social/friends';

/**
 * Public profile action bar. Phase 1: Share (+ owner Edit).
 * Phase 2: friend button (add / accept / pending / friends) for other users.
 * Message button arrives in Phase 3 (messaging).
 */
export default function ProfileActions({
  slug, isOwner, name, targetUserId, isLoggedIn,
}: { slug: string; isOwner: boolean; name: string; targetUserId: string; isLoggedIn: boolean }) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<FriendStatus | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOwner && isLoggedIn) friendshipStatus(targetUserId).then(setStatus);
  }, [isOwner, isLoggedIn, targetUserId]);

  async function share() {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/u/${slug}` : `/u/${slug}`;
    try {
      if (navigator.share) { await navigator.share({ title: `${name} · مسارك`, url }); return; }
    } catch { /* cancelled */ }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* blocked */ }
  }

  async function addFriend() {
    setBusy(true);
    try { await sendFriendRequest(targetUserId); setStatus(await friendshipStatus(targetUserId)); }
    finally { setBusy(false); }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Friend button (other users only) */}
      {!isOwner && isLoggedIn && status && status !== 'blocked_by' && status !== 'blocked' && (
        status === 'friends' ? (
          <Link href="/friends" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-mint-light text-primary font-bold text-sm">👥 أصدقاء ✓</Link>
        ) : status === 'pending_out' ? (
          <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-ink-muted font-bold text-sm">تم إرسال الطلب</span>
        ) : (
          <button onClick={addFriend} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 disabled:opacity-50 shadow-soft">
            <span>➕</span><span>{status === 'pending_in' ? 'قبول الطلب' : 'إضافة صديق'}</span>
          </button>
        )
      )}

      {/* Logged-out visitors: prompt to join before friending */}
      {!isOwner && !isLoggedIn && (
        <Link href="/auth/login" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-soft">
          <span>➕</span><span>إضافة صديق</span>
        </Link>
      )}

      <button onClick={share} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mint-light text-primary font-bold text-sm hover:bg-mint transition-colors">
        <span>{copied ? '✓' : '🔗'}</span><span>{copied ? 'تم النسخ' : 'مشاركة'}</span>
      </button>

      {isOwner && (
        <Link href="/profile" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mint-light text-primary font-bold text-sm hover:bg-mint transition-colors">
          <span>✏️</span><span>تعديل ملفي</span>
        </Link>
      )}
    </div>
  );
}
