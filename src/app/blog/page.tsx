"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

interface Article {
  id: number;
  slug: string;
  cat: string;
  emoji: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  featured: boolean;
}

const STATIC_ARTICLES: Article[] = [
  { id:1,  slug:"university-comparison",   cat:"الجامعات",         emoji:"🏛️", date:"17 أبريل 2026", readTime:"8 دقائق",  title:"الجامعات اللبنانية: مقارنة شاملة لمساعدتك في الاختيار",          excerpt:"كيف تختار الجامعة المناسبة في لبنان؟ مقارنة معمّقة بين أبرز الجامعات اللبنانية من حيث الجودة والتكلفة والتخصصات.", featured:true  },
  { id:2,  slug:"prepare-job-market",      cat:"سوق العمل",        emoji:"💼", date:"17 أبريل 2026", readTime:"6 دقائق",  title:"كيف تستعد لسوق العمل منذ السنة الأولى في الجامعة؟",              excerpt:"لا تنتظر حتى السنة الرابعة. إليك كيف تبدأ بناء مسيرتك المهنية من اليوم الأول في الجامعة.", featured:true  },
  { id:3,  slug:"remote-work-lebanon",     cat:"التوظيف الدولي",   emoji:"🌍", date:"17 أبريل 2026", readTime:"7 دقائق",  title:"العمل عن بُعد وفرص التوظيف الدولي للشباب اللبناني",             excerpt:"كيف يستفيد الشباب اللبناني من العمل من بُعد للحصول على رواتب دولية؟ وما التخصصات الأكثر طلباً.", featured:true  },
  { id:4,  slug:"future-careers-2030",     cat:"مهن المستقبل",     emoji:"🚀", date:"15 أبريل 2026", readTime:"10 دقائق", title:"مهن المستقبل في لبنان والمنطقة العربية 2025-2030",               excerpt:"ثورة الذكاء الاصطناعي تعيد رسم خريطة المهن. اكتشف أبرز المهن التي ستنتعش وتلك التي ستتراجع.", featured:false },
  { id:5,  slug:"scholarships-guide",      cat:"المنح الدراسية",   emoji:"🏆", date:"12 أبريل 2026", readTime:"9 دقائق",  title:"دليلك الكامل للحصول على منحة دراسية من AUB وLAU",               excerpt:"خطوات عملية للتقدم على أبرز المنح الدراسية في لبنان مع نصائح حصرية من طلاب استفادوا منها.", featured:false },
  { id:6,  slug:"riasec-explained",        cat:"اختبارات المهنية", emoji:"🧬", date:"10 أبريل 2026", readTime:"5 دقائق",  title:"ما هو اختبار RIASEC وكيف يحدد مسارك المهني؟",                    excerpt:"شرح مبسط لنظرية RIASEC وكيف تستخدمها لاختيار تخصصك وجامعتك بثقة.", featured:false },
  { id:7,  slug:"cv-tips-fresh-graduate",  cat:"نصائح مهنية",      emoji:"📄", date:"8 أبريل 2026",  readTime:"6 دقائق",  title:"10 أخطاء تدمر سيرتك الذاتية — تجنبها الآن",                     excerpt:"المسؤولون عن التوظيف يكشفون أكثر الأخطاء شيوعاً في السير الذاتية للخريجين الجدد.", featured:false },
  { id:8,  slug:"engineering-vs-cs",       cat:"مقارنات",          emoji:"⚖️", date:"5 أبريل 2026",  readTime:"7 دقائق",  title:"هندسة الحاسوب أم علوم الحاسوب؟ الفرق الحقيقي والأجدر لك",        excerpt:"مقارنة شاملة بين التخصصين الأكثر طلباً لمساعدتك في اتخاذ القرار الصحيح.", featured:false },
  { id:9,  slug:"medicine-lebanon-guide",  cat:"الطب والصحة",      emoji:"🩺", date:"2 أبريل 2026",  readTime:"11 دقائق", title:"دراسة الطب في لبنان: كل ما تحتاج معرفته قبل التسجيل",            excerpt:"من التكاليف للقبول للمسار المهني — دليل شامل لكل من يحلم بدراسة الطب في لبنان.", featured:false },
  { id:10, slug:"startup-culture-lebanon", cat:"ريادة الأعمال",    emoji:"💡", date:"28 مارس 2026",  readTime:"8 دقائق",  title:"كيف تبدأ مشروعك الخاص بعد التخرج في لبنان؟",                    excerpt:"البيئة الريادية في لبنان ليست سهلة لكنها ممكنة. إليك الخطوات والموارد المتاحة.", featured:false },
  { id:11, slug:"interview-prep-guide",    cat:"نصائح مهنية",      emoji:"🎤", date:"25 مارس 2026",  readTime:"7 دقائق",  title:"كيف تتحضر لمقابلة العمل وتترك انطباعاً لا يُنسى",               excerpt:"من أسئلة STAR للثقة بالنفس — تقنيات مثبتة للنجاح في مقابلة العمل.", featured:false },
  { id:12, slug:"study-abroad-lebanon",    cat:"التعليم الدولي",   emoji:"✈️", date:"20 مارس 2026",  readTime:"9 دقائق",  title:"الدراسة في الخارج: هل تستحق؟ وكيف تمولها؟",                     excerpt:"تحليل حقيقي لتجربة الدراسة في الخارج مقارنةً بلبنان من حيث التكلفة والعائد.", featured:false },
  { id:13, slug:"study-germany-free",            cat:"الدراسة في الخارج", emoji:"🇩🇪", date:"27 يونيو 2026", readTime:"10 دقائق", title:"الدراسة في ألمانيا شبه مجاناً: الدليل الكامل للطلاب العرب",      excerpt:"ألمانيا تقدّم تعليماً عالمياً برسوم رمزية حتى للأجانب. كيف تتقدّم، تموّل إقامتك، وتعمل بعد التخرّج.", featured:true  },
  { id:14, slug:"fully-funded-scholarships-2026", cat:"المنح الدراسية",   emoji:"🌍", date:"26 يونيو 2026", readTime:"9 دقائق",  title:"أقوى المنح المموّلة بالكامل للطلاب العرب 2026",                  excerpt:"منح تغطّي الرسوم والسكن والطيران وراتباً شهرياً. أبرزها وكيف تتقدّم لها بذكاء.", featured:true  },
  { id:15, slug:"study-turkey-guide",            cat:"الدراسة في الخارج", emoji:"🇹🇷", date:"25 يونيو 2026", readTime:"8 دقائق",  title:"الدراسة في تركيا: المنح، التكاليف، وخطوات التقديم",              excerpt:"وجهة قريبة ثقافياً وجغرافياً، برسوم معقولة ومنح حكومية سخيّة. دليلك الكامل.", featured:false },
  { id:16, slug:"ielts-vs-toefl",                cat:"اختبارات اللغة",   emoji:"🗣️", date:"24 يونيو 2026", readTime:"7 دقائق",  title:"آيلتس أم توفل؟ دليل اختبارات اللغة للطلاب العرب",                excerpt:"أي اختبار تختار؟ ما الفرق؟ وكيف تحصّل درجة عالية قبل التسجيل؟", featured:false },
  { id:17, slug:"gulf-job-market",               cat:"سوق العمل",        emoji:"🏙️", date:"23 يونيو 2026", readTime:"8 دقائق",  title:"سوق العمل في الخليج: التخصصات الأكثر طلباً ورواتبها",            excerpt:"دول الخليج وجهة عمل رئيسية للكفاءات العربية. المجالات الصاعدة وكيف تجهّز نفسك.", featured:true  },
  { id:18, slug:"how-to-write-sop",              cat:"نصائح مهنية",      emoji:"✍️", date:"22 يونيو 2026", readTime:"8 دقائق",  title:"كيف تكتب رسالة الدوافع (SOP) التي تفتح أبواب الجامعات العالمية", excerpt:"رسالة الدوافع تميّزك عن آلاف المتقدمين. بنيتها، أخطاؤها القاتلة، وكيف تكتبها بإقناع.", featured:false },
  { id:19, slug:"ai-tools-students",             cat:"الذكاء الاصطناعي", emoji:"🤖", date:"21 يونيو 2026", readTime:"7 دقائق",  title:"أفضل أدوات الذكاء الاصطناعي للطلاب الجامعيين",                   excerpt:"الذكاء الاصطناعي يضاعف إنتاجيتك في الدراسة — إذا استخدمته بذكاء وأخلاقية.", featured:false },
  { id:20, slug:"freelancing-arab-youth",        cat:"العمل الحر",       emoji:"💻", date:"20 يونيو 2026", readTime:"8 دقائق",  title:"العمل الحر للشباب العربي: كيف تبدأ وتبني دخلاً بالدولار",         excerpt:"العمل الحر يفتح أسواقاً عالمية من بيتك. أفضل المجالات والمنصّات وكيف تحصل على عميلك الأول.", featured:false },
  { id:21, slug:"vocational-education-arab",      cat:"التعليم المهني",   emoji:"🔧", date:"19 يونيو 2026", readTime:"7 دقائق",  title:"التعليم المهني: مسار مربح لا يحتاج شهادة جامعية تقليدية",         excerpt:"ليست الجامعة الطريق الوحيد. المهن التقنية والحرفية مطلوبة بشدة وتدرّ دخلاً ممتازاً.", featured:false },
];

