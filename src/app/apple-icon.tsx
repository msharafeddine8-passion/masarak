// src/app/apple-icon.tsx
// Apple Touch Icon

import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 130,
          fontWeight: 800,
          background:
            'linear-gradient(135deg, #0F5D3D 0%, #1A8456 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui',
        }}
      >
        م
      </div>
    ),
    { ...size }
  );
}
