import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { CAREERS, type Career } from "@/app/careers/data";
import Breadcrumbs from "@/components/Breadcrumbs";

// Sprint Content-4: SSR for career detail pages so Google sees the full
// content (description, day-in-life, salaries, skills, AI impact).
export const revalidate = 86400;

type DbCareer = {
  id: number | string;
  slug: string;
  description_detailed: string | null;
  a_day_in_life: string | null;
  required_skills: string[] | null;
  soft_skills: string[] | null;
  salary_entry_lebanon_usd: number | null;
  salary_senior_lebanon_usd: number | null;
  salary_entry_gulf_usd: number | null;
  salary_senior_gulf_usd: number | null;
  salary_remote_usd: number | null;
  demand_5yr_outlook: string | null;
  top_employers_lebanon: string[] | null;
  top_employers_gulf: string[] | null;
  related_majors: string[] | null;
  entry_certifications: string[] | null;
  work_life_balance: string | null;
  remote_work_potential: string | null;
  ai_impact: string | null;
  realistic_expectations: string | null;
};

async function fetchCareerFromDb(slug: string): Promise<DbCareer | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const supabase = createClient(url, key);
  const { data } = await supabase
    .from("careers")
    .select(
      "id, slug, description_detailed, a_day_in_life, required_skills, soft_skills, " +
      "salary_entry_lebanon_usd, salary_senior_lebanon_usd, salary_entry_gulf_usd, " +
      "salary_senior_gulf_usd, salary_remote_usd, demand_5yr_outlook, " +
      "top_employers_lebanon, top_employers_gulf, related_majors, entry_certifications, " +
      "work_life_balance, remote_work_potential, ai_impact, realistic_expectations"
    )
    .eq("slug", slug)
    .maybeSingle();
  return (data as DbCareer | null) || null;
}

export async function generateStaticParams() {
  return CAREERS.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c: Career | undefined = CAREERS.find((x) => x.id === params.slug);
  if (!c) return { title: "المسار المهني — مسارك" };
  return {
    title: `${c.titleAr} (${c.title}) — راتب، مهارات، مسار التعلّم | مسارك`,
    description: `${c.description.slice(0, 155)}`,
    alternates: { canonical: `https://www.masaraklb.com/careers/${c.id}` },
    openGraph: {
      title: `${c.titleAr} — ${c.salaryLB} في لبنان`,
      description: c.description,
      url: `https://www.masaraklb.com/careers/${c.id}`,
      type: "article",
    },
  };
}

