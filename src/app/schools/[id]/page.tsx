"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSchoolById } from "../data";

export default function SchoolDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const school = getSchoolById(id);

  if (!school) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-[#1b3a6b] mb-2">المدرسة غير موجودة</h1>
          <p className="text-gray-600 mb-6">لم نتمكن من العثور على المدرسة بالمعرّف رقم {params?.id}.</p>
          <Link href="/schools" className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold hover:bg-[#142d54]">
            ← العودة لكل المدارس
          </Link>
        </div>
      </main>
    );
  }

  const typeColor: Record<string, string> = {
    "خاصة": "bg-blue-100 text-blue-700",
    "رسمية": "bg-red-100 text-red-700",
    "دولية": "bg-purple-100 text-purple-700",
    "مهنية": "bg-orange-100 text-orange-700",
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      {/* Hero */}
      <section className={`bg-gradient-to-br ${school.color} text-white`}>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Link href="/schools" className="inline-flex items-center gap-2 text-white/85 hover:text-white text-sm mb-4">
            ← كل المدارس
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
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
            {school.website && (
              <a href={school.website} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-white text-[#1b3a6b] rounded-lg font-bold text-sm">
                🌐 الموقع الرسمي
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Stat label="عدد الطلاب" value={school.students.toLocaleString()} />
          <Stat label="المراحل" value={school.grades} />
          <Stat label="الرسوم/سنة" value={school.feesMin === 0 ? 'مجاني' : `$${school.feesMin.toLocaleString()}–${school.feesMax.toLocaleString()}`} />
          <Stat label="التقييم" value={`⭐ ${school.rating}/5`} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* About */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">📋 عن المدرسة</h2>
          <p className="text-gray-700 leading-relaxed">{school.desc}</p>
        </div>

        {/* Curriculum */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">📚 المناهج المتاحة</h2>
          <div className="flex flex-wrap gap-2">
            {school.curriculum.map((c, i) => (
              <span key={i} className="px-3 py-1.5 bg-blue-50 text-[#1b3a6b] rounded-full text-sm font-semibold">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">✨ ما يميّزها</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {school.features.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-emerald-600 font-bold flex-shrink-0">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        {(school.phone || school.website) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">📞 التواصل</h2>
            <div className="space-y-2 text-sm">
              {school.phone && <div><span className="text-gray-500">الهاتف:</span> <span className="font-semibold" dir="ltr">{school.phone}</span></div>}
              {school.website && <div><span className="text-gray-500">الموقع:</span> <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-[#1b3a6b] hover:underline" dir="ltr">{school.website}</a></div>}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xl font-extrabold text-[#1b3a6b]">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
