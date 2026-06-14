# Masarak — Platform Architecture (v1.0)

> _The constitution for a billion-dollar EdTech platform serving the Arab World._
> Last updated: 14 June 2026
> Architects: Mohamad Charafeddine (CEO) · Engineering

---

## 0. Guiding Principles

1. **Single source of truth, multiple projections.** One canonical event log; every dashboard is a projection over it.
2. **Event-driven, not request-driven.** Every action emits an event. Every dashboard subscribes. No more "polling every screen."
3. **Capabilities, not roles.** A user's permissions are the union of their roles' capabilities, evaluated centrally.
4. **Data isolation by RLS at the database layer.** No dashboard "trusts" the client to filter. PostgreSQL enforces.
5. **Scalable from day one.** Aggregates pre-computed. Hot paths cached. Cold paths queryable.
6. **Honest defaults.** Empty states are clear. No fake data. Errors are precise.

---

## 1. Central User System (CUS)

### 1.1 The Identity Graph

```
auth.users              (Supabase — never touched directly)
   │
   ▼
user_profiles           (extends auth.users with platform meta)
   ├─► student_profiles (if role includes 'student')
   ├─► parent_profiles  (if role includes 'parent')
   ├─► org_members      (one row per org the user belongs to)
   └─► admin_grants     (super admin email allowlist)
```

**Key insight:** A single human can be a **student**, a **parent**, AND an **org_owner** of three universities, all under one `auth.users` row. The model supports it.

### 1.2 `user_profiles` (canonical)

```sql
CREATE TABLE user_profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text UNIQUE NOT NULL,
  full_name       text,
  avatar_url      text,
  phone           text,
  country_code    text DEFAULT 'LB',
  preferred_lang  text DEFAULT 'ar',
  timezone        text DEFAULT 'Asia/Beirut',
  primary_role    text NOT NULL DEFAULT 'student',  -- 'student' | 'parent' | 'org_owner' | 'super_admin'
  active_role     text,                              -- which role context the user is currently in
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  last_seen_at    timestamptz,
  is_active       boolean DEFAULT true
);
```

`primary_role` is for analytics; `active_role` is for the current session (a parent who logs into student view to help their child).

### 1.3 Role Extensions

Each role has its own profile table with role-specific fields, all foreign-keyed to `user_profiles.id`.

| Role | Profile Table | Role-Specific Fields |
|---|---|---|
| Student | `student_profiles` | grade, school_id, interests, dna_results, xp, streak |
| Parent | `parent_profiles` | linked_students[], notification_prefs |
| Org Owner | `org_members(user_id, org_id, role)` | role within org (owner/editor/viewer) |
| Super Admin | `admin_grants(email)` | admin email allowlist |

### 1.4 Role Activation

```typescript
// lib/identity.ts
export async function getActiveIdentity() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*, org_members(org_id, role, organizations(name, type))')
    .eq('id', user.id)
    .single();
  return profile;  // returns full identity graph in one round-trip
}
```

---

## 2. Roles & Permissions Engine (RPE)

### 2.1 The Capability Model

Forget "roles". Think **capabilities**. A capability is a string `domain.action.scope`.

```
view.student.self          parent ↔ linked-students only
view.student.any           super_admin only
edit.student.profile.self  student themselves
edit.university.own        org_owner of that university
create.invite.org          super_admin
view.revenue.summary       super_admin
view.org.analytics.own     org_owner of that org
send.message.to.student    org_owner with verified org
```

### 2.2 Role → Capability Map

Stored in code (single file, version-controlled):

```typescript
// lib/permissions/capabilities.ts
export const CAPABILITIES: Record<Role, Capability[]> = {
  student: [
    'view.student.self', 'edit.student.profile.self',
    'view.university.public', 'save.item.self',
    'complete.dna.self', 'apply.scholarship.self',
  ],
  parent: [
    'view.student.linked', 'view.reports.linked',
    'edit.parent.profile.self', 'manage.parent.notifications',
  ],
  org_owner: [
    'view.org.analytics.own', 'edit.org.profile.own',
    'manage.org.events.own', 'manage.org.scholarships.own',
    'send.message.to.lead', 'view.org.leads.own',
  ],
  org_editor: [
    'view.org.analytics.own', 'edit.org.profile.own',
    'manage.org.events.own',
  ],
  sponsor: [
    'view.sponsor.campaigns.own', 'create.sponsor.campaign.own',
    'view.sponsor.analytics.own',
  ],
  super_admin: ['*'],  // wildcard
};
```

