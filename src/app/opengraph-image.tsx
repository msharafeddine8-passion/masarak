// المسار في المشروع: src/app/opengraph-image.tsx
// OG Image ديناميكي — كحلي + جمعية تكافل
// =====================================================

import { ImageResponse } from 'next/og';

export const alt = 'مسارك — منصّة طلاب لبنان | جمعية تكافل';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1b3a6b 0%, #2d5391 50%, #1b3a6b 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: 80,
          position: 'relative',
        }}
      >
        {/* شعار م */}
        <div
          style={{
            width: 140,
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 32,
            fontSize: 90,
            fontWeight: 800,
            marginBottom: 40,
            border: '3px solid rgba(255,255,255,0.25)',
          }}
        >
          م
        </div>

        {/* العنوان */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          مسارك
        </div>

        {/* الوصف */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            textAlign: 'center',
            opacity: 0.95,
            marginBottom: 30,
            maxWidth: 900,
          }}
        >
          منصّة الطلاب اللبنانيين — جامعات، منح، تخصصات، أدوات
        </div>

        {/* جمعية تكافل */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            opacity: 0.85,
            padding: '12px 32px',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 100,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          مشروع من جمعية تكافل
        </div>
      </div>
    ),
    { ...size }
  );
}
