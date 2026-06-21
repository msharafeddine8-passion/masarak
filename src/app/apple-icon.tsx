// المسار في المشروع: src/app/apple-icon.tsx
// Apple Touch Icon — اللون الكحلي #1b3a6b
// =====================================================

import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';
// Generate on-demand (avoids a @vercel/og static-export quirk in local builds).
export const dynamic = 'force-dynamic';

export default function AppleIcon() {
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
          background: 'linear-gradient(135deg, #1b3a6b 0%, #2d5391 100%)',
          color: 'white',
          fontWeight: 800,
          fontSize: 100,
          fontFamily: 'sans-serif',
          borderRadius: 36,
        }}
      >
        م
      </div>
    ),
    { ...size }
  );
}
