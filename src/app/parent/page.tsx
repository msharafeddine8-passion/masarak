"use client";
import { useState } from "react";
import Link from "next/link";
import { useI18n, type TranslationKey } from "@/lib/i18n";

// ─── Data ─────────────────────────────────────────────────────────────────────

// Arabic UI strings stored as i18n keys, resolved via t() at render.
const CHILDREN = [
  {
    id: 1,
    name: "parent.child.name",
    grade: "parent.child.grade",
    school: "parent.child.school",
    avatar: "م",
    xp: 340,
    level: "parent.child.level",
    profileCompletion: 65,
    dnaCompleted: true,
    dnaResult: "RIASEC: Investigative + Artistic",
    topFields: ["parent.field.engineering", "parent.field.cs", "parent.field.design"],
    activities: [
      { date: "parent.act.date_today",   action: "parent.act.a1", xp: 100, emoji: "🧬" },
      { date: "parent.act.date_yesterday", action: "parent.act.a2", xp: 10,  emoji: "🏛️" },
      { date: "parent.act.date_2days",   action: "parent.act.a3", xp: 50,  emoji: "📝" },
      { date: "parent.act.date_4days",   action: "parent.act.a4", xp: 10,  emoji: "🚀" },
    ],
    scholarships: [
      { name: "parent.sch.name1", status: "parent.sch.status_viewed", statusColor: "bg-blue-100 text-blue-700"   },
      { name: "parent.sch.name2", status: "parent.sch.status_viewed", statusColor: "bg-blue-100 text-blue-700"   },
    ],
    universities: ["AUB", "LAU", "USEK"],
    badges: ["🚀", "📝", "🧬"],
    alerts: [
      { type: "info",    msg: "parent.alert.inactive" },
      { type: "success", msg: "parent.alert.dna_done" },
    ],
  },
];

