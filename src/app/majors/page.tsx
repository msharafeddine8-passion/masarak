"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
// Single source of truth for major data lives in ./data (also used by the
// SEO detail pages /majors/[slug]). Salaries were revised to be conservative
// with tight ranges per user feedback.
import { MAJORS, SLUG_BY_ID, SALARY_NOTE } from "./data";

const CATEGORIES = ["الكل", ...Array.from(new Set(MAJORS.map(m => m.category)))];

const DEMAND_COLORS = {
  "عالٍ جداً": { badge:"bg-green-100 text-green-700 border-green-300",  bar:"bg-green-500",  pct:100 },
  "عالٍ":      { badge:"bg-blue-100 text-blue-700 border-blue-300",    bar:"bg-blue-500",   pct:75  },
  "متوسط":     { badge:"bg-amber-100 text-amber-700 border-amber-300", bar:"bg-amber-400",  pct:50  },
  "منخفض":     { badge:"bg-bg-soft text-ink-muted border-line",    bar:"bg-gray-400",   pct:25  },
};

function DifficultyDots({ n }: { n: number }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`w-2 h-2 rounded-full ${i <= n ? "bg-orange-500" : "bg-bg-soft"}`} />
      ))}
    </div>
  );
}

export default function MajorsPage() {
  const { t, dir } = useI18n();
  const [search, setSearch]   = useState("");
  const [cat, setCat]         = useState("الكل");
  const [sortBy, setSortBy]   = useState<"demand"|"salary"|"years">("demand");
  const [marketView, setMarketView] = useState<"lb"|"gulf">("lb");
  const [expanded, setExpanded] = useState<number|null>(null);
  const [activeTab, setActiveTab] = useState<"overview"|"roadmap"|"skills">("overview");

  const filtered = useMemo(() => {
    let list = MAJORS.filter(m =>
      (cat === "الكل" || m.category === cat) &&
      (!search || m.name.includes(search) || m.category.includes(search) || m.careers.some(c => c.includes(search)))
    );
    if (sortBy === "salary") list = [...list].sort((a, b) =>
      (marketView === "gulf" ? b.salaryGulfMax - a.salaryGulfMax : b.salaryMax - a.salaryMax));
    else if (sortBy === "years") list = [...list].sort((a, b) => a.years - b.years);
    else list = [...list].sort((a, b) => {
      const order: Record<string, number> = { "عالٍ جداً":4, "عالٍ":3, "متوسط":2, "منخفض":1 };
      const demandA = marketView === "gulf" ? a.demandGulf : a.demandLB;
      const demandB = marketView === "gulf" ? b.demandGulf : b.demandLB;
      return order[demandB] - order[demandA];
    });
    return list;
  }, [search, cat, sortBy, marketView]);

  return (
    <div dir={dir} className="min-h-screen bg-bg relative overflow-hidden">
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none" />

      <main className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-hero rounded-4xl p-8 md:p-12 mb-8 text-white shadow-floaty relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/30 rounded-full blur-3xl" />
          <div className="absolute top-6 left-1/4 text-3xl animate-float opacity-50">📊</div>
          <div className="absolute bottom-8 right-1/4 text-3xl animate-float opacity-50" style={{ animationDelay: '1s' }}>💼</div>

          <div className="relative flex items-start justify-between flex-wrap gap-4">
            <div>
              <span className="inline-flex items-center gap-2 bg-surface/15 backdrop-blur rounded-full px-4 py-1.5 text-sm font-bold mb-4">
                {t('maj.hero.badge')}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">{t('maj.hero.title')}</h1>
              <p className="text-white/90 text-lg max-w-xl">
                <strong className="text-mint">{MAJORS.length}</strong> {t('maj.hero.subtitle.1')}
              </p>
            </div>
            <div className="text-8xl animate-float drop-shadow-2xl">🎓</div>
          </div>

          {/* Market Toggle */}
          <div className="mt-6 flex gap-1 bg-surface/20 rounded-xl p-1 w-fit">
            <button onClick={() => setMarketView("lb")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${marketView === "lb" ? "bg-surface text-blue-700" : "text-white/80 hover:text-white"}`}>
              {t('maj.market.lb')}
            </button>
            <button onClick={() => setMarketView("gulf")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${marketView === "gulf" ? "bg-surface text-blue-700" : "text-white/80 hover:text-white"}`}>
              {t('maj.market.gulf')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-line mb-6">
          <div className="flex flex-wrap gap-3 items-end mb-4">
            <div className="flex-1 min-w-56">
              <label className="text-xs font-bold text-ink-subtle block mb-1">{t('maj.search.label')}</label>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('maj.search.placeholder.long')}
                className="w-full border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-subtle block mb-1">{t('maj.sort.label')}</label>
              <div className="flex gap-1">
                {[
                  ["demand", t('maj.sort.demand')],
                  ["salary", t('maj.sort.salary')],
                  ["years",  t('maj.sort.years')],
                ].map(([v,l]) => (
                  <button key={v} onClick={() => setSortBy(v as "demand"|"salary"|"years")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${sortBy === v ? "bg-purple-600 text-white" : "bg-bg-soft text-ink-muted hover:bg-bg-soft"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${cat === c ? "bg-blue-600 text-white" : "bg-bg-soft text-ink-muted hover:bg-bg-soft"}`}>
                {c === 'الكل' ? t('maj.cat.all') : c}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-ink-subtle mb-4"><strong>{filtered.length}</strong> {t('maj.count.label')} · <span className="text-xs">الرواتب {SALARY_NOTE}</span></p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(m => {
            const demand = marketView === "gulf" ? m.demandGulf : m.demandLB;
            const salMin = marketView === "gulf" ? m.salaryGulfMin : m.salaryMin;
            const salMax = marketView === "gulf" ? m.salaryGulfMax : m.salaryMax;
            const dc = DEMAND_COLORS[demand];
            const isExp = expanded === m.id;

            return (
              <div key={m.id} className={`bg-surface rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${isExp ? "border-blue-400 ring-2 ring-blue-100" : "border-line"}`}>
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{m.emoji}</span>
                      <div>
                        <Link href={`/majors/${SLUG_BY_ID[m.id]}`} className="font-extrabold text-ink leading-tight hover:text-primary hover:underline">{m.name}</Link>
                        <p className="text-xs text-ink-subtle mt-0.5">{m.category} · {m.years} {t('maj.years')} · {m.lang}</p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${dc.badge}`}>{demand}</span>
                  </div>

                  <p className="text-xs text-ink-subtle leading-relaxed mb-3">{m.desc}</p>

                  {/* Demand Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-ink-subtle font-medium">{t('maj.demand.label')}</span>
                      <span className="font-bold text-ink-muted">{demand}</span>
                    </div>
                    <div className="bg-bg-soft rounded-full h-2">
                      <div className={`${dc.bar} rounded-full h-2 transition-all`} style={{ width: `${dc.pct}%` }} />
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 mb-1 flex items-center justify-between">
                    <span className="text-xs text-ink-subtle">{marketView === "gulf" ? t('maj.salary.gulf') : t('maj.salary.lb')}</span>
                    <span className="font-extrabold text-green-700 text-sm">${salMin.toLocaleString()}–${salMax.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-ink-subtle mb-3">{SALARY_NOTE}</p>

                  {/* Difficulty + Universities */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-subtle">{t('maj.difficulty')}</span>
                      <DifficultyDots n={m.difficulty} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {m.universities.slice(0,3).map(u => (
                        <span key={u} className="text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded">{u}</span>
                      ))}
                    </div>
                  </div>

                  {/* Careers */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {m.careers.slice(0,3).map(c => (
                      <span key={c} className="text-[11px] bg-bg-soft text-ink-muted font-medium px-2 py-0.5 rounded-full border border-line">{c}</span>
                    ))}
                  </div>

                  {/* Expand Button */}
                  <button onClick={() => { setExpanded(isExp ? null : m.id); setActiveTab("overview"); }}
                    className={`w-full text-xs font-bold py-2 rounded-xl transition-colors ${isExp ? "bg-blue-600 text-white" : "bg-bg-soft text-ink-muted hover:bg-blue-50 hover:text-blue-600"}`}>
                    {isExp ? t('maj.btn.collapse') : t('maj.btn.expand')}
                  </button>

                  {/* Expanded Detail */}
                  {isExp && (
                    <div className="mt-4 pt-4 border-t border-line">
                      <div className="flex gap-1 mb-4">
                        {(["overview","roadmap","skills"] as const).map(tab => (
                          <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${activeTab === tab ? "bg-blue-600 text-white" : "bg-bg-soft text-ink-muted hover:bg-bg-soft"}`}>
                            {tab === "overview" ? t('maj.tab.overview') : tab === "roadmap" ? t('maj.tab.roadmap') : t('maj.tab.skills')}
                          </button>
                        ))}
                      </div>

                      {activeTab === "overview" && (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-bold text-ink-muted mb-1.5">{t('maj.section.careers')}</p>
                            <div className="flex flex-wrap gap-1">
                              {m.careers.map(c => (
                                <span key={c} className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full">{c}</span>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-bg-soft rounded-xl p-3">
                              <span className="text-ink-subtle block mb-1">{t('maj.section.lb')}</span>
                              <span className="font-bold text-green-700">${m.salaryMin.toLocaleString()}–${m.salaryMax.toLocaleString()}</span>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-3">
                              <span className="text-ink-subtle block mb-1">{t('maj.section.gulf')}</span>
                              <span className="font-bold text-amber-700">${m.salaryGulfMin.toLocaleString()}–${m.salaryGulfMax.toLocaleString()}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-ink-subtle">{SALARY_NOTE}</p>
                          {m.certifications && (
                            <div>
                              <p className="text-xs font-bold text-ink-muted mb-1.5">{t('maj.section.certs')}</p>
                              <div className="flex flex-wrap gap-1">
                                {m.certifications.map(c => (
                                  <span key={c} className="text-xs bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-full border border-purple-200">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "roadmap" && (
                        <div>
                          <p className="text-xs font-bold text-ink-muted mb-3">{t('maj.section.roadmap.1')} {m.name}:</p>
                          <div className="space-y-2">
                            {m.roadmap.map((step, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</div>
                                <div className="flex-1 bg-bg-soft rounded-xl px-3 py-2 text-xs font-semibold text-ink-muted">{step}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === "skills" && (
                        <div>
                          <p className="text-xs font-bold text-ink-muted mb-2">{t('maj.section.skills.1')}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {m.skills.map(s => (
                              <span key={s} className="text-xs bg-orange-50 text-orange-700 font-semibold px-2.5 py-1 rounded-full border border-orange-200">{s}</span>
                            ))}
                          </div>
                          <div className="mt-4 bg-blue-50 rounded-xl p-3 text-xs">
                            <span className="font-bold text-blue-700">{t('maj.section.riasec.1')} </span>
                            <span className="text-blue-600">{t('maj.section.riasec.2')} {m.riasec} — </span>
                            <Link href="/career-dna" className="text-blue-700 font-bold underline">{t('maj.section.riasec.cta')}</Link>
                          </div>
                        </div>
                      )}

                      <Link href={`/majors/${SLUG_BY_ID[m.id]}`} className="mt-4 block text-center text-xs font-extrabold py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark">
                        📄 الصفحة الكاملة للتخصّص (مهن · رواتب · مستقبل)
                      </Link>
                      <div className="mt-2 flex gap-2">
                        <Link href="/universities" className="flex-1 text-center text-xs font-bold py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                          {t('maj.cta.unis')}
                        </Link>
                        <Link href="/scholarships" className="flex-1 text-center text-xs font-bold py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600">
                          {t('maj.cta.schol')}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-extrabold mb-3">{t('maj.bottom.title')}</h2>
          <p className="text-blue-100 mb-6">{t('maj.bottom.subtitle')}</p>
          <Link href="/career-dna"
            className="bg-surface text-blue-700 font-extrabold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg">
            {t('maj.bottom.cta')}
          </Link>
        </div>
      </main>
    </div>
  );
}
