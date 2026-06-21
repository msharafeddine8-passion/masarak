'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

type Article = {
  id: number;
  title?: string | null;
  slug?: string | null;
  type?: string | null;
  is_published?: boolean | null;
  views?: number | null;
  created_at: string;
};

export default function ContentCenterTab() {
  const [list, setList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasTable, setHasTable] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('articles').select('id, title, slug, type, is_published, views, created_at').order('created_at', { ascending: false }).limit(500);
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') {
        // Try blog_posts instead
        const { data: bp, error: e2 } = await supabase.from('blog_posts').select('id, title, slug, is_published, created_at').order('created_at', { ascending: false }).limit(500);
        if (e2 && (e2.code === '42P01' || e2.code === 'PGRST205')) {
          setHasTable(false); setLoading(false); return;
        }
        setList((bp || []) as Article[]); setLoading(false); return;
      }
    }
    setList((data || []) as Article[]); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    total: list.length,
    published: list.filter(a => a.is_published).length,
    drafts: list.filter(a => !a.is_published).length,
    totalViews: list.reduce((a,x) => a + (x.views || 0), 0),
  }), [list]);

  if (!hasTable) {
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
        <h2 className="text-xl font-extrabold text-amber-900 mb-2">📰 مكتبة المقالات</h2>
        <p className="text-amber-800 mb-3">لا يوجد جدول articles بعد. الـ blog يستخدم static content حالياً.</p>
        <p className="text-xs text-ink-muted">قريباً: نقل الـ blog لـ DB-driven CMS مع تعديل من الإدمن مباشرة.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <K label="إجمالي المقالات" value={stats.total} icon="📰" tone="primary" />
        <K label="منشورة" value={stats.published} icon="✓" tone="success" />
        <K label="مسوّدات" value={stats.drafts} icon="📝" tone="warn" />
        <K label="إجمالي المشاهدات" value={stats.totalViews} icon="👁️" tone="info" />
      </div>

      <div className="bg-surface rounded-2xl border-2 border-white/10 p-4">
        <h3 className="font-extrabold mb-3">📚 آخر المقالات</h3>
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="h-12 bg-bg-soft animate-pulse rounded-xl" />)}</div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center text-ink-muted">لا يوجد مقالات بعد.</div>
        ) : (
          <div className="space-y-1">
            {list.slice(0, 30).map(a => (
              <div key={a.id} className="border-b border-gray-50 py-2 flex items-center justify-between text-sm">
                <div>
                  <div className="font-bold">{a.title || 'بدون عنوان'}</div>
                  <div className="text-xs text-ink-muted">{a.slug} · {a.type || 'article'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">{a.views || 0} مشاهدة</span>
                  <span className={'text-xs font-bold px-2 py-0.5 rounded-full ' + (a.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-bg-soft text-ink-subtle')}>
                    {a.is_published ? 'منشور' : 'مسوّدة'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function K({ label, value, icon, tone }: { label: string; value: number; icon: string; tone: 'primary'|'success'|'warn'|'info' }) {
  const c = { primary:'from-blue-50 to-indigo-50', success:'from-emerald-50 to-teal-50', warn:'from-amber-50 to-yellow-50', info:'from-purple-50 to-pink-50' };
  return (
    <div className={'bg-gradient-to-br ' + c[tone] + ' rounded-2xl border border-white/40 p-4'}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1 font-bold">{label}</div>
    </div>
  );
}
