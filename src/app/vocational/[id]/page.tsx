"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchTrackById } from "@/lib/entities";

export default function VocationalTrackPage() {
  const params = useParams();
  const id = String(params?.id || '');
  const [track, setTrack] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTrackById(id).then((t) => { setTrack(t); setLoading(false); }); }, [id]);

  if (loading) return <main className="min-h-screen flex items-center justify-center" dir="rtl">⏳</main>;
  if (!track) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center"><div className="text-6xl mb-4">🔍</div><h1 className="text-2xl font-bold text-[#1b3a6b]">المسار غير موجود</h1>
          <Link href="/vocational" className="mt-4 inline-block px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">← العودة</Link></div>
      </main>
    );
  }

  const demandColor = { "عالٍ جداً": "bg-emerald-100 text-emerald-700", "عالٍ": "bg-blue-100 text-blue-700", "متوسط": "bg-amber-100 text-amber-700", "منخفض": "bg-gray-100 text-gray-700" }[track.demand as string] || "bg-gray-100";
  const levelLabels: Record<string, string> = { LT: "لافتة", BT: "بكالوريا تقنية", TS: "تقني سامٍ", licence: "إجازة" };

  return (
    <main className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <section className="bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Link href="/vocational" className="text-white/85 text-sm">← كل المسارات المهنية</Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mt-4">
            <div className="text-7xl">{track.emoji}</div>
            <div className="flex-1">
              <div className="text-sm opacity-85 mb-1">القطاع: {track.sector}</div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{track.name}</h1>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full font-semibold">{levelLabels[track.level as string] || track.level}</span>
                <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">{track.duration}</span>
                <span className={`${demandColor} px-3 py-1 rounded-full font-semibold`}>الطلب: {track.demand}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border-r-4 border-emerald-500">
            <div className="text-sm text-gray-500 mb-1">💰 الراتب في لبنان</div>
            <div className="text-2xl font-extrabold text-emerald-700">{track.salaryLB}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border-r-4 border-blue-500">
            <div className="text-sm text-gray-500 mb-1">🌍 الراتب في الخليج</div>
            <div className="text-2xl font-extrabold text-blue-700">{track.salaryGulf}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">📋 وصف المسار</h2>
          <p className="text-gray-700 leading-relaxed">{track.desc}</p>
        </div>
        {track.subjects?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">📚 المواد الأساسية</h2>
            <div className="grid md:grid-cols-2 gap-3">{track.subjects.map((s: string, i: number) => <div key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg"><span className="text-[#1b3a6b]">📖</span><span>{s}</span></div>)}</div>
          </div>
        )}
        {track.uniEquiv && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h2 className="font-bold text-lg text-[#1b3a6b] mb-2">🎓 معادلة جامعية</h2>
            <p className="text-gray-700 text-sm">{track.uniEquiv}</p>
          </div>
        )}
      </div>
    </main>
  );
}
