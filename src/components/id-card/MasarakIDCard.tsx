'use client';
/**
 * MasarakIDCard — بطاقة الهوية الرقمية لمسارك
 *
 * Themes:
 * - classic : navy #0F172A + gold #D4AF37  — panel layout (avatar/QR left | content right)
 * - modern  : white + teal — left panel layout
 * - minimal : stone #FAFAF9, monochrome, ultra-clean
 *
 * 600 × 378 px on screen (credit-card ratio 1.586:1)
 * forExport=true → يزيل shadows/transforms للـ html2canvas
 */

import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardProfile {
  avatar_url?: string | null;
  country?: string | null;
  career_dna_result?: string | null;
  full_name?: string | null;
}

export interface StudentCard {
  masarak_id: string;
  display_name_ar?: string | null;
  display_name_en?: string | null;
  birth_year?: number | null;
  study_level?: 'secondary' | 'university' | 'graduate' | null;
  card_theme?: 'classic' | 'modern' | 'minimal';
  created_at: string;
}

interface MasarakIDCardProps {
  card: StudentCard;
  profile: CardProfile;
  forExport?: boolean;
  className?: string;
}

// ─── Label Maps ───────────────────────────────────────────────────────────────

const LEVEL_AR: Record<string, string> = {
  secondary:  'ثانوي',
  university: 'جامعي',
  graduate:   'خريج',
};

const COUNTRY_AR: Record<string, string> = {
  LB: 'لبنان', SA: 'السعودية', AE: 'الإمارات', JO: 'الأردن',
  EG: 'مصر',   KW: 'الكويت',  QA: 'قطر',      BH: 'البحرين',
  OM: 'عُمان', IQ: 'العراق',  SY: 'سوريا',     MA: 'المغرب',
  DZ: 'الجزائر', TN: 'تونس', LY: 'ليبيا', SD: 'السودان',
  YE: 'اليمن', PS: 'فلسطين',
};

function formatJoinYear(iso: string): string {
  return new Date(iso).getFullYear().toString();
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Avatar({ url, name, bg, fg }: { url?: string | null; name: string; bg?: string; fg?: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
  if (url) {
    return (
      <img
        src={url} alt={name} crossOrigin="anonymous"
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }}
      />
    );
  }
  return (
    <div style={{
      width: '100%', height: '100%', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.125rem', fontWeight: 800,
      background: bg || '#1e3a5f', color: fg || '#D4AF37',
    }}>
      {initials || '؟'}
    </div>
  );
}

