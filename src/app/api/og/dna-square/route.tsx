import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Sprint 4.4: square 1080x1080 version for Instagram posts.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const primary = (searchParams.get('primary') || 'مسارك المهني').slice(0, 40);
  const secondary = (searchParams.get('secondary') || '').slice(0, 40);
  const name = (searchParams.get('name') || '').slice(0, 30);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1080px',
          height: '1080px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #012730 0%, #1b3a6b 60%, #2c5d8f 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '60px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '16px',
            background: '#97DED0', color: '#012730', fontSize: '40px', fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>م</div>
          <div style={{ fontSize: '40px', fontWeight: 800 }}>مسارك</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, justifyContent: 'center' }}>
          <div style={{ fontSize: '36px', opacity: 0.85 }}>
            🧬 نتيجة Career DNA{name ? ` لـ ${name}` : ''}
          </div>
          <div style={{
            fontSize: '110px', fontWeight: 900, lineHeight: 1.1, color: '#97DED0',
          }}>
            {primary}
          </div>
          {secondary && (
            <div style={{ fontSize: '48px', opacity: 0.9 }}>
              مسار ثانوي: {secondary}
            </div>
          )}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '40px', paddingTop: '24px', borderTop: '2px solid rgba(255,255,255,0.15)',
        }}>
          <div style={{ fontSize: '32px', opacity: 0.8 }}>اكتشف مسارك</div>
          <div style={{
            background: '#F97316', color: 'white', fontSize: '36px', fontWeight: 800,
            padding: '18px 32px', borderRadius: '16px',
          }}>
            masaraklb.com/career-dna
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
