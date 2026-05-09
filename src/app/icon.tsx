// src/app/icon.tsx
// favicon ديناميكي

import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          background:
            'linear-gradient(135deg, #0F5D3D 0%, #1A8456 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: 8,
          fontFamily: 'system-ui',
        }}
      >
        م
      </div>
    ),
    { ...size }
  );
}
