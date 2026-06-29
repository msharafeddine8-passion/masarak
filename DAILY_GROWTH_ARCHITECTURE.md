# Masarak Daily Growth — Adaptive Learning System Architecture

**Author:** Lead Product Architect pass · **Date:** 2026-06-27
**Goal:** evolve Masarak's existing quiz engine into an enterprise-grade adaptive daily-learning
system (Duolingo / Brilliant / Elevate class) for the Arab world — Arabic-first, RTL, scalable to millions.

> **Posture:** This is an *evolution of a live engine*, not a greenfield build. ~65% of the
> foundation already exists and works. We extend it in verified, production-safe, additive
> increments. No rip-and-replace of a running system.

---

## 1. What already exists (the engine is real)

| Capability | Where | Notes |
|---|---|---|
| Question bank | `quiz_questions` | 140 active Qs, 9 subjects, 89 skill codes; stem/options/correct_index/explanation/hints/difficulty/grade_level/cognitive_skill/tags/stem_hash + quality telemetry |
| Daily session | `quiz_daily_sessions` + `GET /api/quiz/today` | idempotent per day, history-aware, SRS-due injection, subject balancing, 10 Q/day |
| Grading + adaptation | `POST /api/quiz/submit` | server-side truth, anti-cheat (<500ms→wrong), **SM-2 spaced repetition**, per-skill mastery (EMA 70/30), adaptive difficulty 1–10 |
| Learning history | `quiz_user_history` | per-answer: correct, time_ms, hint, srs_interval, ease_factor, next_review_at |
| Skill mastery | `quiz_user_skill` | mastery_score, attempts, correct_streak, current_difficulty, last_seen |
| Gamification | `quiz_gamification` + `quiz_badges`/`quiz_user_badges` | XP, level `√(xp/50)`, streak + milestones (3/7/14/30/100), weekly XP |
| Dashboards | student `/dashboard`, parent `/parent/student/[id]`, `/profile` achievements | profile %, XP, level, streak, academic info |

**Redundant legacy path to retire:** `challenges` + `user_challenges` + `user_stats` +
hardcoded 40-Q `/app/tools/daily-challenge` (localStorage streak). Overlaps `quiz_*`.

## 2. Gap vs. the vision

1. **Content volume** — 140 → 20,000+. *This is a pipeline problem, not a schema problem.*
2. **Taxonomy** — 9 subjects → 40 categories. ✅ **(Phase 1 done)**
3. **Question fields** — added reference, estimated_time_sec, country, subcategory, image/video, version, updated_at. ✅ **(Phase 1 done)**
4. **Adaptive selection depth** — today uses history + SRS + subject balance. Must also weight:
   age, grade, country, preferred language, **Career DNA**, interests, weak vs. strong skills.
5. **Two parallel systems** — unify on `quiz_*`, retire `challenges`/`user_stats`.
6. **Analytics** — category performance, knowledge-growth curve, weak/strong topics, monthly progress.
7. **Missions** — currently hardcoded; make data-driven daily missions.

## 3. Target adaptive algorithm (Phase 2 — the core IP)

A personalized daily pool of N questions, composed by weighted strata so it **never feels random**:

```
session(user) =
   SRS_DUE        (≤30%)  -- quiz_user_history.next_review_at <= today, highest priority
 + WEAK_SKILLS    (≤30%)  -- quiz_user_skill.mastery_score low → reinforce
 + DNA_INTEREST   (≤20%)  -- categories aligned to Career DNA (RIASEC) + saved interests
 + GROWTH_EDGE    (≤15%)  -- one notch above current_difficulty (Vygotsky ZPD)
 + DISCOVERY      (≤5%)   -- new category the student hasn't touched (breadth)
```

Hard filters applied to every stratum:
- `language` ∈ {student.preferred_language, universal}
- `grade_level` within ±1 of student grade (or NULL = any)
- `country` ∈ {student.country, NULL} (NULL = universal)
- exclude last-90-day `quiz_user_history` unless SRS-scheduled
- `status='active'` only

