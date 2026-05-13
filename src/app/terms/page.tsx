// src/app/terms/page.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "شروط الاستخدام",
  description: "الشروط والأحكام لاستخدام منصة مسارك.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-primary mb-2">شروط الاستخدام</h1>
          <p className="text-sm text-gray-500">آخر تحديث: 9 أيار 2026</p>
        </header>

        <article className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p>
            مرحباً بك في &quot;مسارك&quot;. باستخدامك للمنصة، فإنك توافق على الشروط الآتية.
            إذا كنت لا توافق، يرجى عدم استخدام المنصة.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">1. تعريفات</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li><strong>المنصة:</strong> موقع مسارك وكل خدماته.</li>
              <li><strong>المستخدم:</strong> أي شخص يصل للمنصة، سواء كان زائراً أو مسجّلاً.</li>
              <li><strong>المحتوى:</strong> أي نص، صورة، أو بيانات يتم نشرها أو رفعها على المنصة.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">2. أهلية الاستخدام</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>يجب أن تكون 12 سنة على الأقل لإنشاء حساب.</li>
              <li>المستخدمون تحت 16 سنة يحتاجون موافقة ولي الأمر.</li>
              <li>تتعهّد بتقديم معلومات صحيحة عند التسجيل.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">3. الحساب وكلمة المرور</h2>
            <p>
              أنت مسؤول عن الحفاظ على سرية كلمة المرور وكل النشاط الذي يحدث على حسابك.
              أبلغنا فوراً عن أي استخدام غير مصرّح به.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">4. الاستخدام المسموح</h2>
            <p>توافق على عدم:</p>
            <ul className="list-disc pr-6 space-y-2 mt-2">
              <li>انتحال شخصية شخص آخر أو تقديم معلومات مزيفة.</li>
              <li>محاولة اختراق المنصة أو الوصول لبيانات مستخدمين آخرين.</li>
              <li>نشر محتوى مسيء، عنصري، أو مخالف للقانون اللبناني.</li>
              <li>استخدام برامج آلية (bots) لاستخراج بياناتنا بدون إذن مكتوب.</li>
              <li>إعادة بيع خدماتنا أو محتوانا دون إذن.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">5. المحتوى الذي تنشئه</h2>
            <p>
              أنت تحتفظ بكامل ملكية المحتوى الذي تنشئه (CV، بروفايل، طلبات منح). تمنحنا ترخيصاً
              غير حصري لاستخدام هذا المحتوى لتشغيل المنصة وتقديم الخدمة لك.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">6. الخدمات المجانية والمدفوعة</h2>
            <p>
              المنصة في المرحلة الحالية مجانية للطلاب في الميزات الأساسية. قد نطلق ميزات Premium مستقبلاً
              مع شروط دفع منفصلة. الشراكات مع المدارس والجامعات تخضع لاتفاقيات منفصلة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">7. دقة المعلومات</h2>
            <p>
              نحاول تقديم معلومات دقيقة عن الجامعات والمنح والتخصصات، لكن المنصة <strong>تجميعية</strong>.
              المعلومات الرسمية يجب التحقق منها مباشرة من الجامعة/الجهة المانحة. لا نتحمّل مسؤولية أي قرار
              تتخذه بناءً على المعلومات في المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">8. الملكية الفكرية</h2>
            <p>
              كل محتوى المنصة (تصميم، أكواد، نصوص، اختبارات Career DNA، مقالات المدوّنة) ملك حصري لـ&quot;مسارك&quot;.
              لا يجوز نسخه أو إعادة نشره دون إذن مكتوب.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">9. إنهاء الحساب</h2>
            <p>
              يمكنك حذف حسابك في أي وقت من إعدادات حسابك. نحتفظ بالحق في تعليق أو إنهاء أي حساب يخالف هذه الشروط.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">10. حدود المسؤولية</h2>
            <p>
              تُقدَّم المنصة &quot;كما هي&quot;. لا نضمن قبولك في جامعة معينة أو حصولك على منحة.
              أنت المسؤول الوحيد عن قراراتك الأكاديمية والمهنية.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">11. القانون المطبَّق</h2>
            <p>
              تخضع هذه الشروط للقوانين اللبنانية. أي نزاع يُحال إلى المحاكم المختصة في بيروت.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">12. التواصل</h2>
            <p>
              لأي سؤال عن الشروط، تواصل معنا على:{" "}
              <a href="mailto:support@masaraklb.com" className="text-primary font-bold hover:underline">
                support@masaraklb.com
              </a>
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
