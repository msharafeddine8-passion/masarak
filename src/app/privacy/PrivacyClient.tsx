'use client';

import { useI18n } from '@/lib/i18n';

// Privacy policy is long-form legal content. To keep it readable and avoid
// 50+ tiny translation keys, the entire document is stored here twice
// (Arabic + English) and the active locale picks which one to render.
const CONTENT = {
  ar: (
    <>
      <p>
        نحن في &quot;مسارك&quot; نلتزم بحماية خصوصيتك. هذه السياسة تشرح ما هي البيانات
        التي نجمعها، كيف نستخدمها، ومتى نشاركها.
      </p>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">1. البيانات التي نجمعها</h2>
        <ul className="list-disc pr-6 space-y-2">
          <li><strong>بيانات الحساب:</strong> الاسم، البريد الإلكتروني، الدور (طالب/ولي أمر/مدرسة/جامعة)، والصورة عند تسجيل الدخول بـ Google.</li>
          <li><strong>بيانات البروفايل:</strong> المدرسة، الجامعة، التخصص، المعدّل، الشهادات، الإنجازات، التطوع — وكلها يدخلها المستخدم طوعاً.</li>
          <li><strong>بيانات الاستخدام:</strong> الصفحات التي تزورها، نتائج اختبار Career DNA، تفاعلك مع المنح والجامعات.</li>
          <li><strong>البيانات التقنية:</strong> عنوان IP، نوع المتصفح، نظام التشغيل (لأغراض أمنية وتحسين الأداء).</li>
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
        <p>نحن <strong>لا نبيع</strong> بياناتك الشخصية لأي طرف ثالث. قد نشارك معلومات محدودة في الحالات الآتية:</p>
        <ul className="list-disc pr-6 space-y-2 mt-2">
          <li>مع المدرسة أو الجامعة <strong>الشريكة</strong> التي اخترتها (وفقط المعلومات التي توافق على مشاركتها).</li>
          <li>مع مزوّدي الخدمات الذين يساعدوننا في تشغيل المنصة (Vercel للاستضافة، Supabase لقاعدة البيانات) — وكلهم ملتزمون باتفاقيات حماية بيانات.</li>
          <li>عندما يطلب القانون منا ذلك (مثل أمر قضائي).</li>
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
          لممارسة أي حق، راسلنا على{' '}
          <a href="mailto:support@masaraklb.com" className="text-primary font-bold hover:underline">support@masaraklb.com</a>.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">5. ملفات تعريف الارتباط (Cookies)</h2>
        <p>نستخدم cookies ضرورية لتشغيل الموقع (مثل تسجيل الدخول)، و cookies تحليلية لفهم كيف يستخدم الزوار الموقع وتحسينه. يمكنك تعطيلها من إعدادات متصفحك.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">6. أمان البيانات</h2>
        <p>نستخدم تشفير TLS لكل الاتصالات، نخزّن كلمات المرور بشكل مشفّر، ونطبّق Row Level Security على قاعدة البيانات لضمان أن كل مستخدم يصل لبياناته فقط.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">7. القاصرون</h2>
        <p>منصة &quot;مسارك&quot; مخصصة للطلاب من عمر 12 سنة وما فوق. للمستخدمين تحت 16 سنة، نطلب موافقة ولي الأمر أو الوصي عبر إيميل التحقق.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">8. التغييرات على هذه السياسة</h2>
        <p>قد نحدّث هذه السياسة بشكل دوري. سننبّهك بالتغييرات الجوهرية عبر إيميل وإشعار في الموقع قبل 30 يوماً من نفاذ التغييرات.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">9. التواصل معنا</h2>
        <p>لأي سؤال عن سياسة الخصوصية، تواصل معنا على:{' '}
          <a href="mailto:support@masaraklb.com" className="text-primary font-bold hover:underline">support@masaraklb.com</a>
        </p>
      </section>
    </>
  ),

  en: (
    <>
      <p>
        At &quot;Masarak&quot; we&apos;re committed to protecting your privacy. This policy explains
        what data we collect, how we use it, and when we share it.
      </p>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">1. Data we collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account data:</strong> Name, email, role (student / parent / school / university), and profile picture when signing in with Google.</li>
          <li><strong>Profile data:</strong> School, university, major, GPA, certificates, achievements, volunteering — all entered by the user voluntarily.</li>
          <li><strong>Usage data:</strong> Pages you visit, Career DNA results, your interactions with scholarships and universities.</li>
          <li><strong>Technical data:</strong> IP address, browser type, operating system (for security and performance).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">2. How we use your data</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Personalize university, scholarship, and major recommendations.</li>
          <li>Send notifications about scholarship deadlines and opportunities.</li>
          <li>Improve our services and develop new features.</li>
          <li>Communicate with you about your account.</li>
          <li>Prevent fraud and protect the platform.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">3. Data sharing</h2>
        <p>We <strong>do not sell</strong> your personal data to any third party. We may share limited information in the following cases:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>With a <strong>partner</strong> school or university you have selected (and only the information you agree to share).</li>
          <li>With service providers who help us run the platform (Vercel for hosting, Supabase for the database) — all bound by data protection agreements.</li>
          <li>When required by law (e.g. a court order).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">4. Your rights</h2>
        <p>You have full rights over your data:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li><strong>Access:</strong> Request a copy of your data.</li>
          <li><strong>Correction:</strong> Fix any inaccurate information.</li>
          <li><strong>Deletion:</strong> Request full deletion of your account and all your data.</li>
          <li><strong>Export:</strong> Download your data in a portable format (JSON).</li>
          <li><strong>Objection:</strong> Stop specific processing of your data.</li>
        </ul>
        <p className="mt-3">
          To exercise any right, email{' '}
          <a href="mailto:support@masaraklb.com" className="text-primary font-bold hover:underline">support@masaraklb.com</a>.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">5. Cookies</h2>
        <p>We use essential cookies to run the site (such as login) and analytics cookies to understand how visitors use the site and improve it. You can disable them in your browser settings.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">6. Data security</h2>
        <p>We use TLS encryption for all connections, store passwords encrypted, and enforce Row Level Security on the database so each user only accesses their own data.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">7. Minors</h2>
        <p>&quot;Masarak&quot; is designed for students ages 12 and up. For users under 16, we request a parent or guardian&apos;s consent via verification email.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">8. Changes to this policy</h2>
        <p>We may update this policy periodically. We will notify you of substantial changes by email and an in-product notice 30 days before they take effect.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">9. Contact us</h2>
        <p>For any question about this privacy policy, contact us at:{' '}
          <a href="mailto:support@masaraklb.com" className="text-primary font-bold hover:underline">support@masaraklb.com</a>
        </p>
      </section>
    </>
  ),
};

export default function PrivacyClient() {
  const { t, locale, dir } = useI18n();

  return (
    <main dir={dir} className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-primary mb-2">{t('legal.privacy.title')}</h1>
          <p className="text-sm text-gray-500">{t('legal.last_updated')} {t('legal.updated_date')}</p>
        </header>

        <article className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed">
          {CONTENT[locale]}
        </article>
      </div>
    </main>
  );
}
