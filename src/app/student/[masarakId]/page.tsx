/**
 * /student/[masarakId] — صفحة الهوية العامة للطالب
 *
 * SSR — تُجلب البيانات من Supabase عبر RPC get_public_student_profile()
 * تظهر فقط إذا كانت is_public = TRUE
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import MasarakIDCard from '@/components/id-card/MasarakIDCard';
import type { StudentCard, CardProfile } from '@/components/id-card/MasarakIDCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Section {
  id: number;
  section_type: string;
  title: string;
  subtitle?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  description?: string | null;
}

interface PublicProfileData {
  card: StudentCard & { is_public: boolean };
  profile: {
    avatar_url?: string | null;
    country?: string | null;
    career_dna_result?: string | null;
    full_name?: string | null;
  } | null;
  sections: Section[];
}

type PageProps = { params: { masarakId: string } };

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `${params.masarakId} | مسارك`,
    description: 'الهوية الرقمية الأكاديمية على منصة مسارك',
    openGraph: {
      title: `${params.masarakId} | مسارك`,
      description: 'الهوية الرقمية الأكاديمية على منصة مسارك',
      siteName: 'مسارك',
    },
  };
}

// ─── Section labels ────────────────────────────────────────────────────────────

const SECTION_META: Record<string, { icon: string; label: string }> = {
  education:   { icon: '🎓', label: 'التعليم' },
  certificate: { icon: '📜', label: 'الشهادات والدورات' },
  achievement: { icon: '🏆', label: 'الإنجازات' },
  skill:       { icon: '💡', label: 'المهارات' },
  language:    { icon: '🌐', label: 'اللغات' },
  volunteer:   { icon: '❤️', label: 'التطوع والنشاط' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StudentPublicPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies });

  // Use the SECURITY DEFINER RPC — safe, validates is_public server-side
  const { data: raw, error } = await supabase
    .rpc('get_public_student_profile', { p_masarak_id: params.masarakId });

  if (error || !raw) notFound();

  const { card, profile, sections } = raw as PublicProfileData;

  const cardProfile: CardProfile = {
    avatar_url:        profile?.avatar_url        ?? null,
    country:           profile?.country            ?? null,
    career_dna_result: profile?.career_dna_result  ?? null,
    full_name:         profile?.full_name          ?? null,
  };

  const displayName = card.display_name_ar || profile?.full_name || params.masarakId;

  return (
    <div
      dir="rtl"
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F2340 100%)' }}
    >
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/70 hover:text-white transition text-sm"
        >
          <span
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: '#0F4A52',
              border: '1px solid rgba(212,175,55,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}
          >م</span>
          <span className="font-bold tracking-wide">مسارك</span>
        </Link>

        <Link
          href="/auth/register"
          className="text-xs px-4 py-1.5 rounded-full font-bold transition"
          style={{ background: '#D4AF37', color: '#0F172A' }}
        >
          انضم مجاناً
        </Link>
      </header>

      {/* ── Card ── */}
      <section className="flex flex-col items-center px-4 pt-6 pb-10">
        <p className="text-white/40 text-xs mb-4 tracking-widest uppercase">
          Masarak Digital ID
        </p>
        <div className="overflow-x-auto max-w-full pb-2 flex justify-center">
          <MasarakIDCard
            card={card}
            profile={cardProfile}
            forExport={false}
          />
        </div>
      </section>

      {/* ── Sections ── */}
      {sections && sections.length > 0 && (
        <section className="max-w-2xl mx-auto px-4 pb-12 space-y-4">
          <h2 className="text-white/60 text-sm font-semibold mb-6 flex items-center gap-2">
            <span className="h-px flex-1 bg-surface/10" />
            ملف {displayName}
            <span className="h-px flex-1 bg-surface/10" />
          </h2>

          {sections.map((s) => {
            const meta = SECTION_META[s.section_type] || { icon: '📋', label: s.section_type };
            return (
              <div
                key={s.id}
                className="rounded-2xl p-5"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{meta.icon}</span>
                  <span className="text-xs text-white/40 font-semibold uppercase tracking-wide">
                    {meta.label}
                  </span>
                </div>
                <div className="text-white font-bold text-base">{s.title}</div>
                {s.subtitle && (
                  <div className="text-white/70 text-sm mt-0.5">{s.subtitle}</div>
                )}
                {(s.date_from || s.date_to) && (
                  <div className="text-white/40 text-xs mt-1">
                    {[s.date_from, s.date_to].filter(Boolean).join(' — ')}
                  </div>
                )}
                {s.description && (
                  <p className="text-white/70 text-sm mt-2 leading-relaxed">{s.description}</p>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* ── CTA ── */}
      <footer className="text-center pb-20 px-4">
        <div
          className="inline-block rounded-3xl px-8 py-6 max-w-sm w-full"
          style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          <p className="text-[#D4AF37] font-bold text-base mb-1">هل تريد هويتك الرقمية؟</p>
          <p className="text-white/50 text-sm mb-5">
            انضم إلى مسارك وأنشئ بطاقتك الأكاديمية الخاصة مجاناً
          </p>
          <Link
            href="/auth/register"
            className="block w-full py-3 rounded-2xl font-bold text-sm transition hover:opacity-90"
            style={{ background: '#D4AF37', color: '#0F172A' }}
          >
            إنشاء حساب مجاناً
          </Link>
        </div>

        <p className="text-white/20 text-xs mt-8">
          masaraklb.com — منصة التوجيه الأكاديمي
        </p>
      </footer>
    </div>
  );
}