/** Pill chip for info tags */
function Chip({ icon, label, bg, color }: { icon: string; label: string; bg?: string; color?: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: bg || 'rgba(255,255,255,0.12)',
      color: color || 'rgba(255,255,255,0.9)',
      padding: '3px 9px', borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 11 }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// ─── Classic Card (v2) ────────────────────────────────────────────────────────
// Layout: right content area | left dark panel (avatar + QR + ID)

const ClassicCard = forwardRef<HTMLDivElement, MasarakIDCardProps & { nameAr: string; nameEn: string }>(
  function ClassicCard({ card, profile, forExport, nameAr, nameEn }, ref) {
    const publicUrl    = `https://masaraklb.com/student/${card.masarak_id}`;
    const countryLabel = COUNTRY_AR[profile.country || ''] || profile.country || '';
    const levelLabel   = LEVEL_AR[card.study_level || ''] || '';
    const dnaLabel     = profile.career_dna_result || '';
    const joinYear     = formatJoinYear(card.created_at);

    return (
      <div
        ref={ref}
        dir="rtl"
        style={{
          width: '600px', height: '378px',
          borderRadius: forExport ? '0' : '18px',
          background: 'linear-gradient(140deg, #0b1628 0%, #162040 55%, #0e2a50 100%)',
          position: 'relative', overflow: 'hidden',
          fontFamily: '"IBM Plex Sans Arabic","Tajawal","Cairo",system-ui,sans-serif',
          boxShadow: forExport ? 'none' : '0 24px 64px rgba(0,0,0,0.55)',
          color: '#FFFFFF', flexShrink: 0,
        }}
      >
        {/* ── Subtle noise/texture overlay ── */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\'%3E%3Crect width=\'4\' height=\'4\' fill=\'none\'/%3E%3Ccircle cx=\'1\' cy=\'1\' r=\'0.5\' fill=\'rgba(255,255,255,0.03)\'/%3E%3C/svg%3E")',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* ── Decorative glow circles ── */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', bottom: -40, right: 80,
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,74,82,0.35) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* ── Gold top stripe ── */}
        <div style={{
          position: 'absolute', top: 0, right: 0, left: 0, height: 3, zIndex: 10,
          background: 'linear-gradient(90deg, transparent 0%, #B8952A 20%, #F5D76E 50%, #D4AF37 80%, transparent 100%)',
        }} />

        {/* ── LEFT PANEL: avatar + ID + QR ── */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, width: 152,
          background: 'rgba(0,0,0,0.30)',
          borderRight: '1px solid rgba(212,175,55,0.18)',
          backdropFilter: 'blur(2px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '22px 12px 16px', zIndex: 1,
        }}>
          {/* Avatar */}
          <div style={{
            width: 74, height: 74, borderRadius: '50%',
            border: '2px solid rgba(212,175,55,0.7)',
            overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 0 0 4px rgba(212,175,55,0.12)',
          }}>
            <Avatar url={profile.avatar_url} name={nameAr || nameEn || 'م'} />
          </div>

          {/* Masarak ID */}
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
              Masarak ID
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#D4AF37', letterSpacing: '1.5px', fontFamily: 'monospace' }}>
              {card.masarak_id}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, width: '70%', background: 'rgba(212,175,55,0.2)', margin: '12px 0' }} />

          {/* QR Code */}
          <div style={{
            background: '#FFFFFF', borderRadius: 8, padding: 5,
            border: '1px solid rgba(212,175,55,0.25)',
          }}>
            <QRCodeSVG value={publicUrl} size={62} level="M" fgColor="#0F172A" bgColor="#FFFFFF" />
          </div>

          <div style={{ marginTop: 8, fontSize: 8, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
            masaraklb.com
          </div>
        </div>

        {/* ── RIGHT CONTENT AREA ── */}
        <div style={{
          marginLeft: 160,
          padding: '18px 22px 16px',
          height: '100%', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', zIndex: 1,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: '#0F4A52', border: '1px solid rgba(212,175,55,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 17 }}>م</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.5px', color: '#F1F5F9' }}>
                مسارك
              </span>
            </div>
            <span style={{ fontSize: 9, color: '#4B5563', direction: 'ltr' }}>
              عضو منذ {joinYear}
            </span>
          </div>

          {/* Name block */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15, letterSpacing: '-0.3px' }}>
              {nameAr || 'الاسم الكامل'}
            </div>
            {nameEn && (
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 3, direction: 'ltr', textAlign: 'right', letterSpacing: '0.3px' }}>
                {nameEn}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{
            height: 1, margin: '0 0 10px',
            background: 'linear-gradient(90deg, rgba(212,175,55,0.4) 0%, transparent 100%)',
          }} />

          {/* Chips row */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {levelLabel   && <Chip icon="🎓" label={levelLabel} />}
            {countryLabel && <Chip icon="🌍" label={countryLabel} />}
            {card.birth_year && <Chip icon="📅" label={String(card.birth_year)} />}
          </div>

          {/* DNA result */}
          {dnaLabel ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(94,234,212,0.07)',
              border: '1px solid rgba(94,234,212,0.15)',
              borderRadius: 10, padding: '6px 10px',
            }}>
              <span style={{ fontSize: 13 }}>🧬</span>
              <div>
                <div style={{ fontSize: 8, color: '#64748B', marginBottom: 1 }}>Career DNA</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#5EEAD4', letterSpacing: '0.2px' }}>{dnaLabel}</div>
              </div>
            </div>
          ) : (
            <div style={{ height: 34 }} />
          )}

          {/* Bottom wordmark */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
            <div style={{
              fontSize: 18, fontWeight: 900,
              background: 'linear-gradient(135deg, #B8952A, #F5D76E, #D4AF37)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: 2,
            }}>
              مسارك
            </div>
          </div>
        </div>

        {/* ── Gold bottom stripe ── */}
        <div style={{
          position: 'absolute', bottom: 0, right: 0, left: 0, height: 3, zIndex: 10,
          background: 'linear-gradient(90deg, transparent 0%, #B8952A 20%, #F5D76E 50%, #D4AF37 80%, transparent 100%)',
        }} />
      </div>
    );
  }
);
ClassicCard.displayName = 'ClassicCard';

// ─── Modern Card ──────────────────────────────────────────────────────────────

