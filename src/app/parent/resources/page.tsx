"use client";
import Link from "next/link";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const RESOURCES = [
  {
    emoji: "💬",
    titleKey: "presrc.res1.title",
    descKey: "presrc.res1.desc",
    tagKeys: ["presrc.tag.communication", "presrc.tag.essential"],
    color: "from-mint to-primary-300",
  },
  {
    emoji: "💸",
    titleKey: "presrc.res2.title",
    descKey: "presrc.res2.desc",
    tagKeys: ["presrc.tag.money", "presrc.tag.planning"],
    color: "from-accent to-coral",
  },
  {
    emoji: "🌍",
    titleKey: "presrc.res3.title",
    descKey: "presrc.res3.desc",
    tagKeys: ["presrc.tag.studyAbroad"],
    color: "from-info to-primary",
  },
  {
    emoji: "🧬",
    titleKey: "presrc.res4.title",
    descKey: "presrc.res4.desc",
    tagKeys: ["presrc.tag.psychological", "presrc.tag.major"],
    color: "from-violet to-primary-700",
  },
  {
    emoji: "⚠️",
    titleKey: "presrc.res5.title",
    descKey: "presrc.res5.desc",
    tagKeys: ["presrc.tag.mentalHealth"],
    color: "from-danger to-coral",
  },
  {
    emoji: "🎓",
    titleKey: "presrc.res6.title",
    descKey: "presrc.res6.desc",
    tagKeys: ["presrc.tag.comparison"],
    color: "from-success to-mint",
  },
  {
    emoji: "📋",
    titleKey: "presrc.res7.title",
    descKey: "presrc.res7.desc",
    tagKeys: ["presrc.tag.application"],
    color: "from-warning to-accent",
  },
  {
    emoji: "🤝",
    titleKey: "presrc.res8.title",
    descKey: "presrc.res8.desc",
    tagKeys: ["presrc.tag.boundaries", "presrc.tag.parenting"],
    color: "from-primary to-info",
  },
];

const FAQ = [
  { qKey: "presrc.faq1.q", aKey: "presrc.faq1.a" },
  { qKey: "presrc.faq2.q", aKey: "presrc.faq2.a" },
  { qKey: "presrc.faq3.q", aKey: "presrc.faq3.a" },
  { qKey: "presrc.faq4.q", aKey: "presrc.faq4.a" },
];

export default function ParentResourcesPage() {
  const { t, dir } = useI18n();
  return (
    <main className="min-h-screen bg-bg pb-20 relative overflow-hidden" dir={dir}>
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        <Link href="/parent/dashboard" className="text-sm text-ink-muted hover:text-primary inline-flex items-center gap-1 mb-4">
          {t('pr.back')}
        </Link>

        {/* Hero */}
        <div className="bg-gradient-hero rounded-4xl p-8 md:p-10 mb-8 text-white shadow-floaty relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/30 rounded-full blur-3xl" />
          <div className="absolute top-6 left-1/4 text-3xl animate-float opacity-50">📚</div>
          <div className="absolute bottom-8 right-1/4 text-3xl animate-float opacity-50" style={{ animationDelay: '1s' }}>💡</div>

          <div className="relative flex items-center gap-5 flex-wrap">
            <div className="text-7xl animate-bounce-soft drop-shadow-2xl">📚</div>
            <div>
              <span className="inline-block bg-surface/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-2">{t('pr.chip')}</span>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{t('pr.title')}</h1>
              <p className="text-white/90">{t('pr.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <h2 className="text-2xl font-extrabold text-primary mb-4">{t('pr.resources')}</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-12 stagger">
          {RESOURCES.map(r => (
            <div key={r.titleKey} className="card group hover:shadow-floaty hover:-translate-y-1 transition-all relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className="relative flex items-start gap-4">
                <div className={`icon-circle-lg bg-gradient-to-br ${r.color} text-white flex-shrink-0`}>
                  <span className="text-3xl">{r.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-primary mb-1.5">{t(r.titleKey as TranslationKey)}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed mb-2">{t(r.descKey as TranslationKey)}</p>
                  <div className="flex flex-wrap gap-1">
                    {r.tagKeys.map(tagKey => (
                      <span key={tagKey} className="badge-primary text-[10px]">{t(tagKey as TranslationKey)}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border-soft text-center">
                <span className="text-xs text-ink-subtle">{t('pr.coming_soon')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="text-2xl font-extrabold text-primary mb-4">{t('pr.faq')}</h2>
        <div className="space-y-3 mb-8">
          {FAQ.map((f, i) => (
            <details key={i} className="card group cursor-pointer">
              <summary className="font-bold text-ink flex items-center justify-between gap-3">
                <span className="flex-1">{t(f.qKey as TranslationKey)}</span>
                <span className="text-primary text-xl group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 pt-3 border-t border-border-soft text-ink leading-relaxed text-sm">{t(f.aKey as TranslationKey)}</p>
            </details>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-mint rounded-4xl p-8 text-center text-primary-dark">
          <div className="text-5xl mb-3">💬</div>
          <h3 className="text-2xl font-extrabold mb-2">{t('pr.cta.title')}</h3>
          <p className="text-ink mb-4">{t('pr.cta.subtitle')}</p>
          <Link href="/contact" className="btn-primary inline-flex">
            {t('pr.cta.contact')}
          </Link>
        </div>
      </div>
    </main>
  );
}