### 2.3 Permission Check API

```typescript
// One function, used everywhere:
can(user, 'edit.university.own', { universityId: 123 })  // → boolean
mustCan(user, 'view.revenue.summary')                     // throws if denied
```

### 2.4 Three Enforcement Layers

| Layer | Mechanism | When |
|---|---|---|
| **Client UI** | Hide buttons/menus | UX (avoid showing dead buttons) |
| **Server (API routes)** | `mustCan()` at entry | Business logic |
| **Database (RLS)** | Postgres policies | Ground truth |

> Never trust the client. RLS is the wall. Server check is the door. UI is just the welcome mat.

---

## 3. Event Tracking System (ETS)

### 3.1 One Table to Rule Them All

```sql
analytics_events (already exists, extend it):
  id, user_id, session_id, event_name, entity_type, entity_id,
  page_url, referrer, utm_*, device, country_code,
  properties JSONB,    -- typed by event
  emitted_by text,     -- 'client' | 'server' | 'webhook' | 'cron'
  created_at
```

Add `emitted_by` and `correlation_id` (for tracing).

### 3.2 Typed Event Emitter

```typescript
// lib/events.ts
type EventName =
  | 'student.registered'
  | 'student.viewed_university'
  | 'student.saved_university'
  | 'student.completed_dna'
  | 'student.applied_scholarship'
  | 'parent.linked_student'
  | 'university.published_event'
  | 'university.received_lead'
  | 'sponsor.campaign_created'
  | 'admin.suspended_user'
  | 'system.payment_received'
  ;

emit('student.viewed_university', {
  student_id: '...', university_id: 123, source: 'search'
});
```

### 3.3 Event Listeners (Triggers)

Events drive everything via listeners. Defined in `lib/events/listeners/*.ts`. Examples:

```
'student.saved_university' fires:
  ↓
  ├─ DB:    INSERT into saved_items
  ├─ DB:    INCREMENT universities.saves_count
  ├─ Notify: SEND in-app notification to org_owners(universities.id) if "high-value student"
  ├─ Aggregate: UPDATE analytics_aggregates.university_daily_saves
  └─ AI:     QUEUE recommendation refresh for this student

'university.published_event' fires:
  ↓
  ├─ DB:    INSERT into university_events
  ├─ Notify: SEND to students who saved this university
  ├─ Notify: SEND to students with matching interests
  └─ Sitemap: TRIGGER regeneration if event has public page
```

---

## 4. Unified Analytics Layer (UAL)

### 4.1 Three-Tier Storage

```
analytics_events    ← raw log (cold storage after 90d)
analytics_aggregates ← hourly+daily rollups (hot storage, 2y)
materialized_views   ← dashboard-shaped pre-joins
```

### 4.2 Aggregates Schema

```sql
analytics_daily (
  day date,
  scope_type text,   -- 'global' | 'university' | 'school' | 'sponsor' | 'user'
  scope_id text,
  metric text,       -- 'page_views' | 'saves' | 'signups' | 'revenue'
  value bigint,
  PRIMARY KEY (day, scope_type, scope_id, metric)
)
```

### 4.3 Refresh Strategy

- **Real-time counters** (last 24h): query `analytics_events` directly.
- **30-day windows**: query `analytics_daily`.
- **Historical (>90d)**: read materialized views, refreshed nightly.

### 4.4 Per-Dashboard Aggregation

| Dashboard | Metric | Source |
|---|---|---|
| Student | xp, streak, saved_count | `student_profiles` (cached) |
| Parent | linked students' progress | direct read with RLS |
| University | profile views (30d), saves, leads | `analytics_daily` filtered to scope |
| Super Admin | totalUsers, MRR, growth | `admin_kpi_overview()` RPC |

---

## 5. Notifications Engine (NE)

### 5.1 Schema

