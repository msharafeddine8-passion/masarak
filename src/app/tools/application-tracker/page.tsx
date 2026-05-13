"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

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

const TYPE_LABELS: Record<AppType, { label: string; emoji: string; color: string }> = {
  university: { label: "جامعة", emoji: "🏛️", color: "bg-blue-100 text-blue-800" },
  scholarship: { label: "منحة", emoji: "🏆", color: "bg-amber-100 text-amber-800" },
  internship: { label: "تدريب", emoji: "💼", color: "bg-emerald-100 text-emerald-800" },
};

const STATUS_LABELS: Record<AppStatus, { label: string; color: string }> = {
  drafting: { label: "جارٍ التحضير", color: "bg-gray-100 text-gray-800" },
  submitted: { label: "تم التقديم", color: "bg-blue-100 text-blue-800" },
  interviewing: { label: "مقابلة", color: "bg-purple-100 text-purple-800" },
  accepted: { label: "مقبول", color: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-800" },
  waitlist: { label: "قائمة انتظار", color: "bg-orange-100 text-orange-800" },
};

const STORAGE_KEY = "masarak_applications";

export default function ApplicationTrackerPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<AppType | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setApps(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save to localStorage
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
    if (!confirm("متأكد بدّك تحذف هالطلب؟")) return;
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
    <main className="min-h-screen bg-bg py-8 px-4" dir="rtl">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
            ← العودة
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary">
                📋 متتبّع الطلبات
              </h1>
              <p className="text-gray-600 mt-2">
                تابع كل طلباتك للجامعات والمنح والتدريب في مكان واحد
              </p>
            </div>
            <button
              onClick={() => {
                setEditingId(null);
                setShowForm(true);
              }}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90"
            >
              + إضافة طلب جديد
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-gray-600 mt-1">إجمالي الطلبات</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-3xl font-bold text-blue-600">{stats.submitted}</div>
            <div className="text-xs text-gray-600 mt-1">تم تقديمها</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-3xl font-bold text-orange-600">{stats.upcoming}</div>
            <div className="text-xs text-gray-600 mt-1">مواعيد قريبة</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-3xl font-bold text-emerald-600">{stats.accepted}</div>
            <div className="text-xs text-gray-600 mt-1">مقبولة 🎉</div>
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
            الكل ({apps.length})
          </button>
          {(Object.keys(TYPE_LABELS) as AppType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                filterType === t ? "bg-primary text-white" : "bg-white border border-gray-300"
              }`}
            >
              {TYPE_LABELS[t].emoji} {TYPE_LABELS[t].label}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-bold mb-2">لا توجد طلبات بعد</h3>
            <p className="text-gray-600 mb-4">ابدأ بإضافة أول طلب لتتبّعه</p>
            <button
              onClick={() => {
                setEditingId(null);
                setShowForm(true);
              }}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold"
            >
              + إضافة طلب
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
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${TYPE_LABELS[app.type].color}`}
                        >
                          {TYPE_LABELS[app.type].emoji} {TYPE_LABELS[app.type].label}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${STATUS_LABELS[app.status].color}`}
                        >
                          {STATUS_LABELS[app.status].label}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg">{app.institution}</h3>
                      {app.program && (
                        <p className="text-sm text-gray-600 mt-1">{app.program}</p>
                      )}
                      <div className="text-sm mt-2">
                        <span className="text-gray-600">الموعد النهائي: </span>
                        <span className="font-semibold">
                          {new Date(app.deadline).toLocaleDateString("ar-LB")}
                        </span>
                        {days >= 0 && days <= 14 && (
                          <span className="ml-2 text-orange-600 font-bold">
                            ({days} يوم متبقي)
                          </span>
                        )}
                        {days < 0 && (
                          <span className="ml-2 text-red-600 font-bold">(انتهى)</span>
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
                        تعديل
                      </button>
                      <button
                        onClick={() => deleteApp(app.id)}
                        className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        حذف
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
                {editing ? "تعديل الطلب" : "إضافة طلب جديد"}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addOrUpdate(new FormData(e.currentTarget));
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold mb-1">النوع</label>
                  <select
                    name="type"
                    defaultValue={editing?.type || "university"}
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
                  >
                    <option value="university">🏛️ جامعة</option>
                    <option value="scholarship">🏆 منحة</option>
                    <option value="internship">💼 تدريب</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">المؤسسة *</label>
                  <input
                    name="institution"
                    defaultValue={editing?.institution || ""}
                    required
                    placeholder="مثلاً: AUB"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">البرنامج/التخصص</label>
                  <input
                    name="program"
                    defaultValue={editing?.program || ""}
                    placeholder="مثلاً: هندسة الحاسوب"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">الموعد النهائي *</label>
                  <input
                    type="date"
                    name="deadline"
                    defaultValue={editing?.deadline || ""}
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">الحالة</label>
                  <select
                    name="status"
                    defaultValue={editing?.status || "drafting"}
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2"
                  >
                    {(Object.keys(STATUS_LABELS) as AppStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">ملاحظات</label>
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
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold"
                  >
                    {editing ? "حفظ التعديلات" : "إضافة"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-8">
          📌 البيانات محفوظة محلياً على متصفّحك
        </p>
      </div>
    </main>
  );
}
