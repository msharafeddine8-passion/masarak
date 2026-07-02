'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchAll, type SearchHit } from '@/lib/search-index';
import { searchSocial } from '@/lib/social/search';
import { track } from '@/lib/analytics';

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get('q') || '';
  const [q, setQ] = useState(initial);

  // Keep URL in sync (without spamming history)
  useEffect(() => {
    const id = setTimeout(() => {
      const next = q.trim();
      if (next === (params.get('q') || '')) return;
      const url = next ? `/search?q=${encodeURIComponent(next)}` : '/search';
      router.replace(url, { scroll: false });
    }, 200);
    return () => clearTimeout(id);
  }, [q, params, router]);

  const staticHits = useMemo(() => searchAll(q, 60), [q]);
  const [socialHits, setSocialHits] = useState<SearchHit[]>([]);
  useEffect(() => {
    let alive = true;
    if (q.trim().length < 2) { setSocialHits([]); return; }
    const id = setTimeout(() => { searchSocial(q, 20).then(h => { if (alive) setSocialHits(h); }); }, 250);
    return () => { alive = false; clearTimeout(id); };
  }, [q]);
  const hits: SearchHit[] = useMemo(() => [...staticHits, ...socialHits], [staticHits, socialHits]);

  // Group results by type for SEO + UX
  const grouped = useMemo(() => {
    const g: Record<string, SearchHit[]> = {};
    for (const h of hits) {
      (g[h.type] ||= []).push(h);
    }
    return g;
  }, [hits]);

  const labels: Record<string, string> = {
    person: 'الأشخاص', community: 'المجتمعات',
    university: 'الجامعات', school: 'المدارس', vocational: 'التعليم المهني',
    major: 'التخصصات', career: 'المهن', scholarship: 'المنح',
    blog: 'المدونة والأدلة', page: 'الأدوات والصفحات',
  };

  return (
    <main className="min-h-screen bg-bg py-8 px-4" dir="rtl">
      <div className="container mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-ink-muted hover:text-primary inline-block mb-4">← الرئيسية</Link>

        <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">
          🔍 البحث
        </h1>
        <p className="text-ink-muted mb-6">ابحث في الأشخاص، المجتمعات، الجامعات، المنح، الأدوات، والمزيد.</p>

        <div className="bg-surface rounded-2xl border-2 border-line p-3 mb-6 shadow-sm sticky top-2 z-10">
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="مثلاً: AUB، هندسة، منح، حاسبة كلفة..."
            dir="rtl"
            className="w-full outline-none text-lg px-2 py-2"
          />
        </div>

        {q.trim() === '' ? (
          <div className="text-center py-16 text-ink-muted">
            <div className="text-5xl mb-3">⌨️</div>
            <p>ابدأ بالكتابة للبحث.</p>
            <p className="text-sm mt-2 opacity-70">اضغط <kbd className="bg-bg-soft border px-2 py-0.5 rounded text-xs">Ctrl/⌘ + K</kbd> من أي صفحة لفتح البحث السريع.</p>
          </div>
        ) : hits.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🤷</div>
            <h2 className="text-xl font-bold text-ink mb-2">ما لقينا نتيجة</h2>
            <p className="text-ink-muted text-sm">جرب كلمة مختلفة أو تصفّح <Link href="/universities" className="text-primary font-bold hover:underline">الجامعات</Link> أو <Link href="/scholarships" className="text-primary font-bold hover:underline">المنح</Link>.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <p className="text-sm text-ink-muted">
              <strong className="text-primary">{hits.length}</strong> نتيجة لـ "<strong>{q}</strong>"
            </p>
            {Object.entries(grouped).map(([type, items]) => (
              <section key={type}>
                <h2 className="text-lg font-extrabold text-primary mb-3 border-b border-line pb-2">
                  {labels[type] || type} <span className="text-xs font-normal text-ink-muted">({items.length})</span>
                </h2>
                <ul className="space-y-2">
                  {items.map(h => (
                    <li key={h.id}>
                      <Link
                        href={h.href}
                        onClick={() => track('cta_click', { id: 'search_hit', location: 'search_page', target: h.type })}
                        className="flex items-center gap-3 bg-surface rounded-xl border border-line p-3 hover:border-primary hover:shadow-sm transition-all"
                      >
                        <span className="text-2xl flex-shrink-0">{h.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-ink">{h.title}</div>
                          {h.subtitle && <div className="text-xs text-ink-muted">{h.subtitle}</div>}
                        </div>
                        <span className="text-primary text-xl">←</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-ink-muted">جاري التحميل...</div></div>}>
      <SearchInner />
    </Suspense>
  );
}
