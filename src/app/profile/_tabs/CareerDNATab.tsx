'use client';
import Link from 'next/link';

const TYPES = [
  { code: 'INTJ', label: 'المخطّط الاستراتيجي', desc: 'منطقي، مبتكر، يحب التحديات', careers: ['هندسة', 'ريادة أعمال', 'بحث علمي'] },
  { code: 'INFJ', label: 'المرشد الملهم', desc: 'متعاطف، حدسي، إنساني', careers: ['طب نفسي', 'تعليم', 'كتابة'] },
  { code: 'ENTJ', label: 'القائد الطموح', desc: 'منظم، حاسم، مؤثّر', careers: ['إدارة أعمال', 'استشارات', 'قانون'] },
  { code: 'ENTP', label: 'المخترع', desc: 'مبدع، فضولي، اجتماعي', careers: ['تكنولوجيا', 'تسويق', 'إعلام'] },
  { code: 'ISTJ', label: 'المنظّم العملي', desc: 'منظم، دقيق، موثوق', careers: ['محاسبة', 'هندسة', 'إدارة'] },
  { code: 'ISFP', label: 'الفنّان الحساس', desc: 'فني، عطوف، هادئ', careers: ['تصميم', 'موسيقى', 'تمريض'] },
];

export default function CareerDNATab({ profile, update }: { profile: any; update: (p: any) => void }) {
  const completed = profile.career_dna_completed;
  const currentType = TYPES.find(t => t.code === profile.personality_type);

  return (
    <div className="space-y-6">
      {!completed ? (
        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-8 text-white text-center">
          <div className="text-6xl mb-4">🧬</div>
          <h2 className="text-2xl font-extrabold mb-2">اكتشف Career DNA الخاص بك</h2>
          <p className="text-white/90 max-w-xl mx-auto mb-6">
            اختبار شامل يكشف نوع شخصيتك، نقاط قوتك، والمسارات المهنية الأنسب لك. مبني على نظرية MBTI ومناسب للسياق العربي.
          </p>
          <Link href="/career-dna" className="inline-block px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:scale-105 transition">
            ابدأ الاختبار الآن 🚀
          </Link>
          <div className="text-xs opacity-80 mt-4">⏱️ مدة الاختبار: ~10 دقائق</div>
        </div>
      ) : (
        <>
          {/* Personality Card */}
          <div className="bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] rounded-2xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="text-6xl">🧬</div>
              <div className="flex-1">
                <div className="text-sm opacity-80">نوع شخصيتك</div>
                <h2 className="text-3xl font-extrabold mb-1">{profile.personality_type || 'INTJ'}</h2>
                <p className="text-white/90">{currentType?.label || 'المخطّط الاستراتيجي'}</p>
                <p className="text-sm text-white/80 mt-2">{currentType?.desc}</p>
              </div>
              <button onClick={() => update({ career_dna_completed: false })} className="text-xs text-white/70 hover:text-white underline">إعادة الاختبار</button>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card title="💪 نقاط القوة" items={profile.strengths || ['تفكير منطقي', 'إبداع', 'استقلالية']} color="emerald" />
            <Card title="⚠️ مجالات التطوير" items={profile.weaknesses || ['التواصل الاجتماعي', 'إدارة الوقت']} color="amber" />
          </div>

          {/* Career Matches */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-[#1b3a6b] mb-4">🎯 المسارات المهنية المناسبة لك</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(currentType?.careers || ['هندسة', 'إدارة أعمال', 'تكنولوجيا']).map((c, i) => {
                const match = 95 - i * 7;
                return (
                  <div key={c} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-4">
                    <div className="text-2xl mb-2">{['🏆', '🥈', '🥉'][i] || '⭐'}</div>
                    <div className="font-bold text-[#1b3a6b]">{c}</div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1"><span>التطابق</span><span className="font-bold">{match}%</span></div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${match}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Major Compatibility */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-[#1b3a6b] mb-4">📚 توافق التخصصات</h3>
            <div className="space-y-2">
              {['هندسة الحاسوب', 'إدارة الأعمال', 'الطب', 'التصميم', 'العلوم السياسية'].map((m, i) => {
                const pct = 90 - i * 12;
                return (
                  <div key={m}>
                    <div className="flex justify-between text-sm mb-1"><span className="font-semibold text-slate-700">{m}</span><span className="font-bold text-[#1b3a6b]">{pct}%</span></div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#1b3a6b] to-[#5cc4b8]" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button disabled className="px-5 py-2.5 bg-slate-200 text-slate-500 rounded-lg font-bold text-sm cursor-not-allowed">📄 تحميل التقرير (قريباً)</button>
            <Link href="/majors" className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm hover:bg-[#142d54]">📚 استعرض التخصصات</Link>
            <Link href="/careers" className="px-5 py-2.5 border-2 border-[#1b3a6b] text-[#1b3a6b] rounded-lg font-bold text-sm">💼 المسارات المهنية</Link>
          </div>
        </>
      )}
    </div>
  );
}

function Card({ title, items, color }: { title: string; items: string[]; color: 'emerald' | 'amber' }) {
  const cls = color === 'emerald' ? 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900' : 'from-amber-50 to-orange-50 border-amber-200 text-amber-900';
  return (
    <div className={`bg-gradient-to-br ${cls} border rounded-2xl p-5`}>
      <h3 className="font-bold mb-3">{title}</h3>
      <ul className="space-y-1.5 text-sm">
        {items.map((it, i) => <li key={i} className="flex items-start gap-2"><span>•</span><span>{it}</span></li>)}
      </ul>
    </div>
  );
}
