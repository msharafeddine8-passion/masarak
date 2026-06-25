'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Issue = { type: string; entity: string; id: number; field: string; suggestion: string };

export default function SeoCommandTab() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  async function scan() {
    setLoading(true);
    const found: Issue[] = [];

    // Universities missing slug
    const { data: u1 } = await supabase.from('universities').select('id, name_ar, slug').is('slug', null).limit(50);
    if (u1) for (const u of u1 as { id: number; name_ar?: string; slug?: string }[]) {
      found.push({ type: 'missing_slug', entity: 'university', id: u.id, field: 'slug', suggestion: 'أضف slug للوصول للجامعة عبر URL واضح' });
    }
    // Universities missing logo
    const { data: u2 } = await supabase.from('universities').select('id').is('logo_url', null).limit(50);
    if (u2) for (const u of u2 as { id: number }[]) {
      found.push({ type: 'missing_logo', entity: 'university', id: u.id, field: 'logo_url', suggestion: 'ارفع شعار للجامعة (Open Graph)' });
    }
    // Universities stale
    const monthAgo = new Date(Date.now() - 30*24*3600*1000).toISOString();
    const { data: u3 } = await supabase.from('universities').select('id').or(`last_verified_at.is.null,last_verified_at.lt.${monthAgo}`).limit(50);
    if (u3) for (const u of u3 as { id: number }[]) {
      found.push({ type: 'stale_content', entity: 'university', id: u.id, field: 'last_verified_at', suggestion: 'حدّث البيانات — لـ Google ولثقة الطلاب' });
    }
    // Schools missing slug
    const { data: s1 } = await supabase.from('schools').select('id').is('slug', null).limit(50);
    if (s1) for (const s of s1 as { id: number }[]) {
      found.push({ type: 'missing_slug', entity: 'school', id: s.id, field: 'slug', suggestion: 'أضف slug للوصول للمدرسة عبر URL واضح' });
    }
    // Majors missing slug
    const { data: m1 } = await supabase.from('majors').select('id').is('slug', null).limit(50);
    if (m1) for (const m of m1 as { id: number }[]) {
      found.push({ type: 'missing_slug', entity: 'major', id: m.id, field: 'slug', suggestion: 'أضف slug للتخصّص' });
    }

    setIssues(found); setLoading(false);
  }
  useEffect(() => { scan(); }, []);

  const stats = {
    total: issues.length,
    bySev: {
      high: issues.filter(i => i.type === 'missing_slug').length,
      med: issues.filter(i => i.type === 'missing_logo' || i.type === 'stale_content').length,
      low: 0,
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <K label="إجمالي المشاكل" value={stats.total} icon="🔍" tone="primary" />
        <K label="عالية الأولوية" value={stats.bySev.high} icon="🚨" tone="danger" />
        <K label="متوسطة الأولوية" value={stats.bySev.med} icon="⚠️" tone="warn" />
        <K label="منخفضة" value={stats.bySev.low} icon="ℹ️" tone="info" />
      </div>

      <div className="bg-surface rounded-2xl border-2 border-line p-4">
        <div className="flex justify-between mb-3">
          <h3 className="font-extrabold">📋 المشاكل المكتشفة</h3>
          <button onClick={scan} className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-bold">🔄 إعادة فحص</button>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="h-12 bg-bg-soft animate-pulse rounded-xl" />)}</div>
        ) : issues.length === 0 ? (
          <div className="py-12 text-center text-emerald-700 font-bold">✅ ممتاز! ما في مشاكل SEO حالياً.</div>
        ) : (
          <div className="space-y-2">
            {issues.slice(0, 50).map((i, idx) => (
              <div key={idx} className="border border-line rounded-xl p-3 hover:bg-bg-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-bold text-sm">
                      {i.entity} #{i.id} — مشكلة في <code className="text-xs bg-rose-100 text-rose-700 px-1 rounded">{i.field}</code>
                    </div>
                    <div className="text-xs text-ink-muted mt-1">{i.suggestion}</div>
                  </div>
                  <span className={'text-xs font-bold px-2 py-1 rounded-full ' + (
                    i.type === 'missing_slug' ? 'bg-rose-100 text-rose-700' :
                    i.type === 'stale_content' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  )}>{i.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-white/40 p-4">
        <div className="font-extrabold mb-2">🚀 قريباً</div>
        <ul className="text-sm text-ink-muted space-y-1">
          <li>✦ ربط Google Search Console API → keyword tracking</li>
          <li>✦ Broken links scanner (يقرأ كل sitemap.xml)</li>
          <li>✦ Core Web Vitals من Vercel Analytics</li>
          <li>✦ Backlinks via Ahrefs/SEMrush (يحتاج API key)</li>
        </ul>
      </div>
    </div>
  );
}

function K({ label, value, icon, tone }: { label: string; value: number; icon: string; tone: 'primary'|'warn'|'info'|'danger' }) {
  const c = { primary:'from-blue-50 to-indigo-50', warn:'from-amber-50 to-yellow-50', info:'from-purple-50 to-pink-50', danger:'from-rose-50 to-red-50' };
  return (
    <div className={'bg-gradient-to-br ' + c[tone] + ' rounded-2xl border border-white/40 p-4'}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1 font-bold">{label}</div>
    </div>
  );
}
