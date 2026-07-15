// /schools/compare?ids=1,2,3 — side-by-side comparison of up to 3 schools
// (Schools Rebuild spec Part E / Part C). Server-rendered from real fields only;
// empty cells render "—", never blank. Utility page → noindex.
import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Breadcrumb from "@/components/Breadcrumb";
import { getSchoolsByIds, normalizedType, type SchoolRecord } from "@/lib/schools";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return buildMetadata({ title: "مقارنة المدارس | مسارك", description: "قارن بين المدارس جنباً إلى جنب على مسارك.", path: "/schools/compare", noIndex: true });
}

const TYPE_AR: Record<string, string> = {
  official: "رسمية", private: "خاصة", international: "دولية",
  vocational: "مهنية", religious: "دينية", semi_private: "شبه مجانية", unrwa: "أونروا",
};
const STAGE_AR: Record<string, string> = { kindergarten: "روضة", primary: "ابتدائي", intermediate: "متوسط", secondary: "ثانوي" };
const LANG_AR: Record<string, string> = { Arabic: "العربية", English: "الإنجليزية", French: "الفرنسية" };
const GENDER_AR: Record<string, string> = { mixed: "مختلط", boys: "بنين", girls: "بنات" };

const DASH = "—";
function fees(s: SchoolRecord): string {
  if (s.fees_min != null && s.fees_min > 0) return `$${s.fees_min.toLocaleString("en")}${s.fees_max ? `–$${s.fees_max.toLocaleString("en")}` : "+"}`;
  return DASH;
}

// Comparison rows — label + how to pull the value from a record.
const ROWS: { label: string; get: (s: SchoolRecord) => string }[] = [
  { label: "النوع", get: (s) => TYPE_AR[normalizedType(s) || ""] || s.type || DASH },
  { label: "المراحل", get: (s) => s.education_stages.map((x) => STAGE_AR[x] || x).join("، ") || DASH },
  { label: "المنهج", get: (s) => s.curriculum.join("، ") || DASH },
  { label: "لغات التعليم", get: (s) => (s.teaching_languages.length ? s.teaching_languages.map((x) => LANG_AR[x] || x).join("، ") : s.lang || DASH) },
  { label: "نظام القبول", get: (s) => (s.gender_type && GENDER_AR[s.gender_type]) || DASH },
  { label: "المحافظة", get: (s) => s.governorate || DASH },
  { label: "المنطقة", get: (s) => s.district || s.city_or_area || DASH },
  { label: "الأقساط (سنوياً)", get: fees },
  { label: "المرافق البارزة", get: (s) => (s.facilities.length ? s.facilities.slice(0, 4).join("، ") : DASH) },
  { label: "التوثيق", get: (s) => (s.is_verified ? "✓ موثّقة" : DASH) },
];

export default async function CompareSchoolsPage({ searchParams }: { searchParams: { ids?: string } }) {
  const ids = (searchParams.ids || "")
    .split(",").map((x) => parseInt(x.trim(), 10)).filter((n) => Number.isFinite(n)).slice(0, 3);
  const schools = ids.length ? await getSchoolsByIds(ids) : [];

  return (
    <main className="min-h-screen bg-bg-soft pb-20" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: "الرئيسية", href: "/" },
          { label: "المدارس", href: "/schools" },
          { label: "مقارنة" },
        ]} />
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary mt-4 mb-6">مقارنة المدارس</h1>

        {schools.length === 0 ? (
          <div className="bg-surface rounded-2xl p-10 text-center shadow-sm">
            <div className="text-6xl mb-3">⚖️</div>
            <p className="text-ink-muted mb-4">اختر مدرستين أو ثلاثاً من الدليل لمقارنتها جنباً إلى جنب.</p>
            <Link href="/schools/lebanon" className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm">تصفّح المدارس ←</Link>
          </div>
        ) : (
          <div className="overflow-x-auto bg-surface rounded-2xl shadow-sm">
            <table className="w-full border-collapse min-w-[560px]">
              <thead>
                <tr>
                  <th className="p-3 text-right text-xs text-ink-subtle font-semibold sticky right-0 bg-surface w-28"></th>
                  {schools.map((s) => (
                    <th key={s.id} className="p-4 text-center align-top border-r border-line">
                      <div className="w-14 h-14 mx-auto rounded-xl bg-mint-pale flex items-center justify-center text-2xl overflow-hidden mb-2">
                        {s.logo_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={s.logo_url} alt={s.name} className="w-full h-full object-contain" />
                        ) : (s.emoji || "🏫")}
                      </div>
                      <Link href={`/schools/${s.id}`} className="font-extrabold text-primary text-sm leading-snug hover:underline line-clamp-2 block">{s.name}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, ri) => (
                  <tr key={row.label} className={ri % 2 ? "bg-bg-soft/50" : ""}>
                    <td className="p-3 text-xs font-bold text-ink-subtle sticky right-0 bg-inherit align-top">{row.label}</td>
                    {schools.map((s) => {
                      const v = row.get(s);
                      return (
                        <td key={s.id} className={`p-3 text-sm text-center border-r border-line align-top ${v === DASH ? "text-ink-subtle" : "text-ink font-semibold"}`}>{v}</td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="p-3 sticky right-0 bg-surface"></td>
                  {schools.map((s) => (
                    <td key={s.id} className="p-3 text-center border-r border-line">
                      <Link href={`/schools/${s.id}`} className="inline-block px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold">الملف الكامل ←</Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center pt-6">
          <Link href="/schools/lebanon" className="text-primary font-bold text-sm hover:underline">← العودة إلى دليل المدارس</Link>
        </div>
      </div>
    </main>
  );
}