```sql
CREATE TABLE notifications (
  id           bigserial PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         text NOT NULL,        -- 'scholarship.deadline_3d' | 'org.new_lead' | ...
  title        text NOT NULL,
  body         text,
  link_url     text,
  entity_type  text,
  entity_id    text,
  channel      text DEFAULT 'in_app', -- 'in_app' | 'email' | 'push' | 'sms' | 'whatsapp'
  read_at      timestamptz,
  acted_at     timestamptz,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE notification_preferences (
  user_id      uuid PRIMARY KEY,
  channels_by_type jsonb DEFAULT '{}'::jsonb,  -- { "scholarship.deadline_3d": ["in_app","email"] }
  quiet_hours_start time DEFAULT '22:00',
  quiet_hours_end   time DEFAULT '08:00'
);

CREATE TABLE notification_rules (
  id          bigserial PRIMARY KEY,
  trigger     text NOT NULL,         -- event name OR cron expression
  audience    text NOT NULL,         -- 'all' | 'role:student' | 'saved:university:{id}'
  template    jsonb NOT NULL,        -- { "title_template": "...", "body_template": "..." }
  channels    text[] DEFAULT ARRAY['in_app'],
  is_active   boolean DEFAULT true
);
```

### 5.2 Dispatcher (Server-Side)

```typescript
// lib/notifications/dispatch.ts
async function dispatchFor(eventName, payload) {
  const rules = await getActiveRules(eventName);
  for (const rule of rules) {
    const audience = await resolveAudience(rule.audience, payload);
    for (const userId of audience) {
      const prefs = await getPreferences(userId);
      const allowedChannels = rule.channels.filter(c => prefs.allows(rule.trigger, c));
      await Promise.all(allowedChannels.map(c => sendChannel(c, userId, render(rule.template, payload))));
    }
  }
}
```

### 5.3 Channels

| Channel | Provider | Status |
|---|---|---|
| in_app | Postgres `notifications` table + Supabase Realtime | ✅ Built |
| email | Resend (transactional) / Postmark | ⏳ When ready |
| push | Web Push API + FCM | ⏳ Phase 3 |
| whatsapp | Meta Business API | ⏳ When verified |

---

## 6. Institution CRM

### 6.1 The Core Idea

Universities/Schools/Sponsors are **customers/partners**, not just content. They get:
- A **lead pipeline** (interested students)
- A **content management** layer (events, scholarships, news)
- **Analytics** about their own performance
- **Messaging** with leads

### 6.2 Schema

```sql
CREATE TABLE org_leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES organizations(id),
  student_id  uuid NOT NULL REFERENCES auth.users(id),
  source      text NOT NULL,        -- 'save' | 'event_register' | 'message' | 'cv_apply'
  status      text DEFAULT 'new',   -- 'new' | 'contacted' | 'engaged' | 'applied' | 'enrolled' | 'lost'
  score       int DEFAULT 0,        -- 0-100 lead quality score
  first_interaction_at timestamptz DEFAULT now(),
  last_interaction_at  timestamptz DEFAULT now(),
  assigned_to text,                  -- email of the org member handling this lead
  notes       text,
  UNIQUE (org_id, student_id)
);

CREATE TABLE org_messages (
  id            bigserial PRIMARY KEY,
  org_id        uuid NOT NULL,
  thread_id     uuid NOT NULL,
  sender_type   text NOT NULL,  -- 'org' | 'student'
  sender_id     uuid NOT NULL,
  body          text NOT NULL,
  read_at       timestamptz,
  created_at    timestamptz DEFAULT now()
);
```

### 6.3 Lead Auto-Scoring

```
Score = base_interest + recency_bonus - inactivity_penalty + matched_signals
  +30  saved this org
  +20  registered for an event
  +15  applied to scholarship
  +10  matches DNA recommendation
  +5   viewed profile >3 times in 7d
  -10  no interaction in 30 days
```

### 6.4 Pipeline Funnel (per org)

```
   new → contacted → engaged → applied → enrolled
   ↓                                      
   lost (manual or auto after 90d inactivity)
```

---

## 7. Parent-Student Relationship System

### 7.1 Schema

```sql
CREATE TABLE parent_student_links (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id    uuid NOT NULL REFERENCES auth.users(id),
  student_id   uuid NOT NULL REFERENCES auth.users(id),
  link_method  text NOT NULL,    -- 'code' | 'invite' | 'admin_link'
  permissions  jsonb DEFAULT '{}'::jsonb,
                                  -- { "view_progress": true, "view_messages": false }
  approved_at  timestamptz,
  created_at   timestamptz DEFAULT now(),
  UNIQUE (parent_id, student_id)
);
```

### 7.2 RLS — The Critical Rule

```sql
-- Parents can read their linked students' progress
CREATE POLICY parent_reads_linked_student ON student_profiles
  FOR SELECT USING (
    auth.uid() = id  -- self
    OR EXISTS (
      SELECT 1 FROM parent_student_links
      WHERE parent_id = auth.uid() AND student_id = id AND approved_at IS NOT NULL
    )
  );
```

