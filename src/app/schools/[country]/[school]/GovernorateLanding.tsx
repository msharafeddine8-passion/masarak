// Governorate landing page (Schools Rebuild spec G1.7 / Part C) — the SEO
// workhorse for "مدارس {المحافظة}" queries. Rendered by the [school] route when
// the segment matches one of the 8 reserved governorate slugs. Pure server
// component: unique editorial intro + live stats + district chips + a compact
// server-rendered school grid (zero JS for anonymous read, per the perf budget).
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { SITE_CONFIG } from "@/lib/seo";
import type { SchoolRecord, SchoolCountry } from "@/lib/schools";
import { normalizedType } from "@/lib/schools";
import { GOV_INTRO } from "@/lib/schoolGovernorates";

const TYPE_AR: Record<string, string> = {
  official: "رسمية", private: "خاصة", international: "دولية",
  vocational: "مهنية", religious: "دينية", semi_private: "شبه مجانية", unrwa: "أونروا",
};
const STAGE_AR: Record<string, string> = {
  kindergarten: "روضة", primary: "ابتدائي", intermediate: "متوسط", secondary: "ثانوي",
};

export default function GovernorateLanding({
  country, govSlug, govName, schools,
}: {
  country: SchoolCountry; govSlug: string; govName: string; schools: SchoolRecord[];
}) {
  const total = schools.length;
  const byType = new Map<string, number>();
  for (const s of schools) {
    const nt = normalizedType(s) || "other";
    byType.set(nt, (byType.get(nt) || 0) + 1);
  }
  const districts = Array.from(new Set(schools.map((s) => (s.district || "").trim()).filter(Boolean))).sort();
  const canonical = `${SITE_CONFIG.url}/schools/${country.slug}/${govSlug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `مدارس ${govName}`,
        numberOfItems: total,
        itemListElement: schools.slice(0, 30).map((s, i) => ({
          "@type": "ListItem", position: i + 1, name: s.name,
          url: `${SITE_CONFIG.url}/schools/${country.slug}/${s.slug ?? s.id}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${SITE_CONFIG.url}/` },
          { "@type": "ListItem", position: 2, name: "المدارس", item: `${SITE_CONFIG.url}/schools` },
          { "@type": "ListItem", position: 3, name: `مدارس ${country.name_ar}`, item: `${SITE_CONFIG.url}/schools/${country.slug}` },
          { "@type": "ListItem", position: 4, name: `مدارس ${govName}`, item: canonical },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-bg-soft pb-20" dir="rtl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="bg-gradient-hero text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Breadcrumb items={[
            { label: "الرئيسية", href: "/" },
            { label: "المدارس", href: "/schools" },
            { label: `مدارس ${country.name_ar}`, href: `/schools/${country.slug}` },
            { label: `مدارس ${govName}` },
          ]} variant="dark" />
          <h1 className="text-3xl md:text-4xl font-extrabold mt-5 mb-3">مدارس {govName}</h1>
          <p className="text-white/90 max-w-3xl leading-relaxed">{GOV_INTRO[govSlug]}</p>
          {/* live stats — factual, computed from the data */}
          <div className="flex flex-wrap gap-2 mt-5 text-sm">
            <span className="bg-white/15 backdrop-blur px-3 py-1.5 rounded-full font-bold">🏫 {total} مدرسة</span>
            {["official", "private", "international", "religious", "semi_private", "vocational", "unrwa"].map((tp) =>
              byType.get(tp) ? (
                <span key={tp} className="bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">{TYPE_AR[tp]}: {byType.get(tp)}</span>
              ) : null
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {districts.length > 1 && (
          <div className="mb-6">
            <div className="text-sm font-bold text-ink mb-2">الأقضية:</div>
            <div className="flex flex-wrap gap-2">
              {districts.map((d) => (
                <span key={d} className="bg-surface border border-line rounded-full px-3 py-1 text-xs font-semibold text-ink-muted">{d}</span>
              ))}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((s) => {
            const nt = normalizedType(s);
            const typeAr = TYPE_AR[nt || ""] || s.type || "";
            const loc = [s.district, s.city_or_area].filter(Boolean).join(" — ");
            const stages = s.education_stages.map((x) => STAGE_AR[x] || x);
            return (
              <Link key={s.id} href={`/schools/${country.slug}/${s.slug ?? s.id}`}
                className="bg-surface rounded-2xl border border-line hover:border-primary hover:shadow-lg transition p-5 block group">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-mint-pale flex items-center justify-center text-2xl overflow-hidden shrink-0">
                    {s.logo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={s.logo_url} alt={s.name} loading="lazy" className="w-full h-full object-contain" />
                    ) : (s.emoji || "🏫")}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-extrabold text-primary leading-snug group-hover:underline line-clamp-2 text-base m-0">{s.name}</h2>
                    {loc && <p className="text-xs text-ink-subtle mt-0.5 m-0">📍 {loc}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {typeAr && <span className="bg-bg-soft text-ink-muted font-bold px-2 py-0.5 rounded-full">{typeAr}</span>}
                  {stages.length > 0 && <span className="bg-bg-soft text-ink-muted px-2 py-0.5 rounded-full">{stages.join("، ")}</span>}
                  {s.is_verified && <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">✓ موثّقة</span>}
                </div>
              </Link>
            );
          })}
        </div>

        {schools.length === 0 && (
          <div className="text-center py-16 text-ink-subtle">
            <div className="text-6xl mb-3">🏫</div>
            <p>لا مدارس مسجّلة في {govName} بعد.</p>
          </div>
        )}

        <div className="text-center pt-8">
          <Link href={`/schools/${country.slug}`} className="text-primary font-bold text-sm hover:underline">← كل مدارس {country.name_ar}</Link>
        </div>
      </div>
    </main>
  );
}
