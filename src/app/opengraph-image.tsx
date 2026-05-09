// src/app/opengraph-image.tsx
// OG image ديناميكي

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'مسارك — بوابة الطلاب اللبنانيين';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0F5D3D 0%, #1A8456 60%, #2DB87D 100%)',
          padding: '80px',
          color: 'white',
          fontFamily: 'system-ui',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 60,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: 'white',
              color: '#0F5D3D',
              fontSize: 56,
              fontWeight: 900,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            م
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              display: 'flex',
            }}
          >
            مسارك
          </div>
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 30,
            display: 'flex',
            maxWidth: 1000,
          }}
        >
          بوابة الطلاب اللبنانيين
        </div>

        <div
          style={{
            fontSize: 36,
            fontWeight: 400,
            opacity: 0.95,
            display: 'flex',
            maxWidth: 1000,
            lineHeight: 1.4,
          }}
        >
          اكتشف تخصصك، اختر جامعتك، احصل على منح، وابنِ سيرتك الذاتية — مجاناً
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            right: 80,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 28,
            opacity: 0.85,
          }}
        >
          <div style={{ display: 'flex', gap: 30 }}>
            <span>جامعات</span>
            <span>منح دراسية</span>
            <span>تدريب</span>
            <span>CV Builder</span>
          </div>
          <div style={{ display: 'flex' }}>masaraklb.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
