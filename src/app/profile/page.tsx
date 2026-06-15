'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import OverviewTab from './_tabs/OverviewTab';
import AcademicTab from './_tabs/AcademicTab';
import CareerDNATab from './_tabs/CareerDNATab';
import SavedItemsTab from './_tabs/SavedItemsTab';
import ScholarshipsTab from './_tabs/ScholarshipsTab';
import InternshipsTab from './_tabs/InternshipsTab';
import AchievementsTab from './_tabs/AchievementsTab';
import ActivityTab from './_tabs/ActivityTab';
import SettingsTab from './_tabs/SettingsTab';
import IDCardTab from './_tabs/IDCardTab';
import { useI18n, type TranslationKey } from '@/lib/i18n';

export type TabId = 'overview' | 'academic' | 'career' | 'saved' | 'scholarships' | 'internships' | 'achievements' | 'activity' | 'card' | 'settings';

const TABS: { id: TabId; labelKey: TranslationKey; icon: string }[] = [
  { id: 'overview',     labelKey: 'prof.tab.overview',     icon: '🏠' },
  { id: 'academic',     labelKey: 'prof.tab.academic',     icon: '🎓' },
  { id: 'career',       labelKey: 'prof.tab.career',       icon: '🧬' },
  { id: 'saved',        labelKey: 'prof.tab.saved',        icon: '❤️' },
  { id: 'scholarships', labelKey: 'prof.tab.scholarships', icon: '🏆' },
  { id: 'internships',  labelKey: 'prof.tab.internships',  icon: '💼' },
  { id: 'achievements', labelKey: 'prof.tab.achievements', icon: '⭐' },
  { id: 'activity',     labelKey: 'prof.tab.activity',     icon: '📈' },
  { id: 'card',         labelKey: 'prof.tab.card',         icon: '🪪' },
  { id: 'settings',     labelKey: 'prof.tab.settings',     icon: '⚙️' },
];

const XP_PER_LEVEL = 1000;

