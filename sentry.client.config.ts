// Sentry client SDK — runs in the browser
// Initialized via instrumentation-client.ts auto-discovery (Next.js 15+)
// or manually imported in Next.js 14. This file is referenced by withSentryConfig.

import * as Sentry from "@sentry/nextjs";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    // Lower in production to keep within free tier (5k/mo)
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Don't replay sessions (expensive)
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    environment: process.env.NODE_ENV,
    // Filter out noisy errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      "originalCreateNotification",
      "canvas.contentDocument",
      "MyApp_RemoveAllHighlights",
      // Network noise
      "Network request failed",
      "NetworkError",
      "Failed to fetch",
      // ResizeObserver loop (browser quirk, not actionable)
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      // Hydration mismatch from extensions/translators
      "Hydration failed",
      "Text content does not match",
    ],
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
    ],
  });
}
