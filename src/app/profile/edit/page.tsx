"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Fallback list used until DB schools load
const SCHOOLS_FALLBACK = [
  "مدرسة الإيمان — بيروت","مدرسة المقاصد — صيدا","ثانوية الروم الأرثوذكس","ثانوية عبدالحميد كرامي",
  "كلية الأمل","مدرسة الليسيه عبدالقادر","ثانوية الشوف","ثانوية زحلة الرسمية","أخرى",
];
const GRADES   = ["الصف التاسع","الصف العاشر","الصف الحادي عشر","الصف الثاني عشر","طالب جامعي","خريج"];
const REGIONS  = ["بيروت","جبل لبنان","الشمال","الجنوب","البقاع","النبطية"];
const INTERESTS = [
  { id:"tech",      label:"التكنولوجيا والبرمجة",  emoji:"💻" },
  { id:"medicine",  label:"الطب والصحة",             emoji:"🏥" },
  { id:"business",  label:"الأعمال والاقتصاد",       emoji:"📊" },
  { id:"arts",      label:"الفنون والتصميم",          emoji:"🎨" },
  { id:"engineering",label:"الهندسة",               emoji:"⚙️" },
  { id:"law",       label:"القانون والسياسة",         emoji:"⚖️" },
  { id:"education", label:"التعليم والتربية",         emoji:"📚" },
  { id:"science",   label:"العلوم والبحث",            emoji:"🔬" },
  { id:"media",     label:"الإعلام والصحافة",         emoji:"📰" },
  { id:"social",    label:"العمل الاجتماعي",          emoji:"🤝" },
];

const AVATARS = ["👤","🧑","👦","👧","🧒","👨","👩","🧑‍💻","👨‍🎓","👩‍🎓","🧑‍🎓","👨‍💼","👩‍💼","🧑‍🔬","👨‍🔬","👩‍🔬","🧑‍🎨","👨‍🏫","👩‍🏫","🦊","🐺","🦁","🐯","🐻","🐼","🐸","🦅","🌟","⚡","🔥"];

