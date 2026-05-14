'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type Locale = 'ar' | 'en';

// ─── Translations dictionary ──────────────────────────────────────────────────
// Add new strings here. The Arabic key is the source of truth.
// To translate a new string: add it to BOTH `ar` and `en` objects below.
export const messages = {
  ar: {
    // — Header / Nav —
    'nav.universities':     'الجامعات',
    'nav.majors':           'التخصصات',
    'nav.scholarships':     'المنح',
    'nav.careers':          'المسارات المهنية',
    'nav.schools':          'المدارس',
    'nav.vocational':       'التعليم المهني',
    'nav.tools':            'الأدوات',
    'nav.more':             'المزيد',
    'nav.section.main':     'التنقل',
    'nav.section.tools':    'الأدوات',
    'nav.section.more':     'المزيد',
    'nav.section.account':  'حسابي',

    // — Tools menu —
    'tools.quiz':           'اختبار اليوم',
    'tools.quiz.badge':     'جديد',
    'tools.career_dna':     'اختبار Career DNA',
    'tools.cv':             'إنشاء السيرة الذاتية',
    'tools.career_ai':      'المستشار المهني',
    'tools.interview':      'محاكاة المقابلة',
    'tools.onboarding':     'بدء الرحلة',
    'tools.cost':           'حاسبة التكلفة',
    'tools.bac':            'معادلة البكالوريا',
    'tools.tracker':        'متعقّب الطلبات',
    'tools.skills':         'اختبار المهارات',
    'tools.cover':          'خطاب التغطية',
    'tools.salary':         'حاسبة الراتب',

    // — More menu —
    'more.about':           'عن مسارك',
    'more.blog':            'المدوّنة',
    'more.contact':         'اتصل بنا',
    'more.faq':             'الأسئلة الشائعة',
    'more.community':       'المجتمع',
    'more.changelog':       'الأخبار',
    'more.referral':        'برنامج الإحالة',
    'more.premium':         'Premium 💎',
    'more.pricing':         'الباقات',

    // — User menu —
    'user.profile':         'الملف الشخصي',
    'user.edit':            'تعديل الملف',
    'user.parent_invites':  'دعوات الأهل',
    'user.dashboard':       'لوحة المتابعة',
    'user.parent.link':     'ربط طالب',
    'user.parent.deadlines':'مواعيد القبول',
    'user.parent.resources':'موارد للأهل',
    'user.admin':           'لوحة الإدارة',
    'user.logout':          'تسجيل الخروج',

    // — Auth CTAs —
    'auth.login':           'تسجيل الدخول',
    'auth.signup':          'ابدأ مجاناً',
    'auth.menu_label':      'القائمة',

    // — Footer —
    'footer.newsletter.title':       'اشترك بنشرتنا الأسبوعية',
    'footer.newsletter.subtitle':    'أحدث المنح، نصائح الجامعات، وأخبار التعليم — مباشرة لإيميلك',
    'footer.tagline':                'منصّة عربية لمساعدة الطلاب على اكتشاف تخصّصهم، اختيار جامعتهم، والوصول للمنح الدراسية.',
    'footer.col.explore':            'استكشف',
    'footer.col.tools':              'أدوات',
    'footer.col.resources':          'موارد',
    'footer.col.masarak':            'مسارك',
    'footer.copyright':              'جميع الحقوق محفوظة',
    'footer.made_with':              'صُنع بحب',
    'footer.in_lebanon':             'في لبنان',
    // Footer links
    'footer.link.universities':      'الجامعات',
    'footer.link.majors':            'التخصصات',
    'footer.link.scholarships':      'المنح الدراسية',
    'footer.link.careers':           'المسارات المهنية',
    'footer.link.schools':           'المدارس',
    'footer.link.vocational':        'التعليم المهني',
    'footer.link.internships':       'التدريب الصيفي',
    'footer.link.quiz':              'اختبار اليوم',
    'footer.link.cv':                'بناء السيرة الذاتية',
    'footer.link.career_ai':         'المرشد المهني',
    'footer.link.cost':              'حاسبة كلفة الدراسة',
    'footer.link.interview':         'تدريب المقابلات',
    'footer.link.skills':            'اختبار المهارات',
    'footer.link.blog':              'المدوّنة',
    'footer.link.guides':            'الإرشادات',
    'footer.link.community':         'المجتمع',
    'footer.link.mentorship':        'الإرشاد الفردي',
    'footer.link.jobs':              'الوظائف',
    'footer.link.courses':           'الدورات',
    'footer.link.referral':          'برنامج الإحالة',
    'footer.link.changelog':         'الأخبار',
    'footer.link.about':             'عن مسارك',
    'footer.link.contact':           'تواصل معنا',
    'footer.link.faq':               'الأسئلة الشائعة',
    'footer.link.for_students':      'للطلاب',
    'footer.link.for_parents':       'للأهل',
    'footer.link.for_schools':       'للمدارس',
    'footer.link.for_universities':  'للجامعات',
    'footer.link.privacy':           'الخصوصية',
    'footer.link.terms':             'الشروط',
    'footer.badge.new':              'جديد',

    // — Newsletter form —
    'newsletter.placeholder':        'إيميلك الإلكتروني',
    'newsletter.submit':             'اشترك مجاناً ←',
    'newsletter.success':            'تم الاشتراك بنجاح! رح يصلك أول إيميل قريباً.',
    'newsletter.duplicate':          'أنت مشترك أصلاً — شكراً!',

    // — Language toggle —
    'lang.switch_to_en':             'English',
    'lang.switch_to_ar':             'العربية',
  },

  en: {
    // — Header / Nav —
    'nav.universities':     'Universities',
    'nav.majors':           'Majors',
    'nav.scholarships':     'Scholarships',
    'nav.careers':          'Career Paths',
    'nav.schools':          'Schools',
    'nav.vocational':       'Vocational',
    'nav.tools':            'Tools',
    'nav.more':             'More',
    'nav.section.main':     'Navigation',
    'nav.section.tools':    'Tools',
    'nav.section.more':     'More',
    'nav.section.account':  'My Account',

    // — Tools menu —
    'tools.quiz':           'Daily Quiz',
    'tools.quiz.badge':     'New',
    'tools.career_dna':     'Career DNA Test',
    'tools.cv':             'CV Builder',
    'tools.career_ai':      'Career Advisor',
    'tools.interview':      'Interview Simulator',
    'tools.onboarding':     'Start Your Journey',
    'tools.cost':           'Cost Calculator',
    'tools.bac':            'Bac Equivalence',
    'tools.tracker':        'Application Tracker',
    'tools.skills':         'Skills Test',
    'tools.cover':          'Cover Letter',
    'tools.salary':         'Salary Calculator',

    // — More menu —
    'more.about':           'About Masarak',
    'more.blog':            'Blog',
    'more.contact':         'Contact Us',
    'more.faq':             'FAQ',
    'more.community':       'Community',
    'more.changelog':       'Changelog',
    'more.referral':        'Referral Program',
    'more.premium':         'Premium 💎',
    'more.pricing':         'Pricing',

    // — User menu —
    'user.profile':         'Profile',
    'user.edit':            'Edit Profile',
    'user.parent_invites':  'Parent Invites',
    'user.dashboard':       'Dashboard',
    'user.parent.link':     'Link Student',
    'user.parent.deadlines':'Admission Deadlines',
    'user.parent.resources':'Parent Resources',
    'user.admin':           'Admin Dashboard',
    'user.logout':          'Sign Out',

    // — Auth CTAs —
    'auth.login':           'Sign In',
    'auth.signup':          'Start Free',
    'auth.menu_label':      'Menu',

    // — Footer —
    'footer.newsletter.title':       'Subscribe to our weekly newsletter',
    'footer.newsletter.subtitle':    'Latest scholarships, university tips, and education news — straight to your inbox',
    'footer.tagline':                'An Arabic platform helping students discover their major, choose their university, and unlock scholarships.',
    'footer.col.explore':            'Explore',
    'footer.col.tools':              'Tools',
    'footer.col.resources':          'Resources',
    'footer.col.masarak':            'Masarak',
    'footer.copyright':              'All rights reserved',
    'footer.made_with':              'Made with',
    'footer.in_lebanon':             'in Lebanon',
    // Footer links
    'footer.link.universities':      'Universities',
    'footer.link.majors':            'Majors',
    'footer.link.scholarships':      'Scholarships',
    'footer.link.careers':           'Career Paths',
    'footer.link.schools':           'Schools',
    'footer.link.vocational':        'Vocational',
    'footer.link.internships':       'Summer Internships',
    'footer.link.quiz':              'Daily Quiz',
    'footer.link.cv':                'CV Builder',
    'footer.link.career_ai':         'Career Advisor',
    'footer.link.cost':              'Study Cost Calculator',
    'footer.link.interview':         'Interview Prep',
    'footer.link.skills':            'Skills Test',
    'footer.link.blog':              'Blog',
    'footer.link.guides':            'Guides',
    'footer.link.community':         'Community',
    'footer.link.mentorship':        'Mentorship',
    'footer.link.jobs':              'Jobs',
    'footer.link.courses':           'Courses',
    'footer.link.referral':          'Referral Program',
    'footer.link.changelog':         'Changelog',
    'footer.link.about':             'About Masarak',
    'footer.link.contact':           'Contact Us',
    'footer.link.faq':               'FAQ',
    'footer.link.for_students':      'For Students',
    'footer.link.for_parents':       'For Parents',
    'footer.link.for_schools':       'For Schools',
    'footer.link.for_universities':  'For Universities',
    'footer.link.privacy':           'Privacy',
    'footer.link.terms':             'Terms',
    'footer.badge.new':              'New',

    // — Newsletter form —
    'newsletter.placeholder':        'Your email address',
    'newsletter.submit':             'Subscribe Free →',
    'newsletter.success':            "You're subscribed! Your first email is on its way.",
    'newsletter.duplicate':          "You're already subscribed — thanks!",

    // — Language toggle —
    'lang.switch_to_en':             'English',
    'lang.switch_to_ar':             'العربية',
  },
} as const;

