'use client';

import { useEffect, useState } from 'react';
import { listPublishedTestimonials, type Testimonial } from '@/lib/testimonials';
import Link from 'next/link';

/**
 * Sprint 3.2: Honest social-proof section.
 * Reads testimonials from DB. When empty, shows the "first cohort" empty state
 * — never fake quotes.
 */
export default function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[] | null>(null);

  useEffect(() => {
    listPublishedTestimonials().then(setItems);
  }, []);

  if (items === null) return null; // loading
  if (items.length === 0) {
    return (
      <section className="bg-bg-mint py-12 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="text-5xl mb-3">🌱</div>
          <h2 className="text-2xl font-extrabold text-primary mb-2">منصة جديدة — كن من أوائل الطلاب</h2>
          <p className="text-ink-muted">
            مسارك انطلقت حديثاً. مش رح نخترع شهادات وهمية — قصص النجاح الحقيقية رح تظهر هون لما يستخدمو الطلاب المنصة.
          </p>
          <Link href="/auth/register?role=student" className="mt-5 inline-block btn-primary px-5 py-3 rounded-xl">
            ابدأ مجاناً ←
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-bg-mint py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary">شهادات الطلاب</h2>
          <p className="text-ink-muted mt-2">قصص حقيقية من طلاب عرب عم يستفيدوا من المنصة.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(t => (
            <div key={t.id} className="bg-surface rounded-2xl border border-line p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                {t.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={t.image_url} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-mint-light text-primary flex items-center justify-center font-extrabold">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-bold text-ink">{t.name}</div>
                  <div className="text-xs text-ink-muted">{t.university_name || t.school_name || ''}</div>
                </div>
              </div>
              <p className="text-sm text-ink leading-relaxed">{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
