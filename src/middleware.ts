// src/middleware.ts
// يحمي /admin/* و /school-admin/* — فقط إيميلات admin محدّدة
// =====================================================

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/admin', '/school-admin'];

// قائمة إيميلات المسموح لها بالدخول للوحة الإدارة
// أضف إيميلك هنا أو احذف وأضف غيره
const ADMIN_EMAILS = [
  'msharafeddine8@gmail.com',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // طبّق فقط على الـ paths المحميّة
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(prefix + '/')
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // غير مسجّل دخول → حوّل إلى /auth/login مع رابط العودة
  if (!session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // مسجّل دخول لكن إيميله ليس في قائمة admin → حوّل للـ home
  const userEmail = (session.user.email || '').toLowerCase();
  const isAdmin = ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(userEmail);

  if (!isAdmin) {
    const home = req.nextUrl.clone();
    home.pathname = '/';
    return NextResponse.redirect(home);
  }

  return res;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/school-admin',
    '/school-admin/:path*',
  ],
};
