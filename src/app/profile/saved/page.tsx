'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listSaved, type SavedItem } from '@/lib/saved';

const TYPE_LABEL: Record<string, string> = {
  university: 'جامعة',
  school:     'مدرسة',
  major:      'تخصص',
  scholarship:'منحة',
  career:     'مسار مهني',
  internship: 'تدريب',
  vocational: 'تعليم مهني',
};

const TYPE_PATH: Record<string, string> = {
  university: '/universities',
  school:     '/schools',
  major:      '/majors',
  scholarship:'/scholarships',
  career:     '/careers',
  internship: '/internships',
  vocational: '/vocational',
};

export default function SavedListPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSaved().then(setItems).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg" dir="rtl">
        <div className="text-ink-muted">جاري تحميل قائمتك...</div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-bg py-12 px-4" dir="rtl">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h1 className="text-3xl font-extrabold text-primary mb-3">قائمتك فاضية</h1>
          <p className="text-ink-muted mb-6">
            احفظ جامعات، تخصصات، منح، أو فرص تدريب من تحبها — وارجع لها بأي وقت.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/universities" className="btn-primary px-5 py-3 rounded-xl">تصفّح الجامعات</Link>
            <Link href="/scholarships" className="btn-outline px-5 py-3 rounded-xl">المنح المتاحة</Link>
          </div>
        </div>
      </main>
    );
  }

  // Group by type
  const groups: Record<string, SavedItem[]> = {};
  for (const it of items) (groups[it.entity_type] ||= []).push(it);

  return (
    <main className="min-h-screen bg-bg py-8 px-4" dir="rtl">
      <div className="container mx-auto max-w-4xl">
        <Link href="/dashboard" className="text-sm text-ink-muted hover:text-primary inline-block mb-4">← لوحتي</Link>
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">⭐ قائمتي</h1>
        <p className="text-ink-muted mb-8">{items.length} عنصر محفوظ</p>

        <div className="space-y-8">
          {Object.entries(groups).map(([type, list]) => (
            <section key={type}>
              <h2 className="text-lg font-extrabold text-primary mb-3 flex items-center gap-2">
                {TYPE_LABEL[type]}
                <span className="text-xs font-normal bg-mint-light text-primary-dark px-2 py-0.5 rounded-full">
                  {list.length}
                </span>
              </h2>
              <ul className="space-y-2">
                {list.map(item => (
                  <li key={item.id}>
                    <Link
                      href={`${TYPE_PATH[type] || '/'}/${item.entity_id}`}
                      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-primary hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-ink">#{item.entity_id}</div>
                          <div className="text-xs text-ink-muted">
                            محفوظ منذ {new Date(item.created_at).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                        <span className="text-primary text-xl">←</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
