"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_KEY = "masarak_admin_2026";

type Section = "overview"|"universities"|"schools"|"vocational"|"scholarships"|"blog"|"internships"|"majors"|"settings";
type Row = Record<string, string|number|boolean|null>;

const SECTIONS: { id: Section; label: string; emoji: string; table: string;
  fields: {key:string;label:string;type:string;required?:boolean}[] }[] = [
  { id:"universities", label:"الجامعات", emoji:"🏛️", table:"universities", fields:[
    {key:"name",        label:"اسم الجامعة",    type:"text",     required:true},
    {key:"short",       label:"الاختصار",        type:"text",     required:true},
    {key:"region",      label:"المنطقة",         type:"text"},
    {key:"type",        label:"النوع",           type:"select"},
    {key:"rank",        label:"التصنيف (1-5)",   type:"number"},
    {key:"lang",        label:"لغة التدريس",     type:"text"},
    {key:"tuition_min", label:"الرسوم الدنيا $", type:"number"},
    {key:"tuition_max", label:"الرسوم القصوى $", type:"number"},
    {key:"acceptance",  label:"معدل القبول %",   type:"number"},
    {key:"employ_rate", label:"نسبة التوظيف %",  type:"number"},
    {key:"founded",     label:"سنة التأسيس",     type:"number"},
    {key:"students",    label:"عدد الطلاب",      type:"number"},
    {key:"campus",      label:"الحرم",           type:"text"},
    {key:"accred",      label:"الاعتماد",        type:"text"},
    {key:"url",         label:"الموقع الإلكتروني",type:"url"},
    {key:"photo_url",   label:"رابط صورة الجامعة",type:"url"},
    {key:"description", label:"وصف الجامعة",     type:"textarea",required:true},
    {key:"majors_list", label:"التخصصات (فاصلة)",type:"textarea"},
    {key:"scholarships",label:"منح متوفرة",      type:"checkbox"},
  ]},
  { id:"schools", label:"المدارس", emoji:"🏫", table:"schools", fields:[
    {key:"name",        label:"اسم المدرسة",     type:"text",     required:true},
    {key:"region",      label:"المنطقة/المحافظة",type:"text"},
    {key:"type",        label:"النوع",           type:"select_school"},
    {key:"curriculum",  label:"المنهج",          type:"text"},
    {key:"languages",   label:"اللغات",          type:"text"},
    {key:"fees_range",  label:"نطاق الرسوم",     type:"text"},
    {key:"grades",      label:"الصفوف",          type:"text"},
    {key:"founded",     label:"سنة التأسيس",     type:"number"},
    {key:"students",    label:"عدد الطلاب",      type:"number"},
    {key:"address",     label:"العنوان",         type:"text"},
    {key:"phone",       label:"الهاتف",          type:"text"},
    {key:"website",     label:"الموقع",          type:"url"},
    {key:"photo_url",   label:"رابط صورة المدرسة",type:"url"},
    {key:"description", label:"وصف المدرسة",     type:"textarea"},
    {key:"accredited",  label:"معتمدة دولياً",   type:"checkbox"},
  ]},
  { id:"vocational", label:"التعليم المهني", emoji:"⚙️", table:"vocational_tracks", fields:[
    {key:"name",        label:"اسم المسار",      type:"text",     required:true},
    {key:"code",        label:"الكود (LT/BT/TS)",type:"text"},
    {key:"sector",      label:"القطاع",          type:"text"},
    {key:"duration",    label:"مدة الدراسة",     type:"text"},
    {key:"level",       label:"المستوى",         type:"text"},
    {key:"salary_lb",   label:"الراتب لبنان",    type:"text"},
    {key:"salary_gulf", label:"الراتب الخليج",   type:"text"},
    {key:"demand",      label:"الطلب في سوق العمل",type:"text"},
    {key:"subjects",    label:"المواد (فاصلة)",  type:"textarea"},
    {key:"description", label:"وصف المسار",      type:"textarea",required:true},
  ]},
  { id:"scholarships", label:"المنح الدراسية", emoji:"🏆", table:"scholarships", fields:[
    {key:"name",        label:"اسم المنحة",      type:"text",     required:true},
    {key:"provider",    label:"الجهة المانحة",   type:"text"},
    {key:"amount",      label:"قيمة المنحة",     type:"text"},
    {key:"deadline",    label:"آخر موعد",        type:"text"},
    {key:"type",        label:"النوع",           type:"text"},
    {key:"region",      label:"المنطقة",         type:"text"},
    {key:"field",       label:"التخصص",          type:"text"},
    {key:"gpa_min",     label:"الحد الأدنى للمعدل",type:"number"},
    {key:"url",         label:"رابط التقديم",    type:"url"},
    {key:"photo_url",   label:"شعار الجهة",      type:"url"},
    {key:"requirements",label:"شروط التقديم",    type:"textarea"},
    {key:"description", label:"وصف المنحة",      type:"textarea",required:true},
  ]},
  { id:"blog", label:"مقالات المدونة", emoji:"📝", table:"blog_posts", fields:[
    {key:"title",       label:"عنوان المقال",    type:"text",     required:true},
    {key:"slug",        label:"Slug (URL)",      type:"text",     required:true},
    {key:"category",    label:"الفئة",           type:"text"},
    {key:"author",      label:"الكاتب",          type:"text"},
    {key:"read_time",   label:"وقت القراءة",     type:"text"},
    {key:"photo_url",   label:"صورة المقال",     type:"url"},
    {key:"excerpt",     label:"مقتطف قصير",      type:"textarea"},
    {key:"content",     label:"محتوى المقال",    type:"textarea",required:true},
    {key:"published",   label:"منشور الآن",      type:"checkbox"},
    {key:"featured",    label:"مميّز",           type:"checkbox"},
  ]},
  { id:"internships", label:"فرص التدريب", emoji:"💻", table:"internships", fields:[
    {key:"title",       label:"المسمى الوظيفي",  type:"text",     required:true},
    {key:"company",     label:"اسم الشركة",      type:"text",     required:true},
    {key:"sector",      label:"القطاع",          type:"text"},
    {key:"region",      label:"المنطقة",         type:"text"},
    {key:"type",        label:"مدفوع/غير مدفوع",type:"text"},
    {key:"duration",    label:"مدة التدريب",     type:"text"},
    {key:"stipend",     label:"الراتب/التعويض",  type:"text"},
    {key:"deadline",    label:"آخر موعد",        type:"text"},
    {key:"url",         label:"رابط التقديم",    type:"url"},
    {key:"company_logo",label:"شعار الشركة",     type:"url"},
    {key:"description", label:"وصف الفرصة",      type:"textarea",required:true},
    {key:"requirements",label:"المتطلبات",       type:"textarea"},
    {key:"active",      label:"مفعّل/ظاهر",      type:"checkbox"},
  ]},
  { id:"majors", label:"التخصصات", emoji:"📚", table:"majors", fields:[
    {key:"name",        label:"اسم التخصص",      type:"text",     required:true},
    {key:"category",    label:"الفئة",           type:"text"},
    {key:"years",       label:"سنوات الدراسة",   type:"number"},
    {key:"lang",        label:"لغة التدريس",     type:"text"},
    {key:"salary_lb_min",label:"أدنى راتب لبنان $",type:"number"},
    {key:"salary_lb_max",label:"أعلى راتب لبنان $",type:"number"},
    {key:"salary_gulf_min",label:"أدنى راتب الخليج $",type:"number"},
    {key:"demand_lb",   label:"الطلب في لبنان",  type:"text"},
    {key:"demand_gulf", label:"الطلب في الخليج", type:"text"},
    {key:"description", label:"وصف التخصص",      type:"textarea",required:true},
    {key:"careers_list",label:"وظائف ممكنة (فاصلة)",type:"textarea"},
  ]},
];