### 7.3 Notification Routing

| Event on student | Parent gets notified? | Channel |
|---|---|---|
| Completed DNA | ✅ (opt-in default) | in_app + email |
| Applied to scholarship | ✅ | in_app |
| Skipped daily challenge 7 days | ⚠️ (concern flag) | in_app |
| Suspended/banned | 🚨 always | email + SMS |

---

## 8. University Lead Management System

Universities need a Salesforce-grade pipeline. Built on top of the CRM in §6.

### 8.1 Lead Lifecycle Events

```
student.saved_university       → CREATE org_lead(source='save', score=+30)
student.registered_event       → UPDATE org_lead.score += 20
org.sent_message_to_student    → UPDATE org_lead.status='contacted'
student.replied                → UPDATE org_lead.status='engaged'
student.cv_applied_to_org      → UPDATE org_lead.status='applied'
admin.marked_enrolled          → UPDATE org_lead.status='enrolled' (lifetime value tracked)
30d_no_interaction (cron)      → UPDATE org_lead.status='lost'
```

### 8.2 University Dashboard Views

| View | Query |
|---|---|
| **My Leads** | `org_leads WHERE org_id = current_org ORDER BY score DESC` |
| **Pipeline** | `org_leads GROUP BY status` (kanban) |
| **Hot Leads (7d)** | `score >= 70 AND last_interaction > now() - 7d` |
| **At Risk** | `status IN ('engaged','contacted') AND last_interaction < now() - 14d` |

### 8.3 Auto-Actions

- **Auto-assign** leads to org members based on round-robin or specialty
- **Auto-followup** suggestion: "It's been 10 days since you contacted X. Send a check-in?"
- **Auto-archive** lost leads after 90d (move to `org_leads_archive`)

---

## 9. Sponsor Management System

Sponsors pay for visibility and lead-gen. The system treats them as a third class of org with different capabilities.

### 9.1 Schema

```sql
CREATE TABLE sponsor_campaigns (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id    uuid NOT NULL REFERENCES organizations(id),
  name          text NOT NULL,
  type          text NOT NULL,    -- 'featured_placement' | 'banner' | 'newsletter' | 'event_sponsorship'
  target_audience jsonb,            -- { grades: [11,12], interests: ['stem'], country: 'LB' }
  budget_usd    numeric(10,2),
  starts_at     timestamptz NOT NULL,
  ends_at       timestamptz NOT NULL,
  status        text DEFAULT 'pending',  -- 'pending' | 'active' | 'paused' | 'ended'
  impressions   bigint DEFAULT 0,
  clicks        bigint DEFAULT 0,
  leads         bigint DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE campaign_events (
  id          bigserial PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES sponsor_campaigns(id),
  event_name  text NOT NULL,  -- 'impression' | 'click' | 'lead' | 'conversion'
  user_id     uuid,
  page_url    text,
  created_at  timestamptz DEFAULT now()
);
```

### 9.2 ROI Math (sponsor dashboard)

```
CTR     = clicks / impressions
LeadRate= leads / clicks
CPA     = budget / leads
CPM     = (budget / impressions) × 1000
```

### 9.3 Targeting Engine

Every page render fires `getEligibleCampaigns(user_context)` server-side, returns top-1 campaign per slot. Campaigns ranked by:
```
priority = bid × match_score × pacing_score
```

---

## 10. AI Insights System

### 10.1 Insight Types

| Type | Generator | Audience |
|---|---|---|
| `daily_briefing` | Claude API (existing) | Super Admin |
| `at_risk_org` | Rule-based + Claude | Super Admin + Org Owner |
| `trending_career` | Aggregate analysis | All roles |
| `student_recommendation` | DNA + behavior model | Student |
| `lead_score_explanation` | Claude API | Org Owner |
| `anomaly_alert` | Statistical | Super Admin |

### 10.2 Generation Strategy

```
Real-time:    Recommendations (cached 24h per user)
Daily:        Briefings, trend reports
Weekly:       Strategic deep-dives
On-demand:    "Explain this lead" / "Why did X drop?"
```

### 10.3 Cost Control

- Cache aggressively in `ai_insights` table (already built)
- Use Claude Haiku for routine summaries, Sonnet for strategic
- Budget cap: $50/month default, alerts at 80%
- Rule-based fallback for every AI feature

