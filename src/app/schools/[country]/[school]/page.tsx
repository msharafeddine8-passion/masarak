// /schools/[country]/[school] — a single school profile (Server Component).
// SEO-safe: thin/empty profiles are noindex (isSchoolIndexable) so we never
// flood the index. Empty fields are hidden rather than shown as "not available".
import { notFound } from "next/navigation";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import Breadcrumb from "@/components/Breadcrumb";
import { getSchoolBySlug, getSchoolCountry, isSchoolIndexable, normalizedType } from "@/lib/schools";
import SchoolReviews from "./SchoolReviews";

export const revalidate = 3600;

const TYPE_AR: Record<string, string> = {
  official: "رسمية", private: "خاصة", international: "دولية",
  vocational: "مهنية", religious: "دينية", semi_private: "شبه مجانية", unrwa: "أونروا",
};
const STAGE_AR: Record<string, string> = {
  kindergarten: "روضة", primary: "ابتدائي", intermediate: "متوسط", secondary: "ثانوي",
};
const LANG_AR: Record<string, string> = { Arabic: "العربية", English: "الإنجليزية", French: "الفرنسية" };
const GENDER_AR: Record<string, string> = { mixed: "مختلط", boys: "بنين", girls: "بنات" };

export async function generateMetadata({ params }: { params: { country: string; school: string } }) {
  const country = await getSchoolCountry(params.country);
  const school = country ? await getSchoolBySlug(country.code, params.school) : null;
  if (!country || !school) {
    return buildMetadata({ title: "المدرسة غير موجودة | مسارك", description: "", path: `/schools/${params.country}/${params.school}`, noIndex: true });
  }
  const typeAr = TYPE_AR[normalizedType(school) || ""] || "";
  const loc = [school.governorate, school.city_or_area].filter(Boolean).join("، ");
  return buildMetadata({
    title: `${school.name} — مدرسة ${typeAr} في ${loc || country.name_ar} | مسارك`,
    description: school.short_description || school.description ||
      `معلومات عن ${school.name}: النوع، الموقع، المراحل التعليمية، لغة التعليم، والتواصل. دليل مدارس ${country.name_ar} على مسارك.`,
    path: `/schools/${params.country}/${params.school}`,
    image: school.logo_url || undefined,
    noIndex: !isSchoolIndexable(school),
    keywords: [school.name, `مدرسة ${typeAr}`, `مدارس ${country.name_ar}`, loc].filter(Boolean) as string[],
  });
}

