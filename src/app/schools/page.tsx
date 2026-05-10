"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { SCHOOLS, type School } from "./data";

export default function SchoolsPage() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");

  const regions = useMemo(() => Array.from(new Set(SCHOOLS.map((s) => s.region))), []);
  const types = ["خاصة", "رسمية", "دولية", "مهنية"];

  const filtered = useMemo(() => {
    return SCHOOLS.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.area.toLowerCase().includes(search.toLowerCase())) return false;
      if (region && s.region !== region) return false;
      if (type && s.type !== type) return false;
      return true;
    });
  }, [search, region, type]);

  return (
    <main className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">🏫 دليل المدارس</h1>
          <p className="text-white/85 text-lg max-w-2xl">
            استعرض المدارس الثانوية والمعاهد التعليمية. قارن المناهج، الرسوم، والمميزات.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full text-sm">
            <span className="font-bold text-2xl">{SCHOOLS.length}</span>
            <span>مدرسة مدرجة</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-4 grid md:grid-cols-4 gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 ابحث باسم المدرسة..."
            className="md:col-span-2 px-4 py-2.5 border border-gray-200 rounded-lg"
          />
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
            <option value="">كل المناطق</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
            <option value="">كل الأنواع</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Results */}
        <div className="mt-4 text-sm text-gray-600">
          {filtered.length} مدرسة من أصل {SCHOOLS.length}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filtered.map((s) => <SchoolCard key={s.id} school={s} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <div className="text-6xl mb-3">🔍</div>
            <p>لم نجد أي مدرسة بهذه المعايير</p>
          </div>
        )}
      </div>
    </main>
  );
}

function SchoolCard({ school }: { school: School }) {
  const typeColor: Record<string, string> = {
    "خاصة": "bg-blue-100 text-blue-700",
    "رسمية": "bg-red-100 text-red-700",
    "دولية": "bg-purple-100 text-purple-700",
    "مهنية": "bg-orange-100 text-orange-700",
  };

  return (
    <Link
      href={`/schools/${school.id}`}
      className="bg-white rounded-2xl border border-gray-200 hover:border-[#1b3a6b] hover:shadow-lg transition overflow-hidden block group"
    >
      <div className={`bg-gradient-to-br ${school.color} text-white p-5`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-4xl">{school.emoji}</span>
          <span className={`text-xs ${typeColor[school.type] || 'bg-white/15'} px-2 py-1 rounded-full font-semibold`}>{school.type}</span>
        </div>
        <h3 className="font-bold text-lg group-hover:underline">{school.name}</h3>
        <p className="text-xs opacity-85 mt-1">{school.region} — {school.area}</p>
      </div>
      <div className="p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">المناهج:</span> <span className="font-semibold">{school.curriculum.join("، ")}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">الرسوم:</span> <span className="font-semibold">{school.feesMin === 0 ? 'مجاني' : `$${school.feesMin}–${school.feesMax}`}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">التقييم:</span> <span className="font-semibold">⭐ {school.rating}/5</span></div>
        <div className="flex justify-between"><span className="text-gray-500">الطلاب:</span> <span className="font-semibold">{school.students.toLocaleString()}</span></div>
        <div className="pt-3 mt-3 border-t border-gray-100">
          <span className="text-[#1b3a6b] font-bold text-sm group-hover:underline">شوف التفاصيل ←</span>
        </div>
      </div>
    </Link>
  );
}
