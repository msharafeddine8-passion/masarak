'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Deadline {
  id: number;
  university_name: string;
  deadline_date: string;
  deadline_type: string;
  description: string;
  url?: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  admission:   { label: 'قبول',     color: 'bg-primary text-white',     icon: '🎓' },
  scholarship: { label: 'منحة',     color: 'bg-warning text-white',     icon: '🏆' },
  open_day:    { label: 'يوم مفتوح', color: 'bg-success text-white',     icon: '🚪' },
  application: { label: 'تقديم',     color: 'bg-info text-white',        icon: '📝' },
};

export default function ParentDeadlinesPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('university_deadlines')
        .select('*')
        .gte('deadline_date', new Date().toISOString().slice(0, 10))
        .order('deadline_date', { ascending: true });
      setDeadlines(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = deadlines.filter(d => {
    if (filter !== 'all' && d.deadline_type !== filter) return false;
    if (search && !d.university_name.includes(search) && !(d.description || '').includes(search)) return false;
    return true;
  });

  // Group by month
  const grouped = filtered.reduce((acc, d) => {
    const month = new Date(d.deadline_date).toLocaleDateString('ar', { year: 'numeric', month: 'long' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(d);
    return acc;
  }, {} as Record<string, Deadline[]>);

  return (
    <main className="min-h-screen bg-bg pb-20 relative overflow-hidden" dir="rtl">
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        <Link href="/parent/dashboard" className="text-sm text-ink-muted hover:text-primary inline-flex items-center gap-1 mb-4">
          → العودة للوحة المتابعة
        </Link>

        {/* Hero */}
        <div className="bg-gradient-hero rounded-4xl p-8 md:p-10 mb-6 text-white shadow-floaty relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/30 rounded-full blur-3xl" />
          <div className="absolute top-6 left-1/4 text-3xl animate-float opacity-50">📅</div>
          <div className="absolute bottom-8 right-1/4 text-3xl animate-float opacity-50" style={{ animationDelay: '1s' }}>⏰</div>

          <div className="relative flex items-center gap-5 flex-wrap">
            <div className="text-7xl animate-bounce-soft drop-shadow-2xl">📅</div>
            <div>
              <span className="inline-block bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-2">مواعيد القبول والمنح</span>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{deadlines.length} موعد قادم</h1>
              <p className="text-white/90">كل ما تحتاج معرفته عن مواعيد التقديم لكل جامعة</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card shadow-card mb-6">
          <div className="grid md:grid-cols-3 gap-3 mb-3">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 ابحث عن جامعة..." className="input md:col-span-2" />
            <select value={filter} onChange={e => setFilter(e.target.value)} className="input">
              <option value="all">كل الأنواع</option>
              <option value="admission">قبول</option>
              <option value="scholarship">منح</option>
              <option value="open_day">أيام مفتوحة</option>
              <option value="application">تقديم</option>
            </select>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">{filtered.length} موعد</span>
            <span className="text-ink-subtle text-xs">آخر تحديث: {new Date().toLocaleDateString('ar')}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl animate-bounce-soft mb-3">📅</div>
            <div className="text-ink-muted">جاري التحميل...</div>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-3">🔍</div>
            <p className="text-ink-muted">ما في مواعيد بهالمعايير</p>
          </div>
        ) : (
          Object.entries(grouped).map(([month, items]) => (
            <section key={month} className="mb-8">
              <h2 className="font-extrabold text-xl text-primary mb-3 flex items-center gap-2">
                <span className="text-2xl">📆</span> {month}
                <span className="text-sm font-normal text-ink-muted">({items.length})</span>
              </h2>
              <div className="space-y-3">
                {items.map(d => {
                  const date = new Date(d.deadline_date);
                  const daysLeft = Math.ceil((date.getTime() - Date.now()) / 86400000);
                  const urgent = daysLeft <= 14;
                  const type = TYPE_CONFIG[d.deadline_type] || TYPE_CONFIG.admission;

                  return (
                    <div key={d.id} className={`card flex items-center gap-4 ${urgent ? 'border-danger/30 bg-danger-light/30' : ''}`}>
                      <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-extrabold text-white flex-shrink-0 ${urgent ? 'bg-danger' : 'bg-gradient-mint-deep'}`}>
                        <span className="text-xs leading-none">{date.toLocaleDateString('ar', { month: 'short' })}</span>
                        <span className="text-xl leading-none mt-0.5">{date.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-extrabold text-lg text-ink">{d.university_name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${type.color}`}>
                            {type.icon} {type.label}
                          </span>
                        </div>
                        <p className="text-sm text-ink-muted leading-relaxed">{d.description}</p>
                      </div>
                      <div className={`text-sm font-extrabold whitespace-nowrap ${urgent ? 'text-danger' : 'text-primary'}`}>
                        {daysLeft <= 0 ? '🔥 اليوم!' : `بعد ${daysLeft} يوم`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}

        {/* Tips */}
        <div className="card-mint mt-6">
          <h3 className="font-extrabold text-primary-dark mb-2 flex items-center gap-2">
            <span className="text-2xl">💡</span> نصائح للأهل
          </h3>
          <ul className="text-sm text-ink space-y-1.5">
            <li>• ابدأ التحضير قبل 3 شهور على الأقل من الموعد النهائي</li>
            <li>• حضّر كل الوثائق المطلوبة (شهادات، صور، تقارير) مبكّراً</li>
            <li>• تواصل مع الجامعة المستهدفة لتأكيد كل المتطلبات</li>
            <li>• المنح بياخدوا وقت — قدّم عليها قبل ما تقدّم للجامعة</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