Implemented as a `SECURITY DEFINER` SQL function `quiz_build_session(p_user, p_size)` so
selection is one round-trip, testable, and reusable by the API + cron.

## 4. Content strategy — how to reach 20k responsibly

Nobody hand-authors 20k accurate questions, and **auto-publishing LLM questions to students is
unsafe** (subtle factual errors). The enterprise pattern is a **generate → review → publish**
pipeline:

1. **Generate** in bulk via an LLM authoring job, constrained by (category, grade, language,
   difficulty, country) and required to emit the full schema incl. `reference` + `explanation`.
   Land as `status='draft'`.
2. **Auto-QA** — dedup via `stem_hash`, validate exactly one correct option, answer-position
   balance, reading-level/length checks → `status='review'`.
3. **Human/admin approval** in an admin queue → `status='active'`. Only active questions are served.
4. **Live quality loop** — `flagged_count`, low `times_correct/times_shown`, and report button
   demote questions back to `review`.

This scales to millions while keeping a student-safe accuracy bar.

## 5. Phased roadmap (each phase: build-verified + committed)

- **Phase 1 — Schema + taxonomy.** ✅ DONE. 8 new fields + 40-category taxonomy (`quiz_categories`).
- **Phase 2 — Adaptive engine v2.** ✅ DONE. `quiz_build_session()` (6 weighted strata: SRS/weak/DNA/growth/discovery/fresh) wired into `/api/quiz/today`; `quiz_dna_categories` RIASEC→category map; verified on a real user. Build green.
- **Phase 3 — Content.** ✅ ALL 42 CATEGORIES COVERED. Bank grown **140 → 542** active questions (+402) across **every** category (academic / tech / guidance / career / thinking / wellbeing), authored by 8 parallel LLM agents under strict rules (factual, one correct answer, randomized position, Arabic-first), validated + deduped by `stem_hash`. The final 156-question round landed at a 25/27/25/23 answer-position distribution. Obsolete `lang_subject_match` CHECK retired. **Remaining (polish):** draft→review→active admin review queue; render-time option-order shuffle for the earlier sciences batch (index-1 lean); ongoing volume growth toward the 20k goal via repeat authoring rounds.
- **Phase 4 — Analytics.** ✅ DONE (student). `quiz_user_analytics(p_student)` RPC (overall accuracy/speed, per-category performance, strong/weak skills, 30-day growth; self/linked-parent/admin authz) + `/quiz/progress` page (RTL, Arabic-first) linked from the quiz hub. Build green, verified on a real user. **Remaining:** embed the same view in the parent student-detail page (RPC already supports `?student=`).
- **Phase 5 — Retire legacy.** ✅ DONE. `/tools/daily-challenge` (304-line hardcoded + localStorage) → server redirect to `/quiz/today`. Legacy `challenges`/`user_challenges`/`user_stats` tables left dormant (no data loss).
- **Phase 6 — Engagement.** ✅ DONE (daily missions). `quiz_daily_missions()` RPC derives today's 4 missions live from real activity (complete session / answer 10 / 5 correct / practice a weak skill), rendered on `/quiz/today` with progress bars. *(Remaining engagement polish: leaderboards, parent weekly digest, dynamic badge unlocks.)*

### Remaining polish (not phase-blocking)
- Option-order shuffle at render (the legacy 140 Qs are 100% index-0; the sciences batch leans index-1) — must map the displayed index back to `correct_index` on submit, so it's careful surgery on the grading path.
- Admin review queue UI (draft→review→active); the `status` field already supports it.
- Ongoing content growth toward 20k via repeat authoring rounds.

## 6. Data model after Phase 1

`quiz_questions` (27 cols): id, subject*, language, difficulty, grade_level, skill_code,
cognitive_skill, stem, stem_hash, options, correct_index, explanation, hints, tags,
**subcategory, reference, estimated_time_sec, country, image_url, video_url, version, updated_at**,
times_shown, times_correct, status, flagged_count, created_at. *(`subject` = `quiz_categories.code`.)*

`quiz_categories` (new): code, name_ar, name_en, domain, icon, sort_order, is_active.
