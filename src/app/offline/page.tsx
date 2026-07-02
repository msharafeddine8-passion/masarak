"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function OfflinePage() {
  const { t } = useI18n();
  return (
    <main className="min-h-screen bg-bg-soft flex items-center justify-center px-4" dir="rtl">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">📡</div>
        <h1 className="text-3xl font-extrabold text-primary mb-3">{t("offline.title")}</h1>
        <p className="text-ink-muted mb-8 leading-relaxed">
          {t("offline.message")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => typeof window !== "undefined" && window.location.reload()}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold"
          >
            🔄 {t("offline.retry")}
          </button>
          <Link
            href="/"
            className="border-2 border-primary text-primary px-8 py-3 rounded-xl font-bold"
          >
            {t("offline.home")}
          </Link>
        </div>
        <p className="text-xs text-ink-subtle mt-8">
          💡 {t("offline.hint")}
        </p>
      </div>
    </main>
  );
}
