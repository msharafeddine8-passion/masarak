'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const BADGES = [
  { code: 'first_login', icon: '🎉', label: 'البداية', desc: 'سجّلت دخولك أول مرة', xp: 50 },
  { code: 'profile_50', icon: '✨', label: 'ملف نصفي', desc: 'أكملت 50% من ملفك', xp: 100 },
  { code: 'profile_100', icon: '🌟', label: 'ملف مكتمل', desc: 'أكملت 100% من ملفك', xp: 300 },
  { code: 'avatar_uploaded', icon: '📷', label: 'الوجه الجميل', desc: 'رفعت صورة شخصية', xp: 50 },
  { code: 'career_dna', icon: '🧬', label: 'مكتشف الذات', desc: 'أكملت اختبار Career DNA', xp: 200 },
  { code: 'first_save', icon: '❤️', label: 'الباحث', desc: 'حفظت أول جامعة', xp: 30 },
  { code: 'saved_5', icon: '⭐', label: 'المقارن', desc: 'حفظت 5 جامعات', xp: 100 },
  { code: 'first_review', icon: '✍️', label: 'الكاتب', desc: 'نشرت أول تقييم', xp: 100 },
  { code: 'scholarship_apply', icon: '🏆', label: 'الطموح', desc: 'سجّلت أول منحة للمتابعة', xp: 150 },
  { code: 'streak_7', icon: '🔥', label: 'أسبوع متتالي', desc: 'دخلت لـ 7 أيام متتالية', xp: 100 },
  { code: 'streak_30', icon: '💎', label: 'شهر متتالي', desc: 'دخلت لـ 30 يوم متتالي', xp: 500 },
  { code: 'level_5', icon: '🎖️', label: 'متقدم', desc: 'وصلت للمستوى 5', xp: 200 },
];

export default function AchievementsTab({ profile, userId }: { profile: any; userId: string }) {
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
  const totalXP = BADGES.filter(b => earned.has(b.code)).reduce((s, b) => s + b.xp, 0);

  return (
    <div className="space-y-6">
      {/* Stats hero */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl p-6">
          <div className="text-4xl mb-2">⚡</div>
          <div className="text-4xl font-extrabold">{xp.toLocaleString()}</div>
          <div className="text-sm opacity-90 mt-1">إجمالي XP</div>
          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${(xpInLevel / 1000) * 100}%` }}></div>
          </div>
          <div className="text-xs opacity-80 mt-1">{xpInLevel} / 1000 للمستوى التالي</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-6">
          <div className="text-4xl mb-2">🎖️</div>
          <div className="text-4xl font-extrabold">{level}</div>
          <div className="text-sm opacity-90 mt-1">المستوى الحالي</div>
          <div className="text-xs opacity-80 mt-3">
            {level >= 10 ? '👑 خبير' : level >= 5 ? '🌟 متقدم' : level >= 3 ? '🎯 ناشط' : '🌱 مبتدئ'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-700 text-white rounded-2xl p-6">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-4xl font-extrabold">{streak}</div>
          <div className="text-sm opacity-90 mt-1">يوم متتالي</div>
          <div className="text-xs opacity-80 mt-3">حافظ على دخولك اليومي</div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-[#1b3a6b]">📊 تقدّمك في الأوسمة</h3>
          <span className="text-2xl font-extrabold text-[#1b3a6b]">{earnedCount} / {totalCount}</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all" style={{ width: `${(earnedCount / totalCount) * 100}%` }}></div>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <h3 className="font-bold text-xl text-[#1b3a6b] mb-4">🏅 الأوسمة</h3>
        {loading ? <div className="text-center py-12">⏳</div> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {BADGES.map(b => {
              const has = earned.has(b.code);
              return (
                <div key={b.code} className={`rounded-2xl p-5 border text-center transition ${has ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
                  <div className={`text-5xl mb-3 ${has ? '' : 'grayscale'}`}>{b.icon}</div>
                  <div className={`font-bold text-sm ${has ? 'text-orange-700' : 'text-slate-600'}`}>{b.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{b.desc}</div>
                  <div className={`text-xs font-bold mt-2 ${has ? 'text-amber-600' : 'text-slate-400'}`}>+{b.xp} XP</div>
                  {has && <div className="text-xs text-emerald-600 font-bold mt-1">✓ تم الفتح</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
