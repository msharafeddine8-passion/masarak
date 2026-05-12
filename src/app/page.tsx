import Link from 'next/link';

const FEATURES = [
  { href: '/universities',          icon: '🏛️', t: 'الجامعات',           d: 'دليل شامل لـ 35 جامعة معتمدة بالترتيب الرسمي', color: 'from-primary-100 to-mint-light' },
  { href: '/majors',                icon: '📚', t: 'التخصصات',           d: 'اكتشف التخصصات وارتباطها بسوق العمل',           color: 'from-accent-light to-coral/20' },
  { href: '/scholarships',          icon: '🎓', t: 'المنح الدراسية',     d: 'منح داخل لبنان وحول العالم',                    color: 'from-violet/30 to-primary-100' },
  { href: '/careers',               icon: '💼', t: 'المسارات المهنية',   d: 'تعرّف على مهن المستقبل ومتطلباتها',             color: 'from-info-light to-mint-light' },
  { href: '/schools',               icon: '🏫', t: 'المدارس',             d: 'دليل المدارس الثانوية في لبنان',                 color: 'from-success-light to-mint-light' },
  { href: '/vocational',            icon: '🛠️', t: 'التعليم المهني',     d: 'شهادات وبرامج تقنية متخصصة',                    color: 'from-warning-light to-accent-light' },
  { href: '/quiz/today',            icon: '🎯', t: 'اختبار اليوم',        d: 'اختبر معلوماتك يومياً واكسب XP',                color: 'from-primary-200 to-primary-100' },
  { href: '/career-dna',            icon: '🧬', t: 'Career DNA',           d: 'اكتشف شخصيتك المهنية والمسار المناسب',          color: 'from-coral/20 to-violet/20' },
  { href: '/tools/cv-builder',      icon: '📄', t: 'السيرة الذاتية',      d: 'صمم CV احترافي بـ AI Improve',                  color: 'from-mint-light to-primary-100' },
];

const AUDIENCES = [
  { icon: '🎓', t: 'للطلاب',     d: 'كل ما تحتاجه لاتخاذ قرار دراستك بثقة',          href: '/for-students',    badge: 'الأكثر استخداماً' },
  { icon: '👪', t: 'للأهل',      d: 'تابع قرارات أبنائك الأكاديمية',                  href: '/for-parents' },
  { icon: '🏫', t: 'للمدارس',    d: 'أدوات لإرشاد طلابكم في رحلتهم الجامعية',         href: '/for-schools' },
  { icon: '🏛️', t: 'للجامعات',   d: 'اربط نفسك بأفضل المرشّحين',                       href: '/for-universities', badge: 'B2B' },
];

const STATS = [
  { value: '35',   label: 'جامعة معتمدة',       icon: '🏛️' },
  { value: '200+', label: 'تخصص جامعي',         icon: '📚' },
  { value: '150+', label: 'منحة دراسية',         icon: '🎓' },
  { value: '12',   label: 'أداة تعليمية',        icon: '🛠️' },
];

