import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { StudentContextProvider } from "@/context/StudentContext";
import SiteHeader from "@/components/SiteHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import SiteFooter from "@/components/SiteFooter";
import BackButton from "@/components/BackButton";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import PWARegister from "@/components/PWARegister";
import { OrganizationSchema, WebsiteSchema } from "@/components/StructuredData";
import { I18nProvider } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

// Self-hosted via next/font — removes the render-blocking Google Fonts @import
// in globals.css and the third-party preconnect/preload round-trip in <head>.
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-tajawal",
});

export const metadata: Metadata = buildMetadata({
  title: "مسارك — منصّة الطلاب لاختيار الجامعات والمنح الدراسية",
  description: "منصّة عربية للطلاب: اكتشف تخصّصك، اختر جامعتك، احصل على منح دراسية، وابنِ سيرتك الذاتية. كل شي بمكان واحد.",
  path: "/",
  keywords: ["مسارك", "جامعات", "منح دراسية", "تخصصات", "توجيه مهني", "الطلاب العرب", "بناء السيرة الذاتية", "كلية"],
});

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
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: PREHYDRATION_LANG_SCRIPT }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[100] focus:bg-[#012730] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:outline focus:outline-2 focus:outline-[#97DED0]"
        >
          تخطّ إلى المحتوى
        </a>
        <OrganizationSchema />
        <WebsiteSchema />
        <GoogleAnalytics />
        <PWARegister />
        <I18nProvider>
          <StudentContextProvider>
            <SiteHeader />
            <BackButton />
            <div id="main-content">{children}</div>
            <SiteFooter />
            <WhatsAppFAB />
            <MobileBottomNav />
          </StudentContextProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
