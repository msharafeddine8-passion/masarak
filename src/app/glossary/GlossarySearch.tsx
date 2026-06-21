'use client';

import { useMemo, useState } from 'react';

type Term = {
  id: string;
  term_en: string;
  term_ar: string;
  definition_ar: string;
  example_ar: string | null;
  category: string;
};

function normalize(s: string): string {
  return s.toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();
}

export default function GlossarySearch({
  grouped,
  categoryLabels,
}: {
  grouped: Record<string, Term[]>;
  categoryLabels: Record<string, string>;
}) {
  const [q, setQ] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    const n = normalize(q);
    const out: Record<string, Term[]> = {};
    for (const [cat, list] of Object.entries(grouped)) {
      if (activeCategory !== 'all' && activeCategory !== cat) continue;
      const matched = n
        ? list.filter(t =>
            normalize(t.term_en).includes(n) ||
            normalize(t.term_ar).includes(n) ||
            normalize(t.definition_ar).includes(n))
        : list;
      if (matched.length > 0) out[cat] = matched;
    }
    return out;
  }, [grouped, activeCategory, q]);

  const totalShown = Object.values(filtered).reduce((s, l) => s + l.length, 0);

  return (
    <>
      <div className="bg-surface rounded-2xl border-2 border-line p-3 mb-4 shadow-sm sticky top-2 z-10">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="ابحث: GPA، ساعة معتمدة، منحة..."
          className="w-full outline-none text-lg px-3 py-2"
          dir="rtl"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 ${
            activeCategory === 'all'
              ? 'bg-primary text-white border-primary'
              : 'bg-surface text-ink-muted border-line hover:border-primary'
          }`}
        >
          الكل
        </button>
        {Object.keys(grouped).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 ${
              activeCategory === cat
                ? 'bg-primary text-white border-primary'
                : 'bg-surface text-ink-muted border-line hover:border-primary'
            }`}
          >
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      <p className="text-sm text-ink-muted mb-4">{totalShown} مصطلح</p>

      <div className="space-y-8">
        {Object.entries(filtered).map(([cat, list]) => (
          <section key={cat}>
            <h2 className="text-xl font-extrabold text-primary mb-4 border-b border-line pb-2">
              {categoryLabels[cat] || cat}
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {list.map(t => (
                <article key={t.id} className="bg-surface rounded-2xl border border-line p-5 hover:border-primary hover:shadow-sm transition-all">
                  <div className="flex items-baseline justify-between mb-2 gap-3">
                    <h3 className="font-extrabold text-ink text-lg">{t.term_ar}</h3>
                    <span className="text-xs font-bold text-ink-muted bg-mint-light px-2 py-0.5 rounded" dir="ltr">{t.term_en}</span>
                  </div>
                  <p className="text-sm text-ink leading-relaxed mb-2">{t.definition_ar}</p>
                  {t.example_ar && (
                    <p className="text-xs text-ink-muted bg-bg-mint/40 p-3 rounded-xl mt-2">
                      <strong className="text-primary">مثال:</strong> {t.example_ar}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
