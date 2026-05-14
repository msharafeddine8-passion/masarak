"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const UNIVERSITIES = [
  { short: "AUB", name: "الجامعة الأمريكية في بيروت", minBac: 14, accepts: "BAC + SAT" },
  { short: "LAU", name: "الجامعة اللبنانية الأمريكية", minBac: 13, accepts: "BAC + SAT" },
  { short: "USJ", name: "جامعة القديس يوسف", minBac: 12, accepts: "BAC" },
  { short: "USEK", name: "جامعة الروح القدس", minBac: 12, accepts: "BAC" },
  { short: "UOB", name: "جامعة البلمند", minBac: 12, accepts: "BAC + SAT" },
  { short: "NDU", name: "جامعة سيدة اللويزة", minBac: 12, accepts: "BAC" },
  { short: "LIU", name: "الجامعة اللبنانية الدولية", minBac: 11, accepts: "BAC" },
  { short: "UL", name: "الجامعة اللبنانية", minBac: 10, accepts: "BAC + Concours" },
];

function bacToGpa(bac: number): number {
  if (bac >= 18) return 4.0;
  if (bac >= 16) return 3.7;
  if (bac >= 14) return 3.3;
  if (bac >= 13) return 3.0;
  if (bac >= 12) return 2.7;
  if (bac >= 11) return 2.3;
  if (bac >= 10) return 2.0;
  return 1.5;
}

function bacToSat(bac: number): number {
  if (bac >= 18) return 1500;
  if (bac >= 16) return 1350;
  if (bac >= 14) return 1200;
  if (bac >= 13) return 1100;
  if (bac >= 12) return 1000;
  if (bac >= 11) return 900;
  return 800;
}

function bacToPercent(bac: number): number {
  return Math.round((bac / 20) * 100);
}

function getMentionKey(bac: number): 'bac.mention.excellent' | 'bac.mention.very_good' | 'bac.mention.good' | 'bac.mention.pass' | 'bac.mention.fail' {
  if (bac >= 18) return 'bac.mention.excellent';
  if (bac >= 16) return 'bac.mention.very_good';
  if (bac >= 14) return 'bac.mention.good';
  if (bac >= 10) return 'bac.mention.pass';
  return 'bac.mention.fail';
}

export default function BacEquivalencePage() {
  const { t, dir } = useI18n();
  const [bacScore, setBacScore] = useState(13);

  const data = useMemo(() => {
    const gpa = bacToGpa(bacScore);
    const sat = bacToSat(bacScore);
    const percent = bacToPercent(bacScore);
    const mention = t(getMentionKey(bacScore));
    const eligibleUnis = UNIVERSITIES.filter((u) => bacScore >= u.minBac);
    const ineligibleUnis = UNIVERSITIES.filter((u) => bacScore < u.minBac);
    return { gpa, sat, percent, mention, eligibleUnis, ineligibleUnis };
  }, [bacScore, t]);

  return (
    <main className="min-h-screen bg-bg py-12 px-4" dir={dir}>
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
            {t('g.back')}
          </Link>
          <h1 className="text-4xl font-extrabold text-primary">
            {t('bac.title')}
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            {t('bac.subtitle')}
          </p>
        </div>

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-lg font-bold text-gray-800 mb-4">
            {t('bac.score.label')}
          </label>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="range"
              min="0"
              max="20"
              step="0.1"
              value={bacScore}
              onChange={(e) => setBacScore(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <input
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={bacScore}
              onChange={(e) => setBacScore(Math.min(20, Math.max(0, Number(e.target.value) || 0)))}
              className="w-24 border-2 border-primary rounded-xl px-3 py-2 text-2xl font-extrabold text-primary text-center"
            />
            <span className="text-gray-500 font-bold">/20</span>
          </div>
          <div className="text-center text-sm font-semibold text-gray-700">
            {t('bac.score.mention')} <span className="text-primary font-bold">{data.mention}</span>
          </div>
        </div>

        {/* Equivalences */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl p-6 text-center">
            <div className="text-xs opacity-90 mb-1">{t('bac.equiv.percent')}</div>
            <div className="text-5xl font-extrabold">{data.percent}%</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-6 text-center">
            <div className="text-xs opacity-90 mb-1">{t('bac.equiv.gpa')}</div>
            <div className="text-5xl font-extrabold">{data.gpa}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-6 text-center">
            <div className="text-xs opacity-90 mb-1">{t('bac.equiv.sat')}</div>
            <div className="text-5xl font-extrabold">{data.sat}</div>
          </div>
        </div>

        {/* Eligible Universities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
          <h2 className="text-xl font-bold text-emerald-700 mb-4">
            {t('bac.eligible.title.1')} ({data.eligibleUnis.length})
          </h2>
          {data.eligibleUnis.length === 0 ? (
            <p className="text-gray-500">{t('bac.eligible.empty')}</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {data.eligibleUnis.map((u) => (
                <div
                  key={u.short}
                  className="border-2 border-emerald-200 rounded-xl p-4 bg-emerald-50/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-extrabold text-primary">{u.short}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{u.name}</div>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      ≥ {u.minBac}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{t('bac.uni.accepts')} {u.accepts}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ineligible Universities */}
        {data.ineligibleUnis.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
            <h2 className="text-xl font-bold text-gray-600 mb-4">
              {t('bac.ineligible.title')} ({data.ineligibleUnis.length})
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {data.ineligibleUnis.map((u) => (
                <div
                  key={u.short}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 opacity-75"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-gray-700">{u.short}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{u.name}</div>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded">
                      ≥ {u.minBac}
                    </span>
                  </div>
                  <div className="text-xs text-orange-600 font-semibold mt-2">
                    {t('bac.ineligible.need')} {(u.minBac - bacScore).toFixed(1)} {t('bac.ineligible.extra')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          href="/universities"
          className="block bg-primary text-white rounded-2xl p-6 text-center hover:opacity-90 transition-opacity"
        >
          <div className="text-xl font-bold">{t('bac.cta.title')}</div>
          <div className="text-sm opacity-90 mt-1">{t('bac.cta.subtitle')}</div>
        </Link>

        <p className="text-xs text-gray-500 text-center mt-6">
          {t('bac.disclaimer')}
        </p>
      </div>
    </main>
  );
}
