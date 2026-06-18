"use client";
// src/app/error.tsx
// Root-level error boundary for Next.js App Router.
// Catches unhandled render errors in any route segment below.

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in dev; wire to Sentry/Datadog here when ready.
    console.error("[RootError]", error);
  }, [error]);

  return (
    <main
      dir="rtl"
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
        fontFamily: "Tajawal, sans-serif",
      }}
    >
      <div style={{ fontSize: 72 }}>⚠️</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>
        حدث خطأ غير متوقع
      </h1>
      <p style={{ color: "#666", fontSize: 16, maxWidth: 420, margin: 0 }}>
        نعتذر، واجهنا مشكلة تقنية. يمكنك المحاولة مرة أخرى أو العودة للرئيسية.
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre
          style={{
            background: "#fff1f2",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            padding: "0.75rem 1rem",
            fontSize: 12,
            color: "#b91c1c",
            maxWidth: 520,
            textAlign: "left",
            overflowX: "auto",
            margin: 0,
          }}
        >
          {error.message}
          {error.digest ? `\n\nDigest: ${error.digest}` : ""}
        </pre>
      )}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
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
        <Link
          href="/"
          style={{
            background: "#f1f5f9",
            color: "#1a1a2e",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "0.75rem 1.75rem",
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          🏠 الرئيسية
        </Link>
      </div>
    </main>
  );
}
