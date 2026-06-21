"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useI18n, type TranslationKey } from "@/lib/i18n";

type Field = "tech" | "medicine" | "engineering" | "business" | "design" | "marketing" | "finance" | "law" | "education";
type Market = "lebanon" | "gulf" | "remote";

const SALARY_DATA: Record<Field, { label: string; emoji: string; lebanon: [number, number]; gulf: [number, number]; remote: [number, number] }> = {
  tech: { label: "تكنولوجيا/برمجة", emoji: "💻", lebanon: [600, 2500], gulf: [2000, 6000], remote: [1500, 8000] },
  medicine: { label: "طب وصحة", emoji: "🏥", lebanon: [800, 5000], gulf: [3000, 12000], remote: [0, 0] },
  engineering: { label: "هندسة", emoji: "🏗️", lebanon: [500, 1800], gulf: [1500, 4500], remote: [800, 3500] },
  business: { label: "إدارة أعمال", emoji: "📈", lebanon: [500, 2000], gulf: [1800, 5000], remote: [1000, 4000] },
  design: { label: "تصميم/إبداع", emoji: "🎨", lebanon: [400, 1200], gulf: [1200, 3000], remote: [800, 3500] },
  marketing: { label: "تسويق", emoji: "📱", lebanon: [500, 1500], gulf: [1500, 4000], remote: [1000, 3500] },
  finance: { label: "مالية ومحاسبة", emoji: "💼", lebanon: [500, 1800], gulf: [1800, 5000], remote: [800, 3000] },
  law: { label: "قانون", emoji: "⚖️", lebanon: [600, 3000], gulf: [2000, 7000], remote: [0, 0] },
  education: { label: "تربية وتعليم", emoji: "🍎", lebanon: [400, 1500], gulf: [1500, 3500], remote: [400, 2000] },
};

const MARKET_LABEL_KEYS: Record<Market, { labelKey: TranslationKey; emoji: string }> = {
  lebanon: { labelKey: "sal.market.lebanon", emoji: "🇱🇧" },
  gulf:    { labelKey: "sal.market.gulf",    emoji: "🌍" },
  remote:  { labelKey: "sal.market.remote",  emoji: "🌐" },
};

function calcSalary(base: [number, number], yearsExp: number): [number, number] {
  const expMultiplier = 1 + yearsExp * 0.15;
  return [Math.round(base[0] * expMultiplier), Math.round(base[1] * expMultiplier)];
}

export default function SalaryCalculatorPage() {
  const { t, dir } = useI18n();
  const [field, setField] = useState<Field>("tech");
  const [market, setMarket] = useState<Market>("lebanon");
  const [yearsExp, setYearsExp] = useState(0);

  const result = useMemo(() => {
    const base = SALARY_DATA[field][market];
    if (base[0] === 0) return null;
    const range = calcSalary(base, yearsExp);
    const median = Math.round((range[0] + range[1]) / 2);
    return { range, median };
  }, [field, market, yearsExp]);

  const negotiationTipKeys: TranslationKey[] = [
    'sal.tip.1', 'sal.tip.2', 'sal.tip.3', 'sal.tip.4', 'sal.tip.5', 'sal.tip.6', 'sal.tip.7',
  ];

  return (
    <main className="min-h-screen bg-bg py-12 px-4" dir={dir}>
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-sm text-ink-subtle hover:text-primary mb-2 inline-block">
            {t('g.back')}
          </Link>
          <h1 className="text-4xl font-extrabold text-primary">{t('sal.title')}</h1>
          <p className="text-ink-muted mt-2">{t('sal.subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="bg-surface rounded-2xl border border-white/10 p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2">{t('sal.field')}</label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value as Field)}
                className="w-full border-2 border-white/10 rounded-xl px-3 py-2.5"
              >
                {(Object.keys(SALARY_DATA) as Field[]).map((f) => (
                  <option key={f} value={f}>
                    {SALARY_DATA[f].emoji} {SALARY_DATA[f].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">{t('sal.market')}</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(MARKET_LABEL_KEYS) as Market[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMarket(m)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold ${
                      market === m ? "border-primary bg-primary/5" : "border-white/10"
                    }`}
                  >
                    {MARKET_LABEL_KEYS[m].emoji} {t(MARKET_LABEL_KEYS[m].labelKey)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">{t('sal.years')}</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={yearsExp}
                  onChange={(e) => setYearsExp(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="font-bold text-2xl text-primary w-16 text-center">
                  {yearsExp}
                </span>
              </div>
              <div className="text-xs text-ink-subtle mt-1">
                {yearsExp === 0 ? t('sal.lvl.entry_new') : yearsExp < 3 ? t('sal.lvl.entry') : yearsExp < 7 ? t('sal.lvl.mid') : t('sal.lvl.senior')}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {result ? (
              <>
                <div className="bg-gradient-to-br from-primary to-[#1A8456] text-white rounded-2xl p-6">
                  <div className="text-sm opacity-90 mb-1">{t('sal.result.range')}</div>
                  <div className="text-3xl md:text-4xl font-extrabold mb-2">
                    ${result.range[0].toLocaleString()} — ${result.range[1].toLocaleString()}
                  </div>
                  <div className="text-sm opacity-90">{t('sal.result.monthly')}</div>
                </div>

                <div className="bg-surface rounded-2xl border border-white/10 p-6">
                  <div className="text-sm text-ink-subtle mb-1">{t('sal.result.median')}</div>
                  <div className="text-3xl font-bold text-ink">
                    ${result.median.toLocaleString()}{t('sal.result.month_suffix')}
                  </div>
                  <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">{t('sal.bd.min')}</span>
                      <span className="font-semibold">${result.range[0].toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">{t('sal.bd.max')}</span>
                      <span className="font-semibold">${result.range[1].toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">{t('sal.bd.annual')}</span>
                      <span className="font-semibold">${(result.median * 12).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                <p className="text-amber-900 font-semibold">
                  {t('sal.no_remote')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Negotiation Tips */}
        <div className="mt-8 bg-surface rounded-2xl border-2 border-emerald-200 p-6">
          <h2 className="text-xl font-extrabold text-emerald-700 mb-4">
            {t('sal.tips.title')}
          </h2>
          <ul className="space-y-3">
            {negotiationTipKeys.map((key, idx) => (
              <li key={key} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-sm text-ink leading-relaxed">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-ink-subtle text-center mt-6">
          ⚠️ الأرقام تقديرية ومبنية على متوسطات السوق 2026. الراتب الفعلي يعتمد على الشركة والمهارات.
        </p>
      </div>
    </main>
  );
}
