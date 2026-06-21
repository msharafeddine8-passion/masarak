"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchSchoolById } from "@/lib/entities";
import { emit } from '@/lib/events/emit';
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import Breadcrumb from "@/components/Breadcrumb";

interface Review {
  id: number;
  user_id: string;
  rating: number;
  text: string;
  status_year: string | null;
  created_at: string;
}

function Stars({ n }: { n: number }) {
  return <span>{Array.from({ length: 5 }).map((_, i) => <span key={i} className={i < n ? "text-yellow-400" : "text-gray-200"}>★</span>)}</span>;
}

export default function SchoolDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const { t, dir, lang } = useI18n();
  const [school, setSchool] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSchoolById(id).then((s) => { setSchool(s); setLoading(false); });
    loadReviews();
    loadUser();
    void emit('student.viewed_school', { entity_type: 'school', entity_id: String(id) });
    // eslint-disable-next-line
  }, [id]);

  const loadReviews = async () => {
    const { data } = await supabase.from('entity_reviews').select('*').eq('entity_type', 'school').eq('entity_id', String(id)).eq('is_visible', true).order('created_at', { ascending: false });
    setReviews((data as Review[]) || []);
  };
  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data } = await supabase.from('student_profiles').select('school_name').eq('user_id', session.user.id).maybeSingle();
      if (data) setProfile(data);
    }
  };

  const canReview = !!user && !!profile?.school_name && school?.name && profile.school_name.toLowerCase().includes(school.name.toLowerCase().slice(0, 10));
  const userReviewed = reviews.some((r) => r.user_id === user?.id);

  if (loading) return <main className="min-h-screen flex items-center justify-center" dir={dir}>⏳</main>;
  if (!school) return <main className="min-h-screen bg-bg-soft flex items-center justify-center" dir={dir}><div className="text-center"><div className="text-6xl">🔍</div><h1 className="text-2xl font-bold text-[#1b3a6b] mt-3">{t('dp.sch.not_found')}</h1><Link href="/schools" className="mt-4 inline-block px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">{t('dp.sch.back_btn')}</Link></div></main>;

  const typeColor: Record<string, string> = { "خاصة": "bg-blue-100 text-blue-700", "رسمية": "bg-red-100 text-red-700", "دولية": "bg-purple-100 text-purple-700", "مهنية": "bg-orange-100 text-orange-700" };

  return (
    <main className="min-h-screen bg-bg-soft pb-20" dir={dir}>
      <section className={`bg-gradient-to-br ${school.color || 'from-blue-600 to-blue-800'} text-white`}>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="mb-4">
            <Breadcrumb items={[
              { label: t('nav.home') || 'الرئيسية', href: '/' },
              { label: t('nav.schools') || 'المدارس', href: '/schools' },
              { label: school.name || '...' },
            ]} variant="dark" />
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mt-4">
            <div className="text-7xl">{school.emoji}</div>
            <div className="flex-1">
              <div className="text-sm opacity-85 mb-1">{school.region} — {school.area}</div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{school.name}</h1>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className={`${typeColor[school.type] || 'bg-surface/15'} px-3 py-1 rounded-full font-semibold`}>{school.type}</span>
                <span className="bg-surface/15 backdrop-blur px-3 py-1 rounded-full">{school.lang}</span>
                <span className="bg-surface/15 backdrop-blur px-3 py-1 rounded-full">⭐ {school.rating}/5</span>
                <span className="bg-surface/15 backdrop-blur px-3 py-1 rounded-full">{t('dp.sch.since')} {school.founded}</span>
              </div>
            </div>
            {school.website && <a href={school.website} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-surface text-[#1b3a6b] rounded-lg font-bold text-sm">{t('dp.sch.site')}</a>}
          </div>
        </div>
      </section>

      <div className="bg-surface border-b">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Stat label={t('dp.sch.stat.students')} value={(school.students || 0).toLocaleString()} />
          <Stat label={t('dp.sch.stat.grades')} value={school.grades || '-'} />
          <Stat label={t('dp.sch.stat.fees')} value={school.feesMin === 0 ? t('dp.sch.stat.fees_free') : `$${school.feesMin}–${school.feesMax}`} />
          <Stat label={t('dp.sch.stat.rating')} value={`⭐ ${school.rating}/5`} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">{t('dp.sch.about')}</h2>
          <p className="text-ink-muted leading-relaxed">{school.desc}</p>
        </div>

        {school.curriculum?.length > 0 && (
          <div className="bg-surface rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">{t('dp.sch.curriculum')}</h2>
            <div className="flex flex-wrap gap-2">{school.curriculum.map((c: string, i: number) => <span key={i} className="px-3 py-1.5 bg-blue-50 text-[#1b3a6b] rounded-full text-sm font-semibold">{c}</span>)}</div>
          </div>
        )}

        {school.features?.length > 0 && (
          <div className="bg-surface rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">{t('dp.sch.features')}</h2>
            <div className="grid md:grid-cols-2 gap-3">{school.features.map((f: string, i: number) => <div key={i} className="flex items-start gap-2 text-sm text-ink-muted"><span className="text-emerald-600 font-bold">✓</span><span>{f}</span></div>)}</div>
          </div>
        )}

        {(school.phone || school.email || school.address || school.website) && (
          <div className="bg-surface rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg text-[#1b3a6b] mb-3">{t('dp.sch.contact')}</h2>
            <div className="space-y-2 text-sm">
              {school.phone && <div><span className="text-ink-subtle">{t('dp.sch.contact.phone')}</span> <a href={`tel:${school.phone}`} className="font-semibold text-[#1b3a6b]" dir="ltr">{school.phone}</a></div>}
              {school.email && <div><span className="text-ink-subtle">{t('dp.sch.contact.email')}</span> <a href={`mailto:${school.email}`} className="font-semibold text-[#1b3a6b]" dir="ltr">{school.email}</a></div>}
              {school.address && <div><span className="text-ink-subtle">{t('dp.sch.contact.address')}</span> <span className="font-semibold">{school.address}</span></div>}
              {school.website && <div><span className="text-ink-subtle">{t('dp.sch.contact.web')}</span> <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-[#1b3a6b] hover:underline" dir="ltr">{school.website}</a></div>}
            </div>
          </div>
        )}

        {school.notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-bold text-[#1b3a6b] mb-2">{t('dp.sch.notes')}</h3>
            <p className="text-ink-muted text-sm leading-relaxed whitespace-pre-line">{school.notes}</p>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-[#1b3a6b]">{t('dp.sch.reviews_title')} ({reviews.length})</h2>
            {canReview && !userReviewed && (
              <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm">{t('dp.sch.add_review')}</button>
            )}
          </div>

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm text-blue-900">
              {t('dp.sch.signin_pre')} <Link href="/auth/login" className="font-bold underline">{t('dp.sch.signin_link')}</Link> {t('dp.sch.signin_post')}
            </div>
          )}
          {user && !canReview && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-900">
              {t('dp.sch.gate_pre')} <strong>{school.name}</strong> {t('dp.sch.gate_link_pre')} <Link href="/profile" className="font-bold underline">{t('dp.sch.gate_link')}</Link>{t('dp.sch.gate_post')}
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-8 bg-bg-soft rounded-xl">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-ink-subtle">{t('dp.sch.no_reviews')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border border-line rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-ink">{t('dp.uni.alumni_label')}</div>
                      <div className="text-xs text-ink-subtle">{r.status_year} • {new Date(r.created_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en')}</div>
                    </div>
                    <Stars n={r.rating} />
                  </div>
                  <p className="text-ink-muted text-sm leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && user && (
        <ReviewForm entityType="school" entityId={String(id)} onClose={() => setShowForm(false)} onSubmit={async () => { await loadReviews(); setShowForm(false); }} />
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div><div className="text-xl font-extrabold text-[#1b3a6b]">{value}</div><div className="text-xs text-ink-subtle mt-1">{label}</div></div>;
}

function ReviewForm({ entityType, entityId, onClose, onSubmit }: { entityType: string; entityId: string; onClose: () => void; onSubmit: () => Promise<void> }) {
  const { t, dir } = useI18n();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [statusYear, setStatusYear] = useState(t('dp.review.s.current'));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!text.trim()) { setErr(t('dp.review.err.empty')); return; }
    setSaving(true); setErr('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setErr(t('dp.review.err.login')); setSaving(false); return; }
    const { error } = await supabase.from('entity_reviews').upsert({
      user_id: session.user.id, entity_type: entityType, entity_id: entityId,
      rating, text: text.trim(), status_year: statusYear,
    }, { onConflict: 'user_id,entity_type,entity_id' });
    if (error) { setErr(error.message); setSaving(false); return; }
    await onSubmit(); setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg p-6" dir={dir}>
        <h2 className="text-xl font-bold text-[#1b3a6b] mb-4">{t('dp.review.modal')}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">{t('dp.review.rating')}</label>
            <div className="flex gap-1 text-3xl">
              {[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRating(n)} className={n <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</button>)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t('dp.review.status')}</label>
            <select value={statusYear} onChange={(e) => setStatusYear(e.target.value)} className="w-full px-3 py-2 border border-line rounded-lg bg-surface">
              <option value={t('dp.review.s.current')}>{t('dp.review.s.current')}</option>
              <option value={t('dp.review.s.grad_2024')}>{t('dp.review.s.grad_2024')}</option>
              <option value={t('dp.review.s.grad_2023')}>{t('dp.review.s.grad_2023')}</option>
              <option value={t('dp.review.s.grad_old')}>{t('dp.review.s.grad_old')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t('dp.review.comment')}</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full px-3 py-2 border border-line rounded-lg min-h-[120px]" />
          </div>
          {err && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">❌ {err}</div>}
          <div className="flex gap-2">
            <button onClick={submit} disabled={saving} className="flex-1 px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold disabled:opacity-50">{saving ? t('dp.review.publishing') : t('dp.review.publish')}</button>
            <button onClick={onClose} className="px-5 py-2.5 bg-bg-soft rounded-lg font-bold">{t('dp.review.cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
