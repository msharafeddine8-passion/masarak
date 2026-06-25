import Link from 'next/link';

const SQL = `-- ===== جدول profiles (ملف الطالب الكامل) =====
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  phone text,
  age int,
  city text,
  bio text,
  bac_type text,
  bac_grade text,
  bac_year int,
  gpa text,
  certificates jsonb default '[]',
  trainings jsonb default '[]',
  volunteer jsonb default '[]',
  skills text[] default array[]::text[],
  languages jsonb default '[]',
  career_goal text,
  target_major text,
  target_uni text,
  role text default 'student',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===== RLS: كل مستخدم يقرأ/يعدّل ملفه فقط =====
alter table profiles enable row level security;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- ===== جدول universities (إدارة من admin) =====
create table public.universities (
  id bigserial primary key,
  short text,
  name text not null,
  region text,
  type text,
  tuition_min int,
  image_url text,
  created_at timestamptz default now()
);
alter table universities enable row level security;
create policy "Public read" on universities for select using (true);
-- INSERT/UPDATE/DELETE فقط للأدمن (تتحدّد من user metadata)

-- ===== Storage Bucket للصور =====
-- في Supabase Dashboard → Storage → New Bucket: 'images' (public)
-- ثم RLS policy: authenticated users can insert, public can read
`;

const FLOW = [
  { from: '/profile', to: 'profiles table', via: 'Supabase client', status: 'يحتاج ربط' },
  { from: '/auth/register', to: 'auth.users + profiles', via: 'Supabase Auth', status: 'مربوط جزئياً' },
  { from: '/admin/dashboard (Universities)', to: 'universities table', via: 'service role', status: 'يحتاج ربط' },
  { from: '/admin/dashboard (Images)', to: 'storage/images bucket', via: 'Storage API', status: 'يحتاج ربط' },
  { from: '/scholarships', to: 'scholarships table', via: 'public read', status: 'محلّي حالياً' },
];

