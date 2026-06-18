'use client';
/**
 * MasarakIDCard — بطاقة الهوية الرقمية لمسارك
 *
 * Themes (Phase C):
 * - classic : navy #0F172A + gold #D4AF37
 * - modern  : white + teal #0F4A52 (side panel layout)
 * - minimal : stone #FAFAF9, monochrome, ultra-clean
 *
 * نسبة 1.586:1 (بطاقة ائتمان standard) — 600×378 px on screen
 * forExport=true → يزيل shadows/transforms للـ html2canvas
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
  card_theme?: 'classic' | 'modern' | 'minimal';
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

// ─── Modern Card ──────────────────────────────────────────────────────────────
// White + teal side-panel layout

const ModernCard = forwardRef<HTMLDivElement, MasarakIDCardProps & { nameAr: string; nameEn: string }>(
  function ModernCard({ card, profile, forExport, nameAr, nameEn }, ref) {
    const publicUrl    = `https://masaraklb.com/student/${card.masarak_id}`;
    const countryLabel = COUNTRY_AR[profile.country || ''] || profile.country || '';
    const levelLabel   = LEVEL_AR[card.study_level || ''] || '';
    const dnaLabel     = profile.career_dna_result || '';
    const joinYear     = formatJoinYear(card.created_at);

    return (
      <div ref={ref} dir="rtl" style={{
        width:'600px', height:'378px',
        borderRadius: forExport ? '0' : '16px',
        background: '#FFFFFF',
        position:'relative', overflow:'hidden',
        fontFamily:'"IBM Plex Sans Arabic","Tajawal","Cairo",system-ui,sans-serif',
        boxShadow: forExport ? 'none' : '0 20px 60px rgba(0,0,0,0.15)',
        color:'#1b3a6b', flexShrink:0,
        border:'1px solid #E2E8F0',
      }}>
        {/* Teal accent top bar */}
        <div style={{position:'absolute',top:0,right:0,left:0,height:'4px',background:'linear-gradient(90deg,#0F4A52,#1A8A8C)'}}/>
        {/* Left teal panel */}
        <div style={{position:'absolute',top:0,left:0,bottom:0,width:'160px',background:'linear-gradient(180deg,#0F4A52 0%,#0D3D43 100%)',display:'flex',flexDirection:'column',alignItems:'center',padding:'24px 12px 16px'}}>
          <div style={{width:'72px',height:'72px',borderRadius:'50%',border:'3px solid rgba(255,255,255,0.3)',overflow:'hidden',marginBottom:'10px'}}>
            <Avatar url={profile.avatar_url} name={nameAr||nameEn||'م'} bg='rgba(255,255,255,0.15)' fg='#FFFFFF'/>
          </div>
          <div style={{fontSize:'11px',color:'rgba(255,255,255,0.6)',marginBottom:'4px',textAlign:'center'}}>Masarak ID</div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#5EEAD4',letterSpacing:'1px',textAlign:'center'}}>{card.masarak_id}</div>
          <div style={{marginTop:'auto',background:'#FFFFFF',borderRadius:'8px',padding:'6px'}}>
            <QRCodeSVG value={publicUrl} size={60} level="M" fgColor="#0F4A52" bgColor="#FFFFFF"/>
          </div>
          <div style={{fontSize:'9px',color:'rgba(255,255,255,0.5)',marginTop:'6px',textAlign:'center'}}>masaraklb.com</div>
        </div>
        {/* Right content */}
        <div style={{marginRight:0,marginLeft:'168px',padding:'24px 20px 16px',height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between',boxSizing:'border-box'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
            <span style={{fontSize:'16px',fontWeight:'800',color:'#0F4A52',letterSpacing:'0.5px'}}>مسارك</span>
            <span style={{fontSize:'10px',background:'#EFF6FF',color:'#3B82F6',fontWeight:'600',padding:'2px 8px',borderRadius:'20px'}}>{levelLabel||'طالب'}</span>
          </div>
          <div>
            <div style={{fontSize:'22px',fontWeight:'800',color:'#1b3a6b',lineHeight:1.2,marginBottom:'2px'}}>{nameAr||'الاسم الكامل'}</div>
            {nameEn && <div style={{fontSize:'12px',color:'#64748B',direction:'ltr',textAlign:'right'}}>{nameEn}</div>}
          </div>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'10px'}}>
            {countryLabel && <Chip icon="🌍" label={countryLabel} bg='#F0FDF4' color='#166534'/>}
            {card.birth_year && <Chip icon="📅" label={String(card.birth_year)} bg='#FFF7ED' color='#9A3412'/>}
          </div>
          {dnaLabel && (
            <div style={{marginTop:'10px',background:'#F0FAFA',borderRadius:'10px',padding:'8px 12px',display:'flex',alignItems:'center',gap:'8px'}}>
              <span style={{fontSize:'14px'}}>🧬</span>
              <div>
                <div style={{fontSize:'9px',color:'#64748B',marginBottom:'1px'}}>Career DNA</div>
                <div style={{fontSize:'12px',fontWeight:'700',color:'#0F4A52'}}>{dnaLabel}</div>
              </div>
            </div>
          )}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'auto',paddingTop:'8px',borderTop:'1px solid #F1F5F9'}}>
            <span style={{fontSize:'10px',color:'#94A3B8'}}>عضو منذ {joinYear}</span>
            <span style={{fontSize:'10px',color:'#0F4A52',fontWeight:'600'}}>masaraklb.com</span>
          </div>
        </div>
      </div>
    );
  }
);
ModernCard.displayName = 'ModernCard';

