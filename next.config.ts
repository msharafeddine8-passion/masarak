import type { NextConfig } from "next";

// ─── Content Security Policy ────────────────────────────────────────────────
// Previously in report-only mode in next.config.mjs.
// FIX-03: now enforced (Content-Security-Policy, not -Report-Only).
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
  { key: "X-XSS-Protection",         value: "1; mode=block" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
  // HSTS — 1 year, include subdomains, preload-ready
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // CSP — enforced (was report-only in old next.config.mjs)
  { key: "Content-Security-Policy",   value: CSP },
];

const nextConfig: NextConfig = {
  // Allowed remote image hosts
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  async redirects() {
    return [
      // Canonical: redirect non-www → www (permanent 308)
      {
        source: "/:path*",
        has: [{ type: "host", value: "masaraklb.com" }],
        destination: "https://www.masaraklb.com/:path*",
        permanent: true,
      },
      // Legacy URL aliases
      { source: "/login",               destination: "/auth/login",               permanent: true },
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
    ];
  },

  async headers() {
    return [
      // Tighten CORS for HTML pages — pin to origin, not wildcard
      {
        source: "/((?!api/).*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://www.masaraklb.com" },
        ],
      },
      // Security headers on all routes
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
