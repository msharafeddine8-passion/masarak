# تدقيق مسارك الشامل — 24 حزيران 2026

> تدقيق read-only على 8 محاور (Architecture, Security, Performance, Database, SEO/A11y, Error/UX, Business Logic, DevOps).
> المصادر: قراءة الكود + ملفات `supabase/` + تحقّق حيّ من production headers + **introspection حيّ للـ Supabase (RLS policies + advisors الرسمية)**.
> لم يُعدَّل أي ملف من ملفات المشروع. كل ملاحظة موثّقة بـ `file:line` أو بمصدر من قاعدة البيانات الحيّة.

---

## Executive Summary

| الخطورة | العدد |
|---|---|
| 🔴 Critical | 5 |
| 🟠 High | 16 |
| 🟡 Medium | 18 |
| 🟢 Low | 12 |

**Overall Health Score: 5.5 / 10**
منصّة غنية بالمزايا ومبنية بإحساس جيد بالأمان (RLS مفعّل على **كل** الجداول 72/72، والـ admin محمي بإيميل من الـ JWT)، لكن يشوبها: **ميزة جوهرية للتربّح معطّلة بصمت**، **انعدام شبكة أمان هندسية** (لا tests، لا CI، لا monitoring)، **تشظٍّ خطير في الـ schema** بين 3 نماذج هوية، و**ثغرة أمنية واحدة قابلة للاستغلال فعلاً** (حقن إشعارات/تصيّد). لا يوجد تسريب أسرار، ولا جدول PII مكشوف للعامة، ولا XSS — وهذا يرفع التقييم عن المتوسط.

### أهم 5 أشياء لازم تتصلّح فوراً
1. 🔴 **قمع المؤسسات/الـ leads كود ميّت** — `listeners.ts` يقرأ عمود `universities.org_id` غير الموجود، فلا يُنشأ أي lead أبداً، وصفحة "مين مهتم فيك؟" فاضية دائماً. **أهم سطح تربّح عندك معطّل وأنت لا تعلم.**
2. 🔴 **حقن إشعارات/بثّ تصيّد** — أي مستخدم مسجّل يحقن إشعاراً بأي `user_id` (حتى `NULL` = بثّ للجميع) مع `link_url` — vector تصيّد على مستوى المنصّة.
3. 🔴 **الـ dashboards بتعلّق للأبد عند أي خطأ تحميل** — spinner لا نهائي بلا رسالة خطأ ولا retry، يضرب قلب المنتج بعد تسجيل الدخول.
4. 🔴 **schema drift خطير** — الـ README يوجّه لتشغيل `supabase-schema.sql` الذي يُلغي إصلاح التسجيل ويُنشئ نسخة `profiles` بـ RLS معطّل.
5. 🔴 **خطّان حرجان للأداء** — خط Tajawal يُحمَّل مرّتين (render-blocking)، وقاموس i18n بـ 4413 سطر يُشحن كاملاً على كل صفحة.

---

## 🔴 Critical Issues

### C-1 — قمع الـ Leads / CRM للمؤسسات كود ميّت (عمود غير موجود)
- **الملف:** `src/lib/events/listeners.ts:49‑55` — يستعلم `select('id, name_ar, name, org_id').from('universities')` ثم يحرس بـ `if (!orgId) return;`.
- **الخطر:** جدول `universities` **لا يملك عمود `org_id`** (الربط معكوس: `organizations.entity_id`). إذن `onStudentSavedUniversity` يصطدم دائماً بـ `return`، فلا يُستدعى `upsert_org_lead` أبداً → `org_leads` لا يمتلئ من الحفظ → المؤسسات لا يصلها أي إشعار "lead جديد" → صفحة `/dashboard/interested` ("مين مهتم فيك؟") فاضية بشكل دائم. **القمع التسويقي للمؤسسات — جوهر نموذج التربّح — لا يعمل إطلاقاً.**
- **الحل:**
  ```ts
  // بدل قراءة universities.org_id (غير موجود):
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('entity_id', universityId)
    .eq('org_type', 'university')
    .maybeSingle();
  const orgId = org?.id;
  if (!orgId) return;
  ```
  والأفضل نقل هذا الـ side-effect إلى **DB trigger أو API route server-side** بدل الـ browser (انظر C-2 والملاحظة العابرة في نهاية القسم).
- **الجهد:** ساعات (إصلاح الاستعلام) — أيام (نقله لـ server-side بشكل صحيح).

### C-2 — حقن إشعارات على مستوى المنصّة (تصيّد / spam)
- **المصدر:** سياسات RLS الحيّة على `notifications`:
  - `notif_admin_insert` — `WITH CHECK ((auth.jwt()->>'email' = admin) OR (auth.uid() IS NOT NULL))`
  - `read_own_or_broadcast` — `USING (user_id = auth.uid() OR user_id IS NULL)`
- **الخطر:** أي **مستخدم مسجّل** يقدر يُدرج صفّاً في `notifications` بـ `user_id` اختياري — بما فيه `user_id = NULL`، والذي يصبح **بثّاً يقرأه كل المستخدمين**. الحقول `title`/`body`/`link_url` حرّة → يقدر يبثّ إشعار "عاجل" بـ رابط تصيّد لكل مستخدمي المنصّة، أو يُغرق صندوق أي مستخدم محدّد. هذا أخطر confirmed security issue في التدقيق.
- **الحل:** قيّد الـ INSERT على المستخدم نفسه فقط، واجعل البثّ حكراً على service-role:
  ```sql
  drop policy notif_admin_insert on notifications;
  create policy notif_insert_self on notifications for insert
    with check (auth.uid() = user_id);   -- البثّ (user_id NULL) عبر service-role فقط
  ```
  وراجع `read_own_or_broadcast` — إن لم تكن ميزة البثّ مقصودة، احذفها.
