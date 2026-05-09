// src/app/schools/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "دليل المدارس اللبنانية — خاصة، رسمية، دولية، تقنية",
  description:
    "دليل شامل لمدارس لبنان: خاصة، رسمية، دولية (IB، French Bac، American)، ومعاهد تقنية. الرسوم، المنهج، التقييمات، والمواقع.",
  path: "/schools",
  keywords: [
    "مدارس لبنان",
    "أفضل مدرسة في بيروت",
    "مدارس خاصة لبنان",
    "IB مدارس لبنان",
    "مدارس دولية بيروت",
    "مدرسة فرنسية لبنان",
    "BAC فرنسي",
  ],
});

export default function SchoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
