// Unified analytics taxonomy (Sprint 1.6 + Super Admin extension)
// Dual-writes events to:
//   1) Supabase `analytics_events` table (source of truth)
//   2) Google Analytics 4 via gtag (when NEXT_PUBLIC_GA_ID is set)
// Never throws. Safe from SSR (no-ops).

import { supabase } from '@/lib/supabase';

declare global {
  interface Window {
    gtag?: (cmd: string, eventOrId: string, params?: Record<string, unknown>) => void;
    dataLayer?: unknown[];
  }
}

// GA4 Measurement ID for masaraklb.com (user-confirmed property G-6TMGQCVMJQ).
// A GA measurement id is a PUBLIC value — it ships in the gtag.js snippet to every
// browser — so the production property id is baked in as a fallback and analytics
// works out of the box. NEXT_PUBLIC_GA_ID still overrides it (e.g. to point a
// staging deploy at a separate property). Gated to production builds so local
// `next dev` never pollutes the live property.
const GA_FALLBACK_ID = 'G-6TMGQCVMJQ'; // masaraklb.com GA4 property (user-owned)
export const GA_ID =
  process.env.NEXT_PUBLIC_GA_ID ||
  (process.env.NODE_ENV === 'production' ? GA_FALLBACK_ID : '');

export function hasAnalytics(): boolean {
  return Boolean(GA_ID);
}

export type EventName =
  | 'view_entity'
  | 'start_dna'
  | 'complete_dna'
  | 'start_quiz'
  | 'save_item'
  | 'compare_open'
  | 'register_start'
  | 'register_complete'
  | 'cta_click'
  | 'newsletter_subscribe'
  | 'page_view'
  | 'login'
  | 'logout'
  | 'support_ticket_created'
  | 'subscription_started'
  | 'subscription_canceled';

let SESSION_ID: string | null = null;
function sessionId(): string {
  if (SESSION_ID) return SESSION_ID;
  if (typeof window === 'undefined') return 'ssr';
  try {
    const k = 'masarak.sid';
    let s = sessionStorage.getItem(k);
    if (!s) {
      s = 'sid_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      sessionStorage.setItem(k, s);
    }
    SESSION_ID = s;
    return s;
  } catch {
    SESSION_ID = 'sid_anon';
    return SESSION_ID;
  }
}

function deviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth || 1024;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function getUtm() {
  if (typeof window === 'undefined') return {};
  try {
    const p = new URLSearchParams(window.location.search);
    return {
      utm_source: p.get('utm_source') || undefined,
      utm_medium: p.get('utm_medium') || undefined,
      utm_campaign: p.get('utm_campaign') || undefined,
    };
  } catch {
    return {};
  }
}

export function track(event: EventName | string, params?: Record<string, unknown>): void {
  try {
    if (typeof window === 'undefined') return;
    const p = params || {};
    if (typeof window.gtag === 'function') {
      try { window.gtag('event', event, p); } catch { /* ignore */ }
    }
    void writeSupabaseEvent(event, p);
  } catch (e) {
    if (typeof console !== 'undefined') console.debug('[track] swallowed', e);
  }
}

// Awaitable variant — use before a navigation/redirect so the insert isn't
// cancelled when the page unloads (the reason register_complete never landed).
export async function trackAsync(event: EventName | string, params?: Record<string, unknown>): Promise<void> {
  try {
    if (typeof window === 'undefined') return;
    const p = params || {};
    if (typeof window.gtag === 'function') {
      try { window.gtag('event', event, p); } catch { /* ignore */ }
    }
    await writeSupabaseEvent(event, p);
  } catch (e) {
    if (typeof console !== 'undefined') console.debug('[trackAsync] swallowed', e);
  }
}

async function writeSupabaseEvent(event: string, params: Record<string, unknown>) {
  try {
    const auth = await supabase.auth.getUser().catch(() => ({ data: { user: null } } as { data: { user: null } }));
    const userId = (auth?.data?.user as { id?: string } | null | undefined)?.id ?? null;

    const entity_type =
      typeof params.type === 'string' ? params.type :
      typeof params.entity_type === 'string' ? params.entity_type :
      null;
    const entity_id =
      params.id != null ? String(params.id) :
      params.entity_id != null ? String(params.entity_id) :
      null;

    const properties: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(params)) {
      if (k === 'type' || k === 'id' || k === 'entity_type' || k === 'entity_id') continue;
      properties[k] = v;
    }

    const row = {
      user_id: userId,
      session_id: sessionId(),
      event_name: event,
      entity_type,
      entity_id,
      page_url: window.location.pathname,
      referrer: document.referrer || null,
      device: deviceType(),
      ...getUtm(),
      properties,
    };

    const { error } = await supabase.from('analytics_events').insert(row as never);
    if (error) {
      if (error.code !== '42P01' && error.code !== 'PGRST205' && error.code !== '42501') {
        console.debug('[track.supabase]', error.message);
      }
    }
  } catch (e) {
    console.debug('[track.supabase] swallowed', e);
  }
}

export function trackPageView(path?: string): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function' && GA_ID) {
    try { window.gtag('config', GA_ID, { page_path: path || window.location.pathname }); } catch { /* ignore */ }
  }
  void writeSupabaseEvent('page_view', { path: path || window.location.pathname });
}
