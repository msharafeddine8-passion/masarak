import Link from 'next/link';
import Logo from '@/components/Logo';

const FEATURES = [
  { href: '/universities',     icon: '🏛️', t: 'الجامعات',           d: 'استعرض الجامعات اللبنانية ورسومها وتخصّصاتها' },
  { href: '/majors',           icon: '📚', t: 'التخصصات',          d: 'اكتشف التخصصات وارتباطها بسوق العمل' },
  { href: '/scholarships',     icon: '🎓', t: 'المنح الدراسية',     d: 'منح متاحة للطلاب اللبنانيين داخل البلد وخارجه' },
  { href: '/careers',          icon: '💼', t: 'المسارات المهنية',   d: 'تعرّف على المسارات المهنية المتاحة' },
  { href: '/schools',          icon: '🏫', t: 'المدارس',           d: 'دليل المدارس الثانوية في لبنان' },
  { href: '/vocational',       icon: '🛠️', t: 'التعليم المهني',    d: 'برامج وشهادات التعليم المهني والتقني' },
  { href: '/onboarding',       icon: '🧭', t: 'بدء الرحلة',         d: 'مرشد تفاعلي يساعدك تحدّد وجهتك' },
  { href: '/cost-calculator',  icon: '💰', t: 'حاسبة التكلفة',      d: 'احسب كلفة الجامعة سنوياً' },
  { href: '/skills-quiz',      icon: '🎯', t: 'اختبار المهارات',    d: 'اكتشف نقاط قوّتك ومجالات تطوّرك' },
  { href: '/cover-letter',     icon: '✉️', t: 'خطاب التغطية',      d: 'مساعد لكتابة خطاب تغطية مهني' },
  { href: '/mock-interview',   icon: '🎤', t: 'محاكاة المقابلة',    d: 'تدرّب على مقابلات العمل والقبول' },
  { href: '/career-ai',        icon: '🤖', t: 'مستشار الذكاء',      d: 'مستشار مهني بالذكاء الاصطناعي' },
];

const AUDIENCES = [
  { icon: '🎓', t: 'للطلاب',     d: 'كل ما تحتاجه لاتخاذ قرار دراستك الجامعية بثقة', href: '/onboarding' },
  { icon: '👨‍👩‍👧', t: 'للأهل',     d: 'مرجع شامل لمتابعة قرارات أبنائكم الأكاديمية',   href: '/parents' },
  { icon: '🏫', t: 'للمدارس',   d: 'أدوات لإرشاد طلابكم في رحلتهم الجامعية',         href: '/schools' },
  { icon: '🏛️', t: 'للجامعات', d: 'منصّة للوصول إلى الطلاب وعرض برامجكم',           href: '/universities' },
];

const WHY = [
  { icon: '✨', t: 'محتوى محلي', d: 'كل البيانات والمعلومات مخصّصة للسياق اللبناني' },
  { icon: '🤝', t: 'مشروع جمعية تكافل', d: 'مبادرة غير ربحية لخدمة الطلاب اللبنانيين' },
  { icon: '🔒', t: 'خصوصية محفوظة', d: 'بياناتك الشخصية مشفّرة ومحميّة' },
  { icon: '🌐', t: 'متاح أونلاين', d: 'استخدم المنصّة من أي مكان وأي جهاز' },
  { icon: '🎯', t: 'إرشاد عملي', d: 'أدوات تساعدك في كل خطوة من رحلتك' },
  { icon: '💚', t: 'بنية على القيم', d: 'نضع المتعلّم وأسرته في مركز كل قرار' },
];

const UPCOMING = [
  { icon: '🎓', t: 'برنامج المنح المخصّصة', d: 'منح من جمعية تكافل لطلاب لبنانيين متفوّقين' },
  { icon: '📊', t: 'لوحة الأداء الأكاديمي', d: 'تتبّع علاماتك ومسارك بشكل مستمر' },
  { icon: '🏆', t: 'نظام الإنجازات', d: 'احصل على شارات تقدير لكل مرحلة تحقّقها' },
];

