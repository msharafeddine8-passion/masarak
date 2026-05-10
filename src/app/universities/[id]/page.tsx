"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchUniversityById } from "@/lib/entities";
import { REVIEWS } from "@/app/universities/data";

function Stars({ n }: { n: number }) {
  return (
    <span>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < n ? "text-yellow-400" : "text-gray-200"}>★</span>
      ))}
    </span>
  );
}

export default function UniversityDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [uni, setUni] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'majors' | 'reviews' | 'admissions'>('overview');

  useEffect(() => {
    fetchUniversityById(id).then((u) => { setUni(u); setLoading(false); });
  }, [id]);

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center" dir="rtl"><div className="text-center"><div className="text-4xl mb-3">⏳</div><div className="text-gray-600">جاري التحميل...</div></div></main>;
  }

  if (!uni) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-[#1b3a6b] mb-2">الجامعة غير موجودة</h1>
          <p className="text-gray-600 mb-6">لم نتمكن من العثور على الجامعة بالمعرّف رقم {params?.id}.</p>
          <Link href="/universities" className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold hover:bg-[#142d54]">← العودة لكل الجامعات</Link>
        </div>
      </main>
    );
  }

  const reviews = REVIEWS[uni.id] || [];

  return (
    <main className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <section className={`relative bg-gradient-to-br ${uni.color || 'from-[#1b3a6b] to-[#2d5391]'} text-white`}>
        {uni.photo && (
          <div className="absolute inset-0 opacity-25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={uni.photo} alt={uni.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <Link href="/universities" className="inline-flex items-center gap-2 text-white/85 hover:text-white text-sm mb-4">← كل الجامعات</Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="text-7xl">{uni.emoji}</div>
            <div className="flex-1">
              <div className="text-sm opacity-85 mb-1">{uni.short} — {uni.region}</div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{uni.name}</h1>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">{uni.type}</span>
                <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">{uni.lang}</span>
                <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">⭐ {uni.rank}/5</span>
                <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">منذ {uni.founded}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {uni.url && <a href={uni.url} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-white text-[#1b3a6b] rounded-lg font-bold text-sm text-center">🌐 الموقع الرسمي</a>}
              {uni.scholarships && <Link href="/scholarships" className="px-5 py-2.5 bg-[#5cc4b8] text-[#1b3a6b] rounded-lg font-bold text-sm text-center">🎓 منح متاحة</Link>}
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <Stat label="الطلاب" value={(uni.students || 0).toLocaleString()} />
          <Stat label="الكليات" value={uni.faculties || '-'} />
          <Stat label="الرسوم/سنة" value={uni.tuitionMin === 0 ? 'مجاني' : `$${(uni.tuitionMin || 0).toLocaleString()}–${(uni.tuitionMax || 0).toLocaleString()}`} />
          <Stat label="معدل القبول" value={`${uni.acceptance || '-'}%`} />
          <Stat label="معدل التوظيف" value={`${uni.employRate || '-'}%`} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b">
            {([
              { id: 'overview', label: 'نظرة عامة', icon: '📋' },
              { id: 'majors', label: 'التخصصات', icon: '📚' },
              { id: 'reviews', label: 'التقييمات', icon: '⭐' },
              { id: 'admissions', label: 'القبول', icon: '✅' },
            ] as const).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${tab === t.id ? 'border-[#1b3a6b] text-[#1b3a6b] bg-blue-50/40' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
                <span>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </div>
          <div className="p-6 md:p-8">
            {tab === 'overview' && (
              <div className="space-y-6">
                <div><h3 className="font-bold text-lg text-[#1b3a6b] mb-2">عن الجامعة</h3><p className="text-gray-700 leading-relaxed">{uni.desc}</p></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <InfoRow label="الحرم الجامعي" value={uni.campus || '-'} />
                  <InfoRow label="الاعتماد" value={uni.accred || '-'} />
                  <InfoRow label="سنة التأسيس" value={(uni.founded || '-').toString()} />
                  <InfoRow label="عدد الطلاب" value={(uni.students || 0).toLocaleString()} />
                </div>
                {uni.paths?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg text-[#1b3a6b] mb-3">المسارات الرئيسية</h3>
                    <div className="flex flex-wrap gap-2">{uni.paths.map((p: string) => <span key={p} className="px-3 py-1.5 bg-blue-50 text-[#1b3a6b] rounded-full text-sm font-semibold">{p}</span>)}</div>
                  </div>
                )}
              </div>
            )}
            {tab === 'majors' && (
              <div>
                <h3 className="font-bold text-lg text-[#1b3a6b] mb-4">التخصصات ({uni.majors?.length || 0})</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">{(uni.majors || []).map((m: string, i: number) => <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-semibold text-gray-700">📚 {m}</div>)}</div>
              </div>
            )}
            {tab === 'reviews' && (
              <div>
                <h3 className="font-bold text-lg text-[#1b3a6b] mb-4">آراء الطلاب والخريجين</h3>
                {reviews.length === 0 ? <div className="text-center text-gray-400 py-8">لا توجد تقييمات بعد</div> : (
                  <div className="space-y-4">{reviews.map((r, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div><div className="font-bold text-gray-800">{r.name}</div><div className="text-xs text-gray-500">{r.year}</div></div>
                        <Stars n={r.rating} />
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{r.text}</p>
                    </div>
                  ))}</div>
                )}
              </div>
            )}
            {tab === 'admissions' && (
              <div className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h3 className="font-bold text-[#1b3a6b] mb-2">📊 معلومات القبول</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <InfoRow label="معدل القبول" value={`${uni.acceptance || '-'}%`} />
                    <InfoRow label="لغة التدريس" value={uni.lang || '-'} />
                    <InfoRow label="الرسوم" value={uni.tuitionMin === 0 ? 'مجانية' : `$${uni.tuitionMin}–${uni.tuitionMax}/سنة`} />
                    <InfoRow label="منح دراسية" value={uni.scholarships ? '✓ متوفرة' : '✗ غير متوفرة'} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {uni.url && <a href={uni.url} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm">🌐 ابدأ تقديم طلب</a>}
                  <Link href="/tools/cost-calculator" className="px-5 py-2.5 border-2 border-[#1b3a6b] text-[#1b3a6b] rounded-lg font-bold text-sm">💰 احسب الكلفة</Link>
                  <Link href="/scholarships" className="px-5 py-2.5 border-2 border-[#5cc4b8] text-[#1b3a6b] rounded-lg font-bold text-sm">🎓 ابحث عن منح</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div><div className="text-2xl font-extrabold text-[#1b3a6b]">{value}</div><div className="text-xs text-gray-500 mt-1">{label}</div></div>;
}
function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between items-center bg-gray-50 px-4 py-2.5 rounded-lg"><span className="text-gray-500 text-sm">{label}</span><span className="font-semibold text-gray-800 text-sm">{value}</span></div>;
}
