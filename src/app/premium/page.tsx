import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "مسارك Premium — قريباً",
  description: "ميزات حصرية للطلاب الجادّين عن مستقبلهم. AI أعمق، تقارير شخصية، إرشاد بشري، وأكتر.",
  path: "/premium",
});

const PREMIUM_FEATURES = [
  {
    emoji: "🤖",
    title: "AI Mentor شخصي",
    desc: "مساعد ذكي 24/7 يجاوب على كل سؤالك عن دراستك ومستقبلك. غير محدود.",
    color: "from-violet to-primary",
  },
  {
    emoji: "📊",
    title: "تقارير DNA متعمّقة",
    desc: "تحليل 30 صفحة كامل لشخصيتك المهنية مع توصيات مخصّصة لكل تخصص.",
    color: "from-coral to-accent",
  },
  {
    emoji: "🎓",
    title: "إرشاد بشري 1-on-1",
    desc: "جلستين شهرياً مع مرشد مهني خبير. نقاش عميق عن خياراتك.",
    color: "from-primary to-info",
  },
  {
    emoji: "📄",
    title: "CV Premium Templates",
    desc: "10+ قوالب احترافية، AI Improve متقدم، Cover Letter مخصّص لكل وظيفة.",
    color: "from-success to-mint",
  },
  {
    emoji: "🏆",
    title: "متابعة المنح الذكية",
    desc: "تنبيهات تلقائية بكل منحة تناسب ملفك قبل الموعد بشهرين. حصري.",
    color: "from-warning to-accent",
  },
  {
    emoji: "🎯",
    title: "اختبارات لا محدودة",
    desc: "Quiz غير محدود، أسئلة AI مخصّصة لمستواك، تحدّيات يومية متقدّمة.",
    color: "from-mint to-primary-300",
  },
  {
    emoji: "📚",
    title: "مكتبة محتوى Premium",
    desc: "مقالات، فيديوهات، ودلائل حصرية من خبراء التعليم العالي.",
    color: "from-info to-primary-700",
  },
  {
    emoji: "💎",
    title: "أولوية الدعم",
    desc: "إجابة على استفساراتك خلال ساعتين بدل 24 ساعة.",
    color: "from-primary-700 to-primary-500",
  },
];

