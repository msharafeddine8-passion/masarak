// src/app/referral/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "ادعو أصدقاءك — Referral Program",
  description: "ادعو أصدقاءك لمسارك واحصل على مكافآت! كل صديق ينضم = نقاط ومميّزات مجانية.",
  path: "/referral",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
