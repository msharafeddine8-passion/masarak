'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type Section = 'university' | 'school' | 'vocational' | 'major' | 'scholarship' | 'internship';

const SECTIONS: { key: Section; labelKey: TranslationKey; icon: string; href: (id: string) => string }[] = [
  { key: 'university',  labelKey: 'pt.sv.universities',  icon: '🏛️', href: (id) => `/universities/${id}` },
  { key: 'school',      labelKey: 'pt.sv.schools',       icon: '🏫', href: (id) => `/schools/${id}` },
  { key: 'vocational',  labelKey: 'pt.sv.vocational',    icon: '🛠️', href: (id) => `/vocational/${id}` },
  { key: 'major',       labelKey: 'pt.sv.majors',        icon: '📚', href: (id) => `/majors#${id}` },
  { key: 'scholarship', labelKey: 'pt.sv.scholarships',  icon: '🏆', href: (id) => `/scholarships#${id}` },
  { key: 'internship',  labelKey: 'pt.sv.internships',   icon: '💼', href: (id) => `/internships/hub#${id}` },
];

export default function SavedItemsTab({ userId }: { userId: string }) {
  const { t } = useI18n();
  const [active, setActive] = useState<Section>('university');
  const [items, setItems] = useState<Record<Section, any[]>>({ university: [], school: [], vocational: [], major: [], scholarship: [], internship: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!userId) return;
      const { data } = await supabase.from('saved_items').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      const grouped: any = { university: [], school: [], vocational: [], major: [], scholarship: [], internship: [] };
      (data || []).forEach((r: any) => { if (grouped[r.item_type]) grouped[r.item_type].push(r); });
      setItems(grouped);
      setLoading(false);
    })();
  }, [userId]);

  const remove = async (sec: Section, itemId: string) => {
    if (!confirm(t('pt.sv.confirm_remove'))) return;
    await supabase.from('saved_items').delete().eq('user_id', userId).eq('item_type', sec).eq('item_id', itemId);
    setItems((p) => ({ ...p, [sec]: p[sec].filter((it: any) => it.item_id !== itemId) }));
  };

  const current = items[active] || [];
  const sectionInfo = SECTIONS.find(s => s.key === active)!;

  return (
    <div>
      {/* Section pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SECTIONS.map(s => (
          <button key={s.key} onClick={() => setActive(s.key)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${active === s.key ? 'bg-[#1b3a6b] text-white' : 'bg-bg-soft text-ink-muted hover:bg-white/10'}`}>
            {s.icon} {t(s.labelKey)} {items[s.key].length > 0 && <span className="ml-1 opacity-80">({items[s.key].length})</span>}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-12">⏳</div> : current.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border-2 border-dashed border-white/10">
          <div className="text-7xl mb-4 animate-bounce-soft inline-block" style={{ animationDuration: '2s' }}>{sectionInfo.icon}</div>
          <h3 className="font-extrabold text-[#1b3a6b] text-lg mb-2">لسا ما حفظت شي</h3>
          <p className="text-ink-muted text-sm mb-5 max-w-xs mx-auto">احفظ {t(sectionInfo.labelKey)} اللي بتهمّك لتلاقيها هون بسهولة لما تكون جاهز تقدّم.</p>
          <Link href={sectionInfo.href('')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1b3a6b] text-white rounded-xl font-bold text-sm hover:bg-[#142d54] hover:scale-105 transition-all shadow-md">
            <span>{sectionInfo.icon}</span>
            <span>تصفّح {t(sectionInfo.labelKey)}</span>
            <span>←</span>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {current.map((it: any) => {
            const data = it.item_data || {};
            return (
              <div key={it.id} className="bg-surface rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-lg transition">
                {data.photo && <div className="aspect-video bg-bg-soft">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={data.photo} alt={data.name} className="w-full h-full object-cover" /></div>}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="text-2xl">{data.emoji || sectionInfo.icon}</div>
                      <h3 className="font-bold text-[#1b3a6b] mt-1">{data.name || it.item_id}</h3>
                      {data.region && <div className="text-xs text-ink-subtle">{data.region}</div>}
                    </div>
                    <button onClick={() => remove(active, it.item_id)} className="text-red-500 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center text-xl">×</button>
                  </div>
                  {data.desc && <p className="text-xs text-ink-muted line-clamp-2 mb-3">{data.desc}</p>}
                  <Link href={sectionInfo.href(it.item_id)} className="text-sm text-[#1b3a6b] font-bold hover:underline">{t('pt.sv.details')}</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
