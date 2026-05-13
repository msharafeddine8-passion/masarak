// src/app/for-students/page.tsx
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "للطلاب — مسارك يساعدك تختار وتنجح",
  description:
    "كل ما يحتاجه الطالب: اختيار التخصص، المنح، التدريب، CV احترافي. بالعربية وبسهولة.",
  path: "/for-students",
  keywords: ["مسارك للطلاب", "أدوات الطلاب", "مساعدة الطلاب", "إرشاد جامعي"],
});

const FEATURES = [
  { emoji: "🧬", title: "اكتشف شخصيتك المهنية", desc: "اختبار Career DNA يكشف نقاط قوّتك ويقترح المسار المناسب", href: "/career-dna", color: "from-coral to-accent" },
  { emoji: "🎓", title: "اختر تخصصك بثقة", desc: "20+ تخصص مع رواتب ومهارات وخارطة طريق", href: "/majors", color: "from-mint to-primary-300" },
  { emoji: "🏛️", title: "قارن الجامعات", desc: "35 جامعة لبنانية مع رسوم وقبول وتوظيف", href: "/universities", color: "from-primary-300 to-info" },
  { emoji: "🏆", title: "احصل على منحة", desc: "منح لبنانية ودولية حسب معدّلك ومجالك", href: "/scholarships", color: "from-warning to-accent" },
  { emoji: "💼", title: "ابدأ التدريب الصيفي", desc: "فرص تدريب حقيقية بأفضل الشركات", href: "/internships/hub", color: "from-success to-mint" },
  { emoji: "📋", title: "اصنع CV احترافي", desc: "4 قوالب جاهزة + AI Improve + Export PDF", href: "/tools/cv-builder", color: "from-violet to-primary" },
  { emoji: "🤖", title: "مستشار مهني ذكي", desc: "اسأل أي سؤال عن مستقبلك المهني", href: "/tools/career-ai", color: "from-info to-primary" },
  { emoji: "🎤", title: "تدرّب على المقابلات", desc: "بنك أسئلة بـ 4 فئات + توقيت + نصائح", href: "/tools/interview-prep", color: "from-mint-light to-mint" },
];

const TESTIMONIALS = [
  { name: "سارة ك.", avatar: "س", role: "طالبة طب — AUB", quote: "مسارك ساعدني أختار جامعتي بثقة. اليوم بدرس الطب بـ AUB!", emoji: "🩺" },
  { name: "أحمد م.", avatar: "أ", role: "هندسة ميكاترونيك — LGU", quote: "Career DNA كشفلي إني مهندس بطبعي. اليوم بأقوى برنامج هندسة!", emoji: "⚙️" },
  { name: "ليلى ن.", avatar: "ل", role: "تصميم — ALBA", quote: "بناء CV هون أحسن من أي قالب جاهز. كل interview بيعجبهم!", emoji: "🎨" },
];

