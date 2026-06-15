'use client';
/**
 * MasarakIDCard — بطاقة الهوية الرقمية لمسارك
 *
 * المعايير:
 * - نسبة 1.586:1 (بطاقة ائتمان standard)
 * - RTL كامل
 * - ثيم كلاسيك: navy #0F172A + ذهبي #D4AF37
 * - ثيم مودرن: أبيض + teal  (Phase B)
 * - forExport=true: يزيل الـ shadows والـ transforms للـ html2canvas
 */

import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardProfile {
  avatar_url?: string | null;
  country?: string | null;
  career_dna_result?: string | null;   // نتيجة DNA إذا أكملها
  full_name?: string | null;           // fallback اسم
}

export interface StudentCard {
  masarak_id: string;
  display_name_ar?: string | null;
  display_name_en?: string | null;
  birth_year?: number | null;
  study_level?: 'secondary' | 'university' | 'graduate' | null;
  card_theme?: 'classic' | 'modern';
  created_at: string;
}

interface MasarakIDCardProps {
  card: StudentCard;
  profile: CardProfile;
  forExport?: boolean;    // true → يزيل shadows/transforms للـ canvas
  className?: string;
}

// ─── Label Maps ───────────────────────────────────────────────────────────────

const LEVEL_AR: Record<string, string> = {
  secondary:  'ثانوي',
  university: 'جامعي',
  graduate:   'خريج',
};

const COUNTRY_AR: Record<string, string> = {
  LB: 'لبنان',
  SA: 'السعودية',
  AE: 'الإمارات',
  JO: 'الأردن',
  EG: 'مصر',
  KW: 'الكويت',
  QA: 'قطر',
  BH: 'البحرين',
  OM: 'عُمان',
  IQ: 'العراق',
  SY: 'سوريا',
  MA: 'المغرب',
  DZ: 'الجزائر',
  TN: 'تونس',
  LY: 'ليبيا',
  SD: 'السودان',
  YE: 'اليمن',
  PS: 'فلسطين',
};

function formatJoinYear(iso: string): string {
  return new Date(iso).getFullYear().toString();
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ url, name }: { url?: string | null; name: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('');

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        crossOrigin="anonymous"
        className="w-full h-full object-cover rounded-full"
        style={{ display: 'block' }}
      />
    );
  }

  return (
    <div
      className="w-full h-full rounded-full flex items-center justify-center text-xl font-bold"
      style={{ background: '#1e3a5f', color: '#D4AF37' }}
    >
      {initials || '؟'}
    </div>
  );
}

// ─── Gold Divider ─────────────────────────────────────────────────────────────

function GoldDivider() {
  return (
    <div
      style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #D4AF37 30%, #D4AF37 70%, transparent)',
        margin: '6px 0',
        opacity: 0.6,
      }}
    />
  );
}

// ─── Classic Card ─────────────────────────────────────────────────────────────

