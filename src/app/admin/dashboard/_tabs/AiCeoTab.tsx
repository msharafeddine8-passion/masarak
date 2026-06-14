'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Insight = {
  id: number;
  insight_key: string;
  title: string;
  body_md: string;
  data_payload: Record<string, unknown>;
  cost_usd?: number;
  tokens_in?: number;
  tokens_out?: number;
  generated_at: string;
};

export default function AiCeoTab({ flash }: { flash: (m: string) => void }) {
  const [today, setToday] = useState<Insight | null>(null);
  const [history, setHistory] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasAi, setHasAi] = useState<boolean | null>(null);

  async function load() {
    setLoading(true);
    // Check if today's briefing exists
    const todayKey = `daily_briefing_${new Date().toISOString().slice(0, 10)}`;
    const { data } = await supabase.from('ai_insights')
      .select('*')
      .eq('insight_key', todayKey)
      .maybeSingle();
    setToday(data as Insight | null);

    // Last 7 days history
    const { data: hist } = await supabase.from('ai_insights')
      .select('*')
      .eq('insight_type', 'daily_briefing')
      .order('generated_at', { ascending: false })
      .limit(7);
    setHistory((hist || []) as Insight[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function generate() {
    setGenerating(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) { flash('سجّل دخول أولاً'); setGenerating(false); return; }
      const resp = await fetch('/api/admin/ai-briefing', {
        method: 'POST',
        headers: { 'authorization': `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });
      const body = await resp.json();
      if (!body.ok) {
        if (body.error === 'ai_not_configured') {
          setHasAi(false);
          flash('ANTHROPIC_API_KEY غير مضبوط');
        } else {
          flash('فشل: ' + (body.error || 'unknown'));
        }
      } else {
        setHasAi(true);
        flash(`✓ تم — تكلفة: $${(body.cost_usd || 0).toFixed(4)}`);
        await load();
      }
    } catch (e) {
      flash('خطأ شبكة: ' + (e as Error).message);
    }
    setGenerating(false);
  }

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div className={`rounded-2xl border-2 p-4 ${hasAi === false ? 'bg-amber-50 border-amber-200' : 'bg-gradient-to-r from-violet-50 to-pink-50 border-violet-100'}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-extrabold text-lg">🧠 Masarak Intelligence</div>
            <div className="text-sm text-ink-muted mt-1">
              {hasAi === false
                ? <>الـ AI غير مفعّل. ضيف <code className="bg-white px-1 py-0.5 rounded">ANTHROPIC_API_KEY</code> بـ Vercel env (يلي بتاخده من <code>console.anthropic.com</code>). بعدها رح يصير عندك AI Chief of Staff يلي بيبعتلك briefing تنفيذي يومي.</>
                : 'الذكاء الاصطناعي بيحلّل بياناتك كل يوم، بيكتشف الفرص والمخاطر، وبيقترح أولويات اليوم.'}
            </div>
          </div>
          <button disabled={generating} onClick={generate} className="shrink-0 px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark disabled:opacity-50">
            {generating ? 'جاري التوليد...' : '✨ توليد briefing الآن'}
          </button>
        </div>
      </div>

      {/* Today's briefing */}
      {loading ? (
        <div className="bg-gray-100 rounded-2xl h-60 animate-pulse" />
      ) : today ? (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-extrabold">{today.title}</h2>
            <div className="text-xs text-ink-muted">
              توليد: {new Date(today.generated_at).toLocaleString('ar')} · تكلفة: ${(today.cost_usd || 0).toFixed(4)}
            </div>
          </div>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-ink leading-relaxed">
            {today.body_md}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
          <div className="text-4xl mb-3">🤖</div>
          <div className="font-bold mb-1">ما في briefing اليوم بعد</div>
          <div className="text-sm text-ink-muted">اضغط "توليد briefing الآن" فوق ليجي تحليل يومي شامل.</div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <h3 className="font-extrabold mb-3">📚 الأرشيف — آخر 7 أيام</h3>
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="border border-gray-100 rounded-xl p-3">
                <div className="font-bold text-sm">{h.title}</div>
                <div className="text-xs text-ink-muted mt-1">{new Date(h.generated_at).toLocaleString('ar')} · ${(h.cost_usd || 0).toFixed(4)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap card */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-white/40 p-4">
        <div className="font-extrabold mb-2">🚀 قريباً</div>
        <ul className="text-sm text-ink-muted space-y-1">
          <li>✦ Weekly strategic report</li>
          <li>✦ Auto-detected at-risk universities/schools</li>
          <li>✦ Trending careers across the Arab World</li>
          <li>✦ Sponsorship opportunity engine</li>
          <li>✦ User intent insights from search queries</li>
        </ul>
      </div>
    </div>
  );
}
