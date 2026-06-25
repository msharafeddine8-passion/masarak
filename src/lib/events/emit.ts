// src/lib/events/emit.ts
// Typed event emitter — the only way to log events from anywhere in the app.

import { supabase } from '@/lib/supabase';
import type { CanonicalEventName, EventPayload } from './types';
import { fireListeners } from './listeners';

// ─── View-event dedup ────────────────────────────────────────────────────────
// "view" events (entity impressions) are deduplicated per session so a student
// navigating back to the same page doesn't inflate view counts.
// Key format: `${eventName}::${entityId}`. TTL: end-of-session (in-memory).

/** Events that should be deduplicated per entity per session */
const VIEW_EVENTS: ReadonlySet<CanonicalEventName> = new Set<CanonicalEventName>([
  'student.viewed_university',
  'student.viewed_school',
  'student.viewed_scholarship',
]);

const _seenThisSession = new Set<string>();

function isDuplicate(name: CanonicalEventName, payload: EventPayload): boolean {
  if (!VIEW_EVENTS.has(name)) return false;
  const key = `${name}::${String(payload.entity_id ?? '')}`;
  if (_seenThisSession.has(key)) return true;
  _seenThisSession.add(key);
  return false;
}

let SESSION_ID: string | null = null;
function sid(): string {
  if (SESSION_ID) return SESSION_ID;
  if (typeof window === 'undefined') return 'ssr';
  try {
    const k = 'masarak.sid';
    let s = sessionStorage.getItem(k);
    if (!s) { s = 'sid_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); sessionStorage.setItem(k, s); }
    SESSION_ID = s; return s;
  } catch { SESSION_ID = 'sid_anon'; return SESSION_ID; }
}

function dev(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth || 1024;
  return w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
}

function utm() {
  if (typeof window === 'undefined') return {};
  try {
    const p = new URLSearchParams(window.location.search);
    return {
      utm_source: p.get('utm_source') || undefined,
      utm_medium: p.get('utm_medium') || undefined,
      utm_campaign: p.get('utm_campaign') || undefined,
    };
  } catch { return {}; }
}

/**
 * Emit a canonical event. Never throws. Fire-and-forget.
 *
 * Example:
 *   emit('student.saved_university', { entity_type: 'university', entity_id: 'aub' });
 */
export async function emit(name: CanonicalEventName, payload: EventPayload = {}): Promise<void> {
  try {
    if (typeof window === 'undefined') return;
    if (isDuplicate(name, payload)) return; // skip duplicate view events
    const auth = await supabase.auth.getUser().catch(() => ({ data: { user: null } } as { data: { user: null } }));
    const userId = (auth?.data?.user as { id?: string } | null | undefined)?.id ?? (payload.user_id as string | undefined) ?? null;

    const { entity_type, entity_id, user_id: _u, ...rest } = payload;

    const row = {
      user_id: userId,
      session_id: sid(),
      event_name: name,
      entity_type: entity_type ?? null,
      entity_id: entity_id != null ? String(entity_id) : null,
      page_url: window.location.pathname,
      referrer: document.referrer || null,
      device: dev(),
      ...utm(),
      properties: rest as Record<string, unknown>,
    };

    // 1. Log to analytics_events (fire-and-forget)
    void supabase.from('analytics_events').insert(row as never);

    // 2. Mirror to GA4 if configured
    type GtagFn = (cmd: string, eventOrId: string, params?: Record<string, unknown>) => void;
    const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
    if (typeof gtag === 'function') {
      try { gtag('event', name, rest); } catch { /* ignore */ }
    }

    // 3. Fire side-effect listeners (notifications, leads, etc.)
    void fireListeners(name, payload, userId);
  } catch (e) {
    console.debug('[emit] swallowed', e);
  }
}
