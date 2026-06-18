'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface TeamMember {
  id: string;
  name_ar: string;
  name: string | null;
  role_ar: string;
  role: string | null;
  bio_ar: string | null;
  avatar_url: string | null;
  avatar_emoji: string;
  email: string | null;
  linkedin_url: string | null;
  display_order: number;
}

export default function TeamClient() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('team_members')
        .select('id, name_ar, name, role_ar, role, bio_ar, avatar_url, avatar_emoji, email, linkedin_url, display_order')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });
      setMembers(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-bg py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-4xl">

        <Link href="/" className="text-sm text-gray-500 hover:text-[#1b3a6b] mb-6 inline-block">
          ← الصفحة الرئيسية
        </Link>

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4">👋</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1b3a6b] mb-4">الفريق</h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            الأشخاص خلف مسارك — مجموعة متحمسة لتحسين تجربة التوجيه التعليمي للطالب اللبناني.
          </p>
        </div>

        {/* Team Members */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-3xl border-2 border-gray-100 p-8 animate-pulse">
                <div className="flex gap-5">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-3 pt-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-6 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">👤</div>
            <p>لا يوجد أعضاء فريق معروضين حالياً.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {members.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        )}

        {/* Tkaful Attribution */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 flex items-center gap-5 mb-12">
          <div className="text-4xl">🤝</div>
          <div>
            <p className="text-sm font-bold text-emerald-700 mb-1">من نحن؟</p>
            <p className="text-slate-700 text-sm leading-relaxed">
              مسارك مشروع من مشاريع{' '}
              <a
                href="https://takafullb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-bold underline underline-offset-2 hover:text-emerald-800"
              >
                جمعية تكافل
              </a>
              {' '}— الجمعية اللبنانية غير الربحية الداعمة للشباب.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#012730] to-[#1b3a6b] rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold mb-3">عندك سؤال؟ أو فكرة؟</h2>
          <p className="text-white/80 mb-6">نحنا منردّ على كل ايميل بـ ٢٤ ساعة.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#012730] font-bold hover:bg-mint transition-colors"
          >
            تواصل معنا ←
          </Link>
        </div>

      </div>
    </main>
  );
}

function MemberCard({ member: m }: { member: TeamMember }) {
  return (
    <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {m.avatar_url ? (
            <img
              src={m.avatar_url}
              alt={m.name_ar}
              className="w-24 h-24 rounded-full object-cover border-4 border-[#1b3a6b]/10"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1b3a6b] to-[#012730] flex items-center justify-center text-4xl border-4 border-[#1b3a6b]/10">
              {m.avatar_emoji || '👤'}
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase text-[#1b3a6b]/60 mb-1">{m.role_ar}</div>
          <h2 className="text-xl font-extrabold text-[#1b3a6b] mb-1">{m.name_ar}</h2>
          {m.name && <p className="text-sm text-gray-400 mb-2">{m.name}</p>}
          {m.bio_ar && (
            <p className="text-gray-700 leading-relaxed text-sm mb-4">{m.bio_ar}</p>
          )}
          <div className="flex flex-wrap gap-3 text-sm">
            {m.email && (
              <a
                href={`mailto:${m.email}`}
                className="text-[#1b3a6b] hover:underline font-semibold flex items-center gap-1"
              >
                ✉️ {m.email}
              </a>
            )}
            {m.linkedin_url && (
              <a
                href={m.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
              >
                🔗 LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
