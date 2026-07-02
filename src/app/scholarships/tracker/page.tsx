"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { emit } from '@/lib/events/emit';
import { confirmAction, toast } from '@/lib/notify';
import { useI18n, type TranslationKey } from "@/lib/i18n";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = "saved" | "applied" | "accepted" | "rejected" | "withdrawn";

interface TrackerItem {
  id: number;
  scholarship_id: number;
  status: Status;
  notes: string | null;
  app_deadline: string | null;
  updated_at: string;
  scholarships: {
    name: string;
    org: string | null;
    deadline: string | null;
    amount: string | null;
    emoji: string | null;
  };
}

interface Scholarship {
  id: number;
  name: string;
  org: string | null;
  deadline: string | null;
  amount: string | null;
  emoji: string | null;
  description: string | null;
  type: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<Status, { labelKey: string; color: string; bg: string; icon: string }> = {
  saved:     { labelKey: "schtrack.status.saved",     color: "#4338ca", bg: "#f0f4ff", icon: "🔖" },
  applied:   { labelKey: "schtrack.status.applied",   color: "#d97706", bg: "#fffbeb", icon: "📤" },
  accepted:  { labelKey: "schtrack.status.accepted",  color: "#15803d", bg: "#f0fdf4", icon: "✅" },
  rejected:  { labelKey: "schtrack.status.rejected",  color: "#dc2626", bg: "#fff1f2", icon: "❌" },
  withdrawn: { labelKey: "schtrack.status.withdrawn", color: "#6b7280", bg: "#f8fafc", icon: "↩️" },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ScholarshipTrackerPage() {
  const { t } = useI18n();
  const [userId,       setUserId]       = useState<string | null>(null);
  const [items,        setItems]        = useState<TrackerItem[]>([]);
  const [allSchols,    setAllSchols]    = useState<Scholarship[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState<Status | "all">("all");
  const [editingId,    setEditingId]    = useState<number | null>(null);
  const [editNotes,    setEditNotes]    = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editStatus,   setEditStatus]   = useState<Status>("saved");
  const [addOpen,      setAddOpen]      = useState(false);
  const [addId,        setAddId]        = useState<number | "">("");
  const [saving,       setSaving]       = useState(false);

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) =>
      setUserId(s?.user?.id ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  // Load tracker items
  const loadItems = async () => {
    if (!userId) { setLoading(false); return; }
    const res  = await fetch(`/api/scholarship-tracker?userId=${userId}`);
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => { setLoading(true); loadItems(); }, [userId]);

  // Load all scholarships for "Add" dialog
  useEffect(() => {
    supabase
      .from("scholarships")
      .select("id, name, org, deadline, amount, emoji, description, type")
      .eq("active", true)
      .order("name")
      .then(({ data }) => setAllSchols((data as Scholarship[]) || []));
  }, []);

  // Save/update item
  const save = async (scholarshipId: number, status: Status, notes?: string, appDeadline?: string) => {
    if (!userId) return;
    setSaving(true);
    await fetch("/api/scholarship-tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, scholarshipId, status, notes, appDeadline }),
    });
    if (status === 'applied') {
      void emit('student.applied_scholarship', { entity_type: 'scholarship', entity_id: String(scholarshipId) });
    }
    await loadItems();
    setSaving(false);
    setEditingId(null);
    setAddOpen(false);
    setAddId("");
  };

  const remove = async (scholarshipId: number) => {
    if (!userId) return;
    const ok = await confirmAction(t('schtrack.confirm.remove'), { danger: true, confirmLabel: t('schtrack.confirm.removeBtn') });
    if (!ok) return;
    const res = await fetch(`/api/scholarship-tracker?userId=${userId}&scholarshipId=${scholarshipId}`, { method: "DELETE" });
    if (!res.ok) { toast(t('schtrack.toast.deleteFailed'), 'warn'); return; }
    setItems(p => p.filter(i => i.scholarship_id !== scholarshipId));
    toast(t('schtrack.toast.deleted'), 'ok');
  };

  // Stats
  const counts = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s as Status] = items.filter(i => i.status === s).length;
    return acc;
  }, {} as Record<Status, number>);

  const filtered = tab === "all" ? items : items.filter(i => i.status === tab);
  const trackedIds = new Set(items.map(i => i.scholarship_id));
  const untracked  = allSchols.filter(s => !trackedIds.has(s.id));

  // Not signed in
  if (!loading && !userId) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem", fontFamily: "Inter, sans-serif" }}>
      <div style={{ fontSize: 60 }}>🎓</div>
      <h2 style={{ color: "#1a1a2e", fontWeight: 800 }}>{t('schtrack.signin.title')}</h2>
      <p style={{ color: "#666", textAlign: "center" }}>{t('schtrack.signin.subtitle')}</p>
      <Link href="/auth/login" style={{
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        color: "#fff", padding: "0.85rem 2rem", borderRadius: 12,
        fontWeight: 700, textDecoration: "none", fontSize: 16,
      }}>
        {t('schtrack.signin.button')}
      </Link>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0E7C7B 0%, #065a59 100%)", padding: "2rem 1.5rem 3rem" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Link href="/scholarships" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14 }}>
            {t('schtrack.header.back')}
          </Link>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: "0.75rem 0 0.25rem", direction: "rtl" }}>
            🎓 {t('schtrack.header.title')}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", margin: 0, fontSize: 14, direction: "rtl" }}>
            {t('schtrack.header.subtitle')}
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
            {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([s, cfg]) => (
              <div key={s} style={{
                background: "rgba(255,255,255,0.15)", borderRadius: 10,
                padding: "0.5rem 0.85rem", textAlign: "center",
              }}>
                <div style={{ color: "#fff", fontWeight: 800 }}>{cfg.icon} {counts[s]}</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{t(cfg.labelKey as TranslationKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main card */}
      <div style={{ maxWidth: 800, margin: "-1.5rem auto 0", padding: "0 1.5rem" }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden" }}>

          {/* Toolbar */}
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {([["all", t('schtrack.tab.all'), "📋"]] as [string, string, string][]).concat(
                Object.entries(STATUS_CONFIG).map(([s, c]) => [s, t(c.labelKey as TranslationKey), c.icon] as [string, string, string])
              ).map(([s, label, icon]) => (
                <button key={s} onClick={() => setTab(s as Status | "all")} style={{
                  padding: "0.35rem 0.75rem", borderRadius: 99, border: "none", cursor: "pointer",
                  fontWeight: 600, fontSize: 12,
                  background: tab === s ? "#0E7C7B" : "#f0f0f0",
                  color: tab === s ? "#fff" : "#555",
                  transition: "all 0.15s",
                }}>
                  {icon} {label} {s !== "all" ? `(${counts[s as Status]})` : `(${items.length})`}
                </button>
              ))}
            </div>

            {/* Add button */}
            <button onClick={() => setAddOpen(true)} style={{
              padding: "0.5rem 1rem", borderRadius: 10, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #0E7C7B, #065a59)",
              color: "#fff", fontWeight: 700, fontSize: 13,
            }}>
              {t('schtrack.addBtn')}
            </button>
          </div>

          <div style={{ padding: "1rem 1.5rem" }}>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>{t('schtrack.loading')}</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎓</div>
                <p style={{ color: "#999" }}>
                  {tab === "all" ? t('schtrack.empty.all') : t('schtrack.empty.status')}
                </p>
                <Link href="/scholarships" style={{ color: "#0E7C7B", fontWeight: 600, fontSize: 14 }}>
                  {t('schtrack.browseAvailable')}
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {filtered.map(item => {
                  const cfg = STATUS_CONFIG[item.status];
                  const isEditing = editingId === item.id;
                  const sch = item.scholarships;
                  return (
                    <div key={item.id} style={{
                      background: cfg.bg, borderRadius: 12,
                      border: `1px solid ${cfg.color}30`,
                      padding: "1rem",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            <span style={{ fontSize: 20 }}>{sch.emoji || "🏆"}</span>
                            <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e", direction: "rtl" }}>{sch.name}</span>
                            <span style={{
                              background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`,
                              borderRadius: 99, padding: "0.2rem 0.6rem", fontSize: 11, fontWeight: 700,
                            }}>
                              {cfg.icon} {t(cfg.labelKey as TranslationKey)}
                            </span>
                          </div>
                          <div style={{ marginTop: 4, display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                            {sch.org && <span style={{ fontSize: 12, color: "#666" }}>🏛 {sch.org}</span>}
                            {sch.amount && <span style={{ fontSize: 12, color: "#666" }}>💰 {sch.amount}</span>}
                            {sch.deadline && <span style={{ fontSize: 12, color: "#e56" }}>📅 {t('schtrack.deadline')}: {sch.deadline}</span>}
                            {item.app_deadline && <span style={{ fontSize: 12, color: "#d97706" }}>⏰ {t('schtrack.appliedBy')}: {item.app_deadline}</span>}
                          </div>
                          {item.notes && !isEditing && (
                            <div style={{ marginTop: 6, fontSize: 13, color: "#555", background: "rgba(255,255,255,0.6)", borderRadius: 6, padding: "0.4rem 0.6rem", direction: "rtl" }}>
                              📝 {item.notes}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                          <button onClick={() => {
                            setEditingId(isEditing ? null : item.id);
                            setEditNotes(item.notes || "");
                            setEditDeadline(item.app_deadline || "");
                            setEditStatus(item.status);
                          }} style={{
                            padding: "0.35rem 0.65rem", borderRadius: 8, border: "1px solid #ddd",
                            background: "#fff", cursor: "pointer", fontSize: 13,
                          }}>
                            {isEditing ? t('schtrack.cancel') : "✏️"}
                          </button>
                          <button onClick={() => remove(item.scholarship_id)} style={{
                            padding: "0.35rem 0.65rem", borderRadius: 8, border: "1px solid #fee",
                            background: "#fff5f5", color: "#dc2626", cursor: "pointer", fontSize: 13,
                          }}>
                            🗑
                          </button>
                        </div>
                      </div>

                      {/* Edit panel */}
                      {isEditing && (
                        <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>{t('schtrack.field.status')}</label>
                              <select value={editStatus} onChange={e => setEditStatus(e.target.value as Status)} style={{
                                width: "100%", padding: "0.5rem", borderRadius: 8, border: "1px solid #ddd",
                                fontSize: 13, outline: "none", background: "#fff",
                              }}>
                                {Object.entries(STATUS_CONFIG).map(([s, c]) => (
                                  <option key={s} value={s}>{c.icon} {t(c.labelKey as TranslationKey)}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>{t('schtrack.field.applyDate')}</label>
                              <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} style={{
                                width: "100%", padding: "0.5rem", borderRadius: 8, border: "1px solid #ddd",
                                fontSize: 13, outline: "none", boxSizing: "border-box" as const,
                              }} />
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>{t('schtrack.field.notes')}</label>
                            <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2}
                              placeholder={t('schtrack.field.notesPlaceholder')}
                              style={{ width: "100%", padding: "0.5rem", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const, direction: "rtl" }} />
                          </div>
                          <button onClick={() => save(item.scholarship_id, editStatus, editNotes, editDeadline)} disabled={saving} style={{
                            padding: "0.6rem", borderRadius: 8, border: "none", cursor: "pointer",
                            background: "#0E7C7B", color: "#fff", fontWeight: 700, fontSize: 13,
                          }}>
                            {saving ? t('schtrack.saving') : t('schtrack.saveChanges')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Add Scholarship Modal */}
        {addOpen && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100,
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }} onClick={e => { if (e.target === e.currentTarget) setAddOpen(false); }}>
            <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 600, padding: "1.5rem", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontWeight: 800, color: "#1a1a2e", direction: "rtl" }}>{t('schtrack.modal.title')}</h3>
                <button onClick={() => setAddOpen(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
              </div>

              {untracked.length === 0 ? (
                <div style={{ textAlign: "center", padding: "1rem", color: "#999" }}>{t('schtrack.modal.allTracked')}</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {untracked.map(s => (
                    <div key={s.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.75rem 1rem", borderRadius: 10, background: "#f8fafc",
                      border: addId === s.id ? "2px solid #0E7C7B" : "1px solid #e8e8e8",
                      cursor: "pointer",
                    }} onClick={() => setAddId(s.id)}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e", direction: "rtl" }}>
                          {s.emoji || "🏆"} {s.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#888", direction: "rtl" }}>
                          {s.org} · {s.amount} · {s.deadline}
                        </div>
                      </div>
                      {addId === s.id && <span style={{ color: "#0E7C7B", fontWeight: 700, fontSize: 18 }}>✓</span>}
                    </div>
                  ))}
                </div>
              )}

              {addId !== "" && (
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                  {(["saved", "applied"] as Status[]).map(s => (
                    <button key={s} onClick={() => save(addId as number, s)} disabled={saving} style={{
                      flex: 1, padding: "0.75rem", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
                      background: s === "saved" ? "#f0f4ff" : "#0E7C7B",
                      color: s === "saved" ? "#4338ca" : "#fff",
                    }}>
                      {STATUS_CONFIG[s].icon} {t(STATUS_CONFIG[s].labelKey as TranslationKey)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ height: "3rem" }} />
      </div>
    </div>
  );
}
