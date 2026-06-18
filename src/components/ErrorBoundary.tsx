"use client";
// src/components/ErrorBoundary.tsx
// Reusable class-based error boundary for wrapping specific sections.
// Next.js App Router also provides file-based error.tsx for route segments.

import React, { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  /** Optional custom fallback. Receives error + retry function. */
  fallback?: (error: Error, retry: () => void) => ReactNode;
  /** Optional label for debugging (shown in dev mode only). */
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in dev; could send to Sentry/Datadog here.
    console.error(`[ErrorBoundary${this.props.label ? ` ${this.props.label}` : ""}]`, error, info.componentStack);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry);
      }
      return (
        <DefaultFallback
          error={this.state.error}
          retry={this.retry}
          label={this.props.label}
        />
      );
    }
    return this.props.children;
  }
}

function DefaultFallback({
  error,
  retry,
  label,
}: {
  error: Error;
  retry: () => void;
  label?: string;
}) {
  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
        padding: "2rem",
        textAlign: "center",
        gap: "1rem",
      }}
    >
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h2 style={{ fontWeight: 700, fontSize: 18, color: "#1a1a2e", margin: 0 }}>
        حدث خطأ غير متوقع
      </h2>
      <p style={{ color: "#666", fontSize: 14, margin: 0 }}>
        {label ? `في قسم: ${label}. ` : ""}
        يرجى المحاولة مرة أخرى.
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
            maxWidth: 480,
            textAlign: "left",
            overflowX: "auto",
            margin: 0,
          }}
        >
          {error.message}
        </pre>
      )}
      <button
        onClick={retry}
        style={{
          background: "linear-gradient(135deg, #012730, #024d5a)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "0.65rem 1.5rem",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        🔄 حاول مرة أخرى
      </button>
    </div>
  );
}
