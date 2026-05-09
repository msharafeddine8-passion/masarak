'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type SP = {
  user_id?: string;
  school_name?: string;
  grade_level?: string;
  gpa?: number | null;
  major?: string;
  university_name?: string;
  preferred_majors?: string[];
  target_university?: string;
  profile_completion?: number;
  xp_points?: number;
  streak_days?: number;
  is_profile_public?: boolean;
};
type P = { id?: string; full_name?: string; role?: string; school?: string; major?: string; region?: string; phone?: string };

const T_TABS = ['معلومات شخصية', 'الدراسة', 'الأهداف', 'الإحصائيات'];

export default function ProfilePage() {
  const r = useRouter();
  const [u, setU] = useState<any>(null);
  const [p, setP] = useState<P>({});
  const [sp, setSP] = useState<SP>({});
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { r.replace('/login?next=/profile'); return; }
      setU(user);
      const [{ data: profileRow }, { data: spRow }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('student_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      ]);
      if (profileRow) setP(profileRow);
      else setP({ id: user.id, full_name: user.user_metadata?.full_name || user.email?.split('@')[0], role: 'student' });
      if (spRow) setSP(spRow);
      else setSP({ user_id: user.id, profile_completion: 10, xp_points: 0, streak_days: 0, is_profile_public: false });
      setLoading(false);
    })();
  }, [r]);

  const calcCompletion = () => {
    const fields = [p.full_name, p.region, p.phone, sp.school_name, sp.grade_level, sp.gpa, sp.major, sp.university_name, sp.target_university];
    const filled = fields.filter(v => v != null && v !== '' && v !== 0).length;
    return Math.round((filled / fields.length) * 100);
  };

  const save = async () => {
    setMsg('جاري الحفظ...');
    try {
      const completion = calcCompletion();
      const profileData = { ...p, id: u.id };
      const spData = { ...sp, user_id: u.id, profile_completion: completion };
      const [r1, r2] = await Promise.all([
        supabase.from('profiles').upsert(profileData, { onConflict: 'id' }),
        supabase.from('student_profiles').upsert(spData, { onConflict: 'user_id' }),
      ]);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;
      setSP(s => ({ ...s, profile_completion: completion }));
      setMsg('✓ تم الحفظ بنجاح');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg('خطأ: ' + (e.message || 'فشل الحفظ'));
    }
  };

  const logout = async () => { await supabase.auth.signOut(); r.replace('/'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">جاري التحميل...</div></div>;

  const completion = sp.profile_completion ?? calcCompletion();

  return (
    <main className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#1b3a6b] text-white flex items-center justify-center text-3xl font-bold">{(p.full_name || u.email || 'م')[0]}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#1b3a6b]">{p.full_name || 'بدون اسم'}</h1>
            <p className="text-sm text-gray-500">{u.email}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-gray-600">اكتمال الملف:</span>
              <div className="flex-1 max-w-xs bg-gray-200 h-2 rounded-full overflow-hidden"><div className="bg-[#1b3a6b] h-full" style={{ width: completion + '%' }} /></div>
              <span className="text-xs font-semibold text-[#1b3a6b]">{completion}%</span>
            </div>
          </div>
          <button onClick={logout} className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50">تسجيل خروج</button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b">{T_TABS.map((t, i) => (<button key={i} onClick={() => setTab(i)} className={'flex-1 px-4 py-3 text-sm font-medium ' + (tab === i ? 'bg-[#1b3a6b] text-white' : 'text-gray-600 hover:bg-gray-50')}>{t}</button>))}</div>
          <div className="p-6 space-y-4">
            {tab === 0 && (<>
              <Field label="الاسم الكامل" value={p.full_name} onChange={v => setP({ ...p, full_name: v })} />
              <Select label="الدور" value={p.role} onChange={v => setP({ ...p, role: v })} options={[['student', 'طالب'], ['parent', 'ولي أمر'], ['school', 'مدرسة'], ['university', 'جامعة']]} />
              <Field label="المنطقة" value={p.region} onChange={v => setP({ ...p, region: v })} />
              <Field label="رقم الهاتف" value={p.phone} onChange={v => setP({ ...p, phone: v })} />
            </>)}
            {tab === 1 && (<>
              <Field label="اسم المدرسة" value={sp.school_name} onChange={v => setSP({ ...sp, school_name: v })} />
              <Select label="الصف الدراسي" value={sp.grade_level} onChange={v => setSP({ ...sp, grade_level: v })} options={[['G9', 'التاسع'], ['G10', 'العاشر'], ['G11', 'الحادي عشر'], ['G12', 'الثاني عشر'], ['UNI', 'جامعي']]} />
              <Field label="GPA" type="number" value={sp.gpa as any} onChange={v => setSP({ ...sp, gpa: v ? parseFloat(v) : null })} />
              <Field label="التخصص" value={sp.major} onChange={v => setSP({ ...sp, major: v })} />
              <Field label="الجامعة" value={sp.university_name} onChange={v => setSP({ ...sp, university_name: v })} />
            </>)}
            {tab === 2 && (<>
              <Field label="الجامعة المستهدفة" value={sp.target_university} onChange={v => setSP({ ...sp, target_university: v })} />
              <Field label="التخصصات المفضلة" value={(sp.preferred_majors || []).join(', ')} onChange={v => setSP({ ...sp, preferred_majors: v.split(',').map(x => x.trim()).filter(Boolean) })} />
              <label className="flex items-center gap-3 pt-3"><input type="checkbox" checked={!!sp.is_profile_public} onChange={e => setSP({ ...sp, is_profile_public: e.target.checked })} className="w-5 h-5 accent-[#1b3a6b]" /><span className="text-sm">جعل ملفي عام</span></label>
            </>)}
            {tab === 3 && (<div className="grid grid-cols-2 md:grid-cols-3 gap-4"><Stat label="نقاط" value={sp.xp_points || 0} /><Stat label="أيام متتالية" value={sp.streak_days || 0} /><Stat label="اكتمال" value={completion + '%'} /></div>)}
          </div>
          <div className="p-6 border-t bg-gray-50 flex items-center justify-between"><span className="text-sm">{msg}</span>{tab !== 3 && <button onClick={save} className="px-6 py-2 bg-[#1b3a6b] text-white rounded-lg font-medium">حفظ التغييرات</button>}</div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = 'text' }: any) {
  return (<div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" /></div>);
}
function Select({ label, value, onChange, options }: any) {
  return (<div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><select value={value ?? ''} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"><option value="">اختر...</option>{options.map(([v, l]: [string, string]) => <option key={v} value={v}>{l}</option>)}</select></div>);
}
function Stat({ label, value }: any) {
  return (<div className="bg-gradient-to-br from-[#1b3a6b]/10 to-[#1b3a6b]/5 p-4 rounded-xl"><div className="text-3xl font-bold text-[#1b3a6b]">{value}</div><div className="text-xs text-gray-600 mt-1">{label}</div></div>);
}
