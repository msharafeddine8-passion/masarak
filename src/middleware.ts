// src/middleware.ts
// يحمي /admin/* و /school-admin/* بطلب جلسة Supabase
// =====================================================

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/admin', '/school-admin'];

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

  // مسجّل دخول لكن ليس admin → 404
  // ملاحظة: حدّد دور admin إما من user.app_metadata.role أو من جدول profiles.
  // لتفعيل الفحص بالـ DB، أزل التعليق عن الكتلة أدناه.
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('role')
  //   .eq('id', session.user.id)
  //   .single();
  //
  // const allowedAdminEmails = ['msharafeddine8@gmail.com'];
  // const isAdmin = profile?.role === 'admin' ||
  //   allowedAdminEmails.includes(session.user.email || '');
  //
  // if (!isAdmin) {
  //   const home = req.nextUrl.clone();
  //   home.pathname = '/';
  //   return NextResponse.redirect(home);
  // }

  return res;
}

// تطبيق الـ middleware على الـ paths المحدّدة فقط
export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/school-admin',
    '/school-admin/:path*',
  ],
};
