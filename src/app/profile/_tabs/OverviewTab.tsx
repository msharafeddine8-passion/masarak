'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getActivity } from '@/lib/savedItems';
import { useI18n, type TranslationKey } from '@/lib/i18n';

export default function OverviewTab({ profile, user, completion }: { profile: any; user: any; completion: number }) {
  const { t, lang } = useI18n();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) getActivity(user.id, 5).then(setActivities);
  }, [user?.id]);

  const nextAction = !profile.full_name ? { labelKey: 'pt.ov.next.name' as TranslationKey, href: '#academic', icon: '✏️' }
    : !profile.bac_section ? { labelKey: 'pt.ov.next.bac' as TranslationKey, href: '#academic', icon: '🎓' }
    : !profile.career_dna_completed ? { labelKey: 'pt.ov.next.dna' as TranslationKey, href: '#career', icon: '🧬' }
    : (profile.preferred_universities || []).length === 0 ? { labelKey: 'pt.ov.next.unis' as TranslationKey, href: '#academic', icon: '🏛️' }
    : !profile.bio ? { labelKey: 'pt.ov.next.bio' as TranslationKey, href: '#academic', icon: '📝' }
    : { labelKey: 'pt.ov.next.browse' as TranslationKey, href: '/scholarships', icon: '🏆' };

  const missions: { taskKey: TranslationKey; done: boolean; xp: number }[] = [
    { taskKey: 'pt.ov.mission.avatar', done: !!profile.avatar_url, xp: 100 },
    { taskKey: 'pt.ov.mission.bio',    done: !!profile.bio, xp: 50 },
    { taskKey: 'pt.ov.mission.school', done: !!profile.school_name, xp: 50 },
    { taskKey: 'pt.ov.mission.grades', done: (profile.grades || []).length > 0, xp: 100 },
    { taskKey: 'pt.ov.mission.unis',   done: (profile.preferred_universities || []).length >= 3, xp: 150 },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      {/* Welcome / Hero card */}
      <div className="lg:col-span-2 bg-gradient-to-br from-[#1b3a6b] via-[#2d5391] to-[#1b3a6b] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#5cc4b8] rounded-full blur-3xl opacity-30"></div>
        <div className="relative">
          <div className="text-sm opacity-80 mb-1">{t('pt.ov.hello')}</div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">{profile.full_name || user?.email?.split('@')[0]}</h2>
          <p className="text-white/85 leading-relaxed mb-5">
            {t('pt.ov.intro')}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/universities" className="px-4 py-2 bg-white text-[#1b3a6b] rounded-lg font-bold text-sm hover:bg-white/90">{t('pt.ov.btn.unis')}</Link>
            <Link href="/scholarships" className="px-4 py-2 bg-white/15 backdrop-blur border border-white/20 rounded-lg font-bold text-sm hover:bg-white/25">{t('pt.ov.btn.scholarships')}</Link>
          </div>
        </div>
      </div>

      {/* Next action card */}
      <div className="bg-gradient-to-br from-[#5cc4b8] to-[#3da89c] rounded-2xl p-6 text-[#0f2240]">
        <div className="text-sm font-bold opacity-80 mb-1">{t('pt.ov.next')}</div>
        <div className="text-3xl mb-3">{nextAction.icon}</div>
        <h3 className="text-xl font-extrabold mb-3">{t(nextAction.labelKey)}</h3>
        <Link href={nextAction.href.startsWith('#') ? '#' : nextAction.href} className="inline-block px-4 py-2 bg-[#0f2240] text-white rounded-lg font-bold text-sm hover:bg-[#1b3a6b]">
          {t('pt.ov.start_now')}
        </Link>
      </div>

      {/* AI Recommendation card */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl">🤖</div>
          <div>
            <h3 className="font-bold text-lg text-[#1b3a6b]">{t('pt.ov.smart_recs')}</h3>
            <div className="text-xs text-slate-500">{t('pt.ov.based_on')}</div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          {completion < 30 && <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">{t('pt.ov.warn_low')}</div>}
          {profile.bac_section && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">{t('pt.ov.rec_section_prefix')} ({profile.bac_section}) {t('pt.ov.rec_section_suffix')} <Link href="/majors" className="text-[#1b3a6b] font-bold underline">{t('pt.ov.available_majors')}</Link>.</div>}
          {profile.overall_gpa && profile.overall_gpa >= 3.5 && <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">{t('pt.ov.rec_gpa_prefix')} ({profile.overall_gpa}). {t('pt.ov.rec_gpa_suffix')} <Link href="/scholarships" className="text-[#1b3a6b] font-bold underline">{t('pt.ov.scholarships_link')}</Link>.</div>}
          {(profile.preferred_universities || []).length === 0 && <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">{t('pt.ov.rec_unis')}</div>}
        </div>
      </div>

      {/* Daily Missions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg text-[#1b3a6b] mb-4">{t('pt.ov.missions')}</h3>
        <div className="space-y-3">
          {missions.map((m, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${m.done ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${m.done ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-300 text-slate-400'}`}>
                {m.done ? '✓' : i + 1}
              </div>
              <div className="flex-1 text-sm font-semibold text-slate-700">{t(m.taskKey)}</div>
              <div className="text-xs text-amber-600 font-bold">+{m.xp} XP</div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Roadmap */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg text-[#1b3a6b] mb-4">{t('pt.ov.roadmap')}</h3>
        <div className="space-y-3">
          {[
            { stage: '1', titleKey: 'pt.ov.rm.s1' as TranslationKey, descKey: 'pt.ov.rm.s1d' as TranslationKey, done: completion >= 50 },
            { stage: '2', titleKey: 'pt.ov.rm.s2' as TranslationKey, descKey: 'pt.ov.rm.s2d' as TranslationKey, done: !!profile.career_dna_completed },
            { stage: '3', titleKey: 'pt.ov.rm.s3' as TranslationKey, descKey: 'pt.ov.rm.s3d' as TranslationKey, done: (profile.preferred_universities || []).length > 0 },
            { stage: '4', titleKey: 'pt.ov.rm.s4' as TranslationKey, descKey: 'pt.ov.rm.s4d' as TranslationKey, done: false },
            { stage: '5', titleKey: 'pt.ov.rm.s5' as TranslationKey, descKey: 'pt.ov.rm.s5d' as TranslationKey, done: false },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${s.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {s.done ? '✓' : s.stage}
              </div>
              <div className="flex-1 pb-3 border-b border-slate-100 last:border-0">
                <div className={`font-bold ${s.done ? 'text-emerald-700' : 'text-slate-800'}`}>{t(s.titleKey)}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t(s.descKey)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg text-[#1b3a6b] mb-4">{t('pt.ov.activity')}</h3>
        {activities.length === 0 ? (
          <div className="text-center text-slate-400 py-6 text-sm">
            <div className="text-3xl mb-2">📭</div>
            {t('pt.ov.no_activity')}
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-2 text-sm pb-2 border-b border-slate-100 last:border-0">
                <div className="text-lg">{getActionIcon(a.action)}</div>
                <div className="flex-1">
                  <div className="text-slate-700">{getActionLabel(a.action, a.entity_type, t)}</div>
                  <div className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getActionIcon(action: string) {
  const map: Record<string, string> = { save: '❤️', unsave: '💔', review: '⭐', apply: '📝', view: '👁️' };
  return map[action] || '📌';
}
function getActionLabel(action: string, entityType: string | undefined, t: (k: TranslationKey) => string) {
  const a: Record<string, TranslationKey> = { save: 'pt.act.save', unsave: 'pt.act.unsave', review: 'pt.act.review', apply: 'pt.act.apply', view: 'pt.act.view' };
  const e: Record<string, TranslationKey> = { university: 'pt.ent.university', school: 'pt.ent.school', vocational: 'pt.ent.vocational', scholarship: 'pt.ent.scholarship' };
  const actLabel = a[action] ? t(a[action]) : action;
  const entLabel = entityType && e[entityType] ? t(e[entityType]) : '';
  return `${actLabel} ${entLabel}`.trim();
}
