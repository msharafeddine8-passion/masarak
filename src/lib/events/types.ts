// src/lib/events/types.ts
// Typed event catalog — single source of truth for Masarak events.
// See: docs/ARCHITECTURE.md §3, §11

export type CanonicalEventName =
  // Student lifecycle
  | 'student.registered'
  | 'student.completed_dna'
  | 'student.viewed_university'
  | 'student.saved_university'
  | 'student.unsaved_university'
  | 'student.viewed_scholarship'
  | 'student.saved_scholarship'
  | 'student.applied_scholarship'
  | 'student.viewed_school'
  | 'student.saved_school'
  | 'student.created_cv'
  | 'student.daily_challenge_done'
  | 'student.streak_milestone'
  // Parent
  | 'parent.linked_student'
  | 'parent.viewed_student_progress'
  // Organization
  | 'org.invite_sent'
  | 'org.invite_redeemed'
  | 'org.profile_updated'
  | 'org.media_added'
  | 'org.published_event'
  | 'org.published_scholarship'
  | 'org.published_announcement'
  | 'org.received_lead'
  | 'org.contacted_lead'
  | 'org.profile_verified'
  // Sponsor
  | 'sponsor.campaign_created'
  | 'sponsor.campaign_impression'
  | 'sponsor.campaign_click'
  | 'sponsor.campaign_lead'
  // System
  | 'system.payment_received'
  | 'system.subscription_started'
  | 'system.subscription_canceled'
  | 'admin.suspended_user'
  | 'admin.deleted_content';

export type EventPayload = {
  // Required for routing & analytics
  user_id?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  // Free-form properties — typed per event in your callsite
  [key: string]: unknown;
};
