import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Per-school shareable OG card (Schools Rebuild spec H2 — "generate per-school OG
 * cards"). GET /api/og/school?name=NAME&type=نوع&loc=المكان&meta=مراحل·منهج
 * Returns a 1200x630 PNG for OG meta + Twitter card + WhatsApp preview. Every
 * value is real, passed by the profile page from that school's row.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get('name') || 'مدرسة').slice(0, 60);
  const type = (searchParams.get('type') || '').slice(0, 20);
  const loc = (searchParams.get('loc') || '').slice(0, 50);
  const meta = (searchParams.get('meta') || '').slice(0, 80);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px', height: '630px', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(135deg, #012730 0%, #1b3a6b 60%, #2c5d8f 100%)',
          color: 'white', fontFamily: 'sans-serif', padding: '64px', position: 'relative',
        }}
      >
        {/* Top brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '14px',
            background: '#97DED0', color: '#012730', fontSize: '34px', fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>م</div>
          <div style={{ fontSize: '32px', fontWeight: 800 }}>مسارك · دليل المدارس</div>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1, justifyContent: 'center' }}>
          {loc && <div style={{ fontSize: '30px', opacity: 0.85 }}>📍 {loc}</div>}
          <div style={{ fontSize: '64px', fontWeight: 900, lineHeight: 1.12, color: '#97DED0' }}>
            {name}
          </div>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {type && (
              <div style={{
                background: 'rgba(255,255,255,0.14)', fontSize: '28px', fontWeight: 700,
                padding: '8px 22px', borderRadius: '999px',
              }}>{type}</div>
            )}
            {meta && (
              <div style={{
                background: 'rgba(255,255,255,0.14)', fontSize: '28px',
                padding: '8px 22px', borderRadius: '999px',
              }}>{meta}</div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '36px', paddingTop: '24px', borderTop: '2px solid rgba(255,255,255,0.15)',
        }}>
          <div style={{ fontSize: '24px', opacity: 0.8 }}>معلومات المدرسة، التواصل، وآراء الطلاب</div>
          <div style={{
            background: '#F97316', color: 'white', fontSize: '26px', fontWeight: 800,
            padding: '14px 28px', borderRadius: '14px',
          }}>masaraklb.com</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
