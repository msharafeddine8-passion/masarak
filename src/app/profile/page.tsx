'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type TabId = 'personal' | 'study' | 'grades' | 'achievements' | 'certificates' | 'volunteer';

interface ProfileData {
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  city?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
  school_name?: string;
  grade_level?: string;
  graduation_year?: number;
  bac_section?: string;
  bac_grade?: number;
  overall_gpa?: number;
  grades?: Array<{ subject: string; score: number; max?: number }>;
  achievements?: Array<{ title: string; date?: string; description?: string }>;
  certificates?: Array<{ name: string; issuer?: string; date?: string; url?: string }>;
  courses?: Array<{ name: string; provider?: string; hours?: number; date?: string }>;
  internships?: Array<{ company: string; role: string; from?: string; to?: string }>;
  volunteer_hours?: number;
  volunteer_activities?: Array<{ org: string; role?: string; hours?: number; date?: string }>;
  skills?: string[];
  languages?: Array<{ name: string; level?: string }>;
  interests?: string[];
  social_links?: Record<string, string>;
}

const TABS: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'personal',     label: 'معلومات شخصية', icon: '👤' },
  { id: 'study',        label: 'الدراسة',          icon: '🎓' },
  { id: 'grades',       label: 'العلامات',         icon: '📊' },
  { id: 'achievements', label: 'الإنجازات',       icon: '🏆' },
  { id: 'certificates', label: 'الشهادات والدورات', icon: '📜' },
  { id: 'volunteer',    label: 'التطوع والتدريب',  icon: '💚' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<ProfileData>({ user_id: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login?redirect=/profile');
        return;
      }
      const u = { id: session.user.id, email: session.user.email || '' };
      setUser(u);

      // اقرأ أو أنشئ student_profile
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', u.id)
        .maybeSingle();

      if (error) {
        console.error('Profile load error:', error);
      }

      if (data) {
        setProfile(data as ProfileData);
      } else {
        // أنشئ صف جديد
        const { data: created } = await supabase
          .from('student_profiles')
          .insert({ user_id: u.id })
          .select()
          .single();
        if (created) setProfile(created as ProfileData);
        else setProfile({ user_id: u.id });
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const update = (patch: Partial<ProfileData>) => setProfile((p) => ({ ...p, ...patch }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setMsg('');
    try {
      const { error } = await supabase
        .from('student_profiles')
        .upsert({ ...profile, user_id: user.id }, { onConflict: 'user_id' });
      if (error) throw error;
      setMsg('✓ تم الحفظ');
      setTimeout(() => setMsg(''), 2500);
    } catch (e: any) {
      setMsg('❌ خطأ: ' + (e.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const completion = (() => {
    const fields = [
      profile.full_name, profile.phone, profile.city, profile.bio,
      profile.school_name, profile.grade_level, profile.graduation_year,
      profile.bac_section,
      profile.grades?.length, profile.achievements?.length,
      profile.certificates?.length, profile.courses?.length,
      profile.volunteer_hours, profile.skills?.length,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  })();

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <div className="text-gray-600">جاري تحميل ملفك...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white/15 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">
              {profile.full_name?.charAt(0) || user?.email.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-3xl font-extrabold mb-1">
                {profile.full_name || 'مرحباً!'}
              </h1>
              <p className="text-white/80 text-sm mb-3">{user?.email}</p>
              {profile.bio && <p className="text-white/90 text-sm max-w-xl">{profile.bio}</p>}
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold">{completion}%</div>
              <div className="text-xs opacity-80">اكتمال الملف</div>
              <div className="w-32 h-2 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#5cc4b8]" style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-4">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="flex overflow-x-auto border-b">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition border-b-2 ${
                  tab === t.id
                    ? 'border-[#1b3a6b] text-[#1b3a6b] bg-blue-50/40'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {tab === 'personal' && <PersonalTab profile={profile} update={update} />}
            {tab === 'study' && <StudyTab profile={profile} update={update} />}
            {tab === 'grades' && <GradesTab profile={profile} update={update} />}
            {tab === 'achievements' && <AchievementsTab profile={profile} update={update} />}
            {tab === 'certificates' && <CertificatesTab profile={profile} update={update} />}
            {tab === 'volunteer' && <VolunteerTab profile={profile} update={update} />}
          </div>
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-4 mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {msg && <span className={msg.startsWith('✓') ? 'text-emerald-600' : 'text-red-600'}>{msg}</span>}
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard" className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50">
              لوحة المتابعة
            </Link>
            <button
              onClick={save}
              disabled={saving}
              className="px-6 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm hover:bg-[#142d54] disabled:opacity-50"
            >
              {saving ? '⏳ جاري الحفظ...' : '💾 حفظ التغييرات'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============= Helper Components =============

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#1b3a6b] focus:outline-none focus:ring-2 focus:ring-[#1b3a6b]/10" />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#1b3a6b] focus:outline-none focus:ring-2 focus:ring-[#1b3a6b]/10 min-h-[100px]" />;
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:border-[#1b3a6b] focus:outline-none focus:ring-2 focus:ring-[#1b3a6b]/10">{children}</select>;
}

// ============= Tab: Personal =============

function PersonalTab({ profile, update }: { profile: ProfileData; update: (p: Partial<ProfileData>) => void }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Field label="الاسم الكامل">
        <Input value={profile.full_name || ''} onChange={(e) => update({ full_name: e.target.value })} placeholder="مثلاً: محمد شرف الدين" />
      </Field>
      <Field label="رقم الهاتف">
        <Input value={profile.phone || ''} onChange={(e) => update({ phone: e.target.value })} placeholder="+961 70 000 000" dir="ltr" />
      </Field>
      <Field label="المدينة">
        <Input value={profile.city || ''} onChange={(e) => update({ city: e.target.value })} placeholder="بيروت، الرياض، دبي..." />
      </Field>
      <Field label="الدولة">
        <Select value={profile.country || 'LB'} onChange={(e) => update({ country: e.target.value })}>
          <option value="LB">🇱🇧 لبنان</option>
          <option value="SA">🇸🇦 السعودية</option>
          <option value="AE">🇦🇪 الإمارات</option>
          <option value="EG">🇪🇬 مصر</option>
          <option value="JO">🇯🇴 الأردن</option>
          <option value="KW">🇰🇼 الكويت</option>
          <option value="QA">🇶🇦 قطر</option>
          <option value="BH">🇧🇭 البحرين</option>
          <option value="OM">🇴🇲 عمان</option>
          <option value="other">دولة أخرى</option>
        </Select>
      </Field>
      <Field label="تاريخ الميلاد">
        <Input type="date" value={profile.date_of_birth || ''} onChange={(e) => update({ date_of_birth: e.target.value })} />
      </Field>
      <Field label="الجنس">
        <Select value={profile.gender || ''} onChange={(e) => update({ gender: e.target.value })}>
          <option value="">-- اختر --</option>
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
        </Select>
      </Field>
      <div className="md:col-span-2">
        <Field label="نبذة عنك (Bio)">
          <Textarea value={profile.bio || ''} onChange={(e) => update({ bio: e.target.value })} placeholder="عرّف عن نفسك بكم سطر — ميزاتك، اهتماماتك، أهدافك..." />
        </Field>
      </div>
    </div>
  );
}

// ============= Tab: Study =============

function StudyTab({ profile, update }: { profile: ProfileData; update: (p: Partial<ProfileData>) => void }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Field label="اسم المدرسة / المعهد">
        <Input value={profile.school_name || ''} onChange={(e) => update({ school_name: e.target.value })} placeholder="مثلاً: International College" />
      </Field>
      <Field label="المرحلة الدراسية الحالية">
        <Select value={profile.grade_level || ''} onChange={(e) => update({ grade_level: e.target.value })}>
          <option value="">-- اختر --</option>
          <option value="grade_10">صف 10 / EB1</option>
          <option value="grade_11">صف 11 / EB2</option>
          <option value="grade_12">صف 12 / EB3 (آخر سنة)</option>
          <option value="freshman">سنة جامعية أولى</option>
          <option value="university">طالب جامعي</option>
          <option value="graduate">خرّيج</option>
        </Select>
      </Field>
      <Field label="سنة التخرج المتوقّعة">
        <Input type="number" min={2024} max={2030} value={profile.graduation_year || ''} onChange={(e) => update({ graduation_year: Number(e.target.value) || undefined })} placeholder="2026" />
      </Field>
      <Field label="فرع البكالوريا">
        <Select value={profile.bac_section || ''} onChange={(e) => update({ bac_section: e.target.value })}>
          <option value="">-- اختر --</option>
          <option value="GS">علوم عامة (GS)</option>
          <option value="LS">علوم حياة (LS)</option>
          <option value="SE">اقتصاد واجتماع (SE)</option>
          <option value="LH">آداب وإنسانيات (LH)</option>
          <option value="IB">International Baccalaureate</option>
          <option value="SAT">SAT / American</option>
          <option value="other">آخر</option>
        </Select>
      </Field>
      <Field label="معدّل البكالوريا (من 20)">
        <Input type="number" step="0.01" min={0} max={20} value={profile.bac_grade || ''} onChange={(e) => update({ bac_grade: Number(e.target.value) || undefined })} placeholder="مثلاً: 16.50" />
      </Field>
      <Field label="معدّلك العام (GPA من 4.0)">
        <Input type="number" step="0.01" min={0} max={4} value={profile.overall_gpa || ''} onChange={(e) => update({ overall_gpa: Number(e.target.value) || undefined })} placeholder="مثلاً: 3.75" />
      </Field>
    </div>
  );
}

// ============= Tab: Grades =============

function GradesTab({ profile, update }: { profile: ProfileData; update: (p: Partial<ProfileData>) => void }) {
  const grades = profile.grades || [];
  const add = () => update({ grades: [...grades, { subject: '', score: 0, max: 20 }] });
  const remove = (i: number) => update({ grades: grades.filter((_, idx) => idx !== i) });
  const edit = (i: number, patch: Partial<{ subject: string; score: number; max: number }>) =>
    update({ grades: grades.map((g, idx) => (idx === i ? { ...g, ...patch } : g)) });

  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 text-sm text-blue-900">
        💡 سجّل علاماتك بالمواد المهمة. مفيد لما تقدّم على جامعات ومنح.
      </div>
      <div className="space-y-3 mb-5">
        {grades.length === 0 && (
          <div className="text-center text-gray-400 py-8 border-2 border-dashed rounded-xl">لا توجد علامات بعد</div>
        )}
        {grades.map((g, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-6"><Input value={g.subject} onChange={(e) => edit(i, { subject: e.target.value })} placeholder="اسم المادة" /></div>
            <div className="col-span-2"><Input type="number" step="0.01" value={g.score} onChange={(e) => edit(i, { score: Number(e.target.value) })} placeholder="العلامة" /></div>
            <div className="col-span-2"><Input type="number" value={g.max || 20} onChange={(e) => edit(i, { max: Number(e.target.value) })} placeholder="من" /></div>
            <button onClick={() => remove(i)} className="col-span-2 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-semibold">حذف</button>
          </div>
        ))}
      </div>
      <button onClick={add} className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm">+ إضافة مادة</button>
    </div>
  );
}

// ============= Tab: Achievements =============

function AchievementsTab({ profile, update }: { profile: ProfileData; update: (p: Partial<ProfileData>) => void }) {
  const items = profile.achievements || [];
  const add = () => update({ achievements: [...items, { title: '', date: '', description: '' }] });
  const remove = (i: number) => update({ achievements: items.filter((_, idx) => idx !== i) });
  const edit = (i: number, patch: Partial<{ title: string; date: string; description: string }>) =>
    update({ achievements: items.map((a, idx) => (idx === i ? { ...a, ...patch } : a)) });

  return (
    <div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-900">
        🏆 سجّل مسابقات ربحتها، جوائز، تفوّق دراسي، رياضي، أو أي إنجاز.
      </div>
      <div className="space-y-4 mb-5">
        {items.length === 0 && (
          <div className="text-center text-gray-400 py-8 border-2 border-dashed rounded-xl">لا توجد إنجازات بعد</div>
        )}
        {items.map((a, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <Input value={a.title} onChange={(e) => edit(i, { title: e.target.value })} placeholder="عنوان الإنجاز" />
              <Input type="date" value={a.date || ''} onChange={(e) => edit(i, { date: e.target.value })} />
            </div>
            <Textarea value={a.description || ''} onChange={(e) => edit(i, { description: e.target.value })} placeholder="وصف الإنجاز" />
            <button onClick={() => remove(i)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-xs font-semibold">حذف</button>
          </div>
        ))}
      </div>
      <button onClick={add} className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm">+ إضافة إنجاز</button>
    </div>
  );
}

// ============= Tab: Certificates & Courses =============

function CertificatesTab({ profile, update }: { profile: ProfileData; update: (p: Partial<ProfileData>) => void }) {
  const certs = profile.certificates || [];
  const courses = profile.courses || [];

  const addCert = () => update({ certificates: [...certs, { name: '', issuer: '', date: '', url: '' }] });
  const editCert = (i: number, patch: any) => update({ certificates: certs.map((c, idx) => idx === i ? { ...c, ...patch } : c) });
  const removeCert = (i: number) => update({ certificates: certs.filter((_, idx) => idx !== i) });

  const addCourse = () => update({ courses: [...courses, { name: '', provider: '', hours: 0, date: '' }] });
  const editCourse = (i: number, patch: any) => update({ courses: courses.map((c, idx) => idx === i ? { ...c, ...patch } : c) });
  const removeCourse = (i: number) => update({ courses: courses.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-8">
      {/* Certificates */}
      <div>
        <h3 className="font-bold text-lg text-[#1b3a6b] mb-3 flex items-center gap-2">📜 الشهادات</h3>
        <div className="space-y-3 mb-3">
          {certs.length === 0 && <div className="text-center text-gray-400 py-6 border-2 border-dashed rounded-xl text-sm">لا توجد شهادات</div>}
          {certs.map((c, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="grid md:grid-cols-3 gap-2">
                <Input value={c.name} onChange={(e) => editCert(i, { name: e.target.value })} placeholder="اسم الشهادة" />
                <Input value={c.issuer || ''} onChange={(e) => editCert(i, { issuer: e.target.value })} placeholder="الجهة المانحة" />
                <Input type="date" value={c.date || ''} onChange={(e) => editCert(i, { date: e.target.value })} />
              </div>
              <Input value={c.url || ''} onChange={(e) => editCert(i, { url: e.target.value })} placeholder="رابط (اختياري)" dir="ltr" />
              <button onClick={() => removeCert(i)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-xs font-semibold">حذف</button>
            </div>
          ))}
        </div>
        <button onClick={addCert} className="px-4 py-2 bg-[#1b3a6b] text-white rounded-lg text-sm font-bold">+ شهادة</button>
      </div>

      {/* Courses */}
      <div>
        <h3 className="font-bold text-lg text-[#1b3a6b] mb-3 flex items-center gap-2">📚 الدورات</h3>
        <div className="space-y-3 mb-3">
          {courses.length === 0 && <div className="text-center text-gray-400 py-6 border-2 border-dashed rounded-xl text-sm">لا توجد دورات</div>}
          {courses.map((c, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 grid md:grid-cols-4 gap-2">
              <Input value={c.name} onChange={(e) => editCourse(i, { name: e.target.value })} placeholder="اسم الدورة" />
              <Input value={c.provider || ''} onChange={(e) => editCourse(i, { provider: e.target.value })} placeholder="الجهة" />
              <Input type="number" value={c.hours || ''} onChange={(e) => editCourse(i, { hours: Number(e.target.value) })} placeholder="عدد الساعات" />
              <button onClick={() => removeCourse(i)} className="text-red-600 hover:bg-red-50 py-2 rounded-lg text-xs font-semibold">حذف</button>
            </div>
          ))}
        </div>
        <button onClick={addCourse} className="px-4 py-2 bg-[#1b3a6b] text-white rounded-lg text-sm font-bold">+ دورة</button>
      </div>
    </div>
  );
}

// ============= Tab: Volunteer & Internships =============

function VolunteerTab({ profile, update }: { profile: ProfileData; update: (p: Partial<ProfileData>) => void }) {
  const acts = profile.volunteer_activities || [];
  const intern = profile.internships || [];

  const addAct = () => update({ volunteer_activities: [...acts, { org: '', role: '', hours: 0, date: '' }] });
  const editAct = (i: number, p: any) => update({ volunteer_activities: acts.map((a, idx) => idx === i ? { ...a, ...p } : a) });
  const removeAct = (i: number) => update({ volunteer_activities: acts.filter((_, idx) => idx !== i) });

  const addIntern = () => update({ internships: [...intern, { company: '', role: '', from: '', to: '' }] });
  const editIntern = (i: number, p: any) => update({ internships: intern.map((a, idx) => idx === i ? { ...a, ...p } : a) });
  const removeIntern = (i: number) => update({ internships: intern.filter((_, idx) => idx !== i) });

  const totalHours = (acts.reduce((s, a) => s + (a.hours || 0), 0));

  return (
    <div className="space-y-8">
      {/* Volunteer */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-[#1b3a6b] flex items-center gap-2">💚 التطوع</h3>
          <div className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold">
            مجموع الساعات: {totalHours}
          </div>
        </div>
        <div className="space-y-3 mb-3">
          {acts.length === 0 && <div className="text-center text-gray-400 py-6 border-2 border-dashed rounded-xl text-sm">لا توجد أنشطة تطوعية</div>}
          {acts.map((a, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 grid md:grid-cols-5 gap-2">
              <Input value={a.org} onChange={(e) => editAct(i, { org: e.target.value })} placeholder="اسم المنظمة" className="md:col-span-2" />
              <Input value={a.role || ''} onChange={(e) => editAct(i, { role: e.target.value })} placeholder="الدور" />
              <Input type="number" value={a.hours || ''} onChange={(e) => editAct(i, { hours: Number(e.target.value) })} placeholder="ساعات" />
              <button onClick={() => removeAct(i)} className="text-red-600 hover:bg-red-50 py-2 rounded text-xs font-semibold">حذف</button>
            </div>
          ))}
        </div>
        <button onClick={addAct} className="px-4 py-2 bg-[#1b3a6b] text-white rounded-lg text-sm font-bold">+ نشاط تطوعي</button>
      </div>

      {/* Internships */}
      <div>
        <h3 className="font-bold text-lg text-[#1b3a6b] mb-3 flex items-center gap-2">💼 التدريبات والخبرات</h3>
        <div className="space-y-3 mb-3">
          {intern.length === 0 && <div className="text-center text-gray-400 py-6 border-2 border-dashed rounded-xl text-sm">لا توجد تدريبات</div>}
          {intern.map((a, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 grid md:grid-cols-5 gap-2">
              <Input value={a.company} onChange={(e) => editIntern(i, { company: e.target.value })} placeholder="الشركة" className="md:col-span-2" />
              <Input value={a.role} onChange={(e) => editIntern(i, { role: e.target.value })} placeholder="الدور" />
              <Input type="date" value={a.from || ''} onChange={(e) => editIntern(i, { from: e.target.value })} placeholder="من" />
              <button onClick={() => removeIntern(i)} className="text-red-600 hover:bg-red-50 py-2 rounded text-xs font-semibold">حذف</button>
            </div>
          ))}
        </div>
        <button onClick={addIntern} className="px-4 py-2 bg-[#1b3a6b] text-white rounded-lg text-sm font-bold">+ تدريب</button>
      </div>
    </div>
  );
}
