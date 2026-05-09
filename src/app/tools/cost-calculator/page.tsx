"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const PRESETS = [
  { name: "AUB", short: "AUB", tuitionPerYear: 16000 },
  { name: "LAU", short: "LAU", tuitionPerYear: 12000 },
  { name: "USJ", short: "USJ", tuitionPerYear: 4000 },
  { name: "USEK", short: "USEK", tuitionPerYear: 5000 },
  { name: "LIU", short: "LIU", tuitionPerYear: 3000 },
  { name: "UL (الجامعة اللبنانية)", short: "UL", tuitionPerYear: 0 },
];

export default function CostCalculatorPage() {
  const [tuition, setTuition] = useState(8000);
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
    <main className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
            ← العودة
          </Link>
          <h1 className="text-4xl font-extrabold text-primary">حاسبة تكلفة الجامعة</h1>
          <p className="text-gray-600 mt-3 text-lg">احسب التكلفة الإجمالية لدراستك في لبنان</p>
        </div>

        <div className="mb-8">
          <div className="text-sm font-semibold text-gray-700 mb-3">اختر جامعة لتعبئة الرسوم تلقائياً:</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.short}
                onClick={() => setTuition(p.tuitionPerYear)}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold hover:border-primary hover:bg-primary/5 transition-colors"
              >
                {p.short} — ${p.tuitionPerYear.toLocaleString()}/سنة
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
            <h2 className="text-xl font-bold text-primary mb-4">أدخل تكاليفك</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الرسوم السنوية ($)</label>
              <input type="number" value={tuition} onChange={(e) => setTuition(Number(e.target.value) || 0)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" min="0" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">عدد السنوات</label>
              <div className="flex items-center gap-3">
                <input type="range" min="1" max="7" value={years} onChange={(e) => setYears(Number(e.target.value))} className="flex-1 accent-primary" />
                <span className="font-bold text-2xl text-primary w-12 text-center">{years}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الكتب السنوية ($)</label>
              <input type="number" value={books} onChange={(e) => setBooks(Number(e.target.value) || 0)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" min="0" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">المواصلات الشهرية ($)</label>
              <input type="number" value={transport} onChange={(e) => setTransport(Number(e.target.value) || 0)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" min="0" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">السكن الشهري ($)</label>
              <input type="number" value={living} onChange={(e) => setLiving(Number(e.target.value) || 0)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none" min="0" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">نسبة المنحة المتوقعة (%)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="100" step="5" value={scholarshipPercent} onChange={(e) => setScholarshipPercent(Number(e.target.value))} className="flex-1 accent-primary" />
                <span className="font-bold text-2xl text-primary w-16 text-center">{scholarshipPercent}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary to-[#1A8456] text-white rounded-2xl p-6 shadow-lg">
              <div className="text-sm opacity-90 mb-1">التكلفة الإجمالية ({years} سنوات)</div>
              <div className="text-5xl font-extrabold mb-2">${totals.totalNet.toLocaleString()}</div>
              {scholarshipPercent > 0 && (
                <div className="text-sm opacity-90">وفّرت ${totals.scholarshipDiscount.toLocaleString()} بالمنحة</div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-1">التكلفة الشهرية المتوسطة</div>
              <div className="text-3xl font-bold text-gray-800 mb-4">${totals.monthlyAvg.toLocaleString()}/شهر</div>
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">الرسوم الإجمالية:</span>
                  <span className="font-semibold">${(tuition * years).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الكتب الإجمالية:</span>
                  <span className="font-semibold">${(books * years).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المواصلات الإجمالية:</span>
                  <span className="font-semibold">${(transport * 12 * years).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">السكن الإجمالي:</span>
                  <span className="font-semibold">${(living * 12 * years).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Link href="/scholarships" className="block bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 hover:bg-amber-100 transition-colors">
              <div className="font-bold text-amber-900 mb-1">ابحث عن منح دراسية ←</div>
              <p className="text-sm text-amber-900">قلّل تكلفتك بمنحة جزئية أو كاملة</p>
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-8">
          الأرقام تقديرية. تواصل مع الجامعة للأرقام الرسمية.
        </p>
      </div>
    </main>
  );
}