export default function Home() {
  return (
    <main className="bg-white" dir="rtl">
      <section className="relative bg-gradient-to-br from-[#1b3a6b] via-[#1b3a6b] to-[#0f2240] text-white pt-16 pb-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <Link href="https://takafullb.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm hover:bg-white/15 transition mb-6">
            <span>🤝</span><span>مشروع من جمعية تكافل</span>
          </Link>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">مسارك يبدأ من هنا</h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10">منصّة لبنانية تساعدك تكتشف تخصّصك، تختار جامعتك، تلاقي منح دراسية، وتبني سيرتك الذاتية – كل شي بمكان واحد.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/register" className="px-8 py-3 bg-[#5cc4b8] text-[#1b3a6b] rounded-xl font-bold hover:bg-[#4dafa3] transition">ابدأ الآن</Link>
            <Link href="/career-ai" className="px-8 py-3 border-2 border-white/30 rounded-xl font-bold hover:bg-white/10 transition">جرّب المرشد المهني</Link>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center max-w-3xl mx-auto">
            <Stat icon="⚡" t="متاح 24/7" />
            <Stat icon="🔒" t="خصوصية محفوظة" />
            <Stat icon="🇱🇧" t="مخصّص للبنان" />
            <Stat icon="🤝" t="مشروع غير ربحي" />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1b3a6b] mb-3">كل شي بمكان واحد</h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">أدوات وموارد مصمّمة خصّيصاً للطالب اللبناني</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <Link key={f.href} href={f.href} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition border border-gray-100">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-bold text-[#1b3a6b] mb-1">{f.t}</h3>
                <p className="text-sm text-gray-600">{f.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1b3a6b] mb-12">للجميع في رحلة التعليم</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AUDIENCES.map(a => (
              <Link key={a.t} href={a.href} className="bg-gradient-to-br from-[#1b3a6b]/5 to-[#5cc4b8]/5 p-6 rounded-2xl text-center hover:from-[#1b3a6b]/10 hover:to-[#5cc4b8]/10 transition">
                <div className="text-5xl mb-3">{a.icon}</div>
                <h3 className="font-bold text-[#1b3a6b] mb-2">{a.t}</h3>
                <p className="text-xs text-gray-600">{a.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1b3a6b] mb-12">لماذا مسارك؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY.map(w => (
              <div key={w.t} className="bg-white p-6 rounded-2xl text-center">
                <div className="text-4xl mb-3">{w.icon}</div>
                <h3 className="font-bold text-[#1b3a6b] mb-2">{w.t}</h3>
                <p className="text-sm text-gray-600">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block bg-[#5cc4b8]/15 text-[#1b3a6b] px-3 py-1 rounded-full text-xs font-semibold mb-3">قريباً</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1b3a6b]">ميزات قادمة</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {UPCOMING.map(u => (
              <div key={u.t} className="bg-gradient-to-br from-[#1b3a6b]/5 to-[#5cc4b8]/10 p-6 rounded-2xl border border-[#5cc4b8]/20">
                <div className="text-4xl mb-3">{u.icon}</div>
                <h3 className="font-bold text-[#1b3a6b] mb-2">{u.t}</h3>
                <p className="text-sm text-gray-600">{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-[#1b3a6b] to-[#0f2240] text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6"><Logo size={64} variant="white" showText={false} /></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">جاهز تبلّش رحلتك؟</h2>
          <p className="text-lg text-white/85 mb-8">انضمّ لمنصّة مسارك وابدأ ببناء مستقبلك التعليمي بثقة.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/register" className="px-8 py-3 bg-[#5cc4b8] text-[#1b3a6b] rounded-xl font-bold hover:bg-[#4dafa3] transition">سجّل الآن</Link>
            <Link href="/onboarding" className="px-8 py-3 border-2 border-white/30 rounded-xl font-bold hover:bg-white/10 transition">ابدأ من المرشد</Link>
          </div>
          <p className="mt-8 text-sm text-white/70">مشروع من <a href="https://takafullb.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#5cc4b8]">جمعية تكافل</a></p>
        </div>
      </section>
    </main>
  );
}

function Stat({ icon, t }: { icon: string; t: string }) {
  return (
    <div>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-sm text-white/85">{t}</div>
    </div>
  );
}
import Link from 'next/link';
import Logo from '@/components/Logo';

const FEATURES = [
  { href: '/universities',     icon: '🏛️', t: 'الجامعات',           d: 'استعرض الجامعات اللبنانية ورسومها وتخصّصاتها' },
  { href: '/majors',           icon: '📚', t: 'التخصصات',          d: 'اكتشف التخصصات وارتباطها بسوق العمل' },
  { href: '/scholarships',     icon: '🎓', t: 'المنح الدراسية',     d: 'منح متاحة للطلاب اللبنانيين داخل البلد وخارجه' },
  { href: '/careers',          icon: '💼', t: 'المسارات المهنية',   d: 'تعرّف على المسارات المهنية المتاحة' },
  { href: '/schools',          icon: '🏫', t: 'المدارس',           d: 'دليل المدارس الثانوية في لبنان' },
  { href: '/vocational',       icon: '🛠️', t: 'التعليم المهني',    d: 'برامج وشهادات التعليم المهني والتقني' },
  { href: '/onboarding',       icon: '🧭', t: 'بدء الرحلة',         d: 'مرشد تفاعلي يساعدك تحدّد وجهتك' },
  { href: '/cost-calculator',  icon: '💰', t: 'حاسبة التكلفة',      d: 'احسب كلفة الجامعة سنوياً' },
  { href: '/skills-quiz',      icon: '🎯', t: 'اختبار المهارات',    d: 'اكتشف نقاط قوّتك ومجالات تطوّرك' },
  { href: '/cover-letter',     icon: '✉️', t: 'خطاب التغطية',      d: 'مساعد لكتابة خطاب تغطية مهني' },
  { href: '/mock-interview',   icon: '🎤', t: 'محاكاة المقابلة',    d: 'تدرّب على مقابلات العمل والقبول' },
  { href: '/career-ai',        icon: '🤖', t: 'مستشار الذكاء',      d: 'مستشار مهني بالذكاء الاصطناعي' },
];

const AUDIENCES = [
  { icon: '🎓', t: 'للطلاب',     d: 'كل ما تحتاجه لاتخاذ قرار دراستك الجامعية بثقة', href: '/onboarding' },
  { icon: '👨‍👩‍👧', t: 'للأهل',     d: 'مرجع شامل لمتابعة قرارات أبنائكم الأكاديمية',   href: '/parents' },
  { icon: '🏫', t: 'للمدارس',   d: 'أدوات لإرشاد طلابكم في رحلتهم الجامعية',         href: '/schools' },
  { icon: '🏛️', t: 'للجامعات', d: 'منصّة للوصول إلى الطلاب وعرض برامجكم',           href: '/universities' },
];

const WHY = [
  { icon: '✨', t: 'محتوى محلي', d: 'كل البيانات والمعلومات مخصّصة للسياق اللبناني' },
  { icon: '🤝', t: 'مشروع جمعية تكافل', d: 'مبادرة غير ربحية لخدمة الطلاب اللبنانيين' },
  { icon: '🔒', t: 'خصوصية محفوظة', d: 'بياناتك الشخصية مشفّرة ومحميّة' },
  { icon: '🌐', t: 'متاح أونلاين', d: 'استخدم المنصّة من أي مكان وأي جهاز' },
  { icon: '🎯', t: 'إرشاد عملي', d: 'أدوات تساعدك في كل خطوة من رحلتك' },
  { icon: '💚', t: 'بنية على القيم', d: 'نضع المتعلّم وأسرته في مركز كل قرار' },
];

const UPCOMING = [
  { icon: '🎓', t: 'برنامج المنح المخصّصة', d: 'منح من جمعية تكافل لطلاب لبنانيين متفوّقين' },
  { icon: '📊', t: 'لوحة الأداء الأكاديمي', d: 'تتبّع علاماتك ومسارك بشكل مستمر' },
  { icon: '🏆', t: 'نظام الإنجازات', d: 'احصل على شارات تقدير لكل مرحلة تحقّقها' },
];

export default function Home() {
  return (
    <main className="bg-white" dir="rtl">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1b3a6b] via-[#1b3a6b] to-[#0f2240] text-white pt-16 pb-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <Link href="https://takafullb.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm hover:bg-white/15 transition mb-6">
            <span>🤝</span>
            <span>مشروع من جمعية تكافل</span>
          </Link>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">مسارك يبدأ من هنا</h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10">
            منصّة لبنانية تساعدك تكتشف تخصّصك، تختار جامعتك، تلاقي منح دراسية،
            وتبني سيرتك الذاتية – كل شي بمكان واحد.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/register" className="px-8 py-3 bg-[#5cc4b8] text-[#1b3a6b] rounded-xl font-bold hover:bg-[#4dafa3] transition">ابدأ الآن</Link>
            <Link href="/career-ai" className="px-8 py-3 border-2 border-white/30 rounded-xl font-bold hover:bg-white/10 transition">جرّب المرشد المهني</Link>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center max-w-3xl mx-auto">
            <Stat icon="⚡" t="متاح 24/7" />
            <Stat icon="🔒" t="خصوصية محفوظة" />
            <Stat icon="🇱🇧" t="مخصّص للبنان" />
            <Stat icon="🤝" t="مشروع غير ربحي" />
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1b3a6b] mb-3">كل شي بمكان واحد</h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">أدوات وموارد مصمّمة خصّيصاً للطالب اللبناني</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <Link key={f.href} href={f.href} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition border border-gray-100">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-bold text-[#1b3a6b] mb-1">{f.t}</h3>
                <p className="text-sm text-gray-600">{f.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1b3a6b] mb-12">للجميع في رحلة التعليم</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AUDIENCES.map(a => (
              <Link key={a.t} href={a.href} className="bg-gradient-to-br from-[#1b3a6b]/5 to-[#5cc4b8]/5 p-6 rounded-2xl text-center hover:from-[#1b3a6b]/10 hover:to-[#5cc4b8]/10 transition">
                <div className="text-5xl mb-3">{a.icon}</div>
                <h3 className="font-bold text-[#1b3a6b] mb-2">{a.t}</h3>
                <p className="text-xs text-gray-600">{a.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1b3a6b] mb-12">لماذا مسارك؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY.map(w => (
              <div key={w.t} className="bg-white p-6 rounded-2xl text-center">
                <div className="text-4xl mb-3">{w.icon}</div>
                <h3 className="font-bold text-[#1b3a6b] mb-2">{w.t}</h3>
