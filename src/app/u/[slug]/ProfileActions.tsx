'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Public profile action bar. Phase 1 ships Share (+ Edit for the owner).
 * Add-friend / Message / Follow buttons are added in Phases 2–3 once those
 * systems exist — we don't ship dead buttons ahead of their features.
 */
export default function ProfileActions({ slug, isOwner, name }: { slug: string; isOwner: boolean; name: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/u/${slug}` : `/u/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} · مسارك`, url });
        return;
      }
    } catch { /* user cancelled — fall through to copy */ }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked — no-op */ }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={share}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-soft"
      >
        <span>{copied ? '✓' : '🔗'}</span>
        <span>{copied ? 'تم النسخ' : 'مشاركة الملف'}</span>
      </button>

      {isOwner && (
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mint-light text-primary font-bold text-sm hover:bg-mint transition-colors"
        >
          <span>✏️</span>
          <span>تعديل ملفي</span>
        </Link>
      )}
    </div>
  );
}
