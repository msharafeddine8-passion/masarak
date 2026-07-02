"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useStudentContext } from "@/context/StudentContext";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { fetchMyOrgs } from "@/lib/org";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { computeProfileCompletion, COMPLETION_SELECT } from "@/lib/profile-completion";

type User = { email: string; user_metadata: { full_name?: string; role?: string } };

type Urgent = { id: number; name: string; days: number; href: string; color: string };

// Parse Arabic-month deadline strings → days until that date.
function daysFromDeadline(deadlineStr: string | null | undefined): number | null {
  if (!deadlineStr) return null;
  const months: Record<string, number> = {
    'يناير':1,'فبراير':2,'مارس':3,'أبريل':4,'مايو':5,'يونيو':6,
    'يوليو':7,'أغسطس':8,'سبتمبر':9,'أكتوبر':10,'نوفمبر':11,'ديسمبر':12,
  };
  const parts = String(deadlineStr).trim().split(' ');
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const month = months[parts[1]];
  const year = parseInt(parts[2]);
  if (!day || !month || !year) return null;
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0,0,0,0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

type Quick = { emoji: string; tKey: TranslationKey; dKey: TranslationKey; href: string; color: string };
const QUICK: Quick[] = [
  { emoji: "🎯",  tKey: "dash.q.dna.t",    dKey: "dash.q.dna.d",    href: "/career-dna",         color: "border-yellow-400 bg-yellow-50" },
  { emoji: "🏛️", tKey: "dash.q.unis.t",   dKey: "dash.q.unis.d",   href: "/universities",       color: "border-blue-400 bg-blue-50"     },
  { emoji: "🏆",  tKey: "dash.q.schol.t",  dKey: "dash.q.schol.d",  href: "/scholarships",       color: "border-green-400 bg-green-50"   },
  { emoji: "📊",  tKey: "dash.q.skill.t",  dKey: "dash.q.skill.d",  href: "/tools/skill-gap",    color: "border-purple-400 bg-purple-50" },
  { emoji: "💼",  tKey: "dash.q.intern.t", dKey: "dash.q.intern.d", href: "/internships/hub",    color: "border-indigo-400 bg-indigo-50" },
  { emoji: "📄",  tKey: "dash.q.cv.t",     dKey: "dash.q.cv.d",     href: "/tools/cv-builder",   color: "border-pink-400 bg-pink-50"     },
  { emoji: "🤖",  tKey: "dash.q.ai.t",     dKey: "dash.q.ai.d",     href: "/tools/career-ai",    color: "border-cyan-400 bg-cyan-50"     },
  { emoji: "🗺️", tKey: "dash.q.career.t", dKey: "dash.q.career.d", href: "/careers",            color: "border-teal-400 bg-teal-50"     },
];

function ProgressRing({ pct, size = 80, color = "#2563eb" }: { pct: number; size?: number; color?: string }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} stroke="#e5e7eb" strokeWidth={10} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={10} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x={size/2} y={size/2} fill={color} fontSize={size * 0.2} fontWeight="bold"
        textAnchor="middle" dominantBaseline="middle" style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>
        {pct}%
      </text>
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { t, dir, locale } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const { profile, careerDNA, skillGap, savedUniversities, savedScholarships } = useStudentContext();
  const [urgent, setUrgent] = useState<Urgent[]>([]);
  const [profileCompletion, setProfileCompletion] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      // institution accounts don't use the student view
      const orgs = await fetchMyOrgs(data.user.id);
      if (orgs.length > 0) { router.replace("/org/dashboard"); return; }
      setUser(data.user as unknown as User);

      // Fetch student_profiles for accurate completion (canonical 13-field function)
      try {
        const { data: sp } = await supabase
          .from('student_profiles')
          .select(COMPLETION_SELECT)
          .eq('user_id', data.user.id)
          .maybeSingle();
        if (sp) {
          setProfileCompletion(computeProfileCompletion(sp));
        }
      } catch { /* silently fall back to legacy calc */ }

      setPageLoading(false);
    });
  }, [router]);

  // Live: pull scholarships with closest deadlines (top 3) for the urgent card
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('scholarships')
        .select('id, name, deadline')
        .eq('active', true)
        .limit(80);
      if (cancelled || !data) return;
      type Row = { id: number; name: string; deadline: string | null };
      const rows = (data as Row[])
        .map(r => ({ id: r.id, name: r.name, days: daysFromDeadline(r.deadline) }))
        .filter((r): r is { id: number; name: string; days: number } => r.days !== null && r.days >= 0)
        .sort((a, b) => a.days - b.days)
        .slice(0, 3)
        .map(r => ({
          id: r.id,
          name: r.name,
          days: r.days,
          href: '/scholarships',
          color: r.days <= 7
            ? 'text-red-600 bg-red-50 border-red-200'
            : r.days <= 21
              ? 'text-orange-600 bg-orange-50 border-orange-200'
              : 'text-amber-600 bg-amber-50 border-amber-200',
        }));
      setUrgent(rows);
    })();
    return () => { cancelled = true; };
  }, []);

  if (pageLoading) return (
    <div className="min-h-screen bg-bg pb-28 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-5">
        {/* Welcome card skeleton */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-500 rounded-2xl p-5 md:p-6 animate-pulse">
          <div className="h-4 bg-blue-400/50 rounded w-1/4 mb-2" />
          <div className="h-7 bg-blue-400/50 rounded w-2/3 mb-4" />
          <div className="h-14 bg-blue-400/30 rounded-xl w-48" />
        </div>
        {/* Top row skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
        {/* Urgent + quick actions skeletons */}
        <SkeletonCard lines={3} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      </div>
    </div>
  );

  const name = user?.user_metadata?.full_name?.split(" ")[0] || profile?.fullName?.split(" ")[0] || t('dash.fallback_greeting');

  // Use 13-field student_profiles completion when available (matches /profile page).
  // Fall back to context-based estimate while loading or if student_profiles row missing.
  // Use canonical DB-based completion; show 0 while loading (DB fetch is fast)
  const completion = profileCompletion ?? 0;

  return (
    <div dir={dir} className="min-h-screen bg-bg pb-28 md:pb-8 relative overflow-x-hidden">
      <div className="hidden md:block absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="hidden md:block absolute top-1/3 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-10 pointer-events-none" />

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-5 md:space-y-6">

        {/* Welcome + Progress */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-500 rounded-2xl p-5 md:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 order-2 sm:order-1">
              <p className="text-blue-100 text-sm mb-1">{t('dash.welcome_lead')}</p>
              <h1 className="text-xl md:text-3xl font-extrabold mb-2">{name}{t('dash.cta_subtitle')}</h1>
              {careerDNA?.primaryPath ? (
                <div className="bg-surface/15 rounded-xl p-3 mt-3 inline-block">
                  <p className="text-sm text-blue-100">{t('dash.dna.label')}</p>
                  <p className="font-extrabold text-lg">{careerDNA.primaryPath}</p>
                  {careerDNA.secondaryPath && <p className="text-blue-200 text-sm">{t('dash.dna.also')} {careerDNA.secondaryPath}</p>}
                </div>
              ) : (
                <Link href="/career-dna"
                  className="mt-2 inline-block bg-yellow-400 text-ink font-bold px-4 py-2 rounded-xl text-sm hover:bg-yellow-300">
                  {t('dash.dna.start_cta')}
                </Link>
              )}
            </div>
            <div className="flex flex-col items-center gap-1 order-1 sm:order-2">
              <ProgressRing pct={completion} size={72} color="#fbbf24" />
              <span className="text-blue-100 text-xs">{t('dash.completion')}</span>
            </div>
          </div>
        </div>

        {/* Quick Start — only for new users (completion < 40%) */}
        {completion < 40 && (
          <div className="bg-gradient-to-br from-mint-pale via-bg-mint to-mint-pale rounded-2xl p-5 md:p-6 border-2 border-primary/20 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🎯</span>
              <div>
                <h3 className="font-extrabold text-primary text-lg">{t('dash.v2.quickstart.title')}</h3>
                <p className="text-xs text-ink-muted">{t('dash.v2.quickstart.subtitle')}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { done: !!careerDNA?.primaryPath, href: '/career-dna', emoji: '🧬', title: t('dash.v2.quickstart.step1.title'), sub: t('dash.v2.quickstart.step1.sub'), xp: '+200 XP' },
                { done: savedUniversities.length >= 3, href: '/universities', emoji: '🏛️', title: t('dash.v2.quickstart.step2.title'), sub: t('dash.v2.quickstart.step2.sub'), xp: '+150 XP' },
                { done: savedScholarships.length >= 1, href: '/scholarships', emoji: '🏆', title: t('dash.v2.quickstart.step3.title'), sub: t('dash.v2.quickstart.step3.sub'), xp: '+100 XP' },
              ].map((step, i) => (
                <Link key={i} href={step.href}
                  className={`block rounded-xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                    step.done
                      ? 'bg-success-light/40 border-2 border-success/30'
                      : 'bg-surface border-2 border-primary/15 hover:border-primary'
                  }`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{step.emoji}</span>
                    {step.done ? (
                      <span className="text-xs bg-success text-white font-bold px-2 py-0.5 rounded-full">✓ {t('dash.v2.quickstart.done')}</span>
                    ) : (
                      <span className="text-[11px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">{step.xp}</span>
                    )}
                  </div>
                  <div className="font-extrabold text-ink text-sm mb-0.5">{step.title}</div>
                  <div className="text-xs text-ink-muted">{step.sub}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Career DNA */}
          <div className="bg-surface rounded-2xl border border-line p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧬</span>
              <h3 className="font-bold text-ink">{t('dash.card.dna')}</h3>
            </div>
            {careerDNA?.primaryPath ? (
              <>
                <p className="text-sm text-ink-subtle mb-2">{t('dash.card.dna.last')} {new Date(careerDNA.takenAt).toLocaleDateString(locale === 'ar' ? 'ar' : 'en-US')}</p>
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="font-extrabold text-blue-700 text-lg">{careerDNA.primaryPath}</p>
                  {careerDNA.secondaryPath && <p className="text-sm text-ink-subtle">{t('dash.card.dna.secondary')} {careerDNA.secondaryPath}</p>}
                </div>
                <Link href="/career-dna" className="mt-3 block text-center text-sm text-blue-600 hover:underline font-semibold">
                  {t('dash.card.dna.retake')}
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-ink-subtle mb-3">{t('dash.card.dna.not_done')}</p>
                <Link href="/career-dna"
                  className="block text-center bg-yellow-400 text-ink font-bold py-2 rounded-xl text-sm hover:bg-yellow-300">
                  {t('dash.card.dna.start')}
                </Link>
              </>
            )}
          </div>

          {/* Skill Gap */}
          <div className="bg-surface rounded-2xl border border-line p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📊</span>
              <h3 className="font-bold text-ink">{t('dash.card.skill')}</h3>
            </div>
            {skillGap?.role ? (
              <>
                <p className="text-sm text-ink-subtle mb-2">{t('dash.card.skill.for')} <strong>{skillGap.role}</strong></p>
                <div className="bg-bg-soft rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-bg-soft rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${skillGap.scorePercent}%` }} />
                    </div>
                    <span className="text-sm font-bold text-green-600">{skillGap.scorePercent}%</span>
                  </div>
                  {skillGap.gapSkills.length > 0 && (
                    <p className="text-xs text-orange-600 mt-1">{t('dash.card.skill.gap')} {skillGap.gapSkills.slice(0, 2).join(" • ")}</p>
                  )}
                </div>
                <Link href="/tools/skill-gap" className="mt-3 block text-center text-sm text-blue-600 hover:underline font-semibold">
                  {t('dash.card.skill.retake')}
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-ink-subtle mb-3">{t('dash.card.skill.discover')}</p>
                <Link href="/tools/skill-gap"
                  className="block text-center bg-purple-600 text-white font-bold py-2 rounded-xl text-sm hover:bg-purple-700">
                  {t('dash.card.skill.start')}
                </Link>
              </>
            )}
          </div>

          {/* Saved */}
          <div className="bg-surface rounded-2xl border border-line p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">❤️</span>
              <h3 className="font-bold text-ink">{t('dash.card.saved')}</h3>
            </div>
            <div className="space-y-2">
              <Link href="/universities"
                className="flex items-center justify-between p-2.5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <span className="text-sm font-semibold text-ink-muted">{t('dash.card.saved.unis')}</span>
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{savedUniversities.length}</span>
              </Link>
              <Link href="/scholarships"
                className="flex items-center justify-between p-2.5 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <span className="text-sm font-semibold text-ink-muted">{t('dash.card.saved.schol')}</span>
                <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{savedScholarships.length}</span>
              </Link>
              <Link href="/dashboard/interested"
                className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                <span className="text-sm font-semibold text-ink-muted">👁️ {t('dash.v2.interested.label')}</span>
                <span className="text-amber-600 text-xs font-bold">{t('dash.v2.interested.view')} ←</span>
              </Link>
            </div>
            {savedUniversities.length === 0 && savedScholarships.length === 0 && (
              <p className="text-xs text-ink-subtle mt-2 text-center">{t('dash.card.saved.empty')}</p>
            )}
          </div>
        </div>

        {/* Urgent Deadlines */}
        <div className="bg-surface rounded-2xl border border-line p-5 shadow-sm">
          <h3 className="font-bold text-ink mb-4 flex items-center gap-2">
            <span>⏰</span> {t('dash.urgent.title')}
          </h3>
          <div className="space-y-3">
            {urgent.length === 0 ? (
              <Link href="/scholarships" className="block text-center p-4 rounded-xl border border-dashed border-line text-sm text-ink-subtle hover:bg-bg-soft">
                {t('dash.urgent.empty') || t('dash.v2.urgent.empty.fallback')} ←
              </Link>
            ) : urgent.map((item) => (
              <Link key={item.id} href={item.href}
                className={`flex items-center justify-between p-3 rounded-xl border ${item.color} hover:opacity-80 transition-opacity gap-2`}>
                <span className="text-sm font-semibold flex-1 min-w-0 truncate">{item.name}</span>
                <span className="text-sm font-extrabold whitespace-nowrap">{item.days} {t('dash.urgent.days')}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="font-bold text-ink mb-4">{t('dash.actions.title')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK.map((a, i) => (
              <Link key={i} href={a.href}
                className={`flex flex-col gap-2 p-4 rounded-2xl border-2 ${a.color} hover:shadow-md transition-all group`}>
                <span className="text-2xl">{a.emoji}</span>
                <span className="font-bold text-ink text-sm group-hover:text-blue-700">{t(a.tKey)}</span>
                <span className="text-xs text-ink-subtle">{t(a.dKey)}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-5">
          <h3 className="font-bold text-ink mb-4">{t('dash.rec.title')}</h3>
          {careerDNA?.primaryPath ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link href="/universities" className="bg-surface rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs text-ink-subtle mb-1">{t('dash.rec.uni.label')}</p>
                <p className="font-bold text-ink">{t('dash.rec.uni.value')}</p>
                <p className="text-xs text-ink-subtle mt-1">{t('dash.rec.uni.note.1')} {careerDNA.primaryPath}</p>
              </Link>
              <Link href="/scholarships" className="bg-surface rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs text-ink-subtle mb-1">{t('dash.rec.schol.label')}</p>
                <p className="font-bold text-ink">{t('dash.rec.schol.value')}</p>
                <p className="text-xs text-ink-subtle mt-1">{t('dash.rec.schol.note')}</p>
              </Link>
              <Link href="/tools/career-ai" className="bg-surface rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs text-ink-subtle mb-1">{t('dash.rec.ai.label')}</p>
                <p className="font-bold text-ink">{t('dash.rec.ai.value')}</p>
                <p className="text-xs text-ink-subtle mt-1">{t('dash.rec.ai.note.1')} {careerDNA.primaryPath}</p>
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-ink-subtle text-sm mb-3">{t('dash.rec.empty')}</p>
              <Link href="/career-dna"
                className="inline-block bg-blue-600 text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-blue-700">
                {t('dash.rec.empty.cta')}
              </Link>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
