# تقرير تدقيق منصّة Masarak | مسارك — يوليو 2026
**Platform Audit Report — `PLATFORM_AUDIT_2026-07`**

> نطاق التدقيق: فحص كامل للموقع + المنتج + تجربة الاستخدام + مراجعة الكود + الأداء + قابلية التوسّع + الأمان الأساسي + الـSEO + جودة الداتا، من منظور **12 نوع مستخدم**.
> منهجية: 5 وكلاء فحص متوازية + تحليل مباشر لقاعدة بيانات الإنتاج (Supabase `cxctwvqqnpvoebpelkle`) + تدقيق يدوي للكود. **كل ادّعاء حسّاس تمّ التحقق منه مقابل الكود/الداتا الفعليّة قبل إدراجه.**
> فرع العمل: `audit/full-platform` · الأساس: `main @ 235c365` · تاريخ: 2026-07-03.

---

## ملاحظة منهجية مهمّة (دقّة التقرير)
اعتمد التقرير على وكلاء استكشاف قرأوا مقتطفات من الكود، لذلك جرى **التحقّق المستقل** من كل الادّعاءات الحرجة. ثلاثة ادّعاءات من الوكلاء **صحّحناها** بعد الرجوع للكود/الداتا:
1. ❌ ادّعاء «ميزة مراسلة الجامعات البريميوم غير موجودة / الـRPC مفقود» — **غير صحيح**. الدوال `university_can_message` و `message_university` و `is_premium_org` موجودة ومنشورة في قاعدة البيانات. الحقيقة: الميزة **مبنيّة لكن خامدة** لأنّه لا يوجد أي منظمة بريميوم حاليًا (0 featured / 0 اشتراك فعّال).
2. ❌ ادّعاء «لوحة المرشد تعرض بيانات ثابتة hardcoded» — **غير صحيح**. `counselor/dashboard` يستعلم فعليًا من `profiles`/`student_profiles`. المشكلة الحقيقيّة: RLS على هذه الجداول self-only فيرجع الاستعلام سطر المرشد نفسه فقط → **الروستر فارغ عمليًا** لأي مرشد غير أدمن.
3. ⚠️ ادّعاء «ربط ولي الأمر بلا أي تحقّق / انتحال هوية» — **مبالغ فيه**. الدالة تتحقّق (طول الكود، وجود الطالب، منع الربط الذاتي). المشكلة الحقيقيّة والدقيقة: **الربط يصير `active` فورًا بلا موافقة الطالب، وبلا انتهاء صلاحية للكود، وبلا استخدام لمرّة واحدة** — الطالب يُخطَر بعد وقوع الربط فقط.

---

## 1) الملخّص التنفيذي — Executive Summary

Masarak منصّة تعليميّة **حقيقيّة ومنشورة على الإنتاج** (masaraklb.com)، مبنيّة على Next.js 14 (App Router) + Supabase، عربيّة-أولًا/RTL، بـ**118 صفحة** و13 API route و~55.3k سطر كود. المعماريّة **سليمة وقابلة للتوسّع**: 111/118 صفحة server-components، RLS على كل الجداول، دوال `SECURITY DEFINER` مع تحقّقات داخليّة و`search_path` مضبوط، Realtime للرسائل، rate-limiting على مسارات الـAPI، ورؤوس أمان (CSP/HSTS/X-Frame) في `next.config`.

المنصّة **ليست نموذجًا أوليًّا** — فيها محرّك quiz تكيّفي، نظام DNA مهني، دليل جامعات (40 محلّي + 234 عالمي) ومدارس ومنح وتخصّصات ومهن وأدلّة، لوحات أولياء أمور ومنظمات وأدمن، ونظام اجتماعي كامل (بروفايلات/أصدقاء/رسائل/مجتمعات/feed) بُني مؤخّرًا. البيانات المرجعيّة **عالية الجودة**: كل الجامعات والمدارس لها slugs فريدة ومكتملة.

لكنّ المنصّة في **مرحلة ما-قبل-التوسّع**: هناك فجوات إكمال (منتج المدارس مجرّد mockup، روستر المرشد محجوب بالـRLS، لا نموذج دخل للطلاب، ميزة البريميوم خامدة)، ونقص منهجيّ في **معالجة أخطاء الجلب** (114 صفحة قد تفشل بصمت)، و**تكرار في الكود** (10 مكوّنات Field مكرّرة، مكتبتا حفظ متوازيتان)، وحزمة i18n بحجم **476 كيلوبايت** تُشحن لكل زائر. لا توجد أخطاء أمان من مستوى ERROR، والأداء الحالي ممتاز (أكبر جدول 829 سطرًا).

**الحكم:** أساس متين جاهز للإنتاج، يحتاج **تقوية (hardening) + إغلاق فجوات إكمال محدودة** قبل التسويق العدواني أو التوسّع الكبير. لا شيء يستدعي توقّفًا طارئًا.

