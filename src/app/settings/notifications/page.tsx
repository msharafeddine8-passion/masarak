'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Prefs = {
  channels_by_type?: Record<string, string[]>;
  global_mute?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
};

const NOTIF_TYPES: { id: string; label: string; default: string[] }[] = [
  { id: 'org.new_lead', label: 'طالب جديد مهتم بمؤسستك', default: ['in_app'] },
  { id: 'student.dna_completed', label: 'أكملت اختبار Career DNA', default: ['in_app'] },
  { id: 'student.scholarship_applied', label: 'قدّمت على منحة', default: ['in_app'] },
  { id: 'student.welcome', label: 'رسالة الترحيب', default: ['in_app'] },
  { id: 'parent.student_milestone', label: 'إنجاز لابنك (للأهل)', default: ['in_app', 'email'] },
  { id: 'org.verified', label: 'تم توثيق مؤسستك', default: ['in_app', 'email'] },
];

const CHANNELS = [
  { id: 'in_app', label: 'داخل التطبيق 🔔' },
  { id: 'email', label: 'بريد إلكتروني 📧', disabled: true, badge: 'قريباً' },
  { id: 'whatsapp', label: 'WhatsApp 💬', disabled: true, badge: 'قريباً' },
];

export default function NotificationPrefsPage() {
  const [prefs, setPrefs] = useState<Prefs>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('notification_preferences').select('*').eq('user_id', user.id).maybeSingle();
    if (data) setPrefs(data as Prefs);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function getChannels(typeId: string): string[] {
    const v = prefs.channels_by_type?.[typeId];
    if (v) return v;
    return NOTIF_TYPES.find(t => t.id === typeId)?.default || ['in_app'];
  }

  function toggle(typeId: string, channelId: string) {
    const current = new Set(getChannels(typeId));
    if (current.has(channelId)) current.delete(channelId);
    else current.add(channelId);
    setPrefs({
      ...prefs,
      channels_by_type: { ...(prefs.channels_by_type || {}), [typeId]: Array.from(current) },
    });
  }

  async function save() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMsg('لازم تسجل دخول أولاً'); setSaving(false); return; }

    const { error } = await supabase.from('notification_preferences').upsert({
      user_id: user.id,
      channels_by_type: prefs.channels_by_type || {},
      global_mute: prefs.global_mute || false,
      quiet_hours_start: prefs.quiet_hours_start || '22:00',
      quiet_hours_end: prefs.quiet_hours_end || '08:00',
    }, { onConflict: 'user_id' });
    if (error) setMsg('فشل: ' + error.message);
    else setMsg('✓ تم الحفظ');
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  }

  return (
    <main className="container-page py-10" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <Link href="/notifications" className="text-sm text-primary hover:underline mb-4 inline-block">← العودة للإشعارات</Link>
        <h1 className="text-3xl font-extrabold text-primary mb-2">⚙️ تفضيلات الإشعارات</h1>
        <p className="text-sm text-ink-muted mb-6">حدّد أي إشعارات بدك تستلم وعلى أي قناة.</p>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-20 bg-bg-soft animate-pulse rounded-2xl" />)}</div>
        ) : (
          <>
            <div className="bg-surface rounded-2xl border-2 border-line p-4 mb-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={prefs.global_mute || false}
                  onChange={e => setPrefs({ ...prefs, global_mute: e.target.checked })} />
                <span className="font-bold">🔕 كتم كل الإشعارات</span>
              </label>
            </div>

            <div className="space-y-3 mb-4">
              {NOTIF_TYPES.map(t => {
                const channels = getChannels(t.id);
                return (
                  <div key={t.id} className="bg-surface rounded-2xl border-2 border-line p-4">
                    <div className="font-extrabold mb-2">{t.label}</div>
                    <div className="flex flex-wrap gap-2">
                      {CHANNELS.map(c => {
                        const active = channels.includes(c.id);
                        return (
                          <button key={c.id} disabled={c.disabled} onClick={() => toggle(t.id, c.id)}
                            className={'text-xs font-bold px-3 py-1.5 rounded-lg border-2 transition ' + (
                              c.disabled ? 'bg-bg-soft text-ink-subtle border-line cursor-not-allowed' :
                              active ? 'bg-primary text-white border-primary' :
                              'bg-surface border-line hover:border-primary/40'
                            )}>
                            {c.label}
                            {c.badge && <span className="mr-1 text-[9px]">{c.badge}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-surface rounded-2xl border-2 border-line p-4 mb-4">
              <h3 className="font-bold mb-2">🌙 ساعات الهدوء</h3>
              <p className="text-xs text-ink-muted mb-3">ما رح يوصلك إشعارات خلال هاي الساعات.</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="block text-xs font-bold text-ink-muted mb-1">من</span>
                  <input type="time" value={prefs.quiet_hours_start || '22:00'}
                    onChange={e => setPrefs({ ...prefs, quiet_hours_start: e.target.value })}
                    className="px-3 py-2 rounded-xl border-2 border-line w-full" />
                </label>
                <label className="text-sm">
                  <span className="block text-xs font-bold text-ink-muted mb-1">إلى</span>
                  <input type="time" value={prefs.quiet_hours_end || '08:00'}
                    onChange={e => setPrefs({ ...prefs, quiet_hours_end: e.target.value })}
                    className="px-3 py-2 rounded-xl border-2 border-line w-full" />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button disabled={saving} onClick={save} className="bg-primary text-white font-extrabold py-3 px-6 rounded-xl hover:bg-primary-dark disabled:opacity-50">
                {saving ? 'جاري الحفظ...' : '💾 حفظ التفضيلات'}
              </button>
              {msg && <span className="text-sm font-bold text-emerald-700">{msg}</span>}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
