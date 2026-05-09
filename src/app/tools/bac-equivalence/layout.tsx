// src/app/tools/bac-equivalence/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "حاسبة معادلة البكالوريا اللبنانية — BAC to GPA",
  description: "حوّل علامة البكالوريا اللبنانية إلى GPA دولي و SAT equivalent. اكتشف أي جامعات لبنانية ودولية بتقبلك بمعدّلك.",
  path: "/tools/bac-equivalence",
  keywords: ["معادلة البكالوريا", "BAC to GPA", "علامة البكالوريا اللبنانية", "قبول الجامعات لبنان"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