**التقدير الإجمالي: 6.8 / 10** — «قويّ مع فجوات معروفة وقابلة للإصلاح».

---

## 2) بطاقة الدرجات — Overall Score /10

| البُعد | الدرجة | الخلاصة |
|---|:---:|---|
| **UX (تجربة الاستخدام)** | 6.5 | تدفّقات منطقيّة وonboarding جيّد، لكن 114 صفحة بلا error-state، 11 `alert()`، وفقدان نتائج الـquiz للزائر عند التسجيل. |
| **UI (الهويّة البصريّة)** | 7.5 | هويّة نعناع/teal متّسقة وأنيقة؛ لكن 559 لون hex ثابت يتجاوز التوكنز، وغياب مكوّنات UI مشتركة (Avatar/Field/Modal مكرّرة). |
| **Content (المحتوى والكتابة)** | 7.0 | محتوى غنيّ (أدلّة/تخصّصات/مهن) ومُعرَّب pan-Arab؛ لكن صفحات «قريبًا» (jobs/mentorship/courses) وبيانات وهميّة في school-admin. |
| **Code Quality** | 6.5 | منضبط بأماكن (0 console.log، lib/social مكتمل الأنواع، auth+rate-limit متّسق)؛ لكن تكرار واسع، 147 `any`، ملفّات ميّتة، ولا طبقة validation. |
| **Performance** | 6.5 | 111/118 server-components + خطوط مُحسّنة + config مُقوّى؛ لكن i18n 476KB (المشكلة #1)، جلب useEffect متسلسل، 41 `<img>` غير مُحسّنة. |
| **SEO** | 7.0 | أساسات صلبة (sitemap ذكيّ يستثني noindex، robots، JSON-LD، generateMetadata على أغلب المسارات)؛ فجوات: CSR في blog/vocational/community، slugs المنح. |
| **Scalability** | 7.0 | معماريّة تتوسّع (RLS/RPC/Realtime)؛ 9 فهارس FK ناقصة + 8 سياسات RLS بـ`auth.uid()` غير ملفوفة — إصلاحات صغيرة ومحتواة. |
| **Security Basics** | 7.0 | RLS شامل، admin-gate على `app_metadata` فقط، rate-limits، رؤوس أمان؛ فجوات: حماية كلمات السرّ المسرّبة مُعطّلة، ربط ولي الأمر بلا موافقة/انتهاء. |
| **Data Quality** | 7.0 | جامعات/مدارس/عالمي: slugs فريدة ومكتملة ✅؛ فجوات: 63 منحة بلا slug، صفحة المهن hardcoded رغم 37 سطرًا في الداتا. |
| **Product Readiness** | 6.5 | حلقات أساسيّة تعمل (اكتشاف/quiz/اجتماعي/منظمات)؛ فجوات: لا دخل للطلاب، منتج المدارس mockup، روستر المرشد محجوب، بريميوم خامد. |
| **الإجمالي المرجّح** | **6.8** | أساس إنتاجيّ متين + قائمة تقوية واضحة. |

---

## 3) المشاكل حسب الخطورة — Critical / Medium / Low

### 🔴 حرجة (Critical) — تعالَج أوّلًا
لا توجد مشاكل من مستوى «توقّف الخدمة» أو ثغرة ERROR. الحرِج هنا = «يكسر رحلة مستخدم فعليّة أو يعرّض بيانات».

| # | المجال | المشكلة | الأثر |
|---|---|---|---|
| C1 | Reliability/UX | **114 صفحة بلا معالجة أخطاء جلب.** 59 `.then(` مقابل 6 `.catch`؛ 63 صفحة تتعقّب `loading` وفقط ~16 تتعقّب `error`. مثال: `universities/[id]` عند فشل الجلب يبقى skeleton للأبد. | المستخدم يرى شاشة فارغة/تحميل لا نهائي عند أيّ فشل شبكة. |
| C2 | Data-loss/UX | **`onboarding/wizard` يبتلع الأخطاء ثم يوجّه للـdashboard.** `finish()` داخل `catch {}` ثم `router.push('/dashboard')` مهما حصل → إجابات الـonboarding تُفقد بصمت عند أهمّ خطوة في القمع. | ملف تعريف ناقص بلا أي إشعار للمستخدم. |
| C3 | Privacy/Security | **ربط ولي الأمر بلا موافقة الطالب.** `link_parent_by_code` يُنشئ رابطًا `active` فورًا؛ لا انتهاء صلاحية، لا استخدام لمرّة واحدة، لا rate-limit، والطالب يُخطَر بعد الربط فقط. كود مُسرَّب/مُخمَّن = وصول قراءة بمستوى ولي أمر لتقدّم الطالب. | تسرّب خصوصيّة تقدّم الطالب لطرف غير مُصرّح. |
| C4 | Data-integrity | **مكتبتا حفظ متوازيتان** (`lib/saved.ts` القويّة مقابل `lib/savedItems.ts` بلا معالجة أخطاء) تكتبان نفس جدول `saved_items` بمسارين مختلفين → انحراف دلالي وتضارب بيانات محتمَل. | عناصر محفوظة تظهر/تختفي حسب المسار المستخدَم. |

### 🟡 متوسّطة (Medium)
| # | المجال | المشكلة |
|---|---|---|
| M1 | Performance | حزمة i18n **476KB** (`src/lib/i18n.tsx`، 7,763 سطرًا، `'use client'`) تُشحن كاملة لكل زائر → TTFB أبطأ. |
| M2 | Scalability | **9 أعمدة FK بلا فهرس** + **8 سياسات RLS** تستدعي `auth.uid()` بلا `(select …)` → إعادة تقييم لكل سطر عند التوسّع. |
| M3 | Security | **admin-gate آمن** (`app_metadata` فقط) لكن `getRole()` للمرشد/ولي الأمر يرجع لـ`user_metadata` **القابل للكتابة من المستخدم** → وصول واجهة (لا بيانات، الـRLS يحمي) بدور منتحَل. |
| M4 | Product | **روستر المرشد محجوب بالـRLS.** `counselor/dashboard` يستعلم `student_profiles`/`profiles` المحميّة self-only → المرشد الحقيقي يرى نفسه فقط (روستر فارغ). يلزم RPC مُنطاقة بالمدرسة. |
| M5 | Product | **منتج المدارس mockup.** `school-admin/page.tsx` بيانات ثابتة (طلاب وهميّون، منهم اسم المالك نفسه)؛ محميّ للأدمن فقط عبر middleware، لكن لا signup/ربط/DB للمدارس. |
| M6 | SEO | **CSR في صفحات تفصيل** `blog/[slug]`, `vocational/[id]`, `community/[slug]` بلا `generateMetadata` → غوغل يرى قوقعة فارغة. |
| M7 | UX/a11y | **22–24 modal يدويّة** (`fixed inset-0`) بلا `role=dialog`/`aria-modal`/focus-trap/Escape → مخالفة WCAG. |
| M8 | UX | **11 ملفًّا يستخدم `alert()`** رغم وجود toast util → تجربة غير احترافيّة تحجب التفاعل. |
| M9 | Data | **63 منحة بلا slug** (العمود موجود، كلّه NULL) → روابط رقميّة غير مشاركة-صديقة وخارج الـsitemap. |
| M10 | Product | **صفحة المهن hardcoded** رغم 37 سطرًا في جدول `careers` → مصدر حقيقة مزدوج. |
| M11 | UX/Growth | **نتائج Career-DNA للزائر تُفقد عند التسجيل** (لا نقل من anon إلى الحساب). |
| M12 | Security | **claim المنظمة بلا تحقّق نطاق بريد** — أي مستخدم يطلب claim لأي منظمة، والأدمن يوافق يدويًّا → خطر انتحال. |
| M13 | Validation | **لا طبقة validation على 13 API route** — `req.json() as T` بلا فحص runtime (مثال: `quiz/submit`, `university-reviews` rating غير مُتحقّق). |

### 🟢 منخفضة (Low)
| # | المشكلة |
|---|---|
| L1 | **559 لون hex ثابت** في TSX يتجاوز نظام التوكنز. |
| L2 | **تكرار مكوّنات:** 10 `Field`، 3 `timeAgo`، لا مكوّن `Avatar` مشترك (9 ملفّات تعيد اختراع دائرة الأحرف الأولى). |
| L3 | **ملفّات ميّتة (5):** `DeadlineChip`, `ErrorBoundary` (غير مُركّب أصلًا!), `OrgComingSoon`, `app/components/HomeBanners`, `lib/use-async-data` (الـhook الذي كان سيحلّ C1، مكتوب وغير مستخدَم). |
| L4 | **`Breadcrumb.tsx` vs `Breadcrumbs.tsx`** — نسختان؛ فقط الثانية تُصدر JSON-LD → 10 صفحات تفقد schema. |
| L5 | **3 صفحات تُنشئ Supabase client على مستوى الموديول** (`scholarships/tracker`, `careers/[slug]`, `glossary`) بدل الـsingleton → تحذير multiple GoTrueClient. |
| L6 | **حماية كلمات السرّ المسرّبة مُعطّلة** (إعداد Supabase Auth) + `schools_set_defaults` بـ`search_path` قابل للتغيير. |
| L7 | **canonical للمهن يستخدم `id` بدل `slug`** (هشّ)، وصفحات الجامعات العالميّة قد تُكرّر صفحات لبنان بلا canonical. |
| L8 | **لا `JobPosting`/`Occupation` schema** على صفحات المهن (تفويت ميزة SERP). |

---

## 4) تدقيق صفحة-بصفحة — Page-by-Page Audit

118 صفحة، مجمّعة حسب المجال. (✅ مكتملة · ⚠️ فجوة · 🔴 حرجة)

| المجموعة | عدد | الحالة | ملاحظات |
|---|:---:|:---:|---|
| **Marketing/Home** (`/`, for-students/parents/schools/universities, about, team, contact) | 8 | ✅ | server-rendered، محتوى ثريّ، هويّة متّسقة. `for-schools` صفحة هبوط فقط (لا منتج خلفها). |
| **Universities** (list, map, country/[slug], country/[slug]/[uni], [id]) | 6 | ✅⚠️ | تفصيل غنيّ + `generateMetadata` + schema. ⚠️ احتمال تكرار لبنان بين `[id]` و`country/LB/[uni]` بلا canonical (L7). |
| **Schools** (list, [country], [country]/[slug]) | 3 | ✅ | يفحص `isSchoolIndexable` قبل الفهرسة (ممتاز). لبنان فقط حاليًّا. |
| **Scholarships** (list, tracker, [id]) | 3 | ⚠️ | القائمة والـtracker جيّدة. ⚠️ 63 صفّ بلا slug → التفصيل رقميّ وخارج الـsitemap (M9). |
| **Study-Abroad** (hub, [country], scholarships, scholarships/[slug]) | 4 | ✅ | `generateMetadata` ديناميكيّ، يسحب من `scholarships_global`. |
| **Majors** (list, [slug]) | 2 | ✅ | 32 صفحة prebuilt + schema `EducationalOccupationalProgram` + career-map. |
| **Careers** (list, [slug]) | 2 | ⚠️ | صفحات غنيّة لكن **المصدر hardcoded** رغم 37 سطرًا في DB (M10)؛ لا `JobPosting` schema (L8). |
| **Vocational** (list, [id], institute) | 3 | ⚠️ | CSR بلا `generateMetadata` (M6). مسرود من DB (18 برنامج/10 معاهد). |
| **Tools** (hub + ~14 أداة: cv-builder, cost-calc, career-ai, skill-gap, …) | 15 | ✅⚠️ | تنوّع ممتاز. `cv-builder` (1,094 سطرًا) و`skill-gap` monolith — يحتاجان تقسيم (Code L). أدوات AI محميّة بـrate-limit ✅. |
| **Content** (blog, blog/[slug], guides, guides/[slug]) | 4 | ⚠️ | الأدلّة (20) غنيّة. ⚠️ `blog/[slug]` CSR بلا metadata (M6)؛ `guides/[slug]` 905 أسطر يضمّن الداتا داخله. |
| **Social** (u/[slug], friends, messages, community, community/[slug], post/[id], feed) | 7 | ✅⚠️ | بُني حديثًا، RPC-safe، Realtime. ⚠️ جلب useEffect متسلسل في feed/messages/friends (Perf)؛ community/[slug] CSR (M6). |
| **Quiz/DNA** (career-dna, quiz/play, result, review, progress, today, gamification, xp) | 8 | ✅ | محرّك تكيّفي حقيقي. ⚠️ الأسئلة غير مُصدَّرة الإصدار — حذف سؤال يكسر السجلّ التاريخي. |
| **Dashboards** (dashboard, interested, profile ×4, settings) | 7 | ⚠️ | لوحات غنيّة. ⚠️ جلب client-side بلا error-state (C1)؛ ملفّات profile tabs تكرّر `Field`/auth-effect. |
| **Parent** (parent, dashboard, link-student, deadlines, resources, student/[id]) | 6 | ⚠️ | منطقة كاملة + RBAC. 🔴 ربط بلا موافقة (C3)؛ يعتمد `getRole` على user_metadata (M3). |
| **Org** (org, dashboard, claim, join, request-access, redeem, sponsors/apply) | 7 | ⚠️ | لوحة multi-tab قويّة (955 سطرًا monolith). ⚠️ claim بلا تحقّق نطاق (M12). |
| **Admin** (admin, dashboard [20+ tabs], orgs, orgs/invite, partnerships, moderation) | 6 | ✅ | gate على `app_metadata` فقط ✅، code-split للـtabs، إخفاء PII عن الـco-admin. |
| **School/Counselor** (school-admin, counselor/dashboard) | 2 | 🔴⚠️ | 🔴 school-admin **mockup** (M5)؛ ⚠️ counselor **محجوب RLS** (M4). |
| **Auth/Onboarding** (login, register, forgot, confirm-email, parent-signup, onboarding, wizard) | 7 | ⚠️ | تدفّق سليم. 🔴 wizard يبتلع الأخطاء (C2)؛ لا تتبّع إكمال onboarding. |
| **Legal/Meta** (privacy, terms, faq, changelog, pricing, pricing-school, premium, referral, offline) | 9 | ✅ | مكتملة؛ noindex صحيح على الحسّاس. |
| **«قريبًا» / Stubs** (jobs, mentorship, courses) | 3 | ✅ | مُعلّمة `noIndex` ومستثناة من sitemap ✅ (تعامل صحيح مع الصفحات الرقيقة). |

**الخلاصة:** الأغلبيّة الساحقة صفحات مكتملة ومُهيكلة جيّدًا. الفجوات مركّزة في: school-admin (mockup)، counselor (RLS)، ومعالجة أخطاء الجلب عبر لوحات المستخدم.

---

## 5) تدقيق دور-بدور — Role-by-Role Audit (12 نوع مستخدم)

| الدور | الرحلة | الحالة | أهمّ فجوة |
|---|---|:---:|---|
| **زائر غير مسجّل** | يتصفّح كل المحتوى العامّ + career-dna عامّ. يصطدم بجدار الدخول عند dashboard/profile/social/parent/org/admin. | ✅ | career-dna عامّ لكن **بلا رابط بارز من الصفحة الرئيسيّة** → اكتشاف ضعيف. |
| **مستخدم جديد أوّل مرّة** | register → (تأكيد بريد) → `onboarding/wizard` (3 أسئلة إلزاميّة) → dashboard. | ⚠️ | 🔴 wizard يبتلع فشل الحفظ (C2)؛ لا re-entry إن أُغلق التبويب؛ كتابة مزدوجة user_metadata + student_profiles قد تتعارض. |
| **طالب (مجّاني)** | dashboard → أدوات/quiz/DNA/بحث/حفظ/اجتماعي/بروفايل. | ✅ | كلّ شيء متاح مجّانًا؛ حفظ عبر مكتبتين متعارضتين (C4). |
| **طالب Premium/Verified** | — | ⚠️ | **لا نموذج بريميوم للطالب** (لا paywall/اشتراك طلابي). ميزة مراسلة الجامعات البريميوم موجودة لكن خامدة (0 منظمة بريميوم). |
| **ولي أمر** | register(parent) → parent-signup(كود) → parent/dashboard → student/[id]/deadlines/resources. RBAC يحصره في `/parent/*`. | ⚠️ | 🔴 ربط فوري بلا موافقة/انتهاء/مرّة-واحدة (C3)؛ لا واجهة «فصل ولي أمر» واضحة. |
| **جامعة/منظمة تعليميّة** | claim (`org/claim`) → طلب وصول → موافقة أدمن → `org_members` → org/dashboard (إعلانات/فعاليات/منح/طلاب). | ⚠️ | claim بلا تحقّق نطاق بريد (M12)؛ أثر `is_featured` غير ظاهر للطالب. |
| **مدرسة** | إدخال دليليّ فقط؛ `school-admin` mockup. | 🔴 | **لا منتج مدرسة فعليّ** (M5): لا signup/ربط طلاب/DB. |
| **مرشد تربويّ (Counselor)** | register(counselor) → `counselor/dashboard` (roster/metrics/tools). middleware يحمي `/counselor/*`. | ⚠️ | **الروستر محجوب RLS** (M4) → المرشد الحقيقي يرى نفسه فقط؛ لا آليّة ربط بطلّاب مدرسته. |
| **أدمن (منصّة)** | gate على `app_metadata`/email → dashboard 20+ tab، code-split، إخفاء PII عن co-admin. | ✅ | تدقيق إجراءات الأدمن الحسّاسة (grant_admin/toggle) يمكن تعزيزه بـaudit-log لكل إجراء. |
| **حساب مجّاني (free)** | = الطالب المجّاني؛ وصول كامل للحلقات الأساسيّة. | ✅ | لا تمييز فعليّ عن المدفوع (لا يوجد مدفوع طلابيّ). |
| **مستخدم عائد (returning)** | جلسة محفوظة → dashboard مباشرة. | ✅ | إن لم يكمل onboarding سابقًا يهبط على dashboard ناقص بلا re-entry. |
| **مؤسّسة تعليميّة محتمَلة** | صفحات `for-universities`/`for-schools`/`sponsors/apply` + claim/request-access. | ⚠️ | القمع موجود لكن التأهيل (verification) يدويّ بالكامل. |

**رحلات مكسورة مؤكّدة:** (1) مدرسة → لا منتج. (2) مرشد → روستر فارغ بالـRLS. (3) زائر أخذ DNA → يفقدها عند التسجيل. (4) ولي أمر → ربط بلا موافقة الطالب.

---

## 6) ملاحظات مراجعة الكود — Code Review Notes

**إحصاءات مُقاسة:** 55.3k سطر · أكبر ملفّ `i18n.tsx` (7,763) ثم `cv-builder` (1,094)، `org/dashboard` (955)، `guides/[slug]` (905) · **147** استخدام `any` · **41** `<img>` مقابل 3 `next/image` · **59** `.then(` مقابل **6** `.catch` · **0** `console.log` (نظيف) · **12** `catch {}` فارغة · **11** ملفًّا بـ`alert()` · **10** مكوّنات `Field` مكرّرة · **22** modal يدويّة · **18** ملفًّا يكرّر auth-gate effect.

**نقاط قوّة:** انضباط في lib/social (مكتمل الأنواع)، auth + rate-limit متّسق على كل route، 0 console.log، TS strict، code-split لتبويبات الأدمن.

**أهمّ 10 نتائج كود (مرتّبة):**
1. **[P1] `onboarding/wizard`:** `catch {}` ثم توجيه دائم → فقدان بيانات (C2).
2. **[P1] غياب error-states منهجيًّا** (C1) — الحلّ: hook `useAsyncData` (موجود وميّت!) + UI خطأ، تدريجيًّا.
3. **[P1] مكتبتا حفظ متوازيتان** `saved.ts` / `savedItems.ts` (C4) — دمج.
4. **[P1] Supabase client مكرّر على مستوى الموديول** في 3 صفحات (L5) — استخدام الـsingleton.
5. **[P1] لا validation runtime** على `req.json()` في 13 route (M13) — إضافة zod.
6. **[P2] `StudentContext`** 4 `catch {}` حول localStorage/JSON → مسح صامت لبيانات DNA/المحفوظات.
7. **[P2] `Breadcrumb` vs `Breadcrumbs`** (L4) — دمج، لاستعادة JSON-LD في 10 صفحات.
8. **[P2] 10 `Field` + 3 `timeAgo` + لا `Avatar`** (L2) — طقم مكوّنات `components/ui/`.
9. **[P2] 22 modal بلا a11y** (M7) — Modal primitive واحد.
10. **[P3] ملفّات monolith** (cv-builder/org-dashboard/guides) + 5 ملفّات ميّتة (L3) + 559 hex (L1).

**قائمة إعادة الهيكلة الأعلى قيمة:** (S=صغير M=متوسّط) — طقم UI primitives **M** · تبنّي `useAsyncData` + error-states **M** · دمج saved + حذف الميّت + توحيد breadcrumbs **S** · انضباط Supabase client واحد **S** · طبقة zod للـroutes **M**.

---

## 7) توصيات الأداء — Performance Recommendations

| # | التوصية | الأثر | الجهد |
|---|---|---|---|
| P1 | **تقليص حزمة i18n (476KB):** فصل `messages` إلى JSON محمّل ديناميكيًّا، أو إبقاء المزوّد/الـhook فقط `'use client'` دون القاموس. | TTFB + hydration أسرع للجميع، خاصّة 3G/4G. | M |
| P2 | **تحويل الجلب من `useEffect` إلى server-components / Server Actions** على feed/dashboard/messages/friends/career-dna (شلّالات 300–800ms). | إزالة شلّال blank→hydrate→fetch. | M |
| P3 | **`next/image` للصور العامّة** (شعارات المنظمات/الجامعات، معارض CampusLife) — الأدمن يبقى `<img>` مقبولًا. | WebP + lazy + srcset، ~30% حجم أقلّ. | S–M |
| P4 | **skeletons/Suspense** على صفحات القوائم لتحسين الأداء المُدرَك. | إدراك أسرع. | S |
| P5 | **DB جاهزة للتوسّع بعد فهارس FK (§9)** — لا استعلامات ثقيلة حاليًّا (أكبر جدول 829 سطرًا). | استباقيّ. | S |

**إيجابيّات مؤكّدة:** خطّ Tajawal عبر `next/font` (لا render-block) · 111/118 server-components · `next.config` مُقوّى (CSP/HSTS/X-Frame/remotePatterns) · TS strict.

---

## 8) توصيات الـSEO — SEO Recommendations

**الأساسات صلبة:** `sitemap.ts` ديناميكيّ يستثني `seo_index_status='noindex'` (ممتاز ضدّ تضخّم الصفحات الرقيقة) · `robots.ts` يمنع api/dashboard/auth/admin ويسمح لبوتات AI · JSON-LD واسع (Organization, Website+SearchAction, BreadcrumbList, CollegeOrUniversity, Scholarship, EducationalOccupationalProgram, Course, FAQ) · `metadataBase` مضبوط · `generateMetadata` على أغلب المسارات الديناميكيّة · noindex صحيح على الخاصّ وعلى stubs «قريبًا».

**إجمالي الصفحات القابلة للفهرسة ≈ 600** (274 جامعة + 39 مدرسة + 63 منحة + 32 تخصّص + 37 مهنة + 60 مصطلح + 52 تدريب + 28 دولة + 18 مهنيّ) — **ليست بالآلاف**، فخطر تضخّم الفهرسة **متوسّط لا حرِج**؛ سياسة «الرقيق→noindex، المكتمل→index» تُطبَّق فعلًا للمدارس ويجب تعميمها.

| # | التوصية | الأولويّة |
|---|---|:---:|
| S1 | **تحويل `blog/[slug]`, `vocational/[id]`, `community/[slug]` إلى server-components + `generateMetadata`** (حاليًّا CSR → قوقعة فارغة لغوغل). | P1 |
| S2 | **backfill slugs المنح (63)** + توجيه `/scholarships/[slug]` لاحقًا (Roadmap) → روابط نظيفة قابلة للمشاركة وفهرسة. | P1 |
| S3 | **canonical لصفحات الجامعات العالميّة/لبنان** لتفادي تكرار المحتوى. | P2 |
| S4 | **`follow:false` مع `noIndex:true`** في `buildMetadata` للخاصّ. | P2 |
| S5 | **`JobPosting`/`Occupation` schema** لصفحات المهن (ميزة SERP). canonical المهن يستخدم slug لا id. | P3 |
| S6 | **تعميم `isSchoolIndexable`** كنمط: أيّ سجلّ محتوى ناقص الحقول → noindex حتى يكتمل (يحمي جودة الفهرس عند التوسّع). | P2 |

---

## 9) تقييم قابليّة التوسّع — Scalability Assessment

**الوضع الحالي:** أكبر جدول `analytics_events` = 829 سطرًا؛ 36 طالبًا، 35 منظمة. الأداء ممتاز. التقييم **استباقيّ** لأهداف 1k/10k/100k طالب + 500 جامعة/مدرسة.

**المعماريّة تتوسّع:** RLS + دوال `SECURITY DEFINER` (تحقّق داخليّ + `search_path` مضبوط) + Realtime + rate-limiting. لا أنماط N+1 على مستوى DB.

**عوائق التوسّع المُقاسة (إصلاحات صغيرة ومحتواة):**

**أ) 9 أعمدة FK بلا فهرس تغطية** — تصبح table-scans عند الحجم:
`communities.created_by` · `community_comments.author_id` · `community_comments.parent_id` · `community_posts.author_id` · `content_reports.reporter_id` · `conversations.created_by` · `messages.sender_id` · `quiz_dna_categories.category_code` · `user_blocks.blocked_id`.

