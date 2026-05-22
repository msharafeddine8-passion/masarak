// src/lib/org.ts — Multi-tenant organization helpers (Phase 1)
import { supabase } from '@/lib/supabase';

export type OrgType = 'university' | 'school' | 'vocational' | 'center';
export type OrgStatus = 'unclaimed' | 'pending' | 'verified' | 'rejected';
export type OrgRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Organization {
  id: string;
  org_type: OrgType;
  entity_id: number | null;
  slug: string;
  display_name: string;
  verification_status: OrgStatus;
  claimed_by: string | null;
  claim_note: string | null;
  claimed_at: string | null;
  verified_at: string | null;
  rejected_reason: string | null;
  tagline: string | null;
  about: string | null;
  banner_url: string | null;
  logo_url: string | null;
  social: Record<string, string>;
  settings: Record<string, unknown>;
  is_active: boolean;
}

export interface OrgMembership {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
}

// ── Reads ────────────────────────────────────────────────────────────────

/** Search organizations by name — used in the claim flow. */
export async function searchOrganizations(query: string, type?: OrgType) {
  let q = supabase
    .from('organizations')
    .select('id, org_type, entity_id, slug, display_name, logo_url, verification_status, claimed_by')
    .ilike('display_name', `%${query}%`)
    .eq('is_active', true)
    .limit(20);
  if (type) q = q.eq('org_type', type);
  const { data, error } = await q;
  if (error) return [];
  return data || [];
}

/** Get one org by slug. */
export async function fetchOrgBySlug(slug: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations').select('*').eq('slug', slug).maybeSingle();
  if (error || !data) return null;
  return data as Organization;
}

/** Get the org row attached to an existing entity (university/school/vocational). */
export async function fetchOrgForEntity(type: OrgType, entityId: number): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations').select('*')
    .eq('org_type', type).eq('entity_id', entityId).maybeSingle();
  if (error || !data) return null;
  return data as Organization;
}

/** All org memberships for the current user (joined with org summary). */
export async function fetchMyOrgs(userId: string) {
  const { data, error } = await supabase
    .from('org_members')
    .select('id, role, org_id, organizations(id, slug, display_name, org_type, logo_url, verification_status)')
    .eq('user_id', userId);
  if (error) return [];
  return data || [];
}

/** The current user's membership row for one org (or null). */
export async function fetchMyMembership(orgId: string, userId: string): Promise<OrgMembership | null> {
  const { data, error } = await supabase
    .from('org_members').select('*')
    .eq('org_id', orgId).eq('user_id', userId).maybeSingle();
  if (error || !data) return null;
  return data as OrgMembership;
}

/** Set of entity ids that have a VERIFIED org — used to show the blue badge. */
export async function fetchVerifiedEntityIds(type: OrgType): Promise<Set<number>> {
  const { data, error } = await supabase
    .from('organizations')
    .select('entity_id')
    .eq('org_type', type)
    .eq('verification_status', 'verified');
  if (error || !data) return new Set();
  return new Set(data.map((r) => r.entity_id as number).filter((x) => x != null));
}

// ── Access requests (institution → admin) ────────────────────────────────

export interface OrgAccessRequest {
  id: string;
  org_id: string;
  user_id: string;
  requester_email: string | null;
  note: string;
  status: 'pending' | 'granted' | 'rejected';
  reject_reason: string | null;
  created_at: string;
  // joined
  organizations?: { id: string; display_name: string; org_type: OrgType; logo_url: string | null };
}

/** Institution submits a request to manage its page. */
export async function requestOrgAccess(
  orgId: string, userId: string, email: string, note: string,
) {
  const { error } = await supabase.from('org_access_requests').insert({
    org_id: orgId, user_id: userId, requester_email: email, note, status: 'pending',
  });
  return { error: error?.message ?? null };
}

