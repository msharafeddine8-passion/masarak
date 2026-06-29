# Masarak (masaraklb.com) — Professional UX & Content Audit

**Auditor:** live walkthrough (logged in as the owner, msharafeddine8@gmail.com) + code review · **Date:** 2026-06-29
**Method:** Navigated the production site page-by-page in Chrome, read every screen's content word-by-word (DOM text, not just screenshots), tested interactive flows (Career DNA, dashboard, admin), checked the browser console for JS errors, then traced each finding to its exact source in the codebase.

> **Overall verdict: the platform is in genuinely good shape.** Content is rich, the Arabic (Lebanese dialect) is coherent and warm, the visual design is clean and consistent, core flows work, and there were **no JavaScript console errors** on any page tested. The issues below are almost entirely **consistency, copy-integrity, and "single-source-of-truth"** problems — polish, not breakage. None are critical/blocking.

---

## Scope audited (this pass)
Home · /universities (country-first) · /universities/lebanon · /scholarships · /study-abroad · /career-dna (started the test) · /careers · /vocational · /dashboard (student, as owner) · /admin/dashboard (executive overview).
**Not yet deep-audited** (recommend the same pass): /majors, /schools, /internships/hub, /cv, /profile (all tabs), /parent/*, /org/*, the remaining /admin tabs, /auth/* forms, /blog, /guides, individual university/scholarship detail pages, and the new (unmerged) /quiz/* + /quiz/progress.

---

## Findings (by theme, with exact code locations)

### A. Content integrity — fabricated testimonial vs. the "we don't fake things" promise  ⚠️ Medium
The homepage shows a specific 5-star testimonial — **"سارة ك. — طالبة طب، السنة الثانية · AUB"** ("مسارك ساعدني أختار جامعتي بثقة، واليوم بدرس الطب بـ AUB") — and then, a few sections lower, states: **«منصة جديدة — مش رح نخترع شهادات وهمية. قصص النجاح الحقيقية رح تظهر هون لما يستخدمو الطلاب المنصة.»** These two directly contradict each other and undercut the brand's honesty pitch.
- Source: `src/lib/i18n.tsx:263-264` (`home.testimonial.author` / `home.testimonial.role`); reused on the for-schools page at `:462-463` (`fs.t1.*`).
- Related fabricated/demo identities presented as if real: gamification leaderboard `src/app/gamification/page.tsx:44` ("سارة خوري", 1840 XP), school-admin roster `src/app/school-admin/page.tsx:18`, hardcoded university reviews `src/app/universities/data.ts:42`.
- **Fix:** remove the testimonial block (keep the honest "new platform" disclaimer — it's on-brand), and clearly label leaderboard/review demo data as "نموذج توضيحي" until real data exists.

### B. Inconsistent scholarship count — no single source of truth  ⚠️ Medium
The number of scholarships is stated **five different ways** across the site:
| Place | Says | |
|---|---|---|
| Admin → content inventory | **63** | ✅ the real DB count |
| Homepage stat | 63 / "60+" | ✅ correct |
| Scholarships page header | "80+ منحة متاحة" | ✗ overstated |
| Scholarships page filter | "تعرض 32 منحة" | (active/non-expired subset) |
| Dashboard tool + for-parents + for-universities + parent area | **"200+ منحة"** | ✗ ~3× overstated |
- Source of the inflated "200+": `src/lib/i18n.tsx` keys `fp.c3.d:488`, `fu.stat.scholarships:549`, `pa.sch.explore_d:1939`, `dash.q.schol.d:2145` (+ the English mirrors at `:2639/2700/4090/4296`).
- **Fix:** derive every public count from one source (a DB `count(*)` or a single shared constant) and correct "200+"/"80+" to the real number (~63). Inflated counts on a "بياناتك محمية / محتوى مدقَّق" platform are a credibility risk.

### C. Career DNA — inconsistent question count & duration  ⚠️ Low–Medium
- Duration: homepage & several pages say **"10 دقائق"** (`i18n` `home.dna.subtitle:232`, `dna.subtitle:1047`, `pt.dna.duration:1718`, `art.cta.subtitle:2075`), but the **/career-dna intro screen says "5 دقائق فقط"**.
- Question count: most places say **"20 سؤال"**, but the **dashboard onboarding step says "30 سؤال"**.
- **Fix:** standardize to the real values (20 questions; pick one honest duration) across i18n + the dashboard step copy.

### D. Careers page — "12" vs "37" on the same page  ⚠️ Low
`/careers` intro reads **"12 مسار مهني مفصّل"** while the page actually renders and counts **"37 مسار مهني"**.
- Source: `i18n` `car.subtitle:938` and `car.hero.subtitle:945` hardcode "12"; the data array has 37.
- **Fix:** make the headline count dynamic from the array length (and the same for any other "N items" headline).

