"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

// ─── RIASEC Questions ────────────────────────────────────────────────────────
const QUESTIONS = [
  // Realistic
  { id: 1, type: "R", text: "أحب العمل بيدي وإصلاح أو بناء الأشياء", emoji: "🔧" },
  { id: 2, type: "R", text: "أستمتع بالأنشطة الخارجية والطبيعة", emoji: "🌿" },
  { id: 3, type: "R", text: "أفضّل العمل مع الأدوات والآلات على العمل مع الناس", emoji: "⚙️" },
  // Investigative
  { id: 4, type: "I", text: "أحب حل المسائل الرياضية والمنطقية المعقدة", emoji: "🔭" },
  { id: 5, type: "I", text: "أقضي وقتاً في البحث والقراءة عن موضوعات علمية", emoji: "📖" },
  { id: 6, type: "I", text: "أفضّل التفكير العميق والتحليل على التنفيذ السريع", emoji: "🧩" },
  // Artistic
  { id: 7, type: "A", text: "أستمتع بالرسم أو الكتابة أو الموسيقى", emoji: "🎨" },
  { id: 8, type: "A", text: "أحب التعبير عن أفكاري بطرق إبداعية وغير تقليدية", emoji: "✨" },
  { id: 9, type: "A", text: "أفضّل البيئات المرنة على القواعد الصارمة", emoji: "🎭" },
  // Social
  { id: 10, type: "S", text: "أحب مساعدة الآخرين وإرشادهم", emoji: "🤝" },
  { id: 11, type: "S", text: "أستمتع بالعمل ضمن فريق والتواصل مع الناس", emoji: "👥" },
  { id: 12, type: "S", text: "أفكر كثيراً بكيفية تحسين المجتمع من حولي", emoji: "💚" },
  // Enterprising
  { id: 13, type: "E", text: "أحب قيادة المشاريع واتخاذ القرارات", emoji: "🚀" },
  { id: 14, type: "E", text: "أستمتع بالإقناع والتفاوض مع الآخرين", emoji: "💼" },
  { id: 15, type: "E", text: "أطمح لامتلاك عمل خاص أو قيادة فريق", emoji: "🏆" },
  // Conventional
  { id: 16, type: "C", text: "أحب التنظيم والترتيب والاهتمام بالتفاصيل", emoji: "📋" },
  { id: 17, type: "C", text: "أستمتع بالعمل مع الأرقام والبيانات والجداول", emoji: "📊" },
  { id: 18, type: "C", text: "أفضّل الخطط الواضحة والإجراءات المحددة", emoji: "✅" },
  // Extra
  { id: 19, type: "I", text: "أستمتع بتعلّم تقنيات جديدة ومواكبة التطور", emoji: "💡" },
  { id: 20, type: "A", text: "أحب استكشاف أفكار جديدة وغير مألوفة", emoji: "🌟" },
];

// ─── Career Recommendations ──────────────────────────────────────────────────
const CAREERS: Record<string, { title: string; careers: string[]; color: string; desc: string; emoji: string }> = {
  R: {
    title: "العملي البنّاء",
    emoji: "🔧",
    color: "from-orange-500 to-amber-600",
    desc: "أنت شخص عملي يحب البناء والإنجاز الملموس",
    careers: ["هندسة مدنية","هندسة ميكانيكية","هندسة كهربائية","تقنية المعلومات","الطيران والملاحة","الزراعة والبيئة"],
  },
  I: {
    title: "المحقق الباحث",
    emoji: "🔬",
    color: "from-blue-600 to-indigo-700",
    desc: "أنت فضولي تحليلي تحب الأسئلة العميقة والبحث",
    careers: ["الطب وعلوم الصحة","البحث العلمي","الذكاء الاصطناعي","الرياضيات والإحصاء","علم النفس","الصيدلة"],
  },
  A: {
    title: "الفنان المبدع",
    emoji: "🎨",
    color: "from-purple-600 to-pink-600",
    desc: "أنت إبداعي تعبيري تحب الجمال والابتكار",
    careers: ["تصميم جرافيك","الإعلام والصحافة","العمارة والتصميم الداخلي","السينما والفنون","التصوير الفوتوغرافي","الموضة والأزياء"],
  },
  S: {
    title: "المساعد الاجتماعي",
    emoji: "🤝",
    color: "from-green-600 to-teal-600",
    desc: "أنت متعاطف اجتماعي تحب مساعدة الآخرين",
    careers: ["التعليم والتدريس","العمل الاجتماعي","الطب النفسي","الرعاية الصحية","المنظمات الإنسانية","الإرشاد الأسري"],
  },
  E: {
    title: "القائد ريادي الأعمال",
    emoji: "🚀",
    color: "from-red-600 to-rose-600",
    desc: "أنت قائد طموح تحب المبادرة والتأثير",
    careers: ["ريادة الأعمال","القانون والسياسة","التسويق والمبيعات","إدارة الأعمال","الاستشارات","العلاقات الدولية"],
  },
  C: {
    title: "المنظّم الدقيق",
    emoji: "📊",
    color: "from-cyan-600 to-sky-700",
    desc: "أنت منظّم دقيق تحب الأنظمة والدقة",
    careers: ["المحاسبة والمالية","إدارة المشاريع","التدقيق والرقابة","الإدارة الحكومية","الأرشفة والتوثيق","علم البيانات"],
  },
};

