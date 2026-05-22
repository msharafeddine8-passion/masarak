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

/** Orgs awaiting platform-admin review. */
export async function fetchPendingOrgs(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations').select('*')
    .eq('verification_status', 'pending')
    .order('claimed_at', { ascending: true });
  if (error) return [];
  return (data || []) as Organization[];
}

// ── Writes ───────────────────────────────────────────────────────────────

/** Step 1 of claiming: flip an unclaimed org to pending + record the claimer. */
export async function submitClaim(orgId: string, userId: string, note: string) {
  // 1. flip the org to pending (RLS org_claim policy: only unclaimed→pending allowed)
  const { error: e1 } = await supabase
    .from('organizations')
    .update({
      verification_status: 'pending',
      claimed_by: userId,
      claim_note: note,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', orgId)
    .eq('verification_status', 'unclaimed');
  if (e1) return { error: e1.message };

  // 2. create the claimer as owner (RLS members_claim_owner: only if org has 0 members)
  const { error: e2 } = await supabase
    .from('org_members')
    .insert({ org_id: orgId, user_id: userId, role: 'owner' });
  if (e2) return { error: e2.message };

  return { error: null };
}

/** Platform admin: approve a pending claim. */
export async function approveOrg(orgId: string) {
  return supabase.from('organizations').update({
    verification_status: 'verified',
    verified_at: new Date().toISOString(),
    rejected_reason: null,
  }).eq('id', orgId);
}

/** Platform admin: reject a pending claim (returns it to unclaimed). */
export async function rejectOrg(orgId: string, reason: string) {
  return supabase.from('organizations').update({
    verification_status: 'unclaimed',
    claimed_by: null,
    claimed_at: null,
    claim_note: null,
    rejected_reason: reason,
  }).eq('id', orgId);
}

/** Org manager: update presentation fields. */
export async function updateOrg(orgId: string, patch: Partial<Organization>) {
  return supabase.from('organizations').update(patch).eq('id', orgId);
}

export const ORG_TYPE_LABEL: Record<OrgType, string> = {
  university: 'جامعة',
  school: 'مدرسة',
  vocational: 'معهد مهني',
  center: 'مركز تعليمي',
};
