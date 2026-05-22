import type { Metadata } from "next";
import "./globals.css";
import { StudentContextProvider } from "@/context/StudentContext";
import SiteHeader from "@/components/SiteHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import SiteFooter from "@/components/SiteFooter";
import BackButton from "@/components/BackButton";
import PWARegister from "@/components/PWARegister";
import { OrganizationSchema, WebsiteSchema } from "@/components/StructuredData";
import { I18nProvider } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "مسارك — منصّة الطلاب لاختيار الجامعات والمنح الدراسية",
  description: "منصّة عربية للطلاب: اكتشف تخصّصك، اختر جامعتك، احصل على منح دراسية، وابنِ سيرتك الذاتية. كل شي بمكان واحد.",
  path: "/",
  keywords: ["مسارك", "جامعات", "منح دراسية", "تخصصات", "توجيه مهني", "الطلاب العرب", "بناء السيرة الذاتية", "كلية"],
});

// Runs BEFORE React hydration to set the right <html dir/lang> based on the
// user's saved language preference. Prevents a flash of Arabic UI for users
// who have selected English.
const PREHYDRATION_LANG_SCRIPT = `
  try {
    var l = localStorage.getItem('masarak-lang');
    if (l === 'en') {
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: PREHYDRATION_LANG_SCRIPT }}
        />
      </head>
      <body>
        <OrganizationSchema />
        <WebsiteSchema />
        <PWARegister />
        <I18nProvider>
          <StudentContextProvider>
            <SiteHeader />
            <BackButton />
            {children}
            <SiteFooter />
            <MobileBottomNav />
          </StudentContextProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
