'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';

interface Link {
  id: number;
  student_user_id: string;
  status: 'pending' | 'active' | 'rejected';
  invited_at: string;
  approved_at: string | null;
  student_name?: string;
  student_email?: string;
  student_school?: string;
  student_grade?: string;
}

interface Deadline {
  id: number;
  university_name: string;
  deadline_date: string;
  deadline_type: string;
  description: string;
}

export default function ParentDashboardPage() {
  const router = useRouter();
  const { t, dir, lang } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<Link[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login?next=/parent/dashboard'); return; }
      setUser(user);

      // Load linked students
      const { data: linksData } = await supabase
        .from('parent_student_links')
        .select('*')
        .eq('parent_user_id', user.id)
        .order('invited_at', { ascending: false });

      if (linksData && linksData.length > 0) {
        // Fetch student profiles
        const studentIds = linksData.map((l: any) => l.student_user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);
        const { data: studentProfiles } = await supabase
          .from('student_profiles')
          .select('user_id, school_name, grade_level')
          .in('user_id', studentIds);

        const merged = linksData.map((l: any) => {
          const p = profiles?.find((x: any) => x.id === l.student_user_id);
          const sp = studentProfiles?.find((x: any) => x.user_id === l.student_user_id);
          return { ...l, student_name: p?.full_name, student_email: p?.email, student_school: sp?.school_name, student_grade: sp?.grade_level };
        });
        setLinks(merged);
      }

      // Load upcoming deadlines (next 90 days)
      const today = new Date().toISOString().slice(0, 10);
      const futureLimit = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
      const { data: deadlinesData } = await supabase
        .from('university_deadlines')
        .select('*')
        .gte('deadline_date', today)
        .lte('deadline_date', futureLimit)
        .order('deadline_date', { ascending: true })
        .limit(8);
      setDeadlines(deadlinesData || []);

      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-mint flex items-center justify-center" dir={dir}>
        <div className="text-center">
          <div className="text-6xl animate-bounce-soft mb-3">👨‍👩‍👧</div>
          <div className="text-ink-muted">{t('pd.loading')}</div>
        </div>
      </div>
    );
  }

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('pd.greeting');
  const hasLinkedStudents = links.filter(l => l.status === 'active').length > 0;
  const locale = lang === 'ar' ? 'ar' : 'en';

  return (
    <main className="min-h-screen bg-bg pb-20 relative overflow-hidden" dir={dir}>
      {/* Bg decoration */}
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="bg-gradient-hero rounded-4xl p-8 md:p-10 mb-6 text-white shadow-floaty relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/30 rounded-full blur-3xl" />
          <div className="absolute top-4 left-1/4 text-3xl animate-float opacity-50">👨‍👩‍👧</div>
          <div className="absolute bottom-4 right-1/4 text-3xl animate-float opacity-50" style={{ animationDelay: '1s' }}>💚</div>

          <div className="relative flex items-center gap-5 flex-wrap">
            <div className="text-7xl animate-bounce-soft drop-shadow-2xl">👨‍👩‍👧</div>
            <div className="flex-1 min-w-0">
              <span className="inline-block bg-surface/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-2">
                {t('pd.hero.welcome_chip')}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{t('pd.hero.hello')} {fullName}</h1>
              <p className="text-white/90">{t('pd.hero.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 stagger">
          <div className="card text-center">
            <div className="text-4xl mb-1">👨‍🎓</div>
            <div className="text-3xl font-extrabold text-primary">{links.filter(l => l.status === 'active').length}</div>
            <div className="text-xs text-ink-muted">{t('pd.stat.linked_students')}</div>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-1">⏳</div>
            <div className="text-3xl font-extrabold text-warning">{links.filter(l => l.status === 'pending').length}</div>
            <div className="text-xs text-ink-muted">{t('pd.stat.pending_invites')}</div>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-1">📅</div>
            <div className="text-3xl font-extrabold text-accent">{deadlines.length}</div>
            <div className="text-xs text-ink-muted">{t('pd.stat.upcoming')}</div>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-1">🏛️</div>
            <div className="text-3xl font-extrabold text-success">35</div>
            <div className="text-xs text-ink-muted">{t('pd.stat.unis_dir')}</div>
          </div>
        </div>

        {/* If no linked students */}
        {!hasLinkedStudents && (
          <div className="card-mint mb-6 text-center py-8">
            <div className="text-6xl mb-3">🔗</div>
            <h3 className="text-2xl font-extrabold text-primary-dark mb-2">{t('pd.link.title')}</h3>
            <p className="text-ink mb-4 max-w-md mx-auto">
              {t('pd.link.desc')}
            </p>
            <Link href="/parent/link-student" className="btn-primary inline-flex">
              {t('pd.link.cta')}
            </Link>
          </div>
        )}

        {/* Linked Students */}
        {hasLinkedStudents && (
          <div className="card shadow-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-primary flex items-center gap-2">
                {t('pd.kids')}
              </h2>
              <Link href="/parent/link-student" className="btn-ghost text-sm">{t('pd.kids.link_another')}</Link>
            </div>
            <div className="space-y-3">
              {links.filter(l => l.status === 'active').map(link => (
                <div key={link.id} className="bg-mint-pale rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-mint-deep text-white rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-soft">
                    {(link.student_name || 'S')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-ink truncate">{link.student_name || t('pd.kids.default_name')}</div>
                    <div className="text-sm text-ink-muted truncate">
                      {link.student_school && `${link.student_school} · `}
                      {link.student_grade || t('pd.kids.no_info')}
                    </div>
                  </div>
                  <Link href={`/parent/student/${link.student_user_id}`} className="btn-mint text-sm">
                    {t('pd.kids.view_progress')}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Invitations */}
        {links.filter(l => l.status === 'pending').length > 0 && (
          <div className="card shadow-card mb-6 border-warning/30 bg-warning-light/30">
            <h2 className="text-lg font-extrabold text-warning mb-2 flex items-center gap-2">
              {t('pd.pending')}
            </h2>
            <p className="text-sm text-ink-muted mb-3">{t('pd.pending.desc')}</p>
            {links.filter(l => l.status === 'pending').map(link => (
              <div key={link.id} className="bg-surface rounded-xl p-3 flex items-center gap-2 text-sm mb-2">
                <span>📤</span>
                <span>{t('pd.pending.code')} <code className="bg-bg-soft px-2 py-0.5 rounded font-bold">{link.id}</code></span>
                <span className="mr-auto text-xs text-ink-subtle">{t('pd.pending.invited')} {new Date(link.invited_at).toLocaleDateString(locale)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions Grid */}
        <h2 className="text-2xl font-extrabold text-primary mb-4 mt-8">{t('pd.tools')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 stagger">
          <FeatureCard
            href="/tools/cost-calculator"
            emoji="💰"
            title={t('pd.tool.cost')}
            desc={t('pd.tool.cost_d')}
            color="from-accent to-coral"
          />
          <FeatureCard
            href="/parent/deadlines"
            emoji="📅"
            title={t('pd.tool.deadlines')}
            desc={t('pd.tool.deadlines_d')}
            color="from-primary to-info"
          />
          <FeatureCard
            href="/scholarships"
            emoji="🏆"
            title={t('pd.tool.scholarships')}
            desc={t('pd.tool.scholarships_d')}
            color="from-warning to-accent"
          />
          <FeatureCard
            href="/universities"
            emoji="🏛️"
            title={t('pd.tool.unis')}
            desc={t('pd.tool.unis_d')}
            color="from-primary to-primary-dark"
          />
          <FeatureCard
            href="/parent/resources"
            emoji="📚"
            title={t('pd.tool.resources')}
            desc={t('pd.tool.resources_d')}
            color="from-violet to-primary"
          />
          <FeatureCard
            href="/blog"
            emoji="📰"
            title={t('pd.tool.blog')}
            desc={t('pd.tool.blog_d')}
            color="from-mint to-primary-300"
          />
        </div>

        {/* Upcoming Deadlines */}
        {deadlines.length > 0 && (
          <div className="card shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-primary flex items-center gap-2">
                {t('pd.upcoming.title')}
              </h2>
              <Link href="/parent/deadlines" className="btn-ghost text-sm">{t('pd.upcoming.view_all')}</Link>
            </div>
            <div className="space-y-2">
              {deadlines.map(d => {
                const daysLeft = Math.ceil((new Date(d.deadline_date).getTime() - Date.now()) / 86400000);
                const urgent = daysLeft <= 14;
                return (
                  <div key={d.id} className={`flex items-center gap-3 p-3 rounded-xl ${urgent ? 'bg-danger-light' : 'bg-bg-soft'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-extrabold text-white ${urgent ? 'bg-danger' : 'bg-primary'}`}>
                      <span className="text-xs leading-none">{new Date(d.deadline_date).toLocaleDateString(locale, { month: 'short' })}</span>
                      <span className="text-lg leading-none mt-0.5">{new Date(d.deadline_date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-ink">{d.university_name}</div>
                      <div className="text-sm text-ink-muted truncate">{d.description}</div>
                    </div>
                    <div className={`text-xs font-bold whitespace-nowrap ${urgent ? 'text-danger' : 'text-ink-muted'}`}>
                      {daysLeft <= 0 ? t('pd.upcoming.today') : `${t('pd.upcoming.in')} ${daysLeft} ${t('pd.upcoming.day')}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function FeatureCard({ href, emoji, title, desc, color }: { href: string; emoji: string; title: string; desc: string; color: string }) {
  return (
    <Link href={href}
      className="group relative bg-surface rounded-3xl border border-border-soft p-5 hover:shadow-floaty hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity -z-0`} />
      <div className="relative">
        <div className={`icon-circle-lg bg-gradient-to-br ${color} text-white mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
          <span className="text-3xl">{emoji}</span>
        </div>
        <h3 className="font-extrabold text-primary mb-1.5 group-hover:underline">{title}</h3>
        <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
      </div>
    </Link>
  );
}
