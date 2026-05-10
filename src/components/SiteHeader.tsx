'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import { supabase } from '@/lib/supabase';

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
  { href: '/tools/cost-calculator', label: 'حاسبة التكلفة' },
  { href: '/tools/bac-equivalence', label: 'معادلة البكالوريا' },
  { href: '/tools/application-tracker', label: 'متعقّب الطلبات' },
  { href: '/tools/skill-strengths', label: 'اختبار المهارات' },
  { href: '/tools/cover-letter', label: 'خطاب التغطية' },
  { href: '/tools/interview-prep', label: 'محاكاة المقابلة' },
  { href: '/tools/salary-calculator', label: 'حاسبة الراتب' },
  { href: '/tools/career-ai', label: 'مستشار الذكاء' },
];

const MORE = [
  { href: '/about', label: 'عن مسارك' },
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

const USER_MENU = [
  { href: '/profile', label: 'الملف الشخصي', icon: '👤' },
  { href: '/profile/edit', label: 'تعديل الملف', icon: '✏️' },
  { href: '/dashboard', label: 'لوحة المتابعة', icon: '📊' },
];

interface UserInfo {
  email: string;
  name: string;
  initial: string;
  isAdmin: boolean;
}

const ADMIN_EMAILS = ['msharafeddine8@gmail.com'];

export default function SiteHeader() {
  const router = useRouter();
  const [open, setOpen] = useState<'tools' | 'more' | 'mobile' | 'user' | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // افحص الـ session الحالية عند التحميل
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const email = session.user.email || '';
        const fullName = (session.user.user_metadata?.full_name as string) || email.split('@')[0];
        setUser({
          email,
          name: fullName,
          initial: fullName.charAt(0).toUpperCase(),
          isAdmin: ADMIN_EMAILS.includes(email.toLowerCase()),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkSession();

    // اشترك بتغيّرات الـ auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const fullName = (session.user.user_metadata?.full_name as string) || email.split('@')[0];
        setUser({
          email,
          name: fullName,
          initial: fullName.charAt(0).toUpperCase(),
          isAdmin: ADMIN_EMAILS.includes(email.toLowerCase()),
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOpen(null);
    router.push('/');
    router.refresh();
  };

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

        {/* Auth Section — يتغيّر حسب حالة الدخول */}
        <div className="hidden lg:flex items-center gap-3">
          {loading ? (
            <div className="w-9 h-9 bg-white/10 rounded-full animate-pulse" />
          ) : user ? (
            // مسجّل دخول — اعرض user dropdown
            <div className="relative">
              <button
                onClick={() => setOpen(open === 'user' ? null : 'user')}
                className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-lg transition"
              >
                <div className="w-9 h-9 bg-[#5cc4b8] text-[#1b3a6b] rounded-full flex items-center justify-center font-bold">
                  {user.initial}
                </div>
                <div className="text-right hidden xl:block">
                  <div className="text-sm font-semibold leading-tight">{user.name}</div>
                  <div className="text-[10px] opacity-70 leading-tight">{user.email}</div>
                </div>
                <span className="text-xs">▼</span>
              </button>
              {open === 'user' && (
                <div className="absolute top-full mt-2 left-0 bg-white text-gray-700 rounded-lg shadow-xl py-2 min-w-[240px]">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="font-semibold text-sm">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                  {USER_MENU.map((m) => (
                    <Link
                      key={m.href}
                      href={m.href}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setOpen(null)}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </Link>
                  ))}
                  {user.isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 border-t border-gray-100"
                      onClick={() => setOpen(null)}
                    >
                      <span>⚙️</span>
                      <span>لوحة الإدارة</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600 border-t border-gray-100"
                  >
                    <span>🚪</span>
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // غير مسجّل — اعرض أزرار login/register
            <>
              <Link href="/auth/login" className="text-sm hover:text-[#5cc4b8]">تسجيل الدخول</Link>
              <Link href="/auth/register" className="px-4 py-2 bg-[#5cc4b8] text-[#1b3a6b] font-bold text-sm rounded-lg hover:bg-[#4dafa3] transition">ابدأ الآن</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(open === 'mobile' ? null : 'mobile')} className="lg:hidden text-2xl" aria-label="Menu">☰</button>
      </div>

      {open === 'mobile' && (
        <div className="lg:hidden bg-white text-gray-700 max-h-[80vh] overflow-y-auto">
          {/* User info on mobile */}
          {user && (
            <div className="p-4 bg-[#1b3a6b]/5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#5cc4b8] text-[#1b3a6b] rounded-full flex items-center justify-center font-bold">
                  {user.initial}
                </div>
                <div>
                  <div className="font-semibold text-sm">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
            </div>
          )}

          {MAIN.map(n => <Link key={n.href} href={n.href} className="block px-4 py-3 border-b" onClick={() => setOpen(null)}>{n.label}</Link>)}
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">الأدوات</div>
          {TOOLS.map(n => <Link key={n.href} href={n.href} className="block px-4 py-2 text-sm border-b" onClick={() => setOpen(null)}>{n.label}</Link>)}
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">المزيد</div>
          {MORE.map(n => <Link key={n.href} href={n.href} className="block px-4 py-2 text-sm border-b" onClick={() => setOpen(null)}>{n.label}</Link>)}

          {user ? (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">حسابي</div>
              {USER_MENU.map((m) => (
                <Link key={m.href} href={m.href} className="block px-4 py-2 text-sm border-b" onClick={() => setOpen(null)}>
                  {m.icon} {m.label}
                </Link>
              ))}
              {user.isAdmin && (
                <Link href="/admin/dashboard" className="block px-4 py-2 text-sm border-b bg-purple-50" onClick={() => setOpen(null)}>
                  ⚙️ لوحة الإدارة
                </Link>
              )}
              <button onClick={handleLogout} className="w-full text-right px-4 py-3 text-sm text-red-600 border-b">
                🚪 تسجيل الخروج
              </button>
            </>
          ) : (
            <div className="p-4 flex gap-2">
              <Link href="/auth/login" className="flex-1 text-center py-2 border rounded-lg" onClick={() => setOpen(null)}>تسجيل الدخول</Link>
              <Link href="/auth/register" className="flex-1 text-center py-2 bg-[#1b3a6b] text-white rounded-lg" onClick={() => setOpen(null)}>ابدأ الآن</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
