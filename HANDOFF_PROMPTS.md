# مسارك — Prompts جاهزة للشغل المتبقّي (للـ Cowork Claude)

> **كيف تستعمل هالملف:** كل قسم تحت هو **prompt مستقل** — انسخه كما هو وألصقه بجلسة Claude Code جديدة مفتوحة على مشروع مسارك. اعمل **واحد بالجلسة** (مش كلهن مع بعض)، وخلّي Claude يتحقّق ويعمل commit قبل ما تنتقل للتالي.
>
> **السياق المشترك (Claude بيعرفو من الـ repo، بس للتأكيد):** مسارك = منصّة طلابية عربية RTL، Next.js 14 (App Router) + TypeScript + Supabase + Tailwind + Vercel. تدقيق شامل انعمل وإصلاحاته على branch `audit-fixes` (7 commits، 8 migrations مطبّقة على prod). التقرير الكامل بـ `AUDIT_REPORT.md`. **المشروع بيبني نظيف** (`npx tsc --noEmit` = 0). ملاحظة: `npm run build` محلياً على ويندوز بيفشل **فقط** عند توليد صورة OG (`@vercel/og` — قيد ويندوز)؛ على Linux/Vercel بيشتغل. للتحقّق محلياً استعمل `npx tsc --noEmit` + `npm run build` لين ما يطبع "Compiled successfully" و "Generating static pages".

---

## ✅ أول إشي (لإلك إنت، مش لـ Claude) — دمج ونشر
1. افتح: `https://github.com/msharafeddine8-passion/masarak/pull/new/audit-fixes` واضغط **Create pull request** ثم **Merge**. (هاد بينشر التغييرات على الموقع تلقائياً عبر Vercel.)
2. **بعد النشر بدقيقتين**، أعطِ Claude هالـ prompt للتأكد ما في headers مكرّرة:
   > افحص headers الموقع الحيّ: `curl -sI https://www.masaraklb.com`. دوّر على أي header مكرّر (خصوصاً `access-control-allow-origin` أو `content-security-policy`). إذا في تكرار، خبّرني بالضبط شو لازم أشيل من إعدادات Vercel Dashboard → Project → Settings → Headers، لأن `next.config.mjs` صار يطبّقهن من الكود.
3. إعدادات يدوية بسيطة (أعطِ Claude هالـ prompt أو اعملهن إنت):
   > وجّهني خطوة-بخطوة لـ: (أ) تفعيل "Leaked Password Protection" في Supabase Dashboard → Authentication → Policies. (ب) ضبط الـ redirect من `masaraklb.com` إلى `www.masaraklb.com` ليكون 308 (Permanent) في Vercel → Domains.

---

## Prompt 1 — H-14: تحويل صفحات القوائم لـ Server Components (أكبر مكسب أداء/SEO)

```
اشتغل على مشروع مسارك (Next.js 14 App Router + Supabase) على branch audit-fixes.

المشكلة (audit H-14): صفحات القوائم الرئيسية كلها "use client" وبتجلب البيانات في useEffect خلف spinner، فالـ LCP بطيء ومافي ISR. حوّلهن لـ Server Components.

الصفحات (ابدأ بالأهم): src/app/universities/page.tsx، src/app/scholarships/page.tsx، src/app/majors/page.tsx، src/app/careers/page.tsx، src/app/schools/page.tsx، src/app/blog/page.tsx.

لكل صفحة:
1. اقرأها بالكامل وافهم: شو البيانات اللي بتجلبها (عبر @/lib/entities أو data files)، وشو الحالة التفاعلية (بحث/فلاتر).
2. حوّل page.tsx لـ Server Component (شيل "use client") تجلب القائمة server-side (الدوال بـ lib/entities.ts بتشتغل server-side، وفي fallback ثابت بـ data files).
3. اعزل الجزء التفاعلي فقط (بحث/فلتر/مقارنة) في child component صغير "use client" بياخد القائمة كـ props.
4. ضيف `export const revalidate = 86400` للـ ISR.

قيود: لا تكسر أي وظيفة موجودة، حافظ على كل النص العربي والـ RTL، ولا تستعمل any. اشتغل صفحة-صفحة واعمل commit منفصل لكل وحدة.

التحقّق بعد كل صفحة: `npx tsc --noEmit` لازم 0 أخطاء، و `npm run build` يوصل "Compiled successfully" + "Generating static pages". إذا الـ build فشل عند `@vercel/og`/opengraph-image فهاد قيد ويندوز محلي — تجاهلو (بيشتغل على Vercel). اعمل commit برسالة واضحة لكل صفحة.
```

