// Web-push client helpers (growth strategy M1 — daily recall channel).
// enablePush() must be called from a user gesture (browsers require it): asks
// permission → subscribes via the registered PWA service worker → saves the
// subscription to web_push_subscriptions (RLS: own rows).
import { supabase } from '@/lib/supabase';

export type PushStatus = 'unsupported' | 'denied' | 'default' | 'subscribed';

function b64ToUint8(base64: string): Uint8Array {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export function pushSupported(): boolean {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window
    && !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
}

/** Current status without prompting. */
export async function getPushStatus(): Promise<PushStatus> {
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub && Notification.permission === 'granted') return 'subscribed';
  } catch { /* fall through */ }
  return 'default';
}

/** Ask permission + subscribe + persist. Returns the resulting status. */
export async function enablePush(): Promise<PushStatus> {
  if (!pushSupported()) return 'unsupported';
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'default';

  const perm = await Notification.requestPermission();
  if (perm === 'denied') return 'denied';
  if (perm !== 'granted') return 'default';

  const reg = (await navigator.serviceWorker.getRegistration())
    ?? (await navigator.serviceWorker.register('/sw.js', { scope: '/' }));
  await navigator.serviceWorker.ready;

  const sub = (await reg.pushManager.getSubscription())
    ?? (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: b64ToUint8(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string) as BufferSource,
    }));

  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return 'default';

  const { error } = await supabase.from('web_push_subscriptions').upsert({
    user_id: user.id,
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  }, { onConflict: 'endpoint' });
  if (error) { console.warn('[push] save failed', error.message); return 'default'; }
  return 'subscribed';
}
