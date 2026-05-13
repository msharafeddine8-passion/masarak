"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

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

const MARKET_LABELS: Record<Market, { label: string; emoji: string }> = {
  lebanon: { label: "لبنان", emoji: "🇱🇧" },
  gulf: { label: "الخليج", emoji: "🌍" },
  remote: { label: "عن بعد (دولي)", emoji: "🌐" },
};

function calcSalary(base: [number, number], yearsExp: number): [number, number] {
  const expMultiplier = 1 + yearsExp * 0.15;
  return [Math.round(base[0] * expMultiplier), Math.round(base[1] * expMultiplier)];
}

export default function SalaryCalculatorPage() {
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

  const negotiationTips = [
    "ابحث عن متوسط الراتب في السوق قبل المقابلة",
    "اطلب 10-15% أكثر من المعروض إذا كنت متأكد من قيمتك",
    "اذكر الإنجازات والمهارات التي تبرّر طلبك",
    "ناقش التعويضات الكاملة (ضمان صحي، إجازات، bonuses)",
    "لا تقول رقم أول — اسأل عن الميزانية المخصصة للوظيفة",
    "كن مهذّب لكن واثق — السكوت قوة في التفاوض",
    "إذا الراتب ثابت، فاوض على فلكسبيلتي ساعات العمل أو remote",
  ];

  return (
    <main className="min-h-screen bg-bg py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
            ← العودة
          </Link>
          <h1 className="text-4xl font-extrabold text-primary">💵 حاسبة الراتب</h1>
          <p className="text-gray-600 mt-2">اعرف راتبك المتوقّع وفنّ التفاوض</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2">المجال</label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value as Field)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5"
              >
                {(Object.keys(SALARY_DATA) as Field[]).map((f) => (
                  <option key={f} value={f}>
                    {SALARY_DATA[f].emoji} {SALARY_DATA[f].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">السوق</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(MARKET_LABELS) as Market[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMarket(m)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold ${
                      market === m ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                  >
                    {MARKET_LABELS[m].emoji} {MARKET_LABELS[m].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">سنوات الخبرة</label>
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
              <div className="text-xs text-gray-500 mt-1">
                {yearsExp === 0 ? "خرّيج جديد" : yearsExp < 3 ? "Entry-level" : yearsExp < 7 ? "Mid-level" : "Senior"}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {result ? (
              <>
                <div className="bg-gradient-to-br from-primary to-[#1A8456] text-white rounded-2xl p-6">
                  <div className="text-sm opacity-90 mb-1">النطاق المتوقّع</div>
                  <div className="text-3xl md:text-4xl font-extrabold mb-2">
                    ${result.range[0].toLocaleString()} — ${result.range[1].toLocaleString()}
                  </div>
                  <div className="text-sm opacity-90">شهرياً</div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="text-sm text-gray-500 mb-1">الراتب الأوسط</div>
                  <div className="text-3xl font-bold text-gray-800">
                    ${result.median.toLocaleString()}/شهر
                  </div>
                  <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحد الأدنى:</span>
                      <span className="font-semibold">${result.range[0].toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحد الأعلى:</span>
                      <span className="font-semibold">${result.range[1].toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">السنوي المتوسط:</span>
                      <span className="font-semibold">${(result.median * 12).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                <p className="text-amber-900 font-semibold">
                  هذا المجال ما عنده فرص remote بشكل شائع. جرّب لبنان أو الخليج.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Negotiation Tips */}
        <div className="mt-8 bg-white rounded-2xl border-2 border-emerald-200 p-6">
          <h2 className="text-xl font-extrabold text-emerald-700 mb-4">
            🤝 فنّ التفاوض على الراتب
          </h2>
          <ul className="space-y-3">
            {negotiationTips.map((tip, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-800 leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          ⚠️ الأرقام تقديرية ومبنية على متوسطات السوق 2026. الراتب الفعلي يعتمد على الشركة والمهارات.
        </p>
      </div>
    </main>
  );
}
