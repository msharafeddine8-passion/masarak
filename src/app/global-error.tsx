"use client";
// src/app/global-error.tsx
// Catches errors thrown in the ROOT layout itself (which app/error.tsx cannot).
// Must render its own <html>/<body> because it replaces the root layout. (audit M-2)

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
    // Most critical — root layout crash. Always send to Sentry.
    try { Sentry.captureException(error, { tags: { boundary: "global", severity: "critical" } }); } catch { /* ignore */ }
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          padding: "2rem",
          textAlign: "center",
          gap: "1.25rem",
          fontFamily: "Tajawal, system-ui, sans-serif",
          margin: 0,
        }}
      >
        <div style={{ fontSize: 72 }}>⚠️</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>
          حدث خطأ غير متوقع
        </h1>
        <p style={{ color: "#666", fontSize: 16, maxWidth: 420, margin: 0 }}>
          نعتذر، واجهنا مشكلة تقنية. جرّب تحديث الصفحة أو العودة لاحقاً.
        </p>
        <button
          onClick={reset}
          style={{
            background: "linear-gradient(135deg, #012730, #024d5a)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "0.75rem 1.75rem",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🔄 حاول مرة أخرى
        </button>
      </body>
    </html>
  );
}
