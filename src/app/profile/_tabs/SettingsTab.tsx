'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { getNotifPrefs, setNotifPref, setGlobalMute, type NotifCategory } from '@/lib/notifications/client';
import { toast } from '@/lib/notify';

export default function SettingsTab({ profile, update, userEmail }: { profile: any; update: (p: any) => void; userEmail: string }) {
  const router = useRouter();
  const { t } = useI18n();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm(t('pt.set.delete.confirm1'))) return;
    const word = t('pt.set.delete.confirm_word');
    if (prompt(t('pt.set.delete.confirm2')) !== word) { toast(t('pt.set.delete.cancelled'), 'info'); return; }
    toast(t('pt.set.delete.contact'), 'info');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Privacy */}
      <SettingsSection title={t('pt.set.privacy')} desc={t('pt.set.privacy_d')}>
        <Toggle label={t('pt.set.privacy.public')} value={!!profile.is_public} onChange={(v: boolean) => update({ is_public: v })} />
        {profile.is_public && profile.public_slug && <PublicLinkRow slug={profile.public_slug} t={t} />}
        {profile.is_public && !profile.public_slug && (
          <p className="text-xs text-slate-500 mt-2">{t('pt.set.privacy.link_pending')}</p>
        )}
      </SettingsSection>

      {/* Notifications */}
      <NotifPrefsSection t={t} />

      {/* Language */}
      <SettingsSection title={t('pt.set.lang')} desc={t('pt.set.lang_d')}>
        <select value={profile.language_pref || 'ar'} onChange={(e) => update({ language_pref: e.target.value })} className="w-full md:w-64 px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
          <option value="ar">{t('pt.set.lang.ar')}</option>
          <option value="en">{t('pt.set.lang.en')}</option>
        </select>
      </SettingsSection>

      {/* Theme */}
      <SettingsSection title={t('pt.set.theme')} desc={t('pt.set.theme_d')}>
        <Toggle label={t('pt.set.theme.dark')} value={!!profile.dark_mode} onChange={(v: boolean) => update({ dark_mode: v })} disabled />
        <p className="text-xs text-slate-500 mt-2">{t('pt.set.theme.wip')}</p>
      </SettingsSection>

      {/* Security */}
      <SettingsSection title={t('pt.set.security')} desc={t('pt.set.security_d')}>
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
            <div>
              <div className="font-bold text-sm">{t('pt.set.email')}</div>
              <div className="text-xs text-slate-500" dir="ltr">{userEmail}</div>
            </div>
            <button disabled className="text-xs text-slate-400">{t('pt.set.change')}</button>
          </div>
          <button onClick={handleLogout} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg font-bold text-sm transition">
            {t('pt.set.logout')}
          </button>
        </div>
      </SettingsSection>

      {/* Danger zone */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
        <h3 className="font-bold text-red-700 mb-2">{t('pt.set.danger')}</h3>
        <p className="text-sm text-red-600 mb-4">{t('pt.set.danger_d')}</p>
        <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition">{t('pt.set.delete_account')}</button>
      </div>
    </div>
  );
}

function SettingsSection({ title, desc, children }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-lg text-[#1b3a6b]">{title}</h3>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function NotifPrefsSection({ t }: { t: (k: any) => string }) {
  const [prefs, setPrefs] = useState<any>(null);
  useEffect(() => { getNotifPrefs().then(setPrefs); }, []);
  if (!prefs) return null;
  const cats: NotifCategory[] = ['social', 'universities', 'content', 'system'];
  const setCat = (c: string, v: boolean) => { setPrefs((p: any) => ({ ...p, [c]: v })); setNotifPref(c, v); };
  const setMute = (v: boolean) => { setPrefs((p: any) => ({ ...p, global_mute: v })); setGlobalMute(v); };
  return (
    <SettingsSection title={t('pt.set.notifs')} desc={t('pt.set.notifs_d')}>
      <Toggle label={t('nc.mute_all')} value={!!prefs.global_mute} onChange={setMute} />
      <div className={prefs.global_mute ? 'opacity-40 pointer-events-none mt-1' : 'mt-1'}>
        {cats.map(c => <Toggle key={c} label={t(`nc.${c}`)} value={!!prefs[c]} onChange={(v: boolean) => setCat(c, v)} />)}
      </div>
    </SettingsSection>
  );
}

function PublicLinkRow({ slug, t }: { slug: string; t: (k: any) => string }) {
  const path = `/u/${slug}`;
  const copy = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;
    navigator.clipboard?.writeText(url).catch(() => {});
  };
  return (
    <div className="mt-3 bg-mint-pale rounded-lg p-3 flex items-center justify-between gap-3">
      <a href={path} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-semibold truncate hover:underline" dir="ltr">{path}</a>
      <div className="flex gap-2 shrink-0">
        <a href={path} target="_blank" rel="noopener noreferrer" className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white text-primary border border-slate-200 hover:bg-slate-50">{t('pt.set.privacy.view')}</a>
        <button type="button" onClick={copy} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary text-white hover:opacity-90">{t('pt.set.privacy.copy')}</button>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange, disabled }: any) {
  return (
    <div className={`flex items-center justify-between py-2 ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <button onClick={() => !disabled && onChange(!value)} disabled={disabled} type="button"
        className={`relative w-12 h-6 rounded-full transition ${value ? 'bg-[#1b3a6b]' : 'bg-slate-300'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${value ? 'right-0.5' : 'right-6'}`}></div>
      </button>
    </div>
  );
}
