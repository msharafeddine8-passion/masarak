'use client';

export default function SettingsTab() {
  return (
    <div className="space-y-4 max-w-3xl">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg text-[#1b3a6b] mb-4">📋 معلومات النظام</h3>
        <dl className="text-sm space-y-2">
          <div className="flex justify-between border-b border-slate-100 py-2"><dt className="text-slate-500">الإصدار</dt><dd className="font-semibold">v2.1.0</dd></div>
          <div className="flex justify-between border-b border-slate-100 py-2"><dt className="text-slate-500">الإطار</dt><dd className="font-semibold">Next.js 14.2</dd></div>
          <div className="flex justify-between border-b border-slate-100 py-2"><dt className="text-slate-500">قاعدة البيانات</dt><dd className="font-semibold">Supabase</dd></div>
          <div className="flex justify-between border-b border-slate-100 py-2"><dt className="text-slate-500">الاستضافة</dt><dd className="font-semibold">Vercel</dd></div>
          <div className="flex justify-between py-2"><dt className="text-slate-500">المنظمة</dt><dd className="font-semibold">مسارك</dd></div>
        </dl>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg text-[#1b3a6b] mb-4">🔧 إعدادات النظام</h3>
        <p className="text-sm text-slate-600">قيد التطوير. التغييرات الحالية تتم من خلال:</p>
        <ul className="text-sm text-slate-600 mt-2 list-disc pr-5 space-y-1">
          <li>Supabase: <a href="https://supabase.com/dashboard/project/cxctwvqqnpvoebpelkle" target="_blank" rel="noopener noreferrer" className="text-[#1b3a6b] hover:underline">لوحة التحكم</a></li>
          <li>Vercel: <a href="https://vercel.com/msharafeddine8-passions-projects/masarak" target="_blank" rel="noopener noreferrer" className="text-[#1b3a6b] hover:underline">إعدادات النشر</a></li>
        </ul>
      </div>
    </div>
  );
}
