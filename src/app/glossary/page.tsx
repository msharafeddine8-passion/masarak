import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import GlossarySearch from "./GlossarySearch";

// Sprint Content-2: SSR for glossary so Google sees all 30 terms.
export const revalidate = 86400;

type GlossaryTerm = {
  id: string;
  term_en: string;
  term_ar: string;
  definition_ar: string;
  example_ar: string | null;
  category: string;
  display_order: number;
};

const CATEGORY_LABEL: Record<string, string> = {
  academic:  '🎓 أكاديمي',
  admission: '📝 القبول',
  financial: '💰 مالي',
  career:    '💼 المسار المهني',
  tools:     '🛠️ الأدوات',
  general:   '📚 عام',
};

async function fetchGlossary(): Promise<GlossaryTerm[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('glossary')
    .select('id, term_en, term_ar, definition_ar, example_ar, category, display_order')
    .order('category')
    .order('display_order');
  if (error || !data) return [];
  return data as GlossaryTerm[];
}

export default async function GlossaryPage() {
  const terms = await fetchGlossary();

  // Group by category server-side for SEO
  const grouped: Record<string, GlossaryTerm[]> = {};
  for (const t of terms) (grouped[t.category] ||= []).push(t);
  const categories = Object.keys(grouped);

  return (
    <main className="min-h-screen bg-bg py-10 px-4" dir="rtl">
      <div className="container mx-auto max-w-4xl">

        <nav aria-label="مسار التنقل" className="text-sm text-ink-muted mb-4">
          <Link href="/" className="hover:text-primary">الرئيسية</Link>
          <span className="mx-2">←</span>
          <span className="text-ink font-semibold">قاموس المصطلحات</span>
        </nav>

        <header className="mb-8">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">
            قاموس المصطلحات الجامعية
          </h1>
          <p className="text-lg text-ink-muted leading-relaxed">
            ٣٠ مصطلح أساسي بتسمعه قبل وأثناء الجامعة — مشروحة بالعربية مع مثال عملي.
            من <strong>GPA</strong> إلى <strong>Capstone Project</strong>، من <strong>IELTS</strong> إلى <strong>Full Scholarship</strong>.
          </p>
        </header>

        {terms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="text-5xl mb-3">⏳</div>
            <p className="text-ink-muted">القاموس قيد التحضير — ارجع قريباً.</p>
          </div>
        ) : (
          <GlossarySearch grouped={grouped} categoryLabels={CATEGORY_LABEL} />
        )}

        <section className="mt-12 bg-gradient-to-br from-mint-pale to-bg-mint rounded-3xl p-6 md:p-8 text-center">
          <h2 className="text-2xl font-extrabold text-primary mb-2">في مصطلح مش لاقيه؟</h2>
          <p className="text-ink-muted mb-4">ابعتلنا اقتراح وبنضيفه بـ نسخة جاية.</p>
          <Link href="/contact" className="btn-primary px-6 py-2.5 rounded-xl">
            تواصل معنا ←
          </Link>
        </section>
      </div>
    </main>
  );
}