- **الجهد:** دقائق (سياسة) + مراجعة من أين تُنشأ الإشعارات شرعياً.

### C-3 — كل الـ dashboards بعد تسجيل الدخول تعلّق للأبد عند فشل التحميل
- **الملفات:** `src/app/parent/dashboard/page.tsx:36‑83` (`setLoading(false)` فقط على مسار النجاح، سطر 81)، `src/app/org/dashboard/page.tsx:64`، `src/app/counselor/dashboard/page.tsx:69,86`، `src/app/dashboard/interested/page.tsx:95`. ولا يوجد `error.tsx` لأيٍّ منها.
- **الخطر:** جسم جلب البيانات `async` IIFE بلا `try/catch`؛ أي throw من Supabase (انقطاع، RLS، offline) يترك الصفحة على spinner أبدي — بلا رسالة، بلا retry، بلا تعافٍ. أسوأ نمط UX ("التحميل للأبد") ويضرب القلب المسجَّل للمنتج.
- **الحل:** غلّف بـ `try/catch/finally`، وضع `setLoading(false)` في `finally`، واعرض مكوّن `<ErrorState onRetry=… />` الموجود **والجاهز أصلاً** (انظر C-5). أو أضِف `error.tsx` لكل segment.
- **الجهد:** ساعات.

### C-4 — تشظٍّ خطير في الـ Schema: ثلاثة نماذج هوية + README يثبّت النسخة الخطأ
- **الملفات:** `supabase-schema.sql:10` (`public.profiles`, RLS مفعّل) + `:162` (`handle_new_user` غير محروس) + `:176` (trigger)؛ `supabase/schema.sql:67` (`profiles` بلا عمود email، **RLS معطّل**)؛ `supabase/migrations/20260614_phase_a_foundation.sql:61` (`user_profiles` — الكانوني حسب `docs/ARCHITECTURE.md`)؛ `supabase/migrations/20260615_fix_handle_new_user_trigger.sql`؛ `README.md:8`.
- **الخطر:** جدول الهوية معرّف **ثلاث طرق متعارضة**، وكلّها تنشئ نفس الـ trigger `on_auth_user_created` على `auth.users` — فترتيب التنفيذ يقرّر الفائز. الأسوأ: الـ README يوجّه المشغّل للصق `supabase-schema.sql` الذي يثبّت `handle_new_user()` **بلا `ON CONFLICT` وبلا exception handler**، فإعادة تشغيله بعد migrations حزيران **تُلغي بصمت إصلاح كسر التسجيل** الذي كُتب من أجله `20260615_fix_handle_new_user_trigger.sql`. كما يُعرّف `schema.sql` نسخة `profiles` بـ **RLS معطّل** (لو شُغّل = landmine، خصوصاً وأن 43 ملف client يثقون بالـ RLS للعزل).
- **الحل:** اجعل `supabase/migrations/` مصدر الحقيقة الوحيد؛ احذف/اعزل `supabase-schema.sql`, `supabase/schema.sql`, `supabase/v2_schema.sql`, `supabase/create_entity_tables.sql`؛ حدّث README ليشير إلى `supabase db push`. لا تشحن أبداً دالتين بنفس اسم الـ trigger تستهدفان جدولين مختلفين.
- **الجهد:** أيام (قرار الكانوني + تنظيف + إعادة كتابة قسم الإعداد).

### C-5 — خطّان حرجان للأداء (Fonts × 2 + i18n عملاق في الـ bundle العام)
- **الملفات:** `src/app/layout.tsx:43‑47` (`<link rel="preload" …Tajawal>`) **و** `src/app/globals.css:1` (`@import url('…fonts.googleapis.com…Tajawal…')`) — `next/font` غير مستخدم إطلاقاً. + `src/lib/i18n.tsx:1` (`'use client'`, ~3980 مفتاح × لغتين) مستورد من `SiteHeader/SiteFooter/MobileBottomNav` المثبّتة في الـ root layout.
- **الخطر:** الـ `@import` داخل CSS هو أسوأ نمط لتحميل الخطوط (يحجب CSSOM ولا يُكتشف إلا بعد تنزيل الـ CSS، ثم round-trip ثانٍ لطرف ثالث قبل أول رسم) — في منصّة عربية mobile-first حيث الخط ضروري لأول paint. والقاموس بالكامل (عربي+إنجليزي) يُشحن على **كل صفحة** لأن الهيدر/الفوتر يستهلكانه → مئات الكيلوبايتات JS على كل تحميل (TBT/TTI على الموبايل).
- **الحل:** (1) اعتمد `next/font/google` (يستضيف الخط ذاتياً ويزيل الحجب وطلب الطرف الثالث) واحذف الـ `@import` والـ `<link>`. (2) افصل `messages` عن `'use client'` لوحدة بيانات، وحمّل الإنجليزي lazy عند التبديل، وقسّم المفاتيح حسب namespace.
- **الجهد:** 1–2 ساعة (الخط) + 0.5–1 يوم (الـ i18n).

