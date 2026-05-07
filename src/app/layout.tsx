import type { Metadata } from "next";
import "./globals.css";
import { StudentContextProvider } from "@/context/StudentContext";
import MobileBottomNav from "@/components/MobileBottomNav";

export const metadata: Metadata = {
  title: "مسارك — بوابة الطلاب اللبنانيين",
  description: "اكتشف مسارك الأكاديمي والمهني. بروفايل احترافي، اختبار Career DNA، منح دراسية، وجامعات لبنان — كل شيء في مكان واحد.",
  keywords: "مسارك, طلاب لبنان, جامعات لبنان, منح دراسية, توجيه مهني",
  openGraph: {
    title: "مسارك — بوابة الطلاب اللبنانيين",
    description: "ابنِ مستقبلك من اليوم — مجاناً للأبد",
    url: "https://masaraklb.com",
    siteName: "مسارك",
    locale: "ar_LB",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">
        <StudentContextProvider>
          {children}
          <MobileBottomNav />
        </StudentContextProvider>
      </body>
    </html>
  );
}
