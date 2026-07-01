"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import ImageUploader from "@/components/ImageUploader";
import OrgExecutiveOverview from "@/components/OrgExecutiveOverview";
import OrgLeadsSection from "@/components/OrgLeadsSection";
import OrgMessagesSection from "@/components/OrgMessagesSection";
import OrgAnalyticsSection from "@/components/OrgAnalyticsSection";
import OrgVerificationSection from "@/components/OrgVerificationSection";
import OrgReportsSection from "@/components/OrgReportsSection";
import ErrorState from "@/components/ErrorState";
import { supabase } from "@/lib/supabase";
import { emit } from "@/lib/events/emit";
import {
  fetchMyOrgs, updateOrg, ORG_TYPE_LABEL, EVENT_TYPE_LABEL, AFFILIATION_LABEL,
  fetchOrgMedia, addOrgMedia, deleteOrgMedia,
  fetchOrgEvents, saveOrgEvent, deleteOrgEvent,
  fetchOrgAnnouncements, saveOrgAnnouncement, deleteOrgAnnouncement,
  fetchOrgScholarships, saveOrgScholarship, deleteOrgScholarship,
  fetchOrgAffiliations, verifyAffiliation, rejectAffiliation, removeAffiliation,
  type Organization, type OrgRole, type OrgMedia, type OrgEvent, type OrgAnnouncement,
  type EventType, type OrgAffiliation, type OrgScholarship,
} from "@/lib/org";
import { useI18n } from "@/lib/i18n";

interface MyOrgRow {
  role: OrgRole;
  org_id: string;
  organizations: {
    id: string; slug: string; display_name: string;
    org_type: Organization["org_type"]; logo_url: string | null;
    verification_status: Organization["verification_status"];
  };
}

type Tab = "overview" | "info" | "unidata" | "media" | "events" | "announcements" | "scholarships" | "students";

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  unclaimed: { label: "غير مُدارة", cls: "bg-gray-100 text-gray-600" },
  pending:   { label: "قيد المراجعة", cls: "bg-amber-100 text-amber-700" },
  verified:  { label: "✓ موثّقة", cls: "bg-blue-100 text-blue-700" },
  rejected:  { label: "مرفوضة", cls: "bg-red-100 text-red-700" },
};

