// src/components/Logo.tsx — Masarak logo (SVG, inspired by the brand wordmark)
import React from 'react';

type Props = {
  size?: number;
  showText?: boolean;
  showSubtitle?: boolean;
  variant?: 'dark' | 'mint' | 'white';
  className?: string;
};

export default function Logo({
  size = 44,
  showText = true,
  showSubtitle = false,
  variant = 'dark',
  className = ''
}: Props) {
  const colors = {
    dark:  { mark: '#0F4A52', text: '#0F4A52', sub: '#6B7280', pin: '#0F4A52' },
    mint:  { mark: '#95D5C5', text: '#0F4A52', sub: '#1A6F7C', pin: '#0F4A52' },
    white: { mark: '#FFFFFF', text: '#FFFFFF', sub: '#E0E7FF', pin: '#FFFFFF' },
  };
  const c = colors[variant];

  return (
    <div className={'inline-flex items-center gap-2.5 ' + className} dir="ltr">
      {/* The "M" wordmark with location pin (inspired by the brand) */}
      <svg
        width={size * 2.2}
        height={size}
        viewBox="0 0 110 50"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Masarak"
        className="flex-shrink-0"
      >
        {/* Stylized flowing "M" with a sweeping tail */}
        <path
          d="M 8 38 Q 10 14, 22 14 Q 31 14, 35 28 Q 39 14, 48 14 Q 60 14, 60 38 L 64 38 Q 70 38, 75 42"
          stroke={c.mark}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* "asarak" wordmark text */}
        <text x="42" y="42" fontFamily="Tajawal, system-ui, sans-serif" fontSize="20" fontWeight="800" fill={c.mark} letterSpacing="-1">
          asarak
        </text>
        {/* Location pin above the M */}
        <g transform="translate(30,2)">
          <path
            d="M 5 0 C 2.5 0, 0 2, 0 5 C 0 8, 5 13, 5 13 C 5 13, 10 8, 10 5 C 10 2, 7.5 0, 5 0 Z"
            fill={c.pin}
          />
          <circle cx="5" cy="5" r="1.8" fill={variant === 'white' ? '#0F4A52' : '#FFFFFF'} />
        </g>
      </svg>

      {/* Optional Arabic subtitle */}
      {showSubtitle && (
        <div className="flex flex-col leading-tight border-r-2 border-current pr-2.5" style={{ color: c.text }}>
          <span className="text-base font-extrabold tracking-tight">مسارك</span>
          <span className="text-[10px] font-medium opacity-70">منصة الطلاب</span>
        </div>
      )}
    </div>
  );
}
