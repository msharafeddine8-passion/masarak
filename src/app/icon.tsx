// المسار في المشروع: src/app/icon.tsx
// favicon ديناميكي — اللون الكحلي #1b3a6b
// =====================================================

import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1b3a6b 0%, #2d5391 100%)',
          color: 'white',
          fontWeight: 800,
          fontSize: 20,
          fontFamily: 'sans-serif',
          borderRadius: 6,
        }}
      >
        م
      </div>
    ),
    { ...size }
  );
}
