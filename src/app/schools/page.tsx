// Server Component — renders the hero + delegates the interactive list to
// SchoolsListClient. The data is fetched once on the server (cached for 1 day).
import { fetchSchools } from "@/lib/entities";
import SchoolsListClient from "./SchoolsListClient";

// Revalidate the static HTML once per day. Data updates after that interval.
export const revalidate = 86400;

export default async function SchoolsPage() {
  const items = await fetchSchools();

  return (
    <main className="min-h-screen bg-bg pb-20" dir="rtl">
      <section className="relative bg-gradient-hero text-white pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30" />
          <div
            className="absolute inset-0 bg-pattern-dots opacity-10"
            style={{ backgroundSize: "32px 32px" }}
          />
          <div className="absolute top-10 left-10 text-5xl animate-float opacity-40">🏫</div>
          <div
            className="absolute bottom-10 right-20 text-4xl animate-float opacity-40"
            style={{ animationDelay: "1s" }}
          >
            📚
          </div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4">
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            دليل المدارس
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            {items.length} مدرسة
          </h1>
          <p className="text-white/90 text-lg max-w-2xl">
            دليل شامل للمدارس اللبنانية: خاصة، رسمية، دولية، ومهنية. تفاصيل عن المنهج، الرسوم، والتواصل.
          </p>
        </div>
      </section>

      <SchoolsListClient items={items} />
    </main>
  );
}
