"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useI18n, type TranslationKey } from "@/lib/i18n";

type AppType = "university" | "scholarship" | "internship";
type AppStatus = "drafting" | "submitted" | "interviewing" | "accepted" | "rejected" | "waitlist";

interface Application {
  id: string;
  type: AppType;
  institution: string;
  program?: string;
  deadline: string;
  status: AppStatus;
  notes?: string;
  createdAt: string;
}

const TYPE_META: Record<AppType, { labelKey: TranslationKey; emoji: string; color: string }> = {
  university:  { labelKey: "at.type.university",  emoji: "🏛️", color: "bg-blue-100 text-blue-800" },
  scholarship: { labelKey: "at.type.scholarship", emoji: "🏆", color: "bg-amber-100 text-amber-800" },
  internship:  { labelKey: "at.type.internship",  emoji: "💼", color: "bg-emerald-100 text-emerald-800" },
};

const STATUS_META: Record<AppStatus, { labelKey: TranslationKey; color: string }> = {
  drafting:     { labelKey: "at.status.drafting",     color: "bg-gray-100 text-gray-800" },
  submitted:    { labelKey: "at.status.submitted",    color: "bg-blue-100 text-blue-800" },
  interviewing: { labelKey: "at.status.interviewing", color: "bg-purple-100 text-purple-800" },
  accepted:     { labelKey: "at.status.accepted",     color: "bg-emerald-100 text-emerald-800" },
  rejected:     { labelKey: "at.status.rejected",     color: "bg-red-100 text-red-800" },
  waitlist:     { labelKey: "at.status.waitlist",     color: "bg-orange-100 text-orange-800" },
};

const STORAGE_KEY = "masarak_applications";

