// Next.js 14 reads next.config.mjs/.js (NOT .ts — that's Next 15+). The full
// project config lives here so it is actually applied under Next 14.

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

/** @type {import('next').NextConfig} */
const nextConfig = {
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

export default nextConfig;
