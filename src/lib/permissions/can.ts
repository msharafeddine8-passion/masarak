// src/lib/permissions/can.ts
// The `can()` and `mustCan()` API used everywhere in the app.
// See: docs/ARCHITECTURE.md §2.3

import { CAPABILITIES, Role, ADMIN_EMAIL, type Capability } from './capabilities';

export type UserContext = {
  id: string;
  email?: string | null;
  primary_role?: Role;
  active_role?: Role | null;
  org_memberships?: Array<{ org_id: string; role: 'owner' | 'editor' | 'viewer' }>;
} | null | undefined;

export type ResourceContext = {
  // Resource-specific scope for ownership checks
  ownerId?: string;
  orgId?: string;
  organizationId?: string;
  studentId?: string;
};

/**
 * Check if a user has a capability. Returns boolean.
 * Use in UI to hide/show elements, or as the first check in API routes.
 *
 * Example:
 *   can(user, 'edit.org.profile.own', { orgId: 'aub' })
 *   can(user, 'view.notifications.self')
 */
export function can(
  user: UserContext,
  capability: Capability,
  resource: ResourceContext = {},
): boolean {
  if (!user) return false;

  // Special: ADMIN_EMAIL always has super_admin
  const isSuperAdmin =
    user.primary_role === 'super_admin' ||
    user.active_role === 'super_admin' ||
    (user.email && user.email.toLowerCase() === ADMIN_EMAIL);
  if (isSuperAdmin) return true;

  const role = (user.active_role || user.primary_role || 'student') as Role;
  const caps = CAPABILITIES[role] || [];

  if (caps.includes('*')) return true;
  if (!caps.includes(capability)) return false;

  // Resource-level ownership checks for .own / .self capabilities
  if (capability.endsWith('.self')) {
    return resource.ownerId ? resource.ownerId === user.id : true;
  }

  if (capability.endsWith('.own')) {
    const orgId = resource.orgId || resource.organizationId;
    if (!orgId) return true;  // generic "own" check without specific org
    return !!user.org_memberships?.some(m => m.org_id === orgId);
  }

  return true;
}

/**
 * Same as `can()` but throws on denial. Use in API routes / server actions.
 *
 * Example:
 *   mustCan(user, 'edit.org.profile.own', { orgId });
 *   // ... safe to proceed
 */
export class ForbiddenError extends Error {
  constructor(public capability: Capability) {
    super(`Forbidden: requires ${capability}`);
    this.name = 'ForbiddenError';
  }
}

export function mustCan(
  user: UserContext,
  capability: Capability,
  resource: ResourceContext = {},
): void {
  if (!can(user, capability, resource)) {
    throw new ForbiddenError(capability);
  }
}
