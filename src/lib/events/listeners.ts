// src/lib/events/listeners.ts
// Side-effect listeners that fire when canonical events happen.
// Per ARCHITECTURE.md §3.3: events drive everything.
//
// This file is called by emit() (in emit.ts) AFTER the event is logged.
// Each listener is fire-and-forget — never blocks UI, never throws.

import { supabase } from '@/lib/supabase';
import type { CanonicalEventName, EventPayload } from './types';

/**
 * Master dispatcher — called by emit() after logging.
 * Routes events to their side-effect listeners.
 */
export async function fireListeners(name: CanonicalEventName, payload: EventPayload, userId: string | null) {
  try {
    switch (name) {
      case 'student.saved_university':
        await onStudentSavedUniversity(payload, userId);
        break;
      case 'student.completed_dna':
        await onStudentCompletedDna(payload, userId);
        break;
      case 'student.registered':
        await onStudentRegistered(payload, userId);
        break;
      case 'student.applied_scholarship':
        await onStudentAppliedScholarship(payload, userId);
        break;
      default:
        // No listener — that's fine, the event is still logged
        break;
    }
  } catch (e) {
    console.debug('[listeners] swallowed', e);
  }
}

// ─── student.saved_university ──────────────────────────────────────────────
// Delegates to the server-side SECURITY DEFINER RPC `record_university_save`
// (migration 20260624_fix01_lead_funnel.sql), which:
//   1. resolves the org via organizations.entity_id (the REAL link — the old
//      client code read universities.org_id, a column that does not exist),
//   2. upserts the lead idempotently (+30 only on first save),
//   3. notifies org owners (a student cannot read org_members under RLS).
// The whole side-effect must run server-side; doing it in the browser is why
// it silently never worked.
async function onStudentSavedUniversity(payload: EventPayload, userId: string | null) {
  if (!userId) return;
  const universityId = payload.entity_id ?? payload.id;
  const uniIdNum = Number(universityId);
  if (!universityId || Number.isNaN(uniIdNum)) return;

  await supabase.rpc('record_university_save', { p_university_id: uniIdNum });
}

// ─── student.completed_dna ─────────────────────────────────────────────────
// Notify the student (+ linked parents if any)
async function onStudentCompletedDna(_payload: EventPayload, userId: string | null) {
  if (!userId) return;

  // Welcome message to the student
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'student.dna_completed',
    title: '🧬 رائع! خلّصت اختبار Career DNA',
    body: 'اطّلع على نتيجتك وخصوصياتك المهنية + الاقتراحات المخصّصة لك.',
    link_url: '/career-dna/result',
    severity: 'success',
  });

  // Notify linked parents (if any)
  const { data: links } = await supabase
    .from('parent_student_links')
    .select('parent_id')
    .eq('student_id', userId);
  for (const l of (links || []) as { parent_id: string }[]) {
    await supabase.from('notifications').insert({
      user_id: l.parent_id,
      type: 'parent.student_milestone',
      title: '🎉 ابنك خلّص اختبار Career DNA',
      body: 'افتح ملف ابنك لتشوف نتيجة الاختبار والاقتراحات.',
      link_url: '/parent',
      severity: 'success',
    });
  }
}

// ─── student.registered ────────────────────────────────────────────────────
// Welcome notification to self
async function onStudentRegistered(_payload: EventPayload, userId: string | null) {
  if (!userId) return;
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'student.welcome',
    title: 'أهلاً وسهلاً بك على مسارك! 🎉',
    body: 'ابدأ رحلتك باختبار Career DNA لاكتشاف ميولك المهنية.',
    link_url: '/career-dna',
    severity: 'info',
  });
}

// ─── student.applied_scholarship ───────────────────────────────────────────
async function onStudentAppliedScholarship(payload: EventPayload, userId: string | null) {
  if (!userId) return;
  const scholarshipId = payload.entity_id;
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'student.scholarship_applied',
    title: '✓ تم تسجيل طلبك للمنحة',
    body: 'بنخلّيك على اطّلاع بكل تحديث. اضغط لمتابعة الطلب.',
    link_url: scholarshipId ? `/scholarships/${scholarshipId}` : '/scholarships',
    severity: 'success',
    entity_type: 'scholarship',
    entity_id: scholarshipId ? String(scholarshipId) : null,
  });
}
