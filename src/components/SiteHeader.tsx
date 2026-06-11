'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import LanguageToggle from './LanguageToggle';
import SearchModal from './SearchModal';
import { supabase } from '@/lib/supabase';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import { isChromelessRoute } from '@/lib/chrome';

type NavItem  = { href: string; key: TranslationKey };
type ToolItem = { href: string; key: TranslationKey; icon: string; badgeKey?: TranslationKey };

const MAIN: NavItem[] = [
  { href: '/universities',    key: 'nav.universities' },
  { href: '/majors',          key: 'nav.majors' },
  { href: '/scholarships',    key: 'nav.scholarships' },
  { href: '/internships/hub', key: 'nav.internships' },
  { href: '/schools',         key: 'nav.schools' },
  { href: '/careers',         key: 'nav.careers' },
  { href: '/vocational',      key: 'nav.vocational' },
];

const TOOLS: ToolItem[] = [
  { href: '/quiz/today',                  key: 'tools.quiz',         icon: '🎯', badgeKey: 'tools.quiz.badge' },
  { href: '/career-dna',                  key: 'tools.career_dna',   icon: '🧬' },
  { href: '/tools/cv-builder',            key: 'tools.cv',           icon: '📄' },
  { href: '/tools/career-ai',             key: 'tools.career_ai',    icon: '🤖' },
  { href: '/tools/interview-prep',        key: 'tools.interview',    icon: '🎤' },
  { href: '/onboarding',                  key: 'tools.onboarding',   icon: '🧭' },
  { href: '/tools/cost-calculator',       key: 'tools.cost',         icon: '💰' },
  { href: '/tools/bac-equivalence',       key: 'tools.bac',          icon: '🔄' },
  { href: '/tools/application-tracker',   key: 'tools.tracker',      icon: '📋' },
  { href: '/tools/skill-strengths',       key: 'tools.skills',       icon: '💪' },
  { href: '/tools/cover-letter',          key: 'tools.cover',        icon: '✉️' },
  { href: '/tools/salary-calculator',     key: 'tools.salary',       icon: '💵' },
];

const MORE: ToolItem[] = [
  { href: '/about',     key: 'more.about',     icon: '📖' },
  { href: '/team',      key: 'more.team',      icon: '👥' },
  { href: '/blog',      key: 'more.blog',      icon: '📰' },
  { href: '/contact',   key: 'more.contact',   icon: '✉️' },
  { href: '/faq',       key: 'more.faq',       icon: '❓' },
  { href: '/changelog', key: 'more.changelog', icon: '📢' },
  { href: '/referral',  key: 'more.referral',  icon: '🎁' },
  { href: '/premium',   key: 'more.premium',   icon: '⭐' },
  { href: '/pricing',   key: 'more.pricing',   icon: '💰' },
];

const USER_MENU_STUDENT: ToolItem[] = [
  { href: '/profile',                key: 'user.profile',        icon: '👤' },
  { href: '/profile/edit',           key: 'user.edit',           icon: '✏️' },
  { href: '/profile/parent-invites', key: 'user.parent_invites', icon: '📨' },
  { href: '/org/join',               key: 'user.join_org',       icon: '🏛️' },
  { href: '/dashboard',              key: 'user.dashboard',      icon: '📊' },
];

const USER_MENU_PARENT: ToolItem[] = [
  { href: '/parent/dashboard',    key: 'user.dashboard',         icon: '👨‍👩‍👧' },
  { href: '/parent/link-student', key: 'user.parent.link',       icon: '🔗' },
  { href: '/parent/deadlines',    key: 'user.parent.deadlines',  icon: '📅' },
  { href: '/parent/resources',    key: 'user.parent.resources',  icon: '📚' },
  { href: '/profile',             key: 'user.profile',           icon: '👤' },
];

interface UserInfo {
  email: string;
  name: string;
  initial: string;
  isAdmin: boolean;
  role: string;
}

// خريطة "الدور → الصفحة الرئيسية"
function getDashboardHref(role: string): string {
  if (role === 'parent') return '/parent/dashboard';
  return '/dashboard';
}

