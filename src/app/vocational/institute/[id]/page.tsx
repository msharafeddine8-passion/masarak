"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchInstituteById } from "@/lib/entities";
import Breadcrumb from "@/components/Breadcrumb";
import { useI18n } from "@/lib/i18n";
import ErrorState from "@/components/ErrorState";

export default function InstituteDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const id = Number(params?.id);
  const [inst, setInst] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  // FIX (audit C1): .then had no .catch → a failed fetch hung on ⏳ forever.
  const loadInst = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchInstituteById(id)
      .then((i) => { setInst(i); setLoading(false); })
      .catch((e) => { setError(e); setLoading(false); });
  }, [id]);

  useEffect(() => { loadInst(); }, [loadInst]);

  if (loading) return <main className="min-h-screen flex items-center justify-center" dir="rtl">⏳</main>;
  if (error) return <main className="min-h-screen bg-bg-soft flex items-center justify-center p-4" dir="rtl"><ErrorState error={error} onRetry={loadInst} context="vocational-institute" className="max-w-md w-full" /></main>;
  if (!inst) {
    return <main className="min-h-screen bg-bg-soft flex items-center justify-center" dir="rtl"><div className="text-center"><div className="text-6xl">🔍</div><h1 className="text-2xl font-bold text-[#1b3a6b] mt-4">{t('vocinst.notFound')}</h1><Link href="/vocational" className="mt-4 inline-block px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">← {t('vocinst.back')}</Link></div></main>;
  }

  const typeColor: Record<string, string> = { "رسمي": "bg-green-100 text-green-700", "خاص": "bg-blue-100 text-blue-700", "مهني": "bg-purple-100 text-purple-700" };

  return (
    <main className="min-h-screen bg-bg-soft pb-20" dir="rtl">
      <section className="bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-4">
            <Breadcrumb items={[
              { label: t('vocinst.home'), href: '/' },
              { label: t('vocinst.vocationalEducation'), href: '/vocational' },
              { label: inst.name || '...' },
            ]} variant="dark" />
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mt-4">
            <div className="text-7xl">{inst.emoji}</div>
            <div className="flex-1">
              <div className="text-sm opacity-85 mb-1">{inst.region}</div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{inst.name}</h1>
              <span className={`${typeColor[inst.type as string] || 'bg-surface/15'} px-3 py-1 rounded-full text-sm font-semibold`}>{inst.type}</span>
            </div>
            {inst.website && <a href={inst.website} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-surface text-[#1b3a6b] rounded-lg font-bold text-sm">🌐 {t('vocinst.website')}</a>}
          </div>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-[#1b3a6b] mb-4">🎯 {t('vocinst.availableSpecialties')}</h2>
          <div className="grid md:grid-cols-2 gap-3">{(inst.specialties || []).map((s: string, i: number) => <div key={i} className="flex items-center gap-2 bg-bg-soft p-3 rounded-lg text-sm"><span className="text-[#1b3a6b]">📚</span><span className="font-semibold text-ink-muted">{s}</span></div>)}</div>
        </div>
      </div>
    </main>
  );
}
