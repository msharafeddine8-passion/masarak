// src/lib/permissions/context.ts
// Resolves a Supabase user into the UserContext consumed by can()/mustCan().
// This is the previously-missing bridge that makes lib/permissions actually
// usable in middleware, server routes, and the UI (audit finding A2).
//
// Authorization is read from app_metadata (server-only, NOT user-writable) first,
// with user_metadata + the legacy admin email as backwards-compatible fallbacks
// — the same precedence the middleware uses.

import type { UserContext } from './can';
import { ADMIN_EMAIL, type Role } from './capabilities';

type SupabaseUserish = {
  id: string;
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
} | null | undefined;

/** True if the user is a super admin via the app_metadata flag or the legacy email. */
export function isSuperAdminUser(user: SupabaseUserish): boolean {
  if (!user) return false;
  if ((user.app_metadata as { super_admin?: unknown } | null)?.super_admin === true) return true;
  return (user.email || '').toLowerCase() === ADMIN_EMAIL;
}

type Memberships = NonNullable<UserContext>['org_memberships'];

/** Map a Supabase user → UserContext for can()/mustCan(). */
export function getUserContext(
  user: SupabaseUserish,
  orgMemberships: Memberships = [],
): UserContext {
  if (!user) return null;
  const am = (user.app_metadata as { role?: string } | null) || {};
  const um = (user.user_metadata as { role?: string } | null) || {};
  const primary_role: Role = isSuperAdminUser(user)
    ? 'super_admin'
    : ((am.role as Role) || (um.role as Role) || 'student');
  return {
    id: user.id,
    email: user.email,
    primary_role,
    org_memberships: orgMemberships,
  };
}
