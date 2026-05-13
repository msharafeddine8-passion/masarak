import Link from 'next/link';
import Logo from './Logo';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-primary-700 text-white mt-20 overflow-hidden" dir="rtl">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary-500 rounded-full blur-3xl opacity-20 -translate-y-1/2" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-mint rounded-full blur-3xl opacity-10" />

      {/* Top CTA strip */}
      <div className="relative bg-gradient-to-r from-accent to-coral text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📬</span>
            <div>
              <div className="font-extrabold text-lg">اشترك بنشرتنا الأسبوعية</div>
              <div className="text-sm text-white/90">أحدث المنح، نصائح الجامعات، وأخبار التعليم — مباشرة لإيميلك</div>
            </div>
          </div>
          <Link href="/contact" className="bg-white text-accent-dark font-extrabold px-6 py-2.5 rounded-2xl shadow-floaty hover:scale-105 transition-transform whitespace-nowrap">
            اشترك مجاناً ←
          </Link>
        </div>
      </div>

      <div className="relative container mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">

          {/* Logo + description */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Logo size={42} variant="white" showSubtitle={true} />
            <p className="text-sm text-white/80 leading-relaxed mt-4">
              منصّة عربية لمساعدة الطلاب على اكتشاف تخصّصهم، اختيار جامعتهم،
              والوصول للمنح الدراسية.
            </p>
            <div className="flex gap-2 mt-5">
              <a href="https://instagram.com/masarak" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg transition-colors backdrop-blur">
                📷
              </a>
              <a href="https://twitter.com/masarak" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg transition-colors backdrop-blur">
                🐦
              </a>
              <a href="https://linkedin.com/company/masarak" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg transition-colors backdrop-blur">
                💼
              </a>
            </div>
          </div>

          <FooterCol title="استكشف" links={[
            { href:'/universities', label:'الجامعات' },
            { href:'/majors', label:'التخصصات' },
            { href:'/scholarships', label:'المنح الدراسية' },
            { href:'/careers', label:'المسارات المهنية' },
            { href:'/schools', label:'المدارس' },
            { href:'/vocational', label:'التعليم المهني' },
            { href:'/internships/hub', label:'التدريب الصيفي' },
          ]} />

          <FooterCol title="أدوات" links={[
            { href:'/quiz/today', label:'اختبار اليوم', badge:'جديد' },
            { href:'/career-dna', label:'Career DNA' },
            { href:'/tools/cv-builder', label:'بناء السيرة الذاتية' },
            { href:'/tools/career-ai', label:'المرشد المهني' },
            { href:'/tools/cost-calculator', label:'حاسبة كلفة الدراسة' },
            { href:'/tools/interview-prep', label:'تدريب المقابلات' },
            { href:'/tools/skill-strengths', label:'اختبار المهارات' },
          ]} />

          <FooterCol title="موارد" links={[
            { href:'/blog', label:'المدوّنة' },
            { href:'/guides', label:'الإرشادات' },
            { href:'/community', label:'المجتمع' },
            { href:'/mentorship', label:'الإرشاد الفردي' },
            { href:'/jobs', label:'الوظائف' },
            { href:'/courses', label:'الدورات' },
            { href:'/referral', label:'برنامج الإحالة' },
            { href:'/changelog', label:'الأخبار' },
          ]} />

          <FooterCol title="مسارك" links={[
            { href:'/about', label:'عن مسارك' },
            { href:'/contact', label:'تواصل معنا' },
            { href:'/faq', label:'الأسئلة الشائعة' },
            { href:'/for-students', label:'للطلاب' },
            { href:'/for-parents', label:'للأهل' },
            { href:'/for-schools', label:'للمدارس' },
            { href:'/for-universities', label:'للجامعات' },
            { href:'/privacy', label:'الخصوصية' },
            { href:'/terms', label:'الشروط' },
          ]} />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/15 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <span>© {currentYear}</span>
            <span className="font-bold text-white">مسارك</span>
            <span>—</span>
            <span>جميع الحقوق محفوظة</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span>صُنع بحب</span>
            <span className="animate-pulse-soft">❤️</span>
            <span>في لبنان</span>
            <span>🇱🇧</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string; badge?: string }[] }) {
  return (
    <div>
      <h3 className="font-extrabold mb-4 text-base text-white">{title}</h3>
      <ul className="space-y-2 text-sm">
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className="text-white/75 hover:text-mint transition-colors inline-flex items-center gap-1.5">
              <span>{link.label}</span>
              {link.badge && (
                <span className="badge-accent text-[9px] !py-0">{link.badge}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
