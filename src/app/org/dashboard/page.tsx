"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  fetchMyOrgs, updateOrg, ORG_TYPE_LABEL,
  type Organization, type OrgRole,
} from "@/lib/org";
import { useI18n } from "@/lib/i18n";

interface MyOrgRow {
  id: string;            // membership id
  role: OrgRole;
  org_id: string;
  organizations: {
    id: string; slug: string; display_name: string;
    org_type: Organization["org_type"]; logo_url: string | null;
    verification_status: Organization["verification_status"];
  };
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  unclaimed: { label: "غير مُدارة", cls: "bg-gray-100 text-gray-600" },
  pending:   { label: "قيد المراجعة", cls: "bg-amber-100 text-amber-700" },
  verified:  { label: "✓ مؤكّدة", cls: "bg-green-100 text-green-700" },
  rejected:  { label: "مرفوضة", cls: "bg-red-100 text-red-700" },
};

export default function OrgDashboardPage() {
  const router = useRouter();
  const { dir } = useI18n();
  const [loading, setLoading] = useState(true);
  const [myOrgs, setMyOrgs] = useState<MyOrgRow[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);

  // editable fields
  const [tagline, setTagline] = useState("");
  const [about, setAbout] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/auth/login?next=/org/dashboard"); return; }
      const mine = (await fetchMyOrgs(data.user.id)) as unknown as MyOrgRow[];
      if (mine.length === 0) { router.push("/org/claim"); return; }
      setMyOrgs(mine);
      setActiveOrgId(mine[0].org_id);
      setLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (!activeOrgId) return;
    setOrgLoading(true);
    supabase.from("organizations").select("*").eq("id", activeOrgId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          const o = data as Organization;
          setOrg(o);
          setTagline(o.tagline || "");
          setAbout(o.about || "");
          setLogoUrl(o.logo_url || "");
          setBannerUrl(o.banner_url || "");
          setInstagram(o.social?.instagram || "");
          setFacebook(o.social?.facebook || "");
          setLinkedin(o.social?.linkedin || "");
          setWebsite(o.social?.website || "");
        }
        setOrgLoading(false);
      });
  }, [activeOrgId]);

  async function handleSave() {
    if (!org) return;
    setSaving(true); setSaved(false);
    const { error } = await updateOrg(org.id, {
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
    });
    setSaving(false);
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg" dir={dir}>
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeRow = myOrgs.find((m) => m.org_id === activeOrgId);
  const badge = org ? STATUS_BADGE[org.verification_status] : null;

  return (
    <main className="min-h-screen bg-bg py-8 px-4" dir={dir}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-primary">← لوحتي</Link>
            <h1 className="text-2xl font-extrabold text-primary mt-1">لوحة إدارة المؤسسة</h1>
          </div>
          {activeRow && (
            <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-full">
              صلاحيتك: {activeRow.role}
            </span>
          )}
        </div>

        {/* Org switcher (if user manages multiple) */}
        {myOrgs.length > 1 && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {myOrgs.map((m) => (
              <button key={m.org_id} onClick={() => setActiveOrgId(m.org_id)}
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
            {/* Org header card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0">
                {logoUrl
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={logoUrl} alt="" className="w-full h-full object-contain rounded-2xl" />
                  : "🏛️"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-primary text-lg">{org.display_name}</div>
                <div className="text-xs text-gray-500">{ORG_TYPE_LABEL[org.org_type]}</div>
              </div>
              {badge && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
              )}
            </div>

            {/* Status banners */}
            {org.verification_status === "pending" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-5">
                ⏳ طلبك قيد المراجعة من فريق مسارك. تقدر تجهّز محتوى صفحتك من الآن — رح يظهر للعامة بعد التأكيد.
              </div>
            )}
            {org.verification_status === "verified" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 mb-5 flex items-center justify-between gap-2">
                <span>✓ صفحتك مؤكّدة وظاهرة للطلاب.</span>
                {org.entity_id && (
                  <Link
                    href={
                      org.org_type === "university" ? `/universities/${org.entity_id}`
                      : org.org_type === "school" ? `/schools/${org.entity_id}`
                      : `/vocational/institute/${org.entity_id}`
                    }
                    className="font-bold underline whitespace-nowrap"
                  >
                    شوف صفحتك ←
                  </Link>
                )}
              </div>
            )}

            {/* Section tabs (Phase 1: only Info is active) */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {[
                { key: "info", label: "📋 المعلومات", active: true },
                { key: "media", label: "🖼️ الوسائط", active: false },
                { key: "events", label: "📅 الفعاليات", active: false },
                { key: "students", label: "👨‍🎓 الطلاب", active: false },
              ].map((s) => (
                <span key={s.key}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${
                    s.active ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                  {s.label}{!s.active && " · قريباً"}
                </span>
              ))}
            </div>

            {/* ── INFO EDITOR ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <h2 className="font-extrabold text-primary text-lg">معلومات الصفحة</h2>

              <Field label="الشعار (Tagline)" hint="جملة قصيرة تلخّص مؤسستك">
                <input value={tagline} onChange={(e) => setTagline(e.target.value)}
                  maxLength={120}
                  placeholder="مثال: نبني قادة الغد منذ 1875"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
              </Field>

              <Field label="نبذة عن المؤسسة">
                <textarea value={about} onChange={(e) => setAbout(e.target.value)}
                  rows={5} maxLength={2000}
                  placeholder="عرّف بمؤسستك، رؤيتها، وما يميّزها..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="رابط الشعار (Logo URL)">
                  <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} dir="ltr"
                    placeholder="https://..."
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </Field>
                <Field label="رابط البانر (Banner URL)">
                  <input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} dir="ltr"
                    placeholder="https://..."
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
                </Field>
              </div>

              <div>
                <h3 className="font-bold text-gray-700 text-sm mb-3">روابط التواصل الاجتماعي</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <SocialInput icon="🌐" label="الموقع الرسمي" value={website} onChange={setWebsite} />
                  <SocialInput icon="📷" label="Instagram" value={instagram} onChange={setInstagram} />
                  <SocialInput icon="👍" label="Facebook" value={facebook} onChange={setFacebook} />
                  <SocialInput icon="💼" label="LinkedIn" value={linkedin} onChange={setLinkedin} />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="btn-primary px-6 py-3 rounded-xl disabled:opacity-50">
                  {saving ? "جاري الحفظ..." : "💾 حفظ التغييرات"}
                </button>
                {saved && <span className="text-sm text-green-600 font-bold">✓ تم الحفظ</span>}
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-6">
              الأدوات الإضافية (الوسائط، الفعاليات، إدارة الطلاب) رح تنفتح بالمراحل الجاية.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

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

function SocialInput({ icon, label, value, onChange }: {
  icon: string; label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-2 focus-within:border-primary">
      <span className="text-lg">{icon}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} dir="ltr"
        placeholder={label}
        className="flex-1 text-sm focus:outline-none bg-transparent min-w-0" />
    </div>
  );
}
