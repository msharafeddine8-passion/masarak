'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Kpi = {
  totalUsers: number;
  newToday: number;
  newThisMonth: number;
  active30d: number;
  paidActive: number;
  lifetime: number;
  revenueToday: number;
  revenueMonth: number;
  revenueYear: number;
  universities: number;
  schools: number;
  scholarships: number;
  majors: number;
  savedItems: number;
  dnaResults: number;
  openTickets: number;
  pendingInvites: number;
  asOf?: string;
};

type GrowthRow = { day: string; new_users: number; total_users: number };

type Notice = { id: number; severity: string; category: string; title: string; body?: string; created_at: string };

type Props = { onNavigate: (v: string) => void };

const fmt = (n: number) => n == null ? '—' : new Intl.NumberFormat('en-US').format(n);
const money = (n: number) => '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n || 0);

const cardBase = 'bg-surface rounded-2xl border-2 border-line p-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer';

function SourceBadge({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-mono text-slate-400 bg-bg-soft rounded px-1.5 py-0.5">
      📊 {label}
    </span>
  );
}

export default function ExecutiveOverviewTab({ onNavigate }: Props) {
  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [loading, setLoading] = useState(true);
  const [growth, setGrowth] = useState<GrowthRow[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [hasMigration, setHasMigration] = useState<boolean>(true);
  const [vocationalCount, setVocationalCount] = useState<number>(0);
  const [institutesCount, setInstitutesCount] = useState<number>(0);
  const [teamCount, setTeamCount] = useState<number>(0);
  const [dnaCount, setDnaCount] = useState<number>(0);

  async function loadAll() {
    setLoading(true);

    // KPIs via RPC (one round-trip)
    const { data, error } = await supabase.rpc('admin_kpi_overview');
    if (error && (error.code === '42883' || error.code === 'PGRST202' || error.message?.includes('does not exist'))) {
      setHasMigration(false);
      setLoading(false);
      return;
    }
    if (data) setKpi(data as Kpi);

    // Parallel: vocational programs + institutes counts + growth + notices + team + DNA
    const [voc, inst, gr, nt, team, dna] = await Promise.all([
      supabase.from('vocational_programs').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('vocational_institutes').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.rpc('admin_user_growth_30d'),
      supabase.from('admin_notifications')
        .select('id, severity, category, title, body, created_at')
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('team_members').select('id', { count: 'exact', head: true }),
      // DNA completion lives on student_profiles (no separate dna_results table)
      supabase.from('student_profiles').select('id', { count: 'exact', head: true }).eq('career_dna_completed', true),
    ]);

    setVocationalCount(voc.count ?? 0);
    setInstitutesCount(inst.count ?? 0);
    setTeamCount(team.count ?? 0);
    setDnaCount(dna.count ?? 0);
    if (gr.data) setGrowth(gr.data as GrowthRow[]);
    if (nt.data) setNotices(nt.data as Notice[]);

    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  if (!hasMigration) {
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
        <h2 className="text-xl font-extrabold text-amber-900 mb-2">⚙️ Super Admin غير مفعّل بعد</h2>
        <p className="text-amber-800 mb-3">شغّل ملف الـ SQL التالي على Supabase ليتفعّل الـ command center:</p>
        <code className="block bg-surface p-3 rounded-xl text-sm border border-amber-200 font-mono">
          supabase/migrations/20260614_super_admin.sql
        </code>
        <p className="text-xs text-amber-700 mt-3">بعد ما تشغّله، اعمل refresh وكل شي رح يشتغل.</p>
      </div>
    );
  }

  if (loading || !kpi) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-bg-soft rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const monthlyGrowth = kpi.totalUsers > 0 ? Math.round((kpi.newThisMonth / kpi.totalUsers) * 100) : 0;
  const conversionRate = kpi.totalUsers > 0 ? +(((kpi.paidActive || 0) / kpi.totalUsers) * 100).toFixed(1) : 0;
  const retentionRate = kpi.totalUsers > 0 ? +(((kpi.active30d || 0) / kpi.totalUsers) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Hero KPI row — Revenue + Users */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-primary">⚡ Executive Overview</h2>
            <SourceBadge label="admin_kpi_overview() · RPC" />
          </div>
          <button onClick={loadAll} className="text-xs font-bold bg-surface border-2 border-line rounded-lg px-3 py-1.5 hover:border-primary">
            🔄 تحديث
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {/* People metrics */}
          <button onClick={() => onNavigate('students')} className={cardBase + ' text-right'}>
            <div className="text-xs font-bold text-ink-muted mb-1">👥 إجمالي المستخدمين</div>
            <div className="text-3xl font-extrabold text-ink">{fmt(kpi.totalUsers)}</div>
            <div className="text-xs text-success mt-1">+{kpi.newThisMonth} هذا الشهر</div>

          </button>
          <button onClick={() => onNavigate('students')} className={cardBase + ' text-right'}>
            <div className="text-xs font-bold text-ink-muted mb-1">🟢 نشطين 30 يوم</div>
            <div className="text-3xl font-extrabold text-ink">{fmt(kpi.active30d)}</div>
            <div className="text-xs text-ink-muted mt-1">{retentionRate}% retention</div>

          </button>
          <button onClick={() => onNavigate('students')} className={cardBase + ' text-right'}>
            <div className="text-xs font-bold text-ink-muted mb-1">✨ تسجيلات اليوم</div>
            <div className="text-3xl font-extrabold text-ink">{fmt(kpi.newToday)}</div>
            <div className="text-xs text-ink-muted mt-1">{monthlyGrowth}% نمو شهري</div>

          </button>
          {/* Revenue metrics */}
          <button onClick={() => onNavigate('subscriptions')} className={cardBase + ' text-right'}>
            <div className="text-xs font-bold text-ink-muted mb-1">💵 إيراد اليوم</div>
            <div className="text-3xl font-extrabold text-ink">{money(kpi.revenueToday)}</div>
            <div className="text-xs text-ink-muted mt-1">{conversionRate}% conversion</div>

          </button>
          <button onClick={() => onNavigate('subscriptions')} className={cardBase + ' text-right'}>
            <div className="text-xs font-bold text-ink-muted mb-1">📅 إيراد الشهر</div>
            <div className="text-3xl font-extrabold text-ink">{money(kpi.revenueMonth)}</div>
            <div className="text-xs text-ink-muted mt-1">{fmt(kpi.paidActive)} مشترك مدفوع</div>

          </button>
          <button onClick={() => onNavigate('subscriptions')} className={cardBase + ' text-right'}>
            <div className="text-xs font-bold text-ink-muted mb-1">🏆 إيراد السنة</div>
            <div className="text-3xl font-extrabold text-ink">{money(kpi.revenueYear)}</div>
            <div className="text-xs text-ink-muted mt-1">{fmt(kpi.lifetime)} عضو مدى الحياة</div>

          </button>
        </div>
      </section>

      {/* Content snapshot */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-extrabold text-ink-muted">📚 مخزون المحتوى</h3>
          <SourceBadge label="Supabase · جداول متعددة" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button onClick={() => onNavigate('universities')} className={cardBase + ' bg-gradient-to-br from-blue-50 to-indigo-50 text-right'}>
            <div className="text-xs font-bold text-ink-muted mb-1">🏛️ جامعات</div>
            <div className="text-3xl font-extrabold text-ink">{fmt(kpi.universities)}</div>

          </button>
          <button onClick={() => onNavigate('schools')} className={cardBase + ' bg-gradient-to-br from-emerald-50 to-teal-50 text-right'}>
            <div className="text-xs font-bold text-ink-muted mb-1">🏫 مدارس</div>
            <div className="text-3xl font-extrabold text-ink">{fmt(kpi.schools)}</div>

          </button>
          <button onClick={() => onNavigate('scholarships_center')} className={cardBase + ' bg-gradient-to-br from-amber-50 to-yellow-50 text-right'}>
            <div className="text-xs font-bold text-ink-muted mb-1">🏆 منح دراسية</div>
            <div className="text-3xl font-extrabold text-ink">{fmt(kpi.scholarships)}</div>

          </button>
          <button onClick={() => onNavigate('universities')} className={cardBase + ' bg-gradient-to-br from-purple-50 to-pink-50 text-right'}>
            <div className="text-xs font-bold text-ink-muted mb-1">📖 تخصصات</div>
            <div className="text-3xl font-extrabold text-ink">{fmt(kpi.majors)}</div>

          </button>
          <button onClick={() => onNavigate('dna_analytics')} className={cardBase + ' bg-gradient-to-br from-rose-50 to-orange-50 text-right'}>
            <div className="text-xs font-bold text-ink-muted mb-1">🧬 DNA results</div>
            <div className="text-3xl font-extrabold text-ink">{fmt(dnaCount)}</div>

          </button>
          <button onClick={() => onNavigate('vocational')} className={cardBase + ' bg-gradient-to-br from-sky-50 to-cyan-50 text-right'}>
            <div className="text-xs font-bold text-ink-muted mb-1">🛠️ مسارات مهنية</div>
            <div className="text-3xl font-extrabold text-ink">{fmt(vocationalCount)}</div>

          </button>
          <button onClick={() => onNavigate('institutes')} className={cardBase + ' bg-gradient-to-br from-lime-50 to-green-50 text-right'}>
            <div className="text-xs font-bold text-ink-muted mb-1">🏭 معاهد مهنية</div>
            <div className="text-3xl font-extrabold text-ink">{fmt(institutesCount)}</div>

          </button>
          <button onClick={() => onNavigate('team')} className={cardBase + ' bg-gradient-to-br from-violet-50 to-purple-50 text-right'}>
            <div className="text-xs font-bold text-ink-muted mb-1">👥 أعضاء الفريق</div>
            <div className="text-3xl font-extrabold text-ink">{fmt(teamCount)}</div>
            <div className="text-xs text-ink-muted mt-1">اضغط لإدارة الفريق</div>

          </button>
        </div>
      </section>

      {/* Operations row */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-extrabold text-ink-muted">⚙️ العمليات اليومية</h3>
          <SourceBadge label="Supabase · جداول متعددة" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <button onClick={() => onNavigate('orgs')} className="bg-surface rounded-2xl border-2 border-amber-100 p-4 text-right hover:border-amber-300">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold text-amber-700">📥 دعوات معلّقة</div>
              <span className="text-2xl">{kpi.pendingInvites > 0 ? '🔔' : '✅'}</span>
            </div>
            <div className="text-3xl font-extrabold text-ink">{fmt(kpi.pendingInvites)}</div>
            <div className="text-xs text-ink-muted mt-1">{kpi.pendingInvites > 0 ? 'اضغط لإدارة الدعوات' : 'لا دعوات معلّقة'}</div>

          </button>
          <button onClick={() => onNavigate('support')} className="bg-surface rounded-2xl border-2 border-rose-100 p-4 text-right hover:border-rose-300">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold text-rose-700">🎫 تذاكر دعم مفتوحة</div>
              <span className="text-2xl">{kpi.openTickets > 0 ? '⚠️' : '✅'}</span>
            </div>
            <div className="text-3xl font-extrabold text-ink">{fmt(kpi.openTickets)}</div>
            <div className="text-xs text-ink-muted mt-1">{kpi.openTickets > 0 ? 'اضغط لعرض التذاكر' : 'كل التذاكر محلولة'}</div>

          </button>
          <div className="bg-surface rounded-2xl border-2 border-emerald-100 p-4 text-right">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold text-emerald-700">⭐ عناصر محفوظة</div>
              <span className="text-2xl">📌</span>
            </div>
            <div className="text-3xl font-extrabold text-ink">{fmt(kpi.savedItems)}</div>
            <div className="text-xs text-ink-muted mt-1">إجمالي حفظ من المستخدمين</div>

          </div>
        </div>
      </section>

      {/* Growth Sparkline */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-extrabold text-ink-muted">📈 نمو المستخدمين (30 يوم)</h3>
          <SourceBadge label="admin_user_growth_30d() · RPC" />
        </div>
        <GrowthSparkline rows={growth} />
      </section>

      {/* Notifications */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-extrabold text-ink-muted">🔔 تنبيهات إدارية</h3>
            <SourceBadge label="admin_notifications" />
          </div>
          <span className="text-xs text-ink-muted">{notices.length} غير مقروءة</span>
        </div>
        {notices.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-700">
            ✅ ما في تنبيهات جديدة. كل شي ماشي تمام.
          </div>
        ) : (
          <div className="space-y-2">
            {notices.map(n => <NoticeRow key={n.id} n={n} onRead={loadAll} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function GrowthSparkline({ rows }: { rows: GrowthRow[] }) {
  if (!rows.length) {
    return <div className="bg-bg-soft border-2 border-dashed border-line rounded-xl p-6 text-center text-sm text-ink-muted">لسا ما في data كافي لرسم النمو</div>;
  }
  const max = Math.max(...rows.map(r => Number(r.new_users) || 0), 1);
  const w = 800, h = 120, pad = 8;
  const points = rows.map((r, i) => {
    const x = pad + (i / Math.max(rows.length - 1, 1)) * (w - 2 * pad);
    const y = h - pad - ((Number(r.new_users) || 0) / max) * (h - 2 * pad);
    return `${x},${y}`;
  }).join(' ');
  const totalNew = rows.reduce((s, r) => s + (Number(r.new_users) || 0), 0);
  const peak = rows.reduce((p, r) => (Number(r.new_users) > Number(p.new_users) ? r : p), rows[0]);
  return (
    <div className="bg-surface border-2 border-line rounded-2xl p-4">
      <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
        <span>إجمالي مستخدمين جدد: <strong className="text-ink">{totalNew}</strong></span>
        <span>أعلى يوم: <strong className="text-ink">{peak?.new_users}</strong></span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
        <polyline fill="none" stroke="#10B981" strokeWidth="2" points={points} />
        {rows.map((r, i) => {
          const x = pad + (i / Math.max(rows.length - 1, 1)) * (w - 2 * pad);
          const y = h - pad - ((Number(r.new_users) || 0) / max) * (h - 2 * pad);
          return <circle key={i} cx={x} cy={y} r={2} fill="#059669" />;
        })}
      </svg>
    </div>
  );
}

function NoticeRow({ n, onRead }: { n: Notice; onRead: () => void }) {
  const color = n.severity === 'danger' ? 'border-rose-200 bg-rose-50' :
                n.severity === 'warn'   ? 'border-amber-200 bg-amber-50' :
                n.severity === 'success'? 'border-emerald-200 bg-emerald-50' :
                                         'border-blue-200 bg-blue-50';
  async function markRead() {
    await supabase.from('admin_notifications').update({ read_at: new Date().toISOString() }).eq('id', n.id);
    onRead();
  }
  return (
    <div className={`border-2 rounded-xl p-3 ${color}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="font-bold text-sm">{n.title}</div>
          {n.body && <div className="text-xs text-ink-muted mt-1">{n.body}</div>}
          <div className="text-[10px] text-ink-muted mt-1">{new Date(n.created_at).toLocaleString('ar')}</div>
        </div>
        <button onClick={markRead} className="text-xs font-bold bg-surface px-2 py-1 rounded border border-line hover:border-primary">
          ✓ تم
        </button>
      </div>
    </div>
  );
}
