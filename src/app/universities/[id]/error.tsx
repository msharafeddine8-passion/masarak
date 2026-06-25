"use client";
import Link from "next/link";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function UniversityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try { Sentry.captureException(error, { tags: { boundary: "universities/[id]" } }); } catch { /* ignore */ }
  }, [error]);
  return (
    <main dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🏛️</div>
        <h1 className="text-2xl font-bold text-[#1b3a6b] mb-2">تعذّر تحميل الجامعة</h1>
        <p className="text-gray-500 mb-6">حدث خطأ أثناء تحميل بيانات هذه الجامعة. يرجى المحاولة مرة أخرى.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-xl font-bold text-sm"
          >
            🔄 حاول مجدداً
          </button>
          <Link href="/universities" className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm">
            ← الجامعات
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 text-xs text-red-600 bg-red-50 rounded p-2 text-left overflow-x-auto">
            {error.message}
          </pre>
        )}
      </div>
    </main>
  );
}
