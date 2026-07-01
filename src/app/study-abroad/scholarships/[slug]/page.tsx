// Masarak Global — scholarship detail page (SSR, one indexable page per scholarship).
// Programmatic SEO: unique metadata per slug, built from the verified data.
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { buildMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ScholarshipSchema } from "@/components/StructuredData";

export const revalidate = 3600;

type Scholarship = {
  slug: string;
  name_ar: string; name_en: string;
  description_short_ar: string | null; description_short_en: string | null;
  description_long_ar: string | null; description_long_en: string | null;
  funding_type: string; status: string; is_multi_country: boolean;
  coverage_en: string | null; coverage_ar: string | null;
  eligibility_en: string | null; eligibility_ar: string | null;
  renewal_en: string | null; renewal_ar: string | null;
  language: string | null; ielts_min: number | null; toefl_min: number | null;
  seats: string | null; intake: string | null; deadline_note: string | null;
  application_link: string | null; official_source: string | null;
  provider_type: string; last_verified_at: string | null;
  countries: { name_ar: string; flag_emoji: string | null } | null;
  scholarship_degree_levels: { degree_levels: { name_ar: string; sort_order: number } | null }[] | null;
};

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

const SELECT = `slug, name_ar, name_en, description_short_ar, description_short_en,
  description_long_ar, description_long_en, funding_type, status, is_multi_country,
  coverage_en, coverage_ar, eligibility_en, eligibility_ar, renewal_en, renewal_ar,
  language, ielts_min, toefl_min, seats, intake, deadline_note, application_link,
  official_source, provider_type, last_verified_at,
  countries!scholarships_global_host_country_fkey ( name_ar, flag_emoji ),
  scholarship_degree_levels ( degree_levels ( name_ar, sort_order ) )`;

async function getOne(slug: string): Promise<Scholarship | null> {
  const supabase = client();
  if (!supabase) return null;
  const { data } = await supabase.from("scholarships_global").select(SELECT).eq("slug", slug).maybeSingle();
  return (data as unknown as Scholarship) || null;
}

export async function generateStaticParams() {
  const supabase = client();
  if (!supabase) return [];
  const { data } = await supabase.from("scholarships_global").select("slug").neq("status", "draft");
  return (data || []).map((r: { slug: string }) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const s = await getOne(params.slug);
  if (!s) return buildMetadata({ title: "منحة غير موجودة | مسارك", description: "", path: `/study-abroad/scholarships/${params.slug}` });
  const host = s.is_multi_country ? "عدة دول" : s.countries?.name_ar ?? "";
  return buildMetadata({
    title: `${s.name_ar} — منحة ${s.funding_type === "fully_funded" ? "مموّلة بالكامل" : ""} | مسارك`,
    description: (s.description_short_ar || `منحة دراسية ${host}. الشروط، التغطية، والموعد النهائي.`).slice(0, 160),
    path: `/study-abroad/scholarships/${s.slug}`,
    keywords: [s.name_ar, "منحة دراسية", host, "مموّلة بالكامل", "الدراسة في الخارج"],
  });
}

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3">
      <div className="text-xs text-gray-500 mb-0.5">{icon} {label}</div>
      <div className="text-sm font-bold text-gray-900">{value}</div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string | null }) {
  if (!body) return null;
  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="font-extrabold text-[#0F4A52] mb-2">{title}</h2>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{body}</p>
    </section>
  );
}

export default async function ScholarshipDetail({ params }: { params: { slug: string } }) {
  const s = await getOne(params.slug);
  if (!s) notFound();

  const degrees = (s.scholarship_degree_levels || [])
    .map((d) => d.degree_levels).filter(Boolean)
    .sort((a, b) => (a!.sort_order ?? 0) - (b!.sort_order ?? 0))
    .map((d) => d!.name_ar);
  const host = s.is_multi_country ? "🌍 عدة دول أوروبية" : `${s.countries?.flag_emoji ?? ""} ${s.countries?.name_ar ?? ""}`.trim();
  const tests = [s.ielts_min ? `IELTS ${s.ielts_min}` : null, s.toefl_min ? `TOEFL ${s.toefl_min}` : null].filter(Boolean).join(" / ");

  const hostName = s.is_multi_country ? "عدة دول" : s.countries?.name_ar ?? "";

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7faf9]">
      <ScholarshipSchema
        name={s.name_ar}
        description={(s.description_short_ar || s.description_long_ar || s.name_ar).slice(0, 300)}
        provider={s.name_en || s.name_ar}
        url={`/study-abroad/scholarships/${s.slug}`}
        hostCountry={hostName}
      />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { label: "الرئيسية", href: "/" },
          { label: "الدراسة في الخارج", href: "/study-abroad" },
          { label: "المنح العالمية", href: "/study-abroad/scholarships" },
          { label: s.name_ar },
        ]} />
        <Link href="/study-abroad/scholarships" className="text-sm text-[#0F4A52] font-semibold hover:underline">← كل المنح العالمية</Link>

        <header className="mt-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-[#0F4A52]">{host}</span>
            {s.funding_type === "fully_funded" && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700">💰 مموّلة بالكامل</span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">{s.name_ar}</h1>
          {s.description_short_ar && <p className="text-gray-600 mt-2 leading-relaxed">{s.description_short_ar}</p>}
          {s.last_verified_at && (
            <p className="text-xs text-emerald-600 font-semibold mt-2">✅ بيانات موثّقة من المصدر الرسمي ({new Date(s.last_verified_at).toLocaleDateString("ar")})</p>
          )}
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
          {degrees.length > 0 && <Fact icon="🎓" label="الدرجات" value={degrees.join("، ")} />}
          {s.language && <Fact icon="🗣️" label="لغة الدراسة" value={s.language.replace(/;/g, "، ")} />}
          {tests && <Fact icon="📝" label="اختبار اللغة" value={tests} />}
          {s.seats && <Fact icon="🎟️" label="المقاعد" value={s.seats} />}
          {s.intake && <Fact icon="📅" label="بداية الدراسة" value={s.intake} />}
          {s.deadline_note && <Fact icon="⏰" label="الموعد النهائي" value={s.deadline_note} />}
        </div>

        <div className="space-y-4">
          <Section title="ماذا تغطّي المنحة؟" body={s.coverage_ar || s.coverage_en} />
          <Section title="شروط الأهلية" body={s.eligibility_ar || s.eligibility_en} />
          <Section title="التجديد" body={s.renewal_ar || s.renewal_en} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {(s.application_link || s.official_source) && (
            <a href={s.application_link || s.official_source!} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1 text-sm font-bold text-white bg-[#0F4A52] hover:bg-[#0c3b42] px-5 py-2.5 rounded-xl">
              قدّم الآن ↗
            </a>
          )}
          {s.official_source && (
            <a href={s.official_source} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1 text-sm font-bold text-[#0F4A52] bg-white border border-[#0F4A52]/30 hover:bg-[#0F4A52]/5 px-5 py-2.5 rounded-xl">
              المصدر الرسمي
            </a>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          تحقّق دائماً من الموعد والشروط من المصدر الرسمي — قد تتغيّر سنوياً.
        </p>
      </div>
    </main>
  );
}