const TIPS = [
  { emoji: "💬", tip: "parent.tip.1" },
  { emoji: "📅", tip: "parent.tip.2" },
  { emoji: "🏛️", tip: "parent.tip.3" },
  { emoji: "🎯", tip: "parent.tip.4" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const { t, dir } = useI18n();
  const [selectedChild, setSelectedChild] = useState(CHILDREN[0]);
  const [activeTab, setActiveTab] = useState<"overview"|"dna"|"scholarships"|"activity">("overview");
  const c = selectedChild;

  return (
    <div className="min-h-screen bg-light" dir={dir}>
      {/* Header */}
      <header className="bg-surface border-b border-line sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">{t('parent.brand')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full">{t('pa.role_badge')}</span>
            <Link href="/" className="text-sm text-text-sub hover:text-danger border border-line px-3 py-1.5 rounded-lg">{t('pa.logout')}</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Welcome */}
        <div className="bg-gradient-to-br from-[#6C3483] to-[#512E5F] rounded-2xl p-6 md:p-8 mb-6 text-white">
          <p className="text-white/70 text-sm mb-1">{t('pa.dashboard_label')}</p>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">{t('pa.welcome')}</h1>
          <p className="text-white/80 text-sm">{t('pa.subtitle')}</p>
        </div>

        {/* Child Selector (if multiple children) */}
        {CHILDREN.length > 1 && (
          <div className="flex gap-3 mb-5 overflow-x-auto">
            {CHILDREN.map(ch => (
              <button key={ch.id} onClick={() => setSelectedChild(ch)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-semibold text-sm whitespace-nowrap transition-all ${
                  selectedChild.id === ch.id ? "bg-primary text-white border-primary" : "bg-surface border-line text-text-sub"
                }`}>
                <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary text-xs">{ch.avatar}</div>
                {t(ch.name as TranslationKey).split(" ")[0]}
              </button>
            ))}
          </div>
        )}

        {/* Alerts */}
        {c.alerts.map((a, i) => (
          <div key={i} className={`mb-3 flex items-center gap-3 p-3 rounded-xl border-2 ${
            a.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-blue-50 border-blue-200 text-blue-800"
          }`}>
            <span>{a.type === "success" ? "✅" : "ℹ️"}</span>
            <span className="text-sm font-semibold">{t(a.msg as TranslationKey)}</span>
          </div>
        ))}

        {/* Child Card */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl">
                {c.avatar}
              </div>
              <div>
                <h2 className="font-extrabold text-primary text-lg">{t(c.name as TranslationKey)}</h2>
                <p className="text-text-sub text-sm">{t(c.grade as TranslationKey)} • {t(c.school as TranslationKey)}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="badge bg-purple-50 text-purple-700 text-xs">{t(c.level as TranslationKey)}</span>
                  <span className="badge bg-accent/10 text-accent text-xs font-bold">{c.xp} XP</span>
                  <div className="flex gap-1">{c.badges.map((b,i) => <span key={i} className="text-lg">{b}</span>)}</div>
                </div>
              </div>
            </div>
            {/* Profile Completion */}
            <div className="w-full md:w-48">
              <div className="flex justify-between text-xs text-text-sub mb-1">
                <span>{t('pa.profile_completion')}</span>
                <span className="font-bold text-primary">{c.profileCompletion}%</span>
              </div>
              <div className="bg-bg-soft rounded-full h-3">
                <div className="bg-primary rounded-full h-3 transition-all" style={{ width: `${c.profileCompletion}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto">
          {[
            { id: "overview",    label: t('pa.tab.overview'),     emoji: "📊" },
            { id: "dna",         label: t('pa.tab.dna'),          emoji: "🧬" },
            { id: "scholarships",label: t('pa.tab.scholarships'), emoji: "🏆" },
            { id: "activity",    label: t('pa.tab.activity'),     emoji: "📅" },
          ].map(tb => (
            <button key={tb.id} onClick={() => setActiveTab(tb.id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap border-2 transition-all ${
                activeTab === tb.id
                  ? "bg-[#6C3483] text-white border-[#6C3483] shadow-md"
                  : "bg-surface text-text-sub border-line hover:border-[#6C3483]"
              }`}>
              <span>{tb.emoji}</span><span>{tb.label}</span>
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: t('pa.ov.stat.xp_label'),      val: c.xp + " XP",  sub: c.level,           emoji: "⭐", color: "bg-amber-50 border-amber-200"  },
                { label: t('pa.ov.stat.dna_label'),     val: c.dnaCompleted ? t('pa.ov.stat.dna_done') : t('pa.ov.stat.dna_not'), sub: c.dnaCompleted ? t('pa.ov.stat.dna_sub_done') : t('pa.ov.stat.dna_sub_not'),  emoji: "🧬", color: "bg-blue-50 border-blue-200"   },
                { label: t('pa.ov.stat.profile_label'), val: c.profileCompletion + "%", sub: t('pa.ov.stat.profile_sub'),     emoji: "📝", color: "bg-green-50 border-green-200" },
              ].map(s => (
                <div key={s.label} className={`card border-2 ${s.color}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-text-sub text-sm">{s.label}</span>
                  </div>
                  <div className="font-extrabold text-primary text-xl">{s.val}</div>
                  <div className="text-text-sub text-xs mt-1">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Top Recommended Fields */}
            <div className="card">
              <h3 className="font-bold text-primary mb-3">{t('pa.ov.fields_prefix')} {t(c.name as TranslationKey).split(" ")[0]}</h3>
              <div className="flex flex-wrap gap-2">
                {c.topFields.map(f => (
                  <span key={f} className="bg-primary/10 text-primary font-semibold px-4 py-2 rounded-xl text-sm">{t(f as TranslationKey)}</span>
                ))}
              </div>
              <p className="text-text-sub text-xs mt-3">{t('pa.ov.fields_based')}</p>
            </div>

            {/* Universities Explored */}
            <div className="card">
              <h3 className="font-bold text-primary mb-3">{t('pa.ov.unis_explored')}</h3>
              <div className="flex gap-2 flex-wrap">
                {c.universities.map(u => (
                  <span key={u} className="badge bg-blue-50 text-blue-700 font-bold">{u}</span>
                ))}
              </div>
              <Link href="/universities" className="text-primary text-sm font-semibold mt-3 inline-block hover:underline">
                {t('pa.ov.explore_more')}
              </Link>
            </div>

            {/* Tips for Parents */}
            <div className="card bg-purple-50 border-2 border-purple-100">
              <h3 className="font-bold text-primary mb-3">{t('pa.ov.tips')}</h3>
              <div className="space-y-3">
                {TIPS.map((tip, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-xl flex-shrink-0">{tip.emoji}</span>
                    <p className="text-text-sub text-sm leading-relaxed">{t(tip.tip as TranslationKey)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── DNA ── */}
        {activeTab === "dna" && (
          <div className="space-y-5">
            {c.dnaCompleted ? (
              <>
                <div className="card border-2 border-green-200 bg-green-50">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🧬</span>
                    <div>
                      <h3 className="font-bold text-primary text-lg">{t('pa.dna.title')}</h3>
                      <p className="text-text-sub text-sm">{c.dnaResult}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    {c.topFields.map((f, i) => (
                      <div key={f} className="bg-surface rounded-xl p-3 text-center border border-green-200">
                        <div className="text-2xl mb-1">{["🥇","🥈","🥉"][i]}</div>
                        <div className="font-bold text-primary text-sm">{t(f as TranslationKey)}</div>
                        <div className="text-text-sub text-xs">{t('pa.dna.rec_label')}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <h3 className="font-bold text-primary mb-3">{t('pa.dna.meaning')}</h3>
                  <p className="text-text-sub text-sm leading-loose">
                    {t('parent.dna.meaning_body')}
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                    <p className="text-blue-800 text-sm font-semibold">{t('pa.dna.tip_label')}</p>
                    <p className="text-blue-700 text-sm mt-1">{t('parent.dna.tip_body')}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">🧬</div>
                <h3 className="font-bold text-primary text-lg mb-2">{t('pa.dna.empty.title')}</h3>
                <p className="text-text-sub text-sm mb-5">{t('pa.dna.empty.desc')}</p>
                <button className="btn-primary px-6 py-3 rounded-xl">
                  {t('pa.dna.empty.btn')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── SCHOLARSHIPS ── */}
        {activeTab === "scholarships" && (
          <div className="space-y-4">
            <div className="card bg-amber-50 border-2 border-amber-200 mb-2">
              <p className="text-amber-800 text-sm">
                {t('pa.sch.banner')}
              </p>
            </div>
            {c.scholarships.map((s, i) => (
              <div key={i} className="card hover:shadow-md transition-all flex items-center gap-4">
                <span className="text-3xl">🏆</span>
                <div className="flex-1">
                  <h4 className="font-bold text-primary">{t(s.name as TranslationKey)}</h4>
                  <p className="text-text-sub text-sm">{t('pa.sch.row_desc')}</p>
                </div>
                <span className={`badge ${s.statusColor} font-semibold`}>{t(s.status as TranslationKey)}</span>
              </div>
            ))}
            <Link href="/scholarships"
              className="card hover:shadow-md transition-all flex items-center gap-4 cursor-pointer border-dashed border-2 border-primary/20">
              <span className="text-3xl">🔍</span>
              <div>
                <h4 className="font-bold text-primary">{t('pa.sch.explore')}</h4>
                <p className="text-text-sub text-sm">{t('pa.sch.explore_d')}</p>
              </div>
              <span className="text-primary font-bold mr-auto">←</span>
            </Link>
          </div>
        )}

        {/* ── ACTIVITY ── */}
        {activeTab === "activity" && (
          <div className="space-y-3">
            <p className="text-sm text-text-sub mb-2">{t('pa.act.prefix')} {t(c.name as TranslationKey).split(" ")[0]} {t('pa.act.on_platform')}</p>
            {c.activities.map((a, i) => (
              <div key={i} className="card flex items-center gap-4 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {a.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-primary text-sm">{t(a.action as TranslationKey)}</p>
                  <p className="text-text-sub text-xs">{t(a.date as TranslationKey)}</p>
                </div>
                <span className="badge bg-accent/10 text-accent font-bold text-xs">+{a.xp} XP</span>
              </div>
            ))}
            <div className="card bg-bg-soft text-center py-6 text-text-sub text-sm">
              {t('pa.act.no_older')}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="card mt-8 bg-gradient-to-r from-[#6C3483]/5 to-accent/5 border-2 border-[#6C3483]/10 text-center py-8">
          <h3 className="font-bold text-primary text-xl mb-2">{t('pa.cta.title')}</h3>
          <p className="text-text-sub mb-5">{t('pa.cta.subtitle')}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/universities" className="btn-primary px-6 py-3 rounded-xl">{t('pa.cta.unis')}</Link>
            <Link href="/scholarships" className="border-2 border-primary text-primary font-bold px-6 py-3 rounded-xl hover:bg-light transition-colors">{t('pa.cta.scholarships')}</Link>
          </div>
        </div>

      </main>
    </div>
  );
}
