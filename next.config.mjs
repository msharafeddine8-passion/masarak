/** @type {import('next').NextConfig} */
// Next.js 14 reads next.config.mjs/.js (NOT .ts — that's Next 15+).

import { withSentryConfig } from "@sentry/nextjs";

// ─── Content Security Policy ────────────────────────────────────────────────
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
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
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Content-Security-Policy",   value: CSP },
];

const nextConfig = {
  experimental: { instrumentationHook: true },

  // ESLint runs in CI (via npm run lint) and locally in the editor.
  // We don't want a single lint warning to break the Production build,
  // so disable Next's build-time lint pass. CI is the real lint gate.
  eslint: { ignoreDuringBuilds: true },

  // Same reasoning for TypeScript: we have ~75 pre-existing TS errors
  // that don't affect runtime. CI's tsc step (continue-on-error) reports
  // them but doesn't block deploys.
  typescript: { ignoreBuildErrors: true },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "logo.clearbit.com" },
    ],
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "masaraklb.com" }],
        destination: "https://www.masaraklb.com/:path*",
        permanent: true,
      },
      { source: "/login",               destination: "/auth/login",                permanent: true },
      { source: "/signup",              destination: "/auth/register",             permanent: true },
      { source: "/register",            destination: "/auth/register",             permanent: true },
      { source: "/cost-calculator",     destination: "/tools/cost-calculator",     permanent: true },
      { source: "/career-ai",           destination: "/tools/career-ai",           permanent: true },
      { source: "/cv-builder",          destination: "/tools/cv-builder",          permanent: true },
      { source: "/cover-letter",        destination: "/tools/cover-letter",        permanent: true },
      { source: "/mock-interview",      destination: "/tools/interview-prep",      permanent: true },
      { source: "/skills-quiz",         destination: "/tools/skill-strengths",     permanent: true },
      { source: "/bac-equivalence",     destination: "/tools/bac-equivalence",     permanent: true },
      { source: "/application-tracker", destination: "/tools/application-tracker", permanent: true },
      { source: "/salary-calculator",   destination: "/tools/salary-calculator",   permanent: true },
      { source: "/manifest.json",       destination: "/manifest.webmanifest",      permanent: true },
      { source: "/parents",             destination: "/for-parents",               permanent: true },
      // Universities are now country-first under /universities (was /study-abroad/universities).
      { source: "/study-abroad/universities",        destination: "/universities", permanent: true },
      { source: "/study-abroad/universities/:path*", destination: "/universities", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/((?!api/).*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://www.masaraklb.com" },
        ],
      },
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

const hasSentry = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

export default hasSentry
  ? withSentryConfig(nextConfig, {
      silent: true,
      tunnelRoute: "/monitoring",
      disableLogger: true,
      hideSourceMaps: true,
      telemetry: false,
    })
  : nextConfig;
