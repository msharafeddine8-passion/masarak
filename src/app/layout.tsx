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
    description: "اكتشف مسارك الأكاديمي والمهني. جامعات لبنان، منح دراسية، اختبار Career DNA، وأدوات مهنية — كل شيء في مكان واحد.",
    url: "https://masaraklb.com",
    siteName: "مسارك",
    locale: "ar_LB",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "مسارك — بوابة الطلاب اللبنانيين",
    description: "اكتشف مسارك الأكاديمي والمهني. جام