// src/app/privacy/page.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "سياسة الخصوصية",
  description: "سياسة الخصوصية لمنصة مسارك — كيف نجمع، نستخدم، ونحمي بياناتك.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-primary mb-2">سياسة الخصوصية</h1>
          <p className="text-sm text-gray-500">آخر تحديث: 9 أيار 2026</p>
        </header>

        <article className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p>
            نحن في &quot;مسارك&quot; نلتزم بحماية خصوصيتك. هذه السياسة تشرح ما هي البيانات
            التي نجمعها، كيف نستخدمها، ومتى نشاركها.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">1. البيانات التي نجمعها</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                <strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني، الدور (طالب/ولي أمر/مدرسة/جامعة)،
                والصورة عند تسجيل الدخول بـ Google.
              </li>
              <li>
                <strong>بيانات البروفايل:</strong> المدرسة، الجامعة، التخصص، المعدّل، الشهادات،
                الإنجازات، التطوع — وكلها يدخلها المستخدم طوعاً.
              </li>
              <li>
                <strong>بيانات الاستخدام:</strong> الصفحات التي تزورها، نتائج اختبار Career DNA،
                تفاعلك مع المنح والجامعات.
              </li>
              <li>
                <strong>البيانات التقنية:</strong> عنوان IP، نوع المتصفح، نظام التشغيل
                (لأغراض أمنية وتحسين الأداء).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">2. كيف نستخدم بياناتك</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>تخصيص توصيات الجامعات، المنح، والتخصصات لك.</li>
              <li>إرسال إشعارات عن مواعيد المنح والفرص.</li>
              <li>تحسين خدماتنا وتطوير ميزات جديدة.</li>
              <li>التواصل معك بشأن حسابك.</li>
              <li>منع الاحتيال وحماية المنصة.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">3. مشاركة البيانات</h2>
            <p>
              نحن <strong>لا نبيع</strong> بياناتك الشخصية لأي طرف ثالث. قد نشارك معلومات محدودة في الحالات الآتية:
            </p>
            <ul className="list-disc pr-6 space-y-2 mt-2">
              <li>
                مع المدرسة أو الجامعة <strong>الشريكة</strong> التي اخترتها (وفقط المعلومات التي توافق على مشاركتها).
              </li>
              <li>
                مع مزوّدي الخدمات الذين يساعدوننا في تشغيل المنصة (Vercel للاستضافة،
                Supabase لقاعدة البيانات) — وكلهم ملتزمون باتفاقيات حماية بيانات.
              </li>
              <li>
                عندما يطلب القانون منا ذلك (مثل أمر قضائي).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">4. حقوقك</h2>
            <p>أنت تملك حقوقاً كاملة على بياناتك:</p>
            <ul className="list-disc pr-6 space-y-2 mt-2">
              <li><strong>الوصول:</strong> طلب نسخة من بياناتك.</li>
              <li><strong>التعديل:</strong> تصحيح أي معلومة خاطئة.</li>
              <li><strong>الحذف:</strong> طلب حذف حسابك وكل بياناتك بشكل كامل.</li>
              <li><strong>التصدير:</strong> تنزيل بياناتك بصيغة قابلة للنقل (JSON).</li>
              <li><strong>الاعتراض:</strong> إيقاف معالجة معينة لبياناتك.</li>
            </ul>
            <p className="mt-3">
              لممارسة أي حق، راسلنا على{" "}
              <a href="mailto:hello@masaraklb.com" className="text-primary font-bold hover:underline">
                hello@masaraklb.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">5. ملفات تعريف الارتباط (Cookies)</h2>
            <p>
              نستخدم cookies ضرورية لتشغيل الموقع (مثل تسجيل الدخول)، و cookies تحليلية لفهم كيف يستخدم
              الزوار الموقع وتحسينه. يمكنك تعطيلها من إعدادات متصفحك.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">6. أمان البيانات</h2>
            <p>
              نستخدم تشفير TLS لكل الاتصالات، نخزّن كلمات المرور بشكل مشفّر، ونطبّق Row Level Security
              على قاعدة البيانات لضمان أن كل مستخدم يصل لبياناته فقط.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">7. القاصرون</h2>
            <p>
              منصة &quot;مسارك&quot; مخصصة للطلاب من عمر 12 سنة وما فوق. للمستخدمين تحت 16 سنة،
              نطلب موافقة ولي الأمر أو الوصي عبر إيميل التحقق.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">8. التغييرات على هذه السياسة</h2>
            <p>
              قد نحدّث هذه السياسة بشكل دوري. سننبّهك بالتغييرات الجوهرية عبر إيميل وإشعار في الموقع
              قبل 30 يوماً من نفاذ التغييرات.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mt-8 mb-3">9. التواصل معنا</h2>
            <p>
              لأي سؤال عن سياسة الخصوصية، تواصل معنا على:{" "}
              <a href="mailto:hello@masaraklb.com" className="text-primary font-bold hover:underline">
                hello@masaraklb.com
              </a>
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
