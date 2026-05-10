"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { TRACKS, INSTITUTES, type VocationalTrack, type Institute } from "./data";

export default function VocationalPage() {
  const [view, setView] = useState<'tracks' | 'institutes'>('tracks');
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [sector, setSector] = useState("");

  const sectors = useMemo(() => Array.from(new Set(TRACKS.map((t) => t.sector))), []);
  const levels = ["LT", "BT", "TS", "licence"];

  const filteredTracks = useMemo(() => {
    return TRACKS.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (level && t.level !== level) return false;
      if (sector && t.sector !== sector) return false;
      return true;
    });
  }, [search, level, sector]);

  return (
    <main className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <section className="bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">🛠️ التعليم المهني والتقني</h1>
          <p className="text-white/85 text-lg max-w-2xl">
            اكتشف مسارات مهنية حقيقية بمستقبل واعد. شهادات معتمدة، رواتب جيدة، وإمكانية الإكمال جامعياً.
          </p>
          <div className="flex gap-3 mt-6">
            <div className="bg-white/15 backdrop-blur px-4 py-2 rounded-full text-sm">
              <span className="font-bold text-2xl">{TRACKS.length}</span> مسار مهني
            </div>
            <div className="bg-white/15 backdrop-blur px-4 py-2 rounded-full text-sm">
              <span className="font-bold text-2xl">{INSTITUTES.length}</span> معهد
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* View Switcher */}
        <div className="bg-white rounded-2xl shadow-md p-3 mb-4 flex gap-2">
          <button
            onClick={() => setView('tracks')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm ${view === 'tracks' ? 'bg-[#1b3a6b] text-white' : 'bg-gray-50 text-gray-700'}`}
          >
            📚 المسارات المهنية ({TRACKS.length})
          </button>
          <button
            onClick={() => setView('institutes')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm ${view === 'institutes' ? 'bg-[#1b3a6b] text-white' : 'bg-gray-50 text-gray-700'}`}
          >
            🏫 المعاهد ({INSTITUTES.length})
          </button>
        </div>

        {view === 'tracks' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-md p-4 grid md:grid-cols-4 gap-3 mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 ابحث باسم المسار..."
                className="md:col-span-2 px-4 py-2.5 border border-gray-200 rounded-lg"
              />
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
                <option value="">كل المستويات</option>
                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={sector} onChange={(e) => setSector(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
                <option value="">كل القطاعات</option>
                {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="text-sm text-gray-600 mb-3">{filteredTracks.length} مسار</div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTracks.map((t) => <TrackCard key={t.id} track={t} />)}
            </div>
          </>
        )}

        {view === 'institutes' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INSTITUTES.map((i) => <InstituteCard key={i.id} inst={i} />)}
          </div>
        )}
      </div>
    </main>
  );
}

function TrackCard({ track }: { track: VocationalTrack }) {
  const demandColor = {
    "عالٍ جداً": "bg-emerald-100 text-emerald-700",
    "عالٍ": "bg-blue-100 text-blue-700",
    "متوسط": "bg-amber-100 text-amber-700",
    "منخفض": "bg-gray-100 text-gray-700",
  }[track.demand] || "bg-gray-100";

  return (
    <Link href={`/vocational/${track.id}`} className="bg-white rounded-2xl border border-gray-200 hover:border-[#1b3a6b] hover:shadow-lg transition p-5 block group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-4xl">{track.emoji}</span>
        <div className="flex flex-col gap-1 items-end">
          <span className="text-xs bg-[#1b3a6b] text-white px-2 py-0.5 rounded-full font-bold">{track.level}</span>
          <span className={`text-xs ${demandColor} px-2 py-0.5 rounded-full font-semibold`}>{track.demand}</span>
        </div>
      </div>
      <h3 className="font-bold text-base text-[#1b3a6b] mb-1 group-hover:underline">{track.name}</h3>
      <p className="text-xs text-gray-500 mb-3">{track.sector}</p>
      <p className="text-sm text-gray-700 line-clamp-2 mb-3">{track.desc}</p>
      <div className="border-t pt-3 space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-gray-500">المدة:</span> <span className="font-semibold">{track.duration}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">راتب لبنان:</span> <span className="font-semibold text-emerald-600">{track.salaryLB}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">راتب الخليج:</span> <span className="font-semibold text-blue-600">{track.salaryGulf}</span></div>
      </div>
      <div className="pt-3 mt-3 border-t">
        <span className="text-[#1b3a6b] font-bold text-sm">شوف التفاصيل ←</span>
      </div>
    </Link>
  );
}

function InstituteCard({ inst }: { inst: Institute }) {
  const typeColor: Record<string, string> = {
    "رسمي": "bg-green-100 text-green-700",
    "خاص": "bg-blue-100 text-blue-700",
    "مهني": "bg-purple-100 text-purple-700",
  };

  return (
    <Link href={`/vocational/institute/${inst.id}`} className="bg-white rounded-2xl border border-gray-200 hover:border-[#1b3a6b] hover:shadow-lg transition p-5 block group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-4xl">{inst.emoji}</span>
        <span className={`text-xs ${typeColor[inst.type]} px-2 py-1 rounded-full font-semibold`}>{inst.type}</span>
      </div>
      <h3 className="font-bold text-base text-[#1b3a6b] mb-1 group-hover:underline">{inst.name}</h3>
      <p className="text-xs text-gray-500 mb-3">{inst.region}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {inst.specialties.slice(0, 4).map((s, i) => (
          <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{s}</span>
        ))}
      </div>
      <span className="text-[#1b3a6b] font-bold text-sm">شوف التفاصيل ←</span>
    </Link>
  );
}
