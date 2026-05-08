"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UNIVERSITIES, REVIEWS } from "@/app/universities/data";

function Stars({ n }: { n: number }) {
  return (
    <span>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < n ? "text-yellow-400" : "text-gray-200"}>★</span>
      ))}
    </span>
  );
}

export default function UniversityPage() {
  const params = useParams();
  const id     = Number(params?.id);
  const uni    = UNIVERSITIES.find(u => u.id === id);

  const [tab, setTab]             = useState<"overview"|"majors"|"fees"|"reviews">("overview");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [userReviews, setUserReviews]   = useState<{name:string;rating:number;year:string;text:string}[]>([]);

  if (!uni) {
    return (
      <div className="min-h-screen bg-light flex flex-col items-center justify-center gap-4" dir="rtl">
        <div className="text-6xl">🏛️</div>
        <p className="text-text-sub">الجامعة غير موجودة</p>
        <Link href="/universities" className="btn-primary px-6 py-2 rounded-xl text-sm">← العودة للجامعات</Link>
      </div>
    );
  }

  const reviews = [...(REVIEWS[uni.id] || []), ...userReviews];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setUserReviews(prev => [{ name:"أنت", rating:reviewRating, year:"طالب", text:reviewText }, ...prev]);
    setReviewText("");
    setReviewRating(5);
  }

  const TABS = [
    { key:"overview", label:"نظرة عامة",   emoji:"📋" },
    { key:"majors",   label:"التخصصات",     emoji:"📚" },
    { key:"fees",     label:"الرسوم والمنح", emoji:"💰" },
    { key:"reviews",  label:"التقييمات",    emoji:"⭐" },
  ] as const;

  return (
    <div className="min-h-screen bg-light" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">مسارك</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-text-sub">
            <Link href="/universities" className="hover:text-primary">الجامعات</Link>
            <span className="text-gray-300">/</span>
            <span className="text-primary">{uni.short}</span>
          </nav>
          <Link href="/universities" className="text-text-sub text-sm hover:text-primary">← الجامعات</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">

        {/* Hero Banner */}
        <div className={`bg-gradient-to-br ${uni.color} rounded-2xl p-6 md:p-10 mb-6 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 opacity-10 text-[12rem] leading-none -mt-8 -mr-4 select-none">
            {uni.emoji}
          </div>
          <div className="relative z-10">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
                {uni.emoji}
              </div>
              <div>
                <p className="text-white/70 text-xs mb-0.5">{uni.short} · {uni.type} · تأسست {uni.founded}</p>
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{uni.name}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({length:5}).map((_,i)=>(
                      <span key={i} className={`text-lg ${i < uni.rank ? "text-yellow-300" : "text-white/25"}`}>★</span>
                    ))}
                  </div>
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {uni.rank === 5 ? "تصنيف ممتاز ⭐" : uni.rank === 4 ? "تصنيف جيد جداً" : uni.rank === 3 ? "تصنيف جيد" : "تصنيف مقبول"}
                  </span>
                </div>
                <p className="text-white/80 text-sm mt-1">📍 {uni.campus}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { n: `${uni.students.toLocaleString()}+`, l:"طالب" },
                { n: `${uni.acceptance}%`, l:"معدل القبول" },
                { n: `${uni.employRate}%`, l:"نسبة التوظيف" },
                { n: avgRating, l:"تقييم الطلاب" },
              ].map((s, i) => (
                <div key={i} className="bg-white/15 rounded-xl p-3 text-center">
                  <div className="text-xl font-extrabold">{s.n}</div>
                  <div className="text-xs text-white/70 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border-2 whitespace-nowrap transition-all ${
                tab === t.key ? "bg-primary text-white border-primary" : "bg-white border-gray-200 text-text-sub hover:border-primary"
              }`}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {tab === "overview" && (
          <div className="space-y-5">
            <div className="card">
              <h2 className="font-extrabold text-primary text-lg mb-3">📖 عن الجامعة</h2>
              <p className="text-text-sub leading-relaxed">{uni.desc}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="card">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <span>📊</span> إحصائيات سريعة
                </h3>
                <div className="space-y-3">
                  {[
                    { label:"سنة التأسيس",     val: String(uni.founded) },
                    { label:"عدد الطلاب",      val: `${uni.students.toLocaleString()}+` },
                    { label:"عدد الكليات",     val: `${uni.faculties} كليات` },
                    { label:"الحرم الجامعي",   val: uni.campus },
                    { label:"لغة التدريس",     val: uni.lang },
                    { label:"المنطقة",          val: uni.region },
                    { label:"الاعتماد",         val: uni.accred },
                    { label:"معدل القبول",      val: `${uni.acceptance}%` },
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-text-sub text-sm">{r.label}</span>
                      <span className="font-semibold text-primary text-sm">{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <span>💡</span> مميزات الجامعة
                </h3>
                <div className="space-y-2">
                  {[
                    uni.acceptance <= 30  ? "✅ قبول تنافسي — نخبة الطلاب" : "✅ قبول متاح لطيف من المتقدمين",
                    uni.scholarships      ? "✅ منح دراسية متوفرة" : "❌ لا منح دراسية حالياً",
                    uni.employRate >= 90  ? "✅ نسبة توظيف ممتازة" : uni.employRate >= 80 ? "✅ نسبة توظيف جيدة" : "⚠️ نسبة توظيف متوسطة",
                    uni.rank >= 5 ? "⭐ تصنيف عالٍ جداً — من الأفضل لبنانياً" : uni.rank >= 4 ? "⭐ تصنيف جيد — موثوقة ومعروفة" : "📌 جامعة معترف بها وطنياً",
                    uni.tuitionMin === 0  ? "💚 تعليم مجاني / شبه مجاني" : uni.tuitionMin < 6000 ? "💛 رسوم معقولة" : "💰 رسوم مرتفعة — تحقق من المنح",
                    `🌍 لغة التدريس: ${uni.lang}`,
                  ].map((item, i) => (
                    <div key={i} className="text-sm text-text-sub bg-gray-50 rounded-xl px-3 py-2">{item}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-primary mb-4">🔗 روابط مفيدة</h3>
              <div className="flex flex-wrap gap-3">
                <a href={uni.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                  🌐 الموقع الرسمي ↗
                </a>
                <a href={`${uni.url}/admissions`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white border-2 border-primary text-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/5 transition-colors">
                  📝 شروط القبول ↗
                </a>
                {uni.scholarships && (
                  <a href={`${uni.url}/scholarships`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-amber-50 border-2 border-amber-300 text-amber-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-colors">
                    🏆 المنح الدراسية ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Majors */}
        {tab === "majors" && (
          <div className="card">
            <h2 className="font-extrabold text-primary text-lg mb-5">📚 التخصصات المتاحة في {uni.short}</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {uni.majors.map((m, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 hover:bg-primary/5 rounded-xl px-4 py-3 transition-colors">
                  <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-primary text-sm">{m}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-700">
                💡 للاطلاع على القائمة الكاملة للتخصصات وشروط القبول التفصيلية، يُرجى زيارة{" "}
                <a href={`${uni.url}/academics`} target="_blank" rel="noopener noreferrer"
                  className="font-bold underline">الموقع الرسمي لـ {uni.short}</a>
              </p>
            </div>
          </div>
        )}

        {/* Tab: Fees */}
        {tab === "fees" && (
          <div className="space-y-5">
            <div className="card">
              <h2 className="font-extrabold text-primary text-lg mb-5">💰 الرسوم الدراسية في {uni.short}</h2>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-primary/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-extrabold text-primary">
                    {uni.tuitionMin === 0 ? "مجاني" : `$${uni.tuitionMin.toLocaleString()}`}
                  </div>
                  <div className="text-xs text-text-sub mt-1">الحد الأدنى / سنة</div>
                </div>
                <div className="bg-accent/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-extrabold text-accent">
                    {uni.tuitionMax === 500 ? "~$500" : `$${uni.tuitionMax.toLocaleString()}`}
                  </div>
                  <div className="text-xs text-text-sub mt-1">الحد الأقصى / سنة</div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-text-sub">
                <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                  <span>📌</span>
                  <p>الأرقام تقديرية وتشمل الرسوم الأكاديمية فقط. قد تضاف رسوم التسجيل والمختبرات والنشاطات.</p>
                </div>
                <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                  <span>💱</span>
                  <p>تدفع الرسوم في بعض الجامعات بالليرة اللبنانية وفق سعر صرف رسمي — تحقق مع الجامعة مباشرة.</p>
                </div>
                {uni.tuitionMin === 0 && (
                  <div className="flex items-start gap-2 bg-green-50 rounded-xl p-3 text-green-700">
                    <span>✅</span>
                    <p>الجامعة اللبنانية تعليم حكومي شبه مجاني متاح لجميع حاملي البكالوريا.</p>
                  </div>
                )}
              </div>
            </div>

            {uni.scholarships && (
              <div className="card border-2 border-amber-200 bg-amber-50/50">
                <h3 className="font-bold text-amber-700 text-lg mb-3 flex items-center gap-2">
                  <span>🏆</span> المنح الدراسية المتاحة
                </h3>
                <div className="space-y-2 text-sm text-amber-800">
                  {[
                    "منح الامتياز الأكاديمي (للمتفوقين في البكالوريا)",
                    "منح الحاجة المالية (للأسر ذات الدخل المحدود)",
                    "منح النشاطات اللاصفية والقيادة الطلابية",
                    "منح أبناء الخريجين",
                    "منح التبادل الطلابي مع جامعات دولية",
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2">
                      <span className="text-amber-500">✦</span> {s}
                    </div>
                  ))}
                </div>
                <a href={`${uni.url}/scholarships`} target="_blank" rel="noopener noreferrer"
                  className="mt-4 block bg-amber-500 text-white text-center py-3 rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors">
                  تقدم للمنح الدراسية ↗
                </a>
              </div>
            )}
          </div>
        )}

        {/* Tab: Reviews */}
        {tab === "reviews" && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="card flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-extrabold text-primary">{avgRating}</div>
                <Stars n={Math.round(Number(avgRating))} />
                <div className="text-xs text-text-sub mt-1">{reviews.length} تقييم</div>
              </div>
              <div className="flex-1">
                {[5,4,3,2,1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct   = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-text-sub w-4">{star}</span>
                      <span className="text-yellow-400 text-xs">★</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-text-sub w-6">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Review */}
            <div className="card">
              <h3 className="font-bold text-primary mb-4">✍️ أضف تقييمك</h3>
              <form onSubmit={submitReview} className="space-y-3">
                <div>
                  <p className="text-xs text-text-sub mb-2">تقييمك</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewRating(s)}
                        className={`text-2xl transition-transform hover:scale-110 ${s <= reviewRating ? "text-yellow-400" : "text-gray-200"}`}>★</button>
                    ))}
                  </div>
                </div>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none resize-none"
                  placeholder="شارك تجربتك في هذه الجامعة..." />
                <button type="submit" className="btn-primary px-6 py-2 rounded-xl text-sm font-semibold">
                  نشر التقييم ←
                </button>
              </form>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-primary text-sm">{r.name}</p>
                      <p className="text-xs text-text-sub">{r.year}</p>
                    </div>
                    <Stars n={r.rating} />
                  </div>
                  <p className="text-sm text-text-sub leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compare CTA */}
        <div className="card mt-6 bg-gradient-to-r from-primary to-[#1e4080] text-white text-center py-8 rounded-2xl">
          <div className="text-4xl mb-2">⚖️</div>
          <h3 className="font-extrabold text-lg mb-2">قارن {uni.short} مع جامعات أخرى</h3>
          <p className="text-white/80 text-sm mb-4">اكتشف الفروق وساعد نفسك على اتخاذ القرار الصح</p>
          <Link href="/universities" className="bg-white text-primary font-bold px-6 py-2 rounded-xl text-sm hover:bg-white/90 transition-colors inline-block">
            مقارنة الجامعات ←
          </Link>
        </div>
      </main>
    </div>
  );
}
