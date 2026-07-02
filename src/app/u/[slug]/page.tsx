/**
 * /u/[slug] — public Academic Profile (Social system · Phase 1)
 *
 * SSR. Data comes from the SECURITY DEFINER RPC get_public_academic_profile(),
 * which returns ONLY a safe projection (no email / phone / dob / gpa) and only
 * when the owner has set is_public = true. Missing / private → 404.
 *
 * Uses the light mint design system and is chrome-wrapped (SiteHeader shows),
 * unlike the standalone dark ID card at /student/[masarakId].
 */
import { cache } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { flagEmoji, badgeMeta, type PublicProfile } from '@/lib/social/profile';
import ProfileActions from './ProfileActions';

export const dynamic = 'force-dynamic';

type PageProps = { params: { slug: string } };

// Deduped per-request so generateMetadata + the page share one DB round-trip.
const getProfile = cache(async (slug: string): Promise<PublicProfile | null> => {
  const supabase = createServerComponentClient({ cookies });
  const { data, error } = await supabase.rpc('get_public_academic_profile', { p_slug: slug });
  if (error || !data) return null;
  return data as PublicProfile;
});

const LEVEL_EMOJI = ['🌱', '🌱', '🔍', '📚', '⭐', '🌟', '🚀', '👑'];
const levelEmoji = (lvl: number) => LEVEL_EMOJI[Math.min(Math.max(lvl, 1), 7)] ?? '🌱';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await getProfile(params.slug);
  if (!p) return { title: 'ملف غير متاح | مسارك' };
  const name = p.full_name || 'طالب';
  const desc = p.bio || [p.major, p.university_name || p.school_name].filter(Boolean).join(' · ') || 'ملف أكاديمي على منصة مسارك';
  return {
    title: `${name} | مسارك`,
    description: desc,
    openGraph: { title: `${name} | مسارك`, description: desc, siteName: 'مسارك', type: 'profile', images: p.avatar_url ? [p.avatar_url] : undefined },
    twitter: { card: 'summary', title: `${name} | مسارك`, description: desc },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const p = await getProfile(params.slug);
  if (!p) notFound();

  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = !!user && user.id === p.user_id;

  const name = p.full_name || 'طالب مسارك';
  const initial = name.charAt(0).toUpperCase();
  const memberSince = new Date(p.created_at).getFullYear();
  const location = [p.city, p.country_code ? `${flagEmoji(p.country_code)}` : null].filter(Boolean).join(' · ');

  const chips = (arr?: string[] | null) => (arr || []).filter(Boolean);
  const interests = chips(p.interests);
  const skills = chips(p.skills);
  const languages = chips(p.languages);
  const prefMajors = chips(p.preferred_majors);
  const prefUnis = chips(p.preferred_universities);
  const hasEducation = p.grade_level || p.school_name || p.university_name || p.major || p.graduation_year;

  return (
    <div dir="rtl" className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="bg-gradient-to-bl from-mint-light via-bg-mint to-bg border-b border-border-soft">
        <div className="max-w-4xl mx-auto px-4 pt-10 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Avatar */}
            {p.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={p.avatar_url} alt={name} className="w-28 h-28 rounded-3xl object-cover shadow-card ring-4 ring-surface" />
            ) : (
              <div className="w-28 h-28 rounded-3xl bg-gradient-mint-deep text-white flex items-center justify-center text-4xl font-extrabold shadow-card ring-4 ring-surface">
                {initial}
              </div>
            )}

            <div className="flex-1 text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold text-ink">{name}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface text-primary text-xs font-bold shadow-soft">
                  {levelEmoji(p.level)} المستوى {p.level}
                </span>
              </div>
              <div className="text-ink-muted text-sm mt-1">@{p.slug}</div>
              {location && <div className="text-ink-muted text-sm mt-1">{location}</div>}
              <div className="text-ink-subtle text-xs mt-1">عضو منذ {memberSince}</div>
            </div>

            <ProfileActions slug={p.slug} isOwner={isOwner} name={name} targetUserId={p.user_id} isLoggedIn={!!user} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 sm:max-w-md gap-3 mt-6 mx-auto sm:mx-0">
            <Stat value={p.xp.toLocaleString('en')} label="نقطة XP" icon="⚡" />
            <Stat value={String(p.streak_days)} label="يوم متواصل" icon="🔥" />
            <Stat value={String(p.badges.length)} label="شارة" icon="🎖️" />
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {p.bio && (
            <Card title="نبذة">
              <p className="text-ink-muted leading-relaxed whitespace-pre-line">{p.bio}</p>
            </Card>
          )}

          {hasEducation && (
            <Card title="🎓 التعليم">
              <dl className="space-y-2.5">
                {p.grade_level && <Row label="المرحلة" value={p.grade_level} />}
                {p.school_name && <Row label="المدرسة" value={p.school_name} />}
                {p.university_name && <Row label="الجامعة" value={p.university_name} />}
                {p.major && <Row label="التخصص" value={p.major} />}
                {p.graduation_year && <Row label="سنة التخرج" value={String(p.graduation_year)} />}
              </dl>
            </Card>
          )}

          {p.career_dna_completed && p.personality_type && (
            <Card title="🧬 الشخصية المهنية (Career DNA)">
              <span className="inline-block px-4 py-2 rounded-xl bg-mint-light text-primary font-bold">{p.personality_type}</span>
            </Card>
          )}

          {interests.length > 0 && (
            <Card title="🎯 الاهتمامات"><Chips items={interests} /></Card>
          )}
          {skills.length > 0 && (
            <Card title="💡 المهارات"><Chips items={skills} tone="accent" /></Card>
          )}
          {languages.length > 0 && (
            <Card title="🌐 اللغات"><Chips items={languages} /></Card>
          )}
        </div>

        {/* Aside */}
        <div className="space-y-6">
          {p.badges.length > 0 && (
            <Card title="🏅 الشارات">
              <div className="flex flex-wrap gap-2">
                {p.badges.map((b) => {
                  const m = badgeMeta(b);
                  return (
                    <span key={b} title={m.ar} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-mint text-ink text-sm font-semibold">
                      <span>{m.icon}</span><span>{m.ar}</span>
                    </span>
                  );
                })}
              </div>
            </Card>
          )}

          {(prefMajors.length > 0 || prefUnis.length > 0) && (
            <Card title="✨ الطموحات">
              {prefMajors.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-bold text-ink-subtle mb-1.5">تخصصات مهتم فيها</div>
                  <Chips items={prefMajors} />
                </div>
              )}
              {prefUnis.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-ink-subtle mb-1.5">جامعات مستهدفة</div>
                  <Chips items={prefUnis} tone="accent" />
                </div>
              )}
            </Card>
          )}

          {p.social_links && Object.values(p.social_links).some(Boolean) && (
            <Card title="🔗 روابط">
              <div className="flex flex-col gap-2">
                {Object.entries(p.social_links).filter(([, v]) => v).map(([k, v]) => (
                  <a key={k} href={v} target="_blank" rel="noopener noreferrer nofollow" className="text-accent hover:underline text-sm truncate" dir="ltr">{v}</a>
                ))}
              </div>
            </Card>
          )}

          {/* Join CTA for logged-out visitors */}
          {!user && (
            <div className="rounded-2xl p-5 bg-primary text-white text-center shadow-card">
              <p className="font-bold mb-1">اصنع ملفك الأكاديمي</p>
              <p className="text-white/80 text-sm mb-3">انضم لمسارك مجاناً وابنِ حضورك المهني.</p>
              <Link href="/auth/register?role=student" className="block w-full py-2.5 rounded-xl bg-white text-primary font-bold text-sm hover:opacity-90 transition">ابدأ مجاناً ←</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── small presentational helpers ──────────────────────────────────────────────
function Stat({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="bg-surface rounded-2xl px-3 py-3 text-center shadow-soft border border-border-soft">
      <div className="text-lg font-extrabold text-ink">{icon} {value}</div>
      <div className="text-[11px] text-ink-muted mt-0.5">{label}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface rounded-2xl p-5 shadow-soft border border-border-soft">
      <h2 className="font-bold text-ink mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-sm text-ink-subtle shrink-0">{label}</dt>
      <dd className="text-sm font-semibold text-ink text-left">{value}</dd>
    </div>
  );
}

function Chips({ items, tone = 'mint' }: { items: string[]; tone?: 'mint' | 'accent' }) {
  const cls = tone === 'accent' ? 'bg-accent-light text-accent' : 'bg-mint-light text-primary';
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it, i) => (
        <span key={`${it}-${i}`} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${cls}`}>{it}</span>
      ))}
    </div>
  );
}