export default function ApplicationTrackerPage() {
  const { t, dir, locale } = useI18n();
  const [apps, setApps] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<AppType | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setApps(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  function save(updated: Application[]) {
    setApps(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  function addOrUpdate(formData: FormData) {
    const id = editingId || Date.now().toString();
    const app: Application = {
      id,
      type: formData.get("type") as AppType,
      institution: String(formData.get("institution") || ""),
      program: String(formData.get("program") || "") || undefined,
      deadline: String(formData.get("deadline") || ""),
      status: formData.get("status") as AppStatus,
      notes: String(formData.get("notes") || "") || undefined,
      createdAt: new Date().toISOString(),
    };
    const updated = editingId
      ? apps.map((a) => (a.id === editingId ? app : a))
      : [...apps, app];
    save(updated);
    setShowForm(false);
    setEditingId(null);
  }

  function deleteApp(id: string) {
    if (!confirm(t("at.confirm.delete"))) return;
    save(apps.filter((a) => a.id !== id));
  }

  function startEdit(app: Application) {
    setEditingId(app.id);
    setShowForm(true);
  }

  const filtered = useMemo(() => {
    const list = filterType === "all" ? apps : apps.filter((a) => a.type === filterType);
    return [...list].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [apps, filterType]);

  const editing = editingId ? apps.find((a) => a.id === editingId) : null;

  const stats = useMemo(() => {
    const now = Date.now();
    return {
      total: apps.length,
      submitted: apps.filter((a) => ["submitted", "interviewing", "accepted"].includes(a.status)).length,
      upcoming: apps.filter((a) => {
        const d = new Date(a.deadline).getTime();
        return d - now > 0 && d - now < 14 * 24 * 60 * 60 * 1000;
      }).length,
      accepted: apps.filter((a) => a.status === "accepted").length,
    };
  }, [apps]);

  return (
    <main className="min-h-screen bg-bg py-8 px-4" dir={dir}>
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
            {t('g.back')}
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary">
                {t('at.title')}
              </h1>
              <p className="text-gray-600 mt-2">
                {t('at.subtitle')}
              </p>
            </div>
            <button
              onClick={() => { setEditingId(null); setShowForm(true); }}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90"
            >
              {t('at.btn.add')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-gray-600 mt-1">{t('at.stat.total')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-3xl font-bold text-blue-600">{stats.submitted}</div>
            <div className="text-xs text-gray-600 mt-1">{t('at.stat.submitted')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-3xl font-bold text-orange-600">{stats.upcoming}</div>
            <div className="text-xs text-gray-600 mt-1">{t('at.stat.upcoming')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-3xl font-bold text-emerald-600">{stats.accepted}</div>
            <div className="text-xs text-gray-600 mt-1">{t('at.stat.accepted')}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              filterType === "all" ? "bg-primary text-white" : "bg-white border border-gray-300"
            }`}
          >
            {t('at.filter.all')} ({apps.length})
          </button>
          {(Object.keys(TYPE_META) as AppType[]).map((ty) => (
            <button
              key={ty}
              onClick={() => setFilterType(ty)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                filterType === ty ? "bg-primary text-white" : "bg-white border border-gray-300"
              }`}
            >
              {TYPE_META[ty].emoji} {t(TYPE_META[ty].labelKey)}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-bold mb-2">{t('at.empty.title')}</h3>
            <p className="text-gray-600 mb-4">{t('at.empty.subtitle')}</p>
            <button
              onClick={() => { setEditingId(null); setShowForm(true); }}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold"
            >
              {t('at.btn.add_short')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => {
              const days = Math.ceil(
                (new Date(app.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div key={app.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${TYPE_META[app.type].color}`}>
                          {TYPE_META[app.type].emoji} {t(TYPE_META[app.type].labelKey)}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${STATUS_META[app.status].color}`}>
                          {t(STATUS_META[app.status].labelKey)}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg">{app.institution}</h3>
                      {app.program && (<p className="text-sm text-gray-600 mt-1">{app.program}</p>)}
                      <div className="text-sm mt-2">
                        <span className="text-gray-600">{t('at.deadline_label')} </span>
                        <span className="font-semibold">
                          {new Date(app.deadline).toLocaleDateString(locale === 'ar' ? 'ar-LB' : 'en-US')}
                        </span>
                        {days >= 0 && days <= 14 && (
                          <span className="ml-2 text-orange-600 font-bold">
                            ({days} {t('at.days_left')})
                          </span>
                        )}
                        {days < 0 && (
                          <span className="ml-2 text-red-600 font-bold">({t('at.expired')})</span>
                        )}
                      </div>
                      {app.notes && (
                        <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                          {app.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(app)}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        {t('at.btn.edit')}
                      </button>
                      <button
                        onClick={() => deleteApp(app.id)}
                        className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        {t('at.btn.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editing ? t('at.form.edit_title') : t('at.form.add_title')}
              </h2>
              <form
                onSubmit={(e) => { e.preventDefault(); addOrUpdate(new FormData(e.currentTarget)); }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold mb-1">{t('at.field.type')}</label>
                  <select
                    name="type"
                    defaultValue={editing?.type || "university"}
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
                  >
                    <option value="university">🏛️ {t('at.type.university')}</option>
                    <option value="scholarship">🏆 {t('at.type.scholarship')}</option>
                    <option value="internship">💼 {t('at.type.internship')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{t('at.field.institution')}</label>
                  <input
                    name="institution"
                    defaultValue={editing?.institution || ""}
                    required
                    placeholder={t('at.field.institution.ph')}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{t('at.field.program')}</label>
                  <input
                    name="program"
                    defaultValue={editing?.program || ""}
                    placeholder={t('at.field.program.ph')}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{t('at.field.deadline')}</label>
                  <input
                    type="date"
                    name="deadline"
                    defaultValue={editing?.deadline || ""}
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{t('at.field.status')}</label>
                  <select
                    name="status"
                    defaultValue={editing?.status || "drafting"}
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
                  >
                    {(Object.keys(STATUS_META) as AppStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {t(STATUS_META[s].labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{t('at.field.notes')}</label>
                  <textarea
                    name="notes"
                    defaultValue={editing?.notes || ""}
                    rows={3}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingId(null); }}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold"
                  >
                    {t('at.btn.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold"
                  >
                    {editing ? t('at.btn.save_edit') : t('at.btn.add_save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-8">
          {t('at.disclaimer')}
        </p>
      </div>
    </main>
  );
}
