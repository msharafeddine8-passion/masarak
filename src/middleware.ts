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
  '/universities',       // دليل الجامعات (public for SEO)
  '/schools',            // دليل المدارس
  '/majors',             // دليل التخصصات
  '/scholarships',       // المنح الدراسية
  '/careers',            // المسارات المهنية
  '/vocational',         // التعليم المهني
  '/internships',        // التدريب الصيفي
  '/career-dna',         // info page for Career DNA test
  '/team',               // فريقنا
];

const ADMIN_PREFIXES = ['/admin', '/school-admin'];

// Routes a Parent user is allowed on. Everything else redirects to /parent/dashboard.
// Public marketing pages stay accessible — only the student platform is blocked.
const PARENT_ALLOWED_PREFIXES = [
  '/parent/', '/auth/', '/api/', '/_next/',
  '/about', '/contact', '/privacy', '/terms', '/faq', '/changelog', '/team',
  '/for-parents', '/for-students', '/for-schools', '/for-universities',
  '/blog', '/guides',
];

// Routes an Org user (school/university) is allowed on. Everything else redirects to /org/dashboard.
const ORG_ALLOWED_PREFIXES = [
  '/org/', '/auth/', '/api/', '/_next/',
  '/about', '/contact', '/privacy', '/terms', '/faq', '/changelog', '/team',
  '/for-schools', '/for-universities', '/for-students', '/for-parents',
];

function isAllowedFor(pathname: string, allowed: string[]): boolean {
  if (pathname === '/' || pathname === '') return true;
  return allowed.some((p) => pathname === p || pathname.startsWith(p));
}

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
    return res;
  }

  // RBAC: route based on user type. Parent users see ONLY their dashboard.
  // Org users (school/university) see ONLY their org dashboard. Students get everything else.
  const role = (session.user.user_metadata?.role as string) || 'student';

  if (role === 'parent') {
    if (!isAllowedFor(pathname, PARENT_ALLOWED_PREFIXES)) {
      const url = req.nextUrl.clone();
      url.pathname = '/parent/dashboard';
      return NextResponse.redirect(url);
    }
    return res;
  }

  // Check if signed-in user owns/manages an org. If yes, lock them to org dashboard.
  // We query org_members directly to avoid a circular import of lib/org.ts.
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

  // Student users: allow everything that isn't admin (already handled above).
  return res;
}

export const config = {
  matcher: [
    // طبّق على كل الصفحات إلا الـ static
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
