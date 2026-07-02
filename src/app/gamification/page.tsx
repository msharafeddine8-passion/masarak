"use client";
import { useState } from "react";
import Link from "next/link";
import { useI18n, type TranslationKey } from "@/lib/i18n";

// ─── Data ─────────────────────────────────────────────────────────────────────

const LEVELS = [
  { level: 1,  titleKey: "gam.level1",  min: 0,    max: 100,   color: "#94a3b8", emoji: "🌱" },
  { level: 2,  titleKey: "gam.level2",  min: 100,  max: 300,   color: "#60a5fa", emoji: "🔍" },
  { level: 3,  titleKey: "gam.level3",  min: 300,  max: 600,   color: "#34d399", emoji: "📚" },
  { level: 4,  titleKey: "gam.level4",  min: 600,  max: 1000,  color: "#fbbf24", emoji: "⭐" },
  { level: 5,  titleKey: "gam.level5",  min: 1000, max: 1500,  color: "#f97316", emoji: "🌟" },
  { level: 6,  titleKey: "gam.level6",  min: 1500, max: 2500,  color: "#a855f7", emoji: "🚀" },
  { level: 7,  titleKey: "gam.level7",  min: 2500, max: 99999, color: "#ef4444", emoji: "👑" },
];

const BADGES = [
  // مكتسبة
  { id: 1,  emoji: "🚀", titleKey: "gam.badge1Title",  descKey: "gam.badge1Desc",  xp: 10,  earned: true,  category: "بداية",  categoryKey: "gam.catStart"    },
  { id: 2,  emoji: "📝", titleKey: "gam.badge2Title",  descKey: "gam.badge2Desc",  xp: 50,  earned: true,  category: "ملف",    categoryKey: "gam.catProfile"  },
  { id: 3,  emoji: "🧬", titleKey: "gam.badge3Title",  descKey: "gam.badge3Desc",  xp: 30,  earned: true,  category: "اختبار", categoryKey: "gam.catTest"     },
  // غير مكتسبة
  { id: 4,  emoji: "🧪", titleKey: "gam.badge4Title",  descKey: "gam.badge4Desc",  xp: 100, earned: false, category: "اختبار", categoryKey: "gam.catTest"     },
  { id: 5,  emoji: "🏆", titleKey: "gam.badge5Title",  descKey: "gam.badge5Desc",  xp: 80,  earned: false, category: "منح",    categoryKey: "gam.catScholar"  },
  { id: 6,  emoji: "🎓", titleKey: "gam.badge6Title",  descKey: "gam.badge6Desc",  xp: 60,  earned: false, category: "جامعات", categoryKey: "gam.catUni"      },
  { id: 7,  emoji: "📅", titleKey: "gam.badge7Title",  descKey: "gam.badge7Desc",  xp: 70,  earned: false, category: "نشاط",   categoryKey: "gam.catActivity" },
  { id: 8,  emoji: "🌟", titleKey: "gam.badge8Title",  descKey: "gam.badge8Desc",  xp: 150, earned: false, category: "مستوى",  categoryKey: "gam.catLevel"    },
  { id: 9,  emoji: "🤝", titleKey: "gam.badge9Title",  descKey: "gam.badge9Desc",  xp: 40,  earned: false, category: "مشاركة", categoryKey: "gam.catShare"    },
  { id: 10, emoji: "💡", titleKey: "gam.badge10Title", descKey: "gam.badge10Desc", xp: 50,  earned: false, category: "تعلم",   categoryKey: "gam.catLearn"    },
  { id: 11, emoji: "🏅", titleKey: "gam.badge11Title", descKey: "gam.badge11Desc", xp: 200, earned: false, category: "منح",    categoryKey: "gam.catScholar"  },
  { id: 12, emoji: "👑", titleKey: "gam.badge12Title", descKey: "gam.badge12Desc", xp: 500, earned: false, category: "مستوى",  categoryKey: "gam.catLevel"    },
];

const MISSIONS = [
  { id: 1, titleKey: "gam.mission1", xp: 100, progress: 30, total: 100, done: false, href: "/career-dna",    emoji: "🧬" },
  { id: 2, titleKey: "gam.mission2", xp: 60,  progress: 1,  total: 3,   done: false, href: "/universities",  emoji: "🏛️" },
  { id: 3, titleKey: "gam.mission3", xp: 50,  progress: 0,  total: 1,   done: false, href: "/scholarships",  emoji: "🏆" },
  { id: 4, titleKey: "gam.mission4", xp: 30,  progress: 0,  total: 1,   done: false, href: "/profile/edit",  emoji: "📸" },
  { id: 5, titleKey: "gam.mission5", xp: 80,  progress: 15, total: 100, done: false, href: "/profile/edit",  emoji: "✅" },
  { id: 6, titleKey: "gam.mission6", xp: 70,  progress: 3,  total: 7,   done: false, href: "/dashboard",     emoji: "📅" },
];

