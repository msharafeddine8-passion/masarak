"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-bg-soft flex items-center justify-center px-4" dir="rtl">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">📡</div>
        <h1 className="text-3xl font-extrabold text-primary mb-3">أنت خارج الشبكة</h1>
        <p className="text-ink-muted mb-8 leading-relaxed">
          ما في اتصال بالإنترنت حالياً. تأكد من اتصالك وحاول مرة ثانية.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => typeof window !== "undefined" && window.location.reload()}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold"
          >
            🔄 حاول مرة ثانية
          </button>
          <Link
            href="/"
            className="border-2 border-primary text-primary px-8 py-3 rounded-xl font-bold"
          >
            الصفحة الرئيسية
          </Link>
        </div>
        <p className="text-xs text-ink-subtle mt-8">
          💡 بعض الصفحات اللي زرتها قبل بقدر تشوفها بدون اتصال (PWA support)
        </p>
      </div>
    </main>
  );
}
