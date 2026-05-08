"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_KEY = "masarak_admin_2026";

type Table = "universities" | "scholarships" | "blog_posts";
type Row = Record<string, string | number | boolean | string[] | null>;

const TABLES: { id: Table; label: string; emoji: string; fields: { key: string; label: string; type: string; required?: boolean }[] }[] = [
  {
    id: "universities",
    label: "الجامعات",
    emoji: "🏛️",
    fields: [
      { key: "name",        label: "الاسم",        type: "text",     required: true },
      { key: "region",      label: "المنطقة",      type: "text",     required: true },
      { key: "type",        label: "النوع",        type: "select"  },
      { key: "rank",        label: "التقييم",      type: "text"     },
      { key: "tuition",     label: "الرسوم",       type: "text"     },
      { key: "lang",        label: "اللغة",        type: "text"     },
      { key: "url",         label: "الموقع",       type: "url"      },
      { key: "description", label: "الوصف",        type: "textarea" },
    ],
  },
  {
    id: "scholarships",
    label: "المنح",
    emoji: "🏆",
    fields: [
      { key: "name",         label: "اسم المنحة",  type: "text",     required: true },
      { key: "provider",     label: "الجهة",       type: "text"     },
      { key: "amount",       label: "المبلغ",      type: "text"     },
      { key: "deadline",     label: "الموعد",      type: "text"     },
      { key: "type",         label: "النوع",       type: "text"     },
      { key: "region",       label: "المنطقة",     type: "text"     },
      { key: "field",        label: "التخصص",      type: "text"     },
      { key: "requirements", label: "الشروط",      type: "textarea" },
      { key: "url",          label: "الرابط",      type: "url"      },
      { key: "description",  label: "الوصف",       type: "textarea" },
    ],
  },
  {
    id: "blog_posts",
    label: "المدونة",
    emoji: "📝",
    fields: [
      { key: "title",    label: "العنوان",  type: "text",     required: true },
      { key: "slug",     label: "Slug",     type: "text",     required: true },
      { key: "excerpt",  label: "مقتطف",   type: "textarea" },
      { key: "content",  label: "المحتوى", type: "textarea" },
      { key: "author",   label: "الكاتب",  type: "text"     },
      { key: "category", label: "الفئة",   type: "text"     },
      { key: "published",label: "منشور",   type: "checkbox" },
    ],
  },
];

export default function AdminPage() {
  const [authed, setAuthed]       = useState(false);
  const [password, setPassword]   = useState("");
  const [pwError, setPwError]     = useState(false);
  const [activeTable, setActive]  = useState<Table>("universities");
  const [rows, setRows]           = useState<Row[]>([]);
  const [loading, setLoading]     = useState(false);
  const [form, setForm]           = useState<Row>({});
  const [editId, setEditId]       = useState<number | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [msg, setMsg]             = useState("");

  const tableDef = TABLES.find((t) => t.id === activeTable)!;

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from(activeTable).select("*").order("id", { ascending: false });
    setRows(data || []);
    setLoading(false);
  }, [activeTable]);

  useEffect(() => { if (authed) fetchRows(); }, [authed, activeTable, fetchRows]);

  function login() {
    if (password === ADMIN_KEY) { setAuthed(true); setPwError(false); }
    else setPwError(true);
  }

  function openNew() {
    setForm({});
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(row: Row) {
    setForm({ ...row });
    setEditId(row.id as number);
    setShowForm(true);
  }

  async function saveRow() {
    const payload = { ...form };
    delete payload.id;
    delete payload.created_at;
    let error;
    if (editId) {
      ({ error } = await supabase.from(activeTable).update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from(activeTable).insert(payload));
    }
    if (error) { setMsg("❌ خطأ: " + error.message); }
    else { setMsg("✅ تم الحفظ بنجاح!"); setShowForm(false); fetchRows(); }
    setTimeout(() => setMsg(""), 3000);
  }

  async function deleteRow(id: number) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await supabase.from(activeTable).delete().eq("id", id);
    fetchRows();
  }

  /* ── LOGIN ── */
  if (!authed) return (
    <div dir="rtl" className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold text-gray-800">لوحة الإدارة</h1>
          <p className="text-gray-500 text-sm mt-1">مسارك — Admin Panel</p>
        </div>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          placeholder="كلمة المرور"
          className={`w-full border-2 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none ${pwError ? "border-red-400" : "border-gray-200 focus:border-blue-500"}`} />
        {pwError && <p className="text-red-500 text-sm mb-3 text-center">كلمة المرور غلط</p>}
        <button onClick={login} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
          دخول
        </button>
      </div>
    </div>
  );

  /* ── DASHBOARD ── */
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-blue-400">مسارك</span>
          <span className="text-gray-400 text-sm">Admin Panel</span>
        </div>
        <button onClick={() => setAuthed(false)} className="text-gray-400 hover:text-white text-sm">خروج</button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-48 bg-white border-l border-gray-200 min-h-screen p-4 shrink-0">
          <p className="text-xs text-gray-400 mb-3 font-medium">الجداول</p>
          {TABLES.map((t) => (
            <button key={t.id} onClick={() => { setActive(t.id); setShowForm(false); }}
              className={`w-full text-right flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm mb-1 font-medium transition-colors ${activeTable === t.id ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              <span>{t.emoji}</span><span>{t.label}</span>
            </button>
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 p-6">
          {msg && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{msg}</div>}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">{tableDef.emoji} {tableDef.label} ({rows.length})</h2>
            <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
              + إضافة جديد
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">{editId ? "تعديل" : "إضافة جديد"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tableDef.fields.map((f) => (
                  <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}{f.required && " *"}</label>
                    {f.type === "textarea" ? (
                      <textarea value={(form[f.key] as string) || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                    ) : f.type === "checkbox" ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} className="w-4 h-4" />
                        <span className="text-sm text-gray-600">منشور</span>
                      </label>
                    ) : f.type === "select" ? (
                      <select value={(form[f.key] as string) || "خاصة"} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                        <option>خاصة</option><option>حكومية</option>
                      </select>
                    ) : (
                      <input type={f.type} value={(form[f.key] as string) || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={saveRow} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">حفظ</button>
                <button onClick={() => setShowForm(false)} className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">إلغاء</button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">جارٍ التحميل...</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">
              <div className="text-4xl mb-3">{tableDef.emoji}</div>
              <p>لا توجد بيانات بعد — اضغط &quot;إضافة جديد&quot;</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">#</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">الاسم</th>
                      {activeTable !== "blog_posts" && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">المنطقة/الجهة</th>}
                      {activeTable === "blog_posts" && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">منشور</th>}
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={row.id as number} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                        <td className="px-4 py-3 text-gray-400 text-xs">{row.id as number}</td>
                        <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{row.name as string || row.title as string}</td>
                        {activeTable !== "blog_posts" && <td className="px-4 py-3 text-gray-500">{row.region as string || row.provider as string}</td>}
                        {activeTable === "blog_posts" && (
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${row.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {row.published ? "✓ منشور" : "مسودة"}
                            </span>
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(row)} className="text-blue-500 hover:text-blue-700 text-xs font-medium">تعديل</button>
                            <button onClick={() => deleteRow(row.id as number)} className="text-red-400 hover:text-red-600 text-xs font-medium">حذف</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