const LEADERBOARD = [
  { rank: 1, name: "سارة خوري",      avatar: "س", xp: 1840, levelKey: "gam.level5", levelEmoji: "🌟", badge: "👑" },
  { rank: 2, name: "أحمد منصور",     avatar: "أ", xp: 1620, levelKey: "gam.level6", levelEmoji: "🚀", badge: "🥈" },
  { rank: 3, name: "ليلى عبدالله",   avatar: "ل", xp: 1390, levelKey: "gam.level5", levelEmoji: "🌟", badge: "🥉" },
  { rank: 4, name: "كريم حداد",      avatar: "ك", xp: 1200, levelKey: "gam.level5", levelEmoji: "🌟", badge: ""   },
  { rank: 5, name: "نور الدين",       avatar: "ن", xp: 980,  levelKey: "gam.level4", levelEmoji: "⭐", badge: ""   },
  { rank: 6, name: "أنت",            avatar: "أ", xp: 90,   levelKey: "gam.level1", levelEmoji: "🌱", badge: "📍", nameKey: "gam.you", isUser: true },
];

// ─── Component ────────────────────────────────────────────────────────────────

const USER_XP = 90;
const USER_LEVEL = LEVELS.find(l => USER_XP >= l.min && USER_XP < l.max) || LEVELS[0];
const XP_IN_LEVEL = USER_XP - USER_LEVEL.min;
const XP_TO_NEXT  = USER_LEVEL.max - USER_LEVEL.min;
const PROGRESS_PCT = Math.round((XP_IN_LEVEL / XP_TO_NEXT) * 100);