export default function ForStudentsPage() {
  return (
    <main className="bg-bg overflow-x-hidden" dir="rtl">

      {/* HERO — 2-column */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-40" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-accent rounded-full blur-3xl opacity-15" />
          <div className="absolute inset-0 bg-pattern-dots opacity-20" style={{ backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative container-page">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            <div className="text-center lg:text-right order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 bg-mint-light text-primary-dark px-4 py-1.5 rounded-full text-sm font-bold mb-5 shadow-soft animate-fade-up">
                <span>🎓</span> <span>منصة الطلاب</span>
              </span>
              <h1 className="h1 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                من المتوسطة لسوق العمل
                <br />
                <span className="text-gradient">معك بكل خطوة</span>
              </h1>
              <p className="lead max-w-xl mx-auto lg:mx-0 lg:ml-auto mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                مهما كنت بأي مرحلة، مسارك يعطيك
                <span className="text-primary font-bold"> الأدوات والمعلومات</span> لتأخذ قراراتك بثقة.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <Link href="/auth/register?role=student" className="btn-primary text-lg px-8 py-4">
                  ابدأ مجاناً ←
                </Link>
                <Link href="/quiz/today" className="btn-mint text-lg px-8 py-4">
                  🎯 اختبار اليوم
                </Link>
              </div>
            </div>

            <div className="relative h-80 md:h-[450px] order-1 lg:order-2 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-72 md:w-80 md:h-80 rounded-full bg-gradient-mint-deep opacity-90" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-[180px] md:text-[200px] animate-float drop-shadow-2xl">
                🎓
              </div>
              <div className="absolute top-4 right-4 bg-surface rounded-2xl shadow-floaty p-3 border border-border-soft animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-warm rounded-xl flex items-center justify-center text-xl">🏆</div>
                  <div>
                    <div className="text-xs text-ink-muted">مستوى</div>
                    <div className="font-extrabold text-primary text-sm">L5 ✨</div>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/3 left-2 bg-surface rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-fresh rounded-xl flex items-center justify-center text-xl">📚</div>
                  <div>
                    <div className="text-xs text-ink-muted">مادة</div>
                    <div className="font-extrabold text-primary text-sm">رياضيات</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-8 bg-surface rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '1.2s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-cool rounded-xl flex items-center justify-center text-xl">🔥</div>
                  <div>
                    <div className="text-xs text-ink-muted">سلسلة</div>
                    <div className="font-extrabold text-primary text-sm">12 يوم</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="section bg-surface relative overflow-hidden">
        <div className="absolute top-20 right-0 w-72 h-72 bg-mint rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-accent rounded-full blur-3xl opacity-10" />

        <div className="relative container-page">
          <div className="text-center mb-12">
            <span className="badge-accent mb-3">✨ كل الأدوات بمكان واحد</span>
            <h2 className="h2 mb-3">8 ميزات تساعدك تنجح</h2>
            <p className="lead max-w-xl mx-auto">
              من اختيار التخصص لبناء السيرة الذاتية
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {FEATURES.map((f) => (
              <Link key={f.href} href={f.href}
                className="group relative bg-surface rounded-3xl border border-border-soft p-5 hover:shadow-floaty hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 transition-opacity -z-0`} />
                <div className="relative">
                  <div className={`icon-circle-lg bg-gradient-to-br ${f.color} text-white mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                    <span className="text-3xl">{f.emoji}</span>
                  </div>
                  <h3 className="font-extrabold text-primary mb-1.5 group-hover:underline">{f.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section bg-bg-mint relative overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30" />

        <div className="relative container-page">
          <div className="text-center mb-12">
            <span className="badge-mint mb-3">💬 شهادات الطلاب</span>
            <h2 className="h2 mb-3">سمعنا من اللي جرّبنا</h2>
            <p className="lead max-w-xl mx-auto">
              قصص نجاح حقيقية من طلاب لبنانيين
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 stagger">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card hover:shadow-floaty hover:-translate-y-1 transition-all relative">
                <div className="text-5xl absolute top-4 left-4 opacity-15">"</div>
                <div className="text-4xl mb-3">{t.emoji}</div>
                <p className="text-ink leading-relaxed mb-5 font-medium">{t.quote}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border-soft">
                  <div className="w-12 h-12 rounded-full bg-gradient-mint-deep text-white flex items-center justify-center font-extrabold">{t.avatar}</div>
                  <div>
                    <div className="font-bold text-ink">{t.name}</div>
                    <div className="text-xs text-ink-muted">{t.role}</div>
                  </div>
                  <div className="mr-auto text-warning text-sm">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section relative overflow-hidden">
        <div className="container-page">
          <div className="bg-gradient-hero text-white rounded-4xl p-10 md:p-16 text-center shadow-floaty relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-mint/30 rounded-full blur-3xl" />

            <div className="absolute top-8 right-1/4 text-3xl animate-float">📚</div>
            <div className="absolute bottom-12 left-1/4 text-3xl animate-float" style={{ animationDelay: '1s' }}>✨</div>

            <div className="relative">
              <div className="text-6xl mb-4 animate-bounce-soft">🚀</div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-3">جاهز تبدأ مسارك؟</h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
                انضم لآلاف الطلاب اللي بنوا مستقبلهم مع مسارك
              </p>
              <Link href="/auth/register?role=student"
                className="inline-flex items-center gap-2 bg-white text-primary font-extrabold px-8 py-4 rounded-2xl text-lg shadow-floaty hover:scale-105 transition-transform">
                سجّل مجاناً (30 ثانية) ←
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