const OVERVIEW_COLORS = [
  "bg-blue-50 border-blue-200 text-blue-700",
  "bg-green-50 border-green-200 text-green-700",
  "bg-purple-50 border-purple-200 text-purple-700",
  "bg-orange-50 border-orange-200 text-orange-700",
  "bg-pink-50 border-pink-200 text-pink-700",
  "bg-teal-50 border-teal-200 text-teal-700",
  "bg-yellow-50 border-yellow-200 text-yellow-700",
];

export default function AdminPage() {
  const [authed, setAuthed]     = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError]   = useState(false);
  const [section, setSection]   = useState<Section>("overview");
  const [rows, setRows]         = useState<Row[]>([]);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState<Row>({});
  const [editId, setEditId]     = useState<number|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg]           = useState("");
  const [msgType, setMsgType]   = useState<"ok"|"err">("ok");
  const [counts, setCounts]     = useState<Record<string,number>>({});
  const [search, setSearch]     = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settings, setSettings] = useState<Record<string,string>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("masarak_settings") || "{}"); } catch { return {}; }
  });
  function saveSetting(key: string, val: string) {
    const next = { ...settings, [key]: val };
    setSettings(next);
    if (typeof window !== "undefined") localStorage.setItem("masarak_settings", JSON.stringify(next));
    setMsg("✅ تم الحفظ!"); setMsgType("ok");
    setTimeout(() => setMsg(""), 3000);
  }

  const secDef = SECTIONS.find(s => s.id === section);

  const fetchRows = useCallback(async () => {
    if (!secDef) return;
    setLoading(true);
    const { data } = await supabase.from(secDef.table).select("*").order("id", { ascending: false });
    setRows(data || []);
    setLoading(false);
  }, [secDef]);

  const fetchCounts = useCallback(async () => {
    const results: Record<string,number> = {};
    for (const s of SECTIONS) {
      const { count } = await supabase.from(s.table).select("*", { count:"exact", head:true });
      results[s.id] = count || 0;
    }
    setCounts(results);
  }, []);

  useEffect(() => { if (authed && section !== "overview") fetchRows(); }, [authed, section, fetchRows]);
  useEffect(() => { if (authed) fetchCounts(); }, [authed, fetchCounts]);

  function login() {
    if (password === ADMIN_KEY) { setAuthed(true); setPwError(false); }
    else setPwError(true);
  }

  function openNew() { setForm({}); setEditId(null); setShowForm(true); window.scrollTo(0,0); }
  function openEdit(row: Row) { setForm({...row}); setEditId(row.id as number); setShowForm(true); window.scrollTo(0,0); }

  async function saveRow() {
    if (!secDef) return;
    const payload = {...form};
    delete payload.id; delete payload.created_at;
    let error;
    if (editId) {
      ({ error } = await supabase.from(secDef.table).update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from(secDef.table).insert(payload));
    }
    if (error) { setMsg("❌ خطأ: " + error.message); setMsgType("err"); }
    else { setMsg("✅ تم الحفظ بنجاح!"); setMsgType("ok"); setShowForm(false); fetchRows(); fetchCounts(); }
    setTimeout(() => setMsg(""), 4000);
  }

  async function deleteRow(id: number) {
    if (!secDef) return;
    if (!confirm("هل أنت متأكد من الحذف؟ لا يمكن التراجع.")) return;
    await supabase.from(secDef.table).delete().eq("id", id);
    fetchRows(); fetchCounts();
    setMsg("🗑️ تم الحذف"); setMsgType("ok");
    setTimeout(() => setMsg(""), 3000);
  }

  const filteredRows = rows.filter(r => {
    if (!search) return true;
    const val = (r.name || r.title || "") as string;
    return val.toLowerCase().includes(search.toLowerCase());
  });

  /* ── LOGIN ── */
  if (!authed) return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-extrabold text-3xl">م</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">لوحة الإدارة</h1>
          <p className="text-gray-400 text-sm mt-1">مسارك — Admin Panel v2</p>
        </div>
        <input type="password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          placeholder="كلمة المرور"
          className={`w-full border-2 rounded-2xl px-4 py-3.5 text-sm mb-3 focus:outline-none transition-colors ${pwError ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-primary"}`} />
        {pwError && <p className="text-red-500 text-sm mb-3 text-center font-medium">كلمة المرور غلط ❌</p>}
        <button onClick={login}
          className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold text-base hover:bg-primary/90 transition-colors shadow-lg">
          دخول
        </button>
      </div>
    </div>
  );

  /* ── ADMIN DASHBOARD ── */
  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 flex flex-col">

      {/* Top Bar */}
      <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(o => !o)} className="text-gray-400 hover:text-white p-1">
            <span className="text-xl">☰</span>
          </button>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-extrabold">م</span>
          </div>
          <span className="text-white font-bold">مسارك</span>
          <span className="text-gray-500 text-xs hidden sm:block">Admin Panel v2</span>
        </div>
        <div className="flex items-center gap-3">
          {msg && (
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${msgType === "ok" ? "bg-green-700 text-green-100" : "bg-red-700 text-red-100"}`}>
              {msg}
            </span>
          )}
          <a href="/" target="_blank" className="text-xs text-gray-400 hover:text-white border border-gray-600 px-3 py-1.5 rounded-lg">
            🌐 الموقع
          </a>
          <button onClick={() => setAuthed(false)} className="text-xs text-gray-400 hover:text-red-400 border border-gray-600 px-3 py-1.5 rounded-lg">
            خروج
          </button>
        </div>
      </header>

      <div className="flex flex-1">

        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-52 bg-white border-l border-gray-200 shadow-sm flex-shrink-0 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">القائمة</p>
            </div>
            {/* Overview */}
            <button onClick={() => { setSection("overview"); setShowForm(false); }}
              className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-colors text-right w-full ${section === "overview" ? "bg-primary/10 text-primary border-l-4 border-primary" : "text-gray-600 hover:bg-gray-50"}`}>
              <span>📊</span> لوحة المتابعة
            </button>
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">المحتوى</p>
            </div>
            {SECTIONS.map(s => (
              <button key={s.id}
                onClick={() => { setSection(s.id); setShowForm(false); setSearch(""); }}
                className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-right w-full ${section === s.id ? "bg-primary/10 text-primary font-bold border-l-4 border-primary" : "text-gray-600 hover:bg-gray-50 font-medium"}`}>
                <span className="flex items-center gap-2">
                  <span>{s.emoji}</span> {s.label}
                </span>
                {(counts[s.id] || 0) > 0 && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                    {counts[s.id]}
                  </span>
                )}
              </button>
            ))}
            <div className="mt-auto border-t border-gray-100 p-2">
              <button onClick={() => { setSection("settings"); setShowForm(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors w-full ${section === "settings" ? "bg-primary/10 text-primary font-bold" : "text-gray-600 hover:bg-gray-50"}`}>
                <span>⚙️</span> إعدادات الموقع
              </button>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-5 overflow-auto">

          {/* ── OVERVIEW ── */}
          {section === "overview" && (
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-6">📊 لوحة المتابعة</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {SECTIONS.map((s, i) => (
                  <button key={s.id} onClick={() => setSection(s.id)}
                    className={`border-2 rounded-2xl p-4 text-right hover:shadow-md transition-all ${OVERVIEW_COLORS[i % OVERVIEW_COLORS.length]}`}>
                    <div className="text-3xl mb-2">{s.emoji}</div>
                    <div className="text-2xl font-extrabold">{counts[s.id] || 0}</div>
                    <div className="text-sm font-medium mt-0.5">{s.label}</div>
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-700 mb-4">🚀 إجراءات سريعة</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {SECTIONS.map(s => (
                    <button key={s.id} onClick={() => { setSection(s.id); setTimeout(() => openNew(), 100); }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-gray-600 hover:text-primary">
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="text-xs font-semibold">+ إضافة {s.label.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION TABLE ── */}
          {secDef && section !== "overview" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-800">{secDef.emoji} {secDef.label}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{filteredRows.length} عنصر {search ? `(مفلتر من ${rows.length})` : ""}</p>
                </div>
                <button onClick={openNew}
                  className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 shadow-sm flex items-center gap-2">
                  <span className="text-lg leading-none">+</span> إضافة جديد
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="🔍 بحث باسم المحتوى..."
                  className="w-full md:w-80 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
              </div>

              {/* Form */}
              {showForm && (
                <div className="bg-white rounded-2xl border-2 border-primary/20 p-6 mb-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-extrabold text-gray-800 text-lg">
                      {editId ? "✏️ تعديل" : "➕ إضافة جديد"} — {secDef.label}
                    </h3>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {secDef.fields.map(f => (
                      <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">
                          {f.label}{f.required && <span className="text-red-500"> *</span>}
                        </label>

                        {/* Photo URL field — with preview */}
                        {f.key.includes("photo") || f.key.includes("logo") ? (
                          <div className="space-y-2">
                            <input type="url" value={(form[f.key] as string)||""}
                              onChange={e => setForm({...form, [f.key]: e.target.value})}
                              placeholder="https://example.com/image.jpg"
                              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                            {form[f.key] && (
                              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={form[f.key] as string} alt="preview"
                                  className="w-full h-full object-cover"
                                  onError={e => (e.currentTarget.style.display="none")} />
                              </div>
                            )}
                          </div>
                        ) : f.type === "textarea" ? (
                          <textarea value={(form[f.key] as string)||""}
                            onChange={e => setForm({...form, [f.key]: e.target.value})}
                            rows={f.key === "content" ? 8 : 3}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-y" />
                        ) : f.type === "checkbox" ? (
                          <label className="flex items-center gap-3 cursor-pointer mt-1">
                            <input type="checkbox" checked={!!form[f.key]}
                              onChange={e => setForm({...form, [f.key]: e.target.checked})}
                              className="w-5 h-5 rounded accent-primary" />
                            <span className="text-sm text-gray-600">{f.label}</span>
                          </label>
                        ) : f.type === "select" ? (
                          <select value={(form[f.key] as string)||"خاصة"}
                            onChange={e => setForm({...form, [f.key]: e.target.value})}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                            <option>خاصة</option><option>حكومية</option>
                          </select>
                        ) : f.type === "select_school" ? (
                          <select value={(form[f.key] as string)||"خاصة"}
                            onChange={e => setForm({...form, [f.key]: e.target.value})}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                            <option>خاصة</option><option>رسمية</option><option>خاصة مدعومة</option><option>دولية</option>
                          </select>
                        ) : (
                          <input type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                            value={(form[f.key] as string)||""}
                            onChange={e => setForm({...form, [f.key]: e.target.value})}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
                    <button onClick={saveRow}
                      className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold hover:bg-primary/90 shadow-sm">
                      💾 حفظ
                    </button>
                    <button onClick={() => setShowForm(false)}
                      className="border-2 border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-50">
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

    
          {/* ── SITE SETTINGS ── */}
          {section === "settings" && (
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-2">⚙️ إعدادات الموقع</h2>
              <p className="text-gray-500 text-sm mb-6">تحكم في إعدادات المنصة — الشعار، الصور، معلومات التواصل</p>

              {/* Site Identity */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5 shadow-sm">
                <h3 className="font-extrabold text-gray-700 mb-4 flex items-center gap-2">🎨 هوية المنصة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key:"site_logo",      label:"رابط شعار المنصة (Logo URL)",     placeholder:"https://..." },
                    { key:"site_tagline",   label:"شعار/طاغلاين المنصة",            placeholder:"اكتشف مسارك الأكاديمي..." },
                    { key:"contact_email",  label:"البريد الإلكتروني للتواصل",       placeholder:"info@masaraklb.com" },
                    { key:"contact_phone",  label:"رقم الهاتف للتواصل",             placeholder:"+961 ..." },
                    { key:"instagram_url",  label:"رابط إنستغرام",                  placeholder:"https://instagram.com/..." },
                    { key:"linkedin_url",   label:"رابط لينكدإن",                   placeholder:"https://linkedin.com/..." },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-bold text-gray-500 block mb-1">{f.label}</label>
                      <input
                        value={settings[f.key] || ""}
                        onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))}
                        onBlur={e => saveSetting(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                    </div>
                  ))}
                </div>
                {settings.site_logo && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={settings.site_logo} alt="logo" className="h-12 object-contain" onError={e => (e.currentTarget.style.display="none")} />
                  </div>
                )}
              </div>

              {/* Hero Banners */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5 shadow-sm">
                <h3 className="font-extrabold text-gray-700 mb-4 flex items-center gap-2">🖼️ صور الصفحة الرئيسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key:"hero_image_1",   label:"صورة البانر الرئيسية",           placeholder:"https://..." },
                    { key:"hero_image_2",   label:"صورة البانر الثانية",            placeholder:"https://..." },
                    { key:"hero_image_3",   label:"صورة البانر الثالثة",            placeholder:"https://..." },
                    { key:"homepage_featured_img", label:"صورة القسم المميّز",     placeholder:"https://..." },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-bold text-gray-500 block mb-1">{f.label}</label>
                      <input
                        value={settings[f.key] || ""}
                        onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))}
                        onBlur={e => saveSetting(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                      {settings[f.key] && (
                        <div className="mt-2 rounded-xl overflow-hidden h-24 bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={settings[f.key]} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display="none")} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Institution Branding */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5 shadow-sm">
                <h3 className="font-extrabold text-gray-700 mb-4 flex items-center gap-2">🏢 هوية المؤسسة المشغّلة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key:"institution_name",  label:"اسم المؤسسة/الشركة المشغّلة",  placeholder:"مثال: شركة مسارك التعليمية" },
                    { key:"institution_logo",  label:"رابط شعار المؤسسة",            placeholder:"https://..." },
                    { key:"institution_tagline",label:"شعار المؤسسة المختصر",        placeholder:"..." },
                    { key:"institution_country",label:"الدولة",                      placeholder:"لبنان" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-bold text-gray-500 block mb-1">{f.label}</label>
                      <input
                        value={settings[f.key] || ""}
                        onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))}
                        onBlur={e => saveSetting(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                    </div>
                  ))}
                </div>
                {settings.institution_logo && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={settings.institution_logo} alt="logo" className="h-14 object-contain" onError={e => (e.currentTarget.style.display="none")} />
                  </div>
                )}
              </div>

              {/* Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
                <strong>💡 ملاحظة:</strong> هذه الإعدادات تُحفظ محلياً على هذا المتصفح الآن. لتفعيلها على الموقع بالكامل، تواصل مع فريق التطوير لربطها بقاعدة البيانات.
              </div>
            </div>
          )}

          {/* Table */}
              {loading ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400">
                  <div className="text-4xl mb-3 animate-pulse">⏳</div>
                  <p>جارٍ التحميل...</p>
                </div>
              ) : filteredRows.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                  <div className="text-5xl mb-4">{secDef.emoji}</div>
                  <p className="text-gray-400 font-medium mb-4">
                    {search ? "لا نتائج لهذا البحث" : "لا توجد بيانات بعد"}
                  </p>
                  {!search && (
                    <button onClick={openNew}
                      className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90">
                      + إضافة أول {secDef.label.split(" ")[0]}
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 w-10">#</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">الاسم / العنوان</th>
                          {/* Photo preview column */}
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">صورة</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">تفاصيل</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 w-28">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((row, i) => {
                          const photoKey = Object.keys(row).find(k => k.includes("photo") || k.includes("logo"));
                          const photoUrl = photoKey ? (row[photoKey] as string) : null;
                          const nameVal  = (row.name || row.title || "—") as string;
                          const detailVal = (row.region || row.provider || row.company || row.category || row.sector || "") as string;
                          return (
                            <tr key={row.id as number}
                              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
                              <td className="px-4 py-3 text-gray-400 text-xs">{row.id as number}</td>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-gray-800 max-w-xs">{nameVal}</div>
                                {(row.published === false) && (
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">مسودة</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {photoUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={photoUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" onError={e=>(e.currentTarget.style.display="none")} />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-lg">{secDef.emoji}</div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{detailVal}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button onClick={() => openEdit(row)}
                                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                    تعديل
                                  </button>
                                  <button onClick={() => deleteRow(row.id as number)}
                                    className="bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                    حذف
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
