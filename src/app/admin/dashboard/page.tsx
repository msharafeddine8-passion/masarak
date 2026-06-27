'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { isSuperAdminUser } from '@/lib/permissions/context';

// Lazy loading skeleton shown while each tab chunk loads
function TabSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-bg-soft rounded-2xl h-24" />
        ))}
      </div>
      <div className="bg-bg-soft rounded-2xl h-40" />
      <div className="bg-bg-soft rounded-2xl h-60" />
    </div>
  );
}

// Dynamic imports — each tab is a separate JS chunk loaded on demand
// Note: options must be inlined (not a variable) per Next.js dynamic() requirements
const ExecutiveOverviewTab  = dynamic(() => import('./_tabs/ExecutiveOverviewTab'),  { ssr: false, loading: () => <TabSkeleton /> });
const AiCeoTab              = dynamic(() => import('./_tabs/AiCeoTab'),              { ssr: false, loading: () => <TabSkeleton /> });
const StudentsCenterTab     = dynamic(() => import('./_tabs/StudentsCenterTab'),     { ssr: false, loading: () => <TabSkeleton /> });
const OrgRequestsTab        = dynamic(() => import('./_tabs/OrgRequestsTab'),        { ssr: false, loading: () => <TabSkeleton /> });
const TeamTab               = dynamic(() => import('./_tabs/TeamTab'),               { ssr: false, loading: () => <TabSkeleton /> });
const UniversitiesCenterTab = dynamic(() => import('./_tabs/UniversitiesCenterTab'), { ssr: false, loading: () => <TabSkeleton /> });
const SchoolsCenterTab      = dynamic(() => import('./_tabs/SchoolsCenterTab'),      { ssr: false, loading: () => <TabSkeleton /> });
const VocationalTab         = dynamic(() => import('./_tabs/VocationalTab'),         { ssr: false, loading: () => <TabSkeleton /> });
const InstitutesTab         = dynamic(() => import('./_tabs/InstitutesTab'),         { ssr: false, loading: () => <TabSkeleton /> });
const SubscriptionsCenterTab= dynamic(() => import('./_tabs/SubscriptionsCenterTab'),{ ssr: false, loading: () => <TabSkeleton /> });
const SponsorsCenterTab     = dynamic(() => import('./_tabs/SponsorsCenterTab'),     { ssr: false, loading: () => <TabSkeleton /> });
const RevenueCenterTab      = dynamic(() => import('./_tabs/RevenueCenterTab'),      { ssr: false, loading: () => <TabSkeleton /> });
const ScholarshipsCenterTab = dynamic(() => import('./_tabs/ScholarshipsCenterTab'), { ssr: false, loading: () => <TabSkeleton /> });
const CareerDnaCenterTab    = dynamic(() => import('./_tabs/CareerDnaCenterTab'),    { ssr: false, loading: () => <TabSkeleton /> });
const ContentCenterTab      = dynamic(() => import('./_tabs/ContentCenterTab'),      { ssr: false, loading: () => <TabSkeleton /> });
const ReviewsTab            = dynamic(() => import('./_tabs/ReviewsTab'),            { ssr: false, loading: () => <TabSkeleton /> });
const MediaTab              = dynamic(() => import('./_tabs/MediaTab'),              { ssr: false, loading: () => <TabSkeleton /> });
const MarketingCenterTab    = dynamic(() => import('./_tabs/MarketingCenterTab'),    { ssr: false, loading: () => <TabSkeleton /> });
const SeoCommandTab         = dynamic(() => import('./_tabs/SeoCommandTab'),         { ssr: false, loading: () => <TabSkeleton /> });
const NotificationsTab      = dynamic(() => import('./_tabs/NotificationsTab'),      { ssr: false, loading: () => <TabSkeleton /> });
const SupportCenterTab      = dynamic(() => import('./_tabs/SupportCenterTab'),      { ssr: false, loading: () => <TabSkeleton /> });
const AuditCenterTab        = dynamic(() => import('./_tabs/AuditCenterTab'),        { ssr: false, loading: () => <TabSkeleton /> });
const SettingsTab           = dynamic(() => import('./_tabs/SettingsTab'),           { ssr: false, loading: () => <TabSkeleton /> });

type V =
  | 'overview' | 'ai_ceo'
  | 'students' | 'orgs' | 'team'
  | 'universities' | 'schools' | 'vocational' | 'institutes'
  | 'subscriptions' | 'sponsors' | 'revenue'
  | 'scholarships_center' | 'content_center' | 'dna_analytics'
  | 'marketing' | 'seo' | 'support'
  | 'notifications' | 'reviews' | 'media' | 'audit' | 'settings' | 'admins';

type NavItem = { id: V; label: string; icon: string; badge?: string };

