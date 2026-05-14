'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type Locale = 'ar' | 'en';

// ─── Translations dictionary ──────────────────────────────────────────────────
// Add new strings here. The Arabic key is the source of truth.
// To translate a new string: add it to BOTH `ar` and `en` objects below.
export const messages = {
  ar: {
    // — Header / Nav —
    'nav.universities':     'الجامعات',
    'nav.majors':           'التخصصات',
    'nav.scholarships':     'المنح',
    'nav.careers':          'المسارات المهنية',
    'nav.schools':          'المدارس',
    'nav.vocational':       'التعليم المهني',
    'nav.tools':            'الأدوات',
    'nav.more':             'المزيد',
    'nav.section.main':     'التنقل',
    'nav.section.tools':    'الأدوات',
    'nav.section.more':     'المزيد',
    'nav.section.account':  'حسابي',

    // — Tools menu —
    'tools.quiz':           'اختبار اليوم',
    'tools.quiz.badge':     'جديد',
    'tools.career_dna':     'اختبار Career DNA',
    'tools.cv':             'إنشاء السيرة الذاتية',
    'tools.career_ai':      'المستشار المهني',
    'tools.interview':      'محاكاة المقابلة',
    'tools.onboarding':     'بدء الرحلة',
    'tools.cost':           'حاسبة التكلفة',
    'tools.bac':            'معادلة البكالوريا',
    'tools.tracker':        'متعقّب الطلبات',
    'tools.skills':         'اختبار المهارات',
    'tools.cover':          'خطاب التغطية',
    'tools.salary':         'حاسبة الراتب',

    // — More menu —
    'more.about':           'عن مسارك',
    'more.blog':            'المدوّنة',
    'more.contact':         'اتصل بنا',
    'more.faq':             'الأسئلة الشائعة',
    'more.community':       'المجتمع',
    'more.changelog':       'الأخبار',
    'more.referral':        'برنامج الإحالة',
    'more.premium':         'Premium 💎',
    'more.pricing':         'الباقات',

    // — User menu —
    'user.profile':         'الملف الشخصي',
    'user.edit':            'تعديل الملف',
    'user.parent_invites':  'دعوات الأهل',
    'user.dashboard':       'لوحة المتابعة',
    'user.parent.link':     'ربط طالب',
    'user.parent.deadlines':'مواعيد القبول',
    'user.parent.resources':'موارد للأهل',
    'user.admin':           'لوحة الإدارة',
    'user.logout':          'تسجيل الخروج',

    // — Auth CTAs —
    'auth.login':           'تسجيل الدخول',
    'auth.signup':          'ابدأ مجاناً',
    'auth.menu_label':      'القائمة',

    // — Footer —
    'footer.newsletter.title':       'اشترك بنشرتنا الأسبوعية',
    'footer.newsletter.subtitle':    'أحدث المنح، نصائح الجامعات، وأخبار التعليم — مباشرة لإيميلك',
    'footer.tagline':                'منصّة عربية لمساعدة الطلاب على اكتشاف تخصّصهم، اختيار جامعتهم، والوصول للمنح الدراسية.',
    'footer.col.explore':            'استكشف',
    'footer.col.tools':              'أدوات',
    'footer.col.resources':          'موارد',
    'footer.col.masarak':            'مسارك',
    'footer.copyright':              'جميع الحقوق محفوظة',
    'footer.made_with':              'صُنع بحب',
    'footer.in_lebanon':             'في لبنان',
    // Footer links
    'footer.link.universities':      'الجامعات',
    'footer.link.majors':            'التخصصات',
    'footer.link.scholarships':      'المنح الدراسية',
    'footer.link.careers':           'المسارات المهنية',
    'footer.link.schools':           'المدارس',
    'footer.link.vocational':        'التعليم المهني',
    'footer.link.internships':       'التدريب الصيفي',
    'footer.link.quiz':              'اختبار اليوم',
    'footer.link.cv':                'بناء السيرة الذاتية',
    'footer.link.career_ai':         'المرشد المهني',
    'footer.link.cost':              'حاسبة كلفة الدراسة',
    'footer.link.interview':         'تدريب المقابلات',
    'footer.link.skills':            'اختبار المهارات',
    'footer.link.blog':              'المدوّنة',
    'footer.link.guides':            'الإرشادات',
    'footer.link.community':         'المجتمع',
    'footer.link.mentorship':        'الإرشاد الفردي',
    'footer.link.jobs':              'الوظائف',
    'footer.link.courses':           'الدورات',
    'footer.link.referral':          'برنامج الإحالة',
    'footer.link.changelog':         'الأخبار',
    'footer.link.about':             'عن مسارك',
    'footer.link.contact':           'تواصل معنا',
    'footer.link.faq':               'الأسئلة الشائعة',
    'footer.link.for_students':      'للطلاب',
    'footer.link.for_parents':       'للأهل',
    'footer.link.for_schools':       'للمدارس',
    'footer.link.for_universities':  'للجامعات',
    'footer.link.privacy':           'الخصوصية',
    'footer.link.terms':             'الشروط',
    'footer.badge.new':              'جديد',

    // — Newsletter form —
    'newsletter.placeholder':        'إيميلك الإلكتروني',
    'newsletter.submit':             'اشترك مجاناً ←',
    'newsletter.success':            'تم الاشتراك بنجاح! رح يصلك أول إيميل قريباً.',
    'newsletter.duplicate':          'أنت مشترك أصلاً — شكراً!',

    // — Language toggle —
    'lang.switch_to_en':             'English',
    'lang.switch_to_ar':             'العربية',

    // — Mobile bottom nav —
    'mobile.home':                   'الرئيسية',
    'mobile.universities':           'الجامعات',
    'mobile.advisor':                'المستشار',
    'mobile.cv':                     'CV',
    'mobile.account':                'حسابي',

    // — Home: Hero —
    'home.hero.badge':               'منصة الطلاب رقم 1 في لبنان',
    'home.hero.title.1':             'مسارك يبدأ',
    'home.hero.title.2':             'من هنا.',
    'home.hero.subtitle.1':          'اكتشف تخصّصك، اختر جامعتك، احصل على منحة، وابنِ سيرتك الذاتية —',
    'home.hero.subtitle.2':          'كل شي بمكان واحد، مجاناً تماماً',
    'home.hero.subtitle.3':          '.',
    'home.cta.start_free':           'ابدأ مجاناً',
    'home.cta.try_dna':              'جرّب Career DNA',
    'home.hero.trust.title':         'آلاف الطلاب',
    'home.hero.trust.subtitle':      'سجّلوا واستفادوا',

    // Floating cards on hero
    'home.float.quiz.label':         'اختبار اليوم',
    'home.float.quiz.value':         '8/10 صحيحة',
    'home.float.scholarship.label':  'منحة جديدة',
    'home.float.scholarship.value':  '$15K AUB',
    'home.float.xp.label':           'XP اليوم',
    'home.float.xp.value':           '+125 نقطة',
    'home.float.dna.label':          'Career DNA',
    'home.float.dna.value':          'قائد ملهم',

    // Stats
    'home.stat.universities':        'جامعة معتمدة',
    'home.stat.majors':              'تخصص جامعي',
    'home.stat.scholarships':        'منحة دراسية',
    'home.stat.tools':                'أداة تعليمية',

    // Partner strip
    'home.partners.heading':         '🤝 يشمل أبرز الجامعات اللبنانية',

    // Features section
    'home.features.badge':           '✨ كل شي بمتناول يدك',
    'home.features.title':           'الأدوات اللي بتحتاجها',
    'home.features.subtitle':        'من اختيار التخصص لبناء السيرة الذاتية — مسارك معك بكل خطوة',
    'home.features.open':            'افتح',
    // Feature cards
    'home.feat.universities.t':      'الجامعات',
    'home.feat.universities.d':      'دليل شامل لـ 35 جامعة معتمدة بالترتيب الرسمي',
    'home.feat.majors.t':            'التخصصات',
    'home.feat.majors.d':            'اكتشف التخصصات وارتباطها بسوق العمل',
    'home.feat.scholarships.t':      'المنح الدراسية',
    'home.feat.scholarships.d':      'منح داخل لبنان وحول العالم',
    'home.feat.careers.t':           'المسارات المهنية',
    'home.feat.careers.d':           'تعرّف على مهن المستقبل ومتطلباتها',
    'home.feat.schools.t':           'المدارس',
    'home.feat.schools.d':           'دليل المدارس الثانوية في لبنان',
    'home.feat.vocational.t':        'التعليم المهني',
    'home.feat.vocational.d':        'شهادات وبرامج تقنية متخصصة',
    'home.feat.quiz.t':              'اختبار اليوم',
    'home.feat.quiz.d':              'اختبر معلوماتك يومياً واكسب XP',
    'home.feat.dna.t':               'Career DNA',
    'home.feat.dna.d':               'اكتشف شخصيتك المهنية والمسار المناسب',
    'home.feat.cv.t':                'السيرة الذاتية',
    'home.feat.cv.d':                'صمم CV احترافي بـ AI Improve',

    // How it works
    'home.how.badge':                '🎯 كيف يشتغل مسارك',
    'home.how.title':                '3 خطوات بسيطة',
    'home.how.subtitle':             'من التسجيل لاتخاذ قرارك — رحلة بسيطة وممتعة',
    'home.how.s1.t':                 'سجّل مجاناً',
    'home.how.s1.d':                 'أنشئ حسابك خلال 30 ثانية واملأ بياناتك الأكاديمية',
    'home.how.s2.t':                 'اكتشف نفسك',
    'home.how.s2.d':                 'اعمل اختبار Career DNA لمعرفة المسار المناسب لك',
    'home.how.s3.t':                 'اتخذ قرارك',
    'home.how.s3.d':                 'قارن الجامعات، اطلب منحة، وابنِ سيرتك الذاتية',

    // Audiences
    'home.audiences.badge':          '👥 لجميع الفئات',
    'home.audiences.title':          'مَن يستفيد من مسارك؟',
    'home.audiences.subtitle':       'موارد مخصّصة لكل فئة في رحلة التعليم',
    'home.audiences.cta':            'اكتشف',
    'home.audiences.students.t':     'للطلاب',
    'home.audiences.students.d':     'كل ما تحتاجه لاتخاذ قرار دراستك بثقة',
    'home.audiences.students.badge': 'الأكثر استخداماً',
    'home.audiences.parents.t':      'للأهل',
    'home.audiences.parents.d':      'تابع قرارات أبنائك الأكاديمية',
    'home.audiences.schools.t':      'للمدارس',
    'home.audiences.schools.d':      'أدوات لإرشاد طلابكم في رحلتهم الجامعية',
    'home.audiences.unis.t':         'للجامعات',
    'home.audiences.unis.d':         'اربط نفسك بأفضل المرشّحين',
    'home.audiences.unis.badge':     'B2B',

    // DNA spotlight
    'home.dna.badge':                '🧬 الميزة الأكثر استخداماً',
    'home.dna.title':                'اكتشف Career DNA الخاص بك',
    'home.dna.subtitle':             'اختبار شامل 10 دقايق بيكشف نوع شخصيتك، نقاط قوّتك، والمسارات المهنية الأنسب لك.',
    'home.dna.cta':                  'ابدأ الاختبار الآن',
    'home.dna.preview.title':        'القائد الملهم',
    'home.dna.preview.match':        'ENFJ — مطابقة 94%',
    'home.dna.preview.paths_label':  'المسارات المقترحة:',
    'home.dna.preview.path1':        'إدارة أعمال',
    'home.dna.preview.path2':        'تربية',
    'home.dna.preview.path3':        'إعلام',

    // Why
    'home.why.badge':                '💎 لماذا مسارك',
    'home.why.title':                'منصة مبنية بحرفية',
    'home.why.subtitle':             'قيم وأسس بنيت عليها المنصة لخدمتك',
    'home.why.curated.t':            'محتوى مدقَّق',
    'home.why.curated.d':            'بيانات محدّثة شهرياً من مصادر رسمية',
    'home.why.tech.t':               'تكنولوجيا متقدمة',
    'home.why.tech.d':               'AI ذكي يقترح ما يناسبك بناءً على ملفك',
    'home.why.community.t':          'مبادرة مجتمعية',
    'home.why.community.d':          'لخدمة الطلاب العرب — مجاناً وبدون إعلانات',
    'home.why.privacy.t':            'خصوصية كاملة',
    'home.why.privacy.d':            'بياناتك محفوظة ومشفّرة على Supabase',
    'home.why.practical.t':          'إرشاد عملي',
    'home.why.practical.d':          'مش بس معلومات — أدوات بتوصلك للهدف',
    'home.why.values.t':             'بُني على القيم',
    'home.why.values.d':             'نضع المتعلم وأسرته في مركز كل قرار',

    // Testimonial
    'home.testimonial.badge':        '💬 آراء الطلاب',
    'home.testimonial.title':        'سمعنا من اللي جرّبنا',
    'home.testimonial.quote.1':      'مسارك ساعدني أختار جامعتي بثقة، واليوم بدرس الطب بـ AUB.',
    'home.testimonial.quote.2':      'منصة كل طالب لازم يستخدمها.',
    'home.testimonial.author':       'سارة ك.',
    'home.testimonial.role':         'طالبة طب — السنة الثانية · AUB',

    // Final CTA
    'home.cta.title':                'جاهز تبدأ رحلتك؟',
    'home.cta.subtitle':             'سجّل مجاناً خلال 30 ثانية وابدأ بالاستفادة من كل أدوات مسارك',
    'home.cta.learn_more':           'تعرّف علينا أكثر',
    'home.cta.note':                 '🎁 لا بطاقة ائتمان · لا اشتراك · مجاني تماماً',

    // — Login page —
    'login.visual.greet.1':          'مرحباً',
    'login.visual.greet.2':          'بعودتك!',
    'login.visual.subtitle':         'سجّل دخولك لمتابعة مسارك التعليمي، وافتح كل ميزات مسارك',
    'login.visual.stat.unis':        'جامعة',
    'login.visual.stat.majors':      'تخصص',
    'login.visual.stat.tools':       'أداة',
    'login.title':                   'مرحباً بعودتك 👋',
    'login.subtitle':                'سجّل دخولك لمتابعة مسارك',
    'login.google':                  'تسجيل الدخول بـ Google',
    'login.or_email':                'أو بالإيميل',
    'login.email_label':             '📧 البريد الإلكتروني',
    'login.email_placeholder':       'example@email.com',
    'login.password_label':          '🔒 كلمة المرور',
    'login.password_placeholder':    '••••••••',
    'login.forgot':                  'نسيتها؟',
    'login.submit':                  'تسجيل الدخول ←',
    'login.submitting':              'جارٍ الدخول...',
    'login.error.invalid':           'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'login.no_account':              'ما عندك حساب؟',
    'login.create_account':          'أنشئ حساباً مجاناً',

    // — Register page —
    'register.visual.greet.1':       'ابدأ رحلتك',
    'register.visual.greet.2':       'معنا!',
    'register.visual.subtitle':      'انضم لآلاف الطلاب اللي بيستخدموا مسارك يومياً لاتخاذ قراراتهم',
    'register.visual.benefit.1':     'وصول مجاني لكل الأدوات',
    'register.visual.benefit.2':     'اختبار Career DNA كامل',
    'register.visual.benefit.3':     'دليل لـ 35 جامعة و 150+ منحة',
    'register.visual.benefit.4':     'بناء سيرة ذاتية احترافية',
    'register.title':                'أنشئ حسابك المجاني 🚀',
    'register.subtitle':             'انضم لآلاف الطلاب اللي على المنصة',
    'register.who_are_you':          'من أنت؟',
    'register.role.student':         'طالب',
    'register.role.student.desc':    'أبحث عن جامعة/تخصص',
    'register.role.parent':          'ولي أمر',
    'register.role.parent.desc':     'أتابع رحلة ابني',
    'register.role.school':          'مدرسة',
    'register.role.school.desc':     'بشراكة فقط',
    'register.role.university':      'جامعة',
    'register.role.university.desc': 'بشراكة فقط',
    'register.role.partnership':     '🤝 شراكة',
    'register.partnership_note':     '🔒 المدارس والجامعات حسابات الشراكة فقط — اضغط الكارد لتشوف التفاصيل',
    'register.continue_google':      'متابعة بـ Google',
    'register.continue_email':       'متابعة بالبريد الإلكتروني ←',
    'register.back':                 '→ رجوع',
    'register.name_label':           '👤 الاسم الكامل',
    'register.name_placeholder':     'محمد أحمد',
    'register.email_label':          '📧 البريد الإلكتروني',
    'register.email_placeholder':    'example@email.com',
    'register.password_label':       '🔒 كلمة المرور',
    'register.password_placeholder': '8 أحرف على الأقل',
    'register.submit':               'أنشئ الحساب المجاني 🚀',
    'register.submitting':           'جارٍ الإنشاء...',
    'register.terms.1':              'بإنشائك حساباً، فأنت توافق على',
    'register.terms.link':           'الشروط',
    'register.terms.and':            'و',
    'register.privacy.link':         'سياسة الخصوصية',
    'register.have_account':         'عندك حساب؟',
    'register.sign_in':              'سجّل دخول',

    // — About page —
    'about.hero.badge':              '🤝 مبادرة لخدمة الطلاب',
    'about.hero.title.1':            'عن',
    'about.hero.title.2':            'مسارك',
    'about.hero.subtitle':           'نؤمن أن كل طالب يستحق فرصة عادلة لاكتشاف مساره الأكاديمي والمهني، بغضّ النظر عن خلفيته أو منطقته الجغرافية.',
    'about.mission.title':           'رسالتنا',
    'about.mission.body':            'تمكين الطلاب من اتّخاذ قرارات تعليمية ومهنية مدروسة عبر توفير معلومات موثوقة، أدوات عملية، وإرشاد متاح للجميع.',
    'about.vision.title':            'رؤيتنا',
    'about.vision.body':             'عالم يحصل فيه كل طالب على المعلومة الصحيحة في الوقت المناسب، ويبني مستقبله بثقة وعلى أساس صلب من المعرفة والإرشاد.',
    'about.values.title':            'قيمنا الأساسية',
    'about.values.credibility.t':    'المصداقية',
    'about.values.credibility.d':    'كل معلومة موثّقة من مصادر رسمية ومحدّثة بانتظام',
    'about.values.utility.t':        'الفائدة',
    'about.values.utility.d':        'نركّز على الأدوات والمحتوى الذي يحدث فرقاً حقيقياً',
    'about.values.fairness.t':       'الإنصاف',
    'about.values.fairness.d':       'نخدم كل طالب بغضّ النظر عن خلفيته أو منطقته',
    'about.values.privacy.t':        'الخصوصية',
    'about.values.privacy.d':        'بياناتك ملك لك — لا نبيعها ولا نشاركها مع أي طرف',
    'about.values.neutrality.t':     'الحياد',
    'about.values.neutrality.d':     'لا نروّج لجامعة على حساب أخرى — نقدّم المعلومة كما هي',
    'about.values.growth.t':         'التطوّر المستمر',
    'about.values.growth.d':         'نطوّر المنصّة باستمرار بناءً على ملاحظات الطلاب',
    'about.offer.title':             'ماذا تقدّم منصّة مسارك؟',
    'about.offer.1':                 'دليل شامل للجامعات في المنطقة العربية والعالم',
    'about.offer.2':                 'قاعدة بيانات للمنح الدراسية المتاحة',
    'about.offer.3':                 'تخصصات أكاديمية مع شرح وافٍ لكل واحد',
    'about.offer.4':                 'أدوات تفاعلية: حاسبة الكلفة، اختبار نقاط القوة، باني السيرة الذاتية',
    'about.offer.5':                 'مرشد مهني ذكي يجاوب على أسئلتك',
    'about.offer.6':                 'دليل المدارس الثانوية والمعاهد المهنية',
    'about.offer.7':                 'مدوّنة تعليمية ومقالات إرشاديّة',
    'about.offer.8':                 'صفحات للأهل والمدارس والجامعات',
    'about.cta.title':               'انضم إلى رحلتنا',
    'about.cta.subtitle':            'مسارك في تطوّر مستمر. سجّل دخولك وابدأ رحلتك التعليمية والمهنية، أو تواصل معنا إذا كنت ترغب بالمساهمة أو الشراكة.',
    'about.cta.start':               'ابدأ الآن',
    'about.cta.contact':             'تواصل معنا',

    // — Contact page —
    'contact.back':                  '← العودة',
    'contact.title':                 '📞 تواصل معنا',
    'contact.subtitle':              'بنحب نسمع منك! اختر الطريقة المناسبة للتواصل',
    'contact.channel.general.t':     'بريد إلكتروني عام',
    'contact.channel.general.d':     'للأسئلة والاستفسارات العامة',
    'contact.channel.partners.t':    'الشراكات والتعاون',
    'contact.channel.partners.d':    'للمدارس، الجامعات، والشركات',
    'contact.channel.support.t':     'الدعم التقني',
    'contact.channel.support.d':     'إذا في مشكلة بالموقع أو الحساب',
    'contact.channel.press.t':       'الإعلام والصحافة',
    'contact.channel.press.d':       'للمقابلات وطلبات التعليق',
    'contact.info.title':            '📍 معلومات إضافية',
    'contact.info.location':         'الموقع:',
    'contact.info.location.value':   'لبنان 🇱🇧',
    'contact.info.email':            'الإيميل:',
    'contact.info.response':         'وقت الاستجابة:',
    'contact.info.response.value':   'خلال 48 ساعة (أيام العمل)',
    'contact.info.languages':        'اللغات:',
    'contact.info.languages.value':  'العربية والإنجليزية',
    'contact.help.title':            '⚡ شو ممكن نساعدك فيه؟',
    'contact.help.1':                'إضافة منحة أو تدريب أو فرصة للموقع',
    'contact.help.2':                'اقتراح ميزات جديدة',
    'contact.help.3':                'الإبلاغ عن خطأ أو معلومة غير دقيقة',
    'contact.help.4':                'الانضمام كمدرسة أو جامعة شريكة',
    'contact.help.5':                'طلبات الإعلام والمقابلات',

    // — FAQ page —
    'faq.back':                      '← العودة',
    'faq.title':                     '❓ الأسئلة الشائعة',
    'faq.subtitle':                  'أجوبة سريعة على أكثر الأسئلة شيوعاً',
    'faq.q1':                        'هل مسارك مجاني؟',
    'faq.a1':                        'نعم، مسارك مجاني حالياً للطلاب. ميزات Premium رح تكون متاحة لاحقاً مع الحفاظ على الميزات الأساسية مجانية.',
    'faq.q2':                        'لمن مسارك؟',
    'faq.a2':                        'مسارك مخصّص للطلاب اللبنانيين من المرحلة المتوسطة (12 سنة) حتى ما بعد التخرج. أيضاً لأولياء الأمور والمدارس والجامعات.',
    'faq.q3':                        'كيف أعرف أيّ تخصص يناسبني؟',
    'faq.a3':                        'ابدأ باختبار Career DNA و Skill Strengths Quiz لاكتشاف نقاط قوّتك. بعدها تصفّح صفحة التخصصات.',
    'faq.q4':                        'هل البيانات تبعي محمية؟',
    'faq.a4':                        'نعم. نستخدم تشفير TLS، Row Level Security على قاعدة البيانات، ولا نبيع بياناتك. اقرأ سياسة الخصوصية للتفاصيل.',
    'faq.q5':                        'كيف بقدر أحفظ بياناتي؟',
    'faq.a5':                        'بعد التسجيل، كل البيانات بتنحفظ تلقائياً على حسابك. الأدوات بدون تسجيل بتحفظ على متصفّحك (localStorage).',
    'faq.q6':                        'هل أنتم منصة معتمدة من الجامعات؟',
    'faq.a6':                        'نحن منصة مستقلّة نجمع المعلومات من المصادر الرسمية. للحصول على معلومات معتمدة 100%، تواصل مع الجامعة مباشرة.',
    'faq.q7':                        'هل بقدر أستعمل مسارك إذا أنا خارج لبنان؟',
    'faq.a7':                        'نعم! المنصة متاحة عالمياً وخصوصاً للمغتربين اللبنانيين. كل المحتوى بالعربية والإنجليزية.',
    'faq.q8':                        "ليش بعض المنح تظهر 'انتهت'؟",
    'faq.a8':                        'المنح بتفتح بفترات محددة سنوياً. اشترك بحسابك لتصلك تنبيهات لما تفتح المنح اللي تناسبك.',
    'faq.q9':                        'هل عندكم تطبيق موبايل؟',
    'faq.a9':                        'موقع مسارك يعمل بشكل ممتاز على الموبايل ويمكنك إضافته للشاشة الرئيسية كـ PWA. تطبيق مستقل قيد التطوير.',
    'faq.q10':                       'كيف بقدر أتواصل معكم؟',
    'faq.a10':                       'راسلنا على support@masaraklb.com أو زر صفحة التواصل. نرد خلال 48 ساعة عادةً.',
    'faq.more.title':                'سؤالك مش هون؟',
    'faq.more.subtitle':             'راسلنا مباشرة وبنرد خلال 48 ساعة',
    'faq.more.cta':                  'تواصل معنا ←',
  },

  en: {
    // — Header / Nav —
    'nav.universities':     'Universities',
    'nav.majors':           'Majors',
    'nav.scholarships':     'Scholarships',
    'nav.careers':          'Career Paths',
    'nav.schools':          'Schools',
    'nav.vocational':       'Vocational',
    'nav.tools':            'Tools',
    'nav.more':             'More',
    'nav.section.main':     'Navigation',
    'nav.section.tools':    'Tools',
    'nav.section.more':     'More',
    'nav.section.account':  'My Account',

    // — Tools menu —
    'tools.quiz':           'Daily Quiz',
    'tools.quiz.badge':     'New',
    'tools.career_dna':     'Career DNA Test',
    'tools.cv':             'CV Builder',
    'tools.career_ai':      'Career Advisor',
    'tools.interview':      'Interview Simulator',
    'tools.onboarding':     'Start Your Journey',
    'tools.cost':           'Cost Calculator',
    'tools.bac':            'Bac Equivalence',
    'tools.tracker':        'Application Tracker',
    'tools.skills':         'Skills Test',
    'tools.cover':          'Cover Letter',
    'tools.salary':         'Salary Calculator',

    // — More menu —
    'more.about':           'About Masarak',
    'more.blog':            'Blog',
    'more.contact':         'Contact Us',
    'more.faq':             'FAQ',
    'more.community':       'Community',
    'more.changelog':       'Changelog',
    'more.referral':        'Referral Program',
    'more.premium':         'Premium 💎',
    'more.pricing':         'Pricing',

    // — User menu —
    'user.profile':         'Profile',
    'user.edit':            'Edit Profile',
    'user.parent_invites':  'Parent Invites',
    'user.dashboard':       'Dashboard',
    'user.parent.link':     'Link Student',
    'user.parent.deadlines':'Admission Deadlines',
    'user.parent.resources':'Parent Resources',
    'user.admin':           'Admin Dashboard',
    'user.logout':          'Sign Out',

    // — Auth CTAs —
    'auth.login':           'Sign In',
    'auth.signup':          'Start Free',
    'auth.menu_label':      'Menu',

    // — Footer —
    'footer.newsletter.title':       'Subscribe to our weekly newsletter',
    'footer.newsletter.subtitle':    'Latest scholarships, university tips, and education news — straight to your inbox',
    'footer.tagline':                'An Arabic platform helping students discover their major, choose their university, and unlock scholarships.',
    'footer.col.explore':            'Explore',
    'footer.col.tools':              'Tools',
    'footer.col.resources':          'Resources',
    'footer.col.masarak':            'Masarak',
    'footer.copyright':              'All rights reserved',
    'footer.made_with':              'Made with',
    'footer.in_lebanon':             'in Lebanon',
    // Footer links
    'footer.link.universities':      'Universities',
    'footer.link.majors':            'Majors',
    'footer.link.scholarships':      'Scholarships',
    'footer.link.careers':           'Career Paths',
    'footer.link.schools':           'Schools',
    'footer.link.vocational':        'Vocational',
    'footer.link.internships':       'Summer Internships',
    'footer.link.quiz':              'Daily Quiz',
    'footer.link.cv':                'CV Builder',
    'footer.link.career_ai':         'Career Advisor',
    'footer.link.cost':              'Study Cost Calculator',
    'footer.link.interview':         'Interview Prep',
    'footer.link.skills':            'Skills Test',
    'footer.link.blog':              'Blog',
    'footer.link.guides':            'Guides',
    'footer.link.community':         'Community',
    'footer.link.mentorship':        'Mentorship',
    'footer.link.jobs':              'Jobs',
    'footer.link.courses':           'Courses',
    'footer.link.referral':          'Referral Program',
    'footer.link.changelog':         'Changelog',
    'footer.link.about':             'About Masarak',
    'footer.link.contact':           'Contact Us',
    'footer.link.faq':               'FAQ',
    'footer.link.for_students':      'For Students',
    'footer.link.for_parents':       'For Parents',
    'footer.link.for_schools':       'For Schools',
    'footer.link.for_universities':  'For Universities',
    'footer.link.privacy':           'Privacy',
    'footer.link.terms':             'Terms',
    'footer.badge.new':              'New',

    // — Newsletter form —
    'newsletter.placeholder':        'Your email address',
    'newsletter.submit':             'Subscribe Free →',
    'newsletter.success':            "You're subscribed! Your first email is on its way.",
    'newsletter.duplicate':          "You're already subscribed — thanks!",

    // — Language toggle —
    'lang.switch_to_en':             'English',
    'lang.switch_to_ar':             'العربية',

    // — Mobile bottom nav —
    'mobile.home':                   'Home',
    'mobile.universities':           'Universities',
    'mobile.advisor':                'Advisor',
    'mobile.cv':                     'CV',
    'mobile.account':                'Account',

    // — Home: Hero —
    'home.hero.badge':               "Lebanon's #1 student platform",
    'home.hero.title.1':             'Your journey starts',
    'home.hero.title.2':             'right here.',
    'home.hero.subtitle.1':          'Discover your major, pick your university, win a scholarship, and build your CV —',
    'home.hero.subtitle.2':          'all in one place, completely free',
    'home.hero.subtitle.3':          '.',
    'home.cta.start_free':           'Start Free',
    'home.cta.try_dna':              'Try Career DNA',
    'home.hero.trust.title':         'Thousands of students',
    'home.hero.trust.subtitle':      'signed up and benefited',

    // Floating cards on hero
    'home.float.quiz.label':         'Daily quiz',
    'home.float.quiz.value':         '8/10 correct',
    'home.float.scholarship.label':  'New scholarship',
    'home.float.scholarship.value':  '$15K AUB',
    'home.float.xp.label':           "Today's XP",
    'home.float.xp.value':           '+125 pts',
    'home.float.dna.label':          'Career DNA',
    'home.float.dna.value':          'Inspiring Leader',

    // Stats
    'home.stat.universities':        'accredited universities',
    'home.stat.majors':              'university majors',
    'home.stat.scholarships':        'scholarships',
    'home.stat.tools':                'learning tools',

    // Partner strip
    'home.partners.heading':         "🤝 Featuring Lebanon's top universities",

    // Features section
    'home.features.badge':           '✨ Everything at your fingertips',
    'home.features.title':           'Tools you actually need',
    'home.features.subtitle':        'From picking a major to building your CV — Masarak is with you at every step',
    'home.features.open':            'Open',
    // Feature cards
    'home.feat.universities.t':      'Universities',
    'home.feat.universities.d':      'Complete guide to 35 accredited universities, officially ranked',
    'home.feat.majors.t':            'Majors',
    'home.feat.majors.d':            'Explore majors and how they connect to the job market',
    'home.feat.scholarships.t':      'Scholarships',
    'home.feat.scholarships.d':      'Scholarships across Lebanon and around the world',
    'home.feat.careers.t':           'Career Paths',
    'home.feat.careers.d':           'Discover careers of the future and what they require',
    'home.feat.schools.t':           'Schools',
    'home.feat.schools.d':           'A guide to high schools in Lebanon',
    'home.feat.vocational.t':        'Vocational',
    'home.feat.vocational.d':        'Specialized technical certificates and programs',
    'home.feat.quiz.t':              'Daily Quiz',
    'home.feat.quiz.d':              'Test yourself every day and earn XP',
    'home.feat.dna.t':               'Career DNA',
    'home.feat.dna.d':               'Discover your career personality and the right path for you',
    'home.feat.cv.t':                'CV Builder',
    'home.feat.cv.d':                'Build a professional CV with AI Improve',

    // How it works
    'home.how.badge':                '🎯 How Masarak works',
    'home.how.title':                '3 simple steps',
    'home.how.subtitle':             'From sign-up to decision — a simple, enjoyable journey',
    'home.how.s1.t':                 'Sign up free',
    'home.how.s1.d':                 'Create your account in 30 seconds and fill in your academic info',
    'home.how.s2.t':                 'Discover yourself',
    'home.how.s2.d':                 'Take the Career DNA test to find the right path for you',
    'home.how.s3.t':                 'Make your decision',
    'home.how.s3.d':                 'Compare universities, apply for scholarships, and build your CV',

    // Audiences
    'home.audiences.badge':          '👥 For everyone',
    'home.audiences.title':          'Who benefits from Masarak?',
    'home.audiences.subtitle':       'Tailored resources for every stage of the education journey',
    'home.audiences.cta':            'Explore',
    'home.audiences.students.t':     'For Students',
    'home.audiences.students.d':     'Everything you need to make your study decision with confidence',
    'home.audiences.students.badge': 'Most popular',
    'home.audiences.parents.t':      'For Parents',
    'home.audiences.parents.d':      "Follow your children's academic decisions",
    'home.audiences.schools.t':      'For Schools',
    'home.audiences.schools.d':      'Tools to guide your students through their university journey',
    'home.audiences.unis.t':         'For Universities',
    'home.audiences.unis.d':         'Connect with the best candidates',
    'home.audiences.unis.badge':     'B2B',

    // DNA spotlight
    'home.dna.badge':                '🧬 Most popular feature',
    'home.dna.title':                'Discover your Career DNA',
    'home.dna.subtitle':             'A 10-minute test that reveals your personality, strengths, and the career paths that suit you best.',
    'home.dna.cta':                  'Start the test now',
    'home.dna.preview.title':        'The Inspiring Leader',
    'home.dna.preview.match':        'ENFJ — 94% match',
    'home.dna.preview.paths_label':  'Suggested paths:',
    'home.dna.preview.path1':        'Business',
    'home.dna.preview.path2':        'Education',
    'home.dna.preview.path3':        'Media',

    // Why
    'home.why.badge':                '💎 Why Masarak',
    'home.why.title':                'Built with craft',
    'home.why.subtitle':             'Principles and values the platform is built on, to serve you',
    'home.why.curated.t':            'Curated content',
    'home.why.curated.d':            'Data refreshed monthly from official sources',
    'home.why.tech.t':               'Advanced tech',
    'home.why.tech.d':               'Smart AI suggests what fits you based on your profile',
    'home.why.community.t':          'Community-driven',
    'home.why.community.d':          'Serving Arab students — free and ad-free',
    'home.why.privacy.t':            'Full privacy',
    'home.why.privacy.d':            'Your data is stored and encrypted on Supabase',
    'home.why.practical.t':          'Practical guidance',
    'home.why.practical.d':          "Not just info — tools that get you to your goal",
    'home.why.values.t':             'Values-driven',
    'home.why.values.d':             'We place the student and family at the center of every decision',

    // Testimonial
    'home.testimonial.badge':        '💬 Student voices',
    'home.testimonial.title':        "We heard from those who've tried us",
    'home.testimonial.quote.1':      'Masarak helped me choose my university with confidence — today I study medicine at AUB.',
    'home.testimonial.quote.2':      "A platform every student should use.",
    'home.testimonial.author':       'Sarah K.',
    'home.testimonial.role':         'Medical Student — Year 2 · AUB',

    // Final CTA
    'home.cta.title':                'Ready to start your journey?',
    'home.cta.subtitle':             "Sign up free in 30 seconds and unlock all of Masarak's tools",
    'home.cta.learn_more':           'Learn more about us',
    'home.cta.note':                 '🎁 No credit card · No subscription · Completely free',

    // — Login page —
    'login.visual.greet.1':          'Welcome',
    'login.visual.greet.2':          'back!',
    'login.visual.subtitle':         "Sign in to continue your educational journey and unlock all of Masarak's features",
    'login.visual.stat.unis':        'universities',
    'login.visual.stat.majors':      'majors',
    'login.visual.stat.tools':       'tools',
    'login.title':                   'Welcome back 👋',
    'login.subtitle':                'Sign in to continue your journey',
    'login.google':                  'Sign in with Google',
    'login.or_email':                'or with email',
    'login.email_label':             '📧 Email address',
    'login.email_placeholder':       'example@email.com',
    'login.password_label':          '🔒 Password',
    'login.password_placeholder':    '••••••••',
    'login.forgot':                  'Forgot it?',
    'login.submit':                  'Sign in →',
    'login.submitting':              'Signing in...',
    'login.error.invalid':           'Incorrect email or password',
    'login.no_account':              "Don't have an account?",
    'login.create_account':          'Create one free',

    // — Register page —
    'register.visual.greet.1':       'Start your journey',
    'register.visual.greet.2':       'with us!',
    'register.visual.subtitle':      'Join thousands of students who use Masarak daily to make their decisions',
    'register.visual.benefit.1':     'Free access to all tools',
    'register.visual.benefit.2':     'Full Career DNA test',
    'register.visual.benefit.3':     'Guide to 35 universities & 150+ scholarships',
    'register.visual.benefit.4':     'Build a professional CV',
    'register.title':                'Create your free account 🚀',
    'register.subtitle':             'Join thousands of students on the platform',
    'register.who_are_you':          'Who are you?',
    'register.role.student':         'Student',
    'register.role.student.desc':    "I'm looking for a university/major",
    'register.role.parent':          'Parent',
    'register.role.parent.desc':     "I'm following my child's journey",
    'register.role.school':          'School',
    'register.role.school.desc':     'Partnership only',
    'register.role.university':      'University',
    'register.role.university.desc': 'Partnership only',
    'register.role.partnership':     '🤝 Partnership',
    'register.partnership_note':     '🔒 Schools and universities are partnership-only — click the card to see details',
    'register.continue_google':      'Continue with Google',
    'register.continue_email':       'Continue with email →',
    'register.back':                 '← Back',
    'register.name_label':           '👤 Full Name',
    'register.name_placeholder':     'Mohammad Ahmad',
    'register.email_label':          '📧 Email Address',
    'register.email_placeholder':    'example@email.com',
    'register.password_label':       '🔒 Password',
    'register.password_placeholder': 'At least 8 characters',
    'register.submit':               'Create free account 🚀',
    'register.submitting':           'Creating...',
    'register.terms.1':              'By creating an account, you agree to the',
    'register.terms.link':           'Terms',
    'register.terms.and':            'and',
    'register.privacy.link':         'Privacy Policy',
    'register.have_account':         'Already have an account?',
    'register.sign_in':              'Sign in',

    // — About page —
    'about.hero.badge':              '🤝 An initiative serving students',
    'about.hero.title.1':            'About',
    'about.hero.title.2':            'Masarak',
    'about.hero.subtitle':           'We believe every student deserves a fair chance to discover their academic and career path, regardless of background or geography.',
    'about.mission.title':           'Our Mission',
    'about.mission.body':            'Empower students to make informed educational and career decisions through reliable information, practical tools, and accessible guidance for all.',
    'about.vision.title':            'Our Vision',
    'about.vision.body':             'A world where every student gets the right information at the right time, and builds their future with confidence on a solid foundation of knowledge and guidance.',
    'about.values.title':            'Our Core Values',
    'about.values.credibility.t':    'Credibility',
    'about.values.credibility.d':    'Every piece of info is verified from official sources and updated regularly',
    'about.values.utility.t':        'Utility',
    'about.values.utility.d':        'We focus on tools and content that make a real difference',
    'about.values.fairness.t':       'Fairness',
    'about.values.fairness.d':       'We serve every student regardless of background or region',
    'about.values.privacy.t':        'Privacy',
    'about.values.privacy.d':        "Your data belongs to you — we don't sell it or share it with anyone",
    'about.values.neutrality.t':     'Neutrality',
    'about.values.neutrality.d':     "We don't promote one university over another — we present information as it is",
    'about.values.growth.t':         'Continuous Improvement',
    'about.values.growth.d':         'We continuously evolve the platform based on student feedback',
    'about.offer.title':             'What does Masarak offer?',
    'about.offer.1':                 'A comprehensive guide to universities in the Arab region and the world',
    'about.offer.2':                 'A database of available scholarships',
    'about.offer.3':                 'Academic majors with thorough explanations of each',
    'about.offer.4':                 'Interactive tools: cost calculator, strengths test, CV builder',
    'about.offer.5':                 'A smart career advisor that answers your questions',
    'about.offer.6':                 'A directory of high schools and vocational institutes',
    'about.offer.7':                 'An educational blog with guidance articles',
    'about.offer.8':                 'Pages for parents, schools, and universities',
    'about.cta.title':               'Join our journey',
    'about.cta.subtitle':            "Masarak is constantly evolving. Sign up and start your educational and career journey, or get in touch if you'd like to contribute or partner.",
    'about.cta.start':               'Start now',
    'about.cta.contact':             'Contact us',

    // — Contact page —
    'contact.back':                  '← Back',
    'contact.title':                 '📞 Contact us',
    'contact.subtitle':              "We'd love to hear from you! Pick the channel that fits.",
    'contact.channel.general.t':     'General email',
    'contact.channel.general.d':     'For questions and general inquiries',
    'contact.channel.partners.t':    'Partnerships',
    'contact.channel.partners.d':    'For schools, universities, and companies',
    'contact.channel.support.t':     'Tech Support',
    'contact.channel.support.d':     "If there's an issue with the site or your account",
    'contact.channel.press.t':       'Press & Media',
    'contact.channel.press.d':       'For interviews and comment requests',
    'contact.info.title':            '📍 More info',
    'contact.info.location':         'Location:',
    'contact.info.location.value':   'Lebanon 🇱🇧',
    'contact.info.email':            'Email:',
    'contact.info.response':         'Response time:',
    'contact.info.response.value':   'Within 48 hours (business days)',
    'contact.info.languages':        'Languages:',
    'contact.info.languages.value':  'Arabic and English',
    'contact.help.title':            '⚡ What can we help with?',
    'contact.help.1':                'Adding a scholarship, internship, or opportunity to the site',
    'contact.help.2':                'Suggesting new features',
    'contact.help.3':                'Reporting an error or inaccurate info',
    'contact.help.4':                'Joining as a partner school or university',
    'contact.help.5':                'Press and interview requests',

    // — FAQ page —
    'faq.back':                      '← Back',
    'faq.title':                     '❓ Frequently Asked Questions',
    'faq.subtitle':                  'Quick answers to the most common questions',
    'faq.q1':                        'Is Masarak free?',
    'faq.a1':                        'Yes, Masarak is currently free for students. Premium features will be available later, while keeping core features free.',
    'faq.q2':                        'Who is Masarak for?',
    'faq.a2':                        'Masarak is for Lebanese students from middle school (age 12) through post-graduation, as well as for parents, schools, and universities.',
    'faq.q3':                        'How do I figure out which major suits me?',
    'faq.a3':                        'Start with the Career DNA and Skill Strengths quizzes to discover your strengths. Then browse the majors page.',
    'faq.q4':                        'Is my data protected?',
    'faq.a4':                        "Yes. We use TLS encryption, Row Level Security on the database, and we don't sell your data. Read our Privacy Policy for details.",
    'faq.q5':                        'How is my data saved?',
    'faq.a5':                        'After signing up, all your data is saved automatically to your account. Tools used without signing in save to your browser (localStorage).',
    'faq.q6':                        'Are you an officially accredited platform from universities?',
    'faq.a6':                        "We're an independent platform that compiles information from official sources. For 100% verified info, contact the university directly.",
    'faq.q7':                        'Can I use Masarak if I live outside Lebanon?',
    'faq.a7':                        'Yes! The platform is available globally, especially for the Lebanese diaspora. All content is in Arabic and English.',
    'faq.q8':                        "Why do some scholarships show 'closed'?",
    'faq.a8':                        'Scholarships open during specific windows each year. Sign in to get alerts when scholarships that match you open.',
    'faq.q9':                        'Do you have a mobile app?',
    'faq.a9':                        "Masarak works great on mobile and you can add it to your home screen as a PWA. A standalone app is in development.",
    'faq.q10':                       'How can I reach you?',
    'faq.a10':                       'Email us at support@masaraklb.com or visit the Contact page. We usually reply within 48 hours.',
    'faq.more.title':                "Question not here?",
    'faq.more.subtitle':             'Email us directly and we reply within 48 hours',
    'faq.more.cta':                  'Contact us →',
  },
} as const;