### E. Scholarship data error — impossible minimum GPA  ⚠️ Medium
On /scholarships, **"منحة وزارة التربية - أوائل البكالوريا"** lists **"المعدل المطلوب: 18% فأكثر"** — nonsensical for a top-of-baccalaureate award (should be the top ranks, i.e. ~80%+ or "الأوائل").
- Source: scholarship seed in `src/app/universities/data.ts` (the وزارة التربية entry's `minGpa`).
- **Fix:** correct the value. Also worth a one-time sweep of all scholarship min-GPA/deadline fields for similar typos.

### F. Arabic plural grammar in deadline countdown  ⚠️ Low
Deadlines render as **"⚡ 1 أيام فقط"** and **"1 يوم"** — "1 أيام" is grammatically wrong (should be "يوم واحد"). Appears on /scholarships and the dashboard "مواعيد عاجلة".
- Source: `i18n` `sch.deadline.days_left = 'أيام فقط':816` used as `{n} أيام فقط` with no singular/dual handling.
- **Fix:** apply Arabic plural rules — 1 → "يوم واحد", 2 → "يومان", 3–10 → "N أيام", 11+ → "N يوماً".

### G. Hardcoded sections vs. admin "0" counts (manageability)  ⚠️ Low–Medium
`/careers` (37 paths) and `/vocational` (18 paths + 10 institutes) are rich and accurate, but the content is **hardcoded in the app**, so the admin "content inventory" reports **"مسارات مهنية: 0"** and **"معاهد مهنية: 0"**. The admin can't edit them, and the 0s are misleading.
- **Fix (either):** reflect the real (hardcoded) counts in the admin tile, or migrate this content into the DB so it's both counted and editable. At minimum, don't show a misleading "0".

### H. Top navigation overflows at common laptop widths  ⚠️ Low–Medium
At ~1510px the header nav is too crowded: an overflow chevron (›) appears and "التعليم المهني" / "المسارات المهنية" wrap onto two lines. Consistent across pages (logged-in state adds the user block, making it worse).
- **Fix:** collapse secondary items into the existing "المزيد ▾" menu at a higher breakpoint, or reduce the top-level item count so the bar fits ~1280–1536px without wrapping/scroll.

---

## What works well (verified live)
- **Universities** — country-first hub (257 unis, Lebanon kept at its rich 35-uni guide with QS Arab 2026 ordering, filters, sort, compare-up-to-3). Strong.
- **Study-abroad guide** — comprehensive, accurate, evergreen (8 steps, funding types, language tests, documents, destinations, FAQ). Excellent.
- **Scholarships** — 32 detailed, well-categorized cards (local + international), with a "which scholarships fit me?" finder.
- **Careers / Vocational** — deep, realistic Lebanon + Gulf salary data; genuinely useful.
- **Career DNA** — RIASEC test starts cleanly (Likert scale, progress bar, typed questions).
- **Student dashboard** — personalized (DNA path, profile %, saved items, urgent deadlines, recommendations).
- **Admin executive overview** — real RPC-backed KPIs (users, retention, revenue, content inventory, growth, alerts); the super-admin gate works.
- **No console JS errors** on any page tested; good SEO `<title>`s; clean RTL; cohesive design system.

---

---

## Round 2 (continuation pass)
Additional pages audited: **/majors, /schools, /tools (hub), /tools/cv-builder**.

- **/majors — clean ✅.** 32 majors with demand/salary (Lebanon + Gulf)/difficulty/top-unis/career-paths. Header "32 تخصص" **matches the admin/DB count** — this is the *correct* pattern (DB-backed, single source of truth). **Recommendation: make /careers and /vocational follow /majors' DB-backed model** (fixes findings B/D/G at once).
- **/schools — clean ✅.** Header "30 مدرسة" matches admin (30). Rich (type/region/curriculum/fees).
  - *(I) Minor data nit:* "ثانوية الجمهور الرسمية" is filed under **بيروت**, but Jamhour is in **جبل لبنان** (Mount Lebanon). One-line region fix.
- **/tools hub — all 5 tool links present** and route correctly: `/career-dna`, `/tools/cv-builder`, `/tools/cost-calculator`, `/tools/interview-prep`, `/tools/skill-strengths`, `/tools/career-ai`.
- **/tools/cv-builder — works ✅.** Full builder (4 templates, 5 sections, "✨ AI Improve", Live Preview, Export PDF). *(Note: a PDF-export bug — losing name/country/DNA from wrong columns — was just fixed on the parallel `fix/live-audit-batch3` branch; not yet deployed.)*
- *Correction:* `/cv` returns 404, but **nothing links to it** (it was an audit guess, not a real broken link). The real path is `/tools/cv-builder`. **Not a finding.**

**/profile (overview tab)** — renders well (level, XP, completion, 10 tabs, tasks, roadmap), but surfaced two new issues:
- **(J) Career DNA result is inconsistent across pages**  ⚠️ Medium — the **same logged-in user** shows a completed DNA ("إدارة الأعمال") on `/dashboard`, but `/profile` shows **Career DNA "–"** (none). The two screens read the DNA from different sources. *This looks like the same identity/data-source drift the parallel `fix/live-audit-batch3` branch is already addressing (user_profiles consolidation) — verify the profile reads the same source as the dashboard.*
- **(K) Settings button glyph**  ⚠️ Low — the settings action renders as "⚹️" (sextile) rather than "⚙️" (gear) in the DOM text; check the character used for that button.

**Still not audited** (recommend a 3rd pass before launch): the other /profile tabs (academic/identity/settings forms), /internships/hub, /blog, /guides, individual university & scholarship detail pages, /parent/* and /org/* dashboards, the remaining /admin tabs, /auth/* forms, and the new (unmerged) /quiz/* + /quiz/progress.

---

## Prioritized fix list
1. **(B) Unify the scholarship count** to the real number from one source — kill every "200+"/"80+".  *(credibility)*
2. **(A) Remove the fabricated "سارة ك." testimonial** (and label demo leaderboard/reviews).  *(integrity)*
3. **(E) Fix the "18%" scholarship GPA** + sweep scholarship numeric fields.  *(data accuracy)*
4. **(C) Standardize Career DNA** to 20 questions + one duration everywhere.
5. **(F) Arabic singular/dual** in the deadline countdown.
6. **(D) Make the careers headline count dynamic** (12 → 37).
7. **(H) Fix nav overflow** at laptop widths.
8. **(G) Reconcile admin "0" counts** for careers/vocational.

*All of A–H are copy/data/CSS changes — low-risk, high-polish. Recommended next: extend this same word-by-word pass to /profile, /majors, /cv, the parent/org/admin sub-pages, and the auth forms.*

---

## Resolution status — branch `fix/ux-audit-polish` (2026-06-29)

| # | Finding | Status | What changed |
|---|---|---|---|
| **A** | Fabricated "سارة ك." testimonial | ✅ Fixed | Testimonial `<section>` removed from `src/app/page.tsx`; the honest "منصة جديدة — مش رح نخترع شهادات وهمية" note stays. |
| **B** | Inflated scholarship count ("200+"/"80+") | ✅ Fixed | All "200+" → "60+" in `i18n.tsx` (AR + EN mirrors); the /scholarships header already renders the **real** merged DB count (`{scholarships.length}+`), so it's left dynamic. |
| **C** | Career DNA count/duration drift | ✅ Fixed | "10 دقائق" → "5 دقائق" (4 i18n keys), "30 سؤال" → "20 سؤال" in `dashboard/page.tsx` + `career-dna/layout.tsx` metadata. Canonical = **20 questions / 5 min** (matches the test's own intro screen). |
| **D** | Careers "12" vs 37 | ✅ Fixed | Dropped the wrong hardcoded number: "12 مسار مهني مفصّل" → "مسارات مهنية مفصّلة" (AR + EN). Removed rather than re-hardcoding 37 so the array can grow without re-introducing drift. |
| **E** | Impossible 18% min-GPA | ✅ Fixed (DB) | The live value was in the **`scholarships` table** (id 126, "منحة وزارة التربية - أوائل البكالوريا"), not the seed file — `min_gpa` 18 → 85 via SQL. |
| **F** | "1 أيام" plural grammar | ✅ Fixed | Added `sch.deadline.urgent_one` ("يوم واحد فقط" / "1 day left"); `/scholarships` uses it when `days === 1`. |
| **H** | Top-nav overflow at laptop widths | ✅ Fixed | `SiteHeader.tsx`: secondary destinations (schools, internships, careers, vocational) grouped into a new **"استكشف / Explore"** dropdown → 6 inline items instead of 10; desktop nav now appears at `xl` (below that the clean mobile menu is used). **Bonus:** study-abroad + Explore destinations are now reachable in the mobile menu (they were previously desktop-only). |
| **I** | Jamhour mis-regioned | ✅ Fixed | `schools/data.ts` id 3: region بيروت → **جبل لبنان**; description corrected to match. |
| **K** | Settings glyph ⚹️ vs ⚙️ | ✅ Fixed | `prof.btn.settings` (AR + EN): sextile "⚹️" → gear "⚙️". |
| **G** | Admin "0" for careers/vocational | ⏸️ Deferred | Architecture choice (reflect hardcoded counts vs. migrate to DB like /majors). Non-blocking; tracked for a follow-up. |
| **J** | DNA result drift dashboard vs profile | ⏸️ Deferred | Belongs to the parallel `fix/live-audit-batch3` user-profile consolidation already in flight — verify both screens read the same source there. |

Build-verified (`next build`, dummy env) before commit. G and J are intentionally left for follow-up work as noted above.