export default function ProfilePage() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const [tab, setTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<any>({});
  const [msg, setMsg] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push('/auth/login?redirect=/profile'); return; }
      const u = { id: session.user.id, email: session.user.email || '' };
      setUser(u);
      const { data } = await supabase.from('student_profiles').select('*').eq('user_id', u.id).maybeSingle();
      if (data) setProfile(data);
      else {
        const { data: created } = await supabase.from('student_profiles').insert({ user_id: u.id }).select().single();
        setProfile(created || { user_id: u.id });
      }
      // Mark active today (streak update)
      await supabase.from('student_profiles').update({ last_active: new Date().toISOString().slice(0,10) }).eq('user_id', u.id);
      setLoading(false);
    })();
  }, [router]);

  const update = (patch: any) => setProfile((p: any) => ({ ...p, ...patch }));

  const save = async () => {
    if (!user) return;
    setSaving(true); setMsg('');
    try {
      const { error } = await supabase.from('student_profiles').upsert({ ...profile, user_id: user.id }, { onConflict: 'user_id' });
      if (error) throw error;
      setMsg(t('prof.saved.success'));
      setTimeout(() => setMsg(''), 2000);
    } catch (e: any) { setMsg('❌ ' + e.message); }
    finally { setSaving(false); }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !user) return;
    if (file.size > 3 * 1024 * 1024) { setMsg(t('prof.avatar.too_large')); return; }
    setUploadingAvatar(true); setMsg('');
    try {
      const path = `avatars/${user.id}_${Date.now()}.${(file.name.split('.').pop() || 'jpg')}`;
      const { error: up } = await supabase.storage.from('images').upload(path, file, { cacheControl: '3600', upsert: true });
      if (up) throw up;
      const { data: pub } = supabase.storage.from('images').getPublicUrl(path);
      await supabase.from('student_profiles').update({ avatar_url: pub.publicUrl }).eq('user_id', user.id);
      setProfile((p: any) => ({ ...p, avatar_url: pub.publicUrl }));
      setMsg(t('prof.saved.uploaded'));
      setTimeout(() => setMsg(''), 2000);
    } catch (e: any) { setMsg('❌ ' + e.message); }
    finally { setUploadingAvatar(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const completion = (() => {
    const filled = [
      profile.full_name, profile.phone, profile.city, profile.bio, profile.avatar_url,
      profile.school_name, profile.grade_level, profile.bac_section,
      (profile.grades || []).length, (profile.achievements || []).length,
      (profile.certificates || []).length, profile.career_dna_completed,
      (profile.preferred_universities || []).length,
    ].filter(Boolean).length;
    return Math.round((filled / 13) * 100);
  })();

  const xp = profile.xp || 0;
  const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpProgress = (xpInLevel / XP_PER_LEVEL) * 100;
  const badge = level >= 10 ? t('prof.badge.expert') : level >= 5 ? t('prof.badge.advanced') : level >= 3 ? t('prof.badge.active') : t('prof.badge.beginner');

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0f1f3a] via-[#1b3a6b] to-[#0f2240] flex items-center justify-center" dir={dir}>
        <div className="text-center text-white">
          <div className="text-5xl mb-3 animate-pulse">⏳</div>
          <div>{t('prof.loading')}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg pb-32" dir={dir}>
      {/* HERO with glassmorphism */}
      <section className="relative bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '32px 32px' }} />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-10 w-72 h-72 bg-mint rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="absolute top-10 left-1/4 text-3xl animate-float opacity-50">⭐</div>
        <div className="absolute bottom-10 right-1/3 text-3xl animate-float opacity-50" style={{ animationDelay: '1s' }}>🏆</div>

        <div className="relative max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#5cc4b8] to-yellow-400 rounded-full blur opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white/15 border-4 border-white/30 flex items-center justify-center text-6xl font-bold backdrop-blur">
                {profile.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile.full_name?.charAt(0) || user?.email.charAt(0).toUpperCase() || '?'}</span>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" disabled={uploadingAvatar} />
              <button onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}
                className="absolute -bottom-1 -left-1 w-10 h-10 bg-[#5cc4b8] text-[#0f2240] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition disabled:opacity-50 text-lg font-bold"
                title={t('prof.avatar.change')}>
                {uploadingAvatar ? '⏳' : '📷'}
              </button>
            </div>

            {/* Identity */}
            <div className={`flex-1 text-center ${dir === 'rtl' ? 'lg:text-right' : 'lg:text-left'}`}>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2">
                <h1 className="text-3xl md:text-4xl font-extrabold">{profile.full_name || t('prof.welcome.empty')}</h1>
                <span className="bg-yellow-400/90 text-[#1b3a6b] px-3 py-1 rounded-full text-xs font-bold">{badge}</span>
                {profile.is_public && <span className="bg-emerald-400/90 text-[#1b3a6b] px-2 py-0.5 rounded-full text-xs font-bold">{t('prof.badge.public')}</span>}
              </div>
              <p className="text-white/80 text-sm mb-3">{user?.email}</p>
              {profile.bio && <p className="text-white/90 text-sm max-w-2xl">{profile.bio}</p>}

              {/* XP Bar */}
              <div className="mt-4 max-w-md">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold">{t('prof.level')} {level}</span>
                  <span className="opacity-80">{xpInLevel} / {XP_PER_LEVEL} XP</span>
                </div>
                <div className="h-3 bg-white/15 rounded-full overflow-hidden backdrop-blur">
                  <div className="h-full bg-gradient-to-r from-[#5cc4b8] to-yellow-400 transition-all duration-700" style={{ width: `${xpProgress}%` }}></div>
                </div>
              </div>
            </div>

            {/* Completion Ring */}
            <div className="text-center">
              <CompletionRing percent={completion} />
              <div className="text-xs opacity-80 mt-2">{t('prof.completion')}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-6 justify-center lg:justify-end">
            <button onClick={save} disabled={saving} className="px-4 py-2 bg-white text-[#1b3a6b] rounded-lg font-bold text-sm hover:bg-white/90 transition disabled:opacity-50">
              {saving ? '⏳' : t('prof.btn.save')}
            </button>
            <button onClick={() => { setTab('settings'); }} className="px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-lg font-bold text-sm hover:bg-white/20 transition">
              {t('prof.btn.settings')}
            </button>
            <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-lg font-bold text-sm hover:bg-white/20 transition">
              {t('prof.btn.share')}
            </button>
            <button disabled className="px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-lg font-bold text-sm opacity-60 cursor-not-allowed">
              {t('prof.btn.cv')}
            </button>
          </div>

          {msg && (
            <div className={`mt-4 inline-block px-4 py-2 rounded-lg text-sm font-semibold ${msg.startsWith('✓') ? 'bg-emerald-500/30 text-white' : 'bg-red-500/30 text-white'}`}>
              {msg}
            </div>
          )}
        </div>
      </section>

      {/* Quick stats bar */}
      <section className="relative -mt-6 z-10 max-w-7xl mx-auto px-4">
        <QuickStats userId={user?.id} profile={profile} />
      </section>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-100">
            {TABS.map((tab_) => (
              <button key={tab_.id} onClick={() => setTab(tab_.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition border-b-2 ${tab === tab_.id ? 'border-[#1b3a6b] text-[#1b3a6b] bg-blue-50/40' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}>
                <span>{tab_.icon}</span>
                <span>{t(tab_.labelKey)}</span>
              </button>
            ))}
          </div>
          <div className="p-6 md:p-8">
            {tab === 'overview' && <OverviewTab profile={profile} user={user} completion={completion} />}
            {tab === 'academic' && <AcademicTab profile={profile} update={update} />}
            {tab === 'career' && <CareerDNATab profile={profile} update={update} />}
            {tab === 'saved' && <SavedItemsTab userId={user?.id || ''} />}
            {tab === 'scholarships' && <ScholarshipsTab userId={user?.id || ''} />}
            {tab === 'internships' && <InternshipsTab userId={user?.id || ''} />}
            {tab === 'achievements' && <AchievementsTab profile={profile} userId={user?.id || ''} />}
            {tab === 'activity' && <ActivityTab userId={user?.id || ''} />}
            {tab === 'card'     && <IDCardTab profile={profile} user={user!} />}
            {tab === 'settings' && <SettingsTab profile={profile} update={update} userEmail={user?.email || ''} />}
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      {tab !== 'overview' && tab !== 'saved' && tab !== 'scholarships' && tab !== 'internships' && tab !== 'activity' && (
        <div className="fixed bottom-28 md:bottom-4 left-1/2 -translate-x-1/2 z-30 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 flex items-center gap-2 max-w-[calc(100vw-1.5rem)] flex-wrap justify-center">
          {msg && <span className={`px-3 text-sm ${msg.startsWith('✓') ? 'text-emerald-600' : 'text-red-600'}`}>{msg}</span>}
          <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm hover:bg-[#142d54] transition disabled:opacity-50">
            {saving ? t('prof.sticky.saving') : t('prof.sticky.save_changes')}
          </button>
        </div>
      )}
    </main>
  );
}

function CompletionRing({ percent }: { percent: number }) {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 -rotate-90">
        <circle cx="48" cy="48" r={radius} stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="none" />
        <circle cx="48" cy="48" r={radius} stroke="#5cc4b8" strokeWidth="6" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold">{percent}%</div>
    </div>
  );
}

function QuickStats({ userId, profile }: { userId?: string; profile: any }) {
  const [counts, setCounts] = useState({ unis: 0, majors: 0, scholarships: 0, internships: 0 });
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [u, m, s, i] = await Promise.all([
        supabase.from('saved_items').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('item_type', 'university'),
        supabase.from('saved_items').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('item_type', 'major'),
        supabase.from('scholarship_applications').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('internship_applications').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      ]);
      setCounts({ unis: u.count || 0, majors: m.count || 0, scholarships: s.count || 0, internships: i.count || 0 });
    })();
  }, [userId]);

  const stats = [
    { icon: '🏛️', label: 'جامعات محفوظة', value: counts.unis, color: 'from-blue-500 to-blue-700' },
    { icon: '📚', label: 'تخصصات محفوظة', value: counts.majors, color: 'from-purple-500 to-purple-700' },
    { icon: '🏆', label: 'منح متابعة', value: counts.scholarships, color: 'from-amber-500 to-orange-600' },
    { icon: '💼', label: 'تدريبات', value: counts.internships, color: 'from-emerald-500 to-emerald-700' },
    { icon: '🧬', label: 'Career DNA', value: profile.career_dna_completed ? '✓' : '–', color: 'from-pink-500 to-rose-600' },
    { icon: '🔥', label: 'سلسلة أيام', value: profile.streak_days || 0, color: 'from-red-500 to-red-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((s, i) => (
        <div key={i} className="group bg-white rounded-2xl shadow-md border border-slate-100 p-4 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-2`}>{s.icon}</div>
          <div className="text-2xl font-extrabold text-slate-800">{s.value}</div>
          <div className="text-xs text-slate-500 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
