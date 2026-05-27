"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useStudentContext } from "@/context/StudentContext";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { fetchMyOrgs } from "@/lib/org";

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

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      // institution accounts don't use the student view
      const orgs = await fetchMyOrgs(data.user.id);
      if (orgs.length > 0) { router.replace("/org/dashboard"); return; }
      setUser(data.user as unknown as User);
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

  async function handleLogout() {
    await supabase.auth.signOut();
    try { localStorage.removeItem("masarak_ctx"); } catch {}
    router.push("/");
  }

  if (pageLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-mint">
      <div className="text-center">
        <div className="text-6xl animate-bounce-soft mb-3">🎯</div>
        <p className="text-ink-muted">{t('dash.loading')}</p>
      </div>
    </div>
  );

  const name = user?.user_metadata?.full_name?.split(" ")[0] || profile?.fullName?.split(" ")[0] || t('dash.fallback_greeting');

  let completion = 10;
  if (profile?.grade) completion += 15;
  if (profile?.school) completion += 10;
  if (profile?.region) completion += 10;
  if (profile?.interests?.length) completion += 10;
  if (careerDNA?.primaryPath) completion += 20;
  if (skillGap?.role) completion += 15;
  if (savedUniversities.length > 0) completion += 5;
  if (savedScholarships.length > 0) completion += 5;
  completion = Math.min(completion, 100);

  return (
    <div dir={dir} className="min-h-screen bg-bg pb-24 relative">
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-10 pointer-events-none" />

      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-blue-600 font-extrabold text-lg">مسارك</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
            <Link href="/profile/edit" className="text-sm text-blue-600 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-semibold">
              {t('dash.edit_btn')}
            </Link>
            <button onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors border border-gray-200 px-3 py-1.5 rounded-lg">
              {t('dash.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Welcome + Progress */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-500 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <p className="text-blue-100 text-sm mb-1">{t('dash.welcome_lead')}</p>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{name}{t('dash.cta_subtitle')}</h1>
              {careerDNA?.primaryPath ? (
                <div className="bg-white/15 rounded-xl p-3 mt-3 inline-block">
                  <p className="text-sm text-blue-100">{t('dash.dna.label')}</p>
                  <p className="font-extrabold text-lg">{careerDNA.primaryPath}</p>
                  {careerDNA.secondaryPath && <p className="text-blue-200 text-sm">{t('dash.dna.also')} {careerDNA.secondaryPath}</p>}
                </div>
              ) : (
                <Link href="/career-dna"
                  className="mt-2 inline-block bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-yellow-300">
                  {t('dash.dna.start_cta')}
                </Link>
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <ProgressRing pct={completion} size={90} color="#fbbf24" />
              <span className="text-blue-100 text-xs">{t('dash.completion')}</span>
            </div>
          </div>
        </div>

        {/* Quick Start — only for new users (completion < 40%) */}
        {completion < 40 && (
          <div className="bg-gradient-to-br from-mint-pale via-bg-mint to-mint-pale rounded-2xl p-6 border-2 border-primary/20 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🎯</span>
              <div>
                <h3 className="font-extrabold text-primary text-lg">ابدأ بهالـ 3 خطوات</h3>
                <p className="text-xs text-ink-muted">اعملن وبتصير جاهز تستفيد من المنصة فعلياً</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { done: !!careerDNA?.primaryPath, href: '/career-dna', emoji: '🧬', title: 'اكتشف Career DNA', sub: '5 دقايق · 30 سؤال', xp: '+200 XP' },
                { done: savedUniversities.length >= 3, href: '/universities', emoji: '🏛️', title: 'احفظ 3 جامعات تهمّك', sub: '35 جامعة لبنانية', xp: '+150 XP' },
                { done: savedScholarships.length >= 1, href: '/scholarships', emoji: '🏆', title: 'احفظ منحة بتناسبك', sub: '60+ منحة محلية ودولية', xp: '+100 XP' },
              ].map((step, i) => (
                <Link key={i} href={step.href}
                  className={`block rounded-xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                    step.done
                      ? 'bg-success-light/40 border-2 border-success/30'
                      : 'bg-white border-2 border-primary/15 hover:border-primary'
                  }`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{step.emoji}</span>
                    {step.done ? (
                      <span className="text-xs bg-success text-white font-bold px-2 py-0.5 rounded-full">✓ تمّ</span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">{step.xp}</span>
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
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧬</span>
              <h3 className="font-bold text-gray-800">{t('dash.card.dna')}</h3>
            </div>
            {careerDNA?.primaryPath ? (
              <>
                <p className="text-sm text-gray-500 mb-2">{t('dash.card.dna.last')} {new Date(careerDNA.takenAt).toLocaleDateString(locale === 'ar' ? 'ar' : 'en-US')}</p>
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="font-extrabold text-blue-700 text-lg">{careerDNA.primaryPath}</p>
                  {careerDNA.secondaryPath && <p className="text-sm text-gray-500">{t('dash.card.dna.secondary')} {careerDNA.secondaryPath}</p>}
                </div>
                <Link href="/career-dna" className="mt-3 block text-center text-sm text-blue-600 hover:underline font-semibold">
                  {t('dash.card.dna.retake')}
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-3">{t('dash.card.dna.not_done')}</p>
                <Link href="/career-dna"
                  className="block text-center bg-yellow-400 text-gray-900 font-bold py-2 rounded-xl text-sm hover:bg-yellow-300">
                  {t('dash.card.dna.start')}
                </Link>
              </>
            )}
          </div>

          {/* Skill Gap */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📊</span>
              <h3 className="font-bold text-gray-800">{t('dash.card.skill')}</h3>
            </div>
            {skillGap?.role ? (
              <>
                <p className="text-sm text-gray-500 mb-2">{t('dash.card.skill.for')} <strong>{skillGap.role}</strong></p>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
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
                <p className="text-sm text-gray-500 mb-3">{t('dash.card.skill.discover')}</p>
                <Link href="/tools/skill-gap"
                  className="block text-center bg-purple-600 text-white font-bold py-2 rounded-xl text-sm hover:bg-purple-700">
                  {t('dash.card.skill.start')}
                </Link>
              </>
            )}
          </div>

          {/* Saved */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">❤️</span>
              <h3 className="font-bold text-gray-800">{t('dash.card.saved')}</h3>
            </div>
            <div className="space-y-2">
              <Link href="/universities"
                className="flex items-center justify-between p-2.5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <span className="text-sm font-semibold text-gray-700">{t('dash.card.saved.unis')}</span>
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{savedUniversities.length}</span>
              </Link>
              <Link href="/scholarships"
                className="flex items-center justify-between p-2.5 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <span className="text-sm font-semibold text-gray-700">{t('dash.card.saved.schol')}</span>
                <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{savedScholarships.length}</span>
              </Link>
            </div>
            {savedUniversities.length === 0 && savedScholarships.length === 0 && (
              <p className="text-xs text-gray-400 mt-2 text-center">{t('dash.card.saved.empty')}</p>
            )}
          </div>
        </div>

        {/* Urgent Deadlines */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>⏰</span> {t('dash.urgent.title')}
          </h3>
          <div className="space-y-3">
            {urgent.length === 0 ? (
              <Link href="/scholarships" className="block text-center p-4 rounded-xl border border-dashed border-gray-200 text-sm text-gray-500 hover:bg-gray-50">
                {t('dash.urgent.empty') || 'تصفّح المنح المتاحة'} ←
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
          <h3 className="font-bold text-gray-800 mb-4">{t('dash.actions.title')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK.map((a, i) => (
              <Link key={i} href={a.href}
                className={`flex flex-col gap-2 p-4 rounded-2xl border-2 ${a.color} hover:shadow-md transition-all group`}>
                <span className="text-2xl">{a.emoji}</span>
                <span className="font-bold text-gray-800 text-sm group-hover:text-blue-700">{t(a.tKey)}</span>
                <span className="text-xs text-gray-500">{t(a.dKey)}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4">{t('dash.rec.title')}</h3>
          {careerDNA?.primaryPath ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link href="/universities" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs text-gray-400 mb-1">{t('dash.rec.uni.label')}</p>
                <p className="font-bold text-gray-800">{t('dash.rec.uni.value')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('dash.rec.uni.note.1')} {careerDNA.primaryPath}</p>
              </Link>
              <Link href="/scholarships" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs text-gray-400 mb-1">{t('dash.rec.schol.label')}</p>
                <p className="font-bold text-gray-800">{t('dash.rec.schol.value')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('dash.rec.schol.note')}</p>
              </Link>
              <Link href="/tools/career-ai" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs text-gray-400 mb-1">{t('dash.rec.ai.label')}</p>
                <p className="font-bold text-gray-800">{t('dash.rec.ai.value')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('dash.rec.ai.note.1')} {careerDNA.primaryPath}</p>
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-3">{t('dash.rec.empty')}</p>
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
