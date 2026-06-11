// Unified analytics taxonomy (Sprint 1.6) — sends events to GA4 via gtag.
// Events use one consistent schema so we can analyze funnels across the platform.
//
// Setup:
// 1. Set NEXT_PUBLIC_GA_ID in Vercel env (e.g. "G-XXXXXXXXXX")
// 2. <GoogleAnalytics /> is rendered in app/layout.tsx
// 3. Call track() from any client component:
//    track('view_entity', { type: 'university', id: 'aub', country: 'LB' })

declare global {
  interface Window {
    gtag?: (cmd: string, eventOrId: string, params?: Record<string, unknown>) => void;
    dataLayer?: unknown[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

export function hasAnalytics(): boolean {
  return Boolean(GA_ID);
}

/** Unified event taxonomy — keep names in sync with work order section 1.6 */
export type EventName =
  | 'view_entity'         // type: 'university'|'major'|'scholarship'|'school'|'career'|'internship'|'vocational'; id; country
  | 'start_dna'           // career DNA quiz started
  | 'complete_dna'        // career DNA quiz completed; result_primary, result_secondary
  | 'start_quiz'          // any quiz started
  | 'save_item'           // type, id
  | 'compare_open'        // ids: string[]
  | 'register_start'      // role
  | 'register_complete'   // role
  | 'cta_click'           // id (e.g. 'hero_primary'), location (e.g. 'home_hero')
  | 'newsletter_subscribe';

export function track(event: EventName, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;
  window.gtag('event', event, params || {});
}

/** Page view — fire on route change (handled in layout via Next router). */
export function trackPageView(path: string): void {
  if (typeof window === 'undefined') return;
  if (!window.gtag || !GA_ID) return;
  window.gtag('config', GA_ID, { page_path: path });
}
