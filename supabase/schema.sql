-- ═══════════════════════════════════════════════
--  MASARAK DATABASE SCHEMA  (v2 — May 2026)
-- ═══════════════════════════════════════════════
-- Run this in:
-- https://supabase.com/dashboard/project/cxctwvqqnpvoebpelkle/sql/new

-- ───────────────────────────────────────────────
-- 1. UNIVERSITIES
-- ───────────────────────────────────────────────
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

-- ───────────────────────────────────────────────
-- 2. SCHOLARSHIPS
-- ───────────────────────────────────────────────
create table if not exists scholarships (
  id          bigserial primary key,
  name        text not null,
  org         text,
  amount      text,
  deadline    text,
  type        text default 'need',
  fields      text[],
  region      text default 'all',
  min_gpa     integer default 0,
  description text,
  url         text,
  emoji       text default '🏆',
  tag         text,
  tag_color   text default 'bg-blue-100 text-blue-700',
  active      boolean default true,
  created_at  timestamptz default now()
);

-- ───────────────────────────────────────────────
-- 3. BLOG POSTS
-- ───────────────────────────────────────────────
create table if not exists blog_posts (
  id           bigserial primary key,
  title        text not null,
  slug         text unique not null,
  excerpt      text,
  content      text,
  category     text default 'عام',
  emoji        text default '📰',
  read_time    text default '5 دقائق',
  featured     boolean default false,
  active       boolean default true,
  published_at date default current_date,
  created_at   timestamptz default now()
);

-- ───────────────────────────────────────────────
-- 4. USER PROFILES
-- ───────────────────────────────────────────────
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

-- ───────────────────────────────────────────────
-- Disable RLS (enable later with proper policies)
-- ───────────────────────────────────────────────
alter table universities  disable row level security;
alter table scholarships  disable row level security;
alter table blog_posts    disable row level security;
alter table profiles      disable row level security;

