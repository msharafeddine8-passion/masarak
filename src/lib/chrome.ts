/**
 * Routes that render as a dedicated, scoped admin surface — no student-facing
 * site chrome (header nav, footer, mobile bottom nav, back button).
 *
 * Institution accounts (university / school / vocational) live entirely inside
 * /org/dashboard and should never see the rest of the student site.
 * Platform admins live inside /admin.
 */
export function isChromelessRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname.startsWith('/org/dashboard') || pathname.startsWith('/admin');
}