> **ملاحظة عابرة (architecture):** كل الـ side-effects (إشعارات، leads) تعمل **client-side** عبر `emit()` الذي يخرج فوراً على السيرفر (`emit.ts:68`) — فهي best-effort وتُفقد إن أغلق المستخدم التبويب، وتعمل تحت سياق RLS للمستخدم. هذا سبب جذري مشترك خلف C-1 و C-2 و"الإشعارات لا تصل". محلّها الصحيح DB triggers أو API routes.

---

## 🟠 High Priority

### الأمان (Security)

**H-1 — `admin_user_growth_30d()` قابل للاستدعاء من `anon` بلا حارس** — SECURITY DEFINER، مُتاح لـ `anon` و`authenticated` عبر `/rest/v1/rpc/`، وبلا فحص أدمن داخلي (عكس `admin_kpi_overview` الذي يعيد `forbidden`). أي زائر **مجهول** يقرأ إجمالي المستخدمين ومعدّل النمو اليومي → تسريب مقاييس عمل. **الحل:** أضِف حارس `auth.jwt()->>'email'` داخل الدالة أو `REVOKE EXECUTE ... FROM anon, authenticated`. **الجهد:** دقائق.

**H-2 — `upsert_org_lead()` قابل للاستدعاء من `anon`** — SECURITY DEFINER، مُتاح لـ anon، يقبل `org_id`/`student_id`/`score_delta` عشوائية. حتى زائر مجهول يقدر يحقن/يضخّم leads لأي مؤسسة وأي طالب. مع `org_leads` INSERT‑`true` (H-4) = تلويث كامل لـ CRM. **الحل:** `REVOKE EXECUTE FROM anon`؛ وتحقّق داخل الدالة أن المُستدعي مخوّل. **الجهد:** دقائق.

**H-3 — تصعيد ذاتي للـ role (لا قيد أعمدة على UPDATE)** — السياسات الحيّة `profiles.self_update_p` و`user_profiles.up_write_self` و`student_profiles.self_update_sp` كلها `USING (auth.uid()=id …)` بلا تقييد للأعمدة، فالمستخدم يقدر ينفّذ `update profiles set role='super_admin'`. اليوم الأثر محدود (الـ RLS يعتمد الإيميل لا الـ role)، لكنه خطر دفاع‑بالعمق ينفجر لحظة ربط أي route بـ `role`. **الحل:** trigger يمنع تغيير `role`/`primary_role` إلا من service-role/admin. **الجهد:** ساعات.

**H-4 — خمسة جداول بسياسة INSERT دائماً‑`true`** — من advisor الأمني: `analytics_events` (`ae_insert_anyone`)، `newsletter_subscribers` (`ns_public_insert`)، `org_leads` (`leads_insert`)، `sponsor_applications` (`anyone can insert`)، `support_tickets` (`st_insert_anyone`). تسمح للـ `anon` بحقن صفوف بلا حدّ → spam، تضخيم تكلفة، تلويث تحليلات. **الحل:** قيّد بـ `auth.uid() IS NOT NULL` على الأقل، وأضِف rate-limiting (انظر H-6). **الجهد:** ساعة + الـ rate limiting.

**H-5 — نظام الصلاحيات `can()/mustCan()` غير موصول فعلياً** — `src/lib/permissions/can.ts` مستورد في 3 ملفات فقط (API route واحد من ~14). الـ authorization الحقيقي يقع كلّه على (أ) RLS و(ب) فحوص إيميل أدمن مبعثرة. النظام "مصدر الحقيقة الواحد للصلاحيات" خيالي — والصلاحيات مبعثرة وإيميل الأدمن مكرّر كـ string في عشرات السياسات. **جواب سؤالك المباشر: لا، الـ capability layer لا يُفحَص في كل route حساس.** **الحل:** إمّا تبنّي `mustCan()` في server actions/API routes، أو احذف الوحدة لإزالة الإحساس الزائف بنظام صلاحيات. **الجهد:** عالٍ (تبنّي) / منخفض (حذف).

**H-6 — لا rate limiting على أي endpoint** — لا حزمة، لا middleware throttle. مع H-4 ونماذج عامة (`/contact`, `/sponsors/apply`, تسجيل، مراجعات) → spam وإساءة تكلفة. الـ AI routes (`/api/career-ai`, `/api/improve-text`) بلا throttle = خطر فاتورة. **الحل:** Upstash Ratelimit أو Vercel middleware-based limiter على الـ endpoints العامة والـ AI. **الجهد:** ساعات.

**H-7 — Storage buckets `avatars` و`images` تسمح بسرد كل الملفات** — advisor: سياسة SELECT عريضة على `storage.objects` تتيح للعميل **enumerate** كل الملفات في الـ bucket (لا حاجة لذلك للوصول عبر URL). يكشف ملفات/صور مستخدمين أكثر مما يُقصد. **الحل:** قصر الـ SELECT على المالك أو أزِل سياسة الـ listing العريضة. **الجهد:** دقائق.

**H-8 — 20 دالة SECURITY DEFINER بـ `search_path` قابل للتعديل** — advisor (lint 0011) يدرج: `handle_new_user`, `is_admin`, `is_org_admin/manager`, `is_platform_admin`, `redeem_org_invite`, `upsert_org_lead`, `approve_org_verification`, `get_public_student_profile`, `link_parent_by_code`, … خطر search_path hijack. **الحل:** `ALTER FUNCTION … SET search_path = ''` (أو `pg_catalog, public`) لكل دالة. **الجهد:** ساعة (دفعة واحدة).

