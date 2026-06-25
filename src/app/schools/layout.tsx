import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import { fetchSchools } from "@/lib/entities";

export const metadata = buildMetadata({
  title: "دليل المدارس اللبنانية — خاصة، رسمية، دولية، تقنية",
  description: "دليل شامل للمدارس اللبنانية: مدارس خاصة، رسمية، دولية، ومهنية. تفاصيل عن المنهج، الرسوم، التواصل، وآراء الطلاب.",
  path: "/schools",
  keywords: ["مدارس لبنانية","دليل المدارس","مدارس خاصة","مدارس رسمية","مدارس دولية"],
});

export default async function SchoolsLayout({ children }: { children: React.ReactNode }) {
  const schools = await fetchSchools();
  return (
    <>
      {children}
      <nav aria-label="كل المدارس" className="bg-surface border-t border-line py-10" dir="rtl">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-[#012730] mb-2">كل المدارس (تصفّح سريع)</h2>
          <p className="text-sm text-ink-muted mb-5">اضغط الاسم للذهاب لصفحة التفاصيل</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
            {schools.map(s => (
              <li key={s.id}>
                <Link
                  href={`/schools/${s.id}`}
                  className="text-[#1b3a6b] hover:underline font-semibold flex items-center gap-2"
                >
                  <span>🏫</span>
                  <span>{s.name}</span>
                  <span className="text-xs text-ink-subtle font-normal">— {s.region}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
