# مسارك — Strategic Backlog

> مهام محفوظة للمستقبل، مرتّبة حسب الأولوية والقيمة.

---

## 🎯 P0 — Strategic positioning shift (decided)

**Reframe الموقع كـ "منصّة الطالب العربي للعالم" بدل "منصّة لبنانية":**

- ✅ التركيز الجديد: الطلاب العرب (~400M متحدث عربي، ملايين الطلاب)
- ✅ الـ UI يبقى عربي = الميزة الدفاعية
- ✅ الجامعات والمنح من كل دول العالم
- ✅ بعض الأقسام تبقى لبنانية (Bac equivalence، المدارس، التعليم المهني) لأنها فعلاً local
- ⏳ سيُنفّذ تدريجياً مع توسّع قاعدة الجامعات

---

## 🌍 P1 — Multi-country universities

**الفكرة:** يصير المستخدم يختار بلد (تركيا، الأردن، الإمارات، السعودية، مصر، ألمانيا، UK، أميركا، كندا، إلخ) ويشوف جامعاتها كاملة.

**الخطة (السيناريو A — جودة عالية):**
- 5-10 جامعات لكل بلد (يلي الطلاب اللبنانيين/العرب فعلاً بيقدّموا عليها)
- بحث يدوي + تعبئة كاملة لكل جامعة
- ~80-150 جامعة عالمياً نوعية وموثوقة

**الموجة الأولى (دول الأولوية):** الأردن، الإمارات، السعودية، مصر — طلاب عرب بيدخلوا الموقع بسرعة لأنه عربي.

**الموجة الثانية:** قبرص، تركيا، فرنسا، ألمانيا، UK، كندا — وجهات الدراسة الشعبية للعرب.

**الموجة الثالثة:** أميركا، أستراليا، الباقي.

**التطوير التقني المطلوب (يومين شغل):**
- [ ] إضافة عمود `country` بجدول universities (default 'LB' للموجودين)
- [ ] Country picker بصفحة /universities (شريط أعلام)
- [ ] Filter بالـ query: `.eq('country', selectedCountry)`
- [ ] Routes منفصلة + SEO: `/universities?country=tr` مع metadata خاصة بكل بلد
- [ ] Admin: dropdown اختيار البلد لما تضيف/تعدّل جامعة

---

## 🤖 P2 — ATS Checker on CV Builder

**فحص يدوي rule-based (مجاني، client-side، بدون AI):**

| الفحص | الطريقة |
|---|---|
| معلومات تواصل كاملة | email + phone + location موجودين |
| Summary موجود وطوله معقول | بين 50-200 كلمة |
| Experience مع bullets | كل experience عنده ≥2 bullets |
| Action verbs قوية | كل bullet يبدأ بـ Led/Built/Designed/Increased… (lookup list) |
| أرقام ومقاييس | regex على `\d+%`, `\$\d+`, `\d+x` — كل bullet لازم فيه رقم على الأقل |
| Skills count | بين 8 و 25 مهارة |
| Education موجود | على الأقل entry وحدة |
| Length check | preview height تقريبي مقابل A4 — تنبيه إذا فات 2 صفحات |
| Tense consistency | الشغل الحالي بـ present، السابق بـ past |
| ATS-unfriendly elements | ما في icons/emojis بمناطق حساسة |

**UI المقترح:** circular score ring 0-100 + checklist مع 🟢/⚠️/❌ + tips قابلة للنقر بتنقّل لمكان الخطأ.

**Bonus سهل:** textarea "الصق هون job description" → keyword match (tokenize + remove stopwords + diff).

**الوقت المتوقّع:** ~150-250 سطر كود، ساعة-ساعتين شغل.

**Tab جديد بنفس صفحة CV Builder**، أو floating panel على اليمين تحت الـ Live Preview.

---

## 🛠️ Technical Debt / UX polish (low priority)

- [ ] Schema.org structured data للجامعات (CollegeOrUniversity type)
- [ ] Self-host Tajawal font للأداء
- [ ] محتوى فعلي لصفحات `/parent/resources` (حالياً Coming soon)
- [ ] توحيد `/profile` و `/profile/edit` (تكرار في تجربة المستخدم)
- [ ] Mobile UX testing للـ floating cards
- [ ] Newsletter: إيميل ترحيب تلقائي لما حدا يشترك
- [ ] Admin: dashboard للـ newsletter subscribers (تصدير CSV)

---

## 📊 Phase plan (تسلسل تنفيذ)

1. **هلأ:** ترجمة كاملة (عربي/إنجليزي) — قيد التنفيذ
2. **بعدها:** Multi-country universities (السيناريو A — الموجة الأولى)
3. **بعدها:** ATS Checker على CV Builder
4. **بعدها:** Schema.org + technical SEO polish
