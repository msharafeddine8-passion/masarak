"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchTrackById } from "@/lib/entities";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import Breadcrumb from "@/components/Breadcrumb";

export default function VocationalTrackPage() {
  const params = useParams();
  const id = String(params?.id || '');
  const { t, dir } = useI18n();
  const [track, setTrack] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTrackById(id).then((x) => { setTrack(x); setLoading(false); }); }, [id]);

  if (loading) return <main className="min-h-screen flex items-center justify-center" dir={dir}>⏳</main>;
  if (!track) {
    return (
      <main className="min-h-screen bg-bg-soft flex items-center justify-center" dir={dir}>
        <div className="text-center"><div className="text-6xl mb-4">🔍</div><h1 className="text-2xl font-bold text-[#1b3a6b]">{t('dp.voc.not_found')}</h1>
          <Link href="/vocational" className="mt-4 inline-block px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">{t('dp.voc.back_btn')}</Link></div>
      </main>
    );
  }

  const demandColor = { "عالٍ جداً": "bg-emerald-100 text-emerald-700", "عالٍ": "bg-blue-100 text-blue-700", "متوسط": "bg-amber-100 text-amber-700", "منخفض": "bg-bg-soft text-ink-muted" }[track.demand as string] || "bg-bg-soft";
  const levelLabelKeys: Record<string, TranslationKey> = { LT: 'dp.voc.lvl.LT', BT: 'dp.voc.lvl.BT', TS: 'dp.voc.lvl.TS', licence: 'dp.voc.lvl.licence' };

  return (
    <main className="min-h-screen bg-bg-soft pb-20" dir={dir}>
      <section className="bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="mb-4">
            <Breadcrumb items={[
              { label: t('nav.home') || 'الرئيسية', href: '/' },
              { label: t('nav.vocational') || 'التعليم المهني', href: '/vocational' },
              { label: track.name || '...' },
            ]} variant="dark" />
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mt-4">
            <div className="text-7xl">{track.emoji}</div>
            <div className="flex-1">
              <div className="text-sm opacity-85 mb-1">{t('dp.voc.sector_label')} {track.sector}</div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{track.name}</h1>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-surface/15 backdrop-blur px-3 py-1 rounded-full font-semibold">{levelLabelKeys[track.level as string] ? t(levelLabelKeys[track.level as string]) : track.level}</span>
                <span className="bg-surface/15 backdrop-blur px-3 py-1 rounded-full">{track.duration}</span>
                <span className={`${demandColor} px-3 py-1 rounded-full font-semibold`}>{t('dp.voc.demand_label')} {track.demand}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-surface rounded-2xl p-6 shadow-sm border-r-4 border-emerald-500">
            <div className="text-sm text-ink-subtle mb-1">{t('dp.voc.salary_lb')}</div>
            <div className="text-2xl font-extrabold text-emerald-700">{track.salaryLB}</div>
          </div>
          <div className="bg-surface rounded-2xl p-6 shadow-sm border-r-4 border-blue-500">
            <div className="text-sm text-ink-subtle mb-1">{t('dp.voc.salary_gulf')}</div>
            <div className="text-2xl font-extrabold text-blue-700">{track.salaryGulf}</div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">{t('dp.voc.desc')}</h2>
          <p className="text-ink-muted leading-relaxed">{track.desc}</p>
        </div>
        {track.subjects?.length > 0 && (
          <div className="bg-surface rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">{t('dp.voc.subjects')}</h2>
            <div className="grid md:grid-cols-2 gap-3">{track.subjects.map((s: string, i: number) => <div key={i} className="flex items-start gap-2 text-sm text-ink-muted bg-bg-soft p-3 rounded-lg"><span className="text-[#1b3a6b]">📖</span><span>{s}</span></div>)}</div>
          </div>
        )}
        {track.uniEquiv && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h2 className="font-bold text-lg text-[#1b3a6b] mb-2">{t('dp.voc.uni_equiv')}</h2>
            <p className="text-ink-muted text-sm">{track.uniEquiv}</p>
          </div>
        )}
      </div>
    </main>
  );
}
