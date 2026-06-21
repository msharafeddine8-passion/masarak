'use client';
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function Field({ label, children, span }: { label: string; children: React.ReactNode; span?: number }) {
  return <div className={span ? `md:col-span-${span}` : ''}><label className="block text-xs font-semibold text-ink-muted mb-1.5">{label}</label>{children}</div>;
}
export function Input(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:border-[#1b3a6b] focus:outline-none focus:ring-2 focus:ring-[#1b3a6b]/10" />;
}
export function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className="w-full px-3 py-2 border border-line rounded-lg text-sm min-h-[80px] focus:border-[#1b3a6b] focus:outline-none" />;
}
export function Select({ children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className="w-full px-3 py-2 border border-line rounded-lg bg-surface text-sm focus:border-[#1b3a6b] focus:outline-none">{children}</select>;
}

export function Modal({ onClose, title, children, size = 'lg' }: { onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`bg-surface rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[92vh] overflow-y-auto`} dir="rtl">
        <div className="sticky top-0 bg-surface border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-[#1b3a6b]">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-bg-soft flex items-center justify-center text-2xl">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ImageUpload({ value, onChange, folder }: { value?: string; onChange: (url: string) => void; folder?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErr('الحجم > 5MB'); return; }
    setUploading(true); setErr('');
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
      const path = `${folder || 'general'}/${Date.now()}_${safe}`;
      const { error: ue } = await supabase.storage.from('images').upload(path, file, { cacheControl: '3600', upsert: false });
      if (ue) throw ue;
      const { data: pub } = supabase.storage.from('images').getPublicUrl(path);
      onChange(pub.publicUrl);
    } catch (e: any) { setErr(e.message); }
    finally { setUploading(false); if (ref.current) ref.current.value = ''; }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} dir="ltr" placeholder="https://... أو ارفع"
          className="flex-1 px-3 py-2 border border-line rounded-lg text-sm" />
        <input ref={ref} type="file" accept="image/*" onChange={upload} className="hidden" disabled={uploading} />
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="px-4 py-2 bg-[#5cc4b8] text-[#0f2240] rounded-lg font-bold text-sm whitespace-nowrap disabled:opacity-50 hover:bg-[#4dafa3]">
          {uploading ? '⏳' : '📤 رفع'}
        </button>
      </div>
      {value && (
        <div className="flex items-center gap-2 bg-bg-soft p-2 rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-16 h-12 object-cover rounded border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="flex-1 text-xs text-ink-subtle break-all" dir="ltr">{value}</div>
          <button onClick={() => onChange('')} type="button" className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold">حذف</button>
        </div>
      )}
      {err && <div className="text-xs text-red-600">❌ {err}</div>}
    </div>
  );
}

export function Toolbar({ search, setSearch, onAdd, addLabel, onSeed, seedLabel, count, total, extra }: any) {
  return (
    <div className="bg-surface rounded-2xl border border-slate-100 p-4 mb-5 flex flex-wrap gap-3 items-center">
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 بحث..."
        className="flex-1 min-w-[200px] px-4 py-2.5 border border-line rounded-lg text-sm" />
      <div className="text-sm text-ink-subtle font-semibold">{count}{total !== undefined && total !== count ? ` / ${total}` : ''}</div>
      {extra}
      {onSeed && <button onClick={onSeed} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm whitespace-nowrap">{seedLabel || '📥 استيراد بيانات'}</button>}
      <button onClick={onAdd} className="px-4 py-2 bg-[#1b3a6b] hover:bg-[#142d54] text-white rounded-lg font-bold text-sm whitespace-nowrap">{addLabel || '+ إضافة'}</button>
    </div>
  );
}

export function EmptyState({ icon = '📂', text, action }: { icon?: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16 bg-surface rounded-2xl border-2 border-dashed border-line">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-ink-muted mb-4">{text}</p>
      {action}
    </div>
  );
}