**ب) 8 سياسات RLS تستدعي `auth.uid()` بلا `(select …)`** — إعادة تقييم لكل سطر (كلّها جداول اجتماعيّة حديثة؛ الجداول الأقدم مُحسّنة سابقًا):
`community_comments.ccomments_read` · `community_posts.cposts_read` · `conversation_participants.cp_update_self` · `follows.follows_own` · `friendships.friendships_delete_own` · `friendships.friendships_read_own` · `notification_preferences.np_own` · `user_blocks.blocks_own`.

**ج) على مستوى التطبيق:** حزمة i18n 476KB (§7) · جلب useEffect بلا pagination على feed/community عند النموّ · صفحات monolith تُبطئ البناء.

**السقف المتوقّع:** بعد فهارس FK + لفّ سياسات RLS + pagination على القوائم الاجتماعيّة، تتحمّل المعماريّة 100k طالب بلا إعادة تصميم. **الإصلاحات (أ) و(ب) آمنة ومنفّذة في هذا التقرير (§12).**

---

## 10) أفكار تحسين المنتج — Product Improvement Ideas

**Must (أساسيّ لسدّ فجوات مكسورة):**
- **M-1** حماية ربط ولي الأمر: موافقة الطالب + انتهاء صلاحية + استخدام لمرّة واحدة + rate-limit + واجهة فصل (C3).
- **M-2** معالجة أخطاء جلب عبر المنصّة (error-state + retry) وإصلاح wizard (C1/C2).
- **M-3** قرار منتج المدارس: إمّا بناء تدفّق حقيقي (signup/ربط/DB) أو إخفاء `school-admin` خلف feature-flag وتوضيح أنّه prototype (M5).
- **M-4** روستر المرشد عبر RPC مُنطاقة بالمدرسة (M4).

