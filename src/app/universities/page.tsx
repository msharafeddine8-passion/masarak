"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fetchUniversities } from "@/lib/entities";

// شارة الترتيب الرسمي بلبنان (rank يمثل الموقع الفعلي: 1 = الأفضل)
function RankBadge({ rank }: { rank: number }) {
  if (!rank) return <span className="text-xs text-gray-400">غير مصنّف</span>;
  const isTop3 = rank <= 3;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
      isTop3 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-50 text-blue-700'
    }`}>
      <span>🏆</span>
      <span>#{rank} لبنانياً</span>
    </span>
  );
}

export default function UniversitiesPage() {
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
      // الترتيب الافتراضي: حسب الترتيب الرسمي بلبنان (1 = الأفضل) — أصغر rank أوّلاً
      // أي جامعة بدون rank بتنزل آخر
      const ra = a.rank || 999;
      const rb = b.rank || 999;
      return ra - rb;
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
        {/* Compare Bar (restored) */}
        {compareIds.length > 0 && (
          <div className="bg-blue-600 text-white rounded-2xl p-4 mb-4 flex items-center justify-between flex-wrap gap-3 shadow-lg">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold">⚡ المقارنة:</span>
              {compareUnis.map((u: any) => (
                <span key={u.id} className="bg-white/20 rounded-lg px-3 py-1 text-sm font-semibold">{u.short}</span>
              ))}
              {compareIds.length < 3 && (
                <span className="text-blue-200 text-sm">+ اختر {3 - compareIds.length} جامعة أخرى</span>
              )}
            </div>
            <div className="flex gap-2">
              {compareIds.length >= 2 && (
                <button onClick={() => setShowCompare(true)}
                  className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-50">
                  عرض المقارنة ⚡
                </button>
              )}
              <button onClick={() => { setCompareIds([]); setShowCompare(false); }}
                className="bg-white/20 px-3 py-2 rounded-xl text-sm hover:bg-white/30">
                إلغاء
              </button>
            </div>
          </div>
        )}

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
            ['rank', '🏆 الترتيب الرسمي'],
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

        <div className="text-sm text-gray-600 mb-4 flex items-center justify-between">
          <span>{filtered.length} جامعة من أصل {items.length}</span>
          <span className="text-xs text-gray-500">💡 اضغط "قارن" لاختيار حتى 3 جامعات</span>
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
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-3">🔍</div>
            <p>لم نجد جامعات بهذه المعايير</p>
          </div>
        )}
      </div>

      {/* Compare Modal (restored) */}
      {showCompare && compareUnis.length >= 2 && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCompare(false)}>
          <div className="bg-gray-50 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-gray-900">⚡ مقارنة مفصّلة</h2>
              <button onClick={() => setShowCompare(false)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <CompareTable unis={compareUnis} onRemove={(id) => {
              setCompareIds(prev => prev.filter(x => x !== id));
              if (compareIds.length <= 2) setShowCompare(false);
            }} />
            <div className="mt-6 flex gap-3 justify-end flex-wrap">
              {compareUnis.map((u: any) => u.url && (
                <a key={u.id} href={u.url} target="_blank" rel="noopener noreferrer"
                  className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-700">
                  زيارة {u.short} 🔗
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
  if (!unis || unis.length === 0) return null;
  const fields: Array<{ key: string; label: string; format?: (v: any) => string }> = [
    { key: 'short', label: 'الاسم المختصر' },
    { key: 'name', label: 'الاسم' },
    { key: 'region', label: 'المنطقة' },
    { key: 'type', label: 'النوع' },
    { key: 'tuitionMin', label: 'الرسوم/سنة ($)', format: (v) => v ? '+' + (v).toLocaleString() : '-' },
    { key: 'employRate', label: 'معدل التوظيف', format: (v) => v ? v + '%' : '-' },
    { key: 'acceptance', label: 'معدل القبول', format: (v) => v ? v + '%' : '-' },
    { key: 'lang', label: 'اللغة' },
    { key: 'rank', label: 'التصنيف', format: (v) => v ? '#' + v : '-' },
    { key: 'students', label: 'عدد الطلاب', format: (v) => v ? v.toLocaleString() : '-' },
    { key: 'founded', label: 'تأسست عام', format: (v) => v ?? '-' },
    { key: 'campus', label: 'الموقع' },
    { key: 'accred', label: 'الاعتماد' },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-x-auto mb-8">
      <table className="w-full text-sm">
        <thead className="bg-[#1b3a6b] text-white">
          <tr>
            <th className="px-4 py-3 text-right font-bold">الخاصية</th>
            {unis.map((u: any) => (
              <th key={u.id} className="px-4 py-3 text-right font-bold">
                <div className="flex items-center justify-between gap-2">
                  <span>{u.short || u.name}</span>
                  <button onClick={() => onRemove(u.id)}
                    className="text-xs bg-white/20 hover:bg-white/30 rounded-full w-6 h-6 flex items-center justify-center"
                    aria-label="إزالة">×</button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map((field, i) => (
            <tr key={field.key} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
              <td className="px-4 py-3 font-semibold text-[#1b3a6b]">{field.label}</td>
              {unis.map((u: any) => {
                const v = u[field.key];
                const display = field.format ? field.format(v) : (v ?? '-');
                return (
                  <td key={u.id} className="px-4 py-3 text-slate-700">
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
  const isTop3 = position <= 3;
  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div className={`bg-white rounded-2xl border-2 hover:shadow-lg transition overflow-hidden block group ${isComparing ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-[#1b3a6b]'}`}>
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
      </Link>

      {/* Body */}
      <div className="p-4 pt-8">
        <Link href={`/universities/${u.id}`} className="block">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-extrabold text-[#1b3a6b] group-hover:underline">{u.short}</h3>
            <RankBadge rank={u.rank || 0} />
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
        </Link>

        {/* Actions: Compare + Details */}
        <div className="pt-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={onToggleCompare}
            disabled={compareFull}
            className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${
              isComparing ? 'bg-blue-600 text-white' :
              compareFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
              'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}>
            {isComparing ? '✓ في المقارنة' : 'قارن'}
          </button>
          <Link href={`/universities/${u.id}`}
            className="flex-1 text-center text-xs font-bold py-2 rounded-lg bg-[#1b3a6b] text-white hover:bg-[#2d5391] transition">
            التفاصيل ←
          </Link>
        </div>
      </div>
    </div>
  );
}
