// src/components/Logo.tsx — مسارك Logo (SVG)
import React from 'react';

type Props = {
  size?: number;
  showText?: boolean;
  showSubtitle?: boolean;
  variant?: 'navy' | 'teal' | 'white';
  className?: string;
};

export default function Logo({ size = 40, showText = true, showSubtitle = true, variant = 'navy', className = '' }: Props) {
  const colors = {
    navy:  { bg: '#1b3a6b', accent: '#5cc4b8', word: '#1b3a6b', sub: '#64748b' },
    teal:  { bg: '#5cc4b8', accent: '#1b3a6b', word: '#0f3a4f', sub: '#475569' },
    white: { bg: '#ffffff', accent: '#5cc4b8', word: '#ffffff', sub: '#cbd5e1' },
  };
  const c = colors[variant];

  return (
    <div className={'flex items-center gap-2 ' + className} dir="rtl">
      <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="مسارك">
        <rect x="2" y="2" width="60" height="60" rx="14" fill={c.bg} />
        <path
          d="M14 46 L14 22 Q14 18 18 18 Q22 18 24 22 L32 36 L40 22 Q42 18 46 18 Q50 18 50 22 L50 46"
          stroke={variant === 'white' ? c.word : '#ffffff'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="32" cy="13" r="4.5" fill={c.accent} />
        <path d="M32 17 L32 21" stroke={c.accent} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="13" r="1.8" fill={c.bg} />
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-xl font-extrabold tracking-tight" style={{ color: c.word }}>مسارك</span>
          {showSubtitle && (
            <span className="text-[10px] font-medium" style={{ color: c.sub }}>
              من <a href="https://takafullb.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">جمعية تكافل</a>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
