/**
 * POST /api/card/ensure
 * ─────────────────────
 * يتأكد إن الطالب عنده صف في student_cards.
 * لو ما في — يُنشئ واحداً (الـ masarak_id يُولَّد تلقائياً بـ DB trigger).
 *
 * لا يُرجع خطأ لو الصف موجود (ON CONFLICT DO NOTHING).
 * آمن للاستدعاء المتعدد (idempotent).
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });

  // التحقق من الجلسة
  const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr || !session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // محاولة INSERT — لو موجود → conflict مُتجاهَل
  const { error: insertErr } = await supabase
    .from('student_cards')
    .insert({ user_id: userId })
    .select()
    .maybeSingle();

  // Conflict (23505) = الصف موجود مسبقاً → مش خطأ
  if (insertErr && insertErr.code !== '23505') {
    console.error('[card/ensure] insert error:', insertErr);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // اجلب الصف النهائي
  const { data: card, error: fetchErr } = await supabase
    .from('student_cards')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchErr || !card) {
    return NextResponse.json({ error: 'Card not found after ensure' }, { status: 500 });
  }

  return NextResponse.json({ card });
}