// ─── Types derived from messages ──────────────────────────────────────────────
export type TranslationKey = keyof typeof messages.ar;

// ─── Context ──────────────────────────────────────────────────────────────────
interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
  dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextValue | null>(null);

// Reads stored preference synchronously when possible (avoids hydration flash)
function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'ar';
  try {
    const v = window.localStorage.getItem('masarak-lang');
    return v === 'en' || v === 'ar' ? v : 'ar';
  } catch {
    return 'ar';
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar');

  // Read stored preference once on mount (avoid SSR mismatch by starting Arabic)
  useEffect(() => {
    const stored = readStoredLocale();
    if (stored !== locale) setLocaleState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync <html> attributes with the active locale
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem('masarak-lang', l);
    } catch {
      /* ignore quota / privacy errors */
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => {
      const dict = messages[locale] as Record<string, string>;
      const fallback = messages.ar as Record<string, string>;
      return dict[key] ?? fallback[key] ?? key;
    },
    [locale],
  );

  const value: I18nContextValue = {
    locale,
    setLocale,
    t,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Graceful fallback if a component is rendered outside the provider
    // (e.g. during SSR before hydration of the provider boundary).
    return {
      locale: 'ar',
      setLocale: () => {},
      t: (key: TranslationKey) => (messages.ar as Record<string, string>)[key] ?? key,
      dir: 'rtl',
    };
  }
  return ctx;
}

// Convenience hook returning just the translator function
export function useT() {
  return useI18n().t;
}
