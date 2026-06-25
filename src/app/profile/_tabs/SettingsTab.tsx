'use client';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';

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
    if (prompt(t('pt.set.delete.confirm2')) !== word) { alert(t('pt.set.delete.cancelled')); return; }
    alert(t('pt.set.delete.contact'));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Privacy */}
      <SettingsSection title={t('pt.set.privacy')} desc={t('pt.set.privacy_d')}>
        <Toggle label={t('pt.set.privacy.public')} value={!!profile.is_public} onChange={(v: boolean) => update({ is_public: v })} />
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title={t('pt.set.notifs')} desc={t('pt.set.notifs_d')}>
        <Toggle label={t('pt.set.notifs.site')} value={true} onChange={() => {}} disabled />
        <Toggle label={t('pt.set.notifs.email')} value={true} onChange={() => {}} disabled />
        <Toggle label={t('pt.set.notifs.deadlines')} value={true} onChange={() => {}} disabled />
        <p className="text-xs text-ink-subtle mt-3">{t('pt.set.notifs.wip')}</p>
      </SettingsSection>

      {/* Language */}
      <SettingsSection title={t('pt.set.lang')} desc={t('pt.set.lang_d')}>
        <select value={profile.language_pref || 'ar'} onChange={(e) => update({ language_pref: e.target.value })} className="w-full md:w-64 px-4 py-2.5 border border-line rounded-lg bg-surface">
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
          <div className="flex justify-between items-center bg-bg-soft p-3 rounded-lg">
            <div>
              <div className="font-bold text-sm">{t('pt.set.email')}</div>
              <div className="text-xs text-ink-subtle" dir="ltr">{userEmail}</div>
            </div>
            <button disabled className="text-xs text-slate-400">{t('pt.set.change')}</button>
          </div>
          <button onClick={handleLogout} className="w-full bg-bg-soft hover:bg-bg-soft text-ink-muted py-3 rounded-lg font-bold text-sm transition">
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
    <div className="bg-surface rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-lg text-[#1b3a6b]">{title}</h3>
        <p className="text-xs text-ink-subtle">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange, disabled }: any) {
  return (
    <div className={`flex items-center justify-between py-2 ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-sm font-semibold text-ink-muted">{label}</span>
      <button onClick={() => !disabled && onChange(!value)} disabled={disabled} type="button"
        className={`relative w-12 h-6 rounded-full transition ${value ? 'bg-[#1b3a6b]' : 'bg-slate-300'} ${disabled ? 'c