// Arabic labels for the 6 RIASEC types (used in result hero chips).
const TYPE_LABELS: Record<string, string> = {
  R: "العملي",
  I: "الباحث",
  A: "الفنّان",
  S: "الاجتماعي",
  E: "القائد",
  C: "المنظّم",
};

// ─── Extended Recommendations ─────────────────────────────────────────────────
const EXTENDED: Record<string, {
  majors: string[];
  skills: string[];
  universities: string[];
  gulfJobs: string[];
  salaryRange: string;
  workStyle: string;
}> = {
  R: { majors:["هندسة مدنية","هندسة ميكانيكية","هندسة كهربائية","تقنية تقني سامٍ TS","الزراعة"], skills:["AutoCAD","Python","إدارة مشاريع","SolidWorks"], universities:["AUB — كلية الهندسة","UOB — هندسة","NDU — هندسة","UL — هندسة"], gulfJobs:["مهندس مشاريع","مشرف بناء","تقني صناعي","مهندس طاقة متجددة"], salaryRange:"2500–7000$", workStyle:"عملي ميداني — تفضّل النتائج الملموسة" },
  I: { majors:["طب بشري","صيدلة","علوم حاسوب","رياضيات","فيزياء","إحصاء"], skills:["بحث علمي","Python/R","تحليل بيانات","Machine Learning"], universities:["AUB — الطب وعلوم الحاسوب","USJ — كلية الطب","LAU — Pharmacy","UL — العلوم"], gulfJobs:["طبيب","باحث بيانات","مطور AI","فارماسيست"], salaryRange:"3000–12000$", workStyle:"تحليلي — تحب الغوص في التفاصيل والحلول الدقيقة" },
  A: { majors:["تصميم غرافيكي","هندسة معمارية","إعلام وصحافة","فنون بصرية","موسيقى"], skills:["Adobe Creative Suite","Sketch/Figma","تصوير","كتابة إبداعية"], universities:["ALBA — فنون وعمارة","USEK — موسيقى وفنون","NDU — إعلام","LAU — إعلام"], gulfJobs:["مصمم UX/UI","مدير إبداعي","منتج محتوى","مهندس معماري"], salaryRange:"1800–6000$", workStyle:"إبداعي تعبيري — تزدهر في البيئات المرنة والإلهامية" },
  S: { majors:["تربية وتعليم","عمل اجتماعي","طب نفسي","تمريض","علم نفس"], skills:["تواصل","قيادة فريق","إرشاد","برامج Excel/Office"], universities:["AUB — Sciences of Education","LAU — تمريض","USJ — طب نفسي","UL — تربية"], gulfJobs:["معلم دولي","مستشار HR","ممرض","أخصائي اجتماعي"], salaryRange:"1500–4500$", workStyle:"إنساني تعاوني — تجد معناك في تأثيرك على الآخرين" },
  E: { majors:["إدارة أعمال","قانون","علاقات دولية","تسويق","اقتصاد"], skills:["التفاوض","Pitch Deck","Financial Modeling","Leadership"], universities:["ESA — MBA & Business","AUB — Suliman Olayan Business","LAU — Adnan Kassar","USJ — قانون"], gulfJobs:["مدير تنفيذي","مستشار استراتيجي","محامٍ","رائد أعمال"], salaryRange:"3000–15000$", workStyle:"قيادي طموح — تولّد الطاقة وتحفز من حولك" },
  C: { majors:["محاسبة","مالية ومصرفية","إدارة معلومات","إحصاء","إدارة أعمال"], skills:["Excel/Power BI","QuickBooks","SQL","إدارة بيانات"], universities:["AUB — Olayan Business","ESA — Finance","LAU — Accounting","UL — إدارة أعمال"], gulfJobs:["محاسب قانوني","محلل مالي","مراجع داخلي","مدير ERP"], salaryRange:"2000–6000$", workStyle:"منظّم دقيق — تبني أنظمة ترتاح إليها المؤسسات" },
};

