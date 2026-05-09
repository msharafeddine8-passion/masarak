// المسار في المشروع: src/components/SiteFooter.tsx
// Footer موحّد بهوية جمعية تكافل + لون كحلي
// =====================================================

import Link from 'next/link';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1b3a6b] text-white mt-16">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* الشبكة الرئيسية */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* العمود الأول: عن مسارك */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center text-xl font-bold">
                م
              </div>
              <div>
                <div className="text-lg font-bold">مسارك</div>
                <div className="text-xs opacity-80">جمعية تكافل</div>
              </div>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              منصّة لبنانية مجانية تساعد الطلاب على اكتشاف تخصصهم، اختيار جامعتهم،
              والوصول إلى المنح الدراسية.
            </p>
          </div>

          {/* العمود الثاني: استكشف */}
          <div>
            <h3 className="font-bold mb-4 text-base">استكشف</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li><Link href="/universities" className="hover:opacity-100 hover:underline">الجامعات</Link></li>
              <li><Link href="/majors" className="hover:opacity-100 hover:underline">التخصصات</Link></li>
              <li><Link href="/scholarships" className="hover:opacity-100 hover:underline">المنح الدراسية</Link></li>
              <li><Link href="/careers" className="hover:opacity-100 hover:underline">المسارات المهنية</Link></li>
              <li><Link href="/schools" className="hover:opacity-100 hover:underline">المدارس</Link></li>
              <li><Link href="/vocational" className="hover:opacity-100 hover:underline">التعليم المهني</Link></li>
            </ul>
          </div>

          {/* العمود الثالث: أدوات */}
          <div>
            <h3 className="font-bold mb-4 text-base">أدوات</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li><Link href="/tools/career-ai" className="hover:opacity-100 hover:underline">المرشد المهني الذكي</Link></li>
              <li><Link href="/tools/cv-builder" className="hover:opacity-100 hover:underline">بناء السيرة الذاتية</Link></li>
              <li><Link href="/tools/cost-calculator" className="hover:opacity-100 hover:underline">حاسبة كلفة الدراسة</Link></li>
              <li><Link href="/tools/skill-strengths" className="hover:opacity-100 hover:underline">اختبار نقاط القوة</Link></li>
              <li><Link href="/tools/bac-equivalence" className="hover:opacity-100 hover:underline">معادلة البكالوريا</Link></li>
              <li><Link href="/blog" className="hover:opacity-100 hover:underline">المدوّنة</Link></li>
            </ul>
          </div>

          {/* العمود الرابع: عن الجمعية */}
          <div>
            <h3 className="font-bold mb-4 text-base">جمعية تكافل</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li><Link href="/about" className="hover:opacity-100 hover:underline">عن الجمعية</Link></li>
              <li><Link href="/contact" className="hover:opacity-100 hover:underline">تواصل معنا</Link></li>
              <li><Link href="/faq" className="hover:opacity-100 hover:underline">الأسئلة الشائعة</Link></li>
              <li><Link href="/privacy" className="hover:opacity-100 hover:underline">سياسة الخصوصية</Link></li>
              <li><Link href="/terms" className="hover:opacity-100 hover:underline">الشروط والأحكام</Link></li>
            </ul>
          </div>
        </div>

        {/* الفاصل */}
        <div className="border-t border-white/15 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-90">
          <div>
            © {currentYear} <span className="font-semibold">جمعية تكافل</span> — جميع الحقوق محفوظة
          </div>
          <div className="text-xs">
            مشروع غير ربحي يهدف إلى دعم وتمكين الطلاب اللبنانيين
          </div>
        </div>
      </div>
    </footer>
  );
}