**Should (قيمة عالية):**
- **S-1** نقل نتائج Career-DNA للزائر إلى الحساب عند التسجيل (M11) + رابط DNA بارز على الرئيسيّة.
- **S-2** ربط صفحة المهن بجدول `careers` (37 سطرًا) وإزالة الـhardcode (M10).
- **S-3** تحقّق نطاق البريد في claim المنظمة (M12).
- **S-4** طقم UI primitives (Avatar/Field/Modal/toast) + استبدال 11 `alert()` (M7/M8/L2).

**Nice:**
- **N-1** نموذج دخل طلابيّ (اشتراك/بريميوم) إن كان هدفًا تجاريًّا؛ أو تثبيت أنّ الطلاب مجّانيّون والدخل من المنظمات.
- **N-2** JSON-LD `JobPosting` + canonicals (S3/S5).
- **N-3** dashboard المنظمة: إظهار أثر `is_featured` للطالب (ترتيب/شارة).

**Later:**
- **L-1** تفعيل ميزة مراسلة الجامعات البريميوم بربطها بمسار اشتراك حقيقي (حاليًّا خامدة).
- **L-2** إصدار أسئلة الـquiz (versioning) لحماية السجلّ التاريخي.
- **L-3** تقسيم ملفّات الـmonolith + طبقة validation (zod) لكل route.