---

## 11. The Event Map (Sample — 20 events)

For each event: **emitter**, **DB writes**, **dashboards updated**, **notifications**, **analytics**.

### Student Events

| Event | Emitter | DB Writes | Dashboards | Notifications | Analytics |
|---|---|---|---|---|---|
| `student.registered` | Server (after signup) | `user_profiles`, `student_profiles` | Super Admin counters | Welcome email | `daily_signups++` |
| `student.viewed_university` | Client | — | University: `profile_views++` | none | `university_views++` (per uni) |
| `student.saved_university` | Server (toggleSave) | `saved_items`, `org_leads(create or score++)` | University: leads, Student: saved list | Org owner if high-value | `saves_daily++` |
| `student.completed_dna` | Server | `dna_results`, `student_profiles.xp += 50` | Student, Parent | Parent (in-app) | `dna_completions_daily++` |
| `student.applied_scholarship` | Server | `scholarship_applications`, `org_leads(score++)` | Scholarship owner | Org owner | `applications_daily++` |
| `student.created_cv` | Server | `student_cvs` | Student | none | `cvs_created++` |
| `student.daily_challenge_done` | Server | `student_profiles.streak++, xp += 10` | Student | Parent if 7d streak | `engagement_daily++` |

### Parent Events

| Event | Emitter | DB Writes | Dashboards | Notifications | Analytics |
|---|---|---|---|---|---|
| `parent.linked_student` | Server (code redemption) | `parent_student_links` | Parent | Student (confirmation) | `parent_links++` |
| `parent.viewed_student_progress` | Client | — | Parent | none | `parent_engagement++` |

### Organization (University/School) Events

| Event | Emitter | DB Writes | Dashboards | Notifications | Analytics |
|---|---|---|---|---|---|
| `org.invite_sent` | Server (admin) | `org_invites` | Super Admin (audit) | Recipient (email) | `invites_sent++` |
| `org.invite_redeemed` | Server | `org_members`, `org_invites.redeemed_at` | Super Admin, Org Owner | Super Admin (audit) | `orgs_activated++` |
| `org.published_event` | Server | `org_events` | Org Dashboard, Public uni page | Students who saved org | `events_published++` |
| `org.published_scholarship` | Server | `scholarships` | Public, Org | Students with matching DNA | `scholarships_published++` |
| `org.received_lead` | Listener (from saves/events) | `org_leads.upsert` | Org Dashboard "New Leads" | Org owner (if high-value) | `leads_daily++` |
| `org.contacted_lead` | Server (org sends message) | `org_messages`, `org_leads.status='contacted'` | Org, Student | Student (in-app) | `lead_outreach++` |
| `org.profile_verified` | Server (admin) | `organizations.is_verified=true` | Org, Public | Org owner | `verifications++` |

### Sponsor Events

| Event | Emitter | DB Writes | Dashboards | Notifications | Analytics |
|---|---|---|---|---|---|
| `sponsor.campaign_created` | Server | `sponsor_campaigns` | Sponsor, Super Admin | Super Admin | `campaigns_created++` |
| `sponsor.campaign_impression` | Client (lazy-batched) | `campaign_events` | Sponsor | none | `impressions++` |
| `sponsor.campaign_click` | Client | `campaign_events`, `sponsor_campaigns.clicks++` | Sponsor | none | `clicks++` |
| `sponsor.campaign_lead` | Listener | `campaign_events`, `org_leads(create from sponsor)` | Sponsor | Sponsor (in-app) | `sponsor_leads++` |

### System Events

| Event | Emitter | DB Writes | Dashboards | Notifications |
|---|---|---|---|---|
| `system.payment_received` | Webhook (Stripe) | `subscriptions`, `payment_history` | Super Admin, payer | Receipt to user |
| `system.subscription_canceled` | Webhook | `subscriptions.status='canceled'` | Super Admin, payer | Email |
| `admin.suspended_user` | Server (admin action) | `auth.users.banned_until`, `admin_actions` | Super Admin (audit) | User (email) |
| `admin.deleted_content` | Server | hard delete + `admin_actions` | Super Admin (audit) | none |

---

## 12. Dashboards — Role-Scoped

### 12.1 Student Dashboard
**Sees:** own profile, own progress, own saved items, public universities, DNA result, scholarships matched to interests, daily challenge, messages from orgs, parent links.
**Cannot see:** other students, org back-office, admin data.

