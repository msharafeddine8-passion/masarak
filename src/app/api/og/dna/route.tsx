import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Sprint 4.4: Shareable Career DNA result card.
 * GET /api/og/dna?primary=PATH&secondary=PATH&name=NAME
 * Returns a 1200x630 PNG suitable for OG meta + Twitter card + Instagram story.
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
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #012730 0%, #1b3a6b 60%, #2c5d8f 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Top brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '14px',
            background: '#97DED0', color: '#012730', fontSize: '34px', fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>م</div>
          <div style={{ fontSize: '32px', fontWeight: 800 }}>مسارك</div>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <div style={{ fontSize: '28px', opacity: 0.85 }}>
            🧬 نتيجة Career DNA{name ? ` لـ ${name}` : ''}
          </div>
          <div style={{
            fontSize: '72px', fontWeight: 900, lineHeight: 1.1,
            color: '#97DED0',
          }}>
            {primary}
          </div>
          {secondary && (
            <div style={{ fontSize: '36px', opacity: 0.9 }}>
              مسار ثانوي: {secondary}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '40px', paddingTop: '24px', borderTop: '2px solid rgba(255,255,255,0.15)',
        }}>
          <div style={{ fontSize: '24px', opacity: 0.8 }}>
            اكتشف مسارك المهني
          </div>
          <div style={{
            background: '#F97316', color: 'white', fontSize: '28px', fontWeight: 800,
            padding: '14px 28px', borderRadius: '14px',
          }}>
            masaraklb.com/career-dna
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
