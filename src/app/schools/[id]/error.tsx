"use client";
import Link from "next/link";

export default function SchoolError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main dir="rtl" className="min-h-screen bg-bg-soft flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🏫</div>
        <h1 className="text-2xl font-bold text-[#1b3a6b] mb-2">تعذّر تحميل المدرسة</h1>
        <p className="text-ink-subtle mb-6">حدث خطأ أثناء تحميل بيانات هذه المدرسة. يرجى المحاولة مرة أخرى.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-xl font-bold text-sm"
          >
            🔄 حاول مجدداً
          </button>
          <Link href="/schools" className="px-5 py-2.5 bg-bg-soft text-ink-muted rounded-xl font-bold text-sm">
            ← المدارس
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