-- ═══════════════════════════════════════════════
--  SEED DATA — UNIVERSITIES  (15 rows)
-- ═══════════════════════════════════════════════
insert into universities (name, region, type, rank, tuition, lang, url, description) values
('الجامعة الأمريكية في بيروت – AUB',          'بيروت',          'خاصة',   '⭐⭐⭐⭐⭐', '16,000–22,000$',  'إنجليزي',        'https://www.aub.edu.lb',      'أعرق جامعة في لبنان والشرق الأوسط، تأسست 1866.'),
('الجامعة اللبنانية الأمريكية – LAU',          'بيروت وبيبلوس', 'خاصة',   '⭐⭐⭐⭐⭐', '12,000–18,000$',  'إنجليزي',        'https://www.lau.edu.lb',      'جامعة مرموقة بحرمين، متميزة في الأعمال والهندسة والصحة.'),
('جامعة القديس يوسف – USJ',                    'بيروت وفروع',   'خاصة',   '⭐⭐⭐⭐⭐', '4,000–10,000$',   'فرنسي/عربي',    'https://www.usj.edu.lb',      'جامعة يسوعية تأسست 1875، رائدة في الطب والقانون.'),
('الجامعة اللبنانية – UL',                     'كل لبنان',      'حكومية', '⭐⭐⭐⭐',  'مجانية/رمزية',    'عربي/فرنسي',    'https://www.ul.edu.lb',       'الجامعة الوطنية الحكومية، تضم أكثر من 80,000 طالب.'),
('جامعة الروح القدس – USEK',                   'جبل لبنان',     'خاصة',   '⭐⭐⭐⭐',  '5,000–9,000$',    'فرنسي/عربي',    'https://www.usek.edu.lb',     'جامعة مارونية في الكسليك، متميزة في الفنون والموسيقى والعمارة.'),
('جامعة البلمند – UOB',                        'الشمال',        'خاصة',   '⭐⭐⭐⭐',  '5,500–9,000$',    'إنجليزي',        'https://www.balamand.edu.lb', 'جامعة أرثوذكسية قوية في الطب والهندسة والفنون المعمارية.'),
('جامعة سيدة اللويزة – NDU',                   'جبل لبنان',     'خاصة',   '⭐⭐⭐⭐',  '5,000–8,500$',    'إنجليزي',        'https://www.ndu.edu.lb',      'جامعة مارونية متميزة في العلوم والهندسة والأعمال والإعلام.'),
('كلية إدارة الأعمال – ESA',                   'بيروت',         'خاصة',   '⭐⭐⭐⭐⭐', '12,000–20,000$',  'فرنسي/إنجليزي', 'https://www.esa.edu.lb',      'أفضل كلية إدارة أعمال في لبنان، شراكة مع HEC Paris.'),
('الأكاديمية اللبنانية للفنون الجميلة – ALBA', 'بيروت',         'خاصة',   '⭐⭐⭐⭐',  '5,000–8,000$',    'فرنسي',          'https://www.alba.edu.lb',     'مدرسة الفنون الجميلة الأرقى، متخصصة في الفنون البصرية والعمارة.'),
('جامعة هايكازيان – HU',                       'بيروت',         'خاصة',   '⭐⭐⭐',   '4,000–7,000$',    'إنجليزي',        'https://www.haigazian.edu.lb','جامعة أرمنية بروتستانتية متميزة في الآداب والعلوم الإنسانية.'),
('الجامعة الإسلامية في لبنان – IUL',           'البقاع',        'خاصة',   '⭐⭐⭐',   '2,500–5,000$',    'عربي',           'https://www.iul.edu.lb',      'جامعة إسلامية بفروع متعددة في الشريعة والأعمال والتربية.'),
('الجامعة اللبنانية الدولية – LIU',            'بيروت وفروع',   'خاصة',   '⭐⭐⭐',   '3,000–6,000$',    'عربي/إنجليزي',  'https://www.liu.edu.lb',      'جامعة خاصة بفروع في لبنان، تركّز على الطب والصيدلة والهندسة.'),
('جامعة الأنطونية – UA',                       'بيروت وفروع',   'خاصة',   '⭐⭐⭐',   '3,000–6,000$',    'فرنسي/عربي',    'https://www.ua.edu.lb',       'جامعة كاثوليكية أنطونية، متميزة في الطب والصيدلة والحقوق.'),
('جامعة المشرق – MFU',                         'جبل لبنان',     'خاصة',   '⭐⭐⭐',   '3,500–7,000$',    'فرنسي/عربي',    'https://www.mfu.edu.lb',      'جامعة كاثوليكية في بكاسين، برامج طبية وهندسية وإنسانية.'),
('الجامعة المفتوحة في لبنان – OUL',            'بيروت',         'خاصة',   '⭐⭐⭐',   '1,500–4,000$',    'عربي',           null,                          'تعليم مفتوح وعن بُعد بتكاليف مخفضة، مناسبة للموظفين.')
on conflict do nothing;

