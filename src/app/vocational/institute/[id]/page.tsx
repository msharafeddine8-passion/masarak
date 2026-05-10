"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchInstituteById } from "@/lib/entities";

export default function InstituteDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [inst, setInst] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInstituteById(id).then((i) => { setInst(i); setLoading(false); }); }, [id]);

  if (loading) return <main className="min-h-screen flex items-center justify-center" dir="rtl">⏳</main>;
  if (!inst) {
    return <main className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl"><div className="text-center"><div className="text-6xl">🔍</div><h1 className="text-2xl font-bold text-[#1b3a6b] mt-4">المعهد غير موجود</h1><Link href="/vocational" className="mt-4 inline-block px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">← العودة</Link></div></main>;
  }

  const typeColor: Record<string, string> = { "رسمي": "bg-green-100 text-green-700", "خاص": "bg-blue-100 text-blue-700", "مهني": "bg-purple-100 text-purple-700" };

  return (
    <main className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <section className="bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link href="/vocational" className="text-white/85 text-sm">← كل المعاهد</Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mt-4">
            <div className="text-7xl">{inst.emoji}</div>
            <div className="flex-1">
              <div className="text-sm opacity-85 mb-1">{inst.region}</div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{inst.name}</h1>
              <span className={`${typeColor[inst.type as string] || 'bg-white/15'} px-3 py-1 rounded-full text-sm font-semibold`}>{inst.type}</span>
            </div>
            {inst.website && <a href={inst.website} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-white text-[#1b3a6b] rounded-lg font-bold text-sm">🌐 الموقع</a>}
          </div>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-[#1b3a6b] mb-4">🎯 التخصصات المتوفرة</h2>
          <div className="grid md:grid-cols-2 gap-3">{(inst.specialties || []).map((s: string, i: number) => <div key={i} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg text-sm"><span className="text-[#1b3a6b]">📚</span><span className="font-semibold text-gray-700">{s}</span></div>)}</div>
        </div>
      </div>
    </main>
  );
}
