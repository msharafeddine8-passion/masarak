'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useI18n, type TranslationKey } from '@/lib/i18n';

const BADGES: { code: string; icon: string; labelKey: TranslationKey; descKey: TranslationKey; xp: number }[] = [
  { code: 'first_login',         icon: '🎉', labelKey: 'pt.ach.b.first_login',         descKey: 'pt.ach.b.first_login_d',         xp: 50 },
  { code: 'profile_50',          icon: '✨', labelKey: 'pt.ach.b.profile_50',          descKey: 'pt.ach.b.profile_50_d',          xp: 100 },
  { code: 'profile_100',         icon: '🌟', labelKey: 'pt.ach.b.profile_100',         descKey: 'pt.ach.b.profile_100_d',         xp: 300 },
  { code: 'avatar_uploaded',     icon: '📷', labelKey: 'pt.ach.b.avatar',              descKey: 'pt.ach.b.avatar_d',              xp: 50 },
  { code: 'career_dna',          icon: '🧬', labelKey: 'pt.ach.b.dna',                 descKey: 'pt.ach.b.dna_d',                 xp: 200 },
  { code: 'first_save',          icon: '❤️', labelKey: 'pt.ach.b.first_save',          descKey: 'pt.ach.b.first_save_d',          xp: 30 },
  { code: 'saved_5',             icon: '⭐', labelKey: 'pt.ach.b.saved_5',             descKey: 'pt.ach.b.saved_5_d',             xp: 100 },
  { code: 'first_review',        icon: '✍️', labelKey: 'pt.ach.b.first_review',        descKey: 'pt.ach.b.first_review_d',        xp: 100 },
  { code: 'scholarship_apply',   icon: '🏆', labelKey: 'pt.ach.b.scholarship_apply',   descKey: 'pt.ach.b.scholarship_apply_d',   xp: 150 },
  { code: 'streak_7',            icon: '🔥', labelKey: 'pt.ach.b.streak_7',            descKey: 'pt.ach.b.streak_7_d',            xp: 100 },
  { code: 'streak_30',           icon: '💎', labelKey: 'pt.ach.b.streak_30',           descKey: 'pt.ach.b.streak_30_d',           xp: 500 },
  { code: 'level_5',             icon: '🎖️', labelKey: 'pt.ach.b.level_5',             descKey: 'pt.ach.b.level_5_d',             xp: 200 },
];

export default function AchievementsTab({ profile, userId }: { profile: any; userId: string }) {
  const { t } = useI18n();
  const [earned, setEarned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase.from('user_achievements').select('badge_code').eq('user_id', userId);
      setEarned(new Set((data || []).map((r: any) => r.badge_code)));
      setLoading(false);
    })();
  }, [userId]);

  const xp = profile.xp || 0;
  const level = Math.max(1, Math.floor(xp / 1000) + 1);
  const xpInLevel = xp % 1000;
  const streak = profile.streak_days || 0;
  const earnedCount = earned.size;
  const totalCount = BADGES.length;

  return (
    <div className="space-y-6">
      {/* Stats hero */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl p-6">
          <div className="text-4xl mb-2">⚡</div>
          <div className="text-4xl font-extrabold">{xp.toLocaleString()}</div>
          <div className="text-sm opacity-90 mt-1">{t('pt.ach.total_xp')}</div>
          <div className="mt-3 h-2 bg-surface/20 rounded-full overflow-hidden">
            <div className="h-full bg-surface" style={{ width: `${(xpInLevel / 1000) * 100}%` }}></div>
          </div>
          <div className="text-xs opacity-80 mt-1">{xpInLevel} / 1000 {t('pt.ach.xp_progress')}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-6">
          <div className="text-4xl mb-2">🎖️</div>
          <div className="text-4xl font-extrabold">{level}</div>
          <div className="text-sm opacity-90 mt-1">{t('pt.ach.current_level')}</div>
          <div className="text-xs opacity-80 mt-3">
            {level >= 10 ? t('pt.ach.lvl.expert') : level >= 5 ? t('pt.ach.lvl.advanced') : level >= 3 ? t('pt.ach.lvl.active') : t('pt.ach.lvl.beginner')}
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-700 text-white rounded-2xl p-6">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-4xl font-extrabold">{streak}</div>
          <div className="text-sm opacity-90 mt-1">{t('pt.ach.consecutive')}</div>
          <div className="text-xs opacity-80 mt-3">{t('pt.ach.keep_daily')}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-surface rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-[#1b3a6b]">{t('pt.ach.badges_progress')}</h3>
          <span className="text-2xl font-extrabold text-[#1b3a6b]">{earnedCount} / {totalCount}</span>
        </div>
        <div className="h-3 bg-bg-soft rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all" style={{ width: `${(earnedCount / totalCount) * 100}%` }}></div>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <h3 className="font-bold text-xl text-[#1b3a6b] mb-4">{t('pt.ach.badges')}</h3>
        {loading ? <div className="text-center py-12">⏳</div> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {BADGES.map(b => {
              const has = earned.has(b.code);
              return (
                <div key={b.code} className={`rounded-2xl p-5 border text-center transition ${has ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md' : 'bg-bg-soft border-line opacity-50'}`}>
                  <div className={`text-5xl mb-3 ${has ? '' : 'grayscale'}`}>{b.icon}</div>
                  <div className={`font-bold text-sm ${has ? 'text-orange-700' : 'text-ink-muted'}`}>{t(b.labelKey)}</div>
                  <div className="text-xs text-ink-subtle mt-1">{t(b.descKey)}</div>
                  <div className={`text-xs font-bold mt-2 ${has ? 'text-amber-600' : 'text-slate-400'}`}>+{b.xp} XP</div>
                  {has && <div className="text-xs text-emerald-600 font-bold mt-1">{t('pt.ach.unlocked')}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
