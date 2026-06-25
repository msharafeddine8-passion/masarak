// Loads the Sentry server/edge SDK at runtime. Required on Next.js 14
// (paired with experimental.instrumentationHook in next.config.mjs).
// No-op unless NEXT_PUBLIC_SENTRY_DSN is set (the configs gate themselves).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}
