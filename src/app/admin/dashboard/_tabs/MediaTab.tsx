'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/notify';
import { EmptyState } from './_shared';

const FOLDERS = ['general', 'universities', 'schools', 'vocational', 'avatars'];

export default function MediaTab() {
  const r = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [folder, setFolder] = useState('general');
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [folder]);

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const { data, error } = await supabase.storage.from('images').list(folder, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      const items = (data || []).filter((f: any) => f.name && !f.name.startsWith('.')).map((f: any) => {
        const { data: pub } = supabase.storage.from('images').getPublicUrl(`${folder}/${f.name}`);
        return { name: f.name, path: `${folder}/${f.name}`, sz: f.metadata?.size ? (f.metadata.size / 1024).toFixed(1) + ' KB' : '—', u: pub.publicUrl, created: f.created_at };
      });
      setMedia(items);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLoading(true); setErr('');
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
        const { error: ue } = await supabase.storage.from('images').upload(`${folder}/${Date.now()}_${i}_${safe}`, f, { cacheControl: '3600', upsert: false });
        if (ue) throw ue;
      }
      await load();
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); if (r.current) r.current.value = ''; }
  };

  const remove = async (path: string) => {
    if (!confirm('حذف هذه الصورة؟')) return;
    await supabase.storage.from('images').remove([path]);
    await load();
  };
  const copyUrl = async (url: string) => { await navigator.clipboard.writeText(url); toast('تم نسخ الرابط', 'ok'); };

  const filtered = media.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* Folder pills */}
      <div className="flex flex-wrap gap-2">
        {FOLDERS.map(f => (
          <button key={f} onClick={() => setFolder(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${folder === f ? 'bg-[#1b3a6b] text-white' : 'bg-bg-soft hover:bg-bg-soft text-ink-muted'}`}>
            📁 {f}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2 flex-wrap items-center bg-surface rounded-2xl p-4 border border-slate-100">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 ابحث..." className="flex-1 min-w-[200px] px-4 py-2 border border-line rounded-lg text-sm" />
        <div className="text-sm text-ink-subtle font-bold">{filtered.length} صورة</div>
        <input ref={r} type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files)} className="hidden" disabled={loading} />
        <button onClick={() => r.current?.click()} disabled={loading} className="px-4 py-2 bg-[#1b3a6b] hover:bg-[#142d54] text-white rounded-lg font-bold text-sm disabled:opacity-50">
          {loading ? '⏳' : '+ رفع صور'}
        </button>
      </div>

      {/* Drag-drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${dragOver ? 'border-[#5cc4b8] bg-emerald-50' : 'border-line bg-bg-soft'}`}>
        <div className="text-4xl mb-2">📤</div>
        <p className="text-sm text-ink-muted">اسحب وأفلت الصور هنا، أو اضغط زر "رفع صور"</p>
      </div>

      {err && <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-sm text-red-900">❌ {err}</div>}

      {loading && media.length === 0 ? <div className="text-center py-12">⏳</div> : filtered.length === 0 ? (
        <EmptyState icon="🖼️" text="لا صور في هذا المجلد" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(m => (
            <div key={m.path} className="bg-surface rounded-xl border border-slate-100 overflow-hidden group hover:shadow-lg transition">
              <div className="aspect-video bg-bg-soft relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.u} alt={m.name} className="w-full h-full object-cover" />
                <button onClick={() => remove(m.path)} className="absolute top-2 left-2 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center font-bold">×</button>
              </div>
              <div className="p-2">
                <div className="font-semibold text-xs truncate" title={m.name}>{m.name}</div>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="text-ink-subtle">{m.sz}</span>
                  <button onClick={() => copyUrl(m.u)} className="text-[#1b3a6b] hover:underline font-bold">📋 رابط</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
