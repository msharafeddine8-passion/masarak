'use client';
import Link from 'next/link';
import { useState } from 'react';
import Logo from './Logo';

const MAIN = [
  { href: '/universities', label: 'الجامعات' },
  { href: '/majors', label: 'التخصصات' },
  { href: '/scholarships', label: 'المنح' },
  { href: '/careers', label: 'المسارات المهنية' },
  { href: '/schools', label: 'المدارس' },
  { href: '/vocational', label: 'التعليم المهني' },
];

const TOOLS = [
  { href: '/onboarding', label: 'بدء الرحلة' },
  { href: '/cost-calculator', label: 'حاسبة التكلفة' },
  { href: '/bac-equivalence', label: 'معادلة البكالوريا' },
  { href: '/application-tracker', label: 'متعقّب الطلبات' },
  { href: '/skills-quiz', label: 'اختبار المهارات' },
  { href: '/cover-letter', label: 'خطاب التغطية' },
  { href: '/mock-interview', label: 'محاكاة المقابلة' },
  { href: '/salary-calculator', label: 'حاسبة الراتب' },
  { href: '/career-ai', label: 'مستشار الذكاء' },
];

const MORE = [
  { href: '/about', label: 'عن جمعية تكافل' },
  { href: '/blog', label: 'المدوّنة' },
  { href: '/contact', label: 'اتصل بنا' },
  { href: '/faq', label: 'الأسئلة الشائعة' },
  { href: '/community', label: 'المجتمع' },
  { href: '/changelog', label: 'الأخبار' },
  { href: '/referral', label: 'برنامج الإحالة' },
  { href: '/pricing', label: 'الباقات' },
  { href: '/privacy', label: 'الخصوصية' },
  { href: '/terms', label: 'الشروط' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState<'tools' | 'more' | 'mobile' | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-[#1b3a6b] text-white shadow-md" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center" onClick={() => setOpen(null)}>
          <Logo size={36} variant="white" showSubtitle={true} />
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-sm">
          {MAIN.map(n => (
            <Link key={n.href} href={n.href} className="hover:text-[#5cc4b8] transition">{n.label}</Link>
          ))}
          <div className="relative">
            <button onClick={() => setOpen(open === 'tools' ? null : 'tools')} className="flex items-center gap-1 hover:text-[#5cc4b8]">
              الأدوات <span className="text-xs">▼</span>
            </button>
            {open === 'tools' && (
              <div className="absolute top-full mt-2 right-0 bg-white text-gray-700 rounded-lg shadow-xl py-2 min-w-[200px]">
                {TOOLS.map(t => <Link key={t.href} href={t.href} className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setOpen(null)}>{t.label}</Link>)}
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setOpen(open === 'more' ? null : 'more')} className="flex items-center gap-1 hover:text-[#5cc4b8]">
              المزيد <span className="text-xs">▼</span>
            </button>
            {open === 'more' && (
              <div className="absolute top-full mt-2 right-0 bg-white text-gray-700 rounded-lg shadow-xl py-2 min-w-[200px] max-h-[70vh] overflow-y-auto">
                {MORE.map(t => <Link key={t.href} href={t.href} className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setOpen(null)}>{t.label}</Link>)}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/auth/login" className="text-sm hover:text-[#5cc4b8]">تسجيل الدخول</Link>
          <Link href="/auth/register" className="px-4 py-2 bg-[#5cc4b8] text-[#1b3a6b] font-bold text-sm rounded-lg hover:bg-[#4dafa3] transition">ابدأ الآن</Link>
        </div>

        <button onClick={() => setOpen(open === 'mobile' ? null : 'mobile')} className="lg:hidden text-2xl" aria-label="Menu">☰</button>
      </div>

      {open === 'mobile' && (
        <div className="lg:hidden bg-white text-gray-700 max-h-[80vh] overflow-y-auto">
          {MAIN.map(n => <Link key={n.href} href={n.href} className="block px-4 py-3 border-b" onClick={() => setOpen(null)}>{n.label}</Link>)}
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">الأدوات</div>
          {TOOLS.map(n => <Link key={n.href} href={n.href} className="block px-4 py-2 text-sm border-b" onClick={() => setOpen(null)}>{n.label}</Link>)}
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">المزيد</div>
          {MORE.map(n => <Link key={n.href} href={n.href} className="block px-4 py-2 text-sm border-b" onClick={() => setOpen(null)}>{n.label}</Link>)}
          <div className="p-4 flex gap-2">
            <Link href="/auth/login" className="flex-1 text-center py-2 border rounded-lg" onClick={() => setOpen(null)}>تسجيل الدخول</Link>
            <Link href="/auth/register" className="flex-1 text-center py-2 bg-[#1b3a6b] text-white rounded-lg" onClick={() => setOpen(null)}>ابدأ الآن</Link>
          </div>
        </div>
      )}
    </header>
  );
}