---

## 11) خارطة الطريق المقترحة — Suggested Roadmap (5 مراحل)

| المرحلة | التركيز | العناصر | لماذا الآن |
|---|---|---|---|
| **Phase 0 — إصلاحات آمنة فوريّة** ✅ (هذا التقرير) | DB hardening | 9 فهارس FK + لفّ 8 سياسات RLS + `search_path` لـ`schools_set_defaults`. (backfill slugs المنح **أُجِّل لـPhase 1** لأنّ التوجيه لا يستخدم slug بعد، وslugification العربيّة تحتاج عناية.) | صفر مخاطرة، قابل للتراجع، يرفع Scalability فورًا. |
| **Phase 1 — الموثوقيّة والخصوصيّة** | إصلاح المكسور | error-states + retry (C1)، wizard (C2)، حماية ربط ولي الأمر (C3)، دمج مكتبتي الحفظ (C4). | يحمي بيانات المستخدم ويمنع رحلات مكسورة. |
| **Phase 2 — إغلاق فجوات الأدوار** | إكمال المنتج | روستر المرشد RPC (M4)، قرار منتج المدارس (M5)، تحقّق claim المنظمة (M12)، ربط صفحة المهن بالـDB (M10). | يجعل كلّ دور مُعلَن قابلًا للاستخدام فعليًّا. |
| **Phase 3 — الأداء والـSEO** | جاهزيّة التوسّع | تقليص i18n (M1)، تحويل جلب useEffect لـserver (P2)، SSR لصفحات التفصيل CSR (M6/S1)، next/image، canonicals + JobPosting. | قبل التسويق العدواني/النموّ العضويّ. |
| **Phase 4 — الجودة والدخل** | استدامة | طقم UI primitives + toast (M7/M8)، طبقة zod (M13)، تقسيم monolith، حسم نموذج الدخل + تفعيل البريميوم (N-1/L-1)، versioning للـquiz. | ديون تقنيّة + مسار تجاريّ. |