---

## Prompt 2 — تقسيم ملف i18n العملاق (أداء)

```
اشتغل على مسارك على branch audit-fixes.

المشكلة (audit C-5 ب): src/lib/i18n.tsx ملف واحد 4413 سطر فيه القاموس كامل (عربي+إنجليزي، ~3980 مفتاح) و هو "use client"، فبيُشحن كاملاً على كل صفحة (مستورد من الهيدر/الفوتر بالـ root layout).

الهدف: قلّل حجم الـ bundle بدون كسر الترجمات.
1. افصل كائن `messages` عن ملف الـ "use client": احطّه بوحدة بيانات عادية (ممكن JSON أو .ts بدون "use client")، وخلّي i18n.tsx فيه فقط الـ Context/Provider/hook.
2. (الأهم) حمّل النسخة الإنجليزية **lazy** فقط لمّا المستخدم يبدّل اللغة — العربي هو الافتراضي، فما في داعي نشحن الإنجليزي لكل زائر. استعمل dynamic import للقاموس الإنجليزي.
3. (اختياري متقدّم) قسّم المفاتيح حسب namespace.

قيد حرج: في سكربت `scripts/check-i18n-keys.mjs` بيتأكد إن كل المفاتيح المستعملة معرّفة — لازم يضل ناجح (`npm run check:i18n`). لا تحذف ولا تعيد تسمية أي مفتاح.

التحقّق: `npm run check:i18n` ناجح، `npx tsc --noEmit` = 0، و `npm run build` يوصل "Compiled successfully". اعمل commit.
```

---

## Prompt 3 — H-16: إضافة مراقبة الأخطاء (Sentry)

```
اشتغل على مسارك على branch audit-fixes.

المشكلة (audit H-16): مافي أي error monitoring. في 3 أماكن فيها TODO "wire to Sentry": src/app/error.tsx، src/app/global-error.tsx، src/components/ErrorBoundary.tsx، src/components/ErrorState.tsx.

المطلوب: ركّب @sentry/nextjs (آخر نسخة متوافقة مع Next 14.2)، شغّل `npx @sentry/wizard@latest -i nextjs` أو اعمل الإعداد يدوياً: ملفات sentry.client/server/edge.config.ts، ولفّ next.config.mjs بـ withSentryConfig، واستبدل الـ TODOs بـ Sentry.captureException(error).

مهم: الـ DSN لازم يجي من متغيّر بيئة (NEXT_PUBLIC_SENTRY_DSN) — لا تضع DSN حقيقي بالكود. أضِفه لـ .env.local.example. إذا الـ DSN مش موجود، Sentry لازم يضل صامت (ما يكسر شي).

⚠️ المستخدم لازم ينشئ مشروع Sentry مجاني ويعطيك الـ DSN ليشتغل فعلياً — اطلبو منو، وإذا ما عطاك، خلّي الإعداد جاهز بدون DSN.

التحقّق: `npx tsc --noEmit` = 0، و `npm run build` يوصل "Compiled successfully". تأكّد إن next.config.mjs لسا بيطبّق الـ headers/redirects بعد لفّه بـ withSentryConfig. اعمل commit.
```

---

## Prompt 4 — H-16: إضافة اختبارات (Vitest)

```
اشتغل على مسارك على branch audit-fixes.

المشكلة (audit H-16): صفر اختبارات. ركّب Vitest واكتب اختبارات وحدة لأعلى-قيمة منطق:
- src/lib/saved.ts (toggleSave/isSaved)
- src/lib/analytics.ts (أسماء الأحداث)
- src/lib/permissions/can.ts (منطق الصلاحيات)
- منطق تسجيل Career DNA في src/app/career-dna/page.tsx (استخرج دالة computeResult/TYPE_MAX لوحدة قابلة للاختبار إذا لزم) — تأكّد إن التطبيع صحيح والنسبة ما تتجاوز 100%.
- اختبار يتأكد إن كل حدث analytics مُستهلَك (register_complete، complete_dna) مُطلَق فعلاً بمكان ما.

أضِف script "test": "vitest run" بـ package.json، وحدّث ملف الـ CI (.github/workflows/ci.yml) ليشغّل الاختبارات.

التحقّق: `npm test` ناجح، `npx tsc --noEmit` = 0. اعمل commit.
```

---

## Prompt 5 — H-6: Rate limiting على الـ endpoints العامة والـ AI

