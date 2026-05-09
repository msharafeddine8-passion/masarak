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
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
