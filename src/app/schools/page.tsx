"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fetchSchools } from "@/lib/entities";

export default function SchoolsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'fees_asc' | 'students'>('rating');

  useEffect(() => { fetchSchools().then((s) => { setItems(s as any); setLoading(false); }); }, []);

  const regions = useMemo(() => Array.from(new Set(items.map((s: any) => s.region).filter(Boolean))), [items]);
  const types = ["خاصة", "رسمية", "دولية", "مهنية"];

  const filtered = useMemo(() => {
    let arr = items.filter((s: any) => {
      if (search && !(s.name || '').toLowerCase().includes(search.toLowerCase()) && !(s.area || '').toLowerCase().includes(search.toLowerCase())) return false;
      if (region && s.region !== region) return false;
      if (type && s.type !== type) return false;
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

  if (loading) return <main className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl"><div className="text-4xl">⏳</div></main>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <section className="bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">🏫 دليل المدارس</h1>
          <p className="text-white/85 text-lg max-w-2xl">استعرض المدارس. قارن المناهج، الرسوم، والمميزات.</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full text-sm">
            <span className="font-bold text-2xl">{items.length}</span><span>مدرسة</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-md p-4 grid md:grid-cols-4 gap-3 mb-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 ابحث..."
            className="md:col-span-2 px-4 py-2.5 border border-gray-200 rounded-lg" />
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
            <option value="">كل المناطق</option>{regions.map(r => <option key={r as string} value={r as string}>{r as string}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
            <option value="">كل الأنواع</option>{types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-bold text-gray-600">الترتيب حسب:</span>
          {([
            ['rating', '⭐ التقييم'],
            ['name', '🔤 الاسم'],
            ['fees_asc', '💰 الأرخص'],
            ['students', '👥 الأكبر حجماً'],
          ] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSortBy(key as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${sortBy === key ? 'bg-[#1b3a6b] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-600 mb-4">{filtered.length} مدرسة من أصل {items.length}</div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s: any, idx: number) => <SchoolCard key={s.id} s={s} position={idx + 1} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-3">🔍</div>
            <p>لم نجد مدارس بهذه المعايير</p>
          </div>
        )}
      </div>
    </main>
  );
}

function SchoolCard({ s, position }: { s: any; position: number }) {
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
      className="bg-white rounded-2xl border border-gray-200 hover:border-[#1b3a6b] hover:shadow-lg transition overflow-hidden block group">
      {/* Banner */}
      <div className={`relative h-32 bg-gradient-to-br ${s.color || 'from-[#1b3a6b] to-[#2d5391]'} overflow-hidden`}>
        {s.photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={s.photo} alt={s.name} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className={`absolute top-3 right-3 ${isTop3 ? 'bg-yellow-400 text-[#1b3a6b]' : 'bg-white/95 text-[#1b3a6b]'} px-2.5 py-1 rounded-full font-extrabold text-xs shadow-md`}>
          {medals[position] || `#${position}`}
        </div>

        <div className="absolute bottom-3 left-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor[s.type] || 'bg-white/95 text-[#1b3a6b]'}`}>{s.type}</span>
        </div>

        {/* Logo */}
        <div className="absolute -bottom-6 right-4 w-14 h-14 rounded-full bg-white shadow-lg border-4 border-white overflow-hidden flex items-center justify-center text-2xl">
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
        <p className="text-xs text-gray-500 mb-3">📍 {s.region} — {s.area}</p>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-gray-400">المناهج</div>
            <div className="font-bold text-gray-700 truncate">{(s.curriculum || []).slice(0, 2).join('، ') || '—'}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-gray-400">الرسوم</div>
            <div className="font-bold text-gray-700">{s.feesMin === 0 ? 'مجاني' : `$${s.feesMin}+`}</div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <span className="text-[#1b3a6b] font-bold text-sm group-hover:underline">شوف التفاصيل ←</span>
        </div>
      </div>
    </Link>
  );
}