-- ═══════════════════════════════════════════════
--  SEED DATA — SCHOLARSHIPS  (8 rows)
-- ═══════════════════════════════════════════════
insert into scholarships (name, org, amount, deadline, type, fields, region, min_gpa, description, url, emoji, tag, tag_color) values
('منحة الجامعة الأمريكية في بيروت AUB',    'AUB',              'تغطية كاملة',    '31 مارس 2026',      'need',    '{جميع التخصصات}',                           'all', 80, 'منحة شاملة تغطي الرسوم الدراسية والإقامة لأبرز الطلاب المحتاجين مالياً',   'https://www.aub.edu.lb',  '🏛️', 'تغطية كاملة',       'bg-green-100 text-green-700'),
('منحة الجامعة اللبنانية الأمريكية LAU',   'LAU',              '50% من الرسوم',  '15 أبريل 2026',     'merit',   '{الهندسة,التجارة,الفنون}',                  'all', 85, 'منح الجدارة للطلاب المتميزين في الدراسة الثانوية',                         'https://www.lau.edu.lb',  '🎓', 'جدارة',             'bg-blue-100 text-blue-700'),
('منحة مؤسسة رفيق الحريري',                'مؤسسة الحريري',    '2,500$ سنوياً',  '28 فبراير 2026',    'need',    '{الطب,الهندسة,العلوم}',                     'all', 75, 'دعم مالي للطلاب اللبنانيين المتفوقين من الأسر المحدودة الدخل',             '#',                       '🌟', 'دعم مالي',          'bg-amber-100 text-amber-700'),
('منحة الجامعة اليسوعية USJ',              'USJ',              '30% - 70%',      '1 مايو 2026',       'mixed',   '{الحقوق,الطب,الإنسانيات}',                  'all', 78, 'برنامج دعم متعدد المستويات للطلاب المتميزين والمحتاجين',                   'https://www.usj.edu.lb',  '⚖️', 'متعدد المستويات',   'bg-purple-100 text-purple-700'),
('منحة USEK الجامعة الروح القدس',          'USEK',             '25% - 50%',      '30 أبريل 2026',     'merit',   '{الهندسة,العلوم,الآداب}',                   'الشمال', 80, 'منح الجدارة للطلاب المتميزين في الشمال',                              'https://www.usek.edu.lb', '📚', 'جدارة',             'bg-blue-100 text-blue-700'),
('منحة البنك الدولي للتعليم في لبنان',     'البنك الدولي',     '3,000$ سنوياً',  '15 يونيو 2026',     'need',    '{الاقتصاد,العلوم الاجتماعية}',              'all', 70, 'منحة دولية تدعم التعليم العالي في لبنان للأسر المتضررة',                  '#',                       '🌍', 'دولية',             'bg-teal-100 text-teal-700'),
('منحة الجامعة اللبنانية LU',             'الجامعة اللبنانية', 'إعفاء كامل',     '30 سبتمبر 2026',    'merit',   '{جميع التخصصات}',                           'all', 85, 'إعفاء كامل من الرسوم للطلاب الأوائل على الثانوية العامة',                 'https://www.ul.edu.lb',   '🏅', 'إعفاء كامل',        'bg-green-100 text-green-700'),
('منحة Teach For Lebanon',                 'TFL',              '1,500$ + تدريب', '31 مارس 2026',      'program', '{التربية والتعليم,العلوم الاجتماعية}',       'all', 75, 'برنامج للطلاب المهتمين بالتعليم ودعم المجتمعات المحلية',                  '#',                       '📖', 'برنامج',            'bg-orange-100 text-orange-700')
on conflict do nothing;

-- ═══════════════════════════════════════════════
--  SEED DATA — BLOG POSTS  (3 rows)
-- ═══════════════════════════════════════════════
insert into blog_posts (title, slug, excerpt, category, emoji, read_time, featured, active, published_at) values
('الجامعات اللبنانية: مقارنة شاملة لمساعدتك في الاختيار',    'university-comparison', 'كيف تختار الجامعة المناسبة في لبنان؟ مقارنة معمّقة بين أبرز الجامعات اللبنانية من حيث الجودة والتكلفة والتخصصات.', 'الجامعات',   '🏛️', '8 دقائق',  true,  true, '2026-04-17'),
('كيف تستعد لسوق العمل منذ السنة الأولى في الجامعة؟',         'prepare-job-market',    'لا تنتظر حتى السنة الرابعة. إليك كيف تبدأ بناء مسيرتك المهنية من اليوم الأول في الجامعة.',                      'سوق العمل',  '💼', '6 دقائق',  true,  true, '2026-04-17'),
('مهن المستقبل في لبنان والمنطقة العربية 2025-2030',           'future-careers-2030',   'ثورة الذكاء الاصطناعي تعيد رسم خريطة المهن. اكتشف أبرز المهن التي ستنتعش.',                                     'مهن المستقبل','🚀', '10 دقائق', false, true, '2026-04-15'),
('دليلك الكامل للحصول على منحة دراسية من AUB وLAU',           'scholarships-guide',    'خطوات عملية للتقدم على أبرز المنح الدراسية في لبنان مع نصائح حصرية.',                                           'المنح الدراسية','🏆','9 دقائق', false, true, '2026-04-12'),
('العمل عن بُعد وفرص التوظيف الدولي للشباب اللبناني',         'remote-work-lebanon',   'كيف يستفيد الشباب اللبناني من العمل من بُعد للحصول على رواتب دولية؟',                                          'التوظيف الدولي','🌍','7 دقائق', true,  true, '2026-04-17')
on conflict do nothing;