// ─── Minimal Card ─────────────────────────────────────────────────────────────
// Stone #FAFAF9, monochrome, ultra-clean typography

const MinimalCard = forwardRef<HTMLDivElement, MasarakIDCardProps & { nameAr: string; nameEn: string }>(
  function MinimalCard({ card, profile, forExport, nameAr, nameEn }, ref) {
    const publicUrl    = `https://masaraklb.com/student/${card.masarak_id}`;
    const countryLabel = COUNTRY_AR[profile.country || ''] || profile.country || '';
    const levelLabel   = LEVEL_AR[card.study_level || ''] || '';
    const dnaLabel     = profile.career_dna_result || '';
    const joinYear     = formatJoinYear(card.created_at);

    return (
      <div ref={ref} dir="rtl" style={{
        width:'600px', height:'378px',
        borderRadius: forExport ? '0' : '16px',
        background:'#FAFAF9',
        position:'relative', overflow:'hidden',
        fontFamily:'"IBM Plex Sans Arabic","Tajawal","Cairo",system-ui,sans-serif',
        boxShadow: forExport ? 'none' : '0 4px 24px rgba(0,0,0,0.08)',
        color:'#1C1917', flexShrink:0,
        border:'1px solid #E7E5E4',
      }}>
        <div style={{position:'absolute',top:0,right:0,left:0,height:'2px',background:'#1C1917'}}/>
        <div style={{padding:'28px 28px 20px',height:'100%',boxSizing:'border-box',display:'flex',flexDirection:'column'}}>
          {/* Header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{width:'44px',height:'44px',borderRadius:'50%',border:'1.5px solid #D6D3D1',overflow:'hidden',flexShrink:0}}>
                <Avatar url={profile.avatar_url} name={nameAr||nameEn||'م'} bg='#E7E5E4' fg='#57534E'/>
              </div>
              <div>
                <div style={{fontSize:'18px',fontWeight:'800',color:'#1C1917',lineHeight:1.2}}>{nameAr||'الاسم الكامل'}</div>
                {nameEn && <div style={{fontSize:'11px',color:'#78716C',direction:'ltr',textAlign:'right'}}>{nameEn}</div>}
              </div>
            </div>
            <span style={{fontSize:'12px',fontWeight:'700',color:'#57534E',letterSpacing:'2px'}}>مسارك</span>
          </div>
          {/* Info row */}
          <div style={{display:'flex',gap:'24px',marginBottom:'12px'}}>
            {levelLabel && <InfoBlock label="المرحلة" value={levelLabel}/>}
            {countryLabel && <InfoBlock label="الدولة" value={countryLabel}/>}
            {card.birth_year && <InfoBlock label="المولد" value={String(card.birth_year)}/>}
          </div>
          {dnaLabel && (
            <div style={{background:'#F5F5F4',borderRadius:'8px',padding:'8px 12px',marginBottom:'12px',display:'flex',gap:'8px',alignItems:'center'}}>
              <span style={{fontSize:'11px',color:'#78716C'}}>Career DNA:</span>
              <span style={{fontSize:'12px',fontWeight:'700',color:'#1C1917'}}>{dnaLabel}</span>
            </div>
          )}
          {/* Bottom */}
          <div style={{marginTop:'auto',display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:'9px',color:'#A8A29E',letterSpacing:'1px',marginBottom:'2px',textTransform:'uppercase'}}>Masarak ID</div>
              <div style={{fontSize:'14px',fontWeight:'800',color:'#1C1917',letterSpacing:'1px',fontFamily:'monospace'}}>{card.masarak_id}</div>
              <div style={{fontSize:'9px',color:'#A8A29E',marginTop:'4px'}}>عضو منذ {joinYear}</div>
            </div>
            <div style={{background:'#FFFFFF',padding:'4px',borderRadius:'6px',border:'1px solid #E7E5E4'}}>
              <QRCodeSVG value={publicUrl} size={52} level="M" fgColor="#1C1917" bgColor="#FFFFFF"/>
            </div>
          </div>
        </div>
        <div style={{position:'absolute',bottom:0,right:0,left:0,height:'2px',background:'#E7E5E4'}}/>
      </div>
    );
  }
);
MinimalCard.displayName = 'MinimalCard';

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{fontSize:'9px',color:'#A8A29E',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'2px'}}>{label}</div>
      <div style={{fontSize:'13px',fontWeight:'700',color:'#1C1917'}}>{value}</div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

const MasarakIDCard = forwardRef<HTMLDivElement, MasarakIDCardProps>(
  function MasarakIDCard(props, ref) {
    const { card, profile } = props;
    const nameAr = card.display_name_ar || profile.full_name || '';
    const nameEn = card.display_name_en || '';

    if (card.card_theme === 'modern')  return <ModernCard  {...props} ref={ref} nameAr={nameAr} nameEn={nameEn}/>;
    if (card.card_theme === 'minimal') return <MinimalCard {...props} ref={ref} nameAr={nameAr} nameEn={nameEn}/>;
    return <ClassicCard {...props} ref={ref} nameAr={nameAr} nameEn={nameEn}/>;
  }
);

MasarakIDCard.displayName = 'MasarakIDCard';
export default MasarakIDCard;
