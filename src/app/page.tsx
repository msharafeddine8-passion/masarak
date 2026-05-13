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

const WHY = [
  { icon: '✨', t: 'محتوى مدقَّق',     d: 'بيانات محدّثة شهرياً من مصادر رسمية',          gradient: 'from-mint to-primary-300' },
  { icon: '🚀', t: 'تكنولوجيا متقدمة',  d: 'AI ذكي يقترح ما يناسبك بناءً على ملفك',     gradient: 'from-accent to-coral' },
  { icon: '🤝', t: 'مبادرة مجتمعية',    d: 'لخدمة الطلاب العرب — مجاناً وبدون إعلانات',  gradient: 'from-violet to-primary-400' },
  { icon: '🔒', t: 'خصوصية كاملة',      d: 'بياناتك محفوظة ومشفّرة على Supabase',         gradient: 'from-info to-primary-500' },
  { icon: '🎯', t: 'إرشاد عملي',        d: 'مش بس معلومات — أدوات بتوصلك للهدف',         gradient: 'from-success to-mint' },
  { icon: '💚', t: 'بُني على القيم',     d: 'نضع المتعلم وأسرته في مركز كل قرار',          gradient: 'from-primary-700 to-primary-500' },
];

const PARTNERS = [
  { name: 'AUB', icon: '🏛️' },
  { name: 'LAU', icon: '🎓' },
  { name: 'USJ', icon: '⚜️' },
  { name: 'UL',  icon: '🏫' },
  { name: 'BAU', icon: '🕌' },
  { name: 'USEK',icon: '🎵' },
  { name: 'NDU', icon: '⛰️' },
  { name: 'UOB', icon: '🏔️' },
];

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-bg" dir="rtl">

      {/* ════ HERO — Visual-rich, Salla-inspired ═════════════════════════════ */}
      <section className="relative pt-8 md:pt-16 pb-12 md:pb-24 overflow-hidden bg-gradient-to-b from-mint-pale via-bg to-bg">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-40" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-accent rounded-full blur-3xl opacity-15" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-primary-300 rounded-full blur-3xl opacity-20" />
          {/* Pattern dots */}
          <div className="absolute inset-0 bg-pattern-dots opacity-30" style={{ backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative container-page">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">

            {/* LEFT — TEXT SIDE */}
            <div className="text-center lg:text-right order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-mint-light text-primary-dark px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-fade-up shadow-soft">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span>منصة الطلاب رقم 1 في لبنان</span>
              </div>

              <h1 className="h1 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                مسارك يبدأ
                <br />
                <span className="text-gradient">من هنا.</span>
              </h1>

              <p className="lead max-w-xl mx-auto lg:mx-0 lg:ml-auto mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                اكتشف تخصّصك، اختر جامعتك، احصل على منحة، وابنِ سيرتك الذاتية —
                <span className="text-primary font-bold"> كل شي بمكان واحد، مجاناً تماماً</span>.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <Link href="/auth/register" className="btn-primary text-lg px-7 py-4">
                  <span>ابدأ مجاناً</span>
                  <span className="text-xl">←</span>
                </Link>
                <Link href="/career-dna" className="btn-mint text-lg px-7 py-4">
                  <span>🧬</span>
                  <span>جرّب Career DNA</span>
                </Link>
              </div>

              {/* Trust row */}
              <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-ink-muted animate-fade-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {['👨‍🎓','👩‍🎓','👨‍💼','👩‍🔬'].map((e, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-mint flex items-center justify-center text-base border-2 border-white shadow-soft">
                      {e}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="font-bold text-ink">آلاف الطلاب</div>
                  <div className="text-xs">سجّلوا واستفادوا</div>
                </div>
              </div>
            </div>

            {/* RIGHT — VISUAL SIDE (Floating UI Mockups) */}
            <div className="relative order-1 lg:order-2 h-[420px] md:h-[500px] lg:h-[560px] animate-fade-up" style={{ animationDelay: '0.2s' }}>

              {/* Big circular gradient bg */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 md:w-96 md:h-96 rounded-full bg-gradient-mint-deep opacity-90" />
              </div>

              {/* Big student emoji center */}
              <div className="absolute inset-0 flex items-center justify-center text-[180px] md:text-[220px] animate-float drop-shadow-2xl">
                🎓
              </div>

              {/* Floating Card 1 — "Quiz" top-right */}
              <div className="absolute top-2 md:top-4 right-2 md:right-6 bg-surface rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-warm rounded-xl flex items-center justify-center text-xl">🎯</div>
                  <div>
                    <div className="text-xs text-ink-muted">اختبار اليوم</div>
                    <div className="font-extrabold text-primary text-sm">8/10 صحيحة</div>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 — "Scholarship" left */}
              <div className="absolute top-1/4 left-0 md:left-2 bg-surface rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-cool rounded-xl flex items-center justify-center text-xl">🏆</div>
                  <div>
                    <div className="text-xs text-ink-muted">منحة جديدة</div>
                    <div className="font-extrabold text-primary text-sm">$15K AUB</div>
                  </div>
                </div>
              </div>

              {/* Floating Card 3 — "XP" bottom-right */}
              <div className="absolute bottom-12 right-4 md:right-8 bg-surface rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-fresh rounded-xl flex items-center justify-center text-xl">⭐</div>
                  <div>
                    <div className="text-xs text-ink-muted">XP اليوم</div>
                    <div className="font-extrabold text-primary text-sm">+125 نقطة</div>
                  </div>
                </div>
              </div>

              {/* Floating Card 4 — "DNA" bottom-left */}
              <div className="absolute bottom-2 md:bottom-6 left-4 md:left-8 bg-surface rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-sunset rounded-xl flex items-center justify-center text-xl">🧬</div>
                  <div>
                    <div className="text-xs text-ink-muted">Career DNA</div>
                    <div className="font-extrabold text-primary text-sm">قائد ملهم</div>
                  </div>
                </div>
              </div>

              {/* Decorative emojis floating */}
              <div className="absolute top-1/2 -right-2 text-3xl md:text-4xl animate-bounce-soft" style={{ animationDelay: '0.3s' }}>📚</div>
              <div className="absolute top-10 left-1/4 text-2xl md:text-3xl animate-bounce-soft" style={{ animationDelay: '0.8s' }}>✨</div>
              <div className="absolute bottom-1/3 -left-2 text-3xl md:text-4xl animate-bounce-soft" style={{ animationDelay: '1.2s' }}>💡</div>
              <div className="absolute top-1/3 right-1/4 text-2xl animate-bounce-soft" style={{ animationDelay: '1.7s' }}>🚀</div>
            </div>
          </div>

          {/* Stats Row (below hero) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-10 md:mt-16 animate-fade-up stagger" style={{ animationDelay: '0.5s' }}>
            {[
              { value: '35', label: 'جامعة معتمدة',   icon: '🏛️' },
              { value: '200+', label: 'تخصص جامعي',   icon: '📚' },
              { value: '150+', label: 'منحة دراسية',  icon: '🎓' },
              { value: '12',  label: 'أداة تعليمية', icon: '🛠️' },
            ].map(s => (
              <div key={s.label} className="card-glass text-center px-4 py-5 hover:scale-105 transition-transform">
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-3xl md:text-4xl font-extrabold text-primary leading-none">{s.value}</div>
                <div className="text-xs md:text-sm text-ink-muted mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ PARTNER UNIVERSITIES STRIP ═════════════════════════════════════ */}
      <section className="py-10 bg-surface border-y border-border-soft">
        <div className="container-page">
          <p className="text-center text-sm text-ink-muted mb-6 font-bold">
            🤝 يشمل أبرز الجامعات اللبنانية
          </p>
          <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap">
            {PARTNERS.map(p => (
              <div key={p.name} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-bg-soft hover:bg-mint-light transition-colors">
                <span className="text-2xl">{p.icon}</span>
                <span className="font-extrabold text-primary text-sm">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FEATURES GRID — with decorative elements ══════════════════════ */}
      <section className="section relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-20 right-0 w-72 h-72 bg-mint rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-accent rounded-full blur-3xl opacity-10" />

        <div className="relative container-page">
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
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0`} />
                <div className="relative z-10">
                  <div className="icon-circle-lg bg-gradient-mint mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform">
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

      {/* ════ HOW IT WORKS — 3 steps with illustration ══════════════════════ */}
      <section className="section bg-bg-mint relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-mint rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20" />

        <div className="relative container-page">
          <div className="text-center mb-12">
            <span className="badge-mint mb-3">🎯 كيف يشتغل مسارك</span>
            <h2 className="h2 mb-3">3 خطوات بسيطة</h2>
            <p className="lead max-w-xl mx-auto">
              من التسجيل لاتخاذ قرارك — رحلة بسيطة وممتعة
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger">
            {[
              { n: '1', emoji: '✍️', t: 'سجّل مجاناً',     d: 'أنشئ حسابك خلال 30 ثانية واملأ بياناتك الأكاديمية', color: 'from-mint to-primary-300' },
              { n: '2', emoji: '🧬', t: 'اكتشف نفسك',       d: 'اعمل اختبار Career DNA لمعرفة المسار المناسب لك',  color: 'from-coral to-accent' },
              { n: '3', emoji: '🚀', t: 'اتخذ قرارك',       d: 'قارن الجامعات، اطلب منحة، وابنِ سيرتك الذاتية',     color: 'from-primary to-violet' },
            ].map((step, i) => (
              <div key={step.n} className="relative">
                {/* Step number badge */}
                <div className={`absolute -top-4 right-6 w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} text-white font-extrabold text-xl flex items-center justify-center shadow-floaty`}>
                  {step.n}
                </div>
                <div className="card text-center pt-8 hover:shadow-floaty hover:-translate-y-1 transition-all">
                  <div className="text-6xl mb-4">{step.emoji}</div>
                  <h3 className="h4 mb-2">{step.t}</h3>
                  <p className="text-ink-muted leading-relaxed text-sm">{step.d}</p>
                </div>
                {/* Connector arrow (between steps) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -left-3 text-3xl text-primary opacity-30">←</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ AUDIENCES ═════════════════════════════════════════════════════ */}
      <section className="section bg-surface relative overflow-hidden">
        <div className="absolute top-10 -right-20 w-72 h-72 bg-accent rounded-full blur-3xl opacity-15" />

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

      {/* ════ FEATURE SPOTLIGHT — Career DNA promo ═════════════════════════ */}
      <section className="section bg-bg">
        <div className="container-page">
          <div className="bg-gradient-hero text-white rounded-4xl p-8 md:p-12 lg:p-16 shadow-floaty relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-mint/30 rounded-full blur-3xl" />

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-4">
                  🧬 الميزة الأكثر استخداماً
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                  اكتشف Career DNA الخاص بك
                </h2>
                <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
                  اختبار شامل 10 دقايق بيكشف نوع شخصيتك، نقاط قوّتك،
                  والمسارات المهنية الأنسب لك.
                </p>
                <Link href="/career-dna" className="inline-flex items-center gap-2 bg-white text-primary font-extrabold px-6 py-3 rounded-2xl shadow-floaty hover:scale-105 transition-transform">
                  <span>ابدأ الاختبار الآن</span><span>←</span>
                </Link>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="text-[180px] md:text-[240px] animate-float drop-shadow-2xl">🧬</div>
                {/* Floating result preview */}
                <div className="absolute bottom-0 left-0 bg-white text-ink rounded-2xl p-4 shadow-floaty max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👑</span>
                    <div>
                      <div className="font-extrabold text-primary">القائد الملهم</div>
                      <div className="text-xs text-ink-muted">ENFJ — مطابقة 94%</div>
                    </div>
                  </div>
                  <div className="text-xs text-ink-muted">المسارات المقترحة:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="badge-mint !text-[10px] !px-2">إدارة أعمال</span>
                    <span className="badge-mint !text-[10px] !px-2">تربية</span>
                    <span className="badge-mint !text-[10px] !px-2">إعلام</span>
                  </div>
                </div>
              </div>
            </div>
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
              <div key={w.t} className="card group hover:shadow-floaty hover:-translate-y-1 transition-all">
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

      {/* ════ TESTIMONIAL ═══════════════════════════════════════════════════ */}
      <section className="section bg-bg-mint relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-mint rounded-full blur-3xl opacity-30" />

        <div className="relative container-narrow">
          <div className="text-center mb-8">
            <span className="badge-mint mb-3">💬 آراء الطلاب</span>
            <h2 className="h2 mb-3">سمعنا من اللي جرّبنا</h2>
          </div>

          <div className="bg-surface rounded-4xl p-8 md:p-12 shadow-floaty relative">
            <div className="text-7xl text-primary/15 absolute top-4 right-6 leading-none">"</div>
            <p className="text-xl md:text-2xl font-bold text-ink leading-relaxed mb-6 relative">
              مسارك ساعدني أختار جامعتي بثقة، واليوم بدرس الطب بـ AUB.
              <br />
              <span className="text-gradient">منصة كل طالب لازم يستخدمها.</span>
            </p>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-mint flex items-center justify-center text-2xl font-extrabold text-primary border-4 border-white shadow-soft">س</div>
              <div>
                <div className="font-bold text-ink text-lg">سارة ك.</div>
                <div className="text-sm text-ink-muted">طالبة طب — السنة الثانية · AUB</div>
              </div>
              <div className="mr-auto text-2xl">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ CTA — Premium Gradient ════════════════════════════════════════ */}
      <section className="section relative overflow-hidden">
        <div className="container-page">
          <div className="relative bg-gradient-hero text-white rounded-4xl p-10 md:p-16 text-center shadow-floaty overflow-hidden">
            <div className="absolute inset-0 bg-pattern-dots opacity-20" style={{ backgroundSize: '20px 20px' }} />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-mint/30 rounded-full blur-3xl" />

            {/* Floating emojis */}
            <div className="absolute top-8 right-1/4 text-3xl animate-float">🎓</div>
            <div className="absolute top-12 left-1/4 text-3xl animate-float" style={{ animationDelay: '1s' }}>✨</div>
            <div className="absolute bottom-12 right-1/3 text-3xl animate-float" style={{ animationDelay: '1.5s' }}>📚</div>
            <div className="absolute bottom-10 left-1/3 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>💡</div>

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
                  className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-colors backdrop-blur"
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
