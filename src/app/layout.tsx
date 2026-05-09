import type { Metadata } from "next";
import "./globals.css";
import { StudentContextProvider } from "@/context/StudentContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import SiteFooter from "@/components/SiteFooter";
import PWARegister from "@/components/PWARegister";
import { OrganizationSchema, WebsiteSchema } from "@/components/StructuredData";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "مسارك — بوابة الطلاب اللبنانيين | اكتشف تخصصك وجامعتك",
  description: "منصة لبنانية شاملة للطلاب: اكتشف تخصصك عبر اختبار Career DNA، قارن بين الجامعات اللبنانية، تابع المنح الدراسية، واحصل على فرص تدريب حقيقية.",
  path: "/",
  keywords: ["مسارك", "طلاب لبنان", "جامعات لبنان", "منح دراسية لبنان", "توجيه مهني", "AUB", "LAU", "USJ", "تدريب صيفي لبنان", "Career DNA"],
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
          {children}
          <SiteFooter />
          <MobileBottomNav />
        </StudentContextProvider>
      </body>
    </html>
  );
}
