/** @type {import('next').NextConfig} */
// ─── Content Security Policy ────────────────────────────────────────────────
// NOTE: Next.js 14 does NOT support next.config.ts — config MUST live in a
// .js/.mjs/.cjs file or Next ignores it (and errors if .ts is the only config).
// This file was converted from the old next.config.ts so the headers/redirects
// below are actually applied by Next at build time.
const CSP = [
  "default-src 'self'",
  // Next.js inline scripts + Google Tag Manager
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // blob: for html2canvas card exports
  "img-src 'self' data: blob: https:",
  // Supabase WS + GA
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

// ─── Security headers (applied to all routes) ─────────────────────────────
const securityHeaders = [
  { key: "X-Frame-Options",           value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-XSS-Protection",          value: "1; mode=block" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
  // HSTS — 1 year, include subdomains, preload-ready
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // CSP — enforced
  { key: "Content-Security-Policy",   value: CSP },
];

const nextConfig = {
  // Required on Next 14 so src/instrumentation.ts loads the Sentry server/edge SDK.
  experimental: { instrumentationHook: true },

  // Allowed remote image hosts
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // university logos from Clearbit
      {
        source: "/:path*",
        has: [{ type: "host", value: "masaraklb.com" }],
        destination: "https://www.masaraklb.com/:path*",
        permanent: true,
      },
      // Legacy URL aliases
      {
        source: "/((?!api/).*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://www.masaraklb.com" },
        ],
      },
      // Security headers on all routes