const WHY = [
  { icon: '✨', t: 'محتوى مدقَّق',     d: 'بيانات محدّثة شهرياً من مصادر رسمية',          gradient: 'from-mint to-primary-300' },
  { icon: '🚀', t: 'تكنولوجيا متقدمة',  d: 'AI ذكي يقترح ما يناسبك بناءً على ملفك',     gradient: 'from-accent to-coral' },
  { icon: '🤝', t: 'مبادرة مجتمعية',    d: 'لخدمة الطلاب العرب — مجاناً وبدون إعلانات',  gradient: 'from-violet to-primary-400' },
  { icon: '🔒', t: 'خصوصية كاملة',      d: 'بياناتك محفوظة ومشفّرة على Supabase',         gradient: 'from-info to-primary-500' },
  { icon: '🎯', t: 'إرشاد عملي',        d: 'مش بس معلومات — أدوات بتوصلك للهدف',         gradient: 'from-success to-mint' },
  { icon: '💚', t: 'بُني على القيم',     d: 'نضع المتعلم وأسرته في مركز كل قرار',          gradient: 'from-primary-700 to-primary-500' },
];

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-bg" dir="rtl">

      {/* ════ HERO — Premium + Playful ════════════════════════════════════ */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        {/* Decorative blobs */}
        <div className="blob bg-mint top-10 -right-20 w-72 h-72 md:w-96 md:h-96 animate-float" />
        <div className="blob bg-accent top-40 -left-20 w-60 h-60 md:w-80 md:h-80 opacity-20 animate-float" style={{ animationDelay: '1s' }} />
        <div className="blob bg-primary-200 bottom-0 right-1/4 w-48 h-48 opacity-25" />

        <div className="relative container-page text-center">
          {/* Floating badge above title */}
          <div className="inline-flex items-center gap-2 bg-mint-light text-primary-dark px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-fade-up shadow-soft">
            <span className="text-base">🚀</span>
            <span>منصة الطلاب رقم 1 في لبنان</span>
          </div>

          <h1 className="h1 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            مسارك يبدأ
            <br />
            <span className="text-gradient">من هنا</span>
            <span className="inline-block animate-wiggle text-accent">.</span>
          </h1>

          <p className="lead max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            اكتشف تخصّصك، اختر جامعتك، احصل على منحة، وابنِ سيرتك الذاتية —
            <span className="text-primary font-bold"> كل شي بمكان واحد، مجاناً تماماً</span>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/auth/register" className="btn-primary text-lg px-8 py-4">
              <span>ابدأ مجاناً</span>
              <span className="text-xl">←</span>
            </Link>
            <Link href="/career-dna" className="btn-mint text-lg px-8 py-4">
              <span>🧬</span>
              <span>جرّب Career DNA</span>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-3xl mx-auto animate-fade-up stagger" style={{ animationDelay: '0.4s' }}>
            {STATS.map(s => (
              <div key={s.label} className="card-glass text-center px-4 py-5">
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-3xl md:text-4xl font-extrabold text-primary leading-none">{s.value}</div>
                <div className="text-xs md:text-sm text-ink-muted mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FEATURES GRID ═════════════════════════════════════════════════ */}
      <section className="section bg-surface relative">
        <div className="container-page">
          <div className="text-center mb-12">
            <span className="badge-accent mb-3">✨ كل شي بمتناول يدك</span>
            <h2 className="h2 mb-3">الأدوات اللي بتحتاجها</h2>
            <p className="lead max-w-xl mx-auto">
              من اختيار التخصص لبناء السيرة الذاتية — مسارك معك بكل خطوة
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {FEATURES.map(f => (
              <Link
                key={f.href}
                href={f.href}
                className="group relative bg-surface rounded-3xl border border-border-soft p-6 hover:shadow-floaty hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient backdrop */}
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0`} />
                <div className="relative z-10">
                  <div className="icon-circle-lg bg-gradient-mint mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">{f.icon}</span>
                  </div>
                  <h3 className="h4 mb-1.5 group-hover:text-primary transition-colors">{f.t}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{f.d}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                    <span>افتح</span><span>←</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════ AUDIENCES ═════════════════════════════════════════════════════ */}
      <section className="section bg-bg-mint relative overflow-hidden">
        <div className="blob bg-mint top-10 -left-20 w-72 h-72 opacity-30" />

        <div className="relative container-page">
          <div className="text-center mb-12">
            <span className="badge-mint mb-3">👥 لجميع الفئات</span>
            <h2 className="h2 mb-3">مَن يستفيد من مسارك؟</h2>
            <p className="lead max-w-xl mx-auto">
              موارد مخصّصة لكل فئة في رحلة التعليم
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {AUDIENCES.map(a => (
              <Link
                key={a.href}
                href={a.href}
                className="card-hoverable relative overflow-hidden group bg-surface"
              >
                {a.badge && (
                  <span className="absolute top-3 left-3 badge-accent text-[10px]">{a.badge}</span>
                )}
                <div className="text-5xl mb-3 group-hover:animate-bounce-soft">{a.icon}</div>
                <h3 className="h4 mb-1.5 text-primary">{a.t}</h3>
                <p className="text-sm text-ink-muted leading-relaxed mb-3">{a.d}</p>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                  اكتشف <span className="group-hover:-translate-x-1 transition-transform">←</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════ WHY MASARAK ═══════════════════════════════════════════════════ */}
      <section className="section bg-surface">
        <div className="container-page">
          <div className="text-center mb-12">
            <span className="badge-primary mb-3">💎 لماذا مسارك</span>
            <h2 className="h2 mb-3">منصة مبنية بحرفية</h2>
            <p className="lead max-w-xl mx-auto">
              قيم وأسس بنيت عليها المنصة لخدمتك
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {WHY.map(w => (
              <div key={w.t} className="card group hover:shadow-floaty transition-all">
                <div className={`icon-circle-lg bg-gradient-to-br ${w.gradient} text-white mb-4 group-hover:rotate-6 transition-transform`}>
                  <span>{w.icon}</span>
                </div>
                <h3 className="h4 mb-2">{w.t}</h3>
                <p className="text-ink-muted leading-relaxed">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ QUOTE / SOCIAL PROOF ══════════════════════════════════════════ */}
      <section className="section bg-bg">
        <div className="container-narrow text-center">
          <div className="text-6xl mb-6 opacity-30">"</div>
          <p className="text-2xl md:text-3xl font-bold text-ink leading-relaxed mb-6">
            "مسارك ساعدني أختار جامعتي بثقة، واليوم بدرس الطب بـ AUB.
            <br />
            <span className="text-gradient">منصة كل طالب لازم يستخدمها.</span>"
          </p>
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-mint flex items-center justify-center text-xl font-extrabold text-primary">س</div>
            <div className="text-right">
              <div className="font-bold text-ink">سارة ك.</div>
              <div className="text-sm text-ink-muted">طالبة طب — السنة الثانية</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ CTA — Premium Gradient ════════════════════════════════════════ */}
      <section className="section relative overflow-hidden">
        <div className="container-page">
          <div className="relative bg-gradient-hero text-white rounded-4xl p-10 md:p-16 text-center shadow-floaty overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute inset-0 bg-pattern-dots opacity-20" style={{ backgroundSize: '20px 20px' }} />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-mint/20 rounded-full blur-3xl" />

            <div className="relative">
              <div className="text-6xl mb-4 animate-bounce-soft">🚀</div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">جاهز تبدأ رحلتك؟</h2>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
                سجّل مجاناً خلال 30 ثانية وابدأ بالاستفادة من كل أدوات مسارك
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 bg-white text-primary font-extrabold px-8 py-4 rounded-2xl text-lg shadow-floaty hover:scale-105 transition-transform"
                >
                  <span>ابدأ مجاناً</span><span>←</span>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-colors"
                >
                  تعرّف علينا أكثر
                </Link>
              </div>
              <p className="text-sm text-white/70 mt-6">
                🎁 لا بطاقة ائتمان · لا اشتراك · مجاني تماماً
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