export default function PremiumPage() {
  return (
    <main className="min-h-screen bg-bg overflow-x-hidden" dir="rtl">

      {/* HERO */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30" />
          <div className="absolute top-1/3 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-20" />
          <div className="absolute inset-0 bg-pattern-dots opacity-20" style={{ backgroundSize: '32px 32px' }} />
          <div className="absolute top-16 left-16 text-5xl animate-float opacity-40">💎</div>
          <div className="absolute bottom-24 right-20 text-4xl animate-float opacity-40" style={{ animationDelay: '1s' }}>✨</div>
        </div>

        <div className="relative container-page text-center">
          <span className="inline-flex items-center gap-2 bg-gradient-warm text-white px-4 py-1.5 rounded-full text-sm font-bold mb-6 shadow-floaty animate-fade-up">
            <span>💎</span> <span>قريباً — Premium</span>
          </span>
          <div className="text-8xl mb-6 animate-float drop-shadow-2xl">💎</div>
          <h1 className="h1 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            مسارك <span className="text-gradient-warm">Premium</span>
            <br />
            <span className="text-gradient">للطلاب الجادّين</span>
          </h1>
          <p className="lead max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            ميزات حصرية بـ AI متقدّم، إرشاد بشري، وتقارير عميقة —
            <span className="text-primary font-bold"> لمستقبل مهني واضح ومدروس</span>.
          </p>

          {/* Coming soon notice */}
          <div className="inline-block bg-mint-light border border-mint rounded-2xl px-6 py-3 mb-8 shadow-soft animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <strong className="text-primary-dark">🚀 الإطلاق: Q3 2026</strong>
            <p className="text-xs text-ink mt-1">سجّل مجاناً الآن واحجز سعر الإطلاق المخفّض</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <Link href="/auth/register?role=student" className="btn-primary text-lg px-8 py-4">
              <span>سجّل مجاناً + احجز Premium</span>
              <span className="text-xl">←</span>
            </Link>
            <Link href="/contact" className="btn-outline text-lg px-8 py-4">
              💬 لمعرفة المزيد
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section bg-surface relative">
        <div className="absolute top-10 right-0 w-72 h-72 bg-mint rounded-full blur-3xl opacity-15" />
        <div className="absolute bottom-10 left-0 w-72 h-72 bg-accent rounded-full blur-3xl opacity-10" />

        <div className="relative container-page">
          <div className="text-center mb-12">
            <span className="badge-accent mb-3">💎 ميزات Premium</span>
            <h2 className="h2 mb-3">شو رح تحصل عليه؟</h2>
            <p className="lead max-w-xl mx-auto">8 ميزات حصرية للأعضاء المميّزين</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {PREMIUM_FEATURES.map(f => (
              <div key={f.title} className="card group hover:shadow-floaty hover:-translate-y-1 transition-all">
                <div className={`icon-circle-lg bg-gradient-to-br ${f.color} text-white mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                  <span className="text-3xl">{f.emoji}</span>
                </div>
                <h3 className="font-extrabold text-primary mb-1.5">{f.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="section bg-bg-mint relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-mint rounded-full blur-3xl opacity-30" />
        <div className="relative container-narrow">
          <div className="text-center mb-8">
            <span className="badge-mint mb-3">⏳ قريباً</span>
            <h2 className="h2 mb-3">سعر مناسب وميسور</h2>
            <p className="lead">السعر النهائي رح يُحدّد عند الإطلاق — وعدنا يكون بمتناول كل طالب</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="card relative">
              <h3 className="font-bold text-ink-muted mb-2">المجاني</h3>
              <div className="text-3xl font-extrabold text-ink mb-1">مجاني</div>
              <p className="text-sm text-ink-muted mb-4">للأبد</p>
              <ul className="space-y-2 text-sm text-ink">
                <li className="flex items-center gap-2"><span className="text-success">✓</span> دليل الجامعات والمنح</li>
                <li className="flex items-center gap-2"><span className="text-success">✓</span> Career DNA (مرة وحدة)</li>
                <li className="flex items-center gap-2"><span className="text-success">✓</span> CV Builder بسيط</li>
                <li className="flex items-center gap-2"><span className="text-success">✓</span> Quiz يومي محدود</li>
              </ul>
            </div>

            {/* Premium */}
            <div className="card border-2 border-accent relative bg-gradient-to-br from-accent-light/30 to-mint-pale">
              <span className="absolute -top-3 left-4 bg-gradient-warm text-white px-3 py-1 rounded-full text-[10px] font-extrabold shadow-floaty">⭐ الأكثر قيمة</span>
              <h3 className="font-bold text-accent-dark mb-2">Premium</h3>
              <div className="text-3xl font-extrabold text-primary mb-1">قريباً 💎</div>
              <p className="text-sm text-ink-muted mb-4">سجّل اهتمامك ليصلك العرض الخاص بالإطلاق</p>
              <ul className="space-y-2 text-sm text-ink">
                <li className="flex items-center gap-2"><span className="text-success">✓</span> كل ميزات المجاني +</li>
                <li className="flex items-center gap-2"><span className="text-success">✓</span> AI Mentor 24/7</li>
                <li className="flex items-center gap-2"><span className="text-success">✓</span> جلستين إرشاد 1-on-1</li>
                <li className="flex items-center gap-2"><span className="text-success">✓</span> تقارير DNA متعمّقة</li>
                <li className="flex items-center gap-2"><span className="text-success">✓</span> تنبيهات منح ذكية</li>
                <li className="flex items-center gap-2"><span className="text-success">✓</span> أولوية الدعم</li>
              </ul>
              <Link href="/auth/register?role=student" className="btn-primary w-full mt-4">
                سجّل اهتمامك ←
              </Link>
              <p className="text-[10px] text-ink-subtle text-center mt-2">
                🎁 الـ early adopters رح ياخدوا عرض خاص لما نطلق
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-page">
          <div className="bg-gradient-hero text-white rounded-4xl p-10 md:p-14 text-center shadow-floaty relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-mint/30 rounded-full blur-3xl" />

            <div className="relative">
              <div className="text-6xl mb-4 animate-bounce-soft">💎</div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3">جاهز للترقية لـ Premium؟</h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6">
                سجّل مجاناً الآن، وعند الإطلاق رح تكون أول الناس اللي تستفيد بسعر مخفّض
              </p>
              <Link href="/auth/register?role=student" className="inline-flex items-center gap-2 bg-white text-primary font-extrabold px-8 py-4 rounded-2xl text-lg shadow-floaty hover:scale-105 transition-transform">
                <span>ابدأ مجاناً الآن</span><span>←</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