const BIRTH_YEARS = Array.from({ length: 15 }, (_, i) => String(2013 - i)); // 1999–2013

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; user_metadata: Record<string, string> } | null>(null);

  // Form fields
  const [fullName, setFullName]     = useState("");
  const [school, setSchool]         = useState("");
  const [grade, setGrade]           = useState("");
  const [region, setRegion]         = useState("");
  const [interests, setInterests]   = useState<string[]>([]);
  const [bio, setBio]               = useState("");
  const [customSchool, setCustomSchool] = useState("");
  const [avatar, setAvatar]         = useState("👤");
  const [birthYear, setBirthYear]   = useState("");
  // ─── New: Achievements / Certificates / Volunteer ────────────────────────
  const [achievements, setAchievements] = useState<{ title: string; year: string; desc: string }[]>([]);
  const [certificates, setCertificates] = useState<{ name: string; issuer: string; year: string }[]>([]);
  const [volunteer, setVolunteer]       = useState<{ org: string; role: string; year: string }[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<string[]>(SCHOOLS_FALLBACK);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      const u = data.user as typeof user;
      setUser(u);
      setFullName(u?.user_metadata?.full_name   || "");
      setBio(u?.user_metadata?.bio              || "");
      setSchool(u?.user_metadata?.school        || "");
      setGrade(u?.user_metadata?.grade          || "");
      setRegion(u?.user_metadata?.region        || "");
      setAvatar(u?.user_metadata?.avatar        || "👤");
      setBirthYear(u?.user_metadata?.birth_year || "");
      setInterests(u?.user_metadata?.interests ? JSON.parse(u.user_metadata.interests) : []);
      // Load lists (safe parse)
      try { setAchievements(u?.user_metadata?.achievements ? JSON.parse(u.user_metadata.achievements) : []); } catch { setAchievements([]); }
      try { setCertificates(u?.user_metadata?.certificates ? JSON.parse(u.user_metadata.certificates) : []); } catch { setCertificates([]); }
      try { setVolunteer(u?.user_metadata?.volunteer ? JSON.parse(u.user_metadata.volunteer) : []); } catch { setVolunteer([]); }

      // Load school names from DB (fall back to static list on error)
      supabase.from('schools').select('name').eq('is_active', true).order('name').then(({ data: dbSchools }) => {
        if (dbSchools && dbSchools.length > 0) {
          setSchoolOptions([...dbSchools.map((s: { name: string }) => s.name), 'أخرى']);
        }
      });

      setLoading(false);
    });
  }, [router]);

  function toggleInterest(id: string) {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  }

  function getAge() {
    if (!birthYear) return null;
    return new Date().getFullYear() - Number(birthYear);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const finalSchool = school === "أخرى" ? customSchool : school;
    await supabase.auth.updateUser({
      data: {
        full_name: fullName, bio, school: finalSchool, grade, region,
        interests: JSON.stringify(interests), avatar, birth_year: birthYear,
        achievements: JSON.stringify(achievements),
        certificates: JSON.stringify(certificates),
        volunteer: JSON.stringify(volunteer),
      }
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // Compute profile completion %
  const fields = [fullName, school, grade, region, bio, birthYear, interests.length > 0 ? "yes" : ""];
  const filled = fields.filter(Boolean).length;
  const pct    = Math.round((filled / fields.length) * 100);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">مسارك</span>
          </Link>
          <Link href="/dashboard" className="text-text-sub text-sm hover:text-primary flex items-center gap-1">
            ← العودة للداشبورد
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Card */}
        <div className="bg-gradient-to-br from-primary to-[#1e4080] rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/70 text-sm">اكتمال ملفك الشخصي</p>
              <p className="text-2xl font-extrabold">{pct}%</p>
            </div>
            <div className="w-16 h-16 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E8A020" strokeWidth="3"
                  strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-accent font-bold text-sm">{pct}%</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-full h-2">
            <div className="bg-accent rounded-full h-2 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          {pct < 100 && (
            <p className="text-white/60 text-xs mt-2">أكمل ملفك لتظهر لك الفرص المناسبة</p>
          )}
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-success rounded-xl p-3 text-sm mb-4 flex items-center gap-2">
            <span>✓</span> تم حفظ ملفك بنجاح!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* Avatar Section */}
          <div className="card">
            <h2 className="font-bold text-primary text-lg mb-5 flex items-center gap-2">
              <span className="text-2xl">🖼️</span> الصورة الشخصية
            </h2>
            <div className="flex items-center gap-5">
              {/* Current Avatar Display */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center text-5xl border-2 border-primary/20 shadow-sm">
                  {avatar}
                </div>
                <button type="button" onClick={() => setShowAvatarPicker(p => !p)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs shadow-md hover:bg-primary/90 transition-colors">
                  ✏️
                </button>
              </div>
              <div>
                <p className="font-semibold text-primary text-sm mb-0.5">
                  {fullName || "اسمك هنا"}
                </p>
                {birthYear && (
                  <p className="text-xs text-text-sub">
                    {getAge()} سنة · {birthYear}
                  </p>
                )}
                <button type="button" onClick={() => setShowAvatarPicker(p => !p)}
                  className="text-xs text-accent mt-2 hover:underline font-semibold">
                  {showAvatarPicker ? "إخفاء الخيارات ▲" : "تغيير الصورة ▼"}
                </button>
              </div>
            </div>

            {/* Avatar Picker Grid */}
            {showAvatarPicker && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-text-sub mb-3 font-semibold">اختر رمزاً يمثلك 👇</p>
                <div className="grid grid-cols-10 gap-1.5">
                  {AVATARS.map(a => (
                    <button key={a} type="button" onClick={() => { setAvatar(a); setShowAvatarPicker(false); }}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl transition-all border-2 hover:scale-110 ${
                        avatar === a ? "border-primary bg-primary/10" : "border-transparent hover:border-gray-200 bg-white"
                      }`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="card">
            <h2 className="font-bold text-primary text-lg mb-5 flex items-center gap-2">
              <span className="text-2xl">👤</span> المعلومات الأساسية
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">الاسم الكامل *</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  placeholder="محمد أحمد خليل" />
              </div>

              {/* Birth Year + Age */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1.5">سنة الولادة</label>
                  <select value={birthYear} onChange={e => setBirthYear(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none bg-white">
                    <option value="">اختر سنة...</option>
                    {BIRTH_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1.5">العمر</label>
                  <div className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm text-text-sub flex items-center gap-2">
                    {birthYear ? (
                      <><span className="text-2xl">🎂</span> <span className="font-bold text-primary">{getAge()} سنة</span></>
                    ) : (
                      <span className="text-gray-400">يُحسب تلقائياً</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">نبذة عنك</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none resize-none"
                  placeholder="أحب الرياضيات والفيزياء، أطمح لأصبح مهندسًا..." />
                <p className="text-xs text-text-sub mt-1">{bio.length}/200 حرف</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">البريد الإلكتروني</label>
                <input value={user?.email || ""} disabled
                  className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm text-text-sub cursor-not-allowed" />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="card">
            <h2 className="font-bold text-primary text-lg mb-5 flex items-center gap-2">
              <span className="text-2xl">🎓</span> المعلومات الأكاديمية
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1.5">المدرسة / الجامعة</label>
                <select value={school} onChange={e => setSchool(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none bg-white">
                  <option value="">اختر مدرستك...</option>
                  {schoolOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {school === "أخرى" && (
                  <input value={customSchool} onChange={e => setCustomSchool(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none mt-2"
                    placeholder="اكتب اسم مدرستك..." />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1.5">الصف / المرحلة</label>
                  <select value={grade} onChange={e => setGrade(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none bg-white">
                    <option value="">اختر...</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1.5">المنطقة</label>
                  <select value={region} onChange={e => setRegion(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none bg-white">
                    <option value="">اختر...</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="card">
            <h2 className="font-bold text-primary text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">🏆</span> الإنجازات والجوائز
            </h2>
            <p className="text-text-sub text-sm mb-4">سجّل مسابقاتك، جوائزك، ومراكزك المتميّزة.</p>
            <ListEditor
              items={achievements}
              onChange={setAchievements as any}
              fields={[
                { key: "title", label: "عنوان الإنجاز", placeholder: "مثلاً: المركز الأول في أولمبياد الرياضيات" },
                { key: "year",  label: "السنة",         placeholder: "2024" },
                { key: "desc",  label: "وصف مختصر",     placeholder: "وصف..." },
              ]}
              addLabel="+ إضافة إنجاز"
              empty="لا إنجازات بعد"
            />
          </div>

          {/* Certificates */}
          <div className="card">
            <h2 className="font-bold text-primary text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">📜</span> الشهادات والدورات
            </h2>
            <p className="text-text-sub text-sm mb-4">شهادات Coursera، Google، Microsoft، أو أي دورات تدريبية.</p>
            <ListEditor
              items={certificates}
              onChange={setCertificates as any}
              fields={[
                { key: "name",   label: "اسم الشهادة",   placeholder: "Google Data Analytics" },
                { key: "issuer", label: "الجهة المانحة", placeholder: "Coursera، Google..." },
                { key: "year",   label: "السنة",          placeholder: "2024" },
              ]}
              addLabel="+ إضافة شهادة"
              empty="لا شهادات بعد"
            />
          </div>

          {/* Volunteer */}
          <div className="card">
            <h2 className="font-bold text-primary text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">🤝</span> الأنشطة التطوعية
            </h2>
            <p className="text-text-sub text-sm mb-4">المنظمات اللي تطوعت فيها وأدوارك.</p>
            <ListEditor
              items={volunteer}
              onChange={setVolunteer as any}
              fields={[
                { key: "org",  label: "المؤسسة / الجمعية", placeholder: "الصليب الأحمر اللبناني" },
                { key: "role", label: "دورك",                placeholder: "متطوع إغاثة" },
                { key: "year", label: "السنة",                placeholder: "2024" },
              ]}
              addLabel="+ إضافة نشاط تطوعي"
              empty="لا أنشطة تطوعية بعد"
            />
          </div>

          {/* Interests */}
          <div className="card">
            <h2 className="font-bold text-primary text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">❤️</span> اهتماماتك
            </h2>
            <p className="text-text-sub text-sm mb-4">اختر حتى 5 مجالات تهمك ({interests.length}/5)</p>
            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map(i => (
                <button key={i.id} type="button" onClick={() => toggleInterest(i.id)}
                  className={`border-2 rounded-xl p-3 text-right transition-all flex items-center gap-3
                    ${interests.includes(i.id)
                      ? "border-primary bg-light text-primary"
                      : "border-gray-200 hover:border-gray-300 text-text-main"
                    } ${!interests.includes(i.id) && interests.length >= 5 ? "opacity-40 cursor-not-allowed" : ""}`}>
                  <span className="text-xl">{i.emoji}</span>
                  <span className="text-sm font-semibold">{i.label}</span>
                  {interests.includes(i.id) && <span className="mr-auto text-primary">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button type="submit" disabled={saving}
            className="w-full btn-primary py-4 rounded-2xl text-lg disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> جارٍ الحفظ...</>
            ) : (
              "💾 حفظ الملف الشخصي"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

// ─── Reusable list editor (achievements / certificates / volunteer) ────────
type ListField = { key: string; label: string; placeholder?: string };
function ListEditor({
  items, onChange, fields, addLabel, empty,
}: {
  items: Record<string, string>[];
  onChange: (next: Record<string, string>[]) => void;
  fields: ListField[];
  addLabel: string;
  empty: string;
}) {
  const add = () => {
    const blank: Record<string, string> = {};
    fields.forEach(f => { blank[f.key] = ""; });
    onChange([...items, blank]);
  };
  const update = (i: number, key: string, val: string) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: val };
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div>
      {items.length === 0 && (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl text-sm text-text-sub mb-3">
          {empty}
        </div>
      )}
      <div className="space-y-3 mb-3">
        {items.map((item, i) => (
          <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-3 relative">
            <button type="button" onClick={() => remove(i)}
              className="absolute top-2 left-2 w-7 h-7 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center text-sm font-bold">×</button>
            <div className="grid md:grid-cols-3 gap-2 pr-8">
              {fields.map(f => (
                <input key={f.key}
                  value={item[f.key] ?? ""}
                  onChange={e => update(i, f.key, e.target.value)}
                  placeholder={f.placeholder || f.label}
                  className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none bg-white" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={add}
        className="w-full border-2 border-dashed border-primary/40 text-primary rounded-xl py-2.5 text-sm font-bold hover:bg-primary/5 transition-colors">
        {addLabel}
      </button>
    </div>
  );
}
