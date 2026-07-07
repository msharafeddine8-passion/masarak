// Own metadata for /universities/lebanon. Without this, the client page fell
// back to RootLayout's homepage metadata (canonical → "/", homepage title),
// so Google treated it as a duplicate of the homepage and dropped it.
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "أفضل الجامعات في لبنان — دليل الطالب | مسارك",
  description: "دليل شامل للجامعات اللبنانية: التخصصات، الرسوم، لغة التدريس، الموقع، والقبول. قارن الجامعات واختر الأنسب لك عبر منصة مسارك.",
  path: "/universities/lebanon",
  keywords: ["جامعات لبنان", "أفضل جامعات لبنان", "دليل الجامعات اللبنانية", "الدراسة في لبنان", "رسوم الجامعات"],
});

export default function LebanonUniversitiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