// ─── Types derived from messages ──────────────────────────────────────────────
export type TranslationKey = keyof typeof messages.ar;

// ─── Context ──────────────────────────────────────────────────────────────────
interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
  dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextValue | null>(null);

// Reads stored preference synchronously when possible (avoids hydration flash)
function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'ar';
  try {
    const v = window.localStorage.getItem('masarak-lang');
    return v === 'en' || v === 'ar' ? v : 'ar';
  } catch {
    return 'ar';
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar');

  // Read stored preference once on mount (avoid SSR mismatch by starting Arabic)
  useEffect(() => {
    const stored = readStoredLocale();
    if (stored !== locale) setLocaleState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync <html> attributes with the active locale
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem('masarak-lang', l);
    } catch {
      /* ignore quota / privacy errors */
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => {
      const dict = messages[locale] as Record<string, string>;
      const fallback = messages.ar as Record<string, string>;
      return dict[key] ?? fallback[key] ?? key;
    },
    [locale],
  );

  const value: I18nContextValue = {
    locale,
    setLocale,
    t,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Graceful fallback if a component is rendered outside the provider
    // (e.g. during SSR before hydration of the provider boundary).
    return {
      locale: 'ar',
      setLocale: () => {},
      t: (key: TranslationKey) => (messages.ar as Record<string, string>)[key] ?? key,
      dir: 'rtl',
    };
  }
  return ctx;
}

// Convenience hook returning just the translator function
export function useT() {
  return useI18n().t;
}