const ModernCard = forwardRef<HTMLDivElement, MasarakIDCardProps & { nameAr: string; nameEn: string }>(
  function ModernCard({ card, profile, forExport, nameAr, nameEn }, ref) {
    const publicUrl    = `https://masaraklb.com/student/${card.masarak_id}`;
    const countryLabel = COUNTRY_AR[profile.country || ''] || profile.country || '';
    const levelLabel   = LEVEL_AR[card.study_level || ''] || '';
    const dnaLabel     = profile.career_dna_result || '';
    const joinYear     = formatJoinYear(card.created_at);

    return (
      <div ref={ref} dir="rtl" style={{
        width: '600px', height: '378px',
        borderRadius: forExport ? '0' : '18px',
        background: '#FFFFFF',
        position: 'relative', overflow: 'hidden',
        fontFamily: '"IBM Plex Sans Arabic","Tajawal","Cairo",system-ui,sans-serif',
        boxShadow: forExport ? 'none' : '0 20px 56px rgba(0,0,0,0.13)',
        color: '#1b3a6b', flexShrink: 0,
        border: '1px solid #E2E8F0',
      }}>
        {/* Teal top stripe */}
        <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 4,
          background: 'linear-gradient(90deg, #0F4A52, #1A8A8C, #0F4A52)' }} />

        {/* Left teal panel */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: 154,
          background: 'linear-gradient(180deg, #0F4A52 0%, #0C3840 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '22px 12px 16px',
        }}>
          <div style={{
            width: 74, height: 74, borderRadius: '50%',
            border: '2.5px solid rgba(255,255,255,0.28)',
            overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 0 0 4px rgba(255,255,255,0.07)',
          }}>
            <Avatar url={profile.avatar_url} name={nameAr || nameEn || 'م'} bg="rgba(255,255,255,0.15)" fg="#FFFFFF" />
          </div>
          <div style={{ marginTop: 10, fontSize: 8, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase' }}>
            Masarak ID
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#5EEAD4', letterSpacing: '1.5px', fontFamily: 'monospace', marginTop: 2, textAlign: 'center' }}>
            {card.masarak_id}
          </div>

          <div style={{ height: 1, width: '70%', background: 'rgba(255,255,255,0.12)', margin: '12px 0' }} />

          <div style={{ background: '#FFFFFF', borderRadius: 8, padding: 5 }}>
            <QRCodeSVG value={publicUrl} size={64} level="M" fgColor="#0F4A52" bgColor="#FFFFFF" />
          </div>
          <div style={{ marginTop: 8, fontSize: 8, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
            masaraklb.com
          </div>
        </div>

        {/* Right content */}
        <div style={{
          marginLeft: 162,
          padding: '18px 22px 16px',
          height: '100%', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#0F4A52', letterSpacing: '0.5px' }}>مسارك</span>
            <span style={{
              fontSize: 10, background: '#EFF6FF', color: '#3B82F6',
              fontWeight: 700, padding: '2px 10px', borderRadius: 20,
            }}>
              {levelLabel || 'طالب'}
            </span>
          </div>

          {/* Name */}
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#1b3a6b', lineHeight: 1.15, letterSpacing: '-0.3px' }}>
              {nameAr || 'الاسم الكامل'}
            </div>
            {nameEn && (
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 3, direction: 'ltr', textAlign: 'right' }}>{nameEn}</div>
            )}
          </div>

          {/* Chips */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {countryLabel && <Chip icon="🌍" label={countryLabel} bg="#F0FDF4" color="#166534" />}
            {card.birth_year && <Chip icon="📅" label={String(card.birth_year)} bg="#FFF7ED" color="#9A3412" />}
          </div>

          {/* DNA */}
          {dnaLabel ? (
            <div style={{
              background: '#F0FAFA', borderRadius: 10,
              padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid #CCECE8',
            }}>
              <span style={{ fontSize: 14 }}>🧬</span>
              <div>
                <div style={{ fontSize: 8, color: '#64748B', marginBottom: 1 }}>Career DNA</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0F4A52' }}>{dnaLabel}</div>
              </div>
            </div>
          ) : (
            <div style={{ height: 42 }} />
          )}

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 8, borderTop: '1px solid #F1F5F9',
          }}>
            <span style={{ fontSize: 10, color: '#94A3B8' }}>عضو منذ {joinYear}</span>
            <span style={{ fontSize: 10, color: '#0F4A52', fontWeight: 700 }}>masaraklb.com</span>
          </div>
        </div>
      </div>
    );
  }
);
ModernCard.displayName = 'ModernCard';

// ─── Minimal Card ─────────────────────────────────────────────────────────────