const NAV: { group: string; items: NavItem[] }[] = [
  { group: '🏠 القيادة', items: [
    { id: 'overview', label: 'Executive Overview', icon: '⚡' },
    { id: 'ai_ceo', label: 'Masarak Intelligence', icon: '🧠', badge: 'AI' },
  ]},
  { group: '👥 الناس', items: [
    { id: 'students', label: 'الطلاب', icon: '🎓' },
    { id: 'orgs', label: 'طلبات المؤسسات', icon: '📥' },
    { id: 'team', label: 'الفريق', icon: '👥' },
  ]},
  { group: '🏛️ المؤسسات', items: [
    { id: 'universities', label: 'الجامعات', icon: '🏛️' },
    { id: 'schools', label: 'المدارس', icon: '🏫' },
    { id: 'vocational', label: 'المسارات المهنية', icon: '🛠️' },
    { id: 'institutes', label: 'المعاهد', icon: '🏭' },
  ]},
  { group: '💰 الإيرادات', items: [
    { id: 'subscriptions', label: 'الاشتراكات', icon: '💎' },
    { id: 'sponsors', label: 'الرعاة والشركاء', icon: '🤝' },
    { id: 'revenue', label: 'تقارير الإيرادات', icon: '📊' },
  ]},
  { group: '📚 المحتوى', items: [
    { id: 'scholarships_center', label: 'مركز المنح', icon: '🏆' },
    { id: 'dna_analytics', label: 'Career DNA Analytics', icon: '🧬' },
    { id: 'content_center', label: 'مكتبة المقالات', icon: '📰' },
    { id: 'reviews', label: 'التقييمات', icon: '⭐' },
    { id: 'media', label: 'مكتبة الصور', icon: '🖼️' },
  ]},
  { group: '📣 التسويق والدعم', items: [
    { id: 'marketing', label: 'مركز التسويق', icon: '🚀' },
    { id: 'seo', label: 'SEO Command', icon: '🔍' },
    { id: 'notifications', label: 'الإشعارات', icon: '🔔' },
    { id: 'support', label: 'دعم العملاء', icon: '🎫' },
  ]},
  { group: '🔐 الأمان', items: [
    { id: 'admins', label: 'المشرفون', icon: '🛡️' },
    { id: 'audit', label: 'سجل العمليات', icon: '📜' },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️' },
  ]},
];

// Surfaces hidden from co-admins (helper admins): finance + subscriber private
// data, and the admin-management tool itself (only the super admin grants admins).
const CO_ADMIN_HIDDEN = new Set<V>(['subscriptions', 'sponsors', 'revenue', 'students', 'admins']);

