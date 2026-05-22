'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DashboardTab from './_tabs/DashboardTab';
import UniversitiesTab from './_tabs/UniversitiesTab';
import SchoolsTab from './_tabs/SchoolsTab';
import VocationalTab from './_tabs/VocationalTab';
import InstitutesTab from './_tabs/InstitutesTab';
import UsersTab from './_tabs/UsersTab';
import ReviewsTab from './_tabs/ReviewsTab';
import MediaTab from './_tabs/MediaTab';
import NotificationsTab from './_tabs/NotificationsTab';
import SettingsTab from './_tabs/SettingsTab';
import OrgRequestsTab from './_tabs/OrgRequestsTab';

type V = 'dashboard' | 'users' | 'orgs' | 'universities' | 'schools' | 'vocational' | 'institutes' | 'reviews' | 'media' | 'notifications' | 'settings';

const NAV = [
  { group: 'الرئيسية', items: [
    { id: 'dashboard' as V, label: 'لوحة القيادة', icon: '📊' },
    { id: 'users' as V, label: 'المستخدمون', icon: '👥' },
    { id: 'orgs' as V, label: 'طلبات المؤسسات', icon: '🏛️' },
  ]},
  { group: 'المحتوى', items: [
    { id: 'universities' as V, label: 'الجامعات', icon: '🏛️' },
    { id: 'schools' as V, label: 'المدارس', icon: '🏫' },
    { id: 'vocational' as V, label: 'المسارات المهنية', icon: '🛠️' },
    { id: 'institutes' as V, label: 'المعاهد', icon: '🏭' },
    { id: 'reviews' as V, label: 'التقييمات', icon: '⭐' },
  ]},
  { group: 'الأدوات', items: [
    { id: 'media' as V, label: 'مكتبة الصور', icon: '🖼️' },
    { id: 'notifications' as V, label: 'الإشعارات', icon: '🔔' },
    { id: 'settings' as V, label: 'الإعدادات', icon: '⚙️' },
  ]},
];

export default function AdminDashboard() {
  const [v, setV] = useState<V>('dashboard');
  const [msg, setMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  return (
    <div className="min-h-screen bg-bg flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} fixed lg:sticky top-0 right-0 w-72 bg-gradient-mint-deep text-white h-screen overflow-y-auto z-40 transition-transform shadow-2xl lg:shadow-none`}>
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-mint rounded-xl flex items-center justify-center text-lg font-bold text-primary group-hover:scale-105 transition">م</div>
            <div>
              <div className="font-extrabold text-lg">مسارك</div>
              <div className="text-[10px] opacity-70">Admin Panel · v2.1</div>
            </div>
          </Link>
        </div>
        <nav className="p-4">
          {NAV.map((g, gi) => (
            <div key={gi} className="mb-6">
              <div className="text-[10px] uppercase tracking-wide opacity-50 mb-2 px-2">{g.group}</div>
              {g.items.map((s) => (
                <button key={s.id} onClick={() => { setV(s.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-semibold transition ${
                    v === s.id ? 'bg-white text-[#0f2240] shadow-md' : 'hover:bg-white/10'
                  }`}>
                  <span className="text-lg">{s.icon}</span>
                  <span className="flex-1 text-right">{s.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 mt-auto">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-sm">
            <span>🏠</span><span>العودة للموقع</span>
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>}

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">☰</button>
            <h1 className="text-lg lg:text-2xl font-extrabold text-[#1b3a6b]">
              {NAV.flatMap(g => g.items).find(s => s.id === v)?.icon} {NAV.flatMap(g => g.items).find(s => s.id === v)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {msg && <span className="hidden md:inline bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold">{msg}</span>}
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-[1600px]">
          {v === 'dashboard' && <DashboardTab onNavigate={setV} />}
          {v === 'users' && <UsersTab flash={flash} />}
          {v === 'orgs' && <OrgRequestsTab flash={flash} />}
          {v === 'universities' && <UniversitiesTab flash={flash} />}
          {v === 'schools' && <SchoolsTab flash={flash} />}
          {v === 'vocational' && <VocationalTab flash={flash} />}
          {v === 'institutes' && <InstitutesTab flash={flash} />}
          {v === 'reviews' && <ReviewsTab flash={flash} />}
          {v === 'media' && <MediaTab />}
          {v === 'notifications' && <NotificationsTab flash={flash} />}
          {v === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}
