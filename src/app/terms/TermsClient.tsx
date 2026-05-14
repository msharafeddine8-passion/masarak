'use client';

import { useI18n } from '@/lib/i18n';

// Long-form legal content stored bilingually here to avoid 50+ tiny i18n keys.
const CONTENT = {
  ar: (
    <>
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
        <p>أنت مسؤول عن الحفاظ على سرية كلمة المرور وكل النشاط الذي يحدث على حسابك. أبلغنا فوراً عن أي استخدام غير مصرّح به.</p>
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
        <p>أنت تحتفظ بكامل ملكية المحتوى الذي تنشئه (CV، بروفايل، طلبات منح). تمنحنا ترخيصاً غير حصري لاستخدام هذا المحتوى لتشغيل المنصة وتقديم الخدمة لك.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">6. الخدمات المجانية والمدفوعة</h2>
        <p>المنصة في المرحلة الحالية مجانية للطلاب في الميزات الأساسية. قد نطلق ميزات Premium مستقبلاً مع شروط دفع منفصلة. الشراكات مع المدارس والجامعات تخضع لاتفاقيات منفصلة.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">7. دقة المعلومات</h2>
        <p>نحاول تقديم معلومات دقيقة عن الجامعات والمنح والتخصصات، لكن المنصة <strong>تجميعية</strong>. المعلومات الرسمية يجب التحقق منها مباشرة من الجامعة/الجهة المانحة. لا نتحمّل مسؤولية أي قرار تتخذه بناءً على المعلومات في المنصة.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">8. الملكية الفكرية</h2>
        <p>كل محتوى المنصة (تصميم، أكواد، نصوص، اختبارات Career DNA، مقالات المدوّنة) ملك حصري لـ&quot;مسارك&quot;. لا يجوز نسخه أو إعادة نشره دون إذن مكتوب.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">9. إنهاء الحساب</h2>
        <p>يمكنك حذف حسابك في أي وقت من إعدادات حسابك. نحتفظ بالحق في تعليق أو إنهاء أي حساب يخالف هذه الشروط.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">10. حدود المسؤولية</h2>
        <p>تُقدَّم المنصة &quot;كما هي&quot;. لا نضمن قبولك في جامعة معينة أو حصولك على منحة. أنت المسؤول الوحيد عن قراراتك الأكاديمية والمهنية.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">11. القانون المطبَّق</h2>
        <p>تخضع هذه الشروط للقوانين اللبنانية. أي نزاع يُحال إلى المحاكم المختصة في بيروت.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">12. التواصل</h2>
        <p>لأي سؤال عن الشروط، تواصل معنا على:{' '}
          <a href="mailto:support@masaraklb.com" className="text-primary font-bold hover:underline">support@masaraklb.com</a>
        </p>
      </section>
    </>
  ),

  en: (
    <>
      <p>
        Welcome to &quot;Masarak&quot;. By using the platform, you agree to the following terms.
        If you do not agree, please do not use the platform.
      </p>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">1. Definitions</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>The Platform:</strong> The Masarak website and all its services.</li>
          <li><strong>User:</strong> Anyone accessing the platform, whether as a visitor or registered user.</li>
          <li><strong>Content:</strong> Any text, image, or data published or uploaded to the platform.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">2. Eligibility</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>You must be at least 12 years old to create an account.</li>
          <li>Users under 16 need a parent or guardian&apos;s consent.</li>
          <li>You agree to provide accurate information when registering.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">3. Account and password</h2>
        <p>You are responsible for keeping your password confidential and for all activity on your account. Notify us immediately of any unauthorized use.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">4. Permitted use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Impersonate another person or provide false information.</li>
          <li>Attempt to hack the platform or access other users&apos; data.</li>
          <li>Publish offensive, racist, or illegal content under Lebanese law.</li>
          <li>Use automated programs (bots) to scrape our data without written permission.</li>
          <li>Resell our services or content without permission.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">5. Content you create</h2>
        <p>You retain full ownership of the content you create (CV, profile, scholarship applications). You grant us a non-exclusive license to use this content to operate the platform and provide the service to you.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">6. Free and paid services</h2>
        <p>The platform is currently free for students for the core features. We may introduce Premium features in the future with separate payment terms. Partnerships with schools and universities are governed by separate agreements.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">7. Accuracy of information</h2>
        <p>We strive to provide accurate information about universities, scholarships, and majors, but the platform is <strong>aggregative</strong>. Official information must be verified directly with the university/granting body. We do not take responsibility for any decision you make based on the information on the platform.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">8. Intellectual property</h2>
        <p>All platform content (design, code, text, Career DNA tests, blog articles) is the exclusive property of &quot;Masarak&quot;. It may not be copied or republished without written permission.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">9. Account termination</h2>
        <p>You can delete your account at any time from your account settings. We reserve the right to suspend or terminate any account that violates these terms.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">10. Limitation of liability</h2>
        <p>The platform is provided &quot;as is&quot;. We do not guarantee admission to a particular university or that you will obtain a scholarship. You are solely responsible for your academic and career decisions.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">11. Governing law</h2>
        <p>These terms are governed by Lebanese law. Any dispute is referred to the competent courts in Beirut.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-primary mt-8 mb-3">12. Contact</h2>
        <p>For any question about the terms, contact us at:{' '}
          <a href="mailto:support@masaraklb.com" className="text-primary font-bold hover:underline">support@masaraklb.com</a>
        </p>
      </section>
    </>
  ),
};

export default function TermsClient() {
  const { t, locale, dir } = useI18n();

  return (
    <main dir={dir} className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-primary mb-2">{t('legal.terms.title')}</h1>
          <p className="text-sm text-gray-500">{t('legal.last_updated')} {t('legal.updated_date')}</p>
        </header>

        <article className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed">
          {CONTENT[locale]}
        </article>
      </div>
    </main>
  );
}
