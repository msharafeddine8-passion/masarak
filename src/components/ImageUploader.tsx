'use client';
import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  maxSizeMB?: number;
  compact?: boolean;
}

export default function ImageUploader({ value, onChange, folder = 'general', maxSizeMB = 5, compact = false }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) { setErr(`الحجم > ${maxSizeMB}MB`); return; }
    setUploading(true); setErr('');
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
      const path = `${folder}/${Date.now()}_${safeName}`;
      const { error: upErr } = await supabase.storage.from('images').upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('images').getPublicUrl(path);
      onChange(pub.publicUrl);
    } catch (e: any) { setErr(e.message); }
    finally { setUploading(false); if (ref.current) ref.current.value = ''; }
  };

  if (compact) {
    return (
      <div>
        <input ref={ref} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="px-3 py-1.5 bg-[#5cc4b8] text-[#1b3a6b] rounded-lg font-bold text-xs disabled:opacity-50 hover:bg-[#4dafa3]">
          {uploading ? '⏳' : '📤 رفع'}
        </button>
        {err && <div className="text-xs text-red-600 mt-1">❌ {err}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-stretch">
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="https://... أو اضغط رفع" dir="ltr"
          className="flex-1 px-3 py-2 border border-white/10 rounded-lg text-sm" />
        <input ref={ref} type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="px-4 py-2 bg-[#5cc4b8] text-[#1b3a6b] rounded-lg font-bold text-sm whitespace-nowrap disabled:opacity-50 hover:bg-[#4dafa3]">
          {uploading ? '⏳ يرفع...' : '📤 رفع صورة'}
        </button>
      </div>
      {value && (
        <div className="flex items-center gap-3 bg-bg-soft rounded-lg p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="معاينة" className="w-20 h-14 object-cover rounded border border-white/10"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="text-xs text-ink-subtle break-all flex-1" dir="ltr">{value}</div>
          <button type="button" onClick={() => onChange('')} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-semibold">حذف</button>
        </div>
      )}
      {err && <div className="text-xs text-red-600">❌ {err}</div>}
    </div>
  );
}
