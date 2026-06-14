'use client';
import { useState } from 'react';
import Link from 'next/link';
import ExecutiveOverviewTab from './_tabs/ExecutiveOverviewTab';
import StudentsCenterTab from './_tabs/StudentsCenterTab';
import UniversitiesCenterTab from './_tabs/UniversitiesCenterTab';
import SchoolsCenterTab from './_tabs/SchoolsCenterTab';
import SubscriptionsCenterTab from './_tabs/SubscriptionsCenterTab';
import AiCeoTab from './_tabs/AiCeoTab';
import VocationalTab from './_tabs/VocationalTab';
import InstitutesTab from './_tabs/InstitutesTab';
import ReviewsTab from './_tabs/ReviewsTab';
import MediaTab from './_tabs/MediaTab';
import NotificationsTab from './_tabs/NotificationsTab';
import SettingsTab from './_tabs/SettingsTab';
import OrgRequestsTab from './_tabs/OrgRequestsTab';

type V =
  | 'overview' | 'ai_ceo'
  | 'students' | 'universities' | 'schools' | 'vocational' | 'institutes'
  | 'subscriptions' | 'sponsors' | 'revenue'
  | 'scholarships_center' | 'careers_center' | 'content_center'
  | 'marketing' | 'seo' | 'support'
  | 'notifications' | 'orgs' | 'reviews' | 'media' | 'audit' | 'settings';

type NavItem = { id: V; label: string; icon: string; primary?: boolean; badge?: string; soon?: boolean };

const NAV: { group: string; items: NavItem[] }[] = [
  { group: '🏠 القيادة', items: [
    { id: 'overview', label: 'Executive Overview', icon: '⚡', primary: true },
    { id: 'ai_ceo', label: 'Masarak Intelligence', icon: '🧠', primary: true, badge: 'AI' },
  ]},
  { group: '👥 الناس', items: [
    { id: 'students', label: 'الطلاب', icon: '🎓' },
    { id: 'orgs', label: 'طلبات المؤسسات', icon: '📥' },
  ]},
  { group: '🏛️ المؤسسات', items: [
    { id: 'universities', label: 'الجامعات', icon: '🏛️' },
    { id: 'schools', label: 'المدارس', icon: '🏫' },
    { id: 'vocational', label: 'المسارات المهنية', icon: '🛠️' },
    { id: 'institutes', label: 'المعاهد', icon: '🏭' },
  ]},
  { group: '💰 الإيرادات', items: [
    { id: 'subscriptions', label: 'الاشتراكات', icon: '💎' },
    { id: 'sponsors', label: 'الرعاة والشركاء', icon: '🤝', soon: true },
    { id: 'revenue', label: 'تقارير الإيرادات', icon: '📊', soon: true },
  ]},
  { group: '📚 المحتوى', items: [
    { id: 'scholarships_center', label: 'مركز المنح', icon: '🏆', soon: true },
    { id: 'careers_center', label: 'مركز المهن', icon: '💼', soon: true },
    { id: 'content_center', label: 'مكتبة المقالات', icon: '📰', soon: true },
    { id: 'reviews', label: 'التقييمات', icon: '⭐' },
    { id: 'media', label: 'مكتبة الصور', icon: '🖼️' },
  ]},
  { group: '📣 التسويق والدعم', items: [
    { id: 'marketing', label: 'مركز التسويق', icon: '🚀', soon: true },
    { id: 'seo', label: 'SEO Command', icon: '🔍', soon: true },
    { id: 'notifications', label: 'الإشعارات', icon: '🔔' },
    { id: 'support', label: 'دعم العملاء', icon: '🎫', soon: true },
  ]},
  { group: '🔐 الأمان', items: [
    { id: 'audit', label: 'سجل العمليات', icon: '📜', soon: true },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️' },
  ]},
];

