// src/app/about/page.tsx
// عن منصّة مسارك — server component (preserves SEO metadata).
// Visual + interactive content lives in AboutClient.tsx.

import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import AboutClient from './AboutClient';

export const metadata: Metadata = buildMetadata({
  title: 'عن مسارك',
  description:
    'مسارك منصّة عربية تساعد الطلاب على اختيار جامعتهم، اكتشاف تخصّصهم، والتقديم للمنح الدراسية. أدوات مدروسة، محتوى موثوق، وإرشاد متاح للجميع.',
  path: '/about',
  keywords: ['عن مسارك', 'منصّة طلابية', 'إرشاد جامعي', 'دليل الجامعات'],
});

export default function AboutPage() {
  return <AboutClient />;
}
