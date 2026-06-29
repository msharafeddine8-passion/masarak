# 🎓 Masarak — Content, Career-Guidance, UX & SEO Strategy
**A blueprint to turn masaraklb.com from a directory into the Arab world's #1 educational decision-making platform.**

> Grounded in the *actual* platform (Next.js 14 + Supabase): 234 universities (`universities_global`, pan-Arab), 63 scholarships, 32 majors, career data, and existing tools (Career DNA, CV builder, cost calculator, bac-equivalence, career-AI). Audience pivot: **Lebanon-only → all Arab students** (already wired: country-aware education system + Arab positioning).

---

## 0. Verdict & Scores (today)

| Dimension | Score | One-line |
|---|:---:|---|
| Content depth | **4/10** | Rich **listings**, almost no **explanatory / decision** content. |
| Career guidance | **3/10** | Career DNA test exists, but majors don't connect to careers/jobs/salary/future. |
| Student journey | **3/10** | Tools exist in isolation; no guided path from "lost" → "applied". |
| Decision support | **4/10** | Good raw data + a few tools; no synthesis ("what should *I* do?"). |
| SEO content | **3/10** | Directory pages indexable, but **zero high-intent informational content** ("how to study in Germany free"). Biggest missed growth lever. |
| Internal linking | **3/10** | Entities aren't cross-linked into journeys/clusters. |
| Emotional support | **2/10** | Nothing for anxiety, parental pressure, "I don't know what I want". |
| **Overall** | **3.5/10** | A solid *database*. Not yet a *guide*. The gap = the opportunity. |

**The core thesis:** Students don't search for "list of universities." They search *questions* ("can I study in Germany for free?", "what should I study if I like biology but not blood?"). Masarak ranks for almost none of these. Every section below converts the directory into **answers + a guided path + a decision**.

---

# PHASE 1 — Full Content Audit

## 1.1 What exists vs. what's missing

| Section | Exists today | Missing |
|---|---|---|
| Universities | List + country pages + `/[id]` + map (234, pan-Arab) ✅ | "How to choose", comparison guides, per-uni admission guidance |
| **Majors** | **Flat list only — NO detail pages** 🔴 | The entire career-mapping layer (Phase 3). Biggest gap. |
| Careers | `/careers/[slug]` detail + data ✅ | Salary by country, AI-impact, "day in the life", major→career links |
| Scholarships | List + tracker (63, all LB, **no slugs**) | Per-scholarship pages, "how to win", country/level filters, Arab-wide data |
| Study abroad | `/study-abroad/[country]` ✅ | "Free/cheap/no-IELTS" intent pages, step-by-step, visa, cost |
| Tools | DNA, CV, cover-letter, cost-calc, bac-equiv, career-AI, interview ✅ | Major-match, country-match, eligibility checker, admission estimator |
| Blog/Guides | `/blog/[slug]` (~12 hardcoded), `/guides/[slug]` | The 600-article SEO engine (Phase 4) |
| Emotional/support | — 🔴 | Anxiety, indecision, parental pressure, gap-year, failure-recovery |

## 1.2 The 8 audited gaps (problem breakdown)

| # | Gap | Symptom | Impact |
|---|---|---|---|
| 1 | **Student-journey flow** | Tools/pages are islands; no "start here → next step" | Students bounce; no progression |
| 2 | **Career-guidance content** | Majors ≠ careers ≠ salary ≠ future | Can't answer "where does this lead?" |
| 3 | **Decision-making content** | Data shown, never *synthesized* | "Which is right *for me*?" unanswered |
| 4 | **Emotional/support content** | Nothing on anxiety/pressure/uncertainty | Misses the real blocker (fear, not facts) |
| 5 | **High-traffic SEO topics** | No informational/intent content | ~0 organic discovery; total reliance on direct |
| 6 | **Internal linking** | Entities not woven into clusters | Weak SEO authority + dead-end pages |
| 7 | **Explanations vs. listings** | "Here are 234 unis" not "here's how to pick" | Looks like a directory, not a mentor |
| 8 | **Conversion paths** | No browse → decision → action funnel | High traffic (later) won't convert |

