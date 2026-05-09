// src/app/blog/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "مدوّنة مسارك — نصائح وإرشادات للطلاب اللبنانيين",
  description:
    "مقالات عن اختيار التخصص، المنح الدراسية، التحضير للجامعة، وسوق العمل في لبنان والخليج.",
  path: "/blog",
  keywords: [
    "مدونة مسارك",
    "نصائح طلاب لبنان",
    "كيف أختار جامعتي",
    "مقالات تعليمية",
    "إرشاد مهني",
  ],
});

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
