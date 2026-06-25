/**
 * POST /api/pdf/generate
 *
 * يُولّد PDF لملف الطالب باستخدام ClassicTemplate + @react-pdf/renderer.
 * يعمل على Node.js runtime فقط (ليس Edge).
 *
 * Auth: يتطلب session صالح (يولّد PDF للمستخدم الحالي فقط)
 * Response: application/pdf stream
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import React from 'react';
import { renderToStream, type DocumentProps } from '@react-pdf/renderer';
import { ClassicTemplate } from '@/lib/pdf/ClassicTemplate';
import { checkRateLimit, rateLimitResponse } from '@/lib/ratelimit';

// Force Node.js runtime — @react-pdf/renderer not compatible with Edge
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });

  // ── Auth check ──────────────────────────────────────────────────────────────
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // ── Rate limit (PDF rendering is CPU-expensive) ───────────────────────────────
  const rl = await checkRateLimit('ai', `pdf:${userId}`);
  if (!rl.success) return rateLimitResponse(rl);

  // ── Fetch card ───────────────────────────────────────────────────────────────
  const { data: card, error: cardErr } = await supabase
    .from('student_cards')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (cardErr || !card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  // ── Fetch profile ─────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('country, career_dna_result, full_name')
    .eq('user_id', userId)
    .single();

  // ── Fetch sections (visible in PDF) ────────────────────────────────────────
  const { data: sections } = await supabase
    .from('student_profile_sections')
    .select('id, section_type, title, subtitle, date_from, date_to, description')
    .eq('user_id', userId)
    .eq('is_visible_pdf', true)
    .order('sort_order', { ascending: true });

  // ── Render PDF ────────────────────────────────────────────────────────────
  try {
    const pdfStream = await (renderToStream as any)(
      React.createElement(ClassicTemplate as any, {
        card: {
          masarak_id:      card.masarak_id,
          display_name_ar: card.display_name_ar,
          display_name_en: card.display_name_en,
          birth_year:      card.birth_year,
          study_level:     card.study_level,
          created_at:      card.created_at,
        },
        profile: {
          country:           profile?.country           ?? null,
          career_dna_result: profile?.career_dna_result ?? null,
          full_name:         profile?.full_name         ?? null,
        },
        sections: sections ?? [],
      }) as React.ReactElement<DocumentProps>
    );

    // Convert Readable stream → Buffer → Response
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const filename = `masarak-profile-${card.masarak_id}.pdf`;
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.byteLength),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[PDF generate] error:', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}