const ADMIN_EMAILS = ['msharafeddine8@gmail.com'];

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, dir } = useI18n();
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
        const role = (session.user.user_metadata?.role as string) || 'student';
        setUser({
          email,
          name: fullName,
          initial: fullName.charAt(0).toUpperCase(),
          isAdmin: ADMIN_EMAILS.includes(email.toLowerCase()),
          role,
        });
      } else setUser(null);
      setLoading(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const fullName = (session.user.user_metadata?.full_name as string) || email.split('@')[0];
        const role = (session.user.user_metadata?.role as string) || 'student';
        setUser({
          email, name: fullName,
          initial: fullName.charAt(0).toUpperCase(),
          isAdmin: ADMIN_EMAILS.includes(email.toLowerCase()),
          role,
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

  // Dedicated admin surfaces (institution dashboard, platform admin) render
  // without the student-facing site header.
  if (isChromelessRoute(pathname)) return null;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-soft border-b border-border-soft'
          : 'bg-transparent'
      }`}
      dir={dir}
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
              {t(n.key)}
            </Link>
          ))}

          {/* Tools dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(open === 'tools' ? null : 'tools')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-ink hover:bg-mint-light hover:text-primary transition-colors"
            >
              <span>{t('nav.tools')}</span>
              <span className={`text-[10px] transition-transform ${open === 'tools' ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {open === 'tools' && (
              <div className={`absolute top-full mt-2 ${dir === 'rtl' ? 'right-0' : 'left-0'} bg-surface rounded-2xl shadow-floaty border border-border-soft py-2 min-w-[260px] animate-scale-in max-h-[70vh] overflow-y-auto`}>
                {TOOLS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-mint-pale hover:text-primary transition-colors"
                    onClick={() => setOpen(null)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="flex-1">{t(item.key)}</span>
                    {item.badgeKey && (
                      <span className="badge-accent text-[9px]">{t(item.badgeKey)}</span>
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
              <span>{t('nav.more')}</span>
              <span className={`text-[10px] transition-transform ${open === 'more' ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {open === 'more' && (
              <div className={`absolute top-full mt-2 ${dir === 'rtl' ? 'right-0' : 'left-0'} bg-surface rounded-2xl shadow-floaty border border-border-soft py-2 min-w-[220px] animate-scale-in`}>
                {MORE.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-mint-pale hover:text-primary transition-colors"
                    onClick={() => setOpen(null)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{t(item.key)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* AUTH SECTION */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            type="button"
            aria-label="بحث (Ctrl+K)"
            title="بحث (Ctrl+K)"
            onClick={() => { const t = document.querySelector('[data-search-trigger]') as HTMLButtonElement | null; t?.click(); }}
            className="inline-flex items-center gap-1.5 w-11 h-11 justify-center rounded-xl bg-mint-light text-primary hover:bg-mint transition-colors text-base"
          >
            🔍
          </button>
          <LanguageToggle />
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
                <div className={`${dir === 'rtl' ? 'text-right' : 'text-left'} hidden xl:block max-w-[140px]`}>
                  <div className="text-sm font-bold text-ink leading-tight truncate">{user.name}</div>
                  <div className="text-[10px] text-ink-muted leading-tight truncate">{user.email}</div>
                </div>
                <span className="text-[10px] text-ink-muted">▼</span>
              </button>
              {open === 'user' && (
                <div className={`absolute top-full mt-2 ${dir === 'rtl' ? 'left-0' : 'right-0'} bg-surface rounded-2xl shadow-floaty border border-border-soft py-2 min-w-[260px] animate-scale-in`}>
                  <div className="px-4 py-3 border-b border-border-soft bg-gradient-soft rounded-t-2xl">
                    <div className="font-bold text-ink">{user.name}</div>
                    <div className="text-xs text-ink-muted truncate">{user.email}</div>
                  </div>
                  {(user.role === 'parent' ? USER_MENU_PARENT : USER_MENU_STUDENT).map(m => (
                    <Link
                      key={m.href}
                      href={m.href}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-mint-pale hover:text-primary transition-colors"
                      onClick={() => setOpen(null)}
                    >
                      <span className="text-lg">{m.icon}</span>
                      <span>{t(m.key)}</span>
                    </Link>
                  ))}
                  {user.isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary font-bold hover:bg-mint-pale border-t border-border-soft"
                      onClick={() => setOpen(null)}
                    >
                      <span className="text-lg">⚙️</span>
                      <span>{t('user.admin')}</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger-light border-t border-border-soft"
                  >
                    <span className="text-lg">🚪</span>
                    <span>{t('user.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="btn-ghost text-sm">
                {t('auth.login')}
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm py-2.5">
                {t('auth.signup')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile right side: language toggle + menu button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            type="button"
            aria-label="بحث"
            onClick={() => { const t = document.querySelector('[data-search-trigger]') as HTMLButtonElement | null; t?.click(); }}
            className="w-11 h-11 rounded-xl bg-mint-light text-primary text-base flex items-center justify-center"
          >
            🔍
          </button>
          <LanguageToggle compact />
          <button
            onClick={() => setOpen(open === 'mobile' ? null : 'mobile')}
            className="w-10 h-10 rounded-2xl bg-mint-light flex items-center justify-center text-primary text-xl"
            aria-label={t('auth.menu_label')}
          >
            {open === 'mobile' ? '✕' : '☰'}
          </button>
        </div>
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
            <div className="px-3 py-2 text-[10px] font-bold uppercase text-ink-subtle">{t('nav.section.main')}</div>
            {MAIN.map(n => (
              <Link key={n.href} href={n.href}
                className="block px-3 py-2.5 rounded-xl text-ink hover:bg-mint-pale font-medium"
                onClick={() => setOpen(null)}>
                {t(n.key)}
              </Link>
            ))}

            <div className="px-3 py-2 text-[10px] font-bold uppercase text-ink-subtle mt-3">{t('nav.section.tools')}</div>
            {TOOLS.map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-ink hover:bg-mint-pale"
                onClick={() => setOpen(null)}>
                <span>{item.icon}</span>
                <span className="flex-1">{t(item.key)}</span>
                {item.badgeKey && <span className="badge-accent text-[9px]">{t(item.badgeKey)}</span>}
              </Link>
            ))}

            <div className="px-3 py-2 text-[10px] font-bold uppercase text-ink-subtle mt-3">{t('nav.section.more')}</div>
            {MORE.map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-ink hover:bg-mint-pale"
                onClick={() => setOpen(null)}>
                <span>{item.icon}</span>
                <span>{t(item.key)}</span>
              </Link>
            ))}

            {user ? (
              <>
                <div className="px-3 py-2 text-[10px] font-bold uppercase text-ink-subtle mt-3">{t('nav.section.account')}</div>
                {(user.role === 'parent' ? USER_MENU_PARENT : USER_MENU_STUDENT).map(m => (
                  <Link key={m.href} href={m.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-ink hover:bg-mint-pale"
                    onClick={() => setOpen(null)}>
                    <span>{m.icon}</span>
                    <span>{t(m.key)}</span>
                  </Link>
                ))}
                {user.isAdmin && (
                  <Link href="/admin/dashboard"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-primary font-bold bg-mint-pale"
                    onClick={() => setOpen(null)}>
                    <span>⚙️</span>
                    <span>{t('user.admin')}</span>
                  </Link>
                )}
                <button onClick={handleLogout}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 mt-2 rounded-xl text-sm text-danger hover:bg-danger-light ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  <span>🚪</span>
                  <span>{t('user.logout')}</span>
                </button>
              </>
            ) : (
              <div className="p-2 pt-4 grid grid-cols-2 gap-2">
                <Link href="/auth/login" className="btn-outline text-center text-sm py-2.5" onClick={() => setOpen(null)}>
                  {t('auth.login')}
                </Link>
                <Link href="/auth/register" className="btn-primary text-center text-sm py-2.5" onClick={() => setOpen(null)}>
                  {t('auth.signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      <SearchModal />
    </header>
  );
}