**H-9 — دعوة المؤسسة غير مربوطة بالإيميل المستهدف** — `redeem_org_invite` (`20260611_org_invites.sql:38`) يفحص الـ token فقط لا أن `auth.jwt() email == invite.email`. أي شخص يحصل على الرابط (تحويل/تسريب) يستبدلها بحسابه. **الحل:** أضِف فحص `lower(invite.email) = lower(auth.jwt()->>'email')`. **الجهد:** دقائق.

**H-10 — الـ middleware يعتمد `getSession()` و`user_metadata.role` للـ authz** — `src/middleware.ts:82,124,134`. `getSession()` لا يُعيد التحقّق من توقيع الـ JWT على السيرفر (Supabase توصي بـ `getUser()`)، و`user_metadata` **قابل للتعديل من المستخدم** عبر `updateUser`. طبقة routing فقط (البيانات محميّة بالـ RLS)، لكنها حماية واهية. **الحل:** استخدم `getUser()` للقرارات الحسّاسة، واعتمد `app_metadata`/جدول role لا `user_metadata`. **الجهد:** ساعات.

> **ملاحظة أمنية مطمئنة (تم التحقق حيّاً):** الجداول الحرجة للصلاحيات `org_members`/`organizations` — رغم أنها خارج الـ migrations — عندها **RLS سليم**: `org_members` الإدراج `USING (is_org_admin(org_id) OR is_platform_admin())`، فالمستخدم **لا يقدر** يحشر نفسه بأي مؤسسة. مسار التصعيد الذي كان يقلقني **مسدود**. كذلك: **لا يوجد أي جدول عام بـ RLS معطّل في الـ production** (72/72 مفعّل)، ولا تسريب service-role في كود العميل، ولا XSS عبر `dangerouslySetInnerHTML` (الـ 13 موضعاً كلّها JSON-LD/آمنة)، والـ security headers (CSP/HSTS/X-Frame) **مطبّقة فعلاً** (تحقّقت من headers الحيّة).

### منطق الأعمال (Business Logic)

**H-11 — تدفّق توثيق المؤسسة مكسور + نظامان متوازيان** — `request_org_verification`/`approve_org_verification` (`phase_b_plus.sql:38,74`) يستعلمان `organizations.name_ar` (غير موجود؛ هو `display_name`) → زرّ "طلب التوثيق" في `OrgVerificationSection.tsx:32` يفشل دائماً. وحتى لو نجح، لا واجهة أدمن تستدعي `approve_org_verification` → dead-end. ويتوازى مع نظام آخر (`org_access_requests` + `grantOrgAccess`) يكتب حالة متضاربة. **الحل:** صحّح لـ `display_name`؛ اختر نظاماً واحداً (يُفضّل `org_access_requests` لوجود واجهة أدمن). **الجهد:** متوسط.

**H-12 — إشعارات مكرّرة (لا dedup key)** — `notifications` بلا قيد فريد؛ كل الإدراجات غير مشروطة (`listeners.ts:74‑146`). إعادة اختبار Career DNA (`career-dna/page.tsx:504` → `restart()`) تُطلق إشعار "أكملت DNA" للطالب **ولكل وليّ مرتبط** في كل مرة. **الحل:** `UNIQUE (user_id, type, entity_type, entity_id)` + `ON CONFLICT DO NOTHING`، أو حرّاس "مرّة واحدة" للترحيب/الإكمال. **الجهد:** متوسط.

**H-13 — تسجيل النقاط يحتسب مرّتين (+30 لكل حفظ)** — `listeners.ts:58‑63` يمرّر دائماً `+30`، و`upsert_org_lead` يجمع على التعارض. حفظ/إلغاء/إعادة حفظ نفس الجامعة يضيف +30 كل مرّة (يبلغ 100 بعد ~3 دورات)، وإلغاء الحفظ لا يطرح (لا listener لـ `student.unsaved_university` رغم إطلاقه في `SaveButton.tsx:52`). النقاط تصبح عدّاد "كم مرّة بدّل" لا حرارة lead. (مقنّع حالياً بـ C-1.) **الحل:** امنح +30 عند إنشاء الصف فقط، وأضِف listener لإلغاء الحفظ. **الجهد:** متوسط.

### الأداء والـ DevOps

**H-14 — صفحات القوائم الرئيسية تُرسَم client-side خلف spinner** — `universities/scholarships/majors/careers/blog/schools` كلها `'use client'` + `useEffect` fetch (مثلاً `universities/page.tsx:74‑83` spinner كامل). الـ LCP ينتظر hydration + round-trip للـ Supabase على صفحات الدخول عالية الزيارة. (الـ SEO منقذ جزئياً بـ `layout.tsx` متادتا + فهرس روابط زاحف، فالمشكلة أداء لا فهرسة.) **الحل:** حوّلها لـ Server Components تجلب server-side (البيانات لها fallbacks ثابتة)، واعزل التفاعل في child صغير، مع `export const revalidate` لـ ISR. **الجهد:** 0.5–1 يوم/صفحة.

**H-15 — الـ middleware يدفع تكلفة على كل طلب (getSession قبل الـ bailout + استعلام org_members)** — `src/middleware.ts:82` ينفّذ `getSession()` **قبل** فحص `requiresAuth` (سطر 96)، والـ matcher لا يستثني `/api/*`؛ ثم `:159‑164` يضيف استعلام `org_members` لكل مستخدم مسجّل. كل عرض صفحة عامة وكل نداء API يدفع decode للجلسة + أحياناً round-trip ثانٍ. **الحل:** انقل `getSession()` بعد فحص `requiresAuth`، واستثنِ `/api` و الأصول الساكنة من الـ matcher، واحمل عضوية المؤسسة في claim/cookie لا استعلام لكل طلب. **الجهد:** 30–60 دقيقة (الأول) + ساعات (cache العضوية).

