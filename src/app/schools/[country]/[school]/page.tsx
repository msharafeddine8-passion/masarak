// /schools/[country]/[school] — a single school profile (Server Component).
// Rebuilt (Schools Module Rebuild, Wave 1): full-profile information hierarchy
// (story → academic → student life → facilities → fees → admission → map →
// Masarak ecosystem → reviews → FAQ), cover image, smart actions (save/follow/
// share), the school's OFFICIAL layer (verified announcements/events OR an
// honest "needs verification" strip + claim funnel), and richer SEO (extended
// Schema.org + FAQPage from real facts only).
// SEO-safe: thin/empty profiles stay noindex (isSchoolIndexable); empty fields
// are hidden rather than shown as "not available".
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { buildMetadata, SITE_CONFIG } from "@/lib/seo";
import Breadcrumb from "@/components/Breadcrumb";
import EntitySocial from "@/components/social/EntitySocial";
import {
  getSchoolBySlug, getSchoolCountry, isSchoolIndexable, normalizedType,
  indexableSchoolParams, getSchoolSlugRedirect, getSchoolsByGovernorate,
} from "@/lib/schools";
import SchoolReviews from "./SchoolReviews";
import SchoolActions from "./SchoolActions";
import SchoolOrgSection from "./SchoolOrgSection";
import GovernorateLanding, { GOV_SLUGS, GOV_INTRO } from "./GovernorateLanding";

export const revalidate = 3600;

// Prebuild only the index-eligible school profiles; the rest render on-demand (ISR).
export async function generateStaticParams() {
  return indexableSchoolParams();
}

const TYPE_AR: Record<string, string> = {
  official: "رسمية", private: "خاصة", international: "دولية",
  vocational: "مهنية", religious: "دينية", semi_private: "شبه مجانية", unrwa: "أونروا",
};
const STAGE_AR: Record<string, string> = {
  kindergarten: "روضة", primary: "ابتدائي", intermediate: "متوسط", secondary: "ثانوي",
};
const LANG_AR: Record<string, string> = { Arabic: "العربية", English: "الإنجليزية", French: "الفرنسية" };
const GENDER_AR: Record<string, string> = { mixed: "مختلط", boys: "بنين", girls: "بنات" };

// Best-effort emoji for a free-text facility/activity label (Arabic keywords).
function iconFor(label: string): string {
  const l = label.toLowerCase();
  const rules: [RegExp, string][] = [
    [/مكتب/i, "📚"], [/مختبر|مخبر/i, "🔬"], [/حاسوب|كمبيوتر|معلوماتية/i, "💻"],
    [/ملعب|رياض/i, "⚽"], [/مسبح|سباح/i, "🏊"], [/جيم|لياقة/i, "🏋️"],
    [/مسرح/i, "🎭"], [/موسيق/i, "🎵"], [/فن|رسم/i, "🎨"], [/روبوت/i, "🤖"],
    [/برمج/i, "⌨️"], [/كشاف/i, "⛺"], [/تطوع/i, "🤝"], [/رحل/i, "🚌"],
    [/نقل|باص|حافل/i, "🚌"], [/مصلى|صلاة/i, "🕌"], [/كافيتيريا|مطعم|كانتين/i, "🍽️"],
    [/ذكية|تفاعلية/i, "🖥️"], [/انترنت|إنترنت|واي فاي|wifi/i, "📶"], [/موقف|باركينغ/i, "🅿️"],
    [/قاعة|مسرح المدرسة|اجتماعات/i, "🏛️"], [/مسابق|أولمبياد/i, "🏆"], [/علوم|معرض/i, "🧪"],
    [/نادي|أندية/i, "🎯"], [/دوام ممتد|رعاية/i, "🕐"], [/ذوي|دمج|احتياجات/i, "♿"],
  ];
  for (const [re, e] of rules) if (re.test(l)) return e;
  return "✦";
}

export async function generateMetadata({ params }: { params: { country: string; school: string } }) {
  const country = await getSchoolCountry(params.country);
  // Governorate landing pages (reserved slugs) — the SEO workhorses, indexable.
  if (country && GOV_SLUGS[params.school]) {
    const govName = GOV_SLUGS[params.school];
    return buildMetadata({
      title: `مدارس ${govName} — دليل شامل | مسارك`,
      description: GOV_INTRO[params.school] || `دليل مدارس ${govName}: النوع، المراحل، المنهج، ولغة التعليم — قارن واختر على مسارك.`,
      path: `/schools/${params.country}/${params.school}`,
      keywords: [`مدارس ${govName}`, `أفضل مدارس ${govName}`, `دليل مدارس ${govName}`, "مدارس لبنان"],
    });
  }
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
    image: school.cover_image_url || school.logo_url || undefined,
    noIndex: !isSchoolIndexable(school),
    keywords: [school.name, `مدرسة ${typeAr}`, `مدارس ${country.name_ar}`, loc].filter(Boolean) as string[],
  });
}

