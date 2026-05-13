// src/components/Logo.tsx — Masarak logo (uses actual brand image)
import React from 'react';

type Props = {
  size?: number;
  showText?: boolean;       // kept for backwards-compat
  showSubtitle?: boolean;
  variant?: 'dark' | 'mint' | 'white';
  className?: string;
};

export default function Logo({
  size = 44,
  showSubtitle = false,
  variant = 'dark',
  className = ''
}: Props) {
  const subtitleColor = {
    dark:  'text-primary',
    mint:  'text-primary-dark',
    white: 'text-white',
  }[variant];

  return (
    <div className={'inline-flex items-center gap-2.5 ' + className} dir="ltr">
      <div
        className="relative rounded-2xl overflow-hidden flex-shrink-0 shadow-soft"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png.jpg"
          alt="Masarak"
          className="w-full h-full object-cover"
        />
      </div>

      {showSubtitle && (
        <div className={`flex flex-col leading-tight ${subtitleColor}`}>
          <span className="text-lg font-extrabold tracking-tight">مسارك</span>
          <span className="text-[10px] font-medium opacity-70">منصة الطلاب</span>
        </div>
      )}
    </div>
  );
}
