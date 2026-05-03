"use client";
import { useState } from "react";
import Link from "next/link";

const SCHOLARSHIPS = [
  {
    id: 1, name: "منحة الجامعة الأمريكية في بيروت AUB", org: "AUB",
    amount: "تغطية كاملة", deadline: "31 مارس 2026", type: "need",
    fields: ["جميع التخصصات"], region: "all", gpa: 80,
    desc: "منحة شاملة تغطي الرسوم الدراسية والإقامة لأبرز الطلاب المحتاجين مالياً",
    link: "https://www.aub.edu.lb", emoji: "🏛️", tag: "تغطية كاملة", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 2, name: "منحة الجامعة اللبنانية الأمريكية LAU", org: "LAU",
    amount: "50% من الرسوم", deadline: "15 أبريل 2026", type: "merit",
    fields: ["الهندسة","التجارة","الفنون"], region: "all", gpa: 85,
    desc: "منح الجدارة للطلاب المتميزين في الدراسة الثانوية",
    link: "https://www.lau.edu.lb", emoji: "🎓", tag: "جدارة", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 3, name: "منحة مؤسسة رفيق الحريري", org: "مؤسسة الحريري",
    amount: "2,500$ سنوياً", deadline: "28 فبراير 2026", type: "need",
    fields: ["الطب","الهندسة","العلوم"], region: "all", gpa: 75,
    desc: "دعم مالي للطلاب اللبنانيين المتفوقين من الأسر المحدودة الدخل",
    link: "#", emoji: "🌟", tag: "دعم مالي", tagColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 4, name: "منحة الجامعة اليسوعية USJ", org: "USJ",
    amount: "30% - 70%", deadline: "1 مايو 2026", type: "mixed",
    fields: ["الحقوق","الطب","الإنسانيات"], region: "all", gpa: 78,
    desc: "برنامج دعم متعدد المستويات للطلاب المتميزين والمحتاجين",
    link: "https://www.usj.edu.lb", emoji: "⚖️", tag: "متعدد المستويات", tagColor: "bg-purple-100 text-purple-700",
  },
  {
    id: 5, name: "منحة USEK الجامعة الروح القدس", org: "USEK",
    amount: "25% - 50%", deadline: "30 أبريل 2026", type: "merit",
    fields: ["الهندسة","العلوم","الآداب"], region: "الشمال", gpa: 80,
    desc: "منح الجدارة للطلاب المتميزين في الشمال والمناطق المجاورة",
    link: "https://www.usek.edu.lb", emoji: "📚", tag: "جدارة", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 6, name: "منحة البنك الدولي للتعليم في لبنان", org: "البنك الدولي",
    amount: "3,000$ سنوياً", deadline: "15 يونيو 2026", type: "need",
    fields: ["الاقتصاد","العلوم الاجتماعية","السياسات العامة"], region: "all", gpa: 70,
    desc: "منحة دولية تدعم التعليم العالي في لبنان للأسر المتضررة",
    link: "#", emoji: "🌍", tag: "دولية", tagColor: "bg-teal-100 text-teal-700",
  },
  {
    id: 7, name: "منحة الجامعة اللبنانية LU", org: "الجامعة اللبنانية",
    amount: "إعفاء كامل", deadline: "30 سبتمبر 2026", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 85,
    desc: "إعفاء كامل من الرسوم للطلاب الأوائل على الثانوية العامة",
    link: "https://www.ul.edu.lb", emoji: "🏅", tag: "إعفاء كامل", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 8, name: "منحة Teach For Lebanon", org: "TFL",
    amount: "1,500$ + تدريب", deadline: "31 مارس 2026", type: "program",
    fields: ["التربية والتعليم","العلوم الاجتماعية"], region: "all", gpa: 75,
    desc: "برنامج للطلاب المهتمين بالتعليم ودعم المجتمعات المحلية",
    link: "#", emoji: "📖", tag: "برنامج", tagColor: "bg-orange-100 text-orange-700",
  },
];

