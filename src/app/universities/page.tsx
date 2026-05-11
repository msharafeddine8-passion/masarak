"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fetchUniversities } from "@/lib/entities";

function Stars({ n }: { n: number }) {
  return <span>{Array.from({ length: 5 }).map((_, i) => <span key={i} className={i < n ? "text-yellow-400" : "text-gray-200"}>★</span>)}</span>;
}

export default function UniversitiesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterRegion, setFilterRegion] = useState<string>("");
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'tuition_asc' | 'tuition_desc' | 'students'>('rank');

  useEffect(() => { fetchUniversities().then((u) => { setItems(u as any); setLoading(false); }); }, []);

  const regions = useMemo(() => Array.from(new Set(items.map((u: any) => u.region).filter(Boolean))), [items]);
  const types = ["خاصة", "حكومية"];

  const filtered = useMemo(() => {
    let arr = items.filter((u: any) => {
      if (search && !(u.name || '').toLowerCase().includes(search.toLowerCase()) && !(u.short || '').toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType && u.type !== filterType) return false;
      if (filterRegion && u.region !== filterRegion) return false;
      return true;
    });
    arr = [...arr].sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'tuition_asc') return (a.tuitionMin || 0) - (b.tuitionMin || 0);
      if (sortBy === 'tuition_desc') return (b.tuitionMin || 0) - (a.tuitionMin || 0);
      if (sortBy === 'students') return (b.students || 0) - (a.students || 0);
      return (b.rank || 0) - (a.rank || 0); // default rank desc
    });
    return arr;
  }, [items, search, filterType, filterRegion, sortBy]);

  if (loading) {
    return <main className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl"><div className="text-4xl">⏳</div></main>;
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <section className="bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">🏛️ دليل الجامعات</h1>
          <p className="text-white/85 text-lg max-w-2xl">قارن بين الجامعات: الرسوم، القبول، التوظيف. مرتّبة حسب التصنيف.</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full text-sm">
            <span className="font-bold text-2xl">{items.length}</span><span>جامعة</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-4 grid md:grid-cols-4 gap-3 mb-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 ابحث..."
            className="md:col-span-2 px-4 py-2.5 border border-gray-200 rounded-lg" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
            <option value="">كل الأنواع</option>{types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
            <option value="">كل المناطق</option>{regions.map(r => <option key={r as string} value={r as string}>{r as string}</option>)}
          </select>
        </div>

        {/* Sort */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-bold text-gray-600">الترتيب حسب:</span>
          {([
            ['rank', '⭐ التصنيف'],
            ['name', '🔤 الاسم'],
            ['tuition_asc', '💰 الأرخص'],
            ['tuition_desc', '💎 الأغلى'],
            ['students', '👥 الأكبر حجماً'],
          ] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSortBy(key as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${sortBy === key ? 'bg-[#1b3a6b] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-600 mb-4">{filtered.length} جامعة من أصل {items.length}</div>

        {/* Grid — Cards with logo + rank badge */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u: any, idx: number) => <UniCard key={u.id} u={u} position={idx + 1} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-3">🔍</div>
            <p>لم نجد جامعات بهذه المعايير</p>
          </div>
        )}
      </div>
    </main>
  );
}

function UniCard({ u, position }: { u: any; position: number }) {
  const isTop3 = position <= 3;
  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return (
    <Link href={`/universities/${u.id}`}
      className="bg-white rounded-2xl border border-gray-200 hover:border-[#1b3a6b] hover:shadow-lg transition overflow-hidden block group">
      {/* Banner */}
      <div className={`relative h-32 bg-gradient-to-br ${u.color || 'from-[#1b3a6b] to-[#2d5391]'} overflow-hidden`}>
        {u.photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={u.photo} alt={u.name} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Position badge (top right) */}
        <div className={`absolute top-3 right-3 ${isTop3 ? 'bg-yellow-400 text-[#1b3a6b]' : 'bg-white/95 text-[#1b3a6b]'} px-2.5 py-1 rounded-full font-extrabold text-xs shadow-md flex items-center gap-1`}>
          {medals[position] || `#${position}`}
        </div>

        {/* Type badge (bottom left) */}
        <div className="absolute bottom-3 left-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.type === 'حكومية' ? 'bg-green-500/95 text-white' : 'bg-white/95 text-[#1b3a6b]'}`}>{u.type}</span>
        </div>

        {/* Logo (bottom right - circle) */}
        <div className="absolute -bottom-6 right-4 w-14 h-14 rounded-full bg-white shadow-lg border-4 border-white overflow-hidden flex items-center justify-center text-2xl">
          {u.logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={u.logo} alt={u.short} className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <span>{u.emoji || '🏛️'}</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 pt-8">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-extrabold text-[#1b3a6b] group-hover:underline">{u.short}</h3>
          <Stars n={u.rank || 0} />
        </div>
        <p className="text-sm text-gray-700 font-semibold leading-tight mb-2 line-clamp-2">{u.name}</p>
        <p className="text-xs text-gray-500 mb-3">📍 {u.region}</p>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-gray-400">الرسوم/سنة</div>
            <div className="font-bold text-gray-700">{u.tuitionMin === 0 ? 'بلا رسوم' : (u.tuitionMin ? `$${u.tuitionMin.toLocaleString()}+` : '-')}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-gray-400">معدل القبول</div>
            <div className="font-bold text-gray-700">{u.acceptance ? `${u.acceptance}%` : '-'}</div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <span className="text-[#1b3a6b] font-bold text-sm group-hover:underline">شوف التفاصيل ←</span>
        </div>
      </div>
    </Link>
  );
}