export default function DataFlowPage() {
  return (
    <main className="min-h-screen bg-bg-soft py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-sm text-[#1b3a6b] hover:underline">← العودة للوحة الإدارة</Link>
          <h1 className="text-4xl font-extrabold text-[#1b3a6b] mt-3 mb-2">📋 توثيق تدفق البيانات</h1>
          <p className="text-ink-muted">شرح كامل لمكان تخزين البيانات وكيفية الانتقال من localStorage للـ Supabase</p>
        </div>

        <section className="bg-surface rounded-2xl p-6 border border-slate-100 mb-6">
          <h2 className="text-2xl font-bold text-[#1b3a6b] mb-4">1. وين بتروح بيانات التسجيل؟</h2>
          <p className="text-ink-muted mb-4 leading-relaxed">
            الموقع مربوط بـ <strong>Supabase Auth</strong> (مزوّد المصادقة). لما حدا يسجّل من <code className="bg-bg-soft px-2 py-0.5 rounded text-sm">/auth/register</code>:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-ink-muted text-sm leading-relaxed">
            <li>الإيميل وكلمة المرور بنروحوا لجدول <code className="bg-bg-soft px-2 py-0.5 rounded">auth.users</code> (مدار من Supabase تلقائياً)</li>
            <li>كلمة المرور <strong>محفوظة مشفّرة (hashed)</strong> — حتى أنت ما بتقدر تشوفها</li>
            <li>الـ user يحصل على JWT token يستخدمه للوصول للموقع</li>
            <li>إذا في جدول <code className="bg-bg-soft px-2 py-0.5 rounded">profiles</code> منفصل → بيانات الطالب الكاملة (علامات، شهادات...) بتنحفظ هناك مرتبطة بالـ user.id</li>
          </ol>
          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-sm text-blue-900">
            <strong>للتحقق:</strong> ادخل على <a href="https://app.supabase.com" target="_blank" rel="noopener" className="underline">Supabase Dashboard</a> → Authentication → Users، وراح تشوف كل المسجّلين.
          </div>
        </section>

        <section className="bg-surface rounded-2xl p-6 border border-slate-100 mb-6">
          <h2 className="text-2xl font-bold text-[#1b3a6b] mb-4">2. خريطة تدفق البيانات الحالية</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-soft">
                <tr>
                  <th className="px-3 py-2 text-right font-bold">من</th>
                  <th className="px-3 py-2 text-right font-bold">إلى</th>
                  <th className="px-3 py-2 text-right font-bold">الطريق</th>
                  <th className="px-3 py-2 text-right font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {FLOW.map((f, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{f.from}</td>
                    <td className="px-3 py-2 font-mono text-xs">{f.to}</td>
                    <td className="px-3 py-2 text-ink-muted">{f.via}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${f.status === 'مربوط جزئياً' ? 'bg-emerald-100 text-emerald-700' : f.status === 'محلّي حالياً' ? 'bg-amber-100 text-amber-700' : 'bg-bg-soft text-ink-muted'}`}>{f.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-surface rounded-2xl p-6 border border-slate-100 mb-6">
          <h2 className="text-2xl font-bold text-[#1b3a6b] mb-4">3. مخطط قاعدة البيانات (SQL)</h2>
          <p className="text-ink-muted mb-4 text-sm leading-relaxed">
            انسخ هذا الـ SQL وشغّله في <strong>Supabase → SQL Editor</strong> لإنشاء الجداول المطلوبة:
          </p>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed">{SQL}</pre>
        </section>

        <section className="bg-surface rounded-2xl p-6 border border-slate-100 mb-6">
          <h2 className="text-2xl font-bold text-[#1b3a6b] mb-4">4. ترقية Image Upload لـ Supabase Storage</h2>
          <p className="text-ink-muted mb-4 text-sm leading-relaxed">
            في <code className="bg-bg-soft px-2 py-0.5 rounded">/admin/dashboard</code> الصور هلأ بتنحفظ كـ Data URLs بالمتصفح. للترقية:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-ink-muted text-sm leading-relaxed">
            <li>أنشئ bucket اسمه <code className="bg-bg-soft px-2 py-0.5 rounded">images</code> في Supabase Storage</li>
            <li>اجعله Public</li>
            <li>عدّل دالة <code className="bg-bg-soft px-2 py-0.5 rounded">handle()</code> في AdminDashboard لتستخدم Supabase Storage:</li>
          </ol>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto font-mono mt-3 leading-relaxed">{`import { supabase } from '@/lib/supabase';

const handle = async (e) => {
  const fs = e.target.files;
  for (const f of fs) {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(\`uploads/\${Date.now()}-\${f.name}\`, f);
    if (data) {
      const { data: { publicUrl } } = supabase.storage
        .from('images').getPublicUrl(data.path);
      // أضف publicUrl لقائمة media
    }
  }
};`}</pre>
        </section>

        <section className="bg-surface rounded-2xl p-6 border border-slate-100 mb-6">
          <h2 className="text-2xl font-bold text-[#1b3a6b] mb-4">5. ترقية Profile للسحابة</h2>
          <p className="text-ink-muted mb-4 text-sm leading-relaxed">
            في <code className="bg-bg-soft px-2 py-0.5 rounded">/profile</code> البيانات بـ localStorage. للترقية:
          </p>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed">{`// قراءة:
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

// تحديث:
await supabase
  .from('profiles')
  .upsert({ id: user.id, full_name: 'أحمد', ... });
`}</pre>
        </section>

        <section className="bg-surface rounded-2xl p-6 border border-slate-100 mb-6">
          <h2 className="text-2xl font-bold text-[#1b3a6b] mb-4">6. أدوار المستخدمين (Roles)</h2>
          <p className="text-ink-muted mb-4 text-sm leading-relaxed">
            لإضافة الأدوار (طالب/أهل/مدرسة/جامعة/أدمن):
          </p>
          <ol className="list-decimal list-inside space-y-2 text-ink-muted text-sm leading-relaxed">
            <li>أضف عمود <code className="bg-bg-soft px-2 py-0.5 rounded">role</code> في جدول <code className="bg-bg-soft px-2 py-0.5 rounded">profiles</code> (موجود بالـ SQL أعلاه)</li>
            <li>عند التسجيل: اختر الدور من dropdown واحفظه في <code className="bg-bg-soft px-2 py-0.5 rounded">profiles.role</code></li>
            <li>للأدمن: عدّل قيمة الـ role يدوياً من Supabase Dashboard لإيميل معيّن (مثلاً msharafeddine8@gmail.com → admin)</li>
            <li>أنشئ <code className="bg-bg-soft px-2 py-0.5 rounded">middleware.ts</code> يفحص role قبل السماح بالوصول لـ <code className="bg-bg-soft px-2 py-0.5 rounded">/admin/*</code></li>
          </ol>
        </section>

        <section className="bg-surface rounded-2xl p-6 border border-slate-100 mb-6">
          <h2 className="text-2xl font-bold text-[#1b3a6b] mb-4">7. متغيّرات البيئة المطلوبة (.env.local)</h2>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed">{`NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # للـ admin operations فقط
NEXT_PUBLIC_SITE_URL=https://masarak-khaki.vercel.app`}</pre>
          <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-sm text-red-900">
            <strong>⚠️ تحذير أمان:</strong> SUPABASE_SERVICE_ROLE_KEY يتجاوز كل RLS policies. لا تكشفه أبداً للـ frontend. استخدمه فقط في API routes (server-side).
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">🚀 خطّة الترقية الموصى بها</h2>
          <ol className="list-decimal list-inside space-y-3 text-sm leading-relaxed opacity-95">
            <li><strong>الأولوية 1:</strong> شغّل الـ SQL في Supabase وأنشئ جدول profiles مع RLS</li>
            <li><strong>الأولوية 2:</strong> أنشئ bucket 'images' في Storage</li>
            <li><strong>الأولوية 3:</strong> اربط /profile بـ Supabase (عدّل الـ useEffect والـ update لاستخدام supabase client)</li>
            <li><strong>الأولوية 4:</strong> اربط Image Upload بـ Storage (الكود أعلاه)</li>
            <li><strong>الأولوية 5:</strong> أضف middleware لحماية /admin/*</li>
            <li><strong>الأولوية 6:</strong> اربط Universities/Scholarships management بـ Supabase tables</li>
          </ol>
        </section>

        <div className="text-center">
          <Link href="/admin/dashboard" className="inline-block px-6 py-3 bg-[#1b3a6b] text-white rounded-lg font-bold hover:bg-[#142d54]">عودة للوحة الإدارة</Link>
        </div>
      </div>
    </main>
  );
}