### 12.2 Parent Dashboard
**Sees:** linked students' progress (with permission), upcoming deadlines, milestone alerts, school/university suggestions for their kids.
**Cannot see:** other parents' students, raw student events, admin data.

### 12.3 University/School Dashboard
**Sees:** own org analytics, own lead pipeline, own events/scholarships/news, messages with leads, profile completion %.
**Cannot see:** other orgs' data, student personal data beyond what consented, revenue numbers, sponsor campaigns.

### 12.4 Sponsor Dashboard
**Sees:** own campaigns + performance, own lead list, ROI metrics, audience insights.
**Cannot see:** other sponsors' campaigns, student data beyond aggregate.

### 12.5 Super Admin Dashboard (already built)
**Sees:** everything. RLS bypassed by `auth.jwt().email = ADMIN_EMAIL`.

### 12.6 Menu System

```typescript
// One file, single source of menu truth
const MENU_REGISTRY: Record<Capability, MenuItem> = {
  'view.student.self':     { label: 'بروفايلي', icon: '👤', href: '/dashboard' },
  'view.student.linked':   { label: 'أبنائي',   icon: '👨‍👩‍👧', href: '/parent' },
  'view.org.analytics.own':{ label: 'لوحة المؤسسة', icon: '🏛️', href: '/org/dashboard' },
  // ...
};

function getMenuFor(user) {
  return Object.entries(MENU_REGISTRY)
    .filter(([cap]) => can(user, cap))
    .map(([_, item]) => item);
}
```

---

## 13. Scalability Plan

### 13.1 Database Tier

| Stage | Users | Strategy |
|---|---|---|
| 0–100k | 0–100k | Supabase Pro ($25/mo). Single Postgres. |
| 100k–1M | 100k–1M | Supabase Team. Read replicas. PgBouncer pooling. |
| 1M–10M | 1M+ | Sharded by `country_code`. Citus or Supabase Enterprise. |
| 10M+ | — | Multi-region, event store in BigQuery or ClickHouse. |

### 13.2 Hot/Cold Storage

```
Last 24h:    Postgres (hot)
Last 90d:    Postgres (warm, indexed)
Older:       Cold storage in Supabase Storage (Parquet files)
             Queryable via DuckDB if needed
```

### 13.3 Async Processing

- Vercel Cron → daily aggregations
- Supabase Edge Functions → real-time event listeners
- Queue (Inngest or Trigger.dev) for retryable jobs (emails, AI calls)

### 13.4 Caching Layers

```
Browser (SWR/React Query) ← 5min
↑
Vercel Edge (ISR) ← 24h for content pages
↑
Postgres (materialized views) ← 1h
↑
Source of truth (analytics_events)
```

---

## 14. The 90-Day Implementation Roadmap

### Phase A (Weeks 1–4) — Foundation
- [ ] Create `user_profiles` table (canonical) + migrate
- [ ] Build `lib/permissions/*` with capability registry
- [ ] Refactor existing admin/student/parent guards to use `can()`
- [ ] Migrate all `track()` calls to typed `emit()` API
- [ ] Add `event_listeners` registry pattern

### Phase B (Weeks 5–8) — CRM + Notifications
- [ ] Build `org_leads` + lead-scoring listener
- [ ] Build `notifications` table + dispatch service
- [ ] Add in-app notification center (bell icon, dropdown)
- [ ] Wire 10 core events to notifications

### Phase C (Weeks 9–12) — Sponsor + AI
- [ ] Build `sponsor_campaigns` + targeting engine
- [ ] Build sponsor dashboard (mirroring uni dashboard)
- [ ] Expand AI Insights: at-risk org, trending careers
- [ ] Multi-tenant onboarding flow for sponsors

### Phase D (Weeks 13+) — Scale & Polish
- [ ] Materialized views for analytics
- [ ] Cron jobs for aggregates
- [ ] Read replicas
- [ ] Multi-region prep

---

## 15. The North Star

> Every action on Masarak emits exactly **one canonical event**.
> Every dashboard is a **filtered projection** over the event log.
> Every notification is a **rule** over events.
> Every analytics number is a **count** over events.
> No two places store the same fact twice. No one looks at another role's data without RLS allowing it.

If we honor those five rules, Masarak scales to 10M students without rewriting.

---

_Document owner: Engineering · Review cadence: quarterly_
_Next review: 2026-09-14_
