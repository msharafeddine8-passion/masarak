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
};

/* ─── Page ───────────────────────────────────────────────────── */
export default function ArticlePage() {
  const params = useParams();
  const slug = String(params?.slug || '');
  const { t, dir } = useI18n();
  const a = ARTICLES.find((x) => x.slug === slug);
  if (!a) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-soft" dir={dir}>
        <div className="text-center">
          <div className="text-6xl mb-3">🔍</div>
          <p className="text-ink-muted font-bold">{t('art.not_found')}</p>
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
      <header className="bg-surface border-b border-line sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-blue-600 font-extrabold text-lg">مسارك</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/blog" className="text-ink-subtle hover:text-blue-600 font-medium">{t('art.back_blog')}</Link>
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
        <div className="bg-surface rounded-3xl shadow-sm border border-line overflow-hidden mb-8">
          {/* Color Banner */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 h-48 flex items-center justify-center">
            <span className="text-8xl">{a.emoji}</span>
          </div>
          <div className="p-6 md:p-10">
            {/* Category */}
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${CAT_COLORS[a.cat] || "bg-bg-soft text-ink-muted"}`}>
              {a.cat}
            </span>
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-ink leading-snug mb-4">
              {a.title}
            </h1>
            {/* Excerpt */}
            <p className="text-ink-subtle text-base leading-relaxed mb-6 border-r-4 border-blue-500 pr-4">
              {a.excerpt}
            </p>
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-ink-subtle border-t border-line pt-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">م</div>
                <div>
                  <div className="text-ink-muted font-semibold text-xs">{a.author}</div>
                  <div className="text-ink-subtle text-xs">{a.authorTitle}</div>
                </div>
              </div>
              <span>📅 {a.date}</span>
              <span>⏱️ {a.readTime}</span>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="bg-surface rounded-3xl shadow-sm border border-line p-6 md:p-10 mb-8">
          <div className="prose prose-lg max-w-none" dir="rtl">
            {a.sections.map((s, i) => (
              <div key={i} className="mb-8">
                {s.heading && (
                  <h2 className="text-xl font-extrabold text-blue-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full inline-block" />
                    {s.heading}
                  </h2>
                )}
                <p className="text-ink-muted leading-relaxed text-base mb-4">{s.body}</p>
                {s.list && (
                  <ul className="space-y-2 mt-3">
                    {s.list.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-ink-muted bg-bg-soft rounded-xl px-4 py-2.5 leading-relaxed">
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
          <Link href="/career-dna" className="bg-surface text-blue-700 font-extrabold px-8 py-3 rounded-2xl hover:bg-blue-50 transition-colors inline-block">
            {t('art.cta.btn')}
          </Link>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div>
            <h3 className="text-xl font-extrabold text-ink mb-5">{t('art.related')}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedArticles.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`}
                  className="bg-surface rounded-2xl border border-line shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group block">
                  <div className="text-3xl mb-3">{r.emoji}</div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block ${CAT_COLORS[r.cat] || "bg-bg-soft text-ink-muted"}`}>
                    {r.cat}
                  </span>
                  <h4 className="text-sm font-bold text-ink leading-snug group-hover:text-blue-600 transition-colors">
                    {r.title}
                  </h4>
                  <p className="text-xs text-ink-subtle mt-2">⏱️ {r.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-ink-subtle py-6 px-4 mt-10 text-center text-sm">
        <Link href="/" className="text-white font-bold hover:text-blue-400">م