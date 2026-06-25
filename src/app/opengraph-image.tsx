// المسار في المشروع: src/app/opengraph-image.tsx
// OG Image — Latin only (Arabic incompatible with @vercel/og default fonts)
// =====================================================

import { ImageResponse } from 'next/og';

export const alt = 'Masarak - Lebanese Student Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
// Generate on-demand (avoids a @vercel/og static-export quirk in local builds).
export const dynamic = 'force-dynamic';

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
          background: 'linear-gradient(135deg, #0F4A52 0%, #1A8C7A 50%, #95D5C5 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: 80,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 32,
            fontSize: 80,
            fontWeight: 800,
            marginBottom: 40,
            border: '3px solid rgba(255,255,255,0.25)',
          }}
        >
          M
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            marginBottom: 20,
            textAlign: 'center',
            letterSpacing: '-2px',
          }}
        >
          Masarak
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            textAlign: 'center',
            opacity: 0.95,
            marginBottom: 30,
            maxWidth: 900,
          }}
        >
          Lebanese Student Platform - Universities, Scholarships, Tools
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            opacity: 0.85,
            padding: '12px 32px',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 100,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          🇱🇧 Made for Lebanese Students
        </div>
      </div>
    ),
    { ...size }
  );
}
