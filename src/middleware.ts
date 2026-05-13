// src/middleware.ts
// Auth gate + session refresh — كل صفحة، الجلسة تنحدّث تلقائياً
// + admin محمي بإيميل واحد فقط
// =====================================================

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_EMAILS = ['msharafeddine8@gmail.com'];

// الصفحات اللي يمكن الوصول لها بدون تسجيل دخول
const PUBLIC_PATHS = [
  '/',                   // الرئيسية
  '/about',              // عن مسارك
  '/contact',            // تواصل
  '/privacy',            // الخصوصية
  '/terms',              // الشروط
  '/faq',                // الأسئلة الشائعة
  '/changelog',          // الأخبار
  '/pricing',            // الباقات
  '/pricing-school',     // باقات المدارس
  '/premium',            // ميزات بريميوم
  '/for-students',
  '/for-parents',
  '/for-schools',
  '/for-universities',
];

// مسارات تبدأ بأي من هذه = public
const PUBLIC_PREFIXES = [
  '/auth/',              // login, register, callback
  '/_next/',             // Next.js internals
  '/api/',               // API routes (يحمي نفسه)
  '/icon',
  '/apple-icon',
  '/opengraph-image',
  '/manifest',
  '/robots',
  '/sitemap',
  '/favicon',
  '/blog',               // المدوّنة
  '/guides',             // الإرشادات
];

const ADMIN_PREFIXES = ['/admin', '/school-admin'];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  // ملفات ثابتة (ids, png, ico, etc)
  if (/\.(png|jpg|jpeg|gif|svg|ico|webmanifest|json|xml|txt)$/i.test(pathname)) return true;
  return false;
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✨ خطوة حيوية: ننشئ Supabase client على كل request ليحدّث الـ session cookies
  // هاد الـ getSession() بيرجع/يجدّد الـ access token تلقائياً قبل ما ينتهي
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // إذا الصفحة عامّة، خلّينا نمرر بـ res (مع الكوكيز المحدّثة)
  if (isPublicPath(pathname) && !isAdminPath(pathname)) {
    return res;
  }

  // الصفحة محمية، لازم session
  if (!session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // مسجّل دخول، نفحص إذا الصفحة admin
  if (isAdminPath(pathname)) {
    const userEmail = (session.user.email || '').toLowerCase();
    const isAdmin = ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(userEmail);
    if (!isAdmin) {
      const home = req.nextUrl.clone();
      home.pathname = '/';
      return NextResponse.redirect(home);
    }
  }

  return res;
}

export const config = {
  matcher: [
    // طبّق على كل الصفحات إلا الـ static
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
