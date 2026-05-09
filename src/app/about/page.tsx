// المسار في المشروع: src/app/about/page.tsx
// عن جمعية تكافل ومنصّة مسارك
// =====================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'عن جمعية تكافل ومنصّة مسارك',
  description:
    'منصّة مسارك هي مشروع من جمعية تكافل اللبنانية غير الربحية، تهدف إلى دعم الطلاب اللبنانيين وتمكينهم تعليمياً ومهنياً عبر منصّة رقمية شاملة ومجانية.',
  path: '/about',
  keywords: ['جمعية تكافل', 'مسارك', 'منظمة طلابية لبنان', 'دعم طلاب لبنان'],
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1b3a6b] via-[#2d5391] to-[#1b3a6b] text-white py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 text-sm font-semibold border border-white/20">
            🤝 منظمة غير ربحية
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            جمعية تكافل
          </h1>
          <p className="text-xl md:text-2xl opacity-95 leading-relaxed max-w-3xl mx-auto">
            نؤمن أن كل طالب لبناني يستحق فرصة عادلة لاكتشاف مساره الأكاديمي والمهني،
            بغضّ النظر عن وضعه الاجتماعي أو منطقته الجغرافية.
          </p>
        </div>
      </section>

      {/* رسالتنا */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-10 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-[#1b3a6b]/10 rounded-xl flex items-center justify-center text-3xl mb-4">
                🎯
              </div>
              <h2 className="text-2xl font-bold mb-3 text-[#1b3a6b]">رسالتنا</h2>
              <p className="text-slate-700 leading-relaxed">
                تمكين الطلاب اللبنانيين من اتّخاذ قرارات تعليمية ومهنية مدروسة عبر
                توفير معلومات موثوقة، أدوات عملية، وإرشاد متاح للجميع — مجاناً.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-[#1b3a6b]/10 rounded-xl flex items-center justify-center text-3xl mb-4">
                🌟
              </div>
              <h2 className="text-2xl font-bold mb-3 text-[#1b3a6b]">رؤيتنا</h2>
              <p className="text-slate-700 leading-relaxed">
                لبنان يحصل فيه كل طالب على المعلومة الصحيحة في الوقت المناسب،
                ويبني مستقبله بثقة وعلى أساس صلب من المعرفة والإرشاد.
              </p>
            </div>
          </div>

          {/* قيمنا */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-[#1b3a6b]">قيمنا الأساسية</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: '💎', title: 'المصداقية', desc: 'كل معلومة موثّقة من مصادر رسمية ومحدّثة بانتظام' },
                { icon: '🤲', title: 'المجانية', desc: 'كل خدماتنا مجانية تماماً — لا اشتراكات ولا رسوم خفية' },
                { icon: '⚖️', title: 'الإنصاف', desc: 'نخدم كل طالب بغضّ النظر عن خلفيته أو منطقته' },
                { icon: '🔒', title: 'الخصوصية', desc: 'بياناتك ملك لك — لا نبيعها ولا نشاركها مع أي طرف' },
                { icon: '🧭', title: 'الحياد', desc: 'لا نروّج لجامعة على حساب أخرى — نقدّم المعلومة كما هي' },
                { icon: '🌱', title: 'التطوّر المستمر', desc: 'نطوّر المنصّة باستمرار بناءً على ملاحظات الطلاب' },
              ].map((v) => (
                <div key={v.title} className="bg-white p-6 rounded-xl border border-slate-100 hover:shadow-md transition">
                  <div className="text-4xl mb-3">{v.icon}</div>
                  <h3 className="font-bold text-lg mb-2 text-[#1b3a6b]">{v.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ما نقدّمه */}
          <div className="bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white p-10 rounded-2xl mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">ماذا تقدّم منصّة مسارك؟</h2>
            <div className="grid md:grid-cols-2 gap-4 text-base">
              {[
                'دليل شامل للجامعات اللبنانية والدولية',
                'قاعدة بيانات للمنح الدراسية المتاحة للبنانيين',
                'تخصصات أكاديمية مع شرح وافٍ لكل واحد',
                'أدوات تفاعلية: حاسبة الكلفة، اختبار نقاط القوة، باني السيرة الذاتية',
                'مرشد مهني ذكي يجاوب على أسئلتك',
                'دليل المدارس الثانوية والمعاهد المهنية',
                'مدوّنة تعليمية ومقالات إرشاديّة',
                'صفحات للأهل والمدارس والجامعات',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-white p-10 rounded-2xl border-2 border-[#1b3a6b]/10">
            <h2 className="text-3xl font-bold mb-4 text-[#1b3a6b]">انضم إلى رحلتنا</h2>
            <p className="text-slate-700 mb-6 max-w-2xl mx-auto leading-relaxed">
              مسارك في تطوّر مستمر. سجّل دخولك وابدأ رحلتك التعليمية والمهنية،
              أو تواصل معنا إذا كنت ترغب بالمساهمة أو الشراكة.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/auth/register"
                className="px-6 py-3 bg-[#1b3a6b] text-white rounded-lg font-semibold hover:bg-[#142d54] transition"
              >
                ابدأ مجاناً
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-white text-[#1b3a6b] border-2 border-[#1b3a6b] rounded-lg font-semibold hover:bg-slate-50 transition"
              >
                تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