export default function AdminDashboard() {
  const [v, setV] = useState<V>('overview');
  const [msg, setMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const allItems = NAV.flatMap(g => g.items);
  const current = allItems.find(i => i.id === v);

  return (
    <div className="min-h-screen bg-bg flex" dir="rtl">
      <aside className={(sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0') + ' fixed lg:sticky top-0 right-0 w-72 bg-gradient-mint-deep text-white h-screen overflow-y-auto z-40 transition-transform shadow-2xl lg:shadow-none'}>
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-mint rounded-xl flex items-center justify-center text-lg font-bold text-primary group-hover:scale-105 transition">م</div>
            <div>
              <div className="font-extrabold text-lg">مسارك</div>
              <div className="text-[10px] opacity-70">Super Admin · v3.0</div>
            </div>
          </Link>
        </div>
        <nav className="p-4">
          {NAV.map((g, gi) => (
            <div key={gi} className="mb-5">
              <div className="text-[10px] uppercase tracking-wide opacity-50 mb-2 px-2 font-bold">{g.group}</div>
              {g.items.map((s) => {
                const active = v === s.id;
                const soonish = !!s.soon;
                const cls =
                  active ? 'bg-white text-[#0f2240] shadow-md' :
                  soonish ? 'opacity-40 hover:opacity-60 cursor-default' :
                  'hover:bg-white/10';
                return (
                  <button key={s.id}
                    onClick={() => { if (!soonish) { setV(s.id); setSidebarOpen(false); } else { flash(s.label + ' — قريباً'); } }}
                    className={'w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-sm font-semibold transition ' + cls}>
                    <span className="text-lg">{s.icon}</span>
                    <span className="flex-1 text-right">{s.label}</span>
                    {s.badge && <span className="text-[9px] font-bold bg-violet-400 text-violet-900 px-1.5 py-0.5 rounded">{s.badge}</span>}
                    {soonish && <span className="text-[9px] opacity-70">قريباً</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-sm">
            <span>🏠</span><span>العودة للموقع</span>
          </Link>
        </div>
      </aside>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>}

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">☰</button>
            <h1 className="text-lg lg:text-2xl font-extrabold text-[#1b3a6b] truncate">
              {current?.icon} {current?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {msg && <span className="hidden md:inline bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold animate-fade-up">{msg}</span>}
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-[1600px]">
          {v === 'overview' && <ExecutiveOverviewTab onNavigate={(x) => setV(x as V)} />}
          {v === 'ai_ceo' && <AiCeoTab flash={flash} />}
          {v === 'students' && <StudentsCenterTab flash={flash} />}
          {v === 'orgs' && <OrgRequestsTab flash={flash} />}
          {v === 'universities' && <UniversitiesCenterTab flash={flash} />}
          {v === 'schools' && <SchoolsCenterTab flash={flash} />}
          {v === 'vocational' && <VocationalTab flash={flash} />}
          {v === 'institutes' && <InstitutesTab flash={flash} />}
          {v === 'subscriptions' && <SubscriptionsCenterTab flash={flash} />}
          {v === 'reviews' && <ReviewsTab flash={flash} />}
          {v === 'media' && <MediaTab />}
          {v === 'notifications' && <NotificationsTab flash={flash} />}
          {v === 'settings' && <SettingsTab />}
          {['sponsors','revenue','scholarships_center','careers_center','content_center','marketing','seo','support','audit'].includes(v) && (
            <ComingSoonStub label={current?.label || ''} />
          )}
        </div>
      </main>
    </div>
  );
}

function ComingSoonStub({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
      <div className="text-5xl mb-3">🚧</div>
      <h2 className="text-xl font-extrabold mb-2">{label}</h2>
      <p className="text-sm text-ink-muted mb-4">هاد القسم بمرحلة الـ Phase 2. الهيكل جاهز بالـ DB، الواجهة عم تنبنى.</p>
      <p className="text-xs text-ink-muted">قول وقتها رح أبنيلك إيّاه كامل بنفس مستوى Executive Overview.</p>
    </div>
  );
}
