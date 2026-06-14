// src/lib/adminLog.ts
// Append an audit row every time the admin does something material.
// Used by every admin action button so we have a full audit trail.

import { supabase } from '@/lib/supabase';

export type AdminActionType =
  | 'user_suspend' | 'user_unsuspend' | 'user_verify' | 'user_delete' | 'user_tag'
  | 'university_create' | 'university_update' | 'university_delete' | 'university_approve' | 'university_feature' | 'university_verify'
  | 'school_create' | 'school_update' | 'school_delete' | 'school_approve' | 'school_verify'
  | 'invite_create' | 'invite_revoke'
  | 'subscription_grant' | 'subscription_revoke' | 'subscription_extend'
  | 'org_request_approve' | 'org_request_reject'
  | 'notification_send' | 'broadcast_send'
  | 'support_ticket_resolve' | 'support_ticket_assign'
  | 'ai_briefing_generate' | 'ai_insight_generate'
  | 'admin_login' | 'admin_logout';

export async function logAdminAction(opts: {
  action: AdminActionType | string;
  target_type?: string;
  target_id?: string | number;
  reason?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const email = (user?.email as string | undefined) || 'unknown';
    await supabase.from('admin_actions').insert({
      admin_email: email,
      action: opts.action,
      target_type: opts.target_type || null,
      target_id: opts.target_id != null ? String(opts.target_id) : null,
      reason: opts.reason || null,
      details: opts.details || {},
    });
  } catch (e) {
    console.debug('[adminLog] swallowed', e);
  }
}