```
اشتغل على مسارك على branch audit-fixes.

المشكلة (audit H-6 + H-4): مافي rate limiting. الـ endpoints العامة (api/career-ai، api/improve-text، نماذج contact/sponsors/reviews) قابلة للـ spam وإساءة تكلفة AI. كمان 4 جداول عندها سياسة INSERT عامة بالتصميم (analytics_events، newsletter_subscribers، sponsor_applications، support_tickets) — الـ rate limiting هو الحماية الصح لهن.

المطلوب: استعمل @upstash/ratelimit + @upstash/redis. أضِف middleware أو helper يحدّ المعدّل على الـ AI routes والنماذج العامة (مثلاً 10 طلبات/دقيقة لكل IP).

⚠️ المستخدم لازم ينشئ حساب Upstash Redis مجاني ويعطيك UPSTASH_REDIS_REST_URL و UPSTASH_REDIS_REST_TOKEN — اطلبهن، وأضفهن لـ .env.local.example. إذا مش متوفرين، خلّي الكود يتعطّل بأمان (يسمح بالطلب) بدل ما يكسر.

التحقّق: `npx tsc --noEmit` = 0، و `npm run build` يوصل "Compiled successfully". اعمل commit.
```

---

## Prompt 6 — M-7/M-8: تحسين أداء RLS (DB)

```
اشتغل على مسارك. عندك وصول لـ Supabase (project id: cxctwvqqnpvoebpelkle) عبر الـ MCP. **هاد شغل DB حسّاس — اشتغل بحذر وتحقّق من كل policy بعد التعديل.**

المشكلة (audit M-7/M-8): advisor الأداء بيبلّغ عن 101 "auth_rls_initplan" (سياسات بتستدعي auth.uid()/auth.jwt() مباشرة فتتقيّم لكل صف) و 160 "multiple_permissive_policies".

المطلوب:
1. شغّل get_advisors(type:'performance') وحدّد السياسات المتأثّرة.
2. لكل policy فيها auth.uid()/auth.jwt() مباشرة: أعِد كتابتها لتستعمل (select auth.uid()) — هاد بيخلّي Postgres يقيّمها مرّة وحدة. **لا تغيّر منطق الـ policy، فقط لفّ النداء بـ subselect.**
3. ادمج السياسات المتعدّدة المتداخلة لنفس (دور، عملية) بوحدة حيث يكون آمناً.

⚠️ حرج: هاي تعديلات RLS على production. اعمل migration files بـ supabase/migrations/، وبعد كل دفعة تأكّد إن الوصول لسا يشتغل (استعلم pg_policies وتأكّد المنطق ما تغيّر). ابدأ بالجداول الأكثر استعمالاً (notifications، saved_items، profiles، org_*). لا تطبّق دفعة وحدة عمياء.

التحقّق: get_advisors(performance) لازم يُظهر نقص واضح بالتحذيرات، وما في كسر بالوصول.
```

---

## Prompt 7 — تلميع UI متبقّي (toasts + a11y + next/image)

```
اشتغل على مسارك على branch audit-fixes. نفّذ هالتحسينات (كل وحدة commit منفصل، وتحقّق بـ `npx tsc --noEmit` = 0):

1. M-16 (toasts): في ~45 استعمال لـ alert()/confirm() أصلية (غير عربية وغير RTL). ركّب نظام toast خفيف (مثل sonner) أو استعمل نمط الرسالة المضمّنة بـ SaveButton.tsx، واستبدلهن تدريجياً. ابدأ بالحذف المدمّر (confirm) بـ profile/_tabs/SavedItemsTab.tsx و org/dashboard.

2. M-4 (أخطاء مبتلَعة): بـ dashboard/page.tsx و scholarships/tracker/page.tsx، اعرض حالة خطأ مميّزة بدل ما تبتلع الأخطاء بصمت (أعِد استعمال src/components/ErrorState.tsx).

3. L-7 (a11y): بـ src/components/SiteHeader.tsx الأزرار اللي بتفتح dropdowns (Tools/More/user menu) ناقصها aria-expanded و aria-haspopup. ضيفهن.

4. M-15 (next/image): صور المحتوى (بطاقات الجامعات/المدارس) تستعمل <img> خام. حوّل أهمها لـ next/image بأبعاد صريحة (الـ hosts مصرّح بها بـ next.config.mjs). تبويبات الأدمن أقل أولوية.

التحقّق بعد كل وحدة: `npx tsc --noEmit` = 0. اعمل commit.
```

---

*ملاحظة: ابدأ بـ "أول إشي" (الدمج) ثم Prompt 1 (أكبر أثر). الـ prompts اللي بدها حسابات خارجية (3 Sentry، 5 Upstash) — جهّز الحساب المجاني أول وأعطِ Claude الـ keys.*
