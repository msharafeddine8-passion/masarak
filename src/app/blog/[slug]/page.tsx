"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BlogPostingSchema } from "@/components/StructuredData";
import { ARTICLES, type Article } from "./articles";

/* ─── CAT COLORS ─────────────────────────────────────────────── */
const CAT_COLORS: Record<string, string> = {
  "الجامعات": "bg-blue-100 text-blue-800",
  "سوق العمل": "bg-green-100 text-green-800",
  "التوظيف الدولي": "bg-purple-100 text-purple-800",
  "مهن المستقبل": "bg-orange-100 text-orange-800",
  "المنح الدراسية": "bg-amber-100 text-amber-800",
  "اختبارات المهنية": "bg-teal-100 text-teal-800",
  "نصائح مهنية": "bg-rose-100 text-rose-800",
  "مقارنات": "bg-indigo-100 text-indigo-800",
  "الطب والصحة": "bg-red-100 text-red-800",
  "ريادة الأعمال": "bg-emerald-100 text-emerald-800",
  "التعليم الدولي": "bg-sky-100 text-sky-800",
  "الدراسة في الخارج": "bg-cyan-100 text-cyan-800",
  "اختبارات اللغة": "bg-violet-100 text-violet-800",
  "الذكاء الاصطناعي": "bg-fuchsia-100 text-fuchsia-800",
  "العمل الحر": "bg-lime-100 text-lime-800",
  "التعليم المهني": "bg-stone-100 text-stone-800",
};

/* ─── Page ───────────────────────────────────────────────────── */
export default function ArticlePage() {
  const params = useParams();
  const slug = String(params?.slug || '');
  const { t, dir } = useI18n();
  const a = ARTICLES.find((x) => x.slug === slug);
  if (!a) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir={dir}>
        <div className="text-center">
          <div className="text-6xl mb-3">🔍</div>
          <p className="text-gray-700 font-bold">{t('art.not_found')}</p>
          <Link href="/blog" className="mt-4 inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold">{t('art.back_blog')}</Link>
        </div>
      </div>
    );
  }

  const relatedArticles = a.related
    .map((sl) => ARTICLES.find((x) => x.slug === sl))
    .filter(Boolean) as Article[];

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <BlogPostingSchema
        title={a.title}
        excerpt={a.excerpt}
        slug={a.slug}
        datePublished={a.isoDate}
        author={a.author}
      />
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-blue-600 font-extrabold text-lg">مسارك</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/blog" className="text-gray-500 hover:text-blue-600 font-medium">{t('art.back_blog')}</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumbs items={[
          { label: 'الرئيسية', href: '/' },
          { label: 'المدوّنة', href: '/blog' },
          { label: a.title },
        ]} />
        {/* Article Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Color Banner */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 h-48 flex items-center justify-center">
            <span className="text-8xl">{a.emoji}</span>
          </div>
          <div className="p-6 md:p-10">
            {/* Category */}
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${CAT_COLORS[a.cat] || "bg-gray-100 text-gray-700"}`}>
              {a.cat}
            </span>
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug mb-4">
              {a.title}
            </h1>
            {/* Excerpt */}
            <p className="text-gray-500 text-base leading-relaxed mb-6 border-r-4 border-blue-500 pr-4">
              {a.excerpt}
            </p>
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 border-t border-gray-100 pt-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">م</div>
                <div>
                  <div className="text-gray-700 font-semibold text-xs">{a.author}</div>
                  <div className="text-gray-400 text-xs">{a.authorTitle}</div>
                </div>
              </div>
              <span>📅 {a.date}</span>
              <span>⏱️ {a.readTime}</span>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 mb-8">
          <div className="prose prose-lg max-w-none" dir="rtl">
            {a.sections.map((s, i) => (
              <div key={i} className="mb-8">
                {s.heading && (
                  <h2 className="text-xl font-extrabold text-blue-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full inline-block" />
                    {s.heading}
                  </h2>
                )}
                <p className="text-gray-700 leading-relaxed text-base mb-4">{s.body}</p>
                {s.list && (
                  <ul className="space-y-2 mt-3">
                    {s.list.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2.5 leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 text-white text-center mb-8">
          <div className="text-4xl mb-3">🧬</div>
          <h3 className="text-xl font-extrabold mb-2">{t('art.cta.title')}</h3>
          <p className="text-white/80 mb-5 text-sm">{t('art.cta.subtitle')}</p>
          <Link href="/career-dna" className="bg-white text-blue-700 font-extrabold px-8 py-3 rounded-2xl hover:bg-blue-50 transition-colors inline-block">
            {t('art.cta.btn')}
          </Link>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-5">{t('art.related')}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedArticles.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group block">
                  <div className="text-3xl mb-3">{r.emoji}</div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block ${CAT_COLORS[r.cat] || "bg-gray-100 text-gray-700"}`}>
                    {r.cat}
                  </span>
                  <h4 className="text-sm font-bold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors">
                    {r.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-2">⏱️ {r.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 px-4 mt-10 text-center text-sm">
        <Link href="/" className="text-white font-bold hover:text-blue-400">مسارك</Link>
        {" "}{t('art.footer.copyright')}{" "}
        <Link href="/blog" className="hover:text-white">{t('art.footer.back')}</Link>
      </footer>

      {/* Mobile bottom nav handled globally by MobileBottomNav.tsx */}
    </div>
  );
}