export default async function SchoolProfilePage({ params }: { params: { country: string; school: string } }) {
  const country = await getSchoolCountry(params.country);
  if (!country) notFound();

  // Reserved governorate slugs → the governorate landing page (spec Part C).
  if (GOV_SLUGS[params.school]) {
    const govName = GOV_SLUGS[params.school];
    const govSchools = await getSchoolsByGovernorate(country.code, govName);
    return <GovernorateLanding country={country} govSlug={params.school} govName={govName} schools={govSchools} />;
  }

  const s = await getSchoolBySlug(country.code, params.school);
  if (!s) {
    // Renamed slug? 301 to the current URL so old links never 404 (spec M2).
    const target = await getSchoolSlugRedirect(country.code, params.school);
    if (target) redirect(`/schools/${country.slug}/${target}`);
    notFound();
  }

  const nt = normalizedType(s);
  const typeAr = TYPE_AR[nt || ""] || s.type || "";
  const loc = [s.governorate, s.district, s.city_or_area].filter(Boolean).join(" — ");
  const stages = s.education_stages.map((x) => STAGE_AR[x] || x);
  const langs = s.teaching_languages.length ? s.teaching_languages.map((x) => LANG_AR[x] || x) : (s.lang ? [s.lang] : []);
  const social = s.social_links || {};
  const socialEntries = Object.entries(social).filter(([, v]) => !!v);

  const hasGeo = s.latitude != null && s.longitude != null;
  const mapsSearchUrl = hasGeo
    ? `https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`
    : s.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name} ${s.address}`)}`
      : null;

  // FAQ — composed ONLY from real fields on this row (never invented).
  const faqs: { q: string; a: string }[] = [];
  if (stages.length > 0) faqs.push({ q: `ما هي المراحل التعليمية في ${s.name}؟`, a: `تقدّم المدرسة المراحل التالية: ${stages.join("، ")}.` });
  if (loc) faqs.push({ q: `أين تقع ${s.name}؟`, a: `تقع المدرسة في ${loc}${s.address ? ` — ${s.address}` : ""}.` });
  if (typeAr && s.curriculum.length > 0) faqs.push({ q: `ما نوع ${s.name} وما المنهج المعتمد؟`, a: `هي مدرسة ${typeAr} وتعتمد: ${s.curriculum.join("، ")}.` });
  if (s.fees_min != null && s.fees_min > 0) faqs.push({ q: `كم تبلغ أقساط ${s.name}؟`, a: `وفق بيانات المدرسة، تتراوح الأقساط السنوية بين $${s.fees_min}${s.fees_max ? ` و$${s.fees_max}` : "+"}${s.tuition_info ? ` — ${s.tuition_info}` : ""}.` });

  const canonical = `${SITE_CONFIG.url}/schools/${country.slug}/${s.slug ?? ""}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["School", "EducationalOrganization"],
        name: s.name,
        ...(s.name_en ? { alternateName: s.name_en } : {}),
        url: canonical,
        ...(s.description || s.short_description ? { description: s.description || s.short_description } : {}),
        ...(s.website ? { sameAs: [s.website, ...socialEntries.map(([, v]) => v)] } : socialEntries.length ? { sameAs: socialEntries.map(([, v]) => v) } : {}),
        ...(s.logo_url ? { logo: s.logo_url } : {}),
        ...(s.cover_image_url ? { image: s.cover_image_url } : {}),
        ...(s.phone ? { telephone: s.phone } : {}),
        ...(s.email ? { email: s.email } : {}),
        ...(s.founded ? { foundingDate: String(s.founded) } : {}),
        ...(s.students ? { numberOfStudents: s.students } : {}),
        ...(hasGeo ? { geo: { "@type": "GeoCoordinates", latitude: s.latitude, longitude: s.longitude } } : {}),
        address: {
          "@type": "PostalAddress",
          addressCountry: country.name_en || "Lebanon",
          ...(s.governorate ? { addressRegion: s.governorate } : {}),
          ...(s.city_or_area ? { addressLocality: s.city_or_area } : {}),
          ...(s.address ? { streetAddress: s.address } : {}),
        },
      },
      ...(faqs.length > 0 ? [{
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question", name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }] : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${SITE_CONFIG.url}/` },
          { "@type": "ListItem", position: 2, name: "المدارس", item: `${SITE_CONFIG.url}/schools` },
          { "@type": "ListItem", position: 3, name: `مدارس ${country.name_ar}`, item: `${SITE_CONFIG.url}/schools/${country.slug}` },
          { "@type": "ListItem", position: 4, name: s.name, item: canonical },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-bg-soft pb-20" dir="rtl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero — cover image when the school provides one, brand gradient otherwise */}
      <section
        className={`relative text-white ${s.cover_image_url ? "" : `bg-gradient-to-br ${s.color || "from-primary to-primary-dark"}`}`}
        style={s.cover_image_url ? { backgroundImage: `url(${s.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {s.cover_image_url && <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/60" />}
        <div className="relative max-w-5xl mx-auto px-4 py-12">
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
              <div className="flex flex-wrap gap-2 text-sm mb-3">
                {typeAr && <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full font-semibold">{typeAr}</span>}
                {langs.length > 0 && <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">{langs.join("، ")}</span>}
                {s.gender_type && GENDER_AR[s.gender_type] && <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">{GENDER_AR[s.gender_type]}</span>}
                {s.founded && <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">تأسست {s.founded}</span>}
                {s.is_verified && <span className="bg-emerald-500 px-3 py-1 rounded-full font-bold">✓ موثّقة</span>}
              </div>
              <SchoolActions schoolId={s.id} schoolName={s.name} />
            </div>
            {s.website && (
              <a href={s.website} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-white text-primary rounded-lg font-bold text-sm">الموقع الرسمي ←</a>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Official layer: verified → announcements/events · unverified → honest strip + claim funnel */}
        <SchoolOrgSection schoolId={s.id} />

        {(s.short_description || s.description) && (
          <Card title="نبذة عن المدرسة">
            <p className="text-ink-muted leading-relaxed whitespace-pre-line">{s.description || s.short_description}</p>
          </Card>
        )}

        {s.why_choose && (
          <Card title="لماذا هذه المدرسة؟">
            <p className="text-ink-muted leading-relaxed whitespace-pre-line">{s.why_choose}</p>
          </Card>
        )}

        {(s.mission || s.vision) && (
          <div className="grid md:grid-cols-2 gap-4">
            {s.mission && (
              <div className="bg-surface rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-lg text-primary mb-2">🎯 رسالتنا</h2>
                <p className="text-ink-muted text-sm leading-relaxed whitespace-pre-line m-0">{s.mission}</p>
              </div>
            )}
            {s.vision && (
              <div className="bg-surface rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-lg text-primary mb-2">🔭 رؤيتنا</h2>
                <p className="text-ink-muted text-sm leading-relaxed whitespace-pre-line m-0">{s.vision}</p>
              </div>
            )}
          </div>
        )}

        {(s.school_values.length > 0 || s.educational_philosophy) && (
          <Card title="قيمنا وفلسفتنا التربوية">
            {s.school_values.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {s.school_values.map((v, i) => (
                  <span key={i} className="bg-mint-pale text-primary text-sm font-bold px-3 py-1.5 rounded-full">✦ {v}</span>
                ))}
              </div>
            )}
            {s.educational_philosophy && <p className="text-ink-muted text-sm leading-relaxed whitespace-pre-line m-0">{s.educational_philosophy}</p>}
          </Card>
        )}

        {s.history && (
          <Card title="تاريخ المدرسة">
            <p className="text-ink-muted leading-relaxed whitespace-pre-line">{s.history}</p>
          </Card>
        )}

        <Card title="معلومات أساسية">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {typeAr && <Row k="نوع المدرسة" v={typeAr} />}
            {stages.length > 0 && <Row k="المراحل التعليمية" v={stages.join("، ")} />}
            {langs.length > 0 && <Row k="لغة التعليم" v={langs.join("، ")} />}
            {s.curriculum.length > 0 && <Row k="المنهج" v={s.curriculum.join("، ")} />}
            {s.gender_type && GENDER_AR[s.gender_type] && <Row k="نظام القبول" v={GENDER_AR[s.gender_type]} />}
            {s.principal_name && <Row k="الإدارة" v={s.principal_name} />}
            {s.founded != null && <Row k="سنة التأسيس" v={String(s.founded)} />}
            {s.students != null && s.students > 0 && <Row k="عدد الطلاب" v={s.students.toLocaleString("ar")} />}
            {s.teachers_count != null && s.teachers_count > 0 && <Row k="عدد المعلمين" v={s.teachers_count.toLocaleString("ar")} />}
            {s.governorate && <Row k="المحافظة" v={s.governorate} />}
            {s.district && <Row k="القضاء" v={s.district} />}
            {s.city_or_area && <Row k="المنطقة" v={s.city_or_area} />}
            {s.address && <Row k="العنوان" v={s.address} />}
            {s.accreditation && <Row k="الاعتماد والشهادات" v={s.accreditation} />}
          </div>
        </Card>

        {(s.special_programs || s.learning_support) && (
          <Card title="برامج ودعم تعليمي">
            <div className="space-y-3 text-sm text-ink-muted">
              {s.special_programs && (
                <div><div className="font-bold text-ink mb-1">🌟 برامج خاصة</div><p className="whitespace-pre-line m-0">{s.special_programs}</p></div>
              )}
              {s.learning_support && (
                <div><div className="font-bold text-ink mb-1">🤲 الدعم التعليمي</div><p className="whitespace-pre-line m-0">{s.learning_support}</p></div>
              )}
            </div>
          </Card>
        )}

        {s.activities.length > 0 && (
          <Card title="الحياة الطلابية والنشاطات">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {s.activities.map((a, i) => (
                <div key={i} className="flex items-center gap-2 bg-bg-soft rounded-xl px-3 py-2.5 text-sm text-ink">
                  <span className="text-lg">{iconFor(a)}</span><span className="font-semibold">{a}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {s.facilities.length > 0 && (
          <Card title="المرافق والتجهيزات">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {s.facilities.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-bg-soft rounded-xl px-3 py-2.5 text-sm text-ink">
                  <span className="text-lg">{iconFor(f)}</span><span className="font-semibold">{f}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {s.features.length > 0 && (
          <Card title="مميزات إضافية">
            <div className="grid md:grid-cols-2 gap-3">
              {s.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-ink-muted"><span className="text-emerald-600 font-bold">✓</span><span>{f}</span></div>
              ))}
            </div>
          </Card>
        )}

        {(s.tuition_info || (s.fees_min != null && (s.fees_min > 0 || (s.fees_max ?? 0) > 0))) && (
          <Card title="الأقساط">
            <p className="text-ink-muted text-sm m-0">
              {s.fees_min != null && s.fees_min > 0 && (
                <span className="font-extrabold text-primary text-base">${s.fees_min.toLocaleString("en")}{s.fees_max ? `–$${s.fees_max.toLocaleString("en")}` : "+"} سنوياً</span>
              )}
              {s.fees_min != null && s.fees_min > 0 && s.tuition_info && <span> · </span>}
              {s.tuition_info}
            </p>
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

        {(hasGeo || mapsSearchUrl) && (
          <Card title="الموقع على الخريطة">
            {hasGeo && (
              <div className="rounded-xl overflow-hidden border border-line mb-3">
                <iframe
                  title={`موقع ${s.name}`}
                  src={`https://maps.google.com/maps?q=${s.latitude},${s.longitude}&z=15&output=embed`}
                  className="w-full h-64 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
            {mapsSearchUrl && (
              <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-primary font-bold text-sm hover:underline">
                🗺️ افتح في خرائط غوغل ←
              </a>
            )}
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

        {/* Masarak ecosystem — from the school page into the guidance journey */}
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-1">🧭 كمّل مسارك بعد المدرسة</h2>
          <p className="text-white/80 text-sm mb-4 m-0">من هون بتبلّش رحلتك الجامعية — كل أدوات التوجيه بمكان واحد:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/career-dna" className="bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">🧬</div><div className="text-sm font-bold">اكتشف ميولك</div><div className="text-[11px] text-white/70">Career DNA</div>
            </Link>
            <Link href="/universities" className="bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">🎓</div><div className="text-sm font-bold">الجامعات</div><div className="text-[11px] text-white/70">{s.governorate ? `قارن جامعات ${s.governorate} وغيرها` : "قارن واختر"}</div>
            </Link>
            <Link href="/majors" className="bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">📚</div><div className="text-sm font-bold">التخصصات</div><div className="text-[11px] text-white/70">شو بتدرس؟</div>
            </Link>
            <Link href="/scholarships" className="bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">🏆</div><div className="text-sm font-bold">المنح</div><div className="text-[11px] text-white/70">+60 منحة محدّثة</div>
            </Link>
          </div>
        </div>

        <EntitySocial itemType="school" itemId={String(s.id)} discussHref="/community" />

        <SchoolReviews schoolId={s.id} schoolName={s.name} />

        {faqs.length > 0 && (
          <Card title="أسئلة شائعة">
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <div key={i}>
                  <div className="font-bold text-ink text-sm mb-1">{f.q}</div>
                  <p className="text-ink-muted text-sm leading-relaxed m-0">{f.a}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {(s.data_source || s.last_updated_at) && (
          <div className="text-xs text-ink-subtle text-center pt-2">
            {/* Friendly source label — never raw internal strings (spec D1.14) */}
            {s.data_source && (
              <span>
                {s.is_verified
                  ? "المعلومات مقدّمة ومُتحقَّق منها من إدارة المدرسة"
                  : s.data_source.includes("ويكيبيديا")
                    ? "بيانات أوّلية من مصادر عامة — بانتظار تحقّق إدارة المدرسة"
                    : "أُضيفت وتُراجَع من فريق مسارك"}
              </span>
            )}
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