const CAT_COLORS: Record<string, string> = {
  "الجامعات":          "bg-blue-50 text-blue-700",
  "سوق العمل":        "bg-green-50 text-green-700",
  "التوظيف الدولي":   "bg-purple-50 text-purple-700",
  "مهن المستقبل":     "bg-orange-50 text-orange-700",
  "المنح الدراسية":   "bg-amber-50 text-amber-700",
  "اختبارات المهنية": "bg-teal-50 text-teal-700",
  "نصائح مهنية":      "bg-rose-50 text-rose-700",
  "مقارنات":          "bg-indigo-50 text-indigo-700",
  "الطب والصحة":      "bg-red-50 text-red-700",
  "ريادة الأعمال":    "bg-emerald-50 text-emerald-700",
  "التعليم الدولي":   "bg-sky-50 text-sky-700",
  "الدراسة في الخارج": "bg-cyan-50 text-cyan-700",
  "اختبارات اللغة":   "bg-violet-50 text-violet-700",
  "الذكاء الاصطناعي": "bg-fuchsia-50 text-fuchsia-700",
  "العمل الحر":       "bg-lime-50 text-lime-700",
  "التعليم المهني":   "bg-stone-100 text-stone-700",
};

function mapRow(row: Record<string, unknown>): Article {
  return {
    id:       Number(row.id),
    slug:     String(row.slug || ""),
    cat:      String(row.category || "عام"),
    emoji:    String(row.emoji   || "📰"),
    date:     row.published_at ? new Date(String(row.published_at)).toLocaleDateString("ar-LB", { year:"numeric", month:"long", day:"numeric" }) : "",
    readTime: String(row.read_time || "5 دقائق"),
    title:    String(row.title   || ""),
    excerpt:  String(row.excerpt || ""),
    featured: Boolean(row.featured),
  };
}