export default function AdminDashboard() {
  const [v, setV] = useState<V>('overview');
  const [msg, setMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsSuper(isSuperAdminUser(data.user)));
  }, []);

  // Co-admins (helper admins) don't see finance + subscriber-PII surfaces.
  const visibleNav = NAV
    .map(g => ({ ...g, items: g.items.filter(i => isSuper || !CO_ADMIN_HIDDEN.has(i.id)) }))
    .filter(g => g.items.length > 0);
  const allItems = NAV.flatMap(g => g.items);
  const current = allItems.find(i => i.id === v);
  const blocked = !isSuper && CO_ADMIN_HIDDEN.has(v);

  return (
    <div className="min-h-screen bg-bg flex" dir="rtl">
      <aside className={(sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0') + ' fixed lg:sticky top-0 right-0 w-72 bg-gradient-mint-deep text-white h-screen overflow-y-auto z-40 transition-transform shadow-2xl lg:shadow-none'}>
        <div className="p-6 border-b border-line">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-mint rounded-xl flex items-center justify-center text-lg font-bold text-primary group-hover:scale-105 transition">م</div>
            <div>
              <div className="font-extrabold text-lg">مسارك</div>
              <div className="text-[10px] opacity-70">Super Admin · v3.1</div>
            </div>
          </Link>
        </div>
        <nav className="p-4">
          {visibleNav.map((g, gi) => (
            <div key={gi} className="mb-5">
              <div className="text-[10px] uppercase tracking-wide opacity-50 mb-2 px-2 font-bold">{g.group}</div>
              {g.items.map((s) => {
                const active = v === s.id;
                const cls = active ? 'bg-surface text-[#0f2240] shadow-md' : 'hover:bg-surface/10';
                return (
                  <button key={s.id}
                    onClick={() => { setV(s.id); setSidebarOpen(false); }}
                    className={'w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-sm font-semibold transition ' + cls}>
                    <span className="text-lg">{s.icon}</span>
                    <span className="flex-1 text-right">{s.label}</span>
                    {s.badge && <span className="text-[9px] font-bold bg-violet-400 text-violet-900 px-1.5 py-0.5 rounded">{s.badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-line space-y-1">
          <Link href="/admin/partnerships" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface/10 text-sm">
            <span>🤝</span><span>طلبات الشراكة</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface/10 text-sm">
            <span>🏠</span><span>العودة للموقع</span>
          </Link>
        </div>
      </aside>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>}

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur border-b border-line px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-bg-soft rounded-lg">☰</button>
            <h1 className="text-lg lg:text-2xl font-extrabold text-[#1b3a6b] truncate">
              {current?.icon} {current?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {msg && <span className="hidden md:inline bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold animate-fade-up">{msg}</span>}
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-[1600px]">
          {blocked ? (
            <div className="bg-surface border border-line rounded-2xl p-10 text-center">
              <div className="text-5xl mb-3">🔒</div>
              <h2 className="font-extrabold text-lg text-[#1b3a6b] mb-1">هذا القسم للمدير العام فقط</h2>
              <p className="text-sm text-ink-muted">الأمور المالية وبيانات المشتركين الخاصة غير متاحة لحساب المشرف المساعد.</p>
              <button onClick={() => setV('overview')} className="mt-4 text-sm font-bold text-primary hover:underline">← العودة للنظرة العامة</button>
            </div>
          ) : (
          <>
          {v === 'overview' && <ExecutiveOverviewTab onNavigate={(x) => setV(x as V)} />}
          {v === 'ai_ceo' && <AiCeoTab flash={flash} />}
          {v === 'students' && <StudentsCenterTab flash={flash} />}
          {v === 'orgs' && <OrgRequestsTab flash={flash} />}
          {v === 'team' && <TeamTab flash={flash} />}
          {v === 'universities' && <UniversitiesCenterTab flash={flash} />}
          {v === 'schools' && <SchoolsCenterTab flash={flash} />}
          {v === 'vocational' && <VocationalTab flash={flash} />}
          {v === 'institutes' && <InstitutesTab flash={flash} />}
          {v === 'subscriptions' && <SubscriptionsCenterTab flash={flash} />}
          {v === 'sponsors' && <SponsorsCenterTab flash={flash} />}
          {v === 'revenue' && <RevenueCenterTab />}
          {v === 'scholarships_center' && <ScholarshipsCenterTab flash={flash} />}
          {v === 'dna_analytics' && <CareerDnaCenterTab />}
          {v === 'content_center' && <ContentCenterTab />}
          {v === 'marketing' && <MarketingCenterTab />}
          {v === 'seo' && <SeoCommandTab />}
          {v === 'support' && <SupportCenterTab flash={flash} />}
          {v === 'audit' && <AuditCenterTab />}
          {v === 'reviews' && <ReviewsTab flash={flash} />}
          {v === 'media' && <MediaTab />}
          {v === 'notifications' && <NotificationsTab flash={flash} />}
          {v === 'settings' && <SettingsTab />}
          {v === 'admins' && isSuper && <AdminsManager flash={flash} />}
          </>
          )}
        </div>
      </main>
    </div>
  );
}

// ════════════ Admins management (super-admin only) ════════════
// Grant/revoke the co-admin role by email via the super-admin-gated RPCs.
type AdminRow = { email: string; role: string };
function AdminsManager({ flash }: { flash: (m: string) => void }) {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase.rpc('list_admins');
    setRows((data as AdminRow[]) || []);
  }
  useEffect(() => { load(); }, []);

  async function grant() {
    const e = email.trim();
    if (!e) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('grant_admin_role', { p_email: e, p_grant: true });
    setBusy(false);
    const res = data as { ok?: boolean; error?: string } | null;
    if (error || !res?.ok) { flash('فشل: ' + (res?.error || error?.message || 'خطأ')); return; }
    flash('تمت إضافة المشرف ✓'); setEmail(''); load();
  }
  async function revoke(e: string) {
    if (!confirm('إزالة صلاحية المشرف من ' + e + '؟')) return;
    const { data, error } = await supabase.rpc('grant_admin_role', { p_email: e, p_grant: false });
    const res = data as { ok?: boolean; error?: string } | null;
    if (error || !res?.ok) { flash('فشل: ' + (res?.error || error?.message || 'خطأ')); return; }
    flash('تمت الإزالة'); load();
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-surface border border-line rounded-2xl p-6">
        <h2 className="font-extrabold text-lg text-[#1b3a6b] mb-1">إضافة مشرف مساعد</h2>
        <p className="text-sm text-ink-muted mb-4">
          المشرف المساعد عنده كل الصلاحيات <strong>ما عدا</strong> الأمور المالية (الاشتراكات، الإيرادات، الرعاة)
          والبيانات الخاصة بالمشتركين (الطلاب). لازم يكون عندو حساب على مسارك بنفس الإيميل.
        </p>
        <div className="flex gap-2">
          <input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" type="email"
            placeholder="admin@example.com"
            className="flex-1 border-2 border-line rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
          <button onClick={grant} disabled={busy || !email.trim()}
            className="bg-[#1b3a6b] text-white font-bold px-5 py-2.5 rounded-xl text-sm disabled:opacity-50 whitespace-nowrap">
            {busy ? '...' : '+ إضافة'}
          </button>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-6">
        <h3 className="font-bold text-gray-700 mb-4">المشرفون الحاليون ({rows.length})</h3>
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.email} className="flex items-center justify-between p-3 rounded-xl bg-bg-soft">
              <div className="min-w-0">
                <div className="font-semibold text-sm text-ink truncate" dir="ltr">{r.email}</div>
                <div className="text-xs text-ink-subtle">{r.role === 'super_admin' ? '👑 المدير العام' : '🛡️ مشرف مساعد'}</div>
              </div>
              {r.role !== 'super_admin' && (
                <button onClick={() => revoke(r.email)} className="text-red-600 text-xs font-bold px-3 py-1.5 hover:bg-red-50 rounded-lg">
                  إزالة
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