**H-16 — لا tests، لا CI، لا error monitoring** — صفر `*.test.*`/`*.spec.*` وصفر test runner؛ لا `.github/workflows` (البوّابة الوحيدة قبل النشر هي فحص i18n)؛ لا Sentry (فقط تعليقات "wire to Sentry" في `error.tsx:17`، `ErrorBoundary.tsx:32`, `ErrorState.tsx:17`). منصّة فيها مدفوعات وRLS وcron و14 API بلا أي شبكة أمان أو رؤية للأعطال في production. **الحل:** Vitest + اختبارات لـ `analytics.ts`/`saved.ts`/`permissions`/cron auth؛ GitHub Action يشغّل `lint && check:i18n && build`؛ `@sentry/nextjs`. **الجهد:** متوسط.

---

## 🟡 Medium Priority

**M-1 — تحليلات بأحداث جوهرية لا تُطلَق أبداً** — `src/lib/analytics.ts:22‑38` يعرّف union أحداث، لكن المُطلَق فعلياً 4 فقط: `cta_click, register_start, save_item, start_dna`. الأحداث `complete_dna` و`register_complete` **تُقرأ** من `MarketingCenterTab.tsx:33,35` و`ai-briefing/route.ts:66,78` لكنها **لا تُطلَق أبداً** → مقاييس إكمال التسجيل وإكمال DNA **صفر دائماً** وتضلّل لوحة القيادة. لا حدث "apply" إطلاقاً رغم كونه قمعاً جوهرياً. **الحل:** أطلق `register_complete` عند نجاح التسجيل، `complete_dna` عند النتيجة، و`apply` عند التقديم؛ + اختبار يؤكّد أن كل حدث مُستهلَك مُطلَق. **الجهد:** منخفض–متوسط.

**M-2 — لا `loading.tsx` في أي مكان + لا `global-error.tsx`** — 4 `error.tsx` فقط، 0 `loading.tsx`، 1 `not-found.tsx`، 0 `global-error.tsx`. مكتبة `ui/Skeleton.tsx` موجودة لكنها غير مستخدمة في الـ dashboards. لو رمى الـ root layout خطأً → صفحة Next الإنجليزية الافتراضية (صادمة في منتج عربي RTL). **الحل:** `global-error.tsx` بنفس ستايل RTL؛ `loading.tsx` بـ `SkeletonPage` لكل segment. **الجهد:** ساعات.

**M-3 — البنية التحتية للأخطاء مكتوبة لكنها كود ميّت** — `src/components/ErrorState.tsx` و`src/lib/use-async-data.ts` بصفر مستوردين (مؤكَّد بـ grep). مكوّن retry عربي مصقول وhook موحّد للتحميل/الخطأ — لكنهما لا يحميان أي صفحة. **الحل:** تبنّاهما في الـ dashboards وصفحات القوائم (مصمّمان للعمل معاً). **الجهد:** ساعات.

**M-4 — أخطاء الشبكة مبتلَعة بصمت عبر صفحات العميل** — `dashboard/page.tsx:92` (`catch { /* silently fall back */ }`)، `notifications/client.ts:29‑73` (تُرجع `[]`/`0`)، `savedItems.ts:4,21` (تُسقط `error`)، `scholarships/tracker/page.tsx:78‑81` (`fetch` بلا `res.ok`). الفشل يظهر كحالة فارغة لا تُميَّز عن "لا بيانات". **الحل:** اعرض حالة خطأ مميَّزة (أعِد استخدام `ErrorState`)؛ افحص `res.ok`. **الجهد:** ساعات.

**M-5 — وحدتا حفظ مكرّرتان متباينتان** — `src/lib/saved.ts` (مطبوعة، مستخدمة في `SaveButton`/`profile/saved`) مقابل `src/lib/savedItems.ts` (`any`، مستخدمة في `ActivityTab`/`OverviewTab`). كلاهما حيّ بافتراضات جداول مختلفة. والأسوأ: `toggleSave` في `saved.ts:56‑93` **غير ذرّي** (select-ثم-insert، لا `upsert/onConflict`) → نقرتان متزامنتان تنشئان صفّين. **الحل:** وحّد على `saved.ts`، حوّل الـ insert لـ `upsert({onConflict:'user_id,item_type,item_id'})`، تأكّد من قيد فريد على `saved_items`، احذف `savedItems.ts`. **الجهد:** متوسط.

**M-6 — تحيّز تسجيل اختبار Career DNA** — `career-dna/page.tsx:11‑39`: النوعان `I` و`A` لهما 4 أسئلة، بينما `R,S,E,C` لهم 3. التسجيل يجمع القيم الخام (`:171`) ويقسّم على `maxScore=15` ثابت (`:377`). فـ I/A يصلان 20 بينما الباقون 15 → **I/A متقدّمان نظامياً** في الترتيب، والنسبة قد تتجاوز 100% (18/15 = شريط بعرض 120%)، والتعادل يُحسم بترتيب الإدراج. **الحل:** سوِّ عدد الأسئلة لكل نوع، أو طبّع بـ `sum/(n×5)` قبل الترتيب، واقصُص النسبة عند 100%. **الجهد:** منخفض.