export default function OrgDashboardPage() {
  const router = useRouter();
  const { dir } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userId, setUserId] = useState("");
  const [myOrgs, setMyOrgs] = useState<MyOrgRow[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  const loadData = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.push("/auth/login?next=/org/dashboard"); return; }
      setUserId(data.user.id);
      const mine = (await fetchMyOrgs(data.user.id)) as unknown as MyOrgRow[];
      if (mine.length === 0) { router.push("/org/claim"); return; }
      setMyOrgs(mine);
      setActiveOrgId(mine[0].org_id);
    } catch (e) {
      console.error("[OrgDashboard] load failed", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  function retry() {
    setError(false);
    setLoading(true);
    loadData();
  }

  useEffect(() => {
    if (!activeOrgId) return;
    setOrgLoading(true);
    supabase.from("organizations").select("*").eq("id", activeOrgId).maybeSingle()
      .then(({ data }) => { setOrg(data as Organization | null); setOrgLoading(false); });
  }, [activeOrgId]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg" dir={dir}>
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-4" dir={dir}>
        <div className="w-full max-w-md">
          <ErrorState onRetry={retry} context="org_dashboard" />
        </div>
      </div>
    );
  }

  const activeRow = myOrgs.find((m) => m.org_id === activeOrgId);
  const badge = org ? STATUS_BADGE[org.verification_status] : null;

  return (
    <main className="min-h-screen bg-bg" dir={dir}>
      {/* Dedicated institution admin top bar — no student-site navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-sm font-bold text-gray-500 hover:text-primary hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors"
              title="رجوع"
            >
              ← رجوع
            </button>
            <Logo size={32} variant="dark" showSubtitle={false} />
            <span className="hidden sm:inline text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">
              لوحة المؤسسة
            </span>
          </div>
          <div className="flex items-center gap-3">
            {activeRow && (
              <span className="text-xs text-gray-500 font-semibold">
                صلاحيتك: {activeRow.role}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm font-bold text-danger hover:bg-danger-light px-3 py-1.5 rounded-lg transition-colors"
            >
              🚪 خروج
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-primary mb-6">لوحة إدارة المؤسسة</h1>

        {myOrgs.length > 1 && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {myOrgs.map((m) => (
              <button key={m.org_id} onClick={() => { setActiveOrgId(m.org_id); setTab("info"); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border-2 transition-all ${
                  activeOrgId === m.org_id
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-gray-200 text-gray-600"
                }`}>
                {m.organizations.display_name}
              </button>
            ))}
          </div>
        )}

        {orgLoading || !org ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Org header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden relative">
                {org.logo_url
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={org.logo_url} alt="" className="w-full h-full object-contain rounded-2xl"
                      onError={(e) => {
                        const el = e.currentTarget;
                        el.style.display = "none";
                        if (el.parentElement) el.parentElement.textContent = "🏛️";
                      }} />
                  : "🏛️"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-primary text-lg">{org.display_name}</div>
                <div className="text-xs text-gray-500">{ORG_TYPE_LABEL[org.org_type]}</div>
              </div>
              {badge && <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>}
            </div>

            {org.verification_status === "verified" && org.entity_id && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 mb-5 flex items-center justify-between gap-2">
                <span>✓ صفحتك موثّقة وظاهرة للطلاب.</span>
                <Link
                  href={
                    org.org_type === "university" ? `/universities/${org.entity_id}`
                    : org.org_type === "school" ? `/schools/${org.entity_id}`
                    : `/vocational/institute/${org.entity_id}`
                  }
                  className="font-bold underline whitespace-nowrap"
                >شوف صفحتك ←</Link>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {([
                { key: "overview", label: "📊 نظرة عامة" },
                { key: "info", label: "📋 معلومات الصفحة" },
                ...(org.org_type === "university" && org.entity_id
                  ? [{ key: "unidata", label: "🏛️ بيانات الجامعة" }] : []),
                { key: "media", label: "🖼️ الوسائط" },
                { key: "events", label: "📅 الفعاليات" },
                { key: "announcements", label: "📣 الأخبار والإعلانات" },
                { key: "scholarships", label: "🎓 المنح" },
                { key: "students", label: "👨‍🎓 الطلاب" },
              ] as { key: Tab; label: string }[]).map((s) => (
                <button key={s.key} onClick={() => setTab(s.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    tab === s.key ? "bg-primary text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Tab content — every section lives under exactly one tab now, so the
                dashboard is a single clean tab system (no always-on stack / 2nd nav). */}
            {tab === "overview" && (
              <div className="space-y-3">
                <ProfileCompleteness org={org} onGoTab={setTab} />
                <OrgExecutiveOverview orgId={org.id} orgName={org.display_name} />
                <OrgAnalyticsSection orgId={org.id} />
                <OrgReportsSection orgId={org.id} />
                {org.verification_status !== "verified" && <OrgVerificationSection orgId={org.id} />}
              </div>
            )}
            {tab === "info" && <InfoSection org={org} onSaved={setOrg} />}
            {tab === "unidata" && org.org_type === "university" && org.entity_id && (
              <UniversityDataSection uniId={org.entity_id} />
            )}
            {tab === "media" && <MediaSection orgId={org.id} userId={userId} />}
            {tab === "events" && <EventsSection orgId={org.id} userId={userId} />}
            {tab === "announcements" && <AnnouncementsSection orgId={org.id} userId={userId} />}
            {tab === "scholarships" && <ScholarshipsSection orgId={org.id} userId={userId} />}
            {tab === "students" && (
              <div className="space-y-3">
                <StudentsSection orgId={org.id} userId={userId} />
                <OrgLeadsSection orgId={org.id} />
                <OrgMessagesSection orgId={org.id} currentUserId={userId} />
              </div>
            )}

          </>
        )}
      </div>
    </main>
  );
}

