'use client';
// Fires a `page_view` analytics event on every client-side route change.
// trackPageView() existed in lib/analytics but was never mounted — this closes
// the top of the funnel (page_view was always 0 despite real traffic).
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const qs = searchParams?.toString();
    trackPageView(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams]);

  return null;
}
