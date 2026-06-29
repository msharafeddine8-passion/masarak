// Shared loading skeleton for the data-heavy list/section pages (universities,
// study-abroad, scholarships). Rendered by route-level loading.tsx during the
// server data fetch so users see a branded placeholder instead of a blank screen
// (audit UX1 — no loading states existed).
export default function ListSkeleton() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7faf9]" aria-busy="true" aria-live="polite">
      <span className="sr-only">جارٍ التحميل…</span>
      {/* Hero band */}
      <section className="bg-gradient-to-br from-[#0F4A52] to-[#16808F]">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <div className="mx-auto h-10 w-2/3 rounded-xl bg-white/20 animate-pulse" />
          <div className="mx-auto mt-3 h-4 w-1/2 rounded-lg bg-white/10 animate-pulse" />
        </div>
      </section>
      {/* Card grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="mx-auto h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
              <div className="mx-auto mt-3 h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
              <div className="mx-auto mt-2 h-3 w-1/2 rounded bg-gray-50 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