const TYPE_LABELS: Record<string, string> = {
  all: "الكل", need: "حاجة مالية", merit: "تفوق أكاديمي", mixed: "مختلط", program: "برنامج",
};

export default function ScholarshipsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [gpaFilter, setGpaFilter] = useState(0);
  const [saved, setSaved] = useState<number[]>([]);

  const filtered = SCHOLARSHIPS.filter(s => {
    const matchSearch = s.name.includes(search) || s.org.includes(search) || s.fields.some(f => f.includes(search));
    const matchType = typeFilter === "all" || s.type === typeFilter;
    const matchGpa = gpaFilter === 0 || s.gpa <= gpaFilter;
    return matchSearch && matchType && matchGpa;
  });

  function toggleSave(id: number) {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">مسارك</span>
          </Link>
          <Link href="/dashboard" className="text-text-sub text-sm hover:text-primary">← الداشبورد</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-[#1e4080] rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🏆</div>
            <div>
              <h1 className="text-2xl font-extrabold mb-1">Scholarship Finder</h1>
              <p className="text-white/80">اكتشف المنح الدراسية المناسبة لك — {SCHOLARSHIPS.length}+ منحة متاحة</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="🔍 ابحث باسم المنحة، المؤسسة، أو التخصص..." />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none bg-white min-w-[160px]">
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={gpaFilter} onChange={e => setGpaFilter(Number(e.target.value))}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none bg-white min-w-[160px]">
              <option value={0}>أي معدل</option>
              <option value={70}>70% فأكثر</option>
              <option value={75}>75% فأكثر</option>
              <option value={80}>80% فأكثر</option>
              <option value={85}>85% فأكثر</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-3 text-sm text-text-sub">
            <span>تعرض <strong className="text-primary">{filtered.length}</strong> منحة</span>
            {saved.length > 0 && (
              <span className="text-accent font-semibold">⭐ {saved.length} منحة محفوظة</span>
            )}
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-text-sub">لم نجد منح تناسب بحثك. حاول تغيير الفلاتر.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(s => (
              <div key={s.id} className="card hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{s.emoji}</div>
                    <div>
                      <span className={`badge ${s.tagColor} text-xs mb-1 inline-block`}>{s.tag}</span>
                      <h3 className="font-bold text-primary text-sm leading-snug">{s.name}</h3>
                    </div>
                  </div>
                  <button onClick={() => toggleSave(s.id)}
                    className={`text-xl transition-transform hover:scale-110 ${saved.includes(s.id) ? "text-accent" : "text-gray-300"}`}>
                    ⭐
                  </button>
                </div>

                <p className="text-text-sub text-sm mb-4 leading-relaxed">{s.desc}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-sub">المبلغ</span>
                    <span className="font-bold text-success">{s.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-sub">آخر موعد</span>
                    <span className="font-semibold text-danger">{s.deadline}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-sub">المعدل المطلوب</span>
                    <span className="font-semibold text-primary">{s.gpa}% فأكثر</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-sub">التخصصات</span>
                    <span className="text-text-main text-xs">{s.fields.join("، ")}</span>
                  </div>
                </div>

                <a href={s.link} target="_blank" rel="noopener noreferrer"
                  className="w-full btn-primary py-2.5 rounded-xl text-sm text-center block">
                  تقدّم للمنحة ←
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="card mt-8 bg-light border-2 border-accent/20">
          <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
            <span>💡</span> نصائح للحصول على المنحة
          </h3>
          <ul className="space-y-2 text-sm text-text-sub">
            {[
              "أكمل ملفك الشخصي على مسارك أولاً — كثير من المنح تطلبه",
              "قدّم على أكثر من منحة في نفس الوقت لتزيد فرصك",
              "اكتب رسالة دوافع قوية تعكس شخصيتك وطموحاتك",
              "اطلب توصيات من أستاذك أو مرشدك في المدرسة",
              "راجع المواعيد النهائية بانتظام — لا تفوّت الفرصة",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">✓</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
