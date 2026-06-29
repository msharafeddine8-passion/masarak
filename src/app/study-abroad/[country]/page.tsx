// Masarak Global — per-country study-abroad page (SSR, one indexable page per
// destination). Shows the country's scholarships + a guide stub. Programmatic SEO.
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { buildMetadata } from "@/lib/seo";
import { COUNTRY_FACTS } from "./country-facts";

export const revalidate = 3600;

type Country = { code: string; name_ar: string; flag_emoji: string | null; region: string | null };
type Sch = {
  slug: string; name_ar: string; description_short_ar: string | null;
  funding_type: string; status: string; deadline_note: string | null; last_verified_at: string | null;
};

function client() {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return u && k ? createClient(u, k) : null;
}

async function getCountry(slug: string): Promise<Country | null> {
  const s = client();
  if (!s) return null;
  const { data } = await s.from("countries").select("code, name_ar, flag_emoji, region").eq("slug", slug).eq("is_active", true).maybeSingle();
  return (data as Country) || null;
}

async function getScholarships(code: string): Promise<Sch[]> {
  const s = client();
  if (!s) return [];
  const { data } = await s
    .from("scholarships_global")
    .select("slug, name_ar, description_short_ar, funding_type, status, deadline_note, last_verified_at")
    .eq("host_country", code)
    .neq("status", "draft")
    .order("id");
  return (data || []) as Sch[];
}

export async function generateStaticParams() {
  const s = client();
  if (!s) return [];
  const { data } = await s.from("countries").select("slug").eq("is_destination", true).eq("is_active", true);
  return (data || []).map((r: { slug: string }) => ({ country: r.slug }));
}

export async function generateMetadata({ params }: { params: { country: string } }) {
  const c = await getCountry(params.country);
  if (!c) return buildMetadata({ title: "الدراسة في الخارج | مسارك", description: "", path: `/study-abroad/${params.country}` });
  return buildMetadata({
    title: `الدراسة في ${c.name_ar} — منح وفرص للطلاب العرب | مسارك`,
    description: `كل ما تحتاجه للدراسة في ${c.name_ar}: المنح الدراسية المموّلة، نظام التعليم، وأبرز الفرص. دليل الطالب العربي.`,
    path: `/study-abroad/${params.country}`,
    keywords: [`الدراسة في ${c.name_ar}`, `منح ${c.name_ar}`, "الدراسة في الخارج", "منح دراسية"],
  });
}