**M-7 — RLS Performance: 101 `auth_rls_initplan`** — advisor الأداء: سياسات تستدعي `auth.uid()`/`auth.jwt()` مباشرة بدل `(select auth.uid())`، فتُقيَّم لكل صف. تمسّ معظم الجداول. **الحل:** لفّ النداءات بـ subselect: `USING ((select auth.uid()) = user_id)`. **الجهد:** ساعات (دفعة).

**M-8 — RLS Performance: 160 `multiple_permissive_policies`** — تعدّد سياسات permissive لنفس الدور/العملية يجبر Postgres على تقييمها كلّها (مثلاً `notifications` 5 سياسات بينها SELECT متداخلتان). سبب جذري: تراكب سياسات عبر migrations + تعديلات يدوية (الـ drift). **الحل:** دمج السياسات المتداخلة في واحدة لكل عملية. **الجهد:** متوسط.

**M-9 — 24 foreign key بلا index غطاء + 35 index غير مستخدم** — advisor: FKs مثل `notifications_created_by_fkey`، `org_access_requests_org_id_fkey` بلا index → joins/cascades بطيئة؛ و35 index لا يُستخدم → عبء كتابة ومساحة مهدورة. **الحل:** أضِف indexes للـ FKs المستعلَم عنها؛ احذف غير المستخدمة بعد التحقّق. **الجهد:** ساعات.

**M-10 — Redirect الأساس (apex→www) يرجع 307 مؤقّت لا 308 دائم** — رغم `permanent:true` في `next.config.ts:50‑55`، فحص حيّ لـ `https://masaraklb.com` يُرجع **307** (غالباً redirect على مستوى Vercel domain يسبق الـ Next config). الـ 307 لا يمرّر link-equity كاملاً ولا يُخبّأ. **الحل:** اضبط الـ apex redirect في Vercel Domains كـ permanent (308). **الجهد:** دقائق.

**M-11 — صفحات `blog/[slug]` بلا metadata/canonical/OG/Article schema لكل مقال** — `blog/[slug]/page.tsx` كلّه `'use client'` بلا `blog/[slug]/layout.tsx`؛ الـ12 مقال يرثون متادتا `/blog` نفسها. Google يرى 12 رابطاً بعناوين/canonical متطابقة وبلا Article schema. أكبر خسارة SEO للمحتوى. **الحل:** أضِف `blog/[slug]/layout.tsx` (server) بـ `generateMetadata` + `<BlogPostingSchema>` (معرّف وغير مستخدم في `StructuredData.tsx:257`). **الجهد:** ساعات.

**M-12 — الـ sitemap يعلن 20 رابط `/majors/{id}` غير موجودة (404)** — `sitemap.ts:46,123‑125` يبثّ `/majors/${id}` بينما لا يوجد مجلد `majors/[id]/`. تقديم 404 في الـ sitemap يضرب ثقة الزحف. **الحل:** أنشئ `majors/[id]/page.tsx` (مفضّل — المخصّصات قيمة SEO) أو أزِل الكتلة من الـ sitemap. **الجهد:** ساعات / دقائق.

**M-13 — صفحات `vocational/[id]` بلا metadata لكنها في الـ sitemap** — `vocational/[id]/page.tsx` `'use client'` بلا `generateMetadata`، بينما `sitemap.ts:114‑116` يبثّها → كل الصفحات ترث عنوان الـ root نفسه وتتنافس. **الحل:** `vocational/[id]/layout.tsx` server بـ `generateMetadata` (نمط `universities/[id]/layout.tsx`). **الجهد:** ساعات.

**M-14 — لا hreflang رغم ثنائية اللغة** — `seo.ts:94‑100` بلا مدخل `en`؛ الإنجليزية client-toggle على نفس الـ URL → Google لا يستطيع تقديم النسخة الإنجليزية لباحث إنجليزي. **الحل:** قرار معماري: إن أردت ترتيب الإنجليزية، أنشئ `/en/*` مع hreflang متبادل؛ وإلا وثّق القرار. **الجهد:** أيام (i18n routing) / دقائق (توثيق).

**M-15 — `next/image` مهمَل: ~33 `<img>` خام مقابل 3 ملفات تستخدم next/image** — يفوّت responsive srcset/lazy/AVIF/WebP ويخاطر بـ CLS على بطاقات الجامعات/المدارس (Core Web Vitals). الـ hosts مُصرّح بها في `next.config.ts:38‑45`. **الحل:** هاجر صور المحتوى لـ `next/image` بأبعاد صريحة (تبويبات الأدمن أقل أولوية). **الجهد:** ساعات.

**M-16 — `alert()/confirm()/prompt()` أصلية (~45 موضع) بدل نظام toast** — لا toast library؛ حذف مدمّر محمي فقط بـ `confirm` أصلي غير عربي وغير RTL ويحجب الـ thread. **الحل:** نظام toast/confirm واحد خفيف (أو نمط الرسالة المضمّنة في `SaveButton`). **الجهد:** أيام (كامل) / دقائق (لكل استبدال).

**M-17 — نموذج التسجيل يعرض أخطاء Supabase الإنجليزية الخام** — `auth/register/page.tsx:75` يمرّر `error.message` مباشرة، بينما `forgot`/`parent-signup` تستخدم fallback عربي. في أحرج خطوة (إنشاء حساب) يرى المستخدم العربي نصاً إنجليزياً. **الحل:** خرائط رسائل عربية مع fallback. **الجهد:** دقائق.