type Scores = Record<string, number>;

export default function CareerDNAPage() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const [authLoading, setAuthLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [scores, setScores] = useState<Scores>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/auth/login");
      else setAuthLoading(false);
    });
  }, [router]);

  function handleAnswer(val: number) {
    const q = QUESTIONS[current];
    setAnswers(prev => ({ ...prev, [q.id]: val }));
    if (current < QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
    } else {
      computeResult({ ...answers, [q.id]: val });
    }
  }

  function computeResult(ans: Record<number, number>) {
    const s: Scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    QUESTIONS.forEach(q => { s[q.type] = (s[q.type] || 0) + (ans[q.id] || 0); });
    setScores(s);
    setPhase("result");
  }

  function restart() {
    setAnswers({});
    setCurrent(0);
    setPhase("intro");
    setScores({});
  }

  function handlePrint() {
    window.print();
  }

  async function saveResult() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      await supabase.auth.updateUser({
        data: {
          careerDNA: {
            primaryType: topType,
            secondaryType: secondType,
            scores,
            completedAt: new Date().toISOString(),
          }
        }
      });
    } catch {}
  }

  const progress = ((current + 1) / QUESTIONS.length) * 100;

  const sortedTypes = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const topType = sortedTypes[0]?.[0] || "I";
  const secondType = sortedTypes[1]?.[0] || "A";
  const topCareer = CAREERS[topType];

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden" dir={dir}>
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none" />

      {/* Header */}
      <header className="relative bg-surface/80 backdrop-blur-xl border-b border-border-soft sticky top-0 z-40 shadow-soft">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">مسارك</span>
          </Link>
          {phase === "quiz" && (
            <span className="text-sm text-text-sub font-semibold">
              {t('dna.q_of')} {current + 1} / {QUESTIONS.length}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* ── INTRO ─────────────────────────────────── */}
        {phase === "intro" && (
          <div className="text-center">
            <div className="text-8xl mb-6 animate-bounce">🧬</div>
            <h1 className="text-3xl font-extrabold text-primary mb-3">{t('dna.intro.title')}</h1>
            <p className="text-text-sub text-lg mb-8 max-w-md mx-auto leading-relaxed">
              {t('dna.intro.subtitle')}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { emoji: "⏱️", label: t('dna.intro.time') },
                { emoji: "🎯", label: t('dna.intro.accurate') },
                { emoji: "💡", label: t('dna.intro.tailored') },
              ].map(i => (
                <div key={i.label} className="card text-center py-4">
                  <div className="text-3xl mb-2">{i.emoji}</div>
                  <div className="text-sm font-semibold text-primary">{i.label}</div>
                </div>
              ))}
            </div>

            <div className={`card ${dir === 'rtl' ? 'text-right' : 'text-left'} mb-6`}>
              <h3 className="font-bold text-primary mb-3">{t('dna.intro.based_on')}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(CAREERS).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-text-sub">
                    <span>{v.emoji}</span>
                    <span><strong>{k}</strong> — {v.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setPhase("quiz")}
              className="btn-primary text-lg px-12 py-4 rounded-2xl">
              {t('dna.intro.start')}
            </button>
          </div>
        )}

        {/* ── QUIZ ──────────────────────────────────── */}
        {phase === "quiz" && (
          <div>
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-text-sub mb-2">
                <span>{t('dna.progress')}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div className="bg-accent rounded-full h-3 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Question Card */}
            <div className="card text-center py-10">
              <div className="text-6xl mb-6">{QUESTIONS[current].emoji}</div>
              <p className="text-xl font-bold text-primary mb-2 leading-relaxed px-4">
                {QUESTIONS[current].text}
              </p>
              <p className="text-text-sub text-sm mb-8">{t('dna.q.prompt')}</p>

              {/* Rating buttons */}
              <div className="flex justify-center gap-3 flex-wrap">
                {[
                  { val: 1, label: t('dna.rate.never'),     color: "border-red-300 hover:bg-red-50 hover:border-red-400" },
                  { val: 2, label: t('dna.rate.rarely'),    color: "border-orange-300 hover:bg-orange-50 hover:border-orange-400" },
                  { val: 3, label: t('dna.rate.sometimes'), color: "border-yellow-300 hover:bg-yellow-50 hover:border-yellow-400" },
                  { val: 4, label: t('dna.rate.often'),     color: "border-blue-300 hover:bg-blue-50 hover:border-blue-400" },
                  { val: 5, label: t('dna.rate.always'),    color: "border-green-400 hover:bg-green-50 hover:border-green-500" },
                ].map(opt => (
                  <button key={opt.val} onClick={() => handleAnswer(opt.val)}
                    className={`border-2 ${opt.color} rounded-2xl px-5 py-4 min-w-[90px] transition-all hover:-translate-y-0.5 hover:shadow-md`}>
                    <div className="text-2xl mb-1">{["😞","😐","🙂","😊","🤩"][opt.val - 1]}</div>
                    <div className="text-sm font-semibold text-text-main">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            {current > 0 && (
              <button onClick={() => setCurrent(c => c - 1)}
                className="mt-4 text-sm text-text-sub hover:text-primary flex items-center gap-1 mx-auto">
                {t('dna.prev')}
              </button>
            )}
          </div>
        )}

        {/* ── RESULT ────────────────────────────────── */}
        {phase === "result" && topCareer && (() => {
          const ext = EXTENDED[topType];
          const ext2 = EXTENDED[secondType];
          return (
          <div id="career-dna-result">
            {/* Hero Result Card */}
            <div className={`bg-gradient-to-br ${topCareer.color} rounded-3xl p-8 text-white text-center mb-6 relative overflow-hidden`}>
              <div className="absolute top-4 left-4 text-6xl opacity-10 font-extrabold">{topType}</div>
              <div className="text-7xl mb-4">{topCareer.emoji}</div>
              <p className="text-white/80 text-sm mb-1">شخصيتك المهنية حسب Holland RIASEC</p>
              <h1 className="text-3xl font-extrabold mb-2">{topCareer.title}</h1>
              <p className="text-white/90 text-base leading-relaxed max-w-md mx-auto">{topCareer.desc}</p>
              <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-white/25 rounded-full px-4 py-1.5 text-sm font-bold">
                  🥇 {topType} — {TYPE_LABELS[topType]}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-4 py-1.5 text-sm font-semibold">
                  🥈 {secondType} — {TYPE_LABELS[secondType]}
                </span>
              </div>
              {ext && (
                <div className="mt-4 bg-white/15 rounded-2xl px-5 py-3 text-sm">
                  <span className="font-bold">أسلوب عملك: </span>{ext.workStyle}
                </div>
              )}
            </div>

            {/* Score Breakdown */}
            <div className="card mb-5">
              <h2 className="font-bold text-primary text-lg mb-4">📊 توزيع درجاتك</h2>
              <div className="space-y-3">
                {sortedTypes.map(([type, score]) => {
                  const c = CAREERS[type];
                  const maxScore = 15;
                  const pct = Math.round((score / maxScore) * 100);
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-text-main">{c.emoji} {c.title}</span>
                        <span className="text-text-sub font-bold">{pct}%</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-3">
                        <div className={`bg-gradient-to-r ${c.color} rounded-full h-3 transition-all duration-700`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Career Recommendations */}
            <div className="card mb-5">
              <h2 className="font-bold text-primary text-lg mb-4">🎯 أفضل المسارات المهنية لك</h2>
              <div className="grid grid-cols-2 gap-2">
                {[...topCareer.careers, ...(CAREERS[secondType]?.careers.slice(0, 3) || [])].slice(0, 8).map(career => (
                  <div key={career}
                    className="border border-gray-200 rounded-xl p-3 hover:border-blue-400 hover:bg-blue-50 transition-all">
                    <div className="text-sm font-semibold text-gray-800">✦ {career}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Majors */}
            {ext && (
              <div className="card mb-5">
                <h2 className="font-bold text-primary text-lg mb-4">📚 التخصصات الجامعية المناسبة</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[...ext.majors, ...(ext2?.majors.slice(0,2)||[])].slice(0,8).map(m => (
                    <span key={m} className="bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold px-3 py-1.5 rounded-full">{m}</span>
                  ))}
                </div>
                <h3 className="font-bold text-gray-700 text-sm mb-2 mt-3">🏛️ أنسب الجامعات:</h3>
                <div className="space-y-1.5">
                  {ext.universities.map(u => (
                    <div key={u} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>{u}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills to develop */}
            {ext && (
              <div className="card mb-5">
                <h2 className="font-bold text-primary text-lg mb-4">🛠️ المهارات التي تحتاج لتطويرها</h2>
                <div className="flex flex-wrap gap-2">
                  {[...ext.skills, ...(ext2?.skills.slice(0,2)||[])].slice(0,8).map(s => (
                    <span key={s} className="bg-orange-50 text-orange-700 border border-orange-200 text-sm font-semibold px-3 py-1.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Gulf Market */}
            {ext && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white mb-5">
                <h2 className="font-extrabold text-lg mb-3">🌍 فرصك في سوق الخليج</h2>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {ext.gulfJobs.slice(0, 4).map(j => (
                    <div key={j} className="bg-white/20 rounded-xl px-3 py-2 text-sm font-semibold">{j}</div>
                  ))}
                </div>
                <div className="bg-white/20 rounded-xl px-4 py-2 text-sm">
                  <span className="font-bold">💰 نطاق الراتب المتوقع: </span>{ext.salaryRange}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <Link href="/scholarships"
                className="card text-center hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-bold text-primary text-sm">ابحث عن منحة</div>
                <div className="text-text-sub text-xs">تناسب مسارك</div>
              </Link>
              <Link href="/universities"
                className="card text-center hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className="text-3xl mb-2">🏛️</div>
                <div className="font-bold text-primary text-sm">الجامعات المناسبة</div>
                <div className="text-text-sub text-xs">مرتبة حسب DNA</div>
              </Link>
              <Link href="/majors"
                className="card text-center hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className="text-3xl mb-2">📖</div>
                <div className="font-bold text-primary text-sm">استكشف التخصصات</div>
                <div className="text-text-sub text-xs">تفاصيل كل تخصص</div>
              </Link>
              <Link href="/internships/hub"
                className="card text-center hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className="text-3xl mb-2">💼</div>
                <div className="font-bold text-primary text-sm">فرص التدريب</div>
                <div className="text-text-sub text-xs">مناسبة لمسارك</div>
              </Link>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button onClick={handlePrint}
                className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-900 transition-colors flex items-center justify-center gap-2">
                🖨️ طباعة / PDF
              </button>
              <button onClick={() => { restart(); saveResult(); }}
                className="flex-1 border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors">
                🔄 إعادة الاختبار
              </button>
              <Link href="/dashboard" className="flex-1 btn-primary py-3 rounded-xl text-center font-bold">
                الداشبورد ←
              </Link>
            </div>

            <style>{`
              @media print {
                header, footer, nav, button, a[href] { display: none !important; }
                #career-dna-result { padding: 20px; }
                body { background: white; }
              }
            `}</style>
          </div>
          );
        })()}
      </main>
    </div>
  );
}
