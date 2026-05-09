"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useStudentContext } from "@/context/StudentContext";
import { UNIVERSITIES } from "@/app/universities/data";


function Stars({ n }: { n: number }) {
  return (
    <span>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < n ? "text-yellow-400" : "text-gray-200"}>★</span>
      ))}
    </span>
  );
}

export default function UniversitiesPage() {
  const { careerDNA, savedUniversities, toggleSaveUniversity } = useStudentContext();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("الكل");
  const [filterRegion, setFilterRegion] = useState("الكل");
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [sortBy, setSortBy] = useState<"rank" | "tuition" | "employ">("rank");

  const dnaPath = careerDNA?.primaryPath || "";

  const regions = ["الكل", "بيروت", "جبل لبنان", "الشمال", "الجنوب", "البقاع", "بيروت وبيبلوس", "بيروت وفروع", "كل لبنان"];
  const types = ["الكل", "خاصة", "حكومية"];

  const filtered = useMemo(() => {
    let list = UNIVERSITIES.filter(u => {
      const matchSearch = !search || u.name.includes(search) || u.short.toLowerCase().includes(search.toLowerCase()) || u.majors.some(m => m.includes(search));
      const matchType = filterType === "الكل" || u.type === filterType;
      const matchRegion = filterRegion === "الكل" || u.region.includes(filterRegion);
      return matchSearch && matchType && matchRegion;
    });
    if (sortBy === "tuition") list = [...list].sort((a, b) => a.tuitionMin - b.tuitionMin);
    else if (sortBy === "employ") list = [...list].sort((a, b) => b.employRate - a.employRate);
    else list = [...list].sort((a, b) => b.rank - a.rank);
    return list;
  }, [search, filterType, filterRegion, sortBy]);

  function toggleCompare(id: number) {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  const compareUnis = UNIVERSITIES.filter(u => compareIds.includes(u.id));

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">🏛️ الجامعات اللبنانية</h1>
          <p className="text-gray-500">اختر حتى 3 جامعات وقارن بينها بالتفصيل</p>
          {dnaPath && (
            <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-sm text-blue-700">
              <span>🧬</span>
              <span>مسارك من Career DNA: <strong>{dnaPath}</strong> — النتائج مُرتَّبة حسب التطابق</span>
            </div>
          )}
        </div>

        {/* Compare Bar */}
        {compareIds.length > 0 && (
          <div className="bg-blue-600 text-white rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold">المقارنة:</span>
              {compareUnis.map(u => (
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

        {/* Compare Modal */}
        {showCompare && compareUnis.length >= 2 && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-50 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-gray-900">⚡ مقارنة مفصّلة</h2>
                <button onClick={() => setShowCompare(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
              </div>
              <CompareTable unis={compareUnis} onRemove={(id) => {
                setCompareIds(prev => prev.filter(x => x !== id));
                if (compareIds.length <= 2) setShowCompare(false);
              }} dnaPath={dnaPath} />
              <div className="mt-6 flex gap-3 justify-end flex-wrap">
                {compareUnis.map(u => (
                  <a key={u.id} href={u.url} target="_blank" rel="noopener noreferrer"
                    className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-700">
                    زيارة {u.short} 🔗
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-56">
              <label className="text-xs font-bold text-gray-500 block mb-1">بحث</label>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو التخصص..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">النوع</label>
              <div className="flex gap-1">
                {types.map(t => (
                  <button key={t} onClick={() => setFilterType(t)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${filterType === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">الترتيب حسب</label>
              <div className="flex gap-1">
                {[["rank","التصنيف"],["tuition","الرسوم"],["employ","التوظيف"]] .map(([val, label]) => (
                  <button key={val} onClick={() => setSortBy(val as "rank"|"tuition"|"employ")}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${sortBy === val ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Region filter */}
          <div className="mt-3 flex flex-wrap gap-2">
            {regions.map(r => (
              <button key={r} onClick={() => setFilterRegion(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterRegion === r ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500"><strong>{filtered.length}</strong> جامعة</p>
          <p className="text-xs text-gray-400">اضغط "قارن" لاختيار حتى 3 جامعات</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(u => {
            const isComparing = compareIds.includes(u.id);
            const isSaved = savedUniversities.includes(u.id);
            const matchPct = dnaPath ? getDNAMatch(u.paths, dnaPath) : null;

            return (
              <div key={u.id}
                className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden ${isComparing ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-100"}`}>

                {/* Photo Banner */}
                <div className={`relative h-40 bg-gradient-to-br ${u.color} overflow-hidden flex-shrink-0`}>
                  {u.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.photo} alt={u.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 right-3 left-3 flex items-end justify-between">
                    <div>
                      <span className="text-white font-extrabold text-xl">{u.short}</span>
                      <p className="text-white/90 text-xs leading-tight">{u.region}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {u.type === "حكومية" && (
                        <span className="bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">حكومية</span>
                      )}
                      {matchPct && matchPct >= 80 && (
                        <span className="bg-purple-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">🧬 {matchPct}%</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => toggleSaveUniversity(u.id)}
                    className={`absolute top-2 left-2 text-xl drop-shadow-lg transition-transform hover:scale-110 ${isSaved ? "text-red-400" : "text-white/70 hover:text-red-400"}`}>
                    {isSaved ? "❤️" : "🤍"}
                  </button>
                </div>

                {/* Card Header */}
                <div className="p-4 flex-1">
                  <div className="mb-2">
                    <p className="text-sm text-gray-800 font-bold leading-tight mb-1">{u.name}</p>
                  </div>

                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{u.desc}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 block">الرسوم/سنة</span>
                      <span className="font-bold text-gray-700">
                        {u.tuitionMin === 0 ? "بلا رسوم" : `${u.tuitionMin.toLocaleString()}$+`}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 block">معدل القبول</span>
                      <span className="font-bold text-gray-700">{u.acceptance}%</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 block">التوظيف</span>
                      <span className="font-bold text-gray-700">{u.employRate}%</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 block">اللغة</span>
                      <span className="font-bold text-gray-700 text-[11px]">{u.lang}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <Stars n={u.rank} />
                    <span className="text-gray-400">📍 {u.region}</span>
                  </div>

                  {/* Majors */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {u.majors.slice(0, 4).map(m => (
                      <span key={m} className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{m}</span>
                    ))}
                    {u.majors.length > 4 && (
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">+{u.majors.length - 4}</span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="border-t border-gray-100 p-3 flex gap-2 flex-wrap">
                  <button onClick={() => toggleCompare(u.id)}
                    className={`flex-1 text-xs font-bold py-2 rounded-xl transition-colors ${isComparing ? "bg-blue-600 text-white" : compareIds.length >= 3 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
                    disabled={!isComparing && compareIds.length >= 3}>
                    {isComparing ? "✓ في المقارنة" : "قارن"}
                  </button>
                  <Link href={`/universities/${u.id}`}
                    className="flex-1 text-center text-xs font-bold py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                    عرض التفاصيل ←
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Saved Universities Section */}
        {savedUniversities.length > 0 && (
          <div className="mt-10 p-5 bg-red-50 border border-red-100 rounded-2xl">
            <h3 className="font-bold text-gray-800 mb-3">❤️ جامعاتك المحفوظة ({savedUniversities.length})</h3>
            <div className="flex flex-wrap gap-2">
              {UNIVERSITIES.filter(u => savedUniversities.includes(u.id)).map(u => (
                <span key={u.id} className="bg-white border border-red-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-gray-700">
                  {u.short} — {u.name}
                </span>
              ))}
            </div>
            <div className="mt-3">
              <button onClick={() => {
                const saved = UNIVERSITIES.filter(u => savedUniversities.includes(u.id));
                setCompareIds(saved.slice(0, 3).map(u => u.id));
                if (saved.length >= 2) setShowCompare(true);
              }}
                className="text-sm font-bold text-blue-600 hover:underline">
                قارن جامعاتي المحفوظة ⚡
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
