"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchSchoolById } from "@/lib/entities";

export default function SchoolDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [school, setSchool] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSchoolById(id).then((s) => { setSchool(s); setLoading(false); }); }, [id]);

  if (loading) return <main className="min-h-screen flex items-center justify-center" dir="rtl"><div>⏳ جاري التحميل...</div></main>;

  if (!school) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-[#1b3a6b] mb-2">المدرسة غير موجودة</h1>
          <Link href="/schools" className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold mt-4 inline-block">← العودة</Link>
        </div>
      </main>
    );
  }

  const typeColor: Record<string, string> = {
    "خاصة": "bg-blue-100 text-blue-700", "رسمية": "bg-red-100 text-red-700",
    "دولية": "bg-purple-100 text-purple-700", "مهنية": "bg-orange-100 text-orange-700",
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <section className={`bg-gradient-to-br ${school.color || 'from-blue-600 to-blue-800'} text-white`}>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Link href="/schools" className="text-white/85 hover:text-white text-sm">← كل المدارس</Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mt-4">
            <div className="text-7xl">{school.emoji}</div>
            <div className="flex-1">
              <div className="text-sm opacity-85 mb-1">{school.region} — {school.area}</div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{school.name}</h1>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className={`${typeColor[school.type] || 'bg-white/15'} px-3 py-1 rounded-full font-semibold`}>{school.type}</span>
                <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">{school.lang}</span>
                <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">⭐ {school.rating}/5</span>
                <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">منذ {school.founded}</span>
              </div>
            </div>
            {school.website && <a href={school.website} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-white text-[#1b3a6b] rounded-lg font-bold text-sm">🌐 الموقع</a>}
          </div>
        </div>
      </section>

      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Stat label="عدد الطلاب" value={(school.students || 0).toLocaleString()} />
          <Stat label="المراحل" value={school.grades || '-'} />
          <Stat label="الرسوم" value={school.feesMin === 0 ? 'مجاني' : `$${school.feesMin}–${school.feesMax}`} />
          <Stat label="التقييم" value={`⭐ ${school.rating}/5`} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">📋 عن المدرسة</h2>
          <p className="text-gray-700 leading-relaxed">{school.desc}</p>
        </div>
        {school.curriculum?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">📚 المناهج</h2>
            <div className="flex flex-wrap gap-2">{school.curriculum.map((c: string, i: number) => <span key={i} className="px-3 py-1.5 bg-blue-50 text-[#1b3a6b] rounded-full text-sm font-semibold">{c}</span>)}</div>
          </div>
        )}
        {school.features?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">✨ ما يميّزها</h2>
            <div className="grid md:grid-cols-2 gap-3">{school.features.map((f: string, i: number) => <div key={i} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-emerald-600 font-bold">✓</span><span>{f}</span></div>)}</div>
          </div>
        )}
        {(school.phone || school.website) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">📞 التواصل</h2>
            {school.phone && <div className="text-sm"><span className="text-gray-500">الهاتف:</span> <span className="font-semibold" dir="ltr">{school.phone}</span></div>}
            {school.website && <div className="text-sm mt-2"><span className="text-gray-500">الموقع:</span> <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-[#1b3a6b] hover:underline" dir="ltr">{school.website}</a></div>}
          </div>
        )}
      </div>
    </main>
  );
}
function Stat({ label, value }: { label: string; value: string | number }) {
  return <div><div className="text-xl font-extrabold text-[#1b3a6b]">{value}</div><div className="text-xs text-gray-500 mt-1">{label}</div></div>;
}
