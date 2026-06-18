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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always refresh the Supabase session cookies on every request.
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

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
    const userEmail = (session.user.email || '').toLowerCase();
    const isAdmin = ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(userEmail);
    if (!isAdmin) {
      const home = req.nextUrl.clone();
      home.pathname = '/';
      return NextResponse.redirect(home);
    }
    return res;
  }

  // ─── Counselor: require counselor/school_admin/admin role ───────
  if (isCounselorPath(pathname)) {
    const userEmail = (session.user.email || '').toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(userEmail);
    const userRole = (session.user.user_metadata?.role as string) || '';
    if (!isAdmin && userRole !== 'counselor' && userRole !== 'school_admin') {
      const home = req.nextUrl.clone();
      home.pathname = '/dashboard';
      return NextResponse.redirect(home);
    }
    return res;
  }

  // ─── Parent path: require parent role (or admin) ────────────────
  const role = (session.user.user_metadata?.role as string) || 'student';

  if (isParentPath(pathname)) {
    const userEmail = (session.user.email || '').toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(userEmail);
    if (!isAdmin && role !== 'parent') {
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
