/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["supabase.co", "lh3.googleusercontent.com"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      // Sprint 1.5: canonical = www. Permanent 308 from non-www → www.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'masaraklb.com' }],
        destination: 'https://www.masaraklb.com/:path*',
        permanent: true,
      },
      { source: '/login',           destination: '/auth/login',    permanent: true },
      { source: '/signup',          destination: '/auth/register', permanent: true },
      { source: '/register',        destination: '/auth/register', permanent: true },
      { source: '/cost-calculator',     destination: '/tools/cost-calculator',    permanent: true },
      { source: '/career-ai',           destination: '/tools/career-ai',          permanent: true },
      { source: '/cv-builder',          destination: '/tools/cv-builder',         permanent: true },
      { source: '/cover-letter',        destination: '/tools/cover-letter',       permanent: true },
      { source: '/mock-interview',      destination: '/tools/interview-prep',     permanent: true },
      { source: '/skills-quiz',         destination: '/tools/skill-strengths',    permanent: true },
      { source: '/bac-equivalence',     destination: '/tools/bac-equivalence',    permanent: true },
      { source: '/application-tracker', destination: '/tools/application-tracker', permanent: true },
      { source: '/salary-calculator',   destination: '/tools/salary-calculator',  permanent: true },
      { source: '/manifest.json',       destination: '/manifest.webmanifest',     permanent: true },
      { source: '/parents',             destination: '/for-parents',              permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Sprint 5.5: HTML pages should NOT advertise wildcard CORS. Pin to origin.
        source: '/((?!api/).*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://www.masaraklb.com' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Sprint 5.2: CSP in Report-Only mode for a week, then switch the
          // header key to 'Content-Security-Policy' (without -Report-Only).
          { key: 'Content-Security-Policy-Report-Only', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https: ; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com; frame-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none';" },
        ],
      },
    ];
  },
};

export default nextConfig;
