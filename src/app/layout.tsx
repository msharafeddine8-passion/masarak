import type { Metadata } from "next";
import "./globals.css";
import { StudentContextProvider } from "@/context/StudentContext";
import SiteHeader from "@/components/SiteHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import SiteFooter from "@/components/SiteFooter";
import PWARegister from "@/components/PWARegister";
import { OrganizationSchema, WebsiteSchema } from "@/components/StructuredData";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "مسارك — منصة طلاب لبنان | جمعية تكافل",
  description: "منصّة لبنانية مجانية من جمعية تكافل: اكتشف تخصصك، اختر جامعتك، احصل على منح دراسية، وابنِ سيرتك الذاتية. كل شي بمكان واحد.",
  path: "/",
  keywords: ["مسارك", "جمعية تكافل", "طلاب لبنان", "جامعات لبنان", "منح دراسية لبنان", "توجيه مهني", "AUB", "LAU", "USJ"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <OrganizationSchema />
        <WebsiteSchema />
        <PWARegister />
        <StudentContextProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <MobileBottomNav />
        </StudentContextProvider>
      </body>
    </html>
  );
}