/* ════════════ INFO ════════════ */
function InfoSection({ org, onSaved }: { org: Organization; onSaved: (o: Organization) => void }) {
  const [tagline, setTagline] = useState(org.tagline || "");
  const [about, setAbout] = useState(org.about || "");
  const [logoUrl, setLogoUrl] = useState(org.logo_url || "");
  const [bannerUrl, setBannerUrl] = useState(org.banner_url || "");
  const [instagram, setInstagram] = useState(org.social?.instagram || "");
  const [facebook, setFacebook] = useState(org.social?.facebook || "");
  const [linkedin, setLinkedin] = useState(org.social?.linkedin || "");
  const [website, setWebsite] = useState(org.social?.website || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true); setSaved(false);
    const patch = {
      tagline: tagline.trim() || null,
      about: about.trim() || null,
      logo_url: logoUrl.trim() || null,
      banner_url: bannerUrl.trim() || null,
      social: {
        ...(instagram.trim() ? { instagram: instagram.trim() } : {}),
        ...(facebook.trim() ? { facebook: facebook.trim() } : {}),
        ...(linkedin.trim() ? { linkedin: linkedin.trim() } : {}),
        ...(website.trim() ? { website: website.trim() } : {}),
      },
    };
    const { error } = await updateOrg(org.id, patch);
    setSaving(false);
    if (!error) {
      setSaved(true); setTimeout(() => setSaved(false), 2500);
      onSaved({ ...org, ...patch } as Organization);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <h2 className="font-extrabold text-primary text-lg">معلومات الصفحة</h2>
      <Field label="الشعار (Tagline)" hint="جملة قصيرة تلخّص مؤسستك">
        <input value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={120}
          placeholder="مثال: نبني قادة الغد منذ 1875" className={inputCls} />
      </Field>
      <Field label="نبذة عن المؤسسة">
        <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={5} maxLength={2000}
          placeholder="عرّف بمؤسستك، رؤيتها، وما يميّزها..." className={inputCls} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="الشعار (Logo)" hint="ارفع صورة من جهازك أو الصق رابطاً">
          <ImageUploader value={logoUrl} onChange={setLogoUrl} folder={`org/${org.id}/logo`} maxSizeMB={2} />
        </Field>
        <Field label="البانر (Banner)" hint="صورة عريضة تظهر أعلى صفحتك">
          <ImageUploader value={bannerUrl} onChange={setBannerUrl} folder={`org/${org.id}/banner`} maxSizeMB={5} />
        </Field>
      </div>
      <div>
        <h3 className="font-bold text-gray-700 text-sm mb-3">روابط التواصل</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Social icon="🌐" label="الموقع الرسمي" value={website} onChange={setWebsite} />
          <Social icon="📷" label="Instagram" value={instagram} onChange={setInstagram} />
          <Social icon="👍" label="Facebook" value={facebook} onChange={setFacebook} />
          <Social icon="💼" label="LinkedIn" value={linkedin} onChange={setLinkedin} />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-3 rounded-xl disabled:opacity-50">
          {saving ? "جاري الحفظ..." : "💾 حفظ التغييرات"}
        </button>
        {saved && <span className="text-sm text-green-600 font-bold">✓ تم الحفظ</span>}
      </div>
    </div>
  );
}

