/**
 * /v/[id] — Public card verification page
 *
 * Accessible without login. Shows minimal card info to verify authenticity.
 * Requires is_public = true on the card.
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';

interface PageProps {
  params: { id: string };
}

const LEVEL_AR: Record<string, string> = {
  secondary:  'ثانوي',
  university: 'جامعي',
  graduate:   'دراسات عليا',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies });
  const { data: card } = await supabase
    .from('student_cards')
    .select('display_name_ar, masarak_id, is_public')
    .eq('masarak_id', params.id)
    .maybeSingle();

  if (!card?.is_public) {
    return { title: 'بطاقة غير موجودة | مسارك', robots: { index: false } };
  }

  return {
    title: `${card.display_name_ar || 'طالب'} — التحقق من الهوية | مسارك`,
    description: `تحقق من بطاقة مسارك رقم ${card.masarak_id}`,
    robots: { index: false }, // verification pages shouldn't be indexed
  };
}

export default async function VerifyPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies });

  // Fetch card + profile in one join
  const { data: card } = await supabase
    .from('student_cards')
    .select(`
      masarak_id,
      display_name_ar,
      display_name_en,
      study_level,
      is_public,
      created_at,
      student_profiles!inner (
        full_name,
        avatar_url,
        country
      )
    `)
    .eq('masarak_id', params.id)
    .eq('is_public', true)
    .maybeSingle();

  if (!card) {
    notFound();
  }

  // Compute expiry (1 year from creation)
  const createdAt = new Date(card.created_at);
  const expiryDate = new Date(createdAt);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  const isValid = expiryDate > new Date();

  const profile = Array.isArray(card.student_profiles)
    ? card.student_profiles[0]
    : card.student_profiles as { full_name?: string; avatar_url?: string; country?: string } | null;

  const name = card.display_name_ar || profile?.full_name || 'طالب';
  const level = LEVEL_AR[card.study_level || ''] || '';

  const fmt = (d: Date) =>
    d.toLocaleDateString('ar-LB', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-sm bg-surface rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-950 px-6 py-5 text-center">
          <div className="text-white/70 text-xs tracking-widest uppercase mb-1">Masarak</div>
          <div className="text-white font-bold text-lg">التحقق من بطاقة الطالب</div>
        </div>

        {/* Status badge */}
        <div className={`flex items-center justify-center gap-2 py-3 text-sm font-bold ${
          isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <span className="text-lg">{isValid ? '✅' : '❌'}</span>
          <span>{isValid ? 'البطاقة سارية المفعول' : 'البطاقة منتهية الصلاحية'}</span>
        </div>

        {/* Card body */}
        <div className="px-6 py-6 space-y-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 overflow-hidden flex-shrink-0 border-2 border-blue-200">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  👤
                </div>
              )}
            </div>
            <div>
              <div className="text-xl font-bold text-blue-950">{name}</div>
              {card.display_name_en && (
                <div className="text-sm text-ink-subtle font-medium">{card.display_name_en}</div>
              )}
              {level && <div className="text-sm text-blue-600 mt-0.5">{level}</div>}
            </div>
          </div>

          {/* Details */}
          <div className="rounded-2xl bg-bg-soft divide-y divide-line">
            <Row label="رقم الهوية" value={card.masarak_id} mono />
            <Row label="الجهة المُصدِرة" value="منصة مسارك" />
            <Row label="تاريخ الإصدار" value={fmt(createdAt)} />
            <Row label="تاريخ الانتهاء" value={fmt(expiryDate)} />
          </div>

          {/* Masarak branding */}
          <div className="text-center pt-2">
            <div className="text-xs text-ink-subtle">تم التحقق عبر</div>
            <a
              href="https://masaraklb.com"
              className="text-blue-700 font-bold text-sm hover:underline"
            >
              masaraklb.com
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="text-ink-subtle">{label}</span>
      <span className={`font-bold text-ink ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
