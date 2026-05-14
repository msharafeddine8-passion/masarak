"use client";
import Link from "next/link";
import { useI18n, type TranslationKey } from "@/lib/i18n";

type Tool = {
  href: string;
  emoji: string;
  tKey: TranslationKey;
  dKey: TranslationKey;
  badgeKey?: TranslationKey;
  badgeColor: string;
  color: string;
  features: TranslationKey[];
};

const TOOLS: Tool[] = [
  {
    href: "/tools/cv-builder",
    emoji: "📄",
    tKey: "toolsidx.t1.title",
    dKey: "toolsidx.t1.desc",
    badgeKey: "toolsidx.t1.badge",
    badgeColor: "bg-accent text-white",
    color: "from-primary to-[#1e4080]",
    features: ["toolsidx.t1.f1", "toolsidx.t1.f2", "toolsidx.t1.f3", "toolsidx.t1.f4"],
  },
  {
    href: "/tools/cover-letter",
    emoji: "✉️",
    tKey: "toolsidx.t2.title",
    dKey: "toolsidx.t2.desc",
    badgeKey: "toolsidx.t2.badge",
    badgeColor: "bg-green-500 text-white",
    color: "from-[#0E7C7B] to-[#065a59]",
    features: ["toolsidx.t2.f1", "toolsidx.t2.f2", "toolsidx.t2.f3", "toolsidx.t2.f4"],
  },
  {
    href: "/tools/interview",
    emoji: "🎤",
    tKey: "toolsidx.t3.title",
    dKey: "toolsidx.t3.desc",
    badgeColor: "",
    color: "from-[#6C3483] to-[#512E5F]",
    features: ["toolsidx.t3.f1", "toolsidx.t3.f2", "toolsidx.t3.f3", "toolsidx.t3.f4"],
  },
  {
    href: "/tools/strengths",
    emoji: "💪",
    tKey: "toolsidx.t4.title",
    dKey: "toolsidx.t4.desc",
    badgeColor: "",
    color: "from-[#D35400] to-[#A04000]",
    features: ["toolsidx.t4.f1", "toolsidx.t4.f2", "toolsidx.t4.f3", "toolsidx.t4.f4"],
  },
  {
    href: "/tools/daily-challenge",
    emoji: "⚡",
    tKey: "toolsidx.t5.title",
    dKey: "toolsidx.t5.desc",
    badgeKey: "toolsidx.t2.badge",
    badgeColor: "bg-purple-600 text-white",
    color: "from-[#667eea] to-[#764ba2]",
    features: ["toolsidx.t5.f1", "toolsidx.t5.f2", "toolsidx.t5.f3", "toolsidx.t5.f4"],
  },
  {
    href: "/tools/career-ai",
    emoji: "🤖",
    tKey: "toolsidx.t6.title",
    dKey: "toolsidx.t6.desc",
    badgeColor: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
    color: "from-[#667eea] to-[#4338ca]",
    features: ["toolsidx.t6.f1", "toolsidx.t6.f2", "toolsidx.t6.f3", "toolsidx.t6.f4"],
  },
];

export default function ToolsPage() {
  const { t, dir } = useI18n();

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden" dir={dir}>
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none" />

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="bg-gradient-hero rounded-4xl p-8 md:p-12 mb-8 text-white text-center shadow-floaty relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/30 rounded-full blur-3xl" />
          <div className="absolute top-6 left-1/4 text-3xl animate-float opacity-50">✨</div>
          <div className="absolute bottom-8 right-1/4 text-3xl animate-float opacity-50" style={{ animationDelay: '1s' }}>🚀</div>
          <div className="relative">
            <div className="text-7xl mb-4 animate-bounce-soft">🛠️</div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3">{t('toolsidx.title')}</h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              {t('toolsidx.subtitle')}
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {TOOLS.map(tool => (
            <Link key={tool.href} href={tool.href}
              className="group card hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-primary/20 overflow-hidden">

              {/* Header */}
              <div className={`bg-gradient-to-r ${tool.color} -mx-5 -mt-5 px-6 py-5 mb-5 relative`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{tool.emoji}</span>
                    <h3 className="text-white font-extrabold text-xl">{t(tool.tKey)}</h3>
                  </div>
                  {tool.badgeKey && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${tool.badgeColor}`}>{t(tool.badgeKey)}</span>
                  )}
                </div>
              </div>

              <p className="text-text-sub text-sm leading-relaxed mb-5">{t(tool.dKey)}</p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {tool.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-text-sub">
                    <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">✓</span>
                    {t(f)}
                  </div>
                ))}
              </div>

              <div className={`bg-gradient-to-r ${tool.color} text-white text-center py-2.5 rounded-xl font-bold text-sm group-hover:opacity-90 transition-opacity`}>
                {t('g.start_tool')}
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-accent/10 to-primary/10 border-2 border-primary/10 rounded-2xl p-6 text-center">
          <h3 className="font-extrabold text-primary text-xl mb-2">{t('toolsidx.banner.title')}</h3>
          <p className="text-text-sub text-sm mb-4">{t('toolsidx.banner.subtitle')}</p>
          <Link href="/career-dna" className="btn-primary px-8 py-3 rounded-xl inline-block">
            {t('toolsidx.banner.cta')}
          </Link>
        </div>
      </main>
    </div>
  );
}