/* ════════════ UNIVERSITY CORE DATA (editable by verified org managers) ════════════ */
// Edits the linked `universities` row via the org_update_university RPC (SECURITY
// DEFINER + whitelist), so the admin controls the details students actually see —
// not just the org page profile.
function UniversityDataSection({ uniId }: { uniId: number }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [f, setF] = useState<Record<string, string>>({});
  const [majors, setMajors] = useState("");

  useEffect(() => {
    supabase.from("universities").select("*").eq("id", uniId).maybeSingle().then(({ data }) => {
      if (data) {
        const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));
        setF({
          description: s(data.description), region: s(data.region), campus: s(data.campus),
          lang: s(data.lang), url: s(data.url), requirements: s(data.requirements),
          application_deadline: s(data.application_deadline), phone: s(data.phone),
          email: s(data.email), address: s(data.address), logo_url: s(data.logo_url),
          tuition_min: s(data.tuition_min), tuition_max: s(data.tuition_max),
          acceptance: s(data.acceptance), employ_rate: s(data.employ_rate),
          founded: s(data.founded), students: s(data.students), faculties: s(data.faculties),
        });
        setMajors(Array.isArray(data.majors) ? data.majors.join("\n") : "");
      }
      setLoading(false);
    });
  }, [uniId]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function handleSave() {
    setSaving(true); setSaved(false); setErr("");
    const majorsArr = majors.split("\n").map((x) => x.trim()).filter(Boolean);
    const patch = { ...f, majors: majorsArr };
    const { error } = await supabase.rpc("org_update_university", { p_uni_id: uniId, p_patch: patch });
    setSaving(false);
    if (error) { setErr(error.message || "تعذّر الحفظ"); return; }
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <div className="bg-white rounded-2xl border border-gray-200 p-6 text-gray-500">جارٍ تحميل بيانات الجامعة…</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <div>
        <h2 className="font-extrabold text-primary text-lg">🏛️ بيانات الجامعة</h2>
        <p className="text-sm text-gray-500 mt-1">عدّل التفاصيل التي تظهر للطلاب على صفحة جامعتك — التغييرات تُحفظ مباشرةً.</p>
      </div>

      <Field label="نبذة / وصف الجامعة">
        <textarea value={f.description} onChange={set("description")} rows={5} className={inputCls} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="المدينة / المنطقة"><input value={f.region} onChange={set("region")} className={inputCls} /></Field>
        <Field label="الحرم الجامعي"><input value={f.campus} onChange={set("campus")} className={inputCls} /></Field>
        <Field label="لغة التدريس"><input value={f.lang} onChange={set("lang")} className={inputCls} /></Field>
        <Field label="الموقع الرسمي"><input value={f.url} onChange={set("url")} dir="ltr" className={inputCls} /></Field>
      </div>

      <Field label="التخصصات / البرامج" hint="تخصّص واحد في كل سطر">
        <textarea value={majors} onChange={(e) => setMajors(e.target.value)} rows={5} className={inputCls} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="الرسوم — من ($ سنوياً)"><input type="number" value={f.tuition_min} onChange={set("tuition_min")} className={inputCls} /></Field>
        <Field label="الرسوم — إلى ($ سنوياً)"><input type="number" value={f.tuition_max} onChange={set("tuition_max")} className={inputCls} /></Field>
        <Field label="معدّل القبول (%)"><input type="number" value={f.acceptance} onChange={set("acceptance")} className={inputCls} /></Field>
        <Field label="نسبة التوظيف بعد التخرّج (%)"><input type="number" value={f.employ_rate} onChange={set("employ_rate")} className={inputCls} /></Field>
        <Field label="سنة التأسيس"><input type="number" value={f.founded} onChange={set("founded")} className={inputCls} /></Field>
        <Field label="عدد الطلاب"><input type="number" value={f.students} onChange={set("students")} className={inputCls} /></Field>
        <Field label="عدد الكليات"><input type="number" value={f.faculties} onChange={set("faculties")} className={inputCls} /></Field>
      </div>

      <Field label="متطلبات القبول"><textarea value={f.requirements} onChange={set("requirements")} rows={3} className={inputCls} /></Field>
      <Field label="الموعد النهائي للتقديم"><input value={f.application_deadline} onChange={set("application_deadline")} className={inputCls} /></Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="الهاتف"><input value={f.phone} onChange={set("phone")} dir="ltr" className={inputCls} /></Field>
        <Field label="البريد الإلكتروني"><input value={f.email} onChange={set("email")} dir="ltr" className={inputCls} /></Field>
      </div>
      <Field label="العنوان"><input value={f.address} onChange={set("address")} className={inputCls} /></Field>
      <Field label="رابط شعار الجامعة (Logo URL)" hint="رابط صورة الشعار الرسمي"><input value={f.logo_url} onChange={set("logo_url")} dir="ltr" className={inputCls} /></Field>

      {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">⚠️ {err}</div>}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-3 rounded-xl disabled:opacity-50">
          {saving ? "جاري الحفظ..." : "💾 حفظ التغييرات"}
        </button>
        {saved && <span className="text-sm text-green-600 font-bold">✓ تم الحفظ</span>}
      </div>
    </div>
  );
}