const ClassicCard = forwardRef<HTMLDivElement, MasarakIDCardProps & { nameAr: string; nameEn: string }>(
  function ClassicCard({ card, profile, forExport, nameAr, nameEn }, ref) {
    const publicUrl = `https://masaraklb.com/student/${card.masarak_id}`;
    const countryLabel = COUNTRY_AR[profile.country || ''] || profile.country || '';
    const levelLabel   = LEVEL_AR[card.study_level || ''] || '';
    const dnaLabel     = profile.career_dna_result || 'لم يُحدَّد بعد';
    const joinYear     = formatJoinYear(card.created_at);

    return (
      <div
        ref={ref}
        dir="rtl"
        style={{
          /* 600 × 378 on screen — exported at 2× = 1200×756 */
          width: '600px',
          height: '378px',
          borderRadius: forExport ? '0' : '16px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F2340 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: '"IBM Plex Sans Arabic", "Tajawal", "Cairo", system-ui, sans-serif',
          boxShadow: forExport ? 'none' : '0 20px 60px rgba(0,0,0,0.5)',
          color: '#FFFFFF',
          flexShrink: 0,
        }}
      >
        {/* ── Decorative circles ── */}
        <div style={{
          position: 'absolute', top: '-40px', left: '-40px',
          width: '180px', height: '180px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30px', right: '-30px',
          width: '140px', height: '140px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,74,82,0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* ── Gold top stripe ── */}
        <div style={{
          position: 'absolute', top: 0, right: 0, left: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent, #D4AF37 20%, #F5D76E 50%, #D4AF37 80%, transparent)',
        }} />

        {/* ── HEADER: Logo + ID ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 10px',
        }}>
          {/* Logo area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: '#0F4A52', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(212,175,55,0.4)',
            }}>
              <span style={{ fontSize: '18px' }}>م</span>
            </div>
            <span style={{
              fontSize: '15px', fontWeight: '700', letterSpacing: '1px',
              color: '#FFFFFF',
            }}>
              مسارك
            </span>
          </div>

          {/* Masarak ID badge */}
          <div style={{
            background: 'rgba(212,175,55,0.12)',
            border: '1px solid rgba(212,175,55,0.5)',
            borderRadius: '8px',
            padding: '4px 12px',
          }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'block', lineHeight: 1.2 }}>
              Masarak ID
            </span>
            <span style={{
              fontSize: '13px', fontWeight: '700', color: '#D4AF37',
              letterSpacing: '1px', display: 'block',
            }}>
              {card.masarak_id}
            </span>
          </div>
        </div>

        <GoldDivider />

        {/* ── BODY ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '16px',
          padding: '10px 20px',
        }}>
          {/* Avatar (right in RTL) */}
          <div style={{
            width: '84px', height: '84px',
            borderRadius: '50%',
            border: '2px solid #D4AF37',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            <Avatar url={profile.avatar_url} name={nameAr || nameEn || 'م'} />
          </div>

          {/* Info block */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Names */}
            <div style={{ fontSize: '19px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1.2 }}>
              {nameAr || 'الاسم الكامل'}
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px', direction: 'ltr', textAlign: 'right' }}>
              {nameEn || 'Full Name'}
            </div>

            {/* Chips row */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
              {levelLabel && (
                <Chip icon="🎓" label={levelLabel} />
              )}
              {countryLabel && (
                <Chip icon="🌍" label={countryLabel} />
              )}
              {card.birth_year && (
                <Chip icon="📅" label={String(card.birth_year)} />
              )}
            </div>

            {/* DNA */}
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>المسار:</span>
              <span style={{
                fontSize: '12px', color: '#5EEAD4', fontWeight: '600',
                maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {dnaLabel}
              </span>
            </div>
          </div>
        </div>

        <GoldDivider />

        {/* ── FOOTER ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 20px 14px',
        }}>
          {/* QR Code */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '6px',
            padding: '4px',
            border: '1px solid rgba(212,175,55,0.3)',
          }}>
            <QRCodeSVG
              value={publicUrl}
              size={52}
              level="M"
              fgColor="#0F172A"
              bgColor="#FFFFFF"
            />
          </div>

          {/* Footer info */}
          <div style={{ textAlign: 'left', direction: 'ltr' }}>
            <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '2px' }}>
              انضم {joinYear}
            </div>
            <div style={{ fontSize: '10px', color: '#64748B' }}>
              masaraklb.com
            </div>
          </div>

          {/* Masarak wordmark */}
          <div style={{
            fontSize: '22px', fontWeight: '900', color: 'transparent',
            background: 'linear-gradient(135deg, #D4AF37, #F5D76E)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '2px',
          }}>
            مسارك
          </div>
        </div>

        {/* ── Gold bottom stripe ── */}
        <div style={{
          position: 'absolute', bottom: 0, right: 0, left: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent, #D4AF37 20%, #F5D76E 50%, #D4AF37 80%, transparent)',
        }} />
      </div>
    );
  }
);

ClassicCard.displayName = 'ClassicCard';

// ─── Chip helper ──────────────────────────────────────────────────────────────

function Chip({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '6px',
      padding: '2px 8px',
      fontSize: '11px',
      color: '#CBD5E1',
    }}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

const MasarakIDCard = forwardRef<HTMLDivElement, MasarakIDCardProps>(
  function MasarakIDCard(props, ref) {
    const { card, profile } = props;
    const nameAr = card.display_name_ar || profile.full_name || '';
    const nameEn = card.display_name_en || '';

    // Phase B: switch on card.card_theme === 'modern'
    return (
      <ClassicCard
        {...props}
        ref={ref}
        nameAr={nameAr}
        nameEn={nameEn}
      />
    );
  }
);

MasarakIDCard.displayName = 'MasarakIDCard';
export default MasarakIDCard;
