import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "فريق مسارك — من نحن",
  description: "تعرّف على فريق مسارك ورسالتنا: قرارات جامعية مبنية على معلومات دقيقة.",
  path: "/team",
});

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-bg py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-3xl text-center">
        <Link href="/about" className="text-sm text-gray-500 hover:text-blue-700 mb-4 inline-block">← عن مسارك</Link>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1b3a6b] mb-4">من نحن</h1>
        <p className="text-lg text-gray-600 mb-8">مسارك بدا بشخص واحد لاحظ إنو الطالب اللبناني بيختار جامعته بمعلومات مبعثرة. صفحة الفريق الكاملة قريباً.</p>
        <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#012730] text-white font-bold hover:bg-[#143b43]">تواصل معنا ←</Link>
      </div>
    </main>
  );
}
