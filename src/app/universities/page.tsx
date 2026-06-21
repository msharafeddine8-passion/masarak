"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchUniversities } from "@/lib/entities";
import { useI18n } from "@/lib/i18n";
import { normalizeAr } from "@/lib/utils";

// شارة جودة الجامعة (rank = مستوى الجودة 1–5، حيث 5 = الأفضل)
function RankBadge({ rank }: { rank: number }) {
  const { t } = useI18n();
  if (!rank) return <span className="text-xs text-ink-subtle">{t('unis.card.unranked')}</span>;
  const isTop3 = rank >= 4;  // rank 4 أو 5 = مميّز (AUB, LAU, USJ …)
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
      isTop3 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-50 text-blue-700'
    }`}>
      <span>🏆</span>
      <span>#{rank} {t('unis.card.rank_in_lb')}</span>
    </span>
  );
}

export default function UniversitiesPage() {
  const { t, dir } = useI18n();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterRegion, setFilterRegion] = useState<string>("");
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'tuition_asc' | 'tuition_desc' | 'students'>('rank');
  // ─── Compare feature (restored) ────────────────────────────────────────────
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => { fetchUniversities().then((u) => { setItems(u as any); setLoading(false); }); }, []);

  const regions = useMemo(() => Array.from(new Set(items.map((u: any) => (u.region || '').trim()).filter(Boolean))), [items]);
  const types: Array<{ value: string; label: string }> = [
    { value: 'خاصة',   label: t('unis.type.private') },
    { value: 'حكومية', label: t('unis.type.public') },
  ];

  const filtered = useMemo(() => {
    const q = normalizeAr(search);
    let arr = items.filter((u: any) => {
      if (q && !normalizeAr(u.name || '').includes(q) && !normalizeAr(u.short || '').includes(q)) return false;
      if (filterType && (u.type || '').trim() !== filterType.trim()) return false;
      if (filterRegion && (u.region || '').trim() !== filterRegion.trim()) return false;
      return true;
    });
    arr = [...arr].sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'tuition_asc') return (a.tuitionMin || 0) - (b.tuitionMin || 0);
      if (sortBy === 'tuition_desc') return (b.tuitionMin || 0) - (a.tuitionMin || 0);
      if (sortBy === 'students') return (b.students || 0) - (a.students || 0);
      // rank = مستوى الجودة (5 = الأفضل) — تنازلياً؛ جامعات بدون rank تنزل آخر
      const ra = a.rank || 0;
      const rb = b.rank || 0;
      return rb - ra;
    });
    return arr;
  }, [items, search, filterType, filterRegion, sortBy]);

  function toggleCompare(id: number) {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }
  const compareUnis = items.filter((u: any) => compareIds.includes(u.id));

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-mint flex items-center justify-center" dir={dir}>
        <div className="text-center">
          <div className="text-6xl animate-bounce-soft mb-3">🏛️</div>
          <div className="text-ink-muted">{t('unis.loading')}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg pb-20" dir={dir}>
      {/* HERO — Salla-style with floating cards */}
      <section className="relative bg-gradient-hero text-white pt-12 pb-20 md:pt-16 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-20" />
          <div className="absolute inset-0 bg-pattern-dots opacity-10" style={{ backgroundSize: '32px 32px' }} />
          {/* Decorative emojis */}
          <div className="absolute top-20 left-10 text-5xl animate-float opacity-40">🎓</div>
          <div className="absolute top-1/3 right-20 text-4xl animate-float opacity-50" style={{ animationDelay: '1s' }}>📚</div>
          <div className="absolute bottom-20 left-1/3 text-4xl animate-float opacity-30" style={{ animationDelay: '1.5s' }}>✨</div>
          <div className="absolute bottom-10 right-1/4 text-5xl animate-float opacity-40" style={{ animationDelay: '0.5s' }}>🏛️</div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className={`text-center ${dir === 'rtl' ? 'lg:text-right' : 'lg:text-left'}`}>
              <span className="inline-flex items-center gap-2 bg-surface/15 backdrop-blur text-white px-4 py-1.5 rounded-full text-sm font-bold mb-5 animate-fade-up">
                <span>{t('unis.hero.badge')}</span>
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
                {items.length} {t('unis.hero.title.suffix')}
                <br />
                <span className="text-mint">{t('unis.hero.title.2')}</span>
              </h1>
              <p className={`text-white/90 text-lg max-w-xl mx-auto ${dir === 'rtl' ? 'lg:mx-0 lg:ml-auto' : 'lg:mx-0 lg:mr-auto'} mb-6 animate-fade-up`} style={{ animationDelay: '0.2s' }}>
                {t('unis.hero.subtitle.1')}
                <span className="text-mint font-bold"> {t('unis.hero.subtitle.2')}</span>{t('unis.hero.subtitle.3')}
              </p>

              {/* Quick stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                {[
                  { v: items.length, l: t('unis.stats.uni') },
                  { v: items.filter((u: any) => u.type === 'حكومية').length, l: t('unis.stats.public') },
                  { v: items.filter((u: any) => u.type === 'خاصة').length, l: t('unis.stats.private') },
                ].map(s => (
                  <div key={s.l} className="bg-surface/15 backdrop-blur px-4 py-2 rounded-2xl border border-white/20">
                    <span className="font-extrabold text-2xl">{s.v}</span>
                    <span className={`text-sm opacity-90 ${dir === 'rtl' ? 'mr-1' : 'ml-1'}`}>{s.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual right side — floating university cards preview */}
            <div className="relative h-72 md:h-96 hidden lg:block animate-fade-up" style={{ animationDelay: '0.3s' }}>
              {/* Big circle background */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-72 rounded-full bg-mint/20 backdrop-blur" />
              </div>
              {/* Big icon */}
              <div className="absolute inset-0 flex items-center justify-center text-[180px] animate-float drop-shadow-2xl">
                🏛️
              </div>
              {/* Floating cards */}
              <div className="absolute top-4 right-2 bg-surface text-ink rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-mint-deep text-white rounded-xl flex items-center justify-center font-extrabold">🥇</div>
                  <div>
                    <div className="text-xs text-ink-muted">#1 {t('unis.card.rank_in_lb')}</div>
                    <div className="font-extrabold text-primary text-sm">AUB</div>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/3 left-2 bg-surface text-ink rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '0.9s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-warm rounded-xl flex items-center justify-center text-xl">📊</div>
                  <div>
                    <div className="text-xs text-ink-muted">{t('unis.compare.btn')}</div>
                    <div className="font-extrabold text-primary text-sm">3 {t('unis.stats.uni')}</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-6 right-6 bg-surface text-ink rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '1.3s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-fresh rounded-xl flex items-center justify-center text-xl">💼</div>
                  <div>
                    <div className="text-xs text-ink-muted">{t('unis.compare.fields.employ')}</div>
                    <div className="font-extrabold text-primary text-sm">95%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Compare Bar (restored) */}
        {compareIds.length > 0 && (
          <div className="bg-blue-600 text-white rounded-2xl p-4 mb-4 flex items-center justify-between flex-wrap gap-3 shadow-lg">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold">{t('unis.compare.title')}</span>
              {compareUnis.map((u: any) => (
                <span key={u.id} className="bg-surface/20 rounded-lg px-3 py-1 text-sm font-semibold">{u.short}</span>
              ))}
              {compareIds.length < 3 && (
                <span className="text-blue-200 text-sm">{t('unis.compare.pick_more.1')} {3 - compareIds.length} {t('unis.compare.pick_more.2')}</span>
              )}
            </div>
            <div className="flex gap-2">
              {compareIds.length >= 2 && (
                <button onClick={() => setShowCompare(true)}
                  className="bg-surface text-blue-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-50">
                  {t('unis.compare.show')}
                </button>
              )}
              <button onClick={() => { setCompareIds([]); setShowCompare(false); }}
                className="bg-surface/20 px-3 py-2 rounded-xl text-sm hover:bg-surface/30">
                {t('g.cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-surface rounded-2xl shadow-md p-4 grid md:grid-cols-4 gap-3 mb-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('unis.filter.search')}
            className="md:col-span-2 px-4 py-2.5 border border-white/10 rounded-lg" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2.5 border border-white/10 rounded-lg bg-surface">
            <option value="">{t('unis.filter.all_types')}</option>{types.map(ti => <option key={ti.value} value={ti.value}>{ti.label}</option>)}
          </select>
          <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="px-4 py-2.5 border border-white/10 rounded-lg bg-surface">
            <option value="">{t('unis.filter.all_regions')}</option>{regions.map(r => <option key={r as string} value={r as string}>{r as string}</option>)}
          </select>
        </div>

        {/* Sort */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-bold text-ink-muted">{t('unis.sort.label')}</span>
          {([
            ['rank',         t('unis.sort.rank')],
            ['name',         t('unis.sort.name')],
            ['tuition_asc',  t('unis.sort.cheap')],
            ['tuition_desc', t('unis.sort.expensive')],
            ['students',     t('unis.sort.size')],
          ] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSortBy(key as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${sortBy === key ? 'bg-[#1b3a6b] text-white' : 'bg-bg-soft text-ink-muted hover:bg-white/10'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="text-sm text-ink-muted mb-4 flex items-center justify-between">
          <span>{filtered.length} {t('unis.count.1')} {items.length}</span>
          <span className="text-xs text-ink-subtle">{t('unis.compare.tip')}</span>
        </div>

        {/* Grid — Cards with logo + rank badge + compare */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u: any, idx: number) => (
            <UniCard key={u.id} u={u} position={idx + 1}
              isComparing={compareIds.includes(u.id)}
              compareFull={compareIds.length >= 3 && !compareIds.includes(u.id)}
              onToggleCompare={() => toggleCompare(u.id)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-ink-subtle">
            <div className="text-6xl mb-3">🔍</div>
            <p>{t('unis.empty.title')}</p>
          </div>
        )}
      </div>

      {/* Compare Modal (restored) */}
      {showCompare && compareUnis.length >= 2 && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCompare(false)}>
          <div className="bg-bg-soft rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-ink">{t('unis.compare.detailed')}</h2>
              <button onClick={() => setShowCompare(false)} className="text-ink-subtle hover:text-ink-muted text-2xl leading-none">×</button>
            </div>
            <CompareTable unis={compareUnis} onRemove={(id) => {
              setCompareIds(prev => prev.filter(x => x !== id));
              if (compareIds.length <= 2) setShowCompare(false);
            }} />
            <div className="mt-6 flex gap-3 justify-end flex-wrap">
              {compareUnis.map((u: any) => u.url && (
                <a key={u.id} href={u.url} target="_blank" rel="noopener noreferrer"
                  className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-700">
                  {t('unis.compare.visit')} {u.short} 🔗
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function CompareTable({ unis, onRemove }: { unis: any[]; onRemove: (id: number) => void }) {
  const { t, dir } = useI18n();
  if (!unis || unis.length === 0) return null;
  const fields: Array<{ key: string; label: string; format?: (v: any) => string }> = [
    { key: 'short',      label: t('unis.compare.fields.short') },
    { key: 'name',       label: t('unis.compare.fields.name') },
    { key: 'region',     label: t('unis.compare.fields.region') },
    { key: 'type',       label: t('unis.compare.fields.type') },
    { key: 'tuitionMin', label: t('unis.compare.fields.tuition'),    format: (v) => v ? '+' + (v).toLocaleString() : '-' },
    { key: 'employRate', label: t('unis.compare.fields.employ'),     format: (v) => v ? v + '%' : '-' },
    { key: 'acceptance', label: t('unis.compare.fields.acceptance'), format: (v) => v ? v + '%' : '-' },
    { key: 'lang',       label: t('unis.compare.fields.lang') },
    { key: 'rank',       label: t('unis.compare.fields.rank'),       format: (v) => v ? '#' + v : '-' },
    { key: 'students',   label: t('unis.compare.fields.students'),   format: (v) => v ? v.toLocaleString() : '-' },
    { key: 'founded',    label: t('unis.compare.fields.founded'),    format: (v) => v ?? '-' },
    { key: 'campus',     label: t('unis.compare.fields.campus') },
    { key: 'accred',     label: t('unis.compare.fields.accred') },
  ];
  return (
    <div className="bg-surface rounded-2xl shadow-lg border border-white/10 overflow-x-auto mb-8">
      <table className="w-full text-sm">
        <thead className="bg-[#1b3a6b] text-white">
          <tr>
            <th className={`px-4 py-3 ${dir === 'rtl' ? 'text-right' : 'text-left'} font-bold`}>{t('unis.compare.fields.property')}</th>
            {unis.map((u: any) => (
              <th key={u.id} className={`px-4 py-3 ${dir === 'rtl' ? 'text-right' : 'text-left'} font-bold`}>
                <div className="flex items-center justify-between gap-2">
                  <span>{u.short || u.name}</span>
                  <button onClick={() => onRemove(u.id)}
                    className="text-xs bg-surface/20 hover:bg-surface/30 rounded-full w-6 h-6 flex items-center justify-center"
                    aria-label={t('unis.compare.remove')}>×</button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map((field, i) => (
            <tr key={field.key} className={i % 2 === 0 ? 'bg-bg-soft' : 'bg-surface'}>
              <td className="px-4 py-3 font-semibold text-[#1b3a6b]">{field.label}</td>
              {unis.map((u: any) => {
                const v = u[field.key];
                const display = field.format ? field.format(v) : (v ?? '-');
                return (
                  <td key={u.id} className="px-4 py-3 text-ink-muted">
                    {Array.isArray(display) ? display.join(', ') : display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UniCard({ u, position, isComparing, compareFull, onToggleCompare }: {
  u: any; position: number; isComparing: boolean; compareFull: boolean; onToggleCompare: () => void;
}) {
  const { t } = useI18n();
  const isTop3 = position <= 3;
  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div className={`bg-surface rounded-2xl border-2 hover:shadow-lg transition overflow-hidden block group ${isComparing ? 'border-blue-500 ring-2 ring-blue-200' : 'border-white/10 hover:border-[#1b3a6b]'}`}>
      {/* Banner */}
      <Link href={`/universities/${u.id}`} className="block">
        <div className={`relative h-32 bg-gradient-to-br ${u.color || 'from-[#1b3a6b] to-[#2d5391]'} overflow-hidden`}>
          {u.photo && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={u.photo} alt={u.name} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Position badge (top right) */}
          <div className={`absolute top-3 right-3 ${isTop3 ? 'bg-yellow-400 text-[#1b3a6b]' : 'bg-surface/95 text-[#1b3a6b]'} px-2.5 py-1 rounded-full font-extrabold text-xs shadow-md flex items-center gap-1`}>
            {medals[position] || `#${position}`}
          </div>

          {/* Type badge (bottom left) */}
          <div className="absolute bottom-3 left-3">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.type === 'حكومية' ? 'bg-green-500/95 text-white' : 'bg-surface/95 text-[#1b3a6b]'}`}>{u.type}</span>
          </div>

          {/* Logo (bottom right - circle) */}
          <div className="absolute -bottom-6 right-4 w-14 h-14 rounded-full bg-surface shadow-lg border-4 border-white overflow-hidden flex items-center justify-center text-2xl">
            {u.logo ? (
              <Image
                src={u.logo}
                alt={u.short}
                width={56}
                height={56}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <span>{u.emoji || '🏛️'}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 pt-8">
        <Link href={`/universities/${u.id}`} className="block">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-extrabold text-[#1b3a6b] group-hover:underline">{u.short}</h3>
            <RankBadge rank={u.rank || 0} />
          </div>
          <p className="text-sm text-ink-muted font-semibold leading-tight mb-2 line-clamp-2">{u.name}</p>
          <p className="text-xs text-ink-subtle mb-3">📍 {u.region}</p>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-bg-soft rounded-lg p-2">
              <div className="text-ink-subtle">{t('unis.card.tuition')}</div>
              <div className="font-bold text-ink-muted">{u.tuitionMin === 0 ? t('unis.card.no_tuition') : (u.tuitionMin ? `$${u.tuitionMin.toLocaleString()}+` : '-')}</div>
            </div>
            <div className="bg-bg-soft rounded-lg p-2">
              <div className="text-ink-subtle">{t('unis.card.acceptance')}</div>
              <div className="font-bold text-ink-muted">{u.acceptance ? `${u.acceptance}%` : '-'}</div>
            </div>
          </div>
        </Link>

        {/* Actions: Compare + Details */}
        <div className="pt-3 border-t border-white/10 flex gap-2">
          <button
            onClick={onToggleCompare}
            disabled={compareFull}
            className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${
              isComparing ? 'bg-blue-600 text-white' :
              compareFull ? 'bg-bg-soft text-ink-subtle cursor-not-allowed' :
              'bg-bg-soft text-ink-muted hover:bg-blue-50 hover:text-blue-600'
            }`}>
            {isComparing ? t('unis.compare.in') : t('unis.compare.btn')}
          </button>
          <Link href={`/universities/${u.id}`}
            className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-[#1b3a6b] text-white hover:bg-[#2d5391] transition">
            {t('unis.card.details')}
          </Link>
        </div>
      </div>
    </div>
  );
}