/* ════════════ PROFILE COMPLETENESS ════════════ */
// A simple progress indicator that nudges admins to complete their page. Computed
// only from fields already on the org object (no extra fetch); missing items link
// straight to the relevant tab.
function ProfileCompleteness({ org, onGoTab }: { org: Organization; onGoTab: (t: Tab) => void }) {
  const checks: { done: boolean; label: string; tab: Tab }[] = [
    { done: !!org.tagline, label: "شعار مختصر (Tagline)", tab: "info" },
    { done: !!org.about, label: "نبذة عن المؤسسة", tab: "info" },
    { done: !!org.logo_url, label: "شعار (Logo)", tab: "info" },
    { done: !!org.banner_url, label: "صورة بانر", tab: "info" },
    { done: !!(org.social && Object.keys(org.social).length > 0), label: "روابط تواصل", tab: "info" },
  ];
  const done = checks.filter((c) => c.done).length;
  const pct = Math.round((done / checks.length) * 100);
  if (pct === 100) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-extrabold text-primary">✨ اكتمال الملف</h2>
        <span className="text-sm font-extrabold text-primary">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.filter((c) => !c.done).map((c) => (
          <button key={c.label} onClick={() => onGoTab(c.tab)}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100">
            + {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ════════════ MEDIA ════════════ */
function MediaSection({ orgId, userId }: { orgId: string; userId: string }) {
  const [items, setItems] = useState<OrgMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<"photo" | "video">("photo");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setItems(await fetchOrgMedia(orgId)); setLoading(false);
  }, [orgId]);
  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!url.trim()) return;
    setBusy(true);
    await addOrgMedia(orgId, kind, url.trim(), caption.trim(), userId);
    setUrl(""); setCaption("");
    await load(); setBusy(false);
  }
  async function remove(id: string) {
    if (!confirm("حذف هذا العنصر؟")) return;
    await deleteOrgMedia(id); await load();
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-extrabold text-primary text-lg mb-4">إضافة وسائط</h2>
        <div className="flex gap-2 mb-3">
          {(["photo", "video"] as const).map((k) => (
            <button key={k} onClick={() => setKind(k)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${
                kind === k ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"
              }`}>
              {k === "photo" ? "🖼️ صورة" : "🎬 فيديو"}
            </button>
          ))}
        </div>
        {kind === "photo" ? (
          <div className="mb-2">
            <ImageUploader value={url} onChange={setUrl} folder={`org/${orgId}`} maxSizeMB={5} />
          </div>
        ) : (
          <input value={url} onChange={(e) => setUrl(e.target.value)} dir="ltr"
            placeholder="رابط الفيديو (YouTube, Vimeo...)"
            className={inputCls + " mb-2"} />
        )}
        <input value={caption} onChange={(e) => setCaption(e.target.value)}
          placeholder="وصف مختصر (اختياري)" className={inputCls + " mb-3"} />
        <button onClick={add} disabled={busy || !url.trim()} className="btn-primary px-6 py-2.5 rounded-xl disabled:opacity-50">
          {busy ? "..." : "+ إضافة"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-700 mb-4">المعرض ({items.length})</h3>
        {loading ? (
          <div className="text-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">ما في وسائط بعد</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((m) => (
              <div key={m.id} className="relative group">
                <div className="aspect-video rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                  {m.kind === "photo"
                    ? /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={m.url} alt={m.caption || ""} className="w-full h-full object-cover" />
                    : <span className="text-4xl">🎬</span>}
                </div>
                {m.caption && <p className="text-xs text-gray-600 mt-1 truncate">{m.caption}</p>}
                <button onClick={() => remove(m.id)}
                  className="absolute top-1 left-1 w-7 h-7 bg-red-600 text-white rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════ EVENTS ════════════ */
function EventsSection({ orgId, userId }: { orgId: string; userId: string }) {
  const [items, setItems] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<OrgEvent> | null>(null);

  const load = useCallback(async () => {
    setItems(await fetchOrgEvents(orgId)); setLoading(false);
  }, [orgId]);
  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing?.title || !editing.starts_at) return;
    const newPublic = !editing.id && (editing.is_public ?? true);
    const title = editing.title;
    await saveOrgEvent({ ...editing, org_id: orgId } as OrgEvent & { org_id: string }, userId);
    if (newPublic) void emit("org.published_event", { org_id: orgId, entity_type: "event", title });
    setEditing(null); await load();
  }
  async function remove(id: string) {
    if (!confirm("حذف هذه الفعالية؟")) return;
    await deleteOrgEvent(id); await load();
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="font-extrabold text-primary text-lg">الفعاليات ({items.length})</h2>
        <button onClick={() => setEditing({ event_type: "open_day", is_public: true })}
          className="btn-primary px-4 py-2 rounded-xl text-sm">+ فعالية جديدة</button>
      </div>

      {loading ? (
        <div className="text-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 text-sm">ما في فعاليات بعد</div>
      ) : (
        <div className="space-y-3">
          {items.map((ev) => (
            <div key={ev.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-primary">{ev.title}</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{EVENT_TYPE_LABEL[ev.event_type]}</span>
                  {!ev.is_public && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">مخفية</span>}
                </div>
                <div className="text-xs text-gray-500">
                  📅 {new Date(ev.starts_at).toLocaleString("ar")}
                  {ev.location && ` · 📍 ${ev.location}`}
                </div>
                {ev.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ev.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(ev)} className="text-blue-600 text-sm px-2 py-1 hover:bg-blue-50 rounded">تعديل</button>
                <button onClick={() => remove(ev.id)} className="text-red-600 text-sm px-2 py-1 hover:bg-red-50 rounded">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "تعديل فعالية" : "فعالية جديدة"}>
          <input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            placeholder="عنوان الفعالية" className={inputCls} />
          <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            rows={3} placeholder="الوصف" className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-bold text-gray-600">يبدأ
              <input type="datetime-local" value={(editing.starts_at || "").slice(0, 16)}
                onChange={(e) => setEditing({ ...editing, starts_at: e.target.value })} className={inputCls} />
            </label>
            <label className="text-xs font-bold text-gray-600">ينتهي (اختياري)
              <input type="datetime-local" value={(editing.ends_at || "").slice(0, 16)}
                onChange={(e) => setEditing({ ...editing, ends_at: e.target.value || undefined })} className={inputCls} />
            </label>
          </div>
          <input value={editing.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })}
            placeholder="المكان" className={inputCls} />
          <select value={editing.event_type || "open_day"}
            onChange={(e) => setEditing({ ...editing, event_type: e.target.value as EventType })}
            className={inputCls + " bg-white"}>
            {Object.entries(EVENT_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.is_public ?? true}
              onChange={(e) => setEditing({ ...editing, is_public: e.target.checked })} />
            ظاهرة للعامة على صفحة المؤسسة
          </label>
          <div className="flex gap-2 pt-2">
            <button onClick={save} disabled={!editing.title || !editing.starts_at}
              className="btn-primary flex-1 py-2.5 rounded-xl disabled:opacity-50">حفظ</button>
            <button onClick={() => setEditing(null)} className="px-5 py-2.5 bg-gray-100 rounded-xl font-bold">إلغاء</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ════════════ ANNOUNCEMENTS ════════════ */
function AnnouncementsSection({ orgId, userId }: { orgId: string; userId: string }) {
  const [items, setItems] = useState<OrgAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<OrgAnnouncement> | null>(null);

  const load = useCallback(async () => {
    setItems(await fetchOrgAnnouncements(orgId)); setLoading(false);
  }, [orgId]);
  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing?.title) return;
    const newPublic = !editing.id && (editing.is_public ?? true);
    const title = editing.title;
    await saveOrgAnnouncement({ ...editing, org_id: orgId } as OrgAnnouncement & { org_id: string }, userId);
    if (newPublic) void emit("org.published_announcement", { org_id: orgId, entity_type: "announcement", title });
    setEditing(null); await load();
  }
  async function remove(id: string) {
    if (!confirm("حذف هذا الإعلان؟")) return;
    await deleteOrgAnnouncement(id); await load();
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="font-extrabold text-primary text-lg">الإعلانات ({items.length})</h2>
        <button onClick={() => setEditing({ is_public: true, pinned: false })}
          className="btn-primary px-4 py-2 rounded-xl text-sm">+ إعلان جديد</button>
      </div>

      {loading ? (
        <div className="text-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 text-sm">ما في إعلانات بعد</div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {a.pinned && <span className="text-xs">📌</span>}
                  <span className="font-bold text-primary">{a.title}</span>
                  {!a.is_public && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">مخفي</span>}
                </div>
                {a.body && <p className="text-sm text-gray-600 line-clamp-2">{a.body}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(a)} className="text-blue-600 text-sm px-2 py-1 hover:bg-blue-50 rounded">تعديل</button>
                <button onClick={() => remove(a.id)} className="text-red-600 text-sm px-2 py-1 hover:bg-red-50 rounded">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "تعديل إعلان" : "إعلان جديد"}>
          <input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            placeholder="عنوان الإعلان" className={inputCls} />
          <textarea value={editing.body || ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })}
            rows={4} placeholder="نص الإعلان" className={inputCls} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.pinned ?? false}
              onChange={(e) => setEditing({ ...editing, pinned: e.target.checked })} />
            📌 تثبيت في الأعلى
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.is_public ?? true}
              onChange={(e) => setEditing({ ...editing, is_public: e.target.checked })} />
            ظاهر للعامة
          </label>
          <div className="flex gap-2 pt-2">
            <button onClick={save} disabled={!editing.title}
              className="btn-primary flex-1 py-2.5 rounded-xl disabled:opacity-50">حفظ</button>
            <button onClick={() => setEditing(null)} className="px-5 py-2.5 bg-gray-100 rounded-xl font-bold">إلغاء</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ════════════ SCHOLARSHIPS ════════════ */
function ScholarshipsSection({ orgId, userId }: { orgId: string; userId: string }) {
  const [items, setItems] = useState<OrgScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<OrgScholarship> | null>(null);

  const load = useCallback(async () => {
    setItems(await fetchOrgScholarships(orgId)); setLoading(false);
  }, [orgId]);
  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing?.title) return;
    const newPublic = !editing.id && (editing.is_public ?? true);
    const title = editing.title;
    await saveOrgScholarship({ ...editing, org_id: orgId } as OrgScholarship & { org_id: string }, userId);
    if (newPublic) void emit("org.published_scholarship", { org_id: orgId, entity_type: "scholarship", title });
    setEditing(null); await load();
  }
  async function remove(id: string) {
    if (!confirm("حذف هذه المنحة؟")) return;
    await deleteOrgScholarship(id); await load();
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="font-extrabold text-primary text-lg">المنح ({items.length})</h2>
        <button onClick={() => setEditing({ is_public: true, coverage: "full" })}
          className="btn-primary px-4 py-2 rounded-xl text-sm">+ منحة جديدة</button>
      </div>

      {loading ? (
        <div className="text-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400 text-sm">ما في منح بعد — أضف منح مؤسستك ليشوفها الطلاب على صفحتك.</div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-primary">{s.title}</span>
                  {s.amount && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{s.amount}</span>}
                  {!s.is_public && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">مخفية</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {s.coverage === "full" ? "🎓 ممولة بالكامل" : s.coverage === "partial" ? "💸 جزئية" : "منحة"}
                  {s.deadline && ` · ⏰ آخر موعد ${new Date(s.deadline).toLocaleDateString("ar")}`}
                </div>
                {s.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{s.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(s)} className="text-blue-600 text-sm px-2 py-1 hover:bg-blue-50 rounded">تعديل</button>
                <button onClick={() => remove(s.id)} className="text-red-600 text-sm px-2 py-1 hover:bg-red-50 rounded">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "تعديل منحة" : "منحة جديدة"}>
          <input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            placeholder="عنوان المنحة" className={inputCls} />
          <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            rows={3} placeholder="تفاصيل المنحة وشروطها" className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <input value={editing.amount || ""} onChange={(e) => setEditing({ ...editing, amount: e.target.value })}
              placeholder="القيمة (مثلاً: ممولة بالكامل)" className={inputCls} />
            <select value={editing.coverage || "full"} onChange={(e) => setEditing({ ...editing, coverage: e.target.value })}
              className={inputCls + " bg-white"}>
              <option value="full">ممولة بالكامل</option>
              <option value="partial">جزئية</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <label className="text-xs font-bold text-gray-600 block">آخر موعد للتقديم (اختياري)
            <input type="date" value={editing.deadline || ""} onChange={(e) => setEditing({ ...editing, deadline: e.target.value || undefined })} className={inputCls} />
          </label>
          <input value={editing.link || ""} onChange={(e) => setEditing({ ...editing, link: e.target.value })}
            dir="ltr" placeholder="رابط التقديم (اختياري)" className={inputCls} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.is_public ?? true}
              onChange={(e) => setEditing({ ...editing, is_public: e.target.checked })} />
            ظاهرة للعامة على صفحة المؤسسة
          </label>
          <div className="flex gap-2 pt-2">
            <button onClick={save} disabled={!editing.title}
              className="btn-primary flex-1 py-2.5 rounded-xl disabled:opacity-50">حفظ</button>
            <button onClick={() => setEditing(null)} className="px-5 py-2.5 bg-gray-100 rounded-xl font-bold">إلغاء</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ════════════ STUDENTS ════════════ */
function StudentsSection({ orgId, userId }: { orgId: string; userId: string }) {
  const [pending, setPending] = useState<OrgAffiliation[]>([]);
  const [verified, setVerified] = useState<OrgAffiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [p, v] = await Promise.all([
      fetchOrgAffiliations(orgId, "pending"),
      fetchOrgAffiliations(orgId, "verified"),
    ]);
    setPending(p); setVerified(v); setLoading(false);
  }, [orgId]);
  useEffect(() => { load(); }, [load]);

  async function accept(a: OrgAffiliation) {
    setBusy(a.id); await verifyAffiliation(a.id, userId); await load(); setBusy(null);
  }
  async function decline(a: OrgAffiliation) {
    setBusy(a.id); await rejectAffiliation(a.id, userId); await load(); setBusy(null);
  }
  async function drop(a: OrgAffiliation) {
    if (!confirm("إزالة هذا الطالب من المؤسسة؟")) return;
    setBusy(a.id); await removeAffiliation(a.id); await load(); setBusy(null);
  }

  if (loading) {
    return <div className="text-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Pending requests */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-extrabold text-primary text-lg mb-4">
          طلبات الانتساب {pending.length > 0 && <span className="text-amber-600">({pending.length})</span>}
        </h2>
        {pending.length === 0 ? (
          <p className="text-center text-gray-400 py-6 text-sm">ما في طلبات جديدة</p>
        ) : (
          <div className="space-y-3">
            {pending.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                <Avatar name={a.student_name} url={a.student_avatar} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 text-sm">{a.student_name || "طالب"}</div>
                  <div className="text-xs text-gray-500">
                    {AFFILIATION_LABEL[a.affiliation]}
                    {a.program && ` · ${a.program}`}
                    {a.grad_year && ` · ${a.grad_year}`}
                  </div>
                </div>
                <button onClick={() => accept(a)} disabled={busy === a.id}
                  className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50">
                  قبول
                </button>
                <button onClick={() => decline(a)} disabled={busy === a.id}
                  className="border border-red-300 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50">
                  رفض
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified students */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-700 mb-4">الطلاب المنتسبون ({verified.length})</h3>
        {verified.length === 0 ? (
          <p className="text-center text-gray-400 py-6 text-sm">ما في طلاب منتسبين بعد</p>
        ) : (
          <div className="space-y-2">
            {verified.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
                <Avatar name={a.student_name} url={a.student_avatar} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm">{a.student_name || "طالب"}</div>
                  <div className="text-xs text-gray-500">
                    {AFFILIATION_LABEL[a.affiliation]}
                    {!a.is_public && " · 🔒 مخفي من الصفحة العامة"}
                  </div>
                </div>
                <button onClick={() => drop(a)} disabled={busy === a.id}
                  className="text-red-500 text-xs px-2 py-1 hover:bg-red-50 rounded disabled:opacity-50">
                  إزالة
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ name, url }: { name: string | null; url: string | null }) {
  return (
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0 overflow-hidden">
      {url
        ? /* eslint-disable-next-line @next/next/no-img-element */
          <img src={url} alt="" className="w-full h-full object-cover" />
        : (name || "ط")[0]}
    </div>
  );
}

/* ════════════ shared bits ════════════ */
const inputCls = "w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-1.5">
        {label}{hint && <span className="text-gray-400 font-normal text-xs"> — {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Social({ icon, label, value, onChange }: {
  icon: string; label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-2 focus-within:border-primary">
      <span className="text-lg">{icon}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} dir="ltr" placeholder={label}
        className="flex-1 text-sm focus:outline-none bg-transparent min-w-0" />
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-primary">{title}</h2>
        {children}
      </div>
    </div>
  );
}
