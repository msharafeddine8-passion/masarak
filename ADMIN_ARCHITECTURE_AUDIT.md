# Masarak — Platform Architecture & Roles Audit
**Auditor:** Lead Architect pass · **Date:** 2026-06-27 · **Scope:** roles, permissions, dashboards, navigation, data flow, RLS, middleware, APIs.
**Method:** grounded in the actual code (`src/middleware.ts`, `src/lib/permissions/*`, `src/app/admin/dashboard/*`, `src/app/org/*`, `src/lib/org.ts`, Supabase RLS). No findings are assumed; each traces to a file.

> ⚠️ **Posture:** This is the **audit + target architecture + staged plan**. The redesign/event-bus/centralization (Steps 3–4–6) is a multi-phase build executed in verified, compatibility-preserving increments — **not** a blind rip-and-replace of a live system.

> ✅ **UPDATE 2026-06-27 — Authz spine (P0) RESOLVED & verified.**
> - **S1 (role escalation) — CLOSED.** Authorization now reads `app_metadata` (server-only): middleware admin gate + `is_super_admin()`/`is_admin()` ignore `user_metadata.role`. All existing users backfilled; new signups stamped by the `sync_signup_role` BEFORE-INSERT trigger (forces `student`/`parent` only). A `guard_role_columns` trigger blocks direct role-column writes by non-super-admins.
> - **S2 (hardcoded email) — CLOSED.** The literal owner email now appears in **exactly one** place — `is_super_admin()`. **0** RLS policies and **0** other functions reference it (was ~48 policies + 5 functions). Everything flows through `is_super_admin()` / `is_admin()`.
> - **Co-admin tier — LIVE.** `is_admin()` = super admin **+** helper admins (`app_metadata.role='admin'`). RLS tiered: 8 finance/subscriber-PII tables (`subscriptions`, `sponsor_applications`, `student_profiles`, `profiles`, `user_profiles`, `newsletter_subscribers`, `team_members`, `admin_actions`) stay super-only; operational/content tables are co-admin-accessible.
> - **Hardening.** Pure trigger functions + admin-mgmt RPCs had their blanket `PUBLIC` EXECUTE grant revoked (verified). Cron service-role clients made lazy (fail-closed 503). Middleware drops the per-request `org_members` query for authoritative students.
> Remaining linter WARNs are by-design (public submission forms; anon signup/public-profile RPCs; auth-guarded admin RPCs) plus one dashboard toggle (leaked-password protection).

---

## 0. Executive Summary — the one thing to understand

You asked about **11 roles**. In the code there are effectively **4 real principals**, gated **3 inconsistent ways**, plus a **clean permission system that is barely wired in**:

