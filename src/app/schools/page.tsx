"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fetchSchools } from "@/lib/entities";
import { useI18n } from "@/lib/i18n";
import { normalizeAr } from "@/lib/utils";

export default function SchoolsPage() {
  const { t, dir } = useI18n();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'fees_asc' | 'students'>('rating');

  useEffect(() => { fetchSchools().then((s) => { setItems(s as any); setLoading(false); }); }, []);

  const regions = useMemo(() => Array.from(new Set(items.map((s: any) => (s.region || '').trim()).filter(Boolean))), [items]);
  const types: Array<{ value: string; label: string }> = [
    { value: 'خاصة',  label: t('sch_l.type.private') },
    { value: 'رسمية', label: t('sch_l.type.public') },
    { value: 'دولية', label: t('sch_l.type.intl') },
    { value: 'مهنية', label: t('sch_l.type.voc') },
  ];

  const filtered = useMemo(() => {
    const q = normalizeAr(search);
    let arr = items.filter((s: any) => {
      if (q && !normalizeAr(s.name || '').includes(q) && !normalizeAr(s.area || '').includes(q)) return false;
      if (region && (s.region || '').trim() !== region.trim()) return false;
      if (type && (s.type || '').trim() !== type.trim()) return false;
      return true;
    });
    arr = [...arr].sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'fees_asc') return (a.feesMin || 0) - (b.feesMin || 0);
      if (sortBy === 'students') return (b.students || 0) - (a.students || 0);
      return (b.rating || 0) - (a.rating || 0);
    });
    return arr;
  }, [items, search, region, type, sortBy]);

  if (loading) return (
    <main className="min-h-screen bg-bg-mint flex items-center justify-center" dir={dir}>
      <div className="text-center"><div className="text-6xl animate-bounce-soft mb-3">🏫</div><div className="text-ink-muted">{t('sch_l.loading')}</div></div>
    </main>
  );

  return (
    <main className="min-h-screen bg-bg pb-20" dir={dir}>
      <section className="relative bg-gradient-hero text-white pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30" />
          <div className="absolute inset-0 bg-pattern-dots opacity-10" style={{ backgroundSize: '32px 32px' }} />
          <div className="absolute top-10 left-10 text-5xl animate-float opacity-40">🏫</div>
          <div className="absolute bottom-10 right-20 text-4xl animate-float opacity-40" style={{ animationDelay: '1s' }}>📚</div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4">
          <span className="inline-flex items-center gap-2 bg-surface/15 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            {t('sch_l.badge')}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{items.length} {t('sch_l.count.label')}</h1>
          <p className="text-white/90 text-lg max-w-2xl">{t('sch_l.hero.subtitle')}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-surface rounded-2xl shadow-md p-4 grid md:grid-cols-4 gap-3 mb-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('sch_l.filter.search')}
            className="md:col-span-2 px-4 py-2.5 border border-line rounded-lg" />
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="px-4 py-2.5 border border-line rounded-lg bg-surface">
            <option value="">{t('sch_l.filter.all_regions')}</option>{regions.map(r => <option key={r as string} value={r as string}>{r as string}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="px-4 py-2.5 border border-line rounded-lg bg-surface">
            <option value="">{t('sch_l.filter.all_types')}</option>{types.map(ti => <option key={ti.value} value={ti.value}>{ti.label}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-bold text-ink-muted">{t('sch_l.sort.label')}</span>
          {([
            ['rating',    t('sch_l.sort.rating')],
            ['name',      t('sch_l.sort.name')],
            ['fees_asc',  t('sch_l.sort.cheap')],
            ['students',  t('sch_l.sort.size')],
          ] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSortBy(key as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${sortBy === key ? 'bg-[#1b3a6b] text-white' : 'bg-bg-soft text-ink-muted hover:bg-bg-soft'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="text-sm text-ink-muted mb-4">{filtered.length} {t('sch_l.count.of')} {items.length}</div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s: any, idx: number) => <SchoolCard key={s.id} s={s} position={idx + 1} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-ink-subtle">
            <div className="text-6xl mb-3">🔍</div>
            <p>{t('sch_l.empty')}</p>
          </div>
        )}
      </div>
    </main>
  );
}

function SchoolCard({ s, position }: { s: any; position: number }) {
  const { t } = useI18n();
  const typeColor: Record<string, string> = {
    "خاصة": "bg-blue-100 text-blue-700",
    "رسمية": "bg-red-100 text-red-700",
    "دولية": "bg-purple-100 text-purple-700",
    "مهنية": "bg-orange-100 text-orange-700",
  };
  const isTop3 = position <= 3;
  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <Link href={`/schools/${s.id}`}
      className="bg-surface rounded-2xl border border-line hover:border-[#1b3a6b] hover:shadow-lg transition overflow-hidden block group">
      {/* Banner */}
      <div className={`relative h-32 bg-gradient-to-br ${s.color || 'from-[#1b3a6b] to-[#2d5391]'} overflow-hidden`}>
        {s.photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={s.photo} alt={s.name} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className={`absolute top-3 right-3 ${isTop3 ? 'bg-yellow-400 text-[#1b3a6b]' : 'bg-surface/95 text-[#1b3a6b]'} px-2.5 py-1 rounded-full font-extrabold text-xs shadow-md`}>
          {medals[position] || `#${position}`}
        </div>

        <div className="absolute bottom-3 left-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor[s.type] || 'bg-surface/95 text-[#1b3a6b]'}`}>{s.type}</span>
        </div>

        {/* Logo */}
        <div className="absolute -bottom-6 right-4 w-14 h-14 rounded-full bg-surface shadow-lg border-4 border-white overflow-hidden flex items-center justify-center text-2xl">
          {s.logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={s.logo} alt={s.name} className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : <span>{s.emoji || '🏫'}</span>}
        </div>
      </div>

      <div className="p-4 pt-8">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-extrabold text-[#1b3a6b] truncate group-hover:underline">{s.name}</h3>
          <span className="text-yellow-400 text-sm font-bold">{'★'.repeat(s.rating || 0)}</span>
        </div>
        <p className="text-xs text-ink-subtle mb-3">📍 {s.region} — {s.area}</p>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="bg-bg-soft rounded-lg p-2">
            <div className="text-ink-subtle">{t('sch_l.card.curricula')}</div>
            <div className="font-bold text-ink-muted truncate">{(s.curriculum || []).slice(0, 2).join('، ') || '—'}</div>
          </div>
          <div className="bg-bg-soft rounded-lg p-2">
            <div className="text-ink-subtle">{t('sch_l.card.fees')}</div>
            <div className="font-bold text-ink-muted">{s.feesMin === 0 ? t('sch_l.card.free') : `$${s.feesMin}+`}</div>
          </div>
        </div>

        <div className="pt-3 border-t border-line">
          <span className="text-[#1b3a6b] font-bold text-sm group-hover:underline">{t('sch_l.card.details')}</span>
        </div>
      </div>
    </Link>
  );
}