const ALL_CAT = "__ALL__";

export default function BlogPage() {
  const { t, dir } = useI18n();
  const [articles, setArticles] = useState<Article[]>(STATIC_ARTICLES);
  const [cat, setCat]           = useState(ALL_CAT);
  const [search, setSearch]     = useState("");

  // Merge Supabase posts over the static set (don't REPLACE it — the DB held only
  // a handful of rows, which used to hide the full static catalogue). DB rows
  // override a static article with the same slug; DB-only rows are appended.
  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("*")
      .eq("active", true)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const bySlug = new Map(STATIC_ARTICLES.map((a) => [a.slug, a]));
        for (const row of data) {
          const m = mapRow(row);
          if (m.slug) bySlug.set(m.slug, m);
        }
        setArticles(Array.from(bySlug.values()));
      });
  }, []);

  const rawCats  = Array.from(new Set(articles.map(a => a.cat)));
  const featured = articles.filter(a => a.featured);
  const filtered = articles.filter(a =>
    (cat === ALL_CAT || a.cat === cat) &&
    (a.title.includes(search) || a.excerpt.includes(search))
  );

  return (
    <div className="min-h-screen bg-light" dir={dir}>
      <header className="bg-surface border-b border-line sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">مسارك</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href="/majors"        className="text-text-sub hover:text-primary">{t('bl.nav.majors')}</Link>
            <Link href="/universities"  className="text-text-sub hover:text-primary">{t('bl.nav.unis')}</Link>
            <Link href="/scholarships"  className="text-text-sub hover:text-primary">{t('bl.nav.scholarships')}</Link>
            <Link href="/blog"          className="text-primary border-b-2 border-primary pb-0.5">{t('bl.nav.blog')}</Link>
            <Link href="/tools"         className="text-text-sub hover:text-primary">{t('bl.nav.tools')}</Link>
          </nav>
          <Link href="/dashboard" className="text-text-sub text-sm hover:text-primary">{t('bl.nav.dashboard')}</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-[#1e4080] rounded-2xl p-6 md:p-10 mb-8 text-white">
          <div className="text-5xl mb-3">📰</div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{t('bl.title')}</h1>
          <p className="text-white/80 text-lg">{t('bl.subtitle')}</p>
          <div className="mt-5 max-w-lg">
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface/20 border-2 border-white/30 rounded-xl px-4 py-3 text-white placeholder:text-white/60 focus:outline-none focus:border-accent text-sm"
              placeholder={t('bl.search')} />
          </div>
        </div>

        {/* Featured */}
        {!search && cat === ALL_CAT && featured.length > 0 && (
          <div className="mb-8">
            <h2 className="font-extrabold text-primary text-xl mb-4">{t('bl.featured')}</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {featured.map(a => (
                <div key={a.id} className="card hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-primary/20 group">
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl h-36 flex items-center justify-center text-6xl mb-4">
                    {a.emoji}
                  </div>
                  <span className={`badge text-xs mb-2 inline-block ${CAT_COLORS[a.cat] || "bg-bg-soft text-ink-muted"}`}>{a.cat}</span>
                  <h3 className="font-extrabold text-primary text-sm leading-snug mb-2 group-hover:text-accent transition-colors">{a.title}</h3>
                  <p className="text-text-sub text-xs leading-relaxed mb-3 line-clamp-2">{a.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-text-sub">
                    <span>📅 {a.date}</span>
                    <span>⏱️ {a.readTime}</span>
                  </div>
                  <Link href={`/blog/${a.slug}`} className="btn-primary w-full py-2 rounded-xl text-xs mt-3 block text-center">{t('bl.read')}</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          <button onClick={() => setCat(ALL_CAT)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 whitespace-nowrap transition-all ${
              cat === ALL_CAT ? "bg-primary text-white border-primary" : "bg-surface border-line text-text-sub hover:border-primary"
            }`}>{t('bl.cat_all')}</button>
          {rawCats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 whitespace-nowrap transition-all ${
                cat === c ? "bg-primary text-white border-primary" : "bg-surface border-line text-text-sub hover:border-primary"
              }`}>{c}</button>
          ))}
        </div>

        <p className="text-sm text-text-sub mb-4">{t('bl.showing')} <strong className="text-primary">{filtered.length}</strong> {t('bl.articles_suffix')}</p>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(a => (
            <Link key={a.id} href={`/blog/${a.slug}`} className="card hover:shadow-lg transition-all hover:-translate-y-0.5 group cursor-pointer block">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {a.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`badge text-xs mb-1 inline-block ${CAT_COLORS[a.cat] || "bg-bg-soft text-ink-muted"}`}>{a.cat}</span>
                  <h3 className="font-bold text-primary text-sm leading-snug group-hover:text-accent transition-colors line-clamp-2">{a.title}</h3>
                </div>
              </div>
              <p className="text-text-sub text-xs leading-relaxed mb-4 line-clamp-3">{a.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-text-sub border-t border-gray-50 pt-3">
                <span>📅 {a.date}</span>
                <span>⏱️ {a.readTime}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="card mt-10 bg-gradient-to-r from-primary to-[#1e4080] text-white text-center py-10 rounded-2xl">
          <div className="text-4xl mb-3">📬</div>
          <h3 className="font-extrabold text-2xl mb-2">{t('bl.cta.title')}</h3>
          <p className="text-white/80 mb-5">{t('bl.cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder={t('bl.cta.email')}
              className="flex-1 bg-surface/20 border-2 border-white/30 rounded-xl px-4 py-2.5 text-white placeholder:text-white/60 focus:outline-none focus:border-accent text-sm" />
            <button className="bg-accent text-white font-bold px-6 py-2.5 rounded-xl hover:bg-accent/90 transition-colors whitespace-nowrap">
              {t('bl.cta.btn')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
