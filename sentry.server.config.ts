// Sentry server SDK — runs in Node.js (API routes, server components, SSR)
import * as Sentry from "@sentry/nextjs";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    environment: process.env.NODE_ENV,
    // Server-side: capture more context but stay frugal
    sendDefaultPii: false,
    ignoreErrors: [
      // Supabase 401/403 — these are normal RLS rejections, not bugs
      "JWT expired",
      "Auth session missing",
    ],
  });
}
