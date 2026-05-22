'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import NewsletterSignup from './NewsletterSignup';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import { isChromelessRoute } from '@/lib/chrome';

type FooterLink = { href: string; key: TranslationKey; badgeKey?: TranslationKey };

const EXPLORE: FooterLink[] = [
  { href: '/universities',     key: 'footer.link.universities' },
  { href: '/majors',           key: 'footer.link.majors' },
  { href: '/scholarships',     key: 'footer.link.scholarships' },
  { href: '/careers',          key: 'footer.link.careers' },
  { href: '/schools',          key: 'footer.link.schools' },
  { href: '/vocational',       key: 'footer.link.vocational' },
  { href: '/internships/hub',  key: 'footer.link.internships' },
];

const TOOLS_COL: FooterLink[] = [
  { href: '/quiz/today',             key: 'footer.link.quiz', badgeKey: 'footer.badge.new' },
  { href: '/career-dna',             key: 'tools.career_dna' },
  { href: '/tools/cv-builder',       key: 'footer.link.cv' },
  { href: '/tools/career-ai',        key: 'footer.link.career_ai' },
  { href: '/tools/cost-calculator',  key: 'footer.link.cost' },
  { href: '/tools/interview-prep',   key: 'footer.link.interview' },
  { href: '/tools/skill-strengths',  key: 'footer.link.skills' },
];

const RESOURCES: FooterLink[] = [
  { href: '/blog',       key: 'footer.link.blog' },
  { href: '/guides',     key: 'footer.link.guides' },
  { href: '/community',  key: 'footer.link.community' },
  { href: '/mentorship', key: 'footer.link.mentorship' },
  { href: '/jobs',       key: 'footer.link.jobs' },
  { href: '/courses',    key: 'footer.link.courses' },
  { href: '/referral',   key: 'footer.link.referral' },
  { href: '/changelog',  key: 'footer.link.changelog' },
];

const ABOUT: FooterLink[] = [
  { href: '/about',            key: 'footer.link.about' },
  { href: '/contact',          key: 'footer.link.contact' },
  { href: '/faq',              key: 'footer.link.faq' },
  { href: '/for-students',     key: 'footer.link.for_students' },
  { href: '/for-parents',      key: 'footer.link.for_parents' },
  { href: '/for-schools',      key: 'footer.link.for_schools' },
  { href: '/for-universities', key: 'footer.link.for_universities' },
  { href: '/privacy',          key: 'footer.link.privacy' },
  { href: '/terms',            key: 'footer.link.terms' },
];

export default function SiteFooter() {
  const { t, dir } = useI18n();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hidden on dedicated admin surfaces (institution dashboard, platform admin).
  if (isChromelessRoute(pathname)) return null;

  return (
    <footer className="relative bg-primary-700 text-white mt-20 overflow-hidden" dir={dir}>
      {/* Decorative blobs */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary-500 rounded-full blur-3xl opacity-20 -translate-y-1/2" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-mint rounded-full blur-3xl opacity-10" />

      {/* Top CTA strip */}
      <div className="relative bg-gradient-to-r from-accent to-coral text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-3xl">📬</span>
            <div>
              <div className="font-extrabold text-lg">{t('footer.newsletter.title')}</div>
              <div className="text-sm text-white/90">{t('footer.newsletter.subtitle')}</div>
            </div>
          </div>
          <div className="w-full md:w-auto md:max-w-md md:min-w-[320px]">
            <NewsletterSignup source="footer" />
          </div>
        </div>
      </div>

      <div className="relative container mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">

          {/* Logo + description */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Logo size={42} variant="white" showSubtitle={true} />
            <p className="text-sm text-white/80 leading-relaxed mt-4">
              {t('footer.tagline')}
            </p>
            <a href="mailto:support@masaraklb.com"
              className="inline-flex items-center gap-2 mt-5 text-sm text-white/90 hover:text-mint transition-colors">
              <span className="text-xl">📧</span>
              <span>support@masaraklb.com</span>
            </a>
          </div>

          <FooterCol title={t('footer.col.explore')}   links={EXPLORE} />
          <FooterCol title={t('footer.col.tools')}     links={TOOLS_COL} />
          <FooterCol title={t('footer.col.resources')} links={RESOURCES} />
          <FooterCol title={t('footer.col.masarak')}   links={ABOUT} />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/15 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <span>© {currentYear}</span>
            <span className="font-bold text-white">{t('footer.col.masarak')}</span>
            <span>—</span>
            <span>{t('footer.copyright')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span>{t('footer.made_with')}</span>
            <span className="animate-pulse-soft">❤️</span>
            <span>{t('footer.in_lebanon')}</span>
            <span>🇱🇧</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  const { t } = useI18n();
  return (
    <div>
      <h3 className="font-extrabold mb-4 text-base text-white">{title}</h3>
      <ul className="space-y-2 text-sm">
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className="text-white/75 hover:text-mint transition-colors inline-flex items-center gap-1.5">
              <span>{t(link.key)}</span>
              {link.badgeKey && (
                <span className="badge-accent text-[9px] !py-0">{t(link.badgeKey)}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