**M-18 — تشظّي نمط الوصول للبيانات** — 43 ملف يستدعي `supabase.from()` مباشرة من العميل، إلى جانب 14 API route و8 RPC و service-role في 20 ملف؛ ثلاثة براديغمات لنفس العمل بلا طبقة repository. **الحل:** وحّد: طبقة وصول رفيعة؛ مرّر القراءات المتميّزة عبر API routes؛ احصر الاستعلام المباشر بالقراءات العامة الآمنة بـ RLS. **الجهد:** عالٍ.

---

## 🟢 Low Priority / Polish

- **L-1 — `next.config.mjs` فارغ مكرّر** — احذفه (`next.config.ts` هو المستخدم؛ والتعليق فيه "Next 14 يستخدم .ts عند وجود الاثنين" **غير دقيق** لكن النتيجة صحيحة). *(دقائق)*
- **L-2 — 6 متغيّرات بيئة غير موثّقة** — `.env.local.example` يوثّق 3 من 10؛ ناقص: `ADMIN_EMAILS, ANTHROPIC_API_KEY, CRON_SECRET, NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_WHATSAPP_NUMBER, SUPABASE_SERVICE_ROLE_KEY`. *(دقائق)*
- **L-3 — `CRON_SECRET` يفشل-مفتوحاً لو غير مضبوط** — `stale-leads-cleanup/route.ts:30` يقارن بـ `Bearer ${undefined}`؛ أضِف `if (!process.env.CRON_SECRET || …)`. *(دقائق)*
- **L-4 — حماية كلمات السر المسرّبة معطّلة** — advisor: فعّل HaveIBeenPwned من إعدادات Supabase Auth. *(دقائق)*
- **L-5 — 86 `: any` + 13 `as any`** — مركّزة في `universities/page.tsx` (13)، `lib/entities.ts` (12)، `profile/*`. ولّد أنواع Supabase (`supabase gen types`) وطبّعها. *(متوسط)*
- **L-6 — 40 `eslint-disable`** — ~36 منها `no-img-element` (يتبع M-15)؛ و2 disable عاريان بلا اسم قاعدة. *(منخفض)*
- **L-7 — أزرار dropdown في الهيدر بلا `aria-expanded`/`aria-haspopup`** — `SiteHeader.tsx:179,208,250` (WCAG 4.1.2). *(ساعات)*
- **L-8 — `ink-subtle (#9CA3AF)` يسقط في WCAG AA** (~2.8:1) لنصوص صغيرة في `tailwind.config.ts:68`. *(دقائق + تحقّق)*
- **L-9 — سكربتات ميتة في الجذر** — `push-phase4.bat/.ps1` (تحوي URL preview قديم `masarak-khaki.vercel.app` و`del .git\index.lock`). احذفها. *(دقائق)*
- **L-10 — تسجيل `console.*` فقط (41)** — بلا مستويات/sink؛ أعطال cron/AI تختفي. أضِف logger رفيع. *(منخفض)*
- **L-11 — `.vercel/project.json` موجود رغم `.gitignore`** — IDs فقط (لا سرّ)، لكن تأكّد أنه ليس متتبَّعاً في git history. *(دقائق)*
- **L-12 — تعليقات/أسماء قديمة** — `seo.ts:8` يشير لـ `next.config.mjs` غير الموجود؛ `data-flow/page.tsx:189` يحوي URL preview قديم. *(دقائق)*

---

## 📊 Metrics

| المقياس | القيمة |
|---|---|
| ملفات `.tsx` | 248 |
| ملفات `.ts` | 48 |
| **إجمالي ts/tsx** | **296** |
| إجمالي السطور (src) | ~45,718 |
| Components > 300 سطر | **40** (الأكبر: `i18n.tsx` 4,413 — `cv-builder/page.tsx` 1,094 — `org/dashboard/page.tsx` 739) |
| `: any` | 86 |
| `as any` | 13 |
| `@ts-ignore`/`@ts-expect-error` | 2 |
| `eslint-disable` | 40 |
| `TODO/FIXME` (src) | 2 (+ تعليقات "wire to Sentry") |
| `console.*` | 41 (`console.log`: **0** 👍) |
| `dangerouslySetInnerHTML` | 13 موضعاً — **كلّها JSON-LD/آمنة** (لا XSS) |
| ملفات SQL | 25 (drift كبير) |
| migrations في الـ repo | 19 (+ ملفات schema مستقلّة متعارضة) |

---

## 🛡️ Security Posture

- **RLS coverage:** **72 / 72 جدول مفعّل** (تحقّق حيّ) — لا جدول عام مكشوف. ✅
- **Admin authorization:** عبر `auth.jwt()->>'email'` (موثوق، لا يُزوَّر). ✅ (لكن الإيميل مكرّر كـ string في عشرات السياسات — مخاطرة تدوير).
- **Org RBAC (drift tables):** `org_members`/`organizations` لها RLS سليم (`is_org_admin`/`is_platform_admin`) — لا تصعيد. ✅
- **Secret leakage:** **لا** — لا service-role في كود العميل، لا أسرار في git (الـ `eyJ...` في `data-flow` مجرّد placeholder). ✅
- **XSS:** لا — كل `dangerouslySetInnerHTML` آمن (JSON-LD). ✅
- **Security headers:** CSP/HSTS/X-Frame/nosniff **مطبّقة فعلاً** (تحقّق حيّ). ✅ (CSP يسمح `unsafe-inline`/`unsafe-eval` في script-src — تشديد لاحق).
- **النقاط الضعيفة الفعلية:** حقن إشعارات/بثّ تصيّد (C-2)، دوال anon-executable تسرّب مقاييس وتتلاعب بـ leads (H-1/H-2)، 5 جداول INSERT-true (H-4)، تصعيد role دفاع-بالعمق (H-3)، buckets قابلة للسرد (H-7)، 20 دالة بـ search_path قابل للتعديل (H-8)، لا rate limiting (H-6)، دعوة غير مربوطة بإيميل (H-9).
- **advisor الأمني (Supabase):** ~17 SECURITY DEFINER قابلة للاستدعاء من anon، 20 search_path قابل للتعديل، 5 INSERT-true، 2 bucket listable، leaked-password protection معطّلة.