**Root pattern:** Masarak answers *"what exists?"* It must answer *"what should I do, and how?"*

---

# PHASE 2 — Student Journey System

A 7-stage guided path. Each stage = a **landing hub** + **tool** + **content** + **next-step CTA**, and writes to the student profile so the next stage is personalized.

| Stage | Student state | Masarak delivers | Primary tool | Exit CTA → |
|---|---|---|---|---|
| **0. Lost** | "I have no idea what to do" | Reassurance + orientation quiz | **Career DNA** + Major-Match | → Stage 1 |
| **1. Self-discovery** | "What am I good at / like?" | Personality + interests → major shortlist | Career DNA → majors | → Major pages |
| **2. Choose major** | "Which field?" | **Major career-maps** (Phase 3) | Major-Match test | → Country |
| **3. Choose country** | "Where?" | Country-Match (cost, language, visa, jobs) | Country-Match + cost-calc | → Universities |
| **4. Choose university** | "Which uni?" | Compare + admission fit | Compare + Admission estimator | → Scholarships |
| **5. Fund it** | "Can I afford it?" | Scholarship match + eligibility | Eligibility checker + cost-calc | → Apply |
| **6. Apply & prepare** | "How do I get in?" | Docs, CV, SOP, IELTS, **visa** | CV/cover-letter/interview + app-tracker | → Submitted ✅ |

**Mechanics:**
- A persistent **"Your Journey" progress bar** (0–6) on the dashboard, driven by profile signals (DNA done? major saved? country chosen? scholarships tracked?).
- Each stage page ends with **one** clear next action (no dead ends).
- "Resume where you left off" on return — already feasible via `student_profiles` + saved items.

---

# PHASE 3 — Career Mapping System (the flagship)

**Convert every major into a decision page.** This is the highest-value content+SEO+product move, and the biggest current gap (majors have no detail pages).

## 3.1 Per-major page schema (`/majors/[slug]`)

| Block | Content | Source |
|---|---|---|
| What is it? | Plain-Arabic explainer, "is this for you?" | New `majors` content |
| Skills required | Hard + soft skills checklist | Curated |
| Personality fit | RIASEC types that thrive (links to Career DNA) | Map to DNA `personality_type` |
| Subjects you'll study | Year-by-year overview | Curated |
| Careers after graduation | Job titles + links to `/careers/[slug]` | Link majors→careers |
| Salary ranges (global) | Entry/mid/senior by region (Gulf/Levant/Egypt/EU/NA) | New `salary_ranges` |
| Best countries | Where this major is strongest + affordable | Link to study-abroad |
| Related scholarships | Filtered by field | `scholarships.fields` |
| Related universities | Top unis offering it | `universities_global` |
| Future outlook | Demand trend + **AI impact** (🟢 grows / 🟡 shifts / 🔴 at-risk) | Curated, high-shareability |
| Decision CTA | "Take the Major-Match test" / "Compare countries" | Tool links |

## 3.2 Data model (additive — no breaking changes)

```
majors(id, slug, name_ar, name_en, category, summary_ar, skills[], riasec_types[],
       subjects[], ai_impact ENUM('grows','shifts','at_risk'), demand_score int,
       future_outlook_ar, status)
major_careers(major_id, career_slug)                  -- M:N → existing careers
major_salary(major_id, region, level, min, max, currency)
major_countries(major_id, country_code, rank_note)    -- "best countries"
-- scholarships/universities already filterable by field/country
```

## 3.3 Why this wins
- **SEO:** unlocks "career after [major]", "[major] salary", "is [major] worth it", "[major] vs [major]" — huge volume.
- **Product:** the missing bridge between *interest* (DNA) and *action* (apply).
- **Internal linking:** majors become the hub linking DNA → careers → countries → unis → scholarships.

---

