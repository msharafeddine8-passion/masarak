// src/components/SiteFooter.tsx
import Link from "next/link";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-12" dir="rtl">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <div>
              <div className="font-extrabold text-primary">مسارك</div>
              <div className="text-xs text-gray-500">منصة الطلاب اللبنانيين</div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            <Link href="/about" className="text-gray-600 hover:text-primary transition-colors">
              من نحن
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-primary transition-colors">
              المدوّنة
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-primary transition-colors">
              شروط الاستخدام
            </Link>
            <a
              href="mailto:hello@masaraklb.com"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              تواصل معنا
            </a>
          </nav>
        </div>

        <div className="text-center text-xs text-gray-500 mt-6 pt-6 border-t border-gray-200">
          © {currentYear} مسارك. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
