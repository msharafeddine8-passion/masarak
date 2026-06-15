'use client';
/**
 * CardExportButton — تصدير البطاقة كـ PNG بـ html2canvas
 * scale=2 → 1200×756 px
 * useCORS=true → يدعم صور Supabase Storage
 */

import { useState } from 'react';

interface CardExportButtonProps {
  cardRef: React.RefObject<HTMLDivElement>;
  masarakId: string;
  className?: string;
}

export default function CardExportButton({
  cardRef,
  masarakId,
  className = '',
}: CardExportButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleExport() {
    if (!cardRef.current) return;
    setStatus('loading');

    try {
      // Dynamic import — لا يُحمَّل html2canvas إلا عند الضرورة
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,               // 2× → 1200×756
        useCORS: true,          // ضروري للصور من Supabase Storage
        allowTaint: false,
        backgroundColor: null,  // نحافظ على الخلفية الـ CSS
        logging: false,
        // تعطيل الـ scrolling artifacts
        windowWidth: cardRef.current.scrollWidth,
        windowHeight: cardRef.current.scrollHeight,
      });

      // Convert → PNG data URL → trigger download
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `masarak-id-${masarakId}.png`;
      link.click();

      setStatus('done');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      console.error('[CardExport] failed:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  const labels: Record<typeof status, string> = {
    idle:    '⬇️ تحميل البطاقة PNG',
    loading: '⏳ جاري التصدير…',
    done:    '✅ تم التحميل!',
    error:   '❌ خطأ — حاول مجدداً',
  };

  const colors: Record<typeof status, string> = {
    idle:    'bg-[#D4AF37] hover:bg-[#B8960C] text-[#0F172A]',
    loading: 'bg-slate-600 text-white cursor-wait',
    done:    'bg-emerald-600 text-white',
    error:   'bg-red-600 text-white',
  };

  return (
    <button
      onClick={handleExport}
      disabled={status === 'loading'}
      className={`
        inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
        transition-all duration-300
        ${colors[status]}
        ${className}
      `}
    >
      {labels[status]}
    </button>
  );
}
