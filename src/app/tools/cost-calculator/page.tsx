"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

type Preset = { name: string; short: string; tuitionPerYear: number };

export default function CostCalculatorPage() {
  const { t, dir } = useI18n();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(true);
  const [tuition, setTuition] = useState(8000);

  useEffect(() => {
    supabase
      .from("universities")
      .select("name, short, tuition_min")
      .order("name")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPresets(
            data.map((u) => ({
              name: u.name,
              short: u.short || u.name,
              tuitionPerYear: u.tuition_min ?? 0,
            }))
          );
        }
        setPresetsLoading(false);
      });
  }, []);
  const [years, setYears] = useState(4);
  const [books, setBooks] = useState(500);
  const [transport, setTransport] = useState(100);
  const [living, setLiving] = useState(0);
  const [scholarshipPercent, setScholarshipPercent] = useState(0);

  const totals = useMemo(() => {
    const annualGross = tuition + books + transport * 12 + living * 12;
    const totalGross = annualGross * years;
    const scholarshipDiscount = (tuition * years * scholarshipPercent) / 100;
    const totalNet = totalGross - scholarshipDiscount;
    return {
      annualGross,
      totalGross,
      scholarshipDiscount,
      totalNet,
      monthlyAvg: Math.round(totalNet / (years * 12)),
    };
  }, [tuition, years, books, transport, living, scholarshipPercent]);

  return (
    <main className="min-h-screen bg-bg-soft py-12 px-4" dir={dir}>
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm text-ink-subtle hover:text-primary mb-2 inline-block">
            {t('g.back')}
          </Link>
          <h1 className="text-4xl font-extrabold text-primary">{t('cc.title')}</h1>
          <p className="text-ink-muted mt-3 text-lg">{t('cc.subtitle')}</p>
        </div>

        <div className="mb-8">
          <div className="text-sm font-semibold text-ink-muted mb-3">{t('cc.presets.label')}</div>
          <div className="flex flex-wrap gap-2">
            {presetsLoading ? (
              // Skeleton placeholders while fetching
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-32 bg-white/10 rounded-xl animate-pulse"
                />
              ))
            ) : (
              presets.map((p) => (
                <button
                  key={p.short}
                  onClick={() => setTuition(p.tuitionPerYear)}
                  className="px-4 py-2 bg-surface border-2 border-white/10 rounded-xl text-sm font-semibold hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {p.short} — ${p.tuitionPerYear.toLocaleString()}{t('cc.presets.per_year')}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-surface rounded-2xl shadow-sm border border-white/10 p-6 space-y-5">
            <h2 className="text-xl font-bold text-primary mb-4">{t('cc.section.input')}</h2>

            <div>
              <label className="block text-sm font-semibold text-ink-muted mb-2">{t('cc.input.tuition')}</label>
              <input type="number" value={tuition} onChange={(e) => setTuition(Number(e.target.value) || 0)} className="w-full border-2 border-white/10 rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" min="0" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-muted mb-2">{t('cc.input.years')}</label>
              <div className="flex items-center gap-3">
                <input type="range" min="1" max="7" value={years} onChange={(e) => setYears(Number(e.target.value))} className="flex-1 accent-primary" />
                <span className="font-bold text-2xl text-primary w-12 text-center">{years}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-muted mb-2">{t('cc.input.books')}</label>
              <input type="number" value={books} onChange={(e) => setBooks(Number(e.target.value) || 0)} className="w-full border-2 border-white/10 rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" min="0" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-muted mb-2">{t('cc.input.transport')}</label>
              <input type="number" value={transport} onChange={(e) => setTransport(Number(e.target.value) || 0)} className="w-full border-2 border-white/10 rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" min="0" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-muted mb-2">{t('cc.input.living')}</label>
              <input type="number" value={living} onChange={(e) => setLiving(Number(e.target.value) || 0)} className="w-full border-2 border-white/10 rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" min="0" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-muted mb-2">{t('cc.input.scholarship')}</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="100" step="5" value={scholarshipPercent} onChange={(e) => setScholarshipPercent(Number(e.target.value))} className="flex-1 accent-primary" />
                <span className="font-bold text-2xl text-primary w-16 text-center">{scholarshipPercent}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary to-[#1A8456] text-white rounded-2xl p-6 shadow-lg">
              <div className="text-sm opacity-90 mb-1">{t('cc.result.total_label')} ({years} {t('cc.result.years')})</div>
              <div className="text-5xl font-extrabold mb-2">${totals.totalNet.toLocaleString()}</div>
              {scholarshipPercent > 0 && (
                <div className="text-sm opacity-90">{t('cc.result.saved_with_scholar')} ${totals.scholarshipDiscount.toLocaleString()} {t('cc.result.with_scholarship')}</div>
              )}
            </div>

            <div className="bg-surface rounded-2xl border border-white/10 p-6">
              <div className="text-sm text-ink-subtle mb-1">{t('cc.result.monthly')}</div>
              <div className="text-3xl font-bold text-ink mb-4">${totals.monthlyAvg.toLocaleString()}{t('cc.result.monthly.suffix')}</div>
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t('cc.bd.tuition')}</span>
                  <span className="font-semibold">${(tuition * years).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t('cc.bd.books')}</span>
                  <span className="font-semibold">${(books * years).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t('cc.bd.transport')}</span>
                  <span className="font-semibold">${(transport * 12 * years).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">{t('cc.bd.living')}</span>
                  <span className="font-semibold">${(living * 12 * years).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Link href="/scholarships" className="block bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 hover:bg-amber-100 transition-colors">
              <div className="font-bold text-amber-900 mb-1">{t('cc.find_scholar.title')}</div>
              <p className="text-sm text-amber-900">{t('cc.find_scholar.body')}</p>
            </Link>
          </div>
        </div>

        <p className="text-xs text-ink-subtle text-center mt-8">
          {t('cc.disclaimer')}
        </p>
      </div>
    </main>
  );
}