---

## 12) الملفّات المتغيّرة — Files Changed

**هذا التقرير (Phase 0 — إصلاحات آمنة فقط):**
- `PLATFORM_AUDIT_2026-07.md` — *(جديد)* هذا المستند.
- `supabase/migrations/20260703_audit_phase0_safe_fixes.sql` — *(جديد، **مكتوب وجاهز — بانتظار موافقتك لتطبيقه على الإنتاج**؛ لم يُطبَّق بعد)*:
  - `CREATE INDEX IF NOT EXISTS` لـ9 أعمدة FK.
  - لفّ 8 سياسات RLS عبر `ALTER POLICY`: `auth.uid()` → `(select auth.uid())` (دلالة مطابقة تمامًا، يحافظ على cmd/roles، أداء أفضل).
  - `ALTER FUNCTION public.schools_set_defaults() SET search_path='public','pg_catalog'`.
  - *(مُؤجَّل لـPhase 1: backfill `scholarships.slug` — يُدمَج مع توجيه `/scholarships/[slug]` وslugification سليمة.)*

**لم يُغيَّر أيّ ملفّ تطبيق/صفحة/مكوّن في Phase 0** — التزامًا بقيد «لا تكسر أيّ صفحة موجودة» و«التغييرات الكبيرة → Roadmap». كلّ ما عدا ذلك موثّق أعلاه للمراحل 1–4.

