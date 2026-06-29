'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchAll, type SearchHit } from '@/lib/search-index';
import { track } from '@/lib/analytics';

/**
 * Sprint 3.4: ⌘K / Ctrl+K global search modal.
 * Mounted once in the header. Listens for the keyboard shortcut and renders
 * a centered dialog with live search across all entities.
 */
export default function SearchModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);

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

  const hits: SearchHit[] = useMemo(() => searchAll(q, 12), [q]);

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
        aria-label="فتح البحث"
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
      aria-label="بحث"
    >
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
          <span className="text-xl">🔍</span>
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="ابحث عن جامعة، تخصص، منحة، أداة..."
            dir="rtl"
            className="flex-1 outline-none text-base bg-transparent"
          />
          <kbd className="hidden sm:inline-block text-[10px] bg-bg-soft text-ink-muted border border-line px-1.5 py-0.5 rounded">ESC</kbd>
          <button onClick={() => setOpen(false)} aria-label="إغلاق" className="text-ink-subtle hover:text-ink-muted text-xl">×</button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {q.trim() === '' ? (
            <div className="p-8 text-center text-ink-subtle text-sm">
              ابدأ بالكتابة للبحث في الجامعات، المدارس، المنح، الأدوات والمدونة
            </div>
          ) : hits.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-3xl mb-2">🤔</div>
              <p className="text-sm text-ink-subtle mb-2">ما لقينا نتيجة لـ "<strong>{q}</strong>"</p>
              <Link
                href={`/search?q=${encodeURIComponent(q)}`}
                onClick={() => setOpen(false)}
                className="text-blue-600 text-sm hover:underline"
              >
                صفحة البحث الكاملة ←
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
          <span>↑ ↓ تنقل · ⏎ افتح</span>
          {q && (
            <Link
              href={`/search?q=${encodeURIComponent(q)}`}
              onClick={() => setOpen(false)}
              className="text-blue-600 hover:underline"
            >
              البحث الكامل ←
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
