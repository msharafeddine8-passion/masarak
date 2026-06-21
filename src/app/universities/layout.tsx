import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import { UNIVERSITIES } from "./data";

export const metadata = buildMetadata({
  title: "دليل الجامعات 2026 — مقارنة، رسوم، تخصصات",
  description:
    "قارن بين الجامعات في المنطقة العربية والعالم: الرسوم، التخصصات، شروط القبول، ومعدلات التوظيف — كل المعلومات في مكان واحد.",
  path: "/universities",
  keywords: ["دليل الجامعات","أفضل الجامعات","مقارنة جامعات","رسوم الجامعات","قبول الجامعات","تخصصات جامعية"],
});

// Server-rendered SEO link index — visible to crawlers even when the interactive
// listing is client-rendered. Each entity gets a real anchor link.
export default function UniversitiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <nav aria-label="كل الجامعات" className="bg-surface border-t border-white/10 py-10" dir="rtl">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-[#012730] mb-2">كل الجامعات (تصفّح سريع)</h2>
          <p className="text-sm text-ink-muted mb-5">٣٥ جامعة معتمدة — اضغط الاسم للذهاب لصفحة التفاصيل</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
            {UNIVERSITIES.map(u => (
              <li key={u.id}>
                <Link
                  href={`/universities/${u.id}`}
                  className="text-[#1b3a6b] hover:underline font-semibold flex items-center gap-2"
                >
                  <span>{u.emoji}</span>
                  <span>{u.name}</span>
                  <span className="text-xs text-ink-subtle font-normal">— {u.region}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
