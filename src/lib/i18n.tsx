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
