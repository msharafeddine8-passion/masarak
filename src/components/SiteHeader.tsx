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
  { href: '/quiz/today', label: 'اختبار اليوم', icon: '🎯', badge: 'جديد' },
  { href: '/career-dna', label: 'اختبار Career DNA', icon: '🧬' },
  { href: '/tools/cv-builder', label: 'إنشاء السيرة الذاتية', icon: '📄' },
  { href: '/tools/career-ai', label: 'المستشار المهني', icon: '🤖' },
  { href: '/tools/interview-prep', label: 'محاكاة المقابلة', icon: '🎤' },
  { href: '/onboarding', label: 'بدء الرحلة', icon: '🧭' },
  { href: '/tools/cost-calculator', label: 'حاسبة التكلفة', icon: '💰' },
  { href: '/tools/bac-equivalence', label: 'معادلة البكالوريا', icon: '🔄' },
  { href: '/tools/application-tracker', label: 'متعقّب الطلبات', icon: '📋' },
  { href: '/tools/skill-strengths', label: 'اختبار المهارات', icon: '💪' },
  { href: '/tools/cover-letter', label: 'خطاب التغطية', icon: '✉️' },
  { href: '/tools/salary-calculator', label: 'حاسبة الراتب', icon: '💵' },
];

const MORE = [
  { href: '/about', label: 'عن مسارك', icon: '📖' },
  { href: '/blog', label: 'المدوّنة', icon: '📰' },
  { href: '/contact', label: 'اتصل بنا', icon: '✉️' },
  { href: '/faq', label: 'الأسئلة الشائعة', icon: '❓' },
  { href: '/community', label: 'المجتمع', icon: '👥' },
  { href: '/changelog', label: 'الأخبار', icon: '📢' },
  { href: '/referral', label: 'برنامج الإحالة', icon: '🎁' },
  { href: '/pricing', label: 'الباقات', icon: '💎' },
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
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
      } else setUser(null);
      setLoading(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const fullName = (session.user.user_metadata?.full_name as string) || email.split('@')[0];
        setUser({
          email, name: fullName,
          initial: fullName.charAt(0).toUpperCase(),
          isAdmin: ADMIN_EMAILS.includes(email.toLowerCase()),
        });
      } else setUser(null);
    });

    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOpen(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-soft border-b border-border-soft'
          : 'bg-transparent'
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center" onClick={() => setOpen(null)}>
          <Logo size={36} variant={scrolled ? 'dark' : 'dark'} showSubtitle={false} />
        </Link>

        {/* MAIN NAV */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold">
          {MAIN.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-2 rounded-xl text-ink hover:bg-mint-light hover:text-primary transition-colors"
            >
              {n.label}
            </Link>
          ))}

          {/* Tools dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(open === 'tools' ? null : 'tools')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-ink hover:bg-mint-light hover:text-primary transition-colors"
            >
              <span>الأدوات</span>
              <span className={`text-[10px] transition-transform ${open === 'tools' ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {open === 'tools' && (
              <div className="absolute top-full mt-2 right-0 bg-surface rounded-2xl shadow-floaty border border-border-soft py-2 min-w-[260px] animate-scale-in max-h-[70vh] overflow-y-auto">
                {TOOLS.map(t => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-mint-pale hover:text-primary transition-colors"
                    onClick={() => setOpen(null)}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="flex-1">{t.label}</span>
                    {t.badge && (
                      <span className="badge-accent text-[9px]">{t.badge}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* More dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(open === 'more' ? null : 'more')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-ink hover:bg-mint-light hover:text-primary transition-colors"
            >
              <span>المزيد</span>
              <span className={`text-[10px] transition-transform ${open === 'more' ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {open === 'more' && (
              <div className="absolute top-full mt-2 right-0 bg-surface rounded-2xl shadow-floaty border border-border-soft py-2 min-w-[220px] animate-scale-in">
                {MORE.map(t => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-mint-pale hover:text-primary transition-colors"
                    onClick={() => setOpen(null)}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span>{t.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* AUTH SECTION */}
        <div className="hidden lg:flex items-center gap-3">
          {loading ? (
            <div className="w-10 h-10 bg-mint-light rounded-full animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setOpen(open === 'user' ? null : 'user')}
                className="flex items-center gap-2 hover:bg-mint-light px-2 py-1.5 rounded-2xl transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-mint-deep text-white rounded-full flex items-center justify-center font-extrabold shadow-soft ring-2 ring-mint-light">
                  {user.initial}
                </div>
                <div className="text-right hidden xl:block max-w-[140px]">
                  <div className="text-sm font-bold text-ink leading-tight truncate">{user.name}</div>
                  <div className="text-[10px] text-ink-muted leading-tight truncate">{user.email}</div>
                </div>
                <span className="text-[10px] text-ink-muted">▼</span>
              </button>
              {open === 'user' && (
                <div className="absolute top-full mt-2 left-0 bg-surface rounded-2xl shadow-floaty border border-border-soft py-2 min-w-[260px] animate-scale-in">
                  <div className="px-4 py-3 border-b border-border-soft bg-gradient-soft rounded-t-2xl">
                    <div className="font-bold text-ink">{user.name}</div>
                    <div className="text-xs text-ink-muted truncate">{user.email}</div>
                  </div>
                  {USER_MENU.map(m => (
                    <Link
                      key={m.href}
                      href={m.href}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-mint-pale hover:text-primary transition-colors"
                      onClick={() => setOpen(null)}
                    >
                      <span className="text-lg">{m.icon}</span>
                      <span>{m.label}</span>
                    </Link>
                  ))}
                  {user.isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary font-bold hover:bg-mint-pale border-t border-border-soft"
                      onClick={() => setOpen(null)}
                    >
                      <span className="text-lg">⚙️</span>
                      <span>لوحة الإدارة</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger-light border-t border-border-soft"
                  >
                    <span className="text-lg">🚪</span>
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="btn-ghost text-sm">
                تسجيل الدخول
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm py-2.5">
                ابدأ مجاناً
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(open === 'mobile' ? null : 'mobile')}
          className="lg:hidden w-10 h-10 rounded-2xl bg-mint-light flex items-center justify-center text-primary text-xl"
          aria-label="Menu"
        >
          {open === 'mobile' ? '✕' : '☰'}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open === 'mobile' && (
        <div className="lg:hidden bg-surface border-t border-border-soft max-h-[80vh] overflow-y-auto animate-fade-in">
          {user && (
            <div className="p-4 bg-gradient-soft border-b border-border-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-mint-deep text-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-soft">
                  {user.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink truncate">{user.name}</div>
                  <div className="text-xs text-ink-muted truncate">{user.email}</div>
                </div>
              </div>
            </div>
          )}

          <div className="p-2">
            <div className="px-3 py-2 text-[10px] font-bold uppercase text-ink-subtle">التنقل</div>
            {MAIN.map(n => (
              <Link key={n.href} href={n.href}
                className="block px-3 py-2.5 rounded-xl text-ink hover:bg-mint-pale font-medium"
                onClick={() => setOpen(null)}>
                {n.label}
              </Link>
            ))}

            <div className="px-3 py-2 text-[10px] font-bold uppercase text-ink-subtle mt-3">الأدوات</div>
            {TOOLS.map(t => (
              <Link key={t.href} href={t.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-ink hover:bg-mint-pale"
                onClick={() => setOpen(null)}>
                <span>{t.icon}</span>
                <span className="flex-1">{t.label}</span>
                {t.badge && <span className="badge-accent text-[9px]">{t.badge}</span>}
              </Link>
            ))}

            <div className="px-3 py-2 text-[10px] font-bold uppercase text-ink-subtle mt-3">المزيد</div>
            {MORE.map(n => (
              <Link key={n.href} href={n.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-ink hover:bg-mint-pale"
                onClick={() => setOpen(null)}>
                <span>{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            ))}

            {user ? (
              <>
                <div className="px-3 py-2 text-[10px] font-bold uppercase text-ink-subtle mt-3">حسابي</div>
                {USER_MENU.map(m => (
                  <Link key={m.href} href={m.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-ink hover:bg-mint-pale"
                    onClick={() => setOpen(null)}>
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </Link>
                ))}
                {user.isAdmin && (
                  <Link href="/admin/dashboard"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-primary font-bold bg-mint-pale"
                    onClick={() => setOpen(null)}>
                    <span>⚙️</span>
                    <span>لوحة الإدارة</span>
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 mt-2 rounded-xl text-sm text-danger hover:bg-danger-light text-right">
                  <span>🚪</span>
                  <span>تسجيل الخروج</span>
                </button>
              </>
            ) : (
              <div className="p-2 pt-4 grid grid-cols-2 gap-2">
                <Link href="/auth/login" className="btn-outline text-center text-sm py-2.5" onClick={() => setOpen(null)}>
                  تسجيل الدخول
                </Link>
                <Link href="/auth/register" className="btn-primary text-center text-sm py-2.5" onClick={() => setOpen(null)}>
                  ابدأ مجاناً
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
