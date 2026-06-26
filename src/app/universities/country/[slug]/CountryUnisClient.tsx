"use client";
// Rich, filterable list for a country's universities — mirrors the Lebanon
// universities experience (hero + stats + search/type filter + sort + cards),
// driven by the data available in universities_global.
import { useMemo, useState } from "react";
import Link from "next/link";

export type GUni = {
  slug: string;
  name_ar: string;
  name_en: string;
  city_ar: string | null;
  type: string | null;
  qs_rank: number | null;
  founded_year: number | null;
};

const GRADIENTS = [
  "from-[#1b3a6b] to-[#2d5391]",
  "from-[#0F4A52] to-[#1A6F7C]",
  "from-[#2d5391] to-[#5cc4b8]",
  "from-[#16315c] to-[#1b3a6b]",
  "from-[#1A6F7C] to-[#2d5391]",
];

export default function CountryUnisClient({
  countryNameAr, flag, slug, unis,
}: { countryNameAr: string; flag: string; slug: string; unis: GUni[] }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"" | "public" | "private">("");
  const [sortBy, setSortBy] = useState<"rank" | "name" | "founded">("rank");

  const cities = useMemo(
    () => Array.from(new Set(unis.map((u) => (u.city_ar || "").trim()).filter(Boolean))),
    [unis]
  );
  const [city, setCity] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim();
    let arr = unis.filter((u) => {
      if (q && !u.name_ar.includes(q) && !u.name_en.toLowerCase().includes(q.toLowerCase())) return false;
      if (type && (u.type || "") !== type) return false;
      if (city && (u.city_ar || "").trim() !== city) return false;
      return true;
    });
    arr = [...arr].sort((a, b) => {
      if (sortBy === "name") return a.name_ar.localeCompare(b.name_ar, "ar");
      if (sortBy === "founded") return (b.founded_year ?? 0) - (a.founded_year ?? 0);
      return (a.qs_rank ?? 9999) - (b.qs_rank ?? 9999);
    });
    return arr;
  }, [unis, search, type, city, sortBy]);

  const publicN = unis.filter((u) => u.type === "public").length;
  const privateN = unis.filter((u) => u.type === "private").length;

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7faf9] pb-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#5cc4b8] rounded-full blur-3xl opacity-20" />
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <Link href="/universities" className="text-sm text-white/80 hover:text-white font-semibold">← كل الدول</Link>
          <div className="text-6xl mt-4 mb-2">{flag}</div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">جامعات {countryNameAr}</h1>
          <div className="flex flex-wrap gap-3">
            {[
              { v: unis.length, l: "جامعة" },
              { v: publicN, l: "حكومية" },
              { v: privateN, l: "خاصة" },
            ].map((s) => (
              <div key={s.l} className="bg-white/15 backdrop-blur px-4 py-2 rounded-2xl border border-white/20">
                <span className="font-extrabold text-2xl">{s.v}</span>
                <span className="text-sm opacity-90 mr-1">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-4 grid md:grid-cols-4 gap-3 mb-4 border border-gray-100">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم الجامعة…"
            className="md:col-span-2 px-4 py-2.5 border border-gray-200 rounded-lg"
          />
          <select value={type} onChange={(e) => setType(e.target.value as "" | "public" | "private")}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
            <option value="">كل الأنواع</option>
            <option value="public">حكومية</option>
            <option value="private">خاصة</option>
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
            <option value="">كل المدن</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Sort */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-bold text-gray-500">رتّب حسب:</span>
          {([
            ["rank", "التصنيف العالمي"],
            ["name", "الاسم"],
            ["founded", "الأحدث تأسيساً"],
          ] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSortBy(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${sortBy === key ? "bg-[#1b3a6b] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {label}
            </button>
          ))}
          <span className="text-xs text-gray-400 mr-auto">{filtered.length} من {unis.length}</span>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">🔍</div><p>ما في نتائج مطابقة.</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((u, i) => (
              <Link key={u.slug} href={`/universities/country/${slug}/${u.slug}`}
                className="bg-white rounded-2xl border border-gray-100 hover:border-[#1b3a6b]/40 hover:shadow-lg transition overflow-hidden block group">
                <div className={`relative h-28 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {u.qs_rank && (
                    <div className="absolute top-3 right-3 bg-amber-400 text-[#1b3a6b] px-2.5 py-1 rounded-full font-extrabold text-xs shadow">
                      QS #{u.qs_rank}
                    </div>
                  )}
                  {u.type && (
                    <div className="absolute bottom-3 left-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.type === "public" ? "bg-green-500/95 text-white" : "bg-white/95 text-[#1b3a6b]"}`}>
                        {u.type === "public" ? "حكومية" : "خاصة"}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-4 text-3xl drop-shadow">🏛️</div>
                </div>
                <div className="p-4">
                  <h3 className="font-extrabold text-[#1b3a6b] leading-snug group-hover:underline line-clamp-2">{u.name_ar}</h3>
                  <p className="text-xs text-gray-400 mt-1">{u.name_en}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    📍 {u.city_ar || "—"}{u.founded_year ? ` · تأسّست ${u.founded_year}` : ""}
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-center text-xs font-bold text-white bg-[#1b3a6b] group-hover:bg-[#16315c] rounded-lg py-2 transition">
                    التفاصيل ←
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">الرسوم وشروط القبول تتغيّر — تأكّد من الموقع الرسمي لكل جامعة.</p>
      </div>
    </main>
  );
}
