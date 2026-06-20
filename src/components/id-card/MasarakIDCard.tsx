'use client';
/**
 * MasarakIDCard — بطاقة الهوية الرقمية لمسارك
 *
 * Design: Clean white / navy #0F2D5A / turquoise — professional student ID
 * 600 × 378 px (credit-card ratio 1.586:1)
 * forExport=true → removes shadows/border-radius for html2canvas
 *
 * Rules:
 * - ALL styles inline — no Tailwind className inside card (html2canvas compat)
 * - forwardRef pattern for CardExportButton
 * - QRCodeSVG from qrcode.react
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
  card_theme?: 'classic' | 'modern' | 'minimal'; // retained for backward compat
  created_at: string;
  // Extended optional fields (add DB columns + form fields when ready)
  school_name?: string | null;
  graduation_year?: number | null;
  card_status?: string | null;
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

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ url, name }: { url?: string | null; name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('');

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        crossOrigin="anonymous"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%',
          display: 'block',
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E8F0FB, #C8D9F0)',
        fontSize: 32,
        fontWeight: 800,
        color: '#0F2D5A',
      }}
    >
      {initials || 'م'}
    </div>
  );
}

// ─── Info Cell ────────────────────────────────────────────────────────────────

function InfoItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontSize: 8,
          color: '#94A3B8',
          fontWeight: 700,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: mono ? 10 : 11,
          color: mono ? '#0F2D5A' : '#1E293B',
          fontWeight: 700,
          fontFamily: mono
            ? '"IBM Plex Mono","Courier New",monospace'
            : 'inherit',
          letterSpacing: mono ? '0.8px' : 'normal',
          lineHeight: 1.3,
        }}
      >
        {value || '—'}
      </span>
    </div>
  );
}

// ─── Main Card ────────────────────────────────────────────────────────────────

const MasarakIDCard = forwardRef<HTMLDivElement, MasarakIDCardProps>(
  function MasarakIDCard({ card, profile, forExport = false }, ref) {
    const nameAr      = card.display_name_ar || profile.full_name || '';
    const nameEn      = card.display_name_en || '';
    const levelLabel  = LEVEL_AR[card.study_level || ''] || '';
    const dnaLabel    = profile.career_dna_result || '';
    const publicUrl   = `https://masaraklb.com/v/${card.masarak_id}`;
    const statusLabel = card.card_status || 'عضو نشط';

    // Expiry: 1 year after card creation
    let expiryStr = '';
    try {
      const exp = new Date(card.created_at);
      exp.setFullYear(exp.getFullYear() + 1);
      expiryStr = exp.toLocaleDateString('ar-SA', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      expiryStr = '';
    }

    const gradYearDisplay = card.graduation_year
      ? String(card.graduation_year)
      : '';
    const schoolDisplay = card.school_name || '';

    return (
      <div
        ref={ref}
        dir="rtl"
        style={{
          width: '600px',
          height: '378px',
          borderRadius: forExport ? '0' : '16px',
          background: '#FFFFFF',
          border: forExport ? 'none' : '0.5px solid rgba(15,45,90,0.15)',
          boxShadow: forExport ? 'none' : '0 12px 40px rgba(15,45,90,0.12)',
          fontFamily:
            '"IBM Plex Sans Arabic","Tajawal","Cairo",system-ui,sans-serif',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* ── Navy header ─────────────────────────────────────────────────── */}
        <div
          style={{
            background: '#0F2D5A',
            padding: '12px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          {/* Logo + wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  color: '#22D3EE',
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                م
              </span>
            </div>
            <span
              style={{ fontSize: 15, color: '#FFFFFF', fontWeight: 700, lineHeight: 1 }}
            >
              مسارك
            </span>
          </div>

          {/* Status pill + STUDENT ID label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.28)',
                borderRadius: 20,
                padding: '3px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#34D399',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span
                style={{ fontSize: 9, color: '#34D399', fontWeight: 600 }}
              >
                {statusLabel}
              </span>
            </div>
            <span
              style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.35)',
                direction: 'ltr',
                letterSpacing: 2,
                fontWeight: 600,
              }}
            >
              STUDENT ID
            </span>
          </div>
        </div>

        {/* ── Turquoise accent line ────────────────────────────────────────── */}
        <div
          style={{
            height: 3,
            flexShrink: 0,
            background:
              'linear-gradient(90deg, #0EA5E9, #22D3EE 40%, #06B6D4 70%, #0EA5E9)',
          }}
        />

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 18,
            padding: '20px 22px 16px',
            overflow: 'hidden',
          }}
        >
          {/* Photo + DNA pill  ← first child = rightmost in RTL */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                border: '2.5px solid #0F2D5A',
                overflow: 'hidden',
                flexShrink: 0,
                boxSizing: 'border-box',
              }}
            >
              <Avatar
                url={profile.avatar_url}
                name={nameAr || nameEn || 'م'}
              />
            </div>

            {dnaLabel && (
              <div
                style={{
                  background: '#EFF8FB',
                  border: '1px solid #BAE6FD',
                  borderRadius: 20,
                  padding: '2px 8px',
                  fontSize: 8,
                  color: '#0369A1',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  maxWidth: 105,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                🧬 {dnaLabel}
              </div>
            )}
          </div>

          {/* Center: name + separator + info grid */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: 0,
            }}
          >
            {/* Arabic name */}
            <div
              style={{
                fontSize: 21,
                fontWeight: 800,
                color: '#0F2D5A',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {nameAr || 'الاسم الكامل'}
            </div>

            {/* English name */}
            {nameEn && (
              <div
                style={{
                  fontSize: 10,
                  color: '#64748B',
                  direction: 'ltr',
                  textAlign: 'right',
                  marginTop: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {nameEn}
              </div>
            )}

            {/* Separator */}
            <div
              style={{ height: 1, background: '#E8EDF5', margin: '12px 0' }}
            />

            {/* Info grid 2 × 2 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px 16px',
              }}
            >
              <InfoItem label="رقم مسارك"          value={card.masarak_id} mono />
              <InfoItem label="المرحلة"             value={levelLabel} />
              <InfoItem label="المدرسة / الجامعة"   value={schoolDisplay} />
              <InfoItem label="سنة التخرج"          value={gradYearDisplay} />
            </div>
          </div>

          {/* QR  ← third child = leftmost in RTL */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 10,
                border: '1.5px solid #E2E8F0',
                padding: 5,
                background: '#FFFFFF',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QRCodeSVG
                value={publicUrl}
                size={58}
                level="M"
                fgColor="#0F2D5A"
                bgColor="#FFFFFF"
              />
            </div>
            <span
              style={{ fontSize: 8, color: '#94A3B8', textAlign: 'center' }}
            >
              امسح للتحقق
            </span>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div
          style={{
            borderTop: '1px solid #EEF0F4',
            padding: '9px 22px',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 8,
              color: '#94A3B8',
              direction: 'ltr',
              fontFamily: 'monospace',
            }}
          >
            masaraklb.com/v/{card.masarak_id}
          </span>
          {expiryStr && (
            <span
              style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}
            >
              صلاحية: {expiryStr}
            </span>
          )}
        </div>

        {/* ── Navy bottom bar ──────────────────────────────────────────────── */}
        <div style={{ height: 4, background: '#0F2D5A', flexShrink: 0 }} />
      </div>
    );
  }
);

MasarakIDCard.displayName = 'MasarakIDCard';
export default MasarakIDCard;