/** The current user's own requests (to show "pending review"). */
export async function fetchMyRequests(userId: string): Promise<OrgAccessRequest[]> {
  const { data, error } = await supabase
    .from('org_access_requests')
    .select('*, organizations(id, display_name, org_type, logo_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []) as OrgAccessRequest[];
}

/** Platform admin: all pending requests (the review inbox). */
export async function fetchPendingRequests(): Promise<OrgAccessRequest[]> {
  const { data, error } = await supabase
    .from('org_access_requests')
    .select('*, organizations(id, display_name, org_type, logo_url)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) return [];
  return (data || []) as OrgAccessRequest[];
}

/** Platform admin: GRANT access — link the user as owner + verify the org. */
export async function grantOrgAccess(req: OrgAccessRequest, reviewerId: string) {
  const now = new Date().toISOString();
  // 1. link the requester as owner of the org
  const { error: e1 } = await supabase
    .from('org_members')
    .upsert({ org_id: req.org_id, user_id: req.user_id, role: 'owner' },
            { onConflict: 'org_id,user_id' });
  if (e1) return { error: e1.message };
  // 2. verify the org
  const { error: e2 } = await supabase.from('organizations').update({
    verification_status: 'verified',
    claimed_by: req.user_id,
    claimed_at: now,
    verified_at: now,
    rejected_reason: null,
  }).eq('id', req.org_id);
  if (e2) return { error: e2.message };
  // 3. mark the request granted
  const { error: e3 } = await supabase.from('org_access_requests').update({
    status: 'granted', reviewed_by: reviewerId, reviewed_at: now,
  }).eq('id', req.id);
  if (e3) return { error: e3.message };
  return { error: null };
}

/** Platform admin: reject a request. */
export async function rejectRequest(reqId: string, reviewerId: string, reason: string) {
  return supabase.from('org_access_requests').update({
    status: 'rejected', reviewed_by: reviewerId,
    reviewed_at: new Date().toISOString(), reject_reason: reason,
  }).eq('id', reqId);
}

/** Org manager: update presentation fields. */
export async function updateOrg(orgId: string, patch: Partial<Organization>) {
  return supabase.from('organizations').update(patch).eq('id', orgId);
}

// ── Media ────────────────────────────────────────────────────────────────

export interface OrgMedia {
  id: string;
  org_id: string;
  kind: 'photo' | 'video';
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export async function fetchOrgMedia(orgId: string): Promise<OrgMedia[]> {
  const { data, error } = await supabase
    .from('org_media').select('*').eq('org_id', orgId)
    .order('sort_order', { ascending: true });
  if (error) return [];
  return (data || []) as OrgMedia[];
}

export async function addOrgMedia(
  orgId: string, kind: 'photo' | 'video', url: string, caption: string, userId: string,
) {
  return supabase.from('org_media').insert({
    org_id: orgId, kind, url, caption: caption || null,
    sort_order: Date.now() % 100000, created_by: userId,
  });
}

export async function deleteOrgMedia(id: string) {
  return supabase.from('org_media').delete().eq('id', id);
}

// ── Events ───────────────────────────────────────────────────────────────

export type EventType = 'open_day' | 'workshop' | 'deadline' | 'competition' | 'webinar' | 'other';

export interface OrgEvent {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  cover_url: string | null;
  event_type: EventType;
  is_public: boolean;
}

export async function fetchOrgEvents(orgId: string): Promise<OrgEvent[]> {
  const { data, error } = await supabase
    .from('org_events').select('*').eq('org_id', orgId)
    .order('starts_at', { ascending: true });
  if (error) return [];
  return (data || []) as OrgEvent[];
}

/** Upcoming public events for a verified org — used by the Campus Life section. */
export async function fetchUpcomingEvents(orgId: string, limit = 4): Promise<OrgEvent[]> {
  const { data, error } = await supabase
    .from('org_events').select('*')
    .eq('org_id', orgId).eq('is_public', true)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true }).limit(limit);
  if (error) return [];
  return (data || []) as OrgEvent[];
}

export async function saveOrgEvent(ev: Partial<OrgEvent> & { org_id: string }, userId: string) {
  const payload = { ...ev, created_by: userId };
  if (ev.id) return supabase.from('org_events').update(payload).eq('id', ev.id);
  return supabase.from('org_events').insert(payload);
}

export async function deleteOrgEvent(id: string) {
  return supabase.from('org_events').delete().eq('id', id);
}

// ── Announcements ────────────────────────────────────────────────────────

export interface OrgAnnouncement {
  id: string;
  org_id: string;
  title: string;
  body: string | null;
  pinned: boolean;
  is_public: boolean;
  created_at: string;
}

export async function fetchOrgAnnouncements(orgId: string): Promise<OrgAnnouncement[]> {
  const { data, error } = await supabase
    .from('org_announcements').select('*').eq('org_id', orgId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []) as OrgAnnouncement[];
}

export async function saveOrgAnnouncement(
  a: Partial<OrgAnnouncement> & { org_id: string }, userId: string,
) {
  const payload = { ...a, created_by: userId };
  if (a.id) return supabase.from('org_announcements').update(payload).eq('id', a.id);
  return supabase.from('org_announcements').insert(payload);
}

export async function deleteOrgAnnouncement(id: string) {
  return supabase.from('org_announcements').delete().eq('id', id);
}

export const ORG_TYPE_LABEL: Record<OrgType, string> = {
  university: 'جامعة',
  school: 'مدرسة',
  vocational: 'معهد مهني',
  center: 'مركز تعليمي',
};

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  open_day: '🚪 يوم مفتوح',
  workshop: '🛠️ ورشة عمل',
  deadline: '⏰ موعد نهائي',
  competition: '🏆 مسابقة',
  webinar: '💻 ندوة أونلاين',
  other: '📌 أخرى',
};
