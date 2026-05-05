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

-- ═══════════════════════════════════════════════
--  DAILY CHALLENGE SYSTEM  (v1 — May 2026)
-- ═══════════════════════════════════════════════

-- ───────────────────────────────────────────────
-- 5. CHALLENGES  (question bank)
-- ───────────────────────────────────────────────
create table if not exists challenges (
  id          bigserial primary key,
  question    text not null,
  option_a    text not null,
  option_b    text not null,
  option_c    text not null,
  option_d    text not null,
  correct     char(1) not null check (correct in ('a','b','c','d')),
  category    text not null default 'general',
  difficulty  integer not null default 1 check (difficulty between 1 and 3),
  explanation text,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- ───────────────────────────────────────────────
-- 6. USER CHALLENGES  (answer history)
-- ───────────────────────────────────────────────
create table if not exists user_challenges (
  id             bigserial primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  challenge_id   bigint not null references challenges(id) on delete cascade,
  answered_date  date not null default current_date,
  is_correct     boolean not null,
  xp_earned      integer not null default 0,
  created_at     timestamptz default now(),
  unique (user_id, challenge_id, answered_date)
);

-- ───────────────────────────────────────────────
-- 7. USER STATS  (XP + streak)
-- ───────────────────────────────────────────────
create table if not exists user_stats (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  total_xp             integer not null default 0,
  current_streak       integer not null default 0,
  longest_streak       integer not null default 0,
  last_challenge_date  date,
  updated_at           timestamptz default now()
);

-- ═══════════════════════════════════════════════
--  SEED DATA — CHALLENGES  (30 questions)
-- ═══════════════════════════════════════════════
insert into challenges (question, option_a, option_b, option_c, option_d, correct, category, difficulty, explanation) values

-- CAREER (difficulty 1 — Beginner)
('What does CV stand for?',
 'Career Vision', 'Curriculum Vitae', 'Creative Value', 'Career Validation',
 'b', 'career', 1, 'CV stands for Curriculum Vitae, Latin for "course of life." It is a document summarizing your education, experience, and skills.'),

('Which section should come first in a professional CV?',
 'Hobbies', 'References', 'Contact Information & Summary', 'Work Experience',
 'c', 'career', 1, 'Contact information and a professional summary should appear first so recruiters can quickly identify you and understand your value proposition.'),

('What is the ideal length for an entry-level CV?',
 '3–4 pages', '1 page', '5+ pages', '2–3 pages',
 'b', 'career', 1, 'Entry-level candidates should aim for a 1-page CV. Recruiters spend an average of 6 seconds scanning a CV, so brevity and clarity matter.'),

('What does "networking" mean in a professional context?',
 'Setting up computer networks', 'Building professional relationships for career opportunities', 'Posting on social media', 'Sending mass emails',
 'b', 'career', 1, 'Professional networking is building and maintaining relationships that can lead to career opportunities, referrals, and mentorship.'),

('Which platform is most widely used for professional networking?',
 'Instagram', 'TikTok', 'LinkedIn', 'Twitter/X',
 'c', 'career', 1, 'LinkedIn has over 900 million members and is the primary platform for professional networking, job searching, and personal branding.'),

-- CAREER (difficulty 2 — Intermediate)
('What is the STAR method used for in job interviews?',
 'Describing technical skills', 'Structuring behavioral answers (Situation, Task, Action, Result)', 'Writing cover letters', 'Salary negotiation',
 'b', 'career', 2, 'STAR (Situation, Task, Action, Result) is a framework for answering behavioral interview questions with structured, compelling stories.'),

('What is an "ATS" in the hiring process?',
 'Annual Training Schedule', 'Applicant Tracking System', 'Automated Testing Software', 'Advanced Talent Search',
 'b', 'career', 2, 'An ATS (Applicant Tracking System) is software that scans CVs for keywords before a human reviews them. Optimizing your CV for ATS is critical.'),

('In Lebanon, which industry sector currently offers the highest average salaries?',
 'Agriculture', 'Banking and Finance', 'Retail', 'Education',
 'b', 'career', 2, 'Banking, finance, and fintech remain among the highest-paying sectors in Lebanon, along with tech and oil/gas companies operating regionally.'),

('What percentage of jobs are filled through networking, not job postings?',
 'About 10%', 'About 30%', 'About 50%', 'About 70–80%',
 'd', 'career', 2, 'Studies suggest 70–80% of jobs are filled through networking. Many positions are never advertised — they are filled through referrals and connections.'),

('What is a "cover letter"?',
 'The front page of your passport', 'A personalized letter explaining why you are the right candidate for a specific role', 'A reference letter from a professor', 'A skills test',
 'b', 'career', 2, 'A cover letter accompanies your CV and explains your motivation for the role, highlighting how your specific skills match the job requirements.'),

-- SKILLS / TECH (difficulty 2)
('Which programming language is most in demand for data science in 2024?',
 'COBOL', 'Pascal', 'Python', 'Perl',
 'c', 'skills', 2, 'Python dominates data science due to its rich ecosystem (NumPy, Pandas, TensorFlow, scikit-learn) and ease of learning.'),

('What does HTML stand for?',
 'High-Level Text Markup Language', 'HyperText Markup Language', 'Hyperlink and Text Management Language', 'Home Tool Markup Language',
 'b', 'tech', 1, 'HTML (HyperText Markup Language) is the standard language for creating web pages. It defines the structure and content of a webpage.'),

('What is "soft skill"?',
 'A programming skill', 'An interpersonal or social skill like communication and teamwork', 'A skill related to soft materials like textiles', 'A basic computer skill',
 'b', 'skills', 1, 'Soft skills are interpersonal qualities — communication, teamwork, adaptability, problem-solving. Employers consistently rank them alongside technical skills.'),

('What does "cloud computing" mean?',
 'Computing done only on rainy days', 'Delivering computing services (storage, software, servers) over the internet', 'Weather forecasting software', 'A type of gaming platform',
 'b', 'tech', 1, 'Cloud computing delivers on-demand computing resources via the internet, enabling scalability, flexibility, and cost savings. Examples: AWS, Google Cloud, Azure.'),

-- STUDY (difficulty 1)
('What is the Pomodoro Technique?',
 'An Italian cooking method', 'A time management method: 25 min work + 5 min break', 'A memorization trick using colors', 'A speed-reading method',
 'b', 'study', 1, 'The Pomodoro Technique was developed by Francesco Cirillo. 25-minute focused work sessions followed by short breaks improve focus and reduce mental fatigue.'),

('What GPA scale do most Lebanese universities use?',
 '1–5 scale', '0–100% only', '4.0 GPA scale or percentage (0–100)', 'Letter grades only (A–F)',
 'c', 'study', 1, 'Lebanese universities typically use either a 0–100 percentage scale or a 4.0 GPA system, with some using both. AUB and LAU align with the American 4.0 system.'),

('Which learning method is most effective for long-term retention?',
 'Re-reading notes repeatedly', 'Highlighting textbooks in multiple colors', 'Active recall and spaced repetition', 'Summarizing with bullet points only',
 'c', 'study', 2, 'Active recall (testing yourself) combined with spaced repetition (reviewing at increasing intervals) is scientifically proven to be the most effective study method.'),

('What is a "growth mindset"?',
 'Believing intelligence and talent are fixed at birth', 'Believing abilities can be developed through effort and learning', 'Focusing only on financial growth', 'A type of startup business model',
 'b', 'study', 1, 'Carol Dweck''s research shows people with a growth mindset — believing skills can be developed — achieve more and persist longer through challenges.'),

-- FINANCE (difficulty 2)
('What does "inflation" mean?',
 'Increase in the value of money', 'General rise in prices reducing purchasing power', 'A government tax on imports', 'An increase in job opportunities',
 'b', 'finance', 1, 'Inflation is the rate at which the general level of prices rises, eroding purchasing power. Lebanon experienced hyperinflation exceeding 200% in 2021–2022.'),

('What is the difference between a debit card and a credit card?',
 'No difference — they are the same', 'Debit uses your own money; credit borrows from the bank', 'Credit cards are only for businesses', 'Debit cards have higher limits',
 'b', 'finance', 1, 'A debit card draws directly from your bank account. A credit card lets you borrow money up to a limit, which you repay later — ideally in full to avoid interest.'),

('What does "compound interest" mean?',
 'Interest only on the original principal', 'Interest charged on both principal and previously earned interest', 'A fixed monthly fee', 'Government tax on bank accounts',
 'b', 'finance', 2, 'Compound interest is "interest on interest." Over time it exponentially grows savings or debt. Einstein reportedly called it the 8th wonder of the world.'),

-- CAREER Advanced (difficulty 3)
('What is the concept of "personal branding" in career development?',
 'Creating a logo for yourself', 'Deliberately shaping how others perceive your professional identity and value', 'Registering a trademark for your name', 'Building a personal website only',
 'b', 'career', 3, 'Personal branding is proactively managing your professional reputation — how you present your skills, values, and expertise across platforms, networks, and in person.'),

('What does "emotional intelligence" (EQ) measure?',
 'IQ combined with memory tests', 'Ability to recognize, understand, and manage emotions in self and others', 'Technical problem-solving ability', 'Communication speed',
 'b', 'skills', 2, 'EQ (Emotional Intelligence) includes self-awareness, self-regulation, empathy, and social skills. Research shows EQ predicts career success better than IQ in many fields.'),

('In salary negotiation, what is the best first move?',
 'Accept the first offer immediately', 'Give the lowest number you''d accept', 'Let the employer make the first offer, then counter with research-backed reasoning', 'Refuse to discuss salary until hired',
 'c', 'career', 3, 'Letting the employer anchor first gives you information. Then counter with market data, your value, and a specific number — vague answers weaken your position.'),

('What is "design thinking"?',
 'A graphic design certification course', 'A human-centered problem-solving process: Empathize, Define, Ideate, Prototype, Test', 'A method for interior decorating', 'A software development framework',
 'b', 'skills', 3, 'Design thinking, popularized by IDEO and Stanford d.school, is a 5-stage iterative process for solving complex problems by deeply understanding user needs.'),

('What does "agile methodology" refer to in project management?',
 'Working as fast as possible', 'An iterative, collaborative approach to project management with short sprints', 'A rigid waterfall project plan', 'Remote working policy',
 'b', 'tech', 3, 'Agile breaks projects into short sprints (1–4 weeks) with regular reviews. It values collaboration, flexibility, and customer feedback over rigid planning.'),

('What is "opportunity cost"?',
 'The cost of advertising an opportunity', 'The value of the next best alternative you give up when making a choice', 'A hidden fee in contracts', 'The cost of missing a job application deadline',
 'b', 'finance', 3, 'Opportunity cost is fundamental to economics: every choice means forgoing alternatives. If you spend 4 years studying medicine, the opportunity cost includes earnings you could have made.'),

('Which skill is consistently ranked as the top skill employers seek?',
 'Coding in Python', 'Communication skills', 'Proficiency in Excel', 'Graphic design',
 'b', 'skills', 2, 'Survey after survey — LinkedIn, World Economic Forum, Deloitte — ranks communication (written, verbal, listening) as the #1 skill employers want in candidates.'),

('What is "imposter syndrome"?',
 'A technical term for fraud detection software', 'Feeling like you don''t deserve your success despite evidence of competence', 'A management style', 'A personality test result',
 'b', 'study', 2, 'Imposter syndrome affects ~70% of people at some point. Recognizing it is the first step — your achievements are real, and growth always feels uncomfortable.'),

('In Lebanon, what is the typical duration of compulsory military service for men?',
 '6 months', '12 months', '24 months', 'Lebanon has no mandatory service',
 'a', 'general', 2, 'Lebanon''s compulsory military service was reduced over the years. As of recent regulations, the period is approximately 6 months for eligible men.')

on conflict do nothing;
