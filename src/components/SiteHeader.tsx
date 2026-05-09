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
