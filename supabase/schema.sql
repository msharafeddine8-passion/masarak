-- ═══════════════════════════════════════════════
--  MASARAK DATABASE SCHEMA
-- ═══════════════════════════════════════════════

-- 1. UNIVERSITIES
create table if not exists universities (
  id          bigserial primary key,
  name        text not null,
  region      text not null,
  type        text not null default 'خاصة',
  rank        text,
  tuition     text,
  lang        text,
  url         text,
  description text,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- 2. INSTITUTES
create table if not exists institutes (
  id          bigserial primary key,
  name        text not null,
  region      text not null,
  type        text not null,
  tuition     text,
  lang        text,
  url         text,
  description text,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- 3. SCHOOLS
create table if not exists schools (
  id          bigserial primary key,
  name        text not null,
  region      text not null,
  type        text not null default 'خاصة',
  system      text,
  levels      text[],
  lang        text,
  description text,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- 4. SCHOLARSHIPS
create table if not exists scholarships (
  id           bigserial primary key,
  name         text not null,
  provider     text,
  amount       text,
  deadline     text,
  type         text,
  region       text,
  field        text,
  requirements text,
  url          text,
  description  text,
  active       boolean default true,
  created_at   timestamptz default now()
);

-- 5. BLOG POSTS
create table if not exists blog_posts (
  id          bigserial primary key,
  title       text not null,
  slug        text unique not null,
  excerpt     text,
  content     text,
  author      text default 'فريق مسارك',
  category    text,
  cover_image text,
  published   boolean default false,
  created_at  timestamptz default now()
);

-- 6. USER PROFILES
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       text default 'student',
  school     text,
  major      text,
  region     text,
  phone      text,
  created_at timestamptz default now()
);

-- Disable RLS for now (enable later with proper policies)
alter table universities  disable row level security;
alter table institutes    disable row level security;
alter table schools       disable row level security;
alter table scholarships  disable row level security;
alter table blog_posts    disable row level security;
alter table profiles      disable row level security;

-- ═══════════════════════════════════════════════
--  SEED DATA — UNIVERSITIES
-- ═══════════════════════════════════════════════
insert into universities (name, region, type, rank, tuition, lang, url, description) values
('الجامعة الأمريكية في بيروت – AUB',          'بيروت',          'خاصة',   '⭐⭐⭐⭐⭐', '16,000–22,000$', 'إنجليزي',       'https://www.aub.edu.lb',       'أعرق جامعة في لبنان والشرق الأوسط، تأسست 1866. تقدّم برامج بكالوريوس وماجستير ودكتوراه في كل التخصصات.'),
('الجامعة اللبنانية الأمريكية – LAU',          'بيروت وبيبلوس', 'خاصة',   '⭐⭐⭐⭐⭐', '12,000–18,000$', 'إنجليزي',       'https://www.lau.edu.lb',       'جامعة مرموقة بحرمين في بيروت وبيبلوس، متميزة في الأعمال والهندسة والصحة والعلوم الإنسانية.'),
('جامعة القديس يوسف – USJ',                    'بيروت وفروع',   'خاصة',   '⭐⭐⭐⭐⭐', '4,000–10,000$',  'فرنسي/عربي',   'https://www.usj.edu.lb',       'جامعة يسوعية تأسست 1875، رائدة في الطب والقانون والعلوم السياسية والآداب بالمنهج الفرنسي.'),
('الجامعة اللبنانية – UL',                     'كل لبنان',      'حكومية', '⭐⭐⭐⭐',  'مجانية/رمزية',   'عربي/فرنسي',   'https://www.ul.edu.lb',        'الجامعة الوطنية الحكومية الوحيدة، تضم أكثر من 80,000 طالب في فروع منتشرة في كل المناطق.'),
('جامعة الروح القدس – USEK',                   'جبل لبنان',     'خاصة',   '⭐⭐⭐⭐',  '5,000–9,000$',   'فرنسي/عربي',   'https://www.usek.edu.lb',      'جامعة مارونية في الكسليك، متميزة في الفنون والموسيقى والعمارة والإعلام والعلوم.'),
('جامعة البلمند – UOB',                        'الشمال',        'خاصة',   '⭐⭐⭐⭐',  '5,500–9,000$',   'إنجليزي',       'https://www.balamand.edu.lb',  'جامعة أرثوذكسية في البلمند، قوية في الطب والهندسة والفنون المعمارية والعلوم الإنسانية.'),
('جامعة الآداب والعلوم الإنسانية – NDU',       'جبل لبنان',     'خاصة',   '⭐⭐⭐⭐',  '5,000–8,500$',   'إنجليزي',       'https://www.ndu.edu.lb',       'جامعة مارونية في لويزة، متميزة في العلوم والهندسة والأعمال والإعلام والدراسات الدينية.'),
('كلية إدارة الأعمال – ESA',                   'بيروت',         'خاصة',   '⭐⭐⭐⭐⭐', '12,000–20,000$', 'فرنسي/إنجليزي', 'https://www.esa.edu.lb',       'أفضل كلية إدارة أعمال في لبنان والشرق الأوسط، شراكة مع HEC Paris، برامج MBA بمستوى عالمي.'),
('الأكاديمية اللبنانية للفنون الجميلة – ALBA', 'بيروت',         'خاصة',   '⭐⭐⭐⭐',  '5,000–8,000$',   'فرنسي',         'https://www.alba.edu.lb',      'مدرسة الفنون الجميلة الأرقى في لبنان، متخصصة في الفنون البصرية والعمارة والتصميم.'),
('جامعة هايكازيان – HU',                       'بيروت',         'خاصة',   '⭐⭐⭐',   '4,000–7,000$',   'إنجليزي',       'https://www.haigazian.edu.lb', 'جامعة أرمنية بروتستانتية في بيروت، متميزة في الآداب والعلوم الإنسانية والتربية.'),
('الجامعة الإسلامية في لبنان – IUL',           'البقاع',        'خاصة',   '⭐⭐⭐',   '2,500–5,000$',   'عربي',          'https://www.iul.edu.lb',       'جامعة إسلامية بفروع متعددة، تقدّم برامج في الشريعة والأعمال والتربية والعلوم الاجتماعية.'),
('الجامعة اللبنانية الدولية – LIU',            'بيروت وفروع',   'خاصة',   '⭐⭐⭐',   '3,000–6,000$',   'عربي/إنجليزي', 'https://www.liu.edu.lb',       'جامعة إسلامية خاصة بفروع في أنحاء لبنان، تركّز على الطب والصيدلة والهندسة والتكنولوجيا.'),
('جامعة الأنطونية – UA',                       'بيروت وفروع',   'خاصة',   '⭐⭐⭐',   '3,000–6,000$',   'فرنسي/عربي',   'https://www.ua.edu.lb',        'جامعة كاثوليكية أنطونية، متميزة في الطب والصيدلة والحقوق والعلوم الإنسانية.'),
('جامعة المشرق – MFU',                         'جبل لبنان',     'خاصة',   '⭐⭐⭐',   '3,500–7,000$',   'فرنسي/عربي',   'https://www.mfu.edu.lb',       'جامعة كاثوليكية في بكاسين، برامج طبية وهندسية وإنسانية بجودة جيدة.'),
('الجامعة المفتوحة في لبنان – OUL',            'بيروت',         'خاصة',   '⭐⭐⭐',   '1,500–4,000$',   'عربي',          null,                           'تعليم مفتوح وعن بُعد بتكاليف مخفضة، مناسبة للموظفين والطلاب من ذوي الإمكانيات المحدودة.')
on conflict do nothing;

-- ═══════════════════════════════════════════════
--  SEED DATA — SCHOLARSHIPS
-- ═══════════════════════════════════════════════
insert into scholarships (name, provider, amount, deadline, type, region, field, requirements, url, description) values
('منحة AUB الكاملة', 'الجامعة الأمريكية في بيروت', 'تغطية كاملة', 'مارس سنوياً', 'أكاديمية', 'لبنان', 'كل التخصصات', 'معدل 90%+، نشاطات لامنهجية', 'https://www.aub.edu.lb/scholarships', 'أرقى منحة جامعية في لبنان، تشمل الرسوم والسكن ومصاريف المعيشة كاملاً.'),
('منحة Hariri Foundation', 'مؤسسة الحريري', 'حتى 15,000$', 'يناير سنوياً', 'مالية', 'لبنان', 'كل التخصصات', 'لبناني الجنسية، معدل 85%+', 'https://www.hariri-foundation.org', 'منحة للطلاب اللبنانيين المتفوقين، تُغطي جزءاً كبيراً من رسوم الجامعة.'),
('منحة LAU المتميزة', 'الجامعة اللبنانية الأمريكية', 'تخفيض 50-100%', 'فبراير سنوياً', 'أكاديمية', 'لبنان', 'كل التخصصات', 'معدل 88%+', 'https://www.lau.edu.lb/scholarships', 'منح تقديرية للطلاب المتفوقين في LAU تتراوح بين 50-100% من الرسوم.'),
('منحة USAID للشباب اللبناني', 'USAID', 'كاملة + بدل معيشة', 'أبريل سنوياً', 'دولية', 'لبنان', 'العلوم والتكنولوجيا والهندسة', 'معدل 85%+، إنجليزي متقدم', 'https://www.usaid.gov', 'برنامج أمريكي لدعم الشباب اللبناني في تخصصات STEM.'),
('منحة الحكومة الفرنسية – Campus France', 'السفارة الفرنسية', 'تغطية كاملة للدراسة في فرنسا', 'ديسمبر سنوياً', 'دولية', 'فرنسا', 'كل التخصصات', 'إجادة الفرنسية، معدل 80%+', 'https://www.campusfrance.org', 'منح للدراسة في الجامعات الفرنسية، تشمل الرسوم ومبلغاً شهرياً.'),
('منحة الجامعة الألمانية DAAD', 'DAAD', 'مبلغ شهري + رسوم', 'أكتوبر سنوياً', 'دولية', 'ألمانيا', 'العلوم والهندسة', 'معدل 80%+، ألماني أو إنجليزي', 'https://www.daad.de', 'أبرز برنامج منح ألماني، يُتيح الدراسة في أفضل الجامعات الألمانية.'),
('منحة USJ الاجتماعية', 'جامعة القديس يوسف', 'تخفيض 30-70%', 'سبتمبر سنوياً', 'اجتماعية', 'لبنان', 'كل التخصصات', 'وضع مالي صعب + معدل مقبول', 'https://www.usj.edu.lb', 'منحة للطلاب من ذوي الدخل المحدود، تُغطي جزءاً من الرسوم الدراسية.'),
('منحة الملك عبدالله للتميز', 'مؤسسة الملك عبدالله', 'كاملة', 'مارس سنوياً', 'دولية', 'السعودية وعدة دول', 'كل التخصصات', 'معدل 90%+، تفوق أكاديمي', 'https://www.kaust.edu.sa', 'برنامج منح مرموق للطلاب العرب المتفوقين للدراسة في جامعات عالمية.')
on conflict do nothing;

-- ═══════════════════════════════════════════════
--  SEED DATA — BLOG POSTS
-- ═══════════════════════════════════════════════
insert into blog_posts (title, slug, excerpt, content, category, published) values
('كيف تختار تخصصك الجامعي في لبنان؟', 'how-to-choose-major', 'دليل شامل لمساعدتك على اتخاذ القرار الأصح لمستقبلك المهني.', 'اختيار التخصص من أهم القرارات في حياتك. في هذا المقال نرشدك خطوة بخطوة...', 'إرشاد أكاديمي', true),
('أفضل 5 جامعات في لبنان لعام 2026', 'top-5-universities-2026', 'مقارنة شاملة بين أبرز الجامعات اللبنانية من حيث الجودة والتكلفة والسمعة.', 'يتساءل كثير من الطلاب عن أفضل الجامعات اللبنانية...', 'جامعات', true),
('كيف تكتب CV يفوز بالوظيفة؟', 'how-to-write-cv', 'نصائح عملية من خبراء التوظيف لبناء سيرة ذاتية احترافية تلفت الانتباه.', 'السيرة الذاتية هي أول انطباع عنك لدى صاحب العمل...', 'مهارات مهنية', true)
on conflict do nothing;

