import Link from 'next/link';
import Logo from '@/components/Logo';

const FEATURES = [
  { href: '/universities', icon: '🏛️', t: 'الجامعات', d: 'استعرض الجامعات ورسومها وتخصّصاتها' },
    { href: '/majors', icon: '📚', t: 'التخصصات', d: 'اكتشف التخصصات وارتباطها بسوق العمل' },
      { href: '/scholarships', icon: '🎓', t: 'المنح الدراسية', d: 'منح متاحة للطلاب داخل البلد وخارجه' },
        { href: '/careers', icon: '💼', t: 'المسارات المهنية', d: 'تعرّف على المسارات المهنية المتاحة' },
          { href: '/schools', icon: '🏫', t: 'المدارس', d: 'دليل المدارس الثانوية' },
            { href: '/vocational', icon: '🛠️', t: 'التعليم المهني', d: 'برامج وشهادات التعليم المهني والتقني' },
              { href: '/onboarding', icon: '🧭', t: 'بدء الرحلة', d: 'مرشد تفاعلي يساعدك تحدّد وجهتك' },
                { href: '/cost-calculator', icon: '💰', t: 'حاسبة التكلفة', d: 'احسب كلفة الجامعة سنوياً' },
                  { href: '/skills-quiz', icon: '🎯', t: 'اختبار المهارات', d: 'اكتشف نقاط قوّتك ومجالات تطوّرك' },
                    { href: '/cover-letter', icon: '✉️', t: 'خطاب التغطية', d: 'مساعد لكتابة خطاب تغطية مهني' },
                      { href: '/mock-interview', icon: '🎤', t: 'محاكاة المقابلة', d: 'تدرّب على مقابلات العمل والقبول' },
                        { href: '/career-ai', icon: '🤖', t: 'مستشار الذكاء', d: 'مستشار مهني بالذكاء الاصطناعي' },
                        ];

                        const AUDIENCES = [
                            { icon: '🎓', t: 'للطلاب', d: 'كل ما تحتاجه لاتخاذ قرار دراستك الجامعية بثقة', href: '/onboarding' },
                              { icon: '👪', t: 'للأهل', d: 'مرجع شامل لمتابعة قرارات أبنائكم الأكاديمية', href: '/parents' },
                                { icon: '🏫', t: 'للمدارس', d: 'أدوات لإرشاد طلابكم في رحلتهم الجامعية', href: '/schools' },
                                  { icon: '🏛️', t: 'للجامعات', d: 'منصّة للوصول إلى الطلاب وعرض برامجكم', href: '/universities' },
                                  ];

                                  const WHY = [
                                    { icon: '✨', t: 'محتوى مدروس', d: 'بيانات ومعلومات مدقّقة ومحدّثة باستمرار' },
                                      { icon: '🤝', t: 'مشروع جمعية تكافل', d: 'مبادرة مجتمعية لدعم الطلاب في رحلتهم التعليمية' },
                                        { icon: '🔒', t: 'خصوصية محفوظة', d: 'بياناتك الشخصية مشفّرة ومحميّة' },
                                          { icon: '🌐', t: 'متاح أونلاين', d: 'استخدم المنصّة من أي مكان وأي جهاز' },
                                            { icon: '🎯', t: 'إرشاد عملي', d: 'أدوات تساعدك في كل خطوة من رحلتك' },
                                              { icon: '💚', t: 'بنية على القيم', d: 'نضع المتعلّم وأسرته في مركز كل قرار' },
                                              ];

                                              export default function Home() {
                                                  return (
                                                      <main className="bg-white" dir="rtl">
                                                            <section className="relative bg-gradient-to-br from-[#1b3a6b] via-[#1b3a6b] to-[#0f2240] text-white pt-16 pb-20">
                                                                    <div className="max-w-5xl mx-auto px-4 text-center">
                                                                              <Link href="https://takafullb.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm hover:bg-white/15 transition mb-6">
                                                                                          <span>🤝 مشروع من جمعية تكافل</span>
                                                                                                    </Link>
                                                                                                              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">مسارك يبدأ من هنا</h1>
                                                                                                                        <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10">منصّة تساعدك تكتشف تخصّصك، تختار جامعتك، تلاقي منح دراسية، وتبني سيرتك الذاتية – كل شي بمكان واحد.</p>
                                                                                                                                  <div className="flex flex-wrap items-center justify-center gap-3">
                                                                                                                                              <Link href="/auth/register" className="px-8 py-3 bg-[#5cc4b8] text-[#1b3a6b] rounded-xl font-bold hover:bg-[#4dafa3] transition">ابدأ الآن</Link>
                                                                                                                                                          <Link href="/career-ai" className="px-8 py-3 border-2 border-white/30 rounded-xl font-bold hover:bg-white/10 transition">جرّب المرشد المهني</Link>
                                                                                                                                                                    </div>
                                                                                                                                                                              <div className="mt-12 grid grid-cols-3 gap-6 text-center max-w-2xl mx-auto">
                                                                                                                                                                                          <Stat icon="⚡" label="متاح 24/7" />
                                                                                                                                                                                                      <Stat icon="🔒" label="خصوصية محفوظة" />
                                                                                                                                                                                                                  <Stat icon="🎯" label="إرشاد عملي" />
                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                          </section>

                                                                                                                                                                                                                                                <section className="py-16 bg-gray-50">
                                                                                                                                                                                                                                                        <div className="max-w-7xl mx-auto px-4">
                                                                                                                                                                                                                                                                  <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1b3a6b] mb-3">كل شي بمكان واحد</h2>
                                                                                                                                                                                                                                                                            <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">أدوات وموارد تساعدك في رحلتك التعليمية</p>
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

                                                                                                                                                                                                                                                                                                                                                                                                                  
                                              }
                        ]