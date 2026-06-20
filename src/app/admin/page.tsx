/**
 * src/app/admin/page.tsx — FIX-07: Remove client-side password gate
 *
 * BEFORE: Used a hardcoded ADMIN_KEY ("masarak_admin_2026") visible in the
 *         client JS bundle — trivially bypassable + bad security hygiene.
 *
 * AFTER:  Auth is handled entirely by middleware (src/middleware.ts), which
 *         verifies the signed-in user's email against ADMIN_EMAILS env var.
 *         This page simply redirects to /admin/dashboard — the real admin UI.
 */
import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/dashboard');
}
