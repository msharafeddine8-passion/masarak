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
          <Link href="/login" className="text-sm hover:text-[#5cc4b8]">تسجيل الدخول</Link>
          <Link href="/signup" className="px-4 py-2 bg-[#5cc4b8] text-[#1b3a6b] font-bold text-sm rounded-lg hover:bg-[#4dafa3] transition">ابدأ الآن</Link>
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
            <Link href="/login" className="flex-1 text-center py-2 border rounded-lg" onClick={() => setOpen(null)}>تسجيل الدخول</Link>
            <Link href="/signup" className="flex-1 text-center py-2 bg-[#1b3a6b] text-white rounded-lg" onClick={() => setOpen(null)}>ابدأ الآن</Link>
          </div>
        </div>
      )}
    </header>
  );
}
// المسار في المشروع: src/components/SiteHeader.tsx
// Header موحّد + dropdown "المزيد" للصفحات الإضافية
// =====================================================

'use client';

import Link from 'next/link';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/universities', label: 'الجامعات' },
  { href: '/majors', label: 'التخصصات' },
  { href: '/scholarships', label: 'المنح' },
  { href: '/careers', label: 'المسارات المهنية' },
  { href: '/schools', label: 'المدارس' },
  { href: '/vocational', label: 'التعليم المهني' },
];

const TOOLS_LINKS = [
  { href: '/tools/career-ai', label: 'المرشد المهني الذكي', icon: '🤖' },
  { href: '/tools/cv-builder', label: 'بناء السيرة الذاتية', icon: '📄' },
  { href: '/tools/cost-calculator', label: 'حاسبة كلفة الدراسة', icon: '💰' },
  { href: '/tools/skill-strengths', label: 'اختبار نقاط القوة', icon: '🧠' },
  { href: '/tools/bac-equivalence', label: 'معادلة البكالوريا', icon: '📊' },
  { href: '/tools/application-tracker', label: 'متابعة الطلبات', icon: '📋' },
  { href: '/tools/cover-letter', label: 'رسالة التحفيز', icon: '✉️' },
  { href: '/tools/interview-prep', label: 'تدريب المقابلات', icon: '🎤' },
  { href: '/tools/salary-calculator', label: 'حاسبة الراتب', icon: '💼' },
];

const MORE_LINKS = [
  { href: '/blog', label: 'المدوّنة', icon: '✍️' },
  { href: '/guides', label: 'الإرشادات', icon: '📚' },
  { href: '/internships/hub', label: 'التدريب الصيفي', icon: '🌟' },
  { href: '/jobs', label: 'الوظائف', icon: '💼' },
  { href: '/community', label: 'المجتمع', icon: '👥' },
  { href: '/mentorship', label: 'الإرشاد الفردي', icon: '🤝' },
  { href: '/courses', label: 'الدورات', icon: '🎓' },
  { href: '/pricing', label: 'الأسعار', icon: '💎' },
  { href: '/referral', label: 'برنامج الإحالة', icon: '🎁' },
  { href: '/changelog', label: 'الأخبار', icon: '📰' },
  { href: '/faq', label: 'الأسئلة الشائعة', icon: '❓' },
  { href: '/contact', label: 'تواصل معنا', icon: '📧' },
];

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#1b3a6b] text-white shadow-md">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center text-lg font-bold border border-white/20">
              م
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold leading-none">مسارك</div>
              <div className="text-[10px] opacity-80 leading-none mt-0.5">جمعية تكافل</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition"
              >
                {link.label}
              </Link>
            ))}

            {/* Tools dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <button className="px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition flex items-center gap-1">
                الأدوات
                <span className="text-xs">▼</span>
              </button>
              {toolsOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 min-w-[260px] z-50">
                  {TOOLS_LINKS.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition"
                    >
                      <span className="text-lg">{tool.icon}</span>
                      <span className="font-medium">{tool.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* More dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button className="px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition flex items-center gap-1">
                المزيد
                <span className="text-xs">▼</span>
              </button>
              {moreOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 min-w-[260px] z-50">
                  {MORE_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition"
            >
              عن الجمعية
            </Link>
          </nav>

          {/* Auth buttons (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-white/10 transition"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm font-bold rounded-lg bg-white text-[#1b3a6b] hover:bg-slate-100 transition"
            >
              ابدأ مجاناً
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-white/10 transition"
            aria-label="القائمة"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden py-3 border-t border-white/15 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-1 mb-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium rounded-md hover:bg-white/10 transition text-center"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-3 border-t border-white/15">
              <div className="text-xs opacity-70 px-3 mb-2 font-semibold">الأدوات:</div>
              <div className="grid grid-cols-2 gap-1">
                {TOOLS_LINKS.slice(0, 6).map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 text-xs font-medium rounded-md hover:bg-white/10 transition flex items-center gap-2"
                  >
                    <span>{tool.icon}</span>
                    <span>{tool.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-white/15">
              <div className="text-xs opacity-70 px-3 mb-2 font-semibold">المزيد:</div>
              <div className="grid grid-cols-2 gap-1">
                {MORE_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 text-xs font-medium rounded-md hover:bg-white/10 transition flex items-center gap-2"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-white/15 grid grid-cols-2 gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-white/10 text-center"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 text-sm font-bold rounded-lg bg-white text-[#1b3a6b] text-center"
              >
                ابدأ مجاناً
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
