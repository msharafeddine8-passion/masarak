"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchUniversityById } from "@/lib/entities";
import { supabase } from "@/lib/supabase";

interface Review {
  id: number;
  user_id: string;
  rating: number;
  text: string;
  status_year: string | null;
  created_at: string;
}

function Stars({ n }: { n: number }) {
  return <span>{Array.from({ length: 5 }).map((_, i) => <span key={i} className={i < n ? "text-yellow-400" : "text-gray-200"}>★</span>)}</span>;
}

export default function UniversityDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [uni, setUni] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'majors' | 'reviews' | 'admissions'>('overview');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchUniversityById(id).then((u) => { setUni(u); setLoading(false); });
    loadReviews();
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data } = await supabase.from('student_profiles').select('school_name, preferred_universities').eq('user_id', session.user.id).maybeSingle();
      if (data) setProfile(data);
    }
  };

  const loadReviews = async () => {
    const { data } = await supabase.from('entity_reviews').select('*').eq('entity_type', 'university').eq('entity_id', String(id)).eq('is_visible', true).order('created_at', { ascending: false });
    setReviews((data as Review[]) || []);
  };

  const canReview = !!user && !!profile && Array.isArray(profile.preferred_universities) && profile.preferred_universities.includes(uni?.short);
  const userAlreadyReviewed = reviews.some((r) => r.user_id === user?.id);

  // متوسط التقييم — فقط إذا في تقييمات حقيقية
  const avgRating = reviews.length > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : null;

  if (loading) return <main className="min-h-screen flex items-center justify-center" dir="rtl"><div>⏳</div></main>;

  if (!uni) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-[#1b3a6b] mb-2">الجامعة غير موجودة</h1>
          <Link href="/universities" className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold mt-4 inline-block">← العودة</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <section className={`relative bg-gradient-to-br ${uni.color || 'from-[#1b3a6b] to-[#2d5391]'} text-white`}>
        {uni.photo && <div className="absolute inset-0 opacity-25">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={uni.photo} alt={uni.name} className="w-full h-full object-cover" /></div>}
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <Link href="/universities" className="inline-flex items-center gap-2 text-white/85 hover:text-white text-sm mb-4">← كل الجامعات</Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="text-7xl">{uni.emoji}</div>
            <div className="flex-1">
              <div className="text-sm opacity-85 mb-1">{uni.short} — {uni.region}</div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{uni.name}</h1>
              <div className="flex flex-wrap gap-2 text-sm">
                {uni.type && <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">{uni.type}</span>}
                {uni.lang && <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">{uni.lang}</span>}
                {/* تقييم النجوم — فقط إذا في تقييمات حقيقية من الطلاب */}
                {avgRating !== null && (
                  <span className="bg-yellow-400/90 text-[#1b3a6b] px-3 py-1 rounded-full font-bold">
                    ⭐ {avgRating}/5 ({reviews.length} تقييم)
                  </span>
                )}
                {uni.founded && <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">منذ {uni.founded}</span>}
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
          <Stat label="الطلاب" value={uni.students ? uni.students.toLocaleString() : '-'} />
          <Stat label="الكليات" value={uni.faculties || '-'} />
          <Stat label="الرسوم/سنة" value={uni.tuitionMin === 0 ? 'مجاني' : (uni.tuitionMin ? `$${uni.tuitionMin.toLocaleString()}–${(uni.tuitionMax || uni.tuitionMin).toLocaleString()}` : '-')} />
          <Stat label="معدل القبول" value={uni.acceptance ? `${uni.acceptance}%` : '-'} />
          <Stat label="معدل التوظيف" value={uni.employRate ? `${uni.employRate}%` : '-'} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b">
            {([
              { id: 'overview', label: 'نظرة عامة', icon: '📋' },
              { id: 'majors', label: 'التخصصات', icon: '📚' },
              { id: 'reviews', label: `التقييمات (${reviews.length})`, icon: '⭐' },
              { id: 'admissions', label: 'القبول والتواصل', icon: '✅' },
            ] as const).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${tab === t.id ? 'border-[#1b3a6b] text-[#1b3a6b] bg-blue-50/40' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
                <span>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {tab === 'overview' && (
              <div className="space-y-6">
                <div><h3 className="font-bold text-lg text-[#1b3a6b] mb-2">عن الجامعة</h3><p className="text-gray-700 leading-relaxed">{uni.desc || 'لا يوجد وصف بعد.'}</p></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <InfoRow label="الحرم الجامعي" value={uni.campus || '-'} />
                  <InfoRow label="الاعتماد" value={uni.accred || '-'} />
                  <InfoRow label="سنة التأسيس" value={uni.founded ? uni.founded.toString() : '-'} />
                  <InfoRow label="عدد الطلاب" value={uni.students ? uni.students.toLocaleString() : '-'} />
                </div>
                {uni.paths?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg text-[#1b3a6b] mb-3">المسارات الرئيسية</h3>
                    <div className="flex flex-wrap gap-2">{uni.paths.map((p: string) => <span key={p} className="px-3 py-1.5 bg-blue-50 text-[#1b3a6b] rounded-full text-sm font-semibold">{p}</span>)}</div>
                  </div>
                )}
                {uni.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <h3 className="font-bold text-[#1b3a6b] mb-2">📌 ملاحظات إضافية</h3>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{uni.notes}</p>
                  </div>
                )}
              </div>
            )}

            {tab === 'majors' && (
              <div>
                <h3 className="font-bold text-lg text-[#1b3a6b] mb-4">التخصصات ({uni.majors?.length || 0})</h3>
                {(uni.majors || []).length === 0 ? <div className="text-center text-gray-400 py-8">لا توجد تخصصات بعد</div> : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">{(uni.majors || []).map((m: string, i: number) => <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-semibold text-gray-700">📚 {m}</div>)}</div>
                )}
              </div>
            )}

            {tab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-lg text-[#1b3a6b]">آراء طلاب وخريجي الجامعة</h3>
                  {canReview && !userAlreadyReviewed && <button onClick={() => setShowReviewForm(true)} className="px-4 py-2 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm">+ أضف تقييمك</button>}
                </div>
                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm text-blue-900">
                    🔐 <Link href="/auth/login" className="font-bold underline">سجّل دخول</Link> لإضافة تقييمك (إذا كنت طالب/خريج).
                  </div>
                )}
                {user && !canReview && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-900">
                    ℹ️ التقييم متاح فقط لمن أضاف <strong>{uni.short}</strong> ضمن جامعاته في <Link href="/profile" className="font-bold underline">ملفه الشخصي</Link>.
                  </div>
                )}
                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-5xl mb-3">💬</div>
                    <p className="text-gray-500">لا توجد تقييمات بعد. كن أول من يشارك تجربته!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-bold text-gray-800">طالب/خريج</div>
                            <div className="text-xs text-gray-500">{r.status_year || ''} • {new Date(r.created_at).toLocaleDateString('ar')}</div>
                          </div>
                          <Stars n={r.rating} />
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                {showReviewForm && user && <ReviewForm entityType="university" entityId={String(id)} onClose={() => setShowReviewForm(false)} onSubmit={async () => { await loadReviews(); setShowReviewForm(false); }} />}
              </div>
            )}

            {tab === 'admissions' && (
              <div className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h3 className="font-bold text-[#1b3a6b] mb-2">📊 معلومات القبول</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <InfoRow label="معدل القبول" value={uni.acceptance ? `${uni.acceptance}%` : '-'} />
                    <InfoRow label="لغة التدريس" value={uni.lang || '-'} />
                    <InfoRow label="الرسوم" value={uni.tuitionMin === 0 ? 'مجانية' : (uni.tuitionMin ? `$${uni.tuitionMin}–${uni.tuitionMax}/سنة` : '-')} />
                    <InfoRow label="منح دراسية" value={uni.scholarships ? '✓ متوفرة' : '✗ غير متوفرة'} />
                    {uni.application_deadline && <InfoRow label="آخر موعد تقديم" value={uni.application_deadline} />}
                  </div>
                </div>
                {uni.requirements && <div className="bg-white border border-gray-200 rounded-xl p-5"><h3 className="font-bold text-[#1b3a6b] mb-2">📋 شروط القبول</h3><p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{uni.requirements}</p></div>}
                {(uni.phone || uni.email || uni.address) && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-bold text-[#1b3a6b] mb-3">📞 معلومات التواصل</h3>
                    <div className="space-y-2 text-sm">
                      {uni.phone && <div><span className="text-gray-500">الهاتف:</span> <a href={`tel:${uni.phone}`} className="font-semibold text-[#1b3a6b]" dir="ltr">{uni.phone}</a></div>}
                      {uni.email && <div><span className="text-gray-500">الإيميل:</span> <a href={`mailto:${uni.email}`} className="font-semibold text-[#1b3a6b]" dir="ltr">{uni.email}</a></div>}
                      {uni.address && <div><span className="text-gray-500">العنوان:</span> <span className="font-semibold">{uni.address}</span></div>}
                    </div>
                  </div>
                )}
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

function ReviewForm({ entityType, entityId, onClose, onSubmit }: { entityType: string; entityId: string; onClose: () => void; onSubmit: () => Promise<void> }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [statusYear, setStatusYear] = useState('طالب حالي');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!text.trim()) { setErr('اكتب تقييمك'); return; }
    setSaving(true); setErr('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setErr('سجّل دخول'); setSaving(false); return; }
    const { error } = await supabase.from('entity_reviews').upsert({
      user_id: session.user.id, entity_type: entityType, entity_id: entityId,
      rating, text: text.trim(), status_year: statusYear,
    }, { onConflict: 'user_id,entity_type,entity_id' });
    if (error) { setErr(error.message); setSaving(false); return; }
    await onSubmit(); setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" dir="rtl">
        <h2 className="text-xl font-bold text-[#1b3a6b] mb-4">إضافة تقييمك</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold mb-2">التقييم</label>
            <div className="flex gap-1 text-3xl">{[1,2,3,4,5].map((n) => <button key={n} onClick={() => setRating(n)} className={n <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</button>)}</div>
          </div>
          <div><label className="block text-sm font-semibold mb-2">حالتك</label>
            <select value={statusYear} onChange={(e) => setStatusYear(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white">
              <option value="طالب حالي">طالب حالي</option>
              <option value="خريج 2024">خريج 2024</option>
              <option value="خريج 2023">خريج 2023</option>
              <option value="خريج سابق">خريج سابق</option>
            </select></div>
          <div><label className="block text-sm font-semibold mb-2">تعليقك</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg min-h-[120px]" /></div>
          {err && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">❌ {err}</div>}
          <div className="flex gap-2">
            <button onClick={submit} disabled={saving} className="flex-1 px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold disabled:opacity-50">{saving ? 'جاري...' : 'نشر'}</button>
            <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 rounded-lg font-bold">إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  );
}