**التقييم النهائي: متوسط.** خطر اختراق جماعي للبيانات **منخفض** (RLS متين)، لكن توجد vectors إساءة حقيقية (تصيّد، spam، تلاعب بيانات، تسريب مقاييس) لازم تُغلَق.

---

## ⚡ Performance Profile

> لم يُشغَّل `next build` (احتراماً لقيدك). التحليل ثابت + advisor الأداء الحيّ من Supabase.

- **Client-heavy:** ~162 ملف فيه `"use client"`؛ كل صفحات القوائم الرئيسية client-side fetch خلف spinner (LCP/FCP).
- **أكبر أعباء الـ bundle المتوقّعة:**
  1. `src/lib/i18n.tsx` (4,413 سطر، عربي+إنجليزي) مشحون على **كل صفحة** عبر الهيدر/الفوتر.
  2. خط **Tajawal محمَّل مرّتين** (`<link>` + CSS `@import`) من طرف ثالث، render-blocking.
  3. صفحات `'use client'` كبيرة (`cv-builder` 1,094 سطر، `org/dashboard` 739).
  - 👍 ممارسات جيّدة مؤكَّدة: `html2canvas` و`@react-pdf/renderer` و tabs الأدمن كلّها dynamic import.
- **DB (advisor الأداء):** 101 `auth_rls_initplan`، 160 `multiple_permissive_policies`، 35 `unused_index`، 24 `unindexed_foreign_keys`.
- **أبطأ المسارات المتوقّعة (mobile):**
  1. `/` و صفحات القوائم (i18n + خط + client fetch).
  2. `/parent|org|counselor/dashboard` (middleware getSession + org_members query + sequential awaits).
  3. `/tools/cv-builder` (1,094 سطر client).
  4. أي صفحة مسجَّلة (تكلفة الـ middleware لكل طلب).
  5. صفحات الجامعات/المدارس (33 `<img>` خام، لا next/image).

---

## 🎯 Recommendations Roadmap

### الأسبوع 1 — أوقِف النزيف (Critical + أمان سريع)
- C-1: أصلِح استعلام `listeners.ts` (`organizations.entity_id`) → أحيِ قمع الـ leads. **(أهم إصلاح تجاري)**
- C-2 + H-1 + H-2: أغلِق حقن الإشعارات؛ `REVOKE EXECUTE … FROM anon` على `admin_user_growth_30d`/`upsert_org_lead` (+ حرّاس داخلية).
- C-3: `try/catch/finally` + `ErrorState` في الـ 4 dashboards.
- H-4 + L-3: قيّد الـ 5 جداول INSERT-true؛ أصلِح fail-open في `CRON_SECRET`.
- H-8: `SET search_path=''` للـ 20 دالة. H-7: أغلِق سرد الـ buckets. L-4: فعّل leaked-password protection.

### الأسبوع 2 — الاستقرار والثقة
- C-5: `next/font` + حذف الخط المزدوج؛ ابدأ تقسيم i18n (حمّل الإنجليزي lazy).
- C-4: قرّر الـ schema الكانوني (`user_profiles`)، اعزل ملفات SQL القديمة، حدّث README.
- H-11/H-12/H-13: وحّد تدفّق التوثيق؛ أضِف dedup key للإشعارات؛ صحّح تسجيل النقاط.
- H-16: أضِف Sentry + GitHub Action (`lint && check:i18n && build`) + أول دفعة Vitest.
- M-1: أطلِق `register_complete`/`complete_dna`/`apply`.

### الشهر الثاني — العمق والنضج
- H-14/H-15 + M-7/M-8/M-9: حوّل صفحات القوائم لـ Server Components + ISR؛ خفّف الـ middleware؛ أصلِح `auth_rls_initplan` ودمج السياسات وأضِف indexes للـ FKs.
- H-5/H-6/M-18: تبنَّ `mustCan()` (أو احذفه)؛ أضِف rate limiting؛ وحّد طبقة الوصول للبيانات.
- M-2/M-3/M-5/M-16: تبنَّ `useAsyncData`/`ErrorState`/`Skeleton`؛ وحّد وحدتي الحفظ؛ نظام toast.
- M-11..M-15: أصلِحات SEO (blog metadata، majors 404، vocational metadata، hreflang، next/image).
- L-5: ولّد أنواع Supabase وقلّل الـ `any`.

---

*انتهى التقرير — تدقيق read-only، لم يُعدَّل أي ملف. التحقّق شمل قراءة الكود، ملفات `supabase/`، headers الـ production الحيّة، وintrospection حيّ للـ Supabase (RLS + advisors).*