export default async function SchoolProfilePage({ params }: { params: { country: string; school: string } }) {
  const country = await getSchoolCountry(params.country);
  if (!country) notFound();
  const s = await getSchoolBySlug(country.code, params.school);
  if (!s) notFound();

  const nt = normalizedType(s);
  const typeAr = TYPE_AR[nt || ""] || s.type || "";
  const loc = [s.governorate, s.district, s.city_or_area].filter(Boolean).join(" — ");
  const stages = s.education_stages.map((x) => STAGE_AR[x] || x);
  const langs = s.teaching_languages.length ? s.teaching_languages.map((x) => LANG_AR[x] || x) : (s.lang ? [s.lang] : []);
  const social = s.social_links || {};
  const socialEntries = Object.entries(social).filter(([, v]) => !!v);

  return (
    <main className="min-h-screen bg-bg-soft pb-20" dir="rtl">
      <section className={`bg-gradient-to-br ${s.color || "from-primary to-primary-dark"} text-white`}>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Breadcrumb items={[
            { label: "الرئيسية", href: "/" },
            { label: "المدارس", href: "/schools" },
            { label: `مدارس ${country.name_ar}`, href: `/schools/${country.slug}` },
            { label: s.name },
          ]} variant="dark" />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mt-5">
            <div className="w-20 h-20 rounded-2xl bg-white/95 shadow-lg flex items-center justify-center text-4xl overflow-hidden shrink-0">
              {s.logo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={s.logo_url} alt={s.name} className="w-full h-full object-contain" />
              ) : (s.emoji || "🏫")}
            </div>
            <div className="flex-1">
              {loc && <div className="text-sm opacity-85 mb-1">📍 {loc}</div>}
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{s.name}</h1>
              <div className="flex flex-wrap gap-2 text-sm">
                {typeAr && <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full font-semibold">{typeAr}</span>}
                {langs.length > 0 && <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">{langs.join("، ")}</span>}
                {s.gender_type && GENDER_AR[s.gender_type] && <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">{GENDER_AR[s.gender_type]}</span>}
                {s.is_verified && <span className="bg-emerald-500 px-3 py-1 rounded-full font-bold">✓ موثّقة</span>}
                {s.is_claimed && <span className="bg-white/25 px-3 py-1 rounded-full font-bold">🛡️ صفحة مُدارة</span>}
              </div>
            </div>
            {s.website && (
              <a href={s.website} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-white text-primary rounded-lg font-bold text-sm">الموقع الرسمي ←</a>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {(s.short_description || s.description) && (
          <Card title="نبذة عن المدرسة">
            <p className="text-ink-muted leading-relaxed whitespace-pre-line">{s.description || s.short_description}</p>
          </Card>
        )}

        <Card title="معلومات أساسية">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {typeAr && <Row k="نوع المدرسة" v={typeAr} />}
            {stages.length > 0 && <Row k="المراحل التعليمية" v={stages.join("، ")} />}
            {langs.length > 0 && <Row k="لغة التعليم" v={langs.join("، ")} />}
            {s.curriculum.length > 0 && <Row k="المنهج" v={s.curriculum.join("، ")} />}
            {s.gender_type && GENDER_AR[s.gender_type] && <Row k="نظام القبول" v={GENDER_AR[s.gender_type]} />}
            {s.governorate && <Row k="المحافظة" v={s.governorate} />}
            {s.district && <Row k="القضاء" v={s.district} />}
            {s.city_or_area && <Row k="المنطقة" v={s.city_or_area} />}
            {s.address && <Row k="العنوان" v={s.address} />}
            {s.accreditation && <Row k="الاعتماد" v={s.accreditation} />}
          </div>
        </Card>

        {s.features.length > 0 && (
          <Card title="مميزات ونشاطات">
            <div className="grid md:grid-cols-2 gap-3">
              {s.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-ink-muted"><span className="text-emerald-600 font-bold">✓</span><span>{f}</span></div>
              ))}
            </div>
          </Card>
        )}

        {(s.admission_info || s.requirements || s.application_deadline) && (
          <Card title="معلومات التسجيل">
            <div className="space-y-2 text-sm text-ink-muted">
              {s.admission_info && <p className="whitespace-pre-line">{s.admission_info}</p>}
              {s.requirements && <p className="whitespace-pre-line">{s.requirements}</p>}
              {s.application_deadline && <Row k="آخر موعد للتسجيل" v={s.application_deadline} />}
            </div>
          </Card>
        )}

        {(s.tuition_info || (s.fees_min != null && (s.fees_min > 0 || (s.fees_max ?? 0) > 0))) && (
          <Card title="الأقساط">
            <p className="text-ink-muted text-sm">
              {s.tuition_info || `$${s.fees_min}${s.fees_max ? "–$" + s.fees_max : "+"} سنوياً`}
            </p>
          </Card>
        )}

        {(s.phone || s.email || s.address || s.website || socialEntries.length > 0) && (
          <Card title="التواصل">
            <div className="space-y-2 text-sm">
              {s.phone && <div><span className="text-ink-subtle">الهاتف: </span><a href={`tel:${s.phone}`} className="font-semibold text-primary" dir="ltr">{s.phone}</a></div>}
              {s.email && <div><span className="text-ink-subtle">البريد: </span><a href={`mailto:${s.email}`} className="font-semibold text-primary" dir="ltr">{s.email}</a></div>}
              {s.website && <div><span className="text-ink-subtle">الموقع: </span><a href={s.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" dir="ltr">{s.website}</a></div>}
              {socialEntries.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {socialEntries.map(([k, v]) => (
                    <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-full bg-bg-soft text-primary text-xs font-bold capitalize">{k}</a>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {s.images.length > 0 && (
          <Card title="صور المدرسة">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {s.images.map((img, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={i} src={img} alt={`${s.name} ${i + 1}`} loading="lazy" className="rounded-xl object-cover w-full h-32" />
              ))}
            </div>
          </Card>
        )}

        <SchoolReviews schoolId={s.id} schoolName={s.name} />

        {(s.data_source || s.last_updated_at) && (
          <div className="text-xs text-ink-subtle text-center pt-2">
            {s.data_source && <span>المصدر: {s.data_source}</span>}
            {s.data_source && s.last_updated_at && <span> · </span>}
            {s.last_updated_at && <span>آخر تحديث: {new Date(s.last_updated_at).toLocaleDateString("ar")}</span>}
          </div>
        )}

        <div className="text-center pt-2">
          <Link href={`/schools/${country.slug}`} className="text-primary font-bold text-sm hover:underline">← كل مدارس {country.name_ar}</Link>
        </div>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm">
      <h2 className="font-bold text-lg text-primary mb-3">{title}</h2>
      {children}
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-ink-subtle shrink-0">{k}:</span>
      <span className="font-semibold text-ink">{v}</span>
    </div>
  );
}