export default async function CareerDetailPage({ params }: { params: { slug: string } }) {
  const fallback = CAREERS.find((c) => c.id === params.slug);
  if (!fallback) return notFound();
  const db = await fetchCareerFromDb(params.slug);

  const description    = db?.description_detailed ?? fallback.description;
  const dayInLife      = db?.a_day_in_life;
  const skills         = db?.required_skills ?? fallback.skills;
  const softSkills     = db?.soft_skills;
  const salaryEntryLB  = db?.salary_entry_lebanon_usd;
  const salarySeniorLB = db?.salary_senior_lebanon_usd;
  const salaryEntryGulf= db?.salary_entry_gulf_usd;
  const salarySeniorGulf=db?.salary_senior_gulf_usd;
  const salaryRemote   = db?.salary_remote_usd;
  const demand5yr      = db?.demand_5yr_outlook;
  const employersLB    = db?.top_employers_lebanon;
  const employersGulf  = db?.top_employers_gulf;
  const relatedMajors  = db?.related_majors;
  const certs          = db?.entry_certifications ?? fallback.certifications;
  const wlb            = db?.work_life_balance;
  const remote         = db?.remote_work_potential;
  const aiImpact       = db?.ai_impact;
  const realistic      = db?.realistic_expectations;

  // Build JSON-LD JobPosting-like Article for SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${fallback.titleAr} (${fallback.title})`,
    description,
    author: { "@type": "Organization", name: "مسارك" },
    publisher: { "@type": "Organization", name: "مسارك" },
    mainEntityOfPage: `https://www.masaraklb.com/careers/${fallback.id}`,
  };

  return (
    <main className="min-h-screen bg-bg" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#012730] to-[#1b3a6b] text-white py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Breadcrumbs
            items={[
              { label: "الرئيسية", href: "/" },
              { label: "المسارات المهنية", href: "/careers" },
              { label: fallback.titleAr },
            ]}
            dir="rtl"
          />
          <div className="flex items-start gap-5 mb-4">
            <div className="text-7xl">{fallback.emoji}</div>
            <div className="flex-1">
              <div className="text-sm opacity-85 mb-1" dir="ltr">{fallback.title}</div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{fallback.titleAr}</h1>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-surface/15 backdrop-blur px-3 py-1 rounded-full">{fallback.category}</span>
                <span className="bg-surface/15 backdrop-blur px-3 py-1 rounded-full">⏳ {fallback.yearsToEntry}</span>
                <span className={`px-3 py-1 rounded-full font-bold ${fallback.demandColor}`}>طلب {fallback.demand}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 py-10 space-y-8">

        {/* Description */}
        <section className="bg-surface rounded-2xl border border-white/10 p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-primary mb-3">📋 وصف المسار</h2>
          <p className="text-ink leading-relaxed">{description}</p>
        </section>

        {/* Day in Life */}
        {dayInLife && (
          <section className="bg-mint-pale rounded-2xl border-2 border-mint-light p-6">
            <h2 className="text-xl font-extrabold text-primary mb-3">🕐 يوم بحياة {fallback.titleAr}</h2>
            <p className="text-ink leading-relaxed">{dayInLife}</p>
          </section>
        )}

        {/* Salary breakdown */}
        <section className="bg-surface rounded-2xl border border-white/10 p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-primary mb-4">💰 الراتب</h2>
          {salaryEntryLB || salaryEntryGulf ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {salaryEntryLB && (
                <div className="bg-bg-mint rounded-xl p-4">
                  <div className="text-xs font-bold text-ink-muted mb-1">🇱🇧 لبنان</div>
                  <div className="text-lg font-extrabold text-primary">
                    ${salaryEntryLB.toLocaleString()}{salarySeniorLB && ` – $${salarySeniorLB.toLocaleString()}`}
                  </div>
                  <div className="text-xs text-ink-muted mt-1">شهرياً (Entry → Senior)</div>
                </div>
              )}
              {salaryEntryGulf && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="text-xs font-bold text-ink-muted mb-1">🌍 الخليج</div>
                  <div className="text-lg font-extrabold text-amber-700">
                    ${salaryEntryGulf.toLocaleString()}{salarySeniorGulf && ` – $${salarySeniorGulf.toLocaleString()}`}
                  </div>
                  <div className="text-xs text-ink-muted mt-1">شهرياً (Entry → Senior)</div>
                </div>
              )}
              {salaryRemote && (
                <div className="bg-violet-50 rounded-xl p-4">
                  <div className="text-xs font-bold text-ink-muted mb-1">🌐 Remote</div>
                  <div className="text-lg font-extrabold text-violet-700">
                    ${salaryRemote.toLocaleString()}+
                  </div>
                  <div className="text-xs text-ink-muted mt-1">شهرياً (شركات أجنبية)</div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-bg-mint rounded-xl p-4">
                <div className="text-xs font-bold text-ink-muted mb-1">🇱🇧 لبنان</div>
                <div className="text-lg font-extrabold text-primary">{fallback.salaryLB}</div>
              </div>
              <div className="bg-violet-50 rounded-xl p-4">
                <div className="text-xs font-bold text-ink-muted mb-1">🌐 Remote</div>
                <div className="text-lg font-extrabold text-violet-700">{fallback.salaryRemote}</div>
              </div>
            </div>
          )}
        </section>

        {/* Skills */}
        <section className="bg-surface rounded-2xl border border-white/10 p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-primary mb-3">🛠️ المهارات المطلوبة</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((s) => (
              <span key={s} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">{s}</span>
            ))}
          </div>
          {softSkills && softSkills.length > 0 && (
            <>
              <h3 className="text-sm font-bold text-ink-muted mt-4 mb-2">مهارات شخصية</h3>
              <div className="flex flex-wrap gap-2">
                {softSkills.map((s) => (
                  <span key={s} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs">{s}</span>
                ))}
              </div>
            </>
          )}
        </section>

        {/* AI impact */}
        {aiImpact && (
          <section className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl border-2 border-violet-100 p-6">
            <h2 className="text-xl font-extrabold text-primary mb-3">🤖 تأثير الذكاء الاصطناعي</h2>
            <p className="text-ink leading-relaxed">{aiImpact}</p>
          </section>
        )}

        {/* Realistic expectations */}
        {realistic && (
          <section className="bg-amber-50 rounded-2xl border-2 border-amber-100 p-6">
            <h2 className="text-xl font-extrabold text-amber-900 mb-3">📊 توقعات واقعية</h2>
            <p className="text-amber-900 leading-relaxed">{realistic}</p>
          </section>
        )}

        {/* Demand outlook */}
        {demand5yr && (
          <section className="bg-surface rounded-2xl border border-white/10 p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-primary mb-3">📈 توقعات الـ ٥ سنوات</h2>
            <p className="text-ink leading-relaxed">{demand5yr}</p>
          </section>
        )}

        {/* Employers */}
        {(employersLB?.length || employersGulf?.length) && (
          <section className="bg-surface rounded-2xl border border-white/10 p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-primary mb-3">🏢 أبرز جهات التوظيف</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {employersLB && employersLB.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-ink-muted mb-2">🇱🇧 لبنان</h3>
                  <ul className="text-sm space-y-1">
                    {employersLB.map((e) => (<li key={e} className="text-ink">• {e}</li>))}
                  </ul>
                </div>
              )}
              {employersGulf && employersGulf.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-ink-muted mb-2">🌍 الخليج</h3>
                  <ul className="text-sm space-y-1">
                    {employersGulf.map((e) => (<li key={e} className="text-ink">• {e}</li>))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Roadmap */}
        <section className="bg-surface rounded-2xl border border-white/10 p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-primary mb-3">🗺️ مسار التعلّم</h2>
          <ol className="space-y-3">
            {fallback.roadmap.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm font-extrabold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-ink pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Certifications */}
        {certs && certs.length > 0 && (
          <section className="bg-surface rounded-2xl border border-white/10 p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-primary mb-3">🎖️ شهادات داعمة</h2>
            <div className="flex flex-wrap gap-2">
              {certs.map((c) => (
                <span key={c} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">{c}</span>
              ))}
            </div>
          </section>
        )}

        {/* Universities */}
        <section className="bg-surface rounded-2xl border border-white/10 p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-primary mb-3">🏛️ جامعات لبنانية بتأهلك</h2>
          <div className="flex flex-wrap gap-2">
            {fallback.universities.map((u) => (
              <span key={u} className="bg-mint-light text-primary-dark px-3 py-1 rounded-full text-sm font-bold">{u}</span>
            ))}
          </div>
        </section>

        {/* Related majors */}
        {relatedMajors && relatedMajors.length > 0 && (
          <section className="bg-surface rounded-2xl border border-white/10 p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-primary mb-3">📚 تخصصات مرتبطة</h2>
            <div className="flex flex-wrap gap-2">
              {relatedMajors.map((m) => (
                <span key={m} className="bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-sm">{m}</span>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#012730] to-[#1b3a6b] text-white rounded-3xl p-8 text-center">
          <div className="text-4xl mb-3">🧬</div>
          <h2 className="text-2xl font-extrabold mb-2">هاد المسار يناسبك؟</h2>
          <p className="text-white/85 mb-5">جرّب Career DNA — اختبار قصير بيخبرك بأكتر مسار يناسب شخصيتك ومهاراتك.</p>
          <Link href="/career-dna" className="inline-block bg-surface text-[#012730] font-extrabold px-7 py-3 rounded-xl hover:bg-mint transition-colors">
            اعمل اختبار Career DNA ←
          </Link>
        </section>

      </div>
    </main>
  );
}
