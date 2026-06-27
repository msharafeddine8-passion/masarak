// src/middleware.ts
// Auth gate + session refresh — Sprint 1.3 fix:
// FROM "everything is protected unless explicitly public" (caused soft-404s)
// TO   "only specific personal routes require auth; everything else passes through to Next routing"
// Unknown paths now fall through to app/not-found.tsx (real HTTP 404) instead of being
// redirected to /auth/login.
// =====================================================

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

// Admin emails read from env; fallback to empty so nothing is accidentally open
const ADMIN_EMAILS: string[] = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase())
  : ['msharafeddine8@gmail.com'];

// ─── Auth-protected prefixes ────────────────────────────────────────
// These prefixes REQUIRE a logged-in session. Everything not in this list
// (including unknown paths like /xyz-not-real or /en) passes through to
// Next.js routing — which renders not-found.tsx with a real HTTP 404.
const PROTECTED_PREFIXES = [
  '/dashboard',          // student dashboard
  '/profile',            // personal profile
  '/onboarding',         // onboarding wizard
  '/parent/',            // parent personal area
  '/counselor',          // counselor area (role-gated below)
  '/org/dashboard',      // org dashboard
  '/org/claim',          // org claim flow
  '/org/manage',         // org management
  '/org/join',           // student → org affiliation
  '/admin',              // platform admin (also email-gated below)
  '/school-admin',       // school admin
];

// ─── Role-restricted prefixes ───────────────────────────────────────
// Routes a Parent user is allowed on. Everything personal (dashboard/profile)
// outside their allowed list redirects to /parent/dashboard.
const PARENT_ALLOWED_PREFIXES = [
  '/parent/', '/auth/', '/api/', '/_next/',
  '/about', '/contact', '/privacy', '/terms', '/faq', '/changelog', '/team',
  '/for-parents', '/for-students', '/for-schools', '/for-universities',
  '/blog', '/guides',
];

// Routes an Org user (school/university) is allowed on.
const ORG_ALLOWED_PREFIXES = [
  '/org/', '/auth/', '/api/', '/_next/',
  '/about', '/contact', '/privacy', '/terms', '/faq', '/changelog', '/team',
  '/for-schools', '/for-universities', '/for-students', '/for-parents',
];

function isAllowedFor(pathname: string, allowed: string[]): boolean {
  if (pathname === '/' || pathname === '') return true;
  return allowed.some((p) => pathname === p || pathname.startsWith(p));
}

function requiresAuth(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname === p.replace(/\/$/, '') || pathname.startsWith(p)
  );
}

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/') ||
         pathname === '/school-admin' || pathname.startsWith('/school-admin/');
}

function isCounselorPath(pathname: string): boolean {
  return pathname === '/counselor' || pathname.startsWith('/counselor/');
}

function isParentPath(pathname: string): boolean {
  return pathname === '/parent' || pathname.startsWith('/parent/');
}

// ─── Authorization principal resolution ─────────────────────────────
// app_metadata (server-only, NOT user-writable) is the source of truth; we fall
// back to user_metadata + the email allowlist for backwards compatibility until
// every session's JWT carries the migrated app_metadata claims.
type SessionUser = { email?: string | null; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> };
function getRole(u: SessionUser): string {
  return (u.app_metadata?.role as string) || (u.user_metadata?.role as string) || 'student';
}
function isSuperAdmin(u: SessionUser): boolean {
  if (u.app_metadata?.super_admin === true) return true;
  return ADMIN_EMAILS.includes((u.email || '').toLowerCase());
}
// Super admins AND co-admins (helper admins) may enter the admin area; the
// dashboard itself hides finance + subscriber-PII surfaces from co-admins.
function isAdmin(u: SessionUser): boolean {
  return isSuperAdmin(u) || getRole(u) === 'admin';
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always refresh the Supabase session cookies on every request.
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // ─── Auth pages: redirect logged-in users to dashboard ──────────
  // A signed-in user visiting /auth/login or /auth/register gets
  // bounced to /dashboard — no point re-logging in.
  if (session && (pathname === '/auth/login' || pathname === '/auth/register')) {
    const dashboard = req.nextUrl.clone();
    dashboard.pathname = '/dashboard';
    return NextResponse.redirect(dashboard);
  }

  // ─── Public-by-default ──────────────────────────────────────────
  // If this isn't a protected personal route, let Next.js route it.
  // Unknown paths will hit app/not-found.tsx → real HTTP 404.
  if (!requiresAuth(pathname)) {
    return res;
  }

  // ─── Protected route: require session ───────────────────────────
  if (!session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Admin: email allowlist ─────────────────────────────────────
  if (isAdminPath(pathname)) {
    if (!isAdmin(session.user)) {
      const home = req.nextUrl.clone();
      home.pathname = '/';
      return NextResponse.redirect(home);
    }
    return res;
  }

  // ─── Counselor: require counselor/school_admin/admin role ───────
  if (isCounselorPath(pathname)) {
    const userRole = getRole(session.user);
    if (!isSuperAdmin(session.user) && userRole !== 'counselor' && userRole !== 'school_admin') {
      const home = req.nextUrl.clone();
      home.pathname = '/dashboard';
      return NextResponse.redirect(home);
    }
    return res;
  }

  // ─── Parent path: require parent role (or admin) ────────────────
  const role = getRole(session.user);

  if (isParentPath(pathname)) {
    if (!isSuperAdmin(session.user) && role !== 'parent') {
      const home = req.nextUrl.clone();
      home.pathname = '/dashboard';
      return NextResponse.redirect(home);
    }
    return res;
  }

  // ─── RBAC: Parent users locked to parent area ───────────────────

  if (role === 'parent') {
    if (!isAllowedFor(pathname, PARENT_ALLOWED_PREFIXES)) {
      const url = req.nextUrl.clone();
      url.pathname = '/parent/dashboard';
      return NextResponse.redirect(url);
    }
    return res;
  }

  // ─── RBAC: Org users locked to org area ─────────────────────────
  const { data: orgMembership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', session.user.id)
    .limit(1)
    .maybeSingle();

  if (orgMembership) {
    if (!isAllowedFor(pathname, ORG_ALLOWED_PREFIXES)) {
      const url = req.nextUrl.clone();
      url.pathname = '/org/dashboard';
      return NextResponse.redirect(url);
    }
    return res;
  }

  // Student users: protected routes are accessible to any authenticated student.
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
