// SEO-indexable career-map page for a single major. Server component →
// generateMetadata + generateStaticParams make every major rankable (the whole
// point: students search "وظائف بعد [تخصّص]", "راتب [تخصّص]", "مستقبل [تخصّص]").
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MAJORS, MAJORS_BY_SLUG, AI_IMPACT_LABEL } from "../data";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return MAJORS.map((m) => ({ slug: m.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const m = MAJORS_BY_SLUG[params.slug];
  if (!m) return buildMetadata({ title: "تخصّص غير موجود", description: "هذا التخصّص غير متوفّر.", path: `/majors/${params.slug}` });
  return buildMetadata({
    title: `تخصّص ${m.name} — الدراسة، الوظائف، الرواتب والمستقبل`,
    description: `${m.desc} الرواتب، المهن بعد التخرّج، أفضل الجامعات، المهارات المطلوبة، وأثر الذكاء الاصطناعي على مستقبل تخصّص ${m.name}.`,
    path: `/majors/${m.slug}`,
    keywords: [
      `تخصص ${m.name}`, `دراسة ${m.name}`, `وظائف ${m.name}`, `راتب ${m.name}`,
      `مستقبل ${m.name}`, m.nameEn, "اختيار التخصص الجامعي",
    ],
  });
}

const DEMAND_PCT: Record<string, number> = { "عالٍ جداً": 100, "عالٍ": 75, "متوسط": 50, "منخفض": 25 };

export default function MajorDetailPage({ params }: { params: { slug: string } }) {
  const m = MAJORS_BY_SLUG[params.slug];
  if (!m) notFound();

  const ai = AI_IMPACT_LABEL[m.aiImpact];
  const related = MAJORS.filter((x) => x.category === m.category && x.slug !== m.slug).slice(0, 4);

  // JSON-LD for richer search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: m.name,
    description: m.desc,
    programType: "Bachelor's Degree",
    timeToComplete: `P${m.years}Y`,
    occupationalCategory: m.careers,
  };

  const Chip = ({ children, href, tone = "bg-bg-soft text-ink-muted border-line" }: { children: React.ReactNode; href?: string; tone?: string }) => {
    const cls = `inline-block text-sm font-semibold px-3 py-1.5 rounded-full border ${tone}`;
    return href ? <Link href={href} className={`${cls} hover:border-primary/50 transition-colors`}>{children}</Link> : <span className={cls}>{children}</span>;
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="bg-surface rounded-2xl border border-line p-5 md:p-6">
      <h2 className="font-extrabold text-lg text-ink mb-4">{title}</h2>
      {children}
    </section>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-5">
        {/* Breadcrumb */}
        <nav className="text-xs text-ink-muted flex items-center gap-2">
          <Link href="/" className="hover:text-primary">الرئيسية</Link> ›
          <Link href="/majors" className="hover:text-primary">التخصّصات</Link> ›
          <span className="text-ink font-semibold">{m.name}</span>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-hero rounded-3xl p-6 md:p-8 text-white shadow-floaty">
          <div className="flex items-start gap-4 flex-wrap">
            <span className="text-6xl">{m.emoji}</span>
            <div className="flex-1 min-w-[200px]">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">تخصّص {m.name}</h1>
              <p className="text-white/85">{m.category} · {m.years} سنوات · لغة الدراسة: {m.lang}</p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${ai.tone}`}>{ai.emoji} المستقبل: {ai.label}</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/15 border border-white/20">الطلب (الخليج): {m.demandGulf}</span>
              </div>
            </div>
          </div>
        </div>

        {/* What is it */}
        <Section title="ما هو هذا التخصّص؟">
          <p className="text-ink-muted leading-relaxed">{m.desc}</p>
        </Section>

        {/* Future / AI impact */}
        <Section title="🔮 المستقبل وأثر الذكاء الاصطناعي">
          <div className={`rounded-xl border p-4 ${ai.tone}`}>
            <div className="font-bold mb-1">{ai.emoji} التصنيف: {ai.label}</div>
            <p className="text-sm leading-relaxed">{m.future}</p>
          </div>
        </Section>

        {/* Salary */}
        <Section title="💰 الرواتب المتوقّعة (شهريّاً، تقديري)">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="text-xs text-ink-subtle mb-1">لبنان والشام</div>
              <div className="font-extrabold text-green-700 text-lg">${m.salaryMin.toLocaleString()}–${m.salaryMax.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4">
              <div className="text-xs text-ink-subtle mb-1">دول الخليج</div>
              <div className="font-extrabold text-amber-700 text-lg">${m.salaryGulfMin.toLocaleString()}–${m.salaryGulfMax.toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1"><span className="text-ink-subtle">الطلب في الخليج</span><span className="font-bold">{m.demandGulf}</span></div>
            <div className="bg-bg-soft rounded-full h-2"><div className="bg-primary rounded-full h-2" style={{ width: `${DEMAND_PCT[m.demandGulf] ?? 50}%` }} /></div>
          </div>
        </Section>

        {/* Careers */}
        <Section title="💼 المهن بعد التخرّج">
          <div className="flex flex-wrap gap-2">
            {m.careers.map((c) => <Chip key={c} href={`/careers?q=${encodeURIComponent(c)}`} tone="bg-blue-50 text-blue-700 border-blue-200">{c}</Chip>)}
          </div>
        </Section>

        {/* Roadmap */}
        <Section title="🗺️ خارطة الطريق">
          <ol className="space-y-2">
            {m.roadmap.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                <span className="bg-bg-soft rounded-xl px-3 py-2 text-sm font-semibold text-ink-muted flex-1">{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        {/* Skills + RIASEC */}
        <Section title="🧠 المهارات المطلوبة">
          <div className="flex flex-wrap gap-2 mb-4">
            {m.skills.map((s) => <Chip key={s} tone="bg-orange-50 text-orange-700 border-orange-200">{s}</Chip>)}
          </div>
          {m.certifications && (
            <>
              <h3 className="text-sm font-bold text-ink-muted mb-2">شهادات احترافيّة مفيدة</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {m.certifications.map((c) => <Chip key={c} tone="bg-purple-50 text-purple-700 border-purple-200">{c}</Chip>)}
              </div>
            </>
          )}
          <div className="bg-blue-50 rounded-xl p-4 text-sm">
            <span className="font-bold text-blue-700">ملاءمة الشخصيّة (RIASEC): {m.riasec}</span> —{" "}
            <Link href="/career-dna" className="text-blue-700 font-bold underline">اكتشف إن كان يناسب شخصيّتك عبر اختبار Career DNA</Link>
          </div>
        </Section>

        {/* Universities */}
        <Section title="🏛️ جامعات تقدّم هذا التخصّص">
          <div className="flex flex-wrap gap-2">
            {m.universities.map((u) => <Chip key={u} href="/universities" tone="bg-bg-soft text-ink-muted border-line">{u}</Chip>)}
          </div>
          <Link href="/universities" className="inline-block mt-3 text-sm font-bold text-primary hover:underline">تصفّح كل الجامعات ←</Link>
        </Section>

        {/* CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/career-dna" className="text-center font-bold py-3 rounded-2xl bg-primary text-white hover:bg-primary-dark">اكتشف تخصّصك (DNA)</Link>
          <Link href="/scholarships" className="text-center font-bold py-3 rounded-2xl bg-amber-500 text-white hover:bg-amber-600">منح لهذا المجال</Link>
          <Link href="/study-abroad" className="text-center font-bold py-3 rounded-2xl bg-surface border-2 border-line text-ink hover:border-primary">أين أدرسه بالخارج</Link>
        </div>

        {/* Related majors (internal linking) */}
        {related.length > 0 && (
          <Section title="تخصّصات ذات صلة">
            <div className="grid grid-cols-2 gap-2">
              {related.map((r) => (
                <Link key={r.slug} href={`/majors/${r.slug}`} className="flex items-center gap-2 bg-bg-soft rounded-xl px-3 py-2 hover:bg-mint-pale/40 transition-colors">
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="font-semibold text-sm text-ink">{r.name}</span>
                </Link>
              ))}
            </div>
          </Section>
        )}
      </main>
    </div>
  );
}
