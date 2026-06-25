"use client";
import Link from "next/link";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function TrackerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try { Sentry.captureException(error, { tags: { boundary: "scholarships/tracker" } }); } catch { /* ignore */ }
  }, [error]);
  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🎓</div>
        <h1 className="text-2xl font-bold text-[#065a59] mb-2">تعذّر تحميل متابعة المنح</h1>
        <p className="text-ink-subtle mb-6">حدث خطأ في صفحة متابعة المنح. يرجى المحاولة مرة أخرى.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[#065a59] text-white rounded-xl font-bold text-sm"
          >
            🔄 حاول مجدداً
          </button>
          <Link href="/scholarships" className="px-5 py-2.5 bg-bg-soft text-ink-muted rounded-xl font-bold text-sm">
            ← المنح
          </Link>
        </div>
      </div>
    </main>
  );
}
