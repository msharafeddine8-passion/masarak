'use client';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SettingsTab({ profile, update, userEmail }: { profile: any; update: (p: any) => void; userEmail: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm('⚠️ هل أنت متأكد من حذف الحساب؟ هذا الإجراء لا يمكن التراجع عنه!')) return;
    if (prompt('اكتب "حذف" للتأكيد:') !== 'حذف') { alert('تم الإلغاء'); return; }
    alert('للحذف الكامل، يرجى التواصل مع support@masaraklb.com');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Privacy */}
      <SettingsSection title="🔒 الخصوصية" desc="تحكّم بمن يقدر يشوف ملفك">
        <Toggle label="ملفي عام (يقدر أي حدا يشوفه)" value={!!profile.is_public} onChange={(v) => update({ is_public: v })} />
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="🔔 الإشعارات" desc="اختر نوع التنبيهات اللي بدّك تستلمها">
        <Toggle label="إشعارات الموقع" value={true} onChange={() => {}} disabled />
        <Toggle label="إشعارات الإيميل" value={true} onChange={() => {}} disabled />
        <Toggle label="تذكيرات بمواعيد المنح" value={true} onChange={() => {}} disabled />
        <p className="text-xs text-slate-500 mt-3">إعدادات الإشعارات قيد التطوير</p>
      </SettingsSection>

      {/* Language */}
      <SettingsSection title="🌐 اللغة" desc="لغة الموقع">
        <select value={profile.language_pref || 'ar'} onChange={(e) => update({ language_pref: e.target.value })} className="w-full md:w-64 px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
          <option value="ar">🇱🇧 العربية</option>
          <option value="en" disabled>🇬🇧 English (قريباً)</option>
        </select>
      </SettingsSection>

      {/* Theme */}
      <SettingsSection title="🎨 المظهر" desc="الوضع الفاتح/الداكن">
        <Toggle label="الوضع الداكن" value={!!profile.dark_mode} onChange={(v) => update({ dark_mode: v })} disabled />
        <p className="text-xs text-slate-500 mt-2">الوضع الداكن قيد التطوير</p>
      </SettingsSection>

      {/* Security */}
      <SettingsSection title="🛡️ الأمان والحساب" desc="إدارة حسابك">
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
            <div>
              <div className="font-bold text-sm">الإيميل</div>
              <div className="text-xs text-slate-500" dir="ltr">{userEmail}</div>
            </div>
            <button disabled className="text-xs text-slate-400">تغيير</button>
          </div>
          <button onClick={handleLogout} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-lg font-bold text-sm transition">
            🚪 تسجيل الخروج
          </button>
        </div>
      </SettingsSection>

      {/* Danger zone */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
        <h3 className="font-bold text-red-700 mb-2">⚠️ منطقة الخطر</h3>
        <p className="text-sm text-red-600 mb-4">حذف الحساب لا يمكن التراجع عنه. كل بياناتك ستحذف نهائياً.</p>
        <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition">حذف حسابي</button>
      </div>
    </div>
  );
}

function SettingsSection({ title, desc, children }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-lg text-[#1b3a6b]">{title}</h3>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange, disabled }: any) {
  return (
    <div className={`flex items-center justify-between py-2 ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <button onClick={() => !disabled && onChange(!value)} disabled={disabled} type="button"
        className={`relative w-12 h-6 rounded-full transition ${value ? 'bg-[#1b3a6b]' : 'bg-slate-300'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${value ? 'right-0.5' : 'right-6'}`}></div>
      </button>
    </div>
  );
}
