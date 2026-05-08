import Link from "next/link";
import HomeBanners from "@/app/components/HomeBanners";

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-extrabold text-lg">م</span>
          </div>
          <span className="text-primary font-extrabold text-xl">مسارك</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-text-sub">
          <Link href="/universities" className="hover:text-primary transition-colors">الجامعات</Link>
          <Link href="/schools" className="hover:text-primary transition-colors">المدارس</Link>
          <Link href="/vocational" className="hover:text-primary transition-colors">التعليم المهني</Link>
          <Link href="/majors" className="hover:text-primary transition-colors">التخصصات</Link>
          <Link href="/scholarships" className="hover:text-primary transition-colors">المنح</Link>
          <Link href="/careers" className="hover:text-primary transition-colors">المسارات المهنية</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="hidden md:block text-sm font-semibold text-primary hover:text-accent transition-colors">
            تسجيل الدخول
          </Link>
          <Link href="/auth/register" className="btn-primary text-sm px-4 py-2">
            ابدأ مجاناً
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-primary via-[#1e4080] to-[#0f2448] flex items-center pt-16">
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/20">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
          منصة لبنانية 100% — مجانية للطلاب
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          اكتشف مسارك
          <span className="block text-accent mt-2">بنِ مستقبلك من اليوم</span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          البوابة الأولى للطلاب اللبنانيين: بروفايل احترافي، إرشاد أكاديمي،
          منح دراسية، وفرص حقيقية — كل شيء في مكان واحد، مجاناً للأبد.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/auth/register" className="btn-primary text-lg px-8 py-4 rounded-2xl">
            ابدأ مجاناً — لا يحتاج بطاقة ائتمان
          </Link>
          <Link href="#features" className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
            تعرّف على مسارك ←
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 text-white/70 text-sm">
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {["E8A020","1A7A4A","C0392B","6C3483","0E7C7B"].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-xs font-bold text-white" style={{backgroundColor:`#${c}`}}>
                {["ك","س","ر","ن","م"][i]}
              </div>
            ))}
          </div>
          <span>انضم لـ <strong className="text-accent">+5,000</strong> طالب لبناني</span>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {["آمن 100%", "بيانات محمية", "مجاني للأبد"].map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-white/60 text-sm">
              <span className="text-accent">✓</span> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Role Selector ────────────────────────────────────────────────────────────
function RoleSelector() {
  const roles = [
    { emoji: "🎓", title: "أنا طالب", sub: "في المدرسة أو الجامعة", href: "/auth/register?role=student", color: "border-primary hover:bg-light" },
    { emoji: "👨‍👩‍👧", title: "أنا ولي أمر", sub: "أريد متابعة مسيرة ابني/ابنتي", href: "/auth/register?role=parent", color: "border-[#2E4A7A] hover:bg-light" },
    { emoji: "🏫", title: "أنا مدرسة", sub: "رسمية، خاصة، أو معهد مهني", href: "/auth/register?role=school", color: "border-[#0E7C7B] hover:bg-[#f0fafa]" },
    { emoji: "🏛️", title: "أنا جامعة", sub: "مؤسسة تعليمية عليا", href: "/auth/register?role=university", color: "border-accent hover:bg-light-gold" },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="section-title">من أنت؟</h2>
        <p className="text-text-sub mb-10">اختر دورك لنخصّص تجربتك على مسارك</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roles.map((r) => (
            <Link key={r.title} href={r.href}
              className={`border-2 ${r.color} rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-white`}>
              <div className="text-4xl mb-3">{r.emoji}</div>
              <div className="font-bold text-primary text-lg mb-1">{r.title}</div>
              <div className="text-text-sub text-sm">{r.sub}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      emoji: "📋", title: "بروفايل طلابي احترافي",
      desc: "سيرة ذاتية رقمية شاملة: مدرستك، جامعتك، تطوعك، شهاداتك، تدريبك، وإنجازاتك — كل شيء في مكان واحد قابل للمشاركة.",
      tag: "مجاني", tagColor: "bg-light-green text-success",
    },
    {
      emoji: "🎯", title: "اختبار Career DNA",
      desc: "اكتشف شخصيتك المهنية عبر نظام Holland RIASEC وذكاءات Gardner — 20 سؤالاً تكشف لك أفضل المسارات المناسبة لك.",
      tag: "مجاني", tagColor: "bg-light-green text-success",
    },
    {
      emoji: "🏆", title: "Scholarship Finder",
      desc: "محرك بحث ذكي للمنح الدراسية اللبنانية والدولية — فلترة حسب تخصصك ومعدلك وحاجتك المالية.",
      tag: "مجاني", tagColor: "bg-light-green text-success",
    },
    {
      emoji: "🏛️", title: "دليل الجامعات اللبنانية",
      desc: "معلومات كاملة عن 25+ جامعة لبنانية: التخصصات، الرسوم، شروط القبول، ومقارنة ذكية بينها.",
      tag: "مجاني", tagColor: "bg-light-green text-success",
    },
    {
      emoji: "🗺️", title: "خرائط المسارات المهنية",
      desc: "رسم خرائط تفصيلية لكل مهنة: المهارات المطلوبة، الشهادات، سوق العمل في لبنان، والراتب المتوقع.",
      tag: "Premium", tagColor: "bg-light-gold text-accent",
    },
    {
      emoji: "🔥", title: "Gamification & Leaderboard",
      desc: "XP Points، Badges، Streaks يومية، وترتيب بين طلاب مدرستك — اجعل بناء مستقبلك تجربة ممتعة.",
      tag: "مجاني", tagColor: "bg-light-green text-success",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="section-title">كل ما تحتاجه في مكان واحد</h2>
          <p className="text-text-sub text-lg max-w-xl mx-auto">
            من اكتشاف موهبتك حتى الالتحاق بأفضل الجامعات — مسارك معك في كل خطوة
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card group hover:-translate-y-1 transition-transform duration-200">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{f.emoji}</span>
                <span className={`badge ${f.tagColor} text-xs`}>{f.tag}</span>
              </div>
              <h3 className="font-bold text-primary text-lg mb-2">{f.title}</h3>
              <p className="text-text-sub text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", title: "سجّل مجاناً", desc: "بـ Google أو بريدك الإلكتروني — أقل من 30 ثانية، لا معلومات بطاقة ائتمان." },
    { n: "02", title: "أنشئ ملفك", desc: "أضف مدرستك، شهاداتك، تطوعك، وإنجازاتك — وشاهد ملفك يكتمل خطوة بخطوة." },
    { n: "03", title: "اكتشف فرصك", desc: "منح دراسية، جامعات، وظائف مبكرة — كلها مخصصة لملفك الشخصي تلقائياً." },
  ];

  return (
    <section className="py-20 bg-light">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="section-title">كيف يعمل مسارك؟</h2>
        <p className="text-text-sub mb-14">ثلاث خطوات بسيطة تغيّر مسار حياتك</p>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-gradient-to-l from-accent/30 to-accent/30 -z-0" />
              )}
              <div className="relative z-10 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-accent font-extrabold text-xl">{s.n}</span>
                </div>
                <h3 className="font-bold text-primary text-xl mb-2">{s.title}</h3>
                <p className="text-text-sub text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { n: "5,000+", label: "طالب مسجّل" },
    { n: "120+",   label: "مدرسة شريكة" },
    { n: "25+",    label: "جامعة لبنانية" },
    { n: "200+",   label: "منحة دراسية" },
  ];

  return (
    <section className="py-16 bg-primary">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-extrabold text-accent mb-1">{s.n}</div>
              <div className="text-white/70 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    { name: "كريم ناصر", school: "مدرسة الإيمان — بيروت", text: "بفضل مسارك عرفت إني مناسب لتخصص هندسة الحاسوب، وحصلت على منحة في LAU. كل شي كان واضح ومرتب!", stars: 5 },
    { name: "ريم خوري", school: "ثانوية المقاصد — صيدا", text: "الـ Career DNA Test كشف لي مواهب ما كنت أعرفها. هلأ عم دراسة تصميم جرافيك وأنا محبوبة تماماً.", stars: 5 },
    { name: "أحمد فواز", school: "USEK — جونية", text: "البروفايل ساعدني أحصل على فرصة تدريب في شركة محترمة. الـ CV الرقمي كان أقوى من أي ورقة.", stars: 5 },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="section-title">قصص نجاح حقيقية</h2>
        <p className="text-text-sub mb-12">طلاب لبنانيون بنوا مستقبلهم مع مسارك</p>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card text-right">
              <div className="flex gap-0.5 mb-4">
                {Array.from({length: t.stars}).map((_,i) => (
                  <span key={i} className="text-accent text-lg">★</span>
                ))}
              </div>
              <p className="text-text-sub text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="border-t border-gray-100 pt-4">
                <div className="font-bold text-primary">{t.name}</div>
                <div className="text-text-sub text-xs mt-0.5">{t.school}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-[#0f2448]">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-extrabold text-white mb-4">
          ابدأ رحلتك اليوم
        </h2>
        <p className="text-white/80 text-lg mb-8">
          مجاني للأبد · لا بطاقة ائتمان · انضم لآلاف الطلاب اللبنانيين
        </p>
        <Link href="/auth/register" className="btn-primary text-lg px-10 py-4 rounded-2xl inline-block">
          أنشئ ملفك المجاني الآن →
        </Link>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0f1f3d] text-white/60 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-extrabold">م</span>
              </div>
              <span className="text-white font-extrabold text-lg">مسارك</span>
            </div>
            <p className="text-sm leading-relaxed">البوابة الأولى للطلاب اللبنانيين نحو مستقبل أفضل.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">المنصة</h4>
            <ul className="space-y-2 text-sm">
              {["الجامعات","التخصصات","المنح الدراسية","المسارات المهنية"].map(l => (
                <li key={l}><a href="#" className="hover:text-accent transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">للمؤسسات</h4>
            <ul className="space-y-2 text-sm">
              {["للمدارس","للجامعات","للأهالي","الشراكات"].map(l => (
                <li key={l}><a href="#" className="hover:text-accent transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">تواصل معنا</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:hello@masaraklb.com" className="hover:text-accent transition-colors">hello@masaraklb.com</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <span>© 2026 مسارك. جميع الحقوق محفوظة.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-accent transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-accent transition-colors">شروط الاستخدام</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HomeBanners />
        <RoleSelector />
        <Features />
        <HowItWorks />
        <Stats />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
     }
