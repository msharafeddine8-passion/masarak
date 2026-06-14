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
// 1. Upsert org_lead with score +30
// 2. Notify org owners
async function onStudentSavedUniversity(payload: EventPayload, userId: string | null) {
  if (!userId) return;
  const universityId = payload.entity_id ?? payload.id;
  if (!universityId) return;

  // Find the org for this university (universities.org_id or similar)
  // We try multiple table shapes (org_id, organization_id) for safety
  const { data: uni } = await supabase
    .from('universities')
    .select('id, name_ar, name, org_id')
    .eq('id', universityId)
    .maybeSingle();
  const orgId = (uni as { org_id?: string } | null)?.org_id;
  if (!orgId) return; // no claimed org yet → nothing to do

  // 1. Upsert lead (+30 score for save action)
  await supabase.rpc('upsert_org_lead', {
    p_org_id: orgId,
    p_student_id: userId,
    p_source: 'save',
    p_score_delta: 30,
  });

  // 2. Notify org owners
  const { data: members } = await supabase
    .from('org_members')
    .select('user_id, role')
    .eq('org_id', orgId)
    .in('role', ['owner', 'editor']);

  const name = (uni as { name_ar?: string; name?: string })?.name_ar || (uni as { name?: string })?.name || 'مؤسستك';
  for (const m of (members || []) as { user_id: string }[]) {
    await supabase.from('notifications').insert({
      user_id: m.user_id,
      type: 'org.new_lead',
      title: 'طالب جديد مهتم بـ' + ' ' + name,
      body: 'حفظ صفحة مؤسستك طالب جديد. اطّلع على ملفه من قسم Leads.',
      link_url: '/org/dashboard?tab=leads',
      severity: 'success',
      entity_type: 'university',
      entity_id: String(universityId),
    });
  }
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
