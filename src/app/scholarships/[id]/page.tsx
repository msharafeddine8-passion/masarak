// Scholarship detail page (SSR). Fixes the 404: notifications & reminders link to
// /scholarships/[id] (see cron/scholarship-reminders + events/listeners) but this
// route didn't exist. Reads the local `scholarships` table by id. Also gives each
// scholarship an indexable page.
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

type Scholarship = {
  id: number;
  name: string | null;
  org: string | null;
  amount: string | null;
  deadline: string | null;
  type: string | null;
  fields: string[] | null;
  region: string | null;
  min_gpa: number | null;
  description: string | null;
  url: string | null;
  emoji: string | null;
  country_code: string | null;
};

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

async function getOne(id: string): Promise<Scholarship | null> {
  const supabase = client();
  if (!supabase) return null;
  const { data } = await supabase
    .from("scholarships")
    .select("id, name, org, amount, deadline, type, fields, region, min_gpa, description, url, emoji, country_code")
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as Scholarship) || null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const s = await getOne(params.id);
  if (!s) return buildMetadata({ title: "منحة غير موجودة", description: "هذه المنحة غير متوفّرة.", path: `/scholarships/${params.id}` });
  const name = s.name || `منحة #${s.id}`;
  return buildMetadata({
    title: `${name} — منحة دراسيّة`,
    description: s.description || `تفاصيل منحة ${name}: ${s.org || ""} ${s.amount || ""}. الشروط، المجالات، والموعد النهائي للتقديم.`,
    path: `/scholarships/${s.id}`,
    keywords: [name, "منحة دراسية", s.org || "", "منح للطلاب العرب"].filter(Boolean) as string[],
  });
}

export default async function ScholarshipDetailPage({ params }: { params: { id: string } }) {
  const s = await getOne(params.id);
  if (!s) notFound();

  const name = s.name || `منحة #${s.id}`;
  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between gap-3 border-b border-line py-2.5 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-semibold text-ink text-left">{value}</span>
    </div>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-bg">
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        <nav className="text-xs text-ink-muted flex items-center gap-2">
          <Link href="/" className="hover:text-primary">الرئيسية</Link> ›
          <Link href="/scholarships" className="hover:text-primary">المنح</Link> ›
          <span className="text-ink font-semibold">{name}</span>
        </nav>

        <div className="bg-gradient-hero rounded-3xl p-6 md:p-8 text-white shadow-floaty">
          <div className="flex items-start gap-4">
            <span className="text-5xl shrink-0">{s.emoji || "🏆"}</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-1">{name}</h1>
              {s.org && <p className="text-white/85">{s.org}</p>}
            </div>
          </div>
        </div>

        <section className="bg-surface rounded-2xl border border-line p-5 md:p-6">
          <h2 className="font-extrabold text-lg mb-3">تفاصيل المنحة</h2>
          {s.amount && <Row label="التغطية / المبلغ" value={s.amount} />}
          {s.type && <Row label="النوع" value={s.type} />}
          {s.deadline && <Row label="الموعد النهائي" value={s.deadline} />}
          {s.region && <Row label="المنطقة" value={s.region} />}
          {s.min_gpa ? <Row label="الحدّ الأدنى للمعدّل" value={String(s.min_gpa)} /> : null}
          {s.fields && s.fields.length > 0 && (
            <div className="pt-3">
              <span className="text-sm text-ink-muted block mb-2">المجالات</span>
              <div className="flex flex-wrap gap-2">
                {s.fields.map((f) => <span key={f} className="text-xs font-semibold px-3 py-1 rounded-full bg-bg-soft border border-line">{f}</span>)}
              </div>
            </div>
          )}
        </section>

        {s.description && (
          <section className="bg-surface rounded-2xl border border-line p-5 md:p-6">
            <h2 className="font-extrabold text-lg mb-3">عن المنحة</h2>
            <p className="text-ink-muted leading-relaxed whitespace-pre-line">{s.description}</p>
          </section>
        )}

        <div className="flex flex-wrap gap-2">
          {s.url && (
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center font-bold py-3 rounded-2xl bg-primary text-white hover:bg-primary-dark">
              التقديم على المنحة ↗
            </a>
          )}
          <Link href="/scholarships" className="flex-1 text-center font-bold py-3 rounded-2xl bg-surface border-2 border-line text-ink hover:border-primary">
            كل المنح
          </Link>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 text-center">
          💡 تابع مواعيد منحك في <Link href="/scholarships/tracker" className="font-bold underline">متتبّع المنح</Link>
        </div>
      </main>
    </div>
  );
}