---

## 13) ملاحظات الاختبار — Testing Notes

- **تحليل DB مباشر على الإنتاج** (`cxctwvqqnpvoebpelkle`): أعداد الجداول، اكتمال/تفرّد الـslugs، فجوات فهارس FK، جرد سياسات RLS، وجود الدوال (`university_can_message`/`message_university`/`is_premium_org`/`link_parent_by_code`) — كلّها **مُتحقَّقة بالاستعلام**، لا بالافتراض.
- **advisors الأمان:** 0 ERROR · 169 WARN، غالبيّتها «تنفيذ SECURITY DEFINER من public» **مقصود** (كلّ RPC فيه تحقّق داخليّ). القابل للإصلاح: `schools_set_defaults` (search_path) + حماية كلمات السرّ المسرّبة (إعداد لوحة Supabase — إجراء المالك).
- **تحقّق مضادّ للوكلاء:** صُحِّحت 3 ادّعاءات خاطئة/مبالغ فيها (البريميوم/الـRPC، روستر المرشد، ربط ولي الأمر) بالرجوع للكود والداتا — انظر «ملاحظة منهجيّة» أعلاه.
- **قيود:** لم يُشغَّل E2E حيّ في المتصفّح لكلّ صفحة؛ اعتمدنا قراءة الكود + تحليل DB + معرفة عميقة بالكودبيس من هذه الجلسة. تدفّقات الدفع/الاشتراك خامدة (0 اشتراك) فلم تُختبَر حيّة.
- **البناء:** إصلاحات Phase 0 على مستوى DB فقط، تُتحقَّق عبر إعادة تشغيل `get_advisors` بعد التطبيق (لا حاجة لبناء الواجهة).

---
*انتهى التقرير. الخطوة التالية المقترحة: تطبيق migration الـPhase 0 الآمن (فهارس + لفّ RLS + search_path + slugs) والتحقّق عبر advisors — ثم مراحل الـRoadmap حسب أولويّتك.*
