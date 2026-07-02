"use client";
import { useState } from "react";
import Link from "next/link";
import { useI18n, type TranslationKey } from "@/lib/i18n";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SCHOOL = {
  name: "ثانوية الحكمة – بيروت",
  logo: "ح",
  students: 248,
  activeStudents: 183,
  completedDNA: 97,
  avgXP: 310,
};

const STUDENTS = [
  { id: 1, name: "محمد شرف الدين", grade: "11", xp: 340, dna: true,  profilePct: 65, topField: "هندسة الحاسوب", status: "نشيط",    avatar: "م" },
  { id: 2, name: "سارة خوري",      grade: "12", xp: 820, dna: true,  profilePct: 90, topField: "الطب",          status: "نشيط",    avatar: "س" },
  { id: 3, name: "أحمد منصور",     grade: "11", xp: 510, dna: true,  profilePct: 80, topField: "الأعمال",        status: "نشيط",    avatar: "أ" },
  { id: 4, name: "ليلى عبدالله",   grade: "10", xp: 210, dna: false, profilePct: 30, topField: "—",             status: "غير نشيط", avatar: "ل" },
  { id: 5, name: "كريم حداد",      grade: "12", xp: 690, dna: true,  profilePct: 85, topField: "الحقوق",        status: "نشيط",    avatar: "ك" },
  { id: 6, name: "نور الدين رشيد", grade: "10", xp: 90,  dna: false, profilePct: 20, topField: "—",             status: "غير نشيط", avatar: "ن" },
  { id: 7, name: "ميرنا سعد",      grade: "11", xp: 440, dna: true,  profilePct: 70, topField: "العمارة",        status: "نشيط",    avatar: "م" },
  { id: 8, name: "رامي أبو حيدر",  grade: "12", xp: 580, dna: true,  profilePct: 75, topField: "الهندسة",       status: "نشيط",    avatar: "ر" },
];

const TOP_FIELDS = [
  { fieldKey: "schadmin.field.medicine", count: 42, pct: 43 },
  { fieldKey: "schadmin.field.engineering", count: 38, pct: 39 },
  { fieldKey: "schadmin.field.business", count: 29, pct: 30 },
  { fieldKey: "schadmin.field.law", count: 18, pct: 18 },
  { fieldKey: "schadmin.field.designArts", count: 14, pct: 14 },
  { fieldKey: "schadmin.field.humanities", count: 11, pct: 11 },
];

