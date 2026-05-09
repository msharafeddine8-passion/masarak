"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  emoji: string;
  title: string;
  description: string;
  features: string[];
  expected: string;
  storageKey: string;
}

export default function ComingSoonPage({ emoji, title, description, features, expected, storageKey }: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    try {
      const list = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!list.includes(email)) list.push(email);
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch (err) {
      console.error(err);
    }
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 flex items-center" dir="rtl">
      <div className="container mx-auto max-w-2xl text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-4 inline-block">
          ← العودة
        </Link>

        <div className="text-7xl mb-6">{emoji}</div>

        <div className="inline-block px-4 py-1 bg-amber-100 text-amber-800 text-sm font-bold rounded-full mb-4">
          🚀 قريباً جداً
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
          {title}
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">{description}</p>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6 text-right">
          <h2 className="font-bold text-lg mb-3">شو رح يكون فيه:</h2>
          <ul className="space-y-2 text-sm">
            {features.map((f, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t text-xs text-gray-500">
            📅 الإطلاق المتوقّع: <strong>{expected}</strong>
          </div>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="font-bold text-emerald-900 text-lg">تمّ التسجيل!</h3>
            <p className="text-sm text-emerald-800 mt-1">
              بنبّهك على {email} لما تطلق الميزة
            </p>
          </div>
        ) : (
          <form onSubmit={subscribe} className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <h3 className="font-bold mb-3">سجّل ليصلك تنبيه عند الإطلاق</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5"
              />
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90"
              >
                نبّهني 🔔
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 flex flex-wrap gap-2 justify-center text-sm">
          <Link href="/tools" className="text-primary font-bold underline">
            تصفّح الأدوات المتاحة
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/" className="text-primary font-bold underline">
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
