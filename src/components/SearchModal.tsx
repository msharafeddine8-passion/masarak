'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchAll, type SearchHit } from '@/lib/search-index';
import { searchSocial } from '@/lib/social/search';
import { track } from '@/lib/analytics';
import { useI18n } from '@/lib/i18n';

/**
 * Sprint 3.4: ⌘K / Ctrl+K global search modal.
 * Mounted once in the header. Listens for the keyboard shortcut and renders
 * a centered dialog with live search across all entities.
 */
export default function SearchModal() {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Focus management: trap Tab within the dialog, lock body scroll, and restore
  // focus to the previously-focused element on close (a11y — WAI-ARIA dialog).
  useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) { e.preventDefault(); last.focus(); }
      } else if (active === last) { e.preventDefault(); first.focus(); }
    }

    document.addEventListener('keydown', onTab);
    return () => {
      document.removeEventListener('keydown', onTab);
      document.body.style.overflow = prevOverflow;
      prevFocusRef.current?.focus?.();
    };
  }, [open]);

  const staticHits = useMemo(() => searchAll(q, 8), [q]);
  const [socialHits, setSocialHits] = useState<SearchHit[]>([]);
  useEffect(() => {
    let alive = true;
    if (q.trim().length < 2) { setSocialHits([]); return; }
    const id = setTimeout(() => { searchSocial(q).then(h => { if (alive) setSocialHits(h); }); }, 250);
    return () => { alive = false; clearTimeout(id); };
  }, [q]);
  const hits: SearchHit[] = useMemo(() => [...staticHits, ...socialHits], [staticHits, socialHits]);

  // Navigate with arrow keys
  useEffect(() => {
    if (!open) return;
    function onArrow(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx(i => Math.min(i + 1, hits.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && hits[selectedIdx]) {
        e.preventDefault();
        const hit = hits[selectedIdx];
        track('cta_click', { id: 'search_hit', location: 'cmd_k', target: hit.type });
        router.push(hit.href);
        setOpen(false);
        setQ('');
      }
    }
    document.addEventListener('keydown', onArrow);
    return () => document.removeEventListener('keydown', onArrow);
  }, [open, hits, selectedIdx, router]);

  // Reset selection when query changes
  useEffect(() => { setSelectedIdx(0); }, [q]);

  if (!open) {
    // Render an invisible trigger that the header button targets
    return (
      <button
        type="button"
        aria-label={t('search.openSearch')}
        onClick={() => setOpen(true)}
        data-search-trigger
        className="hidden"
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      role="dialog"
      aria-modal="true"
      aria-label={t('search.dialogLabel')}
    >
      <div ref={panelRef} className="bg-surface rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
          <span className="text-xl">🔍</span>
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={t('search.placeholder')}
            dir="rtl"
            className="flex-1 outline-none text-base bg-transparent"
          />
          <kbd className="hidden sm:inline-block text-[10px] bg-bg-soft text-ink-muted border border-line px-1.5 py-0.5 rounded">ESC</kbd>
          <button onClick={() => setOpen(false)} aria-label={t('search.close')} className="text-ink-subtle hover:text-ink-muted text-xl">×</button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {q.trim() === '' ? (
            <div className="p-8 text-center text-ink-subtle text-sm">
              {t('search.emptyHint')}
            </div>
          ) : hits.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-3xl mb-2">🤔</div>
              <p className="text-sm text-ink-subtle mb-2">{t('search.noResults')} "<strong>{q}</strong>"</p>
              <Link
                href={`/search?q=${encodeURIComponent(q)}`}
                onClick={() => setOpen(false)}
                className="text-blue-600 text-sm hover:underline"
              >
                {t('search.fullSearchPage')} ←
              </Link>
            </div>
          ) : (
            <ul className="py-2" role="listbox">
              {hits.map((h, i) => (
                <li key={h.id}>
                  <Link
                    href={h.href}
                    onClick={() => {
                      track('cta_click', { id: 'search_hit', location: 'cmd_k', target: h.type });
                      setOpen(false);
                      setQ('');
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 ${
                      i === selectedIdx ? 'bg-blue-50' : 'hover:bg-bg-soft'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{h.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-ink text-sm truncate">{h.title}</div>
                      {h.subtitle && <div className="text-xs text-ink-subtle truncate">{h.subtitle}</div>}
                    </div>
                    <span className="text-[10px] uppercase tracking-wide bg-bg-soft text-ink-subtle px-2 py-0.5 rounded-full flex-shrink-0">
                      {h.type}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line bg-bg-soft px-4 py-2 text-xs text-ink-subtle flex items-center justify-between">
          <span>↑ ↓ {t('search.navigate')} · ⏎ {t('search.openHint')}</span>
          {q && (
            <Link
              href={`/search?q=${encodeURIComponent(q)}`}
              onClick={() => setOpen(false)}
              className="text-blue-600 hover:underline"
            >
              {t('search.fullSearch')} ←
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