const MONTHLY_ACTIVITY = [
  { monthKey: "schadmin.month.jan", students: 60  },
  { monthKey: "schadmin.month.feb", students: 85  },
  { monthKey: "schadmin.month.mar", students: 110 },
  { monthKey: "schadmin.month.apr", students: 140 },
  { monthKey: "schadmin.month.may", students: 183 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SchoolAdminPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab]   = useState<"overview"|"students"|"fields"|"reports">("overview");
  const [search, setSearch]         = useState("");
  const [gradeFilter, setGradeFilter] = useState("الكل");
  const [statusFilter, setStatusFilter] = useState("الكل");

  const filtered = STUDENTS.filter(s =>
    s.name.includes(search) &&
    (gradeFilter === "الكل" || s.grade === gradeFilter) &&
    (statusFilter === "الكل" || s.status === statusFilter)
  );

  const maxActivity = Math.max(...MONTHLY_ACTIVITY.map(m => m.students));

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-surface border-b border-line sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">{t('schadmin.brand')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">🏫 {t('schadmin.badge.schoolAdmin')}</span>
            <Link href="/" className="text-sm text-text-sub hover:text-danger border border-line px-3 py-1.5 rounded-lg">{t('schadmin.exit')}</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* School Hero */}
        <div className="bg-gradient-to-br from-[#0E7C7B] to-[#065a59] rounded-2xl p-6 md:p-8 mb-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-surface/20 rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl">
                {SCHOOL.logo}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">{t('schadmin.schoolName')}</h1>
                <p className="text-white/80 text-sm mt-0.5">{t('schadmin.academicPanel')}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 md:mr-auto">
              {[
                { val: SCHOOL.students,       label: t('schadmin.stat.totalStudents'), emoji: "👥" },
                { val: SCHOOL.activeStudents,  label: t('schadmin.stat.activeStudent'), emoji: "✅" },
                { val: SCHOOL.completedDNA,    label: t('schadmin.stat.completedDNA'),  emoji: "🧬" },
                { val: SCHOOL.avgXP,           label: t('schadmin.stat.avgXP'),         emoji: "⭐" },
              ].map(s => (
                <div key={s.label} className="bg-surface/15 rounded-xl px-4 py-2 text-center">
                  <div className="text-xl mb-0.5">{s.emoji}</div>
                  <div className="text-xl font-extrabold text-accent">{s.val}</div>
                  <div className="text-white/70 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto">
          {[
            { id: "overview",  label: t('schadmin.tab.overview'), emoji: "📊" },
            { id: "students",  label: t('schadmin.tab.students'), emoji: "👥" },
            { id: "fields",    label: t('schadmin.tab.fields'),   emoji: "🎯" },
            { id: "reports",   label: t('schadmin.tab.reports'),  emoji: "📋" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap border-2 transition-all ${
                activeTab === tab.id
                  ? "bg-[#0E7C7B] text-white border-[#0E7C7B] shadow-md"
                  : "bg-surface text-text-sub border-line hover:border-[#0E7C7B]"
              }`}>
              <span>{tab.emoji}</span><span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* KPI Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: t('schadmin.kpi.engagementRate'), val: Math.round((SCHOOL.activeStudents/SCHOOL.students)*100)+"%", sub: `${SCHOOL.activeStudents} ${t('schadmin.of')} ${SCHOOL.students}`, color: "text-primary", bg: "bg-blue-50 border-blue-100",   emoji: "📈" },
                { label: t('schadmin.kpi.completedDNA'), val: SCHOOL.completedDNA,  sub: t('schadmin.kpi.outOf248'),                          color: "text-green-700", bg: "bg-green-50 border-green-100", emoji: "🧬" },
                { label: t('schadmin.kpi.avgXP'),        val: SCHOOL.avgXP+" XP",   sub: t('schadmin.kpi.levelActive'),                       color: "text-amber-700", bg: "bg-amber-50 border-amber-100", emoji: "⭐" },
                { label: t('schadmin.kpi.needsFollowup'), val: STUDENTS.filter(s=>!s.dna).length, sub: t('schadmin.kpi.notCompletedDNA'),      color: "text-red-700",   bg: "bg-red-50 border-red-100",     emoji: "⚠️" },
              ].map(k => (
                <div key={k.label} className={`card border-2 ${k.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{k.emoji}</span>
                    <span className="text-text-sub text-xs">{k.label}</span>
                  </div>
                  <div className={`font-extrabold text-2xl ${k.color}`}>{k.val}</div>
                  <div className="text-text-sub text-xs mt-1">{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Activity Chart */}
            <div className="card">
              <h3 className="font-bold text-primary mb-4">📈 {t('schadmin.chart.monthlyGrowth')}</h3>
              <div className="flex items-end gap-3 h-36">
                {MONTHLY_ACTIVITY.map(m => (
                  <div key={m.monthKey} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-primary">{m.students}</span>
                    <div className="w-full bg-[#0E7C7B] rounded-t-lg transition-all"
                      style={{ height: `${(m.students/maxActivity)*100}%`, minHeight: "8px" }} />
                    <span className="text-xs text-text-sub">{t(m.monthKey as TranslationKey)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="card border-2 border-orange-200 bg-orange-50">
              <h3 className="font-bold text-orange-800 mb-3">⚠️ {t('schadmin.alerts.title')}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-orange-700">
                  <span>🔴</span> <span>{STUDENTS.filter(s=>!s.dna).length} {t('schadmin.alerts.notCompletedDNA')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-orange-700">
                  <span>🟡</span> <span>{STUDENTS.filter(s=>s.status==="غير نشيط").length} {t('schadmin.alerts.inactiveWeek')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-orange-700">
                  <span>🔵</span> <span>{t('schadmin.alerts.aubDeadline')}</span>
                </div>
              </div>
            </div>

            {/* Top Students */}
            <div className="card">
              <h3 className="font-bold text-primary mb-4">🏆 {t('schadmin.topStudents.title')}</h3>
              <div className="space-y-3">
                {[...STUDENTS].sort((a,b) => b.xp - a.xp).slice(0,4).map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                      i===0?"bg-accent text-white":i===1?"bg-gray-300 text-ink-muted":i===2?"bg-amber-600 text-white":"bg-bg-soft text-ink-subtle"
                    }`}>{i+1}</div>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">{s.avatar}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-primary text-sm">{s.name}</div>
                      <div className="text-text-sub text-xs">{t('schadmin.grade')} {s.grade}</div>
                    </div>
                    <div className="font-bold text-accent text-sm">{s.xp} XP</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STUDENTS ── */}
        {activeTab === "students" && (
          <>
            <div className="card mb-4">
              <div className="flex flex-col md:flex-row gap-3">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  className="flex-1 border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-[#0E7C7B] focus:outline-none"
                  placeholder={"🔍 " + t('schadmin.searchPlaceholder')} />
                <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
                  className="border-2 border-line rounded-xl px-4 py-2.5 text-sm bg-surface">
                  {["الكل","10","11","12"].map(g => <option key={g} value={g}>{g === "الكل" ? t('schadmin.allGrades') : `${t('schadmin.grade')} ${g}`}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="border-2 border-line rounded-xl px-4 py-2.5 text-sm bg-surface">
                  {["الكل","نشيط","غير نشيط"].map(s => <option key={s} value={s}>{s === "الكل" ? t('schadmin.all') : s === "نشيط" ? t('schadmin.status.active') : t('schadmin.status.inactive')}</option>)}
                </select>
              </div>
            </div>

            <p className="text-sm text-text-sub mb-4">{t('schadmin.showing')} <strong className="text-primary">{filtered.length}</strong> {t('schadmin.studentWord')}</p>

            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-bg-soft border-b border-line">
                    <tr>
                      {[t('schadmin.th.student'), t('schadmin.th.grade'), "XP", "Career DNA", t('schadmin.th.profile'), t('schadmin.th.field'), t('schadmin.th.status')].map((h, hi) => (
                        <th key={hi} className="text-right px-4 py-3 font-bold text-text-sub text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s.id} className={`border-b border-gray-50 hover:bg-bg-soft transition-colors ${i%2===0?"bg-surface":"bg-bg-soft/30"}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{s.avatar}</div>
                            <span className="font-semibold text-primary">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-text-sub">{s.grade}</td>
                        <td className="px-4 py-3 font-bold text-accent">{s.xp}</td>
                        <td className="px-4 py-3">
                          <span className={`badge text-xs ${s.dna ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                            {s.dna ? "✅ " + t('schadmin.dna.complete') : "❌ " + t('schadmin.dna.incomplete')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-bg-soft rounded-full h-1.5">
                              <div className="bg-primary rounded-full h-1.5" style={{width:`${s.profilePct}%`}}/>
                            </div>
                            <span className="text-xs text-text-sub">{s.profilePct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-text-sub">{s.topField}</td>
                        <td className="px-4 py-3">
                          <span className={`badge text-xs ${s.status==="نشيط"?"bg-green-100 text-green-700":"bg-bg-soft text-ink-subtle"}`}>
                            {s.status==="نشيط" ? t('schadmin.status.active') : t('schadmin.status.inactive')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── FIELDS ── */}
        {activeTab === "fields" && (
          <div className="space-y-5">
            <div className="card">
              <h3 className="font-bold text-primary mb-4">🎯 {t('schadmin.fields.title')}</h3>
              <div className="space-y-4">
                {TOP_FIELDS.map((f, i) => (
                  <div key={f.fieldKey}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-base">{["🥇","🥈","🥉","4️⃣","5️⃣","6️⃣"][i]}</span>
                        <span className="font-semibold text-primary">{t(f.fieldKey as TranslationKey)}</span>
                      </div>
                      <span className="text-text-sub font-medium">{f.count} {t('schadmin.studentWord')}</span>
                    </div>
                    <div className="bg-bg-soft rounded-full h-3">
                      <div className="bg-[#0E7C7B] rounded-full h-3 transition-all"
                        style={{ width: `${f.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card bg-teal-50 border-2 border-teal-100">
              <h3 className="font-bold text-primary mb-3">💡 {t('schadmin.recommendations.title')}</h3>
              <div className="space-y-3">
                {[
                  { emoji: "🏥", text: t('schadmin.rec.medicine') },
                  { emoji: "💻", text: t('schadmin.rec.engineering') },
                  { emoji: "🎓", text: t('schadmin.rec.openDay') },
                ].map((r, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-xl flex-shrink-0">{r.emoji}</span>
                    <p className="text-text-sub text-sm leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <p className="text-text-sub text-sm mb-2">{t('schadmin.reports.intro')}</p>
            {[
              { title: t('schadmin.report.monthly.title'),   sub: t('schadmin.report.monthly.sub'),   emoji: "📊", ready: true  },
              { title: t('schadmin.report.dna.title'),       sub: t('schadmin.report.dna.sub'),       emoji: "🧬", ready: true  },
              { title: t('schadmin.report.fields.title'),    sub: t('schadmin.report.fields.sub'),    emoji: "🎯", ready: true  },
              { title: t('schadmin.report.scholarships.title'), sub: t('schadmin.report.scholarships.sub'), emoji: "🏆", ready: false },
              { title: t('schadmin.report.followup.title'),  sub: t('schadmin.report.followup.sub'),  emoji: "⚠️", ready: true  },
            ].map((r, i) => (
              <div key={i} className="card flex items-center gap-4 hover:shadow-md transition-all">
                <span className="text-3xl">{r.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-primary">{r.title}</h4>
                  <p className="text-text-sub text-sm">{r.sub}</p>
                </div>
                <button className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  r.ready
                    ? "btn-primary hover:opacity-90"
                    : "bg-bg-soft text-ink-subtle cursor-not-allowed"
                }`}>
                  {r.ready ? "⬇️ " + t('schadmin.download') : t('schadmin.comingSoon')}
                </button>
              </div>
            ))}

            <div className="card bg-blue-50 border-2 border-blue-100 text-center py-6">
              <p className="text-blue-800 text-sm font-semibold mb-2">📩 {t('schadmin.custom.title')}</p>
              <p className="text-blue-700 text-xs mb-4">{t('schadmin.custom.desc')}</p>
              <a href="mailto:support@masaraklb.com"
                className="btn-primary px-6 py-2 rounded-xl text-sm inline-block">
                {t('schadmin.custom.cta')} ←
              </a>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