export default async function CountryPage({ params }: { params: { country: string } }) {
  const c = await getCountry(params.country);
  if (!c) notFound();
  const scholarships = await getScholarships(c.code);
  const facts = COUNTRY_FACTS[c.code] || null;

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7faf9]">
      <section className="bg-gradient-to-br from-[#0F4A52] to-[#1A6F7C] text-white">
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <div className="text-6xl mb-3">{c.flag_emoji}</div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">الدراسة في {c.name_ar}</h1>
          <p className="text-white/85">{c.region}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/study-abroad" className="text-sm text-[#0F4A52] font-semibold hover:underline">← كل الوجهات</Link>

        {/* Country guide — visa, costs, work, housing (Phase D, now populated) */}
        {facts && (
          <section className="mt-5 space-y-5">
            <p className="text-gray-700 leading-relaxed bg-white rounded-2xl border border-gray-100 p-5">{facts.intro}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <FactCard icon="🛂" title="التأشيرة والإقامة">
                <p className="text-sm text-gray-700 leading-relaxed mb-2">{facts.visa.summary}</p>
                <ul className="text-sm text-gray-600 space-y-1 mb-2">
                  {facts.visa.requirements.map((r) => (
                    <li key={r} className="flex gap-1.5"><span className="text-[#0F4A52]">•</span><span>{r}</span></li>
                  ))}
                </ul>
                <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 space-y-0.5">
                  <div>💳 {facts.visa.cost}</div>
                  <div>⏱️ مدة المعالجة: {facts.visa.processing}</div>
                </div>
              </FactCard>

              <FactCard icon="💰" title="التكاليف">
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">الرسوم الدراسية</div>
                    <div className="text-gray-800 leading-relaxed">{facts.costs.tuition}</div>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <div className="text-xs text-gray-500 mb-0.5">المعيشة</div>
                    <div className="text-gray-800 leading-relaxed">{facts.costs.living}</div>
                  </div>
                </div>
              </FactCard>

              <FactCard icon="💼" title="العمل أثناء وبعد الدراسة">
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">أثناء الدراسة</div>
                    <div className="text-gray-800 leading-relaxed">{facts.work.duringStudy}</div>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <div className="text-xs text-gray-500 mb-0.5">بعد التخرّج</div>
                    <div className="text-gray-800 leading-relaxed">{facts.work.postStudy}</div>
                  </div>
                </div>
              </FactCard>

              <FactCard icon="🏠" title="السكن">
                <div className="space-y-2 text-sm">
                  <div className="text-gray-800 leading-relaxed">{facts.housing.options}</div>
                  <div className="border-t border-gray-100 pt-2 text-gray-800 leading-relaxed">
                    <span className="text-xs text-gray-500">الإيجار التقريبي: </span>{facts.housing.rent}
                  </div>
                </div>
              </FactCard>

              <FactCard icon="🗣️" title="لغة الدراسة">
                <p className="text-sm text-gray-800 leading-relaxed">{facts.language}</p>
              </FactCard>

              <FactCard icon="🏥" title="التأمين الصحي">
                <p className="text-sm text-gray-800 leading-relaxed">{facts.health}</p>
              </FactCard>
            </div>

            <div className="bg-[#0F4A52]/5 rounded-2xl border border-[#0F4A52]/15 p-5">
              <h3 className="font-extrabold text-[#0F4A52] mb-2">💡 نصائح سريعة</h3>
              <ul className="space-y-1.5">
                {facts.tips.map((t) => (
                  <li key={t} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                    <span className="text-[#0F4A52]">✓</span><span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-gray-400 text-center">
              الأرقام تقديريّة لعام 2025–2026 وقد تتغيّر — تحقّق دائماً من المصدر الرسمي للسفارة والجامعة قبل اتخاذ أي قرار.
            </p>
          </section>
        )}

        <h2 className="text-xl font-extrabold text-gray-900 mt-10 mb-4">
          🎓 المنح الدراسية في {c.name_ar} {scholarships.length > 0 && <span className="text-gray-400 text-base">({scholarships.length})</span>}
        </h2>

        {scholarships.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">
            <p>لسا ما أضفنا منح مخصّصة لـ{c.name_ar} — تصفّح كل المنح العالمية.</p>
            <Link href="/study-abroad/scholarships" className="inline-block mt-3 text-sm font-bold text-white bg-[#0F4A52] px-4 py-2 rounded-xl">كل المنح العالمية ←</Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {scholarships.map((s) => (
              <Link key={s.slug} href={`/study-abroad/scholarships/${s.slug}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <h3 className="font-extrabold text-gray-900 mb-1">{s.name_ar}</h3>
                {s.description_short_ar && <p className="text-sm text-gray-600 line-clamp-2 mb-2">{s.description_short_ar}</p>}
                {s.funding_type === "fully_funded" && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700">💰 مموّلة بالكامل</span>
                )}
              </Link>
            ))}
          </div>
        )}

        {!facts && (
          <div className="mt-8 bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
            <div className="text-3xl mb-2">📚</div>
            <p className="font-bold text-gray-700">دليل الدراسة في {c.name_ar} — قريباً</p>
            <p className="text-sm mt-1">التكاليف · التأشيرة · السكن · فرص العمل · خطوات التقديم.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function FactCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-extrabold text-gray-900 mb-3 flex items-center gap-2">
        <span className="text-xl">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}