| Stated role | Reality in code |
|---|---|
| Super Admin | ✅ exists — but as a **single email allowlist** (`ADMIN_EMAILS` env, fallback `msharafeddine8@gmail.com`) |
| University / School / Vocational Admin | ⚠️ **one shared `/org/dashboard`** + `org_members.role` (owner/editor/viewer). No per-type dashboard. |
| Student | ✅ default (anyone authenticated who isn't parent/org/admin) |
| Parent | ✅ `user_metadata.role === 'parent'` |
| Sponsor | ❌ role defined in `capabilities.ts`, **no dashboard, no portal** — only a `SponsorsCenterTab` inside super-admin |
| Content / Marketing / Support / Finance Admin | ❌ **do not exist as roles** — they are *tabs* inside the single super-admin dashboard, visible to anyone on the email allowlist |

**Three competing authorization mechanisms that don't agree:**
1. **Middleware** (`src/middleware.ts`): reads `session.user.user_metadata.role` (strings: `parent`/`counselor`/`school_admin`) + `ADMIN_EMAILS` + a live `org_members` query **on every request**.
2. **Database RLS**: `is_org_manager(org_id)` + a **hardcoded super-admin email** baked into policies (e.g. `org_leads.leads_org_read`, `universities_global` admin policy).
3. **`src/lib/permissions/can.ts`**: a clean capability model (`student | parent | org_owner | org_editor | sponsor | super_admin`) that **self-describes as "the single source of truth"** but is imported in only ~5 files — **effectively dead code.**

Everything below expands this with evidence and a fix path.

---

## Report 1 — Architecture

**Stack:** Next.js 14 App Router + Supabase (Postgres + Auth + Storage) + Vercel. Client-component-heavy dashboards; Supabase JS client called directly from components.

**Findings**
- **A1 (High) — No single authz source.** Three mechanisms (above) with **two different role vocabularies**: middleware/`user_metadata` uses `parent|counselor|school_admin|student`; `capabilities.ts` uses `org_owner|org_editor|sponsor|super_admin`. They never reconcile. A change in one is invisible to the others.
- **A2 (High) — The centralized permission layer is dead.** `lib/permissions/{can,capabilities}.ts` is the *correct* design but is referenced in ~5 files only; real gating is ad-hoc per page + RLS. The intended architecture exists on paper (`docs/ARCHITECTURE.md` is referenced) but was never adopted.
- **A3 (Med) — Org dashboard is multi-tenant by type but single-surface.** `/org/dashboard` serves university **and** school **and** vocational admins from one component; the org "type" only changes labels. Per-type widgets/reports don't exist.
- **A4 (Med) — Admin "centers" are presentation-only roles.** `admin/dashboard/page.tsx` wires 24 tabs (Students, Revenue, Subscriptions, Marketing, Support, SEO, Scholarships, …) behind **one** email gate. The org-facing "admin sub-roles" the business wants (Finance/Marketing/Support/Content) have no isolation.
- **A5 (Low) — Orphaned/duplicate surfaces.** `_tabs/UniversitiesTab.tsx`, `SchoolsTab.tsx`, `DashboardTab.tsx` are not imported anywhere (superseded by `*CenterTab`). `careers_center` is in the `V` union type but absent from `NAV` and the render switch. `/admin/orgs`, `/admin/partnerships`, `/admin/data-flow`, `/admin/orgs/invite` exist but are **not linked** from the admin sidebar.

---

## Report 2 — Security (most important)

- **S1 (CRITICAL) — Authorization role stored in `user_metadata`.** Middleware trusts `session.user.user_metadata.role` for parent/counselor gating. In Supabase, `user_metadata` (`raw_user_meta_data`) is **writable by the user** via `supabase.auth.updateUser({ data: { role: … } })`. A student could attempt to set their own role. **Authorization must live in `app_metadata`** (server-only) or a `profiles.role` column protected by RLS — never `user_metadata`.
- **S2 (High) — Super-admin identity hardcoded in ≥3 layers.** `middleware.ts` (`ADMIN_EMAILS` fallback), `capabilities.ts` (`ADMIN_EMAIL`), and **RLS policies** (`(auth.jwt()->>'email') = 'msharafeddine8@gmail.com'`). Rotating/adding an admin means editing code **and** DB policies. Should be a `super_admin` flag in `app_metadata` or an `admins` table referenced by a SQL helper (`is_super_admin()`).
- **S3 (High) — Admin gate is binary + client-rendered.** All 24 admin centers (incl. Revenue/Finance/Subscriptions = money data) are visible to **any** email on the allowlist. There is no least-privilege split; a "Support Admin" would see full revenue. Also `admin/dashboard/page.tsx` is a client component — the middleware email check is the *only* gate; if a tab fetches with the anon client, RLS is the real backstop (verify each center's queries are RLS-safe, not service-role on the client).
- **S4 (Med) — Middleware hits the DB every request.** `org_members` is queried in middleware for every protected navigation → latency + load, and runs even for admins/students who'll never match. Cache the principal in the JWT/app_metadata instead.
- **S5 (Med) — Verify no service-role key reaches the client.** `api/cron/scholarship-reminders` builds a service-role client at **module scope** (`SUPABASE_SERVICE_ROLE_KEY!`); confirm service-role usage is server-only (API routes), never bundled into a client component.
- **S6 (Low) — RLS reviewed for org tables is sound** (`org_affiliations`, `org_media`, `org_announcements`, `org_scholarships`, `org_leads` all gate writes by `is_org_manager`, reads by manager-or-public-verified). Good baseline — extend the same rigor to every admin-center table.

---

## Report 3 — Roles (current)

| Role (real) | Source of truth | Dashboard | Notes |
|---|---|---|---|
| Super Admin | email allowlist (env + hardcoded) | `/admin/dashboard` (24 tabs) | not a DB role |
| Org Owner/Editor/Viewer | `org_members.role` | `/org/dashboard` (shared all org types) | RLS via `is_org_manager` |
| Parent | `user_metadata.role='parent'` | `/parent/dashboard` | client-writable source (S1) |
| Counselor | `user_metadata.role='counselor'/'school_admin'` | `/counselor/dashboard` | undocumented 5th principal |
| Student | default | `/dashboard` | |
| Sponsor | — (capability only) | **none** | portal missing |
| Finance/Marketing/Support/Content | — | **none** | tabs only |

---

## Report 4 — Permission Matrix (target, from `capabilities.ts` + gaps)

`capabilities.ts` already encodes a good base matrix (student/parent/org_owner/org_editor/sponsor/super_admin → `domain.action.scope` caps). Gaps vs. the 11-role goal:
- No `counselor` capabilities (exists in middleware, absent from matrix).
- No admin sub-roles (`finance_admin`, `marketing_admin`, `support_admin`, `content_admin`) — super_admin is all-or-nothing (`'*'`).
- `org_owner` vs `org_editor` differ only by `view.org.students`/`leads`/`invite` — fine, keep.
- **The matrix is correct but unenforced** (Report A2). The fix is adoption, not redesign.

---

## Report 5 — Dashboard Matrix

| Dashboard | Route | Audience | Shows another role's data? | Issues |
|---|---|---|---|---|
| Super Admin | `/admin/dashboard` | email allowlist | n/a (sees all by design) | 24 tabs, no sub-role split; 3 dead tab files; 4 unlinked admin pages |
| Org | `/org/dashboard` | org_members | No (RLS-scoped to own org) | shared across univ/school/vocational; verified OK |
| Parent | `/parent/dashboard` | parent | linked-student only (verify RLS on student reads) | role source = user_metadata (S1) |
| Counselor | `/counselor/dashboard` | counselor/school_admin | verify scoping | undocumented |
| Student | `/dashboard` | authenticated | self only | |
| Sponsor | — | — | — | **missing** |

No dashboard was found leaking cross-tenant org data — org tables are RLS-scoped. The **real exposure risk is admin centers** (Report S3): confirm each `*CenterTab` query is RLS-enforced for the anon client and not relying on "the email gate already passed."

---

## Report 6 — API

Grounded sample (full sweep pending): `api/admin/ai-briefing`, `api/org/redeem-signup`, `api/cron/scholarship-reminders`.
- **API1 (Med)** — No central `getUserContext(req)` → `mustCan(...)` guard. API routes should resolve the principal once and call `mustCan()` (the dead `can.ts`) at the top. Today protection is implicit (RLS) — good as a backstop, weak as the primary gate for service-role routes.
- **API2 (Med)** — `scholarship-reminders` instantiates the service-role client at module scope; it throws at build without the key (already worked around in `next.config`) and is a footgun — lazy-init inside the handler.
- **API3** — Recommend a typed API wrapper: `withAuth(capability)(handler)` that injects `user` + enforces `mustCan`.

---

## Report 7 — Database

- **DB1 (Good)** — Org domain is cleanly normalized: `organizations` → `org_members`, `org_media`, `org_events`, `org_announcements`, `org_scholarships`, `org_affiliations`, `org_leads`. FKs + unique constraints present (e.g. `org_leads (org_id, student_id)` unique; used for upsert).
- **DB2 (Med)** — **Two universities tables**: legacy `universities` (Lebanon, rich, org-linked via `entity_id`) and `universities_global` (222 global rows). Verification/orgs only attach to the legacy table. Intentional today, but document it; a global org-claim flow will need `universities_global` parity.
- **DB3 (Med)** — `org_leads.student_id` → **`auth.users`** (not `student_profiles`); the leads UI joined `student_profiles.id` (wrong key) — **fixed this session** to join `user_id`.
- **DB4 (Med)** — Authz email hardcoded in RLS (S2). Replace with `is_super_admin()` SQL helper reading `app_metadata`/`admins` table.
- **DB5 (Perf)** — Add/verify indexes for every admin-center list query (status + created_at). Middleware `org_members` lookup (S4) should be cache/JWT-backed, not per-request.
- **DB6 (N+1 risk)** — Client dashboards fan out multiple sequential Supabase calls (e.g. CampusLife does 6 parallel — fine; verify admin centers aren't doing per-row lookups).

---

## Report 8 — Missing Features

1. **Sponsor portal** (`/sponsor/dashboard`) — role exists, surface doesn't.
2. **Per-org-type dashboards** (university vs school vs vocational widgets/reports).
3. **Admin sub-roles** (finance/marketing/support/content) with least-privilege tab access.
4. **Event-driven updates** — no event bus; dashboards are pull-only (Report Step 4 below).
5. **Centralized notifications/analytics/logging** — `lib/notify.ts` exists; not unified with events.
6. **Parent↔student** verified data scoping report (confirm linked-only reads).
7. **Global university org-claim** parity with `universities_global`.

---

## Report 9 — Bugs Fixed (this session, on `feat/scholarship-filters`)

1. **Campus-life videos never rendered** — `CampusLife` filtered `photo` only; videos now embed (YouTube/Vimeo/native).
2. **Logo/banner couldn't be set** — URL-only inputs → real `ImageUploader` (device upload to storage).
3. **Verified badge invisible externally** — now shown on the university **list** cards via `fetchVerifiedEntityIds`.
4. **Affiliation requests didn't appear as leads** — DB trigger turns each affiliation into an `applied` lead (+ backfill); fixed leads join (`id`→`user_id`) so names resolve.
5. **No back button** on org dashboard — added.
6. **Scholarships + news** — new `org_scholarships` table + dashboard tab + public render; announcements relabelled "الأخبار والإعلانات".

---

## Report 10 — Recommendations / Scalability (priority order)

**P0 — Security & single source of truth**
1. Move authorization role out of `user_metadata` → `app_metadata` (server-set) or `profiles.role` (RLS-protected). [S1]
2. Replace hardcoded super-admin email everywhere with `is_super_admin()` (SQL) + `app_metadata.super_admin`. [S2]
3. **Adopt `lib/permissions/can.ts` as the real gate**: a `getUserContext()` resolver (1 query, cached) feeding `can()`/`mustCan()` in middleware, pages, and API routes. Kill the divergent `user_metadata` strings. [A1/A2]

**P1 — Roles & dashboards (Step 3)**
4. Introduce admin **sub-roles** (`finance|marketing|support|content`) as capability sets; filter the 24-tab `NAV` by capability so each admin sees only their centers. One dashboard shell, capability-filtered — not 11 copies.
5. Ship a **Sponsor portal**; split org dashboard widgets by `org_type`.

**P2 — Event-driven core (Step 4) + centralization (Step 6)**
6. Central `emitEvent(type, payload)` → fan-out to: DB projections, `analytics_events`, `org_leads` scoring, notifications, dashboard cache invalidation. (Today only `affiliation→lead` exists, added this session — generalize it.)
7. Centralize notifications (`lib/notify.ts`), analytics, and an `audit_log` writer behind the event bus.

**P3 — Cleanup & perf**
8. Delete dead `*Tab.tsx` (Universities/Schools/Dashboard), the `careers_center` union member; link or remove `/admin/orgs|partnerships|data-flow`.
9. Remove the per-request `org_members` query from middleware (JWT-cache the principal).
10. `withAuth(capability)` API wrapper; lazy service-role init.

---

## Target Architecture (Steps 3–4–6) — staged execution plan

**Phase 1 — Authz spine (P0):** `app_metadata.role` + `is_super_admin()` + `getUserContext()` + adopt `can()` in middleware & 3 highest-risk API routes. Backwards-compatible (read old `user_metadata` as fallback during migration). *Each step build-green + committed.*

**Phase 2 — Capability-filtered admin + sub-roles (P1):** drive the admin `NAV` from capabilities; add finance/marketing/support/content cap sets; least-privilege.

**Phase 3 — Sponsor portal + per-type org dashboards (P1).**

**Phase 4 — Event bus (P2):** `domain_events` table + `emitEvent()` + projection handlers; migrate `affiliation→lead` onto it; add save/view/apply/campaign events feeding analytics + notifications + dashboards.

**Phase 5 — Centralization & cleanup (P2/P3):** unify notifications/analytics/audit; delete dead code; perf.

**Event catalog (Phase 4 target):**
| Event | DB | Analytics | Notify | Dashboards updated |
|---|---|---|---|---|
| `student.viewed_university` | `analytics_events` | +1 view | — | org analytics, lead score |
| `student.saved_university` | `org_leads` upsert | +1 save | org owner | org leads, student saved |
| `student.completed_dna` | `student_profiles` | dna stats | parent (if linked) | student, parent, admin DNA center |
| `org.published_event` | `org_events` | — | affiliated students | org page, student feed |
| `student.applied_affiliation` | `org_leads` (✅ live) | +1 applied | org owner | org leads + students tab |
| `parent.linked_student` | `parent_links` | — | student | parent dashboard |
| `sponsor.created_campaign` | `sponsor_campaigns` | — | admin | sponsor + admin revenue |
| `org.added_scholarship` | `org_scholarships` (✅ live) | — | affiliated students | org page, scholarships finder |

---

*This audit is grounded in the current `feat/scholarship-filters` branch. Phases are independently shippable and compatibility-preserving; recommend executing P0 first, behind a flag, with the existing email-gate kept as a fallback until the new spine is verified.*
