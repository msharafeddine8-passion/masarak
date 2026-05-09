// src/app/tools/application-tracker/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "متتبّع الطلبات — Application Tracker",
  description: "تتبّع كل طلباتك للجامعات، المنح، والتدريب في مكان واحد. مواعيد، حالات، وملاحظات.",
  path: "/tools/application-tracker",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