export default function GamificationPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"badges"|"missions"|"leaderboard">("badges");
  const [filter, setFilter] = useState("الكل");

  const categories = ["الكل", ...Array.from(new Set(BADGES.map(b => b.category)))];
  const filteredBadges = filter === "الكل" ? BADGES : BADGES.filter(b => b.category === filter);
  const earnedCount = BADGES.filter(b => b.earned).length;

  // Map category id → display key (id remains the comparison/lookup value)
  const categoryKeyMap: Record<string, string> = { "الكل": "gam.catAll" };
  for (const b of BADGES) categoryKeyMap[b.category] = b.categoryKey;

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-surface border-b border-line sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">مسارك</span>
          </Link>
          <Link href="/dashboard" className="text-text-sub text-sm hover:text-primary">← {t('gam.backDashboard')}</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Hero — Level Card */}
        <div className="bg-gradient-to-br from-primary to-[#1e4080] rounded-2xl p-6 md:p-8 mb-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar + Level */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl"
                  style={{ background: USER_LEVEL.color + "33", border: `3px solid ${USER_LEVEL.color}` }}>
                  {USER_LEVEL.emoji}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-accent text-white text-xs font-extrabold rounded-full w-7 h-7 flex items-center justify-center">
                  {USER_LEVEL.level}
                </div>
              </div>
              <div>
                <p className="text-white/70 text-sm">{t('gam.currentLevel')}</p>
                <h2 className="text-2xl font-extrabold">{t(USER_LEVEL.titleKey as TranslationKey)}</h2>
                <p className="text-white/80 text-sm mt-0.5">{USER_XP} {t('gam.xpPoint')}</p>
              </div>
            </div>

            {/* XP Progress */}
            <div className="flex-1">
              <div className="flex justify-between text-sm text-white/80 mb-2">
                <span>{t('gam.progressToLevel')} {USER_LEVEL.level + 1}</span>
                <span>{XP_IN_LEVEL} / {XP_TO_NEXT} XP</span>
              </div>
              <div className="bg-surface/20 rounded-full h-4 overflow-hidden">
                <div className="h-4 rounded-full transition-all duration-700"
                  style={{ width: `${PROGRESS_PCT}%`, background: USER_LEVEL.color }}>
                </div>
              </div>
              <p className="text-white/60 text-xs mt-2">
                {t('gam.youNeed')} {XP_TO_NEXT - XP_IN_LEVEL} XP {t('gam.toReach')} "{LEVELS[USER_LEVEL.level]?.titleKey ? t(LEVELS[USER_LEVEL.level].titleKey as TranslationKey) : ""}"
              </p>
            </div>

            {/* Stats */}
            <div className="flex md:flex-col gap-4 md:gap-2 md:text-right">
              <div className="bg-surface/15 rounded-xl px-4 py-2 text-center">
                <div className="text-xl font-extrabold text-accent">{earnedCount}</div>
                <div className="text-white/70 text-xs">{t('gam.badgeEarned')}</div>
              </div>
              <div className="bg-surface/15 rounded-xl px-4 py-2 text-center">
                <div className="text-xl font-extrabold text-accent">#6</div>
                <div className="text-white/70 text-xs">{t('gam.yourRank')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Level Road */}
        <div className="card mb-6">
          <h3 className="font-bold text-primary mb-4">🗺️ {t('gam.levelMap')}</h3>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {LEVELS.map((l, i) => (
              <div key={l.level} className="flex items-center gap-1 flex-shrink-0">
                <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all ${
                  l.level === USER_LEVEL.level
                    ? "border-primary bg-primary/5 scale-110 shadow-md"
                    : l.level < USER_LEVEL.level
                    ? "border-line bg-bg-soft opacity-60"
                    : "border-dashed border-line opacity-40"
                }`}>
                  <span className="text-xl">{l.emoji}</span>
                  <span className="text-xs font-bold text-primary">{l.level}</span>
                  <span className="text-xs text-text-sub whitespace-nowrap">{t(l.titleKey as TranslationKey)}</span>
                </div>
                {i < LEVELS.length - 1 && (
                  <div className={`w-6 h-0.5 flex-shrink-0 ${l.level < USER_LEVEL.level ? "bg-primary" : "bg-bg-soft"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto">
          {[
            { id: "badges",      label: t('gam.tabBadges'),      emoji: "🏅", count: `${earnedCount}/${BADGES.length}` },
            { id: "missions",    label: t('gam.tabMissions'),    emoji: "🎯", count: MISSIONS.filter(m => !m.done).length },
            { id: "leaderboard", label: t('gam.tabLeaderboard'), emoji: "🏆", count: LEADERBOARD.length },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all border-2 ${
                activeTab === t.id
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-surface text-text-sub border-line hover:border-primary hover:text-primary"
              }`}>
              <span>{t.emoji}</span>
              <span>{t.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeTab === t.id ? "bg-surface/20 text-white" : "bg-bg-soft text-text-sub"
              }`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ── BADGES ── */}
        {activeTab === "badges" && (
          <>
            {/* Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {categories.map(c => (
                <button key={c} onClick={() => setFilter(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 whitespace-nowrap transition-all ${
                    filter === c ? "bg-accent text-white border-accent" : "bg-surface border-line text-text-sub hover:border-accent"
                  }`}>{t((categoryKeyMap[c] ?? "gam.catAll") as TranslationKey)}</button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBadges.map(b => (
                <div key={b.id}
                  className={`card text-center transition-all hover:shadow-md ${
                    b.earned ? "border-2 border-accent/30 bg-gradient-to-b from-white to-amber-50/30" : "opacity-50 grayscale"
                  }`}>
                  <div className="text-4xl mb-2">{b.emoji}</div>
                  <div className="font-bold text-primary text-sm mb-1">{t(b.titleKey as TranslationKey)}</div>
                  <div className="text-text-sub text-xs mb-3 leading-relaxed">{t(b.descKey as TranslationKey)}</div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                    b.earned ? "bg-accent/10 text-accent" : "bg-bg-soft text-ink-subtle"
                  }`}>
                    {b.earned ? "✅" : "🔒"} +{b.xp} XP
                  </div>
                  {b.earned && (
                    <div className="text-xs text-green-600 font-semibold mt-2">{t('gam.earned')} ✓</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── MISSIONS ── */}
        {activeTab === "missions" && (
          <div className="space-y-4">
            <p className="text-sm text-text-sub mb-2">{t('gam.missionsSub')}</p>
            {MISSIONS.map(m => {
              const pct = Math.round((m.progress / m.total) * 100);
              return (
                <div key={m.id} className={`card hover:shadow-md transition-all ${m.done ? "opacity-60" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {m.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-primary text-sm">{t(m.titleKey as TranslationKey)}</h4>
                        <span className="text-accent font-bold text-sm whitespace-nowrap mr-2">+{m.xp} XP</span>
                      </div>
                      <div className="bg-bg-soft rounded-full h-2 mb-1">
                        <div className="bg-accent rounded-full h-2 transition-all"
                          style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-text-sub">
                        <span>{m.progress} / {m.total}</span>
                        <span>{pct}%</span>
                      </div>
                    </div>
                    <Link href={m.href}
                      className={`btn-primary text-xs px-4 py-2 rounded-xl whitespace-nowrap flex-shrink-0 ${m.done ? "opacity-50 pointer-events-none" : ""}`}>
                      {m.done ? `✅ ${t('gam.doneShort')}` : `${t('gam.start')} ←`}
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* XP Guide */}
            <div className="card bg-blue-50 border-2 border-blue-100 mt-2">
              <h4 className="font-bold text-primary mb-3">💡 {t('gam.howToEarn')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  ["gam.earnCreateAccount","10 XP"],["gam.earnCompleteProfile","50 XP"],["Career DNA Test","100 XP"],
                  ["gam.earnApplyScholarship","80 XP"],["gam.earnExploreUni","10 XP"],["gam.earnDailyLogin","5 XP"],
                ].map(([actKey, pts]) => (
                  <div key={actKey} className="bg-surface rounded-lg p-2 text-center">
                    <div className="font-bold text-accent text-sm">{pts}</div>
                    <div className="text-text-sub text-xs">{actKey === "Career DNA Test" ? actKey : t(actKey as TranslationKey)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LEADERBOARD ── */}
        {activeTab === "leaderboard" && (
          <div className="space-y-3">
            <p className="text-sm text-text-sub mb-4">{t('gam.leaderboardSub')}</p>

            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-4 mb-6">
              {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((u, i) => {
                const heights = ["h-24", "h-32", "h-20"];
                const colors  = ["bg-gray-300", "bg-accent", "bg-amber-600"];
                const medals  = ["🥈", "🥇", "🥉"];
                return (
                  <div key={u.rank} className="flex flex-col items-center gap-2">
                    <div className="text-2xl">{medals[i]}</div>
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-extrabold">
                      {u.avatar}
                    </div>
                    <div className="text-xs font-bold text-primary text-center">{"nameKey" in u && u.nameKey ? t(u.nameKey as TranslationKey) : u.name}</div>
                    <div className="text-xs text-accent font-bold">{u.xp} XP</div>
                    <div className={`w-20 ${heights[i]} ${colors[i]} rounded-t-xl flex items-center justify-center text-white font-extrabold`}>
                      #{[2,1,3][i]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full List */}
            {LEADERBOARD.map(u => (
              <div key={u.rank}
                className={`card flex items-center gap-4 hover:shadow-md transition-all ${
                  u.isUser ? "border-2 border-primary bg-primary/5" : ""
                }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
                  u.rank === 1 ? "bg-accent text-white" :
                  u.rank === 2 ? "bg-gray-300 text-ink-muted" :
                  u.rank === 3 ? "bg-amber-600 text-white" :
                  "bg-bg-soft text-text-sub"
                }`}>{u.rank}</div>

                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-extrabold flex-shrink-0">
                  {u.avatar}
                </div>

                <div className="flex-1">
                  <div className="font-bold text-primary text-sm flex items-center gap-2">
                    {"nameKey" in u && u.nameKey ? t(u.nameKey as TranslationKey) : u.name}
                    {u.isUser && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">{t('gam.you')}</span>}
                  </div>
                  <div className="text-text-sub text-xs">{t(u.levelKey as TranslationKey)} {u.levelEmoji}</div>
                </div>

                <div className="text-accent font-extrabold text-sm">{u.xp.toLocaleString()} XP</div>
                {u.badge && <div className="text-xl">{u.badge}</div>}
              </div>
            ))}

            <div className="card bg-amber-50 border-2 border-amber-200 text-center mt-2">
              <p className="text-amber-800 text-sm">
                💪 {t('gam.rankCalloutPre')} <strong>#6</strong>. {t('gam.rankCalloutPost')}
              </p>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="card mt-8 bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/10 text-center py-8">
          <h3 className="font-bold text-primary text-xl mb-2">🚀 {t('gam.ctaTitle')}</h3>
          <p className="text-text-sub mb-5">{t('gam.ctaSub')}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/career-dna" className="btn-primary px-6 py-3 rounded-xl">
              🧬 {t('gam.ctaStartDna')}
            </Link>
            <Link href="/profile/edit" className="border-2 border-primary text-primary font-bold px-6 py-3 rounded-xl hover:bg-light transition-colors">
              ✏️ {t('gam.ctaCompleteProfile')}
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