# PHASE 4 — SEO Content Strategy (600 pieces)

**Approach:** programmatic clusters (templated, scalable) + flagship hand-written guides. Below: the **cluster system + formulas** (so the team can generate the exact counts) and the **highest-priority concrete titles** to write first. All Arabic-first, with English variants for hreflang later.

> Formula notation: `[Major]`×32, `[Country]`×~25 (Arab + top study-abroad), `[Level]` (BSc/MSc/PhD), `[Field]`.

## 4.1 — 300 high-traffic SEO articles (10 clusters)

| Cluster | Formula | Count | Sample titles (Arabic intent) |
|---|---|---:|---|
| Major → career | "ماذا بعد دراسة [Major]؟ الوظائف والرواتب" | 32 | "ماذا بعد الطب؟", "وظائف خريجي علوم الحاسوب" |
| Major worth-it | "هل تخصص [Major] له مستقبل؟ (2026)" | 32 | "هل الهندسة المعمارية لها مستقبل؟" |
| Major vs major | "[MajorA] أم [MajorB]؟ كيف تختار" | ~40 | "طب أم صيدلة؟", "CS أم هندسة برمجيات؟" |
| Salary | "كم راتب [Major] في [Region]؟" | ~40 | "رواتب المهندسين في الخليج" |
| AI impact | "هل الذكاء الاصطناعي سيلغي وظيفة [Career]؟" | ~30 | "هل AI سيلغي المحاماة؟" |
| "Best major for…" | "أفضل تخصص لمن يحب [interest]" | ~30 | "أفضل تخصص لمن يحب الأحياء", "...الرسم" |
| Admission/requirements | "شروط دراسة [Major] + المعدل المطلوب" | 32 | "شروط دراسة الطب في [country]" |
| Skills/prep | "مهارات لازمة لتخصص [Major]" | ~24 | "مهارات مهندس البرمجيات" |
| Day-in-the-life | "يوم في حياة [Career]" | ~20 | "يوم في حياة طبيب أسنان" |
| Decision/anxiety | "كيف تختار تخصصك دون ندم", "أنا تائه" | ~20 | (overlaps Phase 1 gap #4) |

## 4.2 — 100 "How to study in [Country]" guides

Per country (×~25), a **mini-cluster of 4**: `(1) دليل الدراسة في [Country]` · `(2) الدراسة في [Country] مجاناً / تكلفة` · `(3) الدراسة في [Country] بدون IELTS` · `(4) منح [Country] للعرب`. → 25 × 4 = **100**.

**Priority countries (write first):** ألمانيا (free!), تركيا, كندا, فرنسا, بريطانيا, أمريكا, ماليزيا, هولندا, إيطاليا, السويد, الإمارات, السعودية, قطر, مصر, الأردن, روسيا, المجر, بولندا.

**Highest-intent flagships (write week 1):**
- "كيف تدرس في ألمانيا مجاناً (خطوة بخطوة) 2026"
- "أرخص الدول للدراسة في الخارج للعرب"
- "الدراسة في الخارج بدون شهادة IELTS"
- "الدراسة في الخارج خطوة بخطوة: الدليل الكامل"
- "كيف تدرس في تركيا بمنحة كاملة"

## 4.3 — 100 scholarship search-intent articles

| Sub-cluster | Formula | Sample |
|---|---|---|
| By country | "منح دراسية في [Country] للعرب 2026" | "منح تركيا", "منح ألمانيا DAAD" |
| By level | "منح [بكالوريوس/ماجستير/دكتوراه] ممولة بالكامل" | |
| By nationality | "منح للطلاب [السوريين/اللبنانيين/المصريين/الفلسطينيين]" | high-intent, low-competition |
| Full-funding | "منح ممولة بالكامل بدون IELTS 2026" | |
| How-to | "كيف تكتب motivation letter للمنحة", "كيف تفوز بمنحة" | |
| Deadlines | "منح تنتهي هذا الشهر" (dynamic, uses tracker) | |

## 4.4 — 100 career-guidance articles

Per major/career: "ما هو تخصص [X]؟", "مجالات عمل [X]", "مستقبل [X] مع الذكاء الاصطناعي", "كيف تصبح [Career]", "الفرق بين [X] و [Y]". Maps 1:1 onto Phase 3 pages (each major page = an article that ranks).

> **Total: 300 + 100 + 100 + 100 = 600**, all expressible as ~15 templates × entity lists → fully programmable. Start with the ~40 flagships flagged above (hand-written, high-intent), then auto-scaffold the rest from the `majors`/`countries`/`scholarships` tables.

---

# PHASE 5 — UX / Platform Improvements

## 5.1 Missing pages
- `/majors/[slug]` (career maps — Phase 3) 🔴 top priority
- `/scholarships/[slug]` (per-scholarship + "how to win") + **backfill slugs**
- `/study-abroad/[country]/cost`, `/free`, `/no-ielts`, `/scholarships` (intent pages)
- `/start` — the Journey entry hub (Phase 2)
- `/support/*` — emotional/decision content hub
- `/compare` — universities/countries/majors side-by-side

## 5.2 Navigation (decision-first, not entity-first)
```
ابدأ رحلتك (Start)  |  اكتشف نفسك (DNA/Major-Match)  |  التخصصات والمهن
الدراسة بالخارج (by country)  |  المنح  |  الجامعات  |  الأدوات  |  المدوّنة
```
Today's nav lists *entities*; lead with the *decision* instead.

## 5.3 Filtering upgrades
- Universities: + country, language of instruction, tuition band, has-scholarships, ranking.
- Scholarships: + country, level, field, funding (full/partial), deadline, no-IELTS.
- Majors: + RIASEC fit, AI-impact, salary band, demand.

## 5.4 Recommendation system
- "Because you scored **Investigative** on Career DNA → these 5 majors / 3 countries / 8 scholarships."
- Powered by `personality_type` + saved items + country. Surfaces on dashboard + every entity page ("students like you also looked at…").

## 5.5 Internal linking strategy
- **Hub-and-spoke:** Major page = hub → links to its careers, salary, countries, scholarships, unis. Every entity links *back* to its major(s).
- Every blog article links to ≥3 relevant entity pages + 2 sibling articles.
- Auto "related" blocks from shared `field`/`country_code`/`riasec`.

## 5.6 Homepage redesign
Replace "directory of X" with a **decision flow**:
1. Hero: *"مش عارف شو تدرس؟ خلّينا نساعدك تقرر."* → Career DNA CTA.
2. 3 paths: "اكتشف تخصصك" / "ادرس بالخارج" / "دوّر على منحة".
3. "رحلتك" progress (for logged-in).
4. Social proof + trending guides (SEO internal links).

---

# PHASE 6 — Student Decision Tools

For each: **user flow · required data · UI · DB logic.**

### 1. Major Recommendation Test
- **Flow:** 12–15 Q (interests/strengths/work-style) → top-3 majors + fit %.
- **Data:** answers → RIASEC vector; `majors.riasec_types`.
- **UI:** one-question-per-screen, progress, result cards → major pages.
- **DB:** reuse Career DNA engine; `match = cosine(user_vector, major_vector)`; store on `student_profiles.personality_type` (already exists).

### 2. Country Matching System
- **Flow:** budget + language + field + priorities (cost/safety/jobs/visa-ease) → ranked countries.
- **Data:** `countries` (cost, language, visa-difficulty, post-study-work).
- **UI:** sliders + chips → ranked country cards with "why".
- **DB:** weighted score per country; needs a `country_facts` table (cost_band, langs[], visa_score, work_rights).

### 3. Scholarship Eligibility Checker
- **Flow:** nationality, level, GPA, field, IELTS? → "you qualify for N scholarships".
- **Data:** `scholarships` (+ add `min_gpa`, `nationalities[]`, `requires_ielts`, `level`).
- **UI:** short form → eligible list + "missing requirement" hints.
- **DB:** filter query; precompute eligibility count for the homepage.

### 4. Study Cost Calculator *(exists — upgrade)*
- **Add:** country + city + lifestyle → tuition + living + visa + flights; compare 2–3 countries; "with vs without scholarship".
- **DB:** `country_facts.living_cost`, `universities_global.tuition_min/max`.

### 5. Admission Probability Estimator
- **Flow:** GPA/grade + test scores + target uni → "likely / reach / safe".
- **Data:** `universities_global.acceptance_rate` + required grades (add `min_grade`).
- **UI:** gauge (green/amber/red) + "improve your odds" tips + scholarship cross-sell.
- **DB:** `band = f(student_grade vs uni_threshold, acceptance_rate)`; transparent heuristic (label clearly, not a guarantee).

---

# PHASE 7 — Content Gap Fix Plan (prioritized by SEO × user impact)

### 🔴 Week 1–2 — Foundations + quick SEO wins
1. **Ship `/majors/[slug]`** (Phase 3) for the top 10 majors (medicine, CS, engineering, business, law, pharmacy, dentistry, nursing, architecture, psychology). *(dev + content)*
2. **Backfill scholarship slugs** + ship `/scholarships/[slug]`. *(dev)*
3. Write the **~15 flagship guides** (Germany-free, cheapest countries, no-IELTS, step-by-step, top-5 scholarship-country pages).
4. **Major-Match test** (reuse DNA engine). *(dev)*
5. Internal-linking pass: majors ↔ careers ↔ unis ↔ scholarships.

### 🟠 Month 1 — Scale the engine
6. Remaining 22 major pages + their career/salary/AI-impact data.
7. Country mini-clusters for top 18 countries (×4 = 72 articles, templated).
8. Scholarship intent cluster (by country/level/nationality).
9. **Country-Match** + **Eligibility checker** tools.
10. Homepage redesign to decision-first.
11. Emotional/support hub (anxiety, indecision, parental pressure) — 10 articles.

### 🟢 Long-term — Authority & moat
12. Full 600-article programmatic rollout from templates.
13. Admission-probability estimator + `country_facts` dataset.
14. hreflang `/en/*` for English search demand.
15. UGC: student reviews/stories per uni/major (trust + fresh content).
16. Annual "State of Arab Student" data report (link-bait).

---

## Prioritized Roadmap (summary)

| Priority | Item | Type | Owner | SEO | UX |
|---|---|---|---|:---:|:---:|
| P0 | `/majors/[slug]` career maps (top 10) | Page+data | Dev+Content | ⭐⭐⭐ | ⭐⭐⭐ |
| P0 | 15 flagship study-abroad/scholarship guides | Content | Content | ⭐⭐⭐ | ⭐⭐ |
| P0 | Scholarship slugs + `/scholarships/[slug]` | Dev | Dev | ⭐⭐⭐ | ⭐⭐ |
| P0 | Major-Match test | Tool | Dev | ⭐ | ⭐⭐⭐ |
| P1 | Country clusters (18×4) + Country-Match | Content+Tool | Both | ⭐⭐⭐ | ⭐⭐⭐ |
| P1 | Decision-first homepage + Journey bar | UX | Dev+Design | ⭐ | ⭐⭐⭐ |
| P1 | Eligibility checker + cost-calc upgrade | Tool | Dev | ⭐ | ⭐⭐⭐ |
| P2 | Emotional/support hub | Content | Content | ⭐⭐ | ⭐⭐⭐ |
| P2 | Full 600-article programmatic rollout | Content | Content | ⭐⭐⭐ | ⭐ |
| P2 | Admission estimator + `country_facts` | Tool+Data | Dev | ⭐ | ⭐⭐ |
| P3 | hreflang `/en/*`, UGC reviews, data report | Growth | Both | ⭐⭐⭐ | ⭐ |

**North star:** every page should help a student take the *next decision* — and rank for the question that brought them there.