const MinimalCard = forwardRef<HTMLDivElement, MasarakIDCardProps & { nameAr: string; nameEn: string }>(
  function MinimalCard({ card, profile, forExport, nameAr, nameEn }, ref) {
    const publicUrl    = `https://masaraklb.com/student/${card.masarak_id}`;
    const countryLabel = COUNTRY_AR[profile.country || ''] || profile.country || '';
    const levelLabel   = LEVEL_AR[card.study_level || ''] || '';
    const dnaLabel     = profile.career_dna_result || '';
    const joinYear     = formatJoinYear(card.created_at);

    return (
      <div ref={ref} dir="rtl" style={{
        width: '600px', height: '378px',
        borderRadius: forExport ? '0' : '18px',
        background: '#FAFAF9',
        position: 'relative', overflow: 'hidden',
        fontFamily: '"IBM Plex Sans Arabic","Tajawal","Cairo",system-ui,sans-serif',
        boxShadow: forExport ? 'none' : '0 4px 24px rgba(0,0,0,0.07)',
        color: '#1C1917', flexShrink: 0,
        border: '1px solid #E7E5E4',
      }}>
        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 3, background: '#1C1917' }} />

        <div style={{
          padding: '22px 26px 18px',
          height: '100%', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          {/* Header: avatar + name + wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                border: '1.5px solid #D6D3D1', overflow: 'hidden', flexShrink: 0,
              }}>
                <Avatar url={profile.avatar_url} name={nameAr || nameEn || 'م'} bg="#E7E5E4" fg="#57534E" />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#1C1917', lineHeight: 1.15 }}>
                  {nameAr || 'الاسم الكامل'}
                </div>
                {nameEn && (
                  <div style={{ fontSize: 11, color: '#78716C', marginTop: 2, direction: 'ltr', textAlign: 'right' }}>{nameEn}</div>
                )}
              </div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#1C1917', letterSpacing: '2px' }}>مسارك</span>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#E7E5E4' }} />

          {/* Info row */}
          <div style={{ display: 'flex', gap: 28 }}>
            {levelLabel   && <InfoBlock label="المرحلة" value={levelLabel} />}
            {countryLabel && <InfoBlock label="الدولة"  value={countryLabel} />}
            {card.birth_year && <InfoBlock label="مولد"  value={String(card.birth_year)} />}
          </div>

          {/* DNA */}
          {dnaLabel && (
            <div style={{
              background: '#F5F5F4', borderRadius: 10,
              padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid #E7E5E4',
            }}>
              <span style={{ fontSize: 11, color: '#78716C', fontWeight: 600 }}>Career DNA</span>
              <div style={{ width: 1, height: 12, background: '#D6D3D1' }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: '#1C1917' }}>{dnaLabel}</span>
            </div>
          )}

          {/* Bottom: ID + QR */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 8, color: '#A8A29E', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 3 }}>
                Masarak ID
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#1C1917', letterSpacing: '1.5px', fontFamily: 'monospace' }}>
                {card.masarak_id}
              </div>
              <div style={{ fontSize: 9, color: '#A8A29E', marginTop: 4 }}>عضو منذ {joinYear}</div>
            </div>
            <div style={{ background: '#FFFFFF', padding: 5, borderRadius: 8, border: '1px solid #E7E5E4' }}>
              <QRCodeSVG value={publicUrl} size={56} level="M" fgColor="#1C1917" bgColor="#FFFFFF" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, height: 3, background: '#E7E5E4' }} />
      </div>
    );
  }
);
MinimalCard.displayName = 'MinimalCard';

// ─── InfoBlock (Minimal) ──────────────────────────────────────────────────────

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 8, color: '#A8A29E', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#1C1917' }}>{value}</div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

const MasarakIDCard = forwardRef<HTMLDivElement, MasarakIDCardProps>(
  function MasarakIDCard(props, ref) {
    const { card, profile } = props;
    const nameAr = card.display_name_ar || profile.full_name || '';
    const nameEn = card.display_name_en || '';

    if (card.card_theme === 'modern')  return <ModernCard  {...props} ref={ref} nameAr={nameAr} nameEn={nameEn} />;
    if (card.card_theme === 'minimal') return <MinimalCard {...props} ref={ref} nameAr={nameAr} nameEn={nameEn} />;
    return <ClassicCard {...props} ref={ref} nameAr={nameAr} nameEn={nameEn} />;
  }
);

MasarakIDCard.displayName = 'MasarakIDCard';
export default MasarakIDCard;
