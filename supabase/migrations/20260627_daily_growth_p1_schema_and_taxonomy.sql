-- ============================================================================
-- Daily Growth — Phase 1: question-bank schema expansion + 40-category taxonomy
-- 100% ADDITIVE. No drops/renames. Existing /api/quiz/* keeps working unchanged.
-- See DAILY_GROWTH_ARCHITECTURE.md.
-- ============================================================================

-- 1) Bring quiz_questions up to the full content spec (all nullable / defaulted).
alter table public.quiz_questions
  add column if not exists subcategory       text,
  add column if not exists reference         text,
  add column if not exists estimated_time_sec smallint,
  add column if not exists country           text,        -- NULL = universal/all countries
  add column if not exists image_url         text,
  add column if not exists video_url         text,
  add column if not exists version           integer not null default 1,
  add column if not exists updated_at        timestamptz not null default now();

drop trigger if exists trg_quiz_questions_touch on public.quiz_questions;
create trigger trg_quiz_questions_touch
  before update on public.quiz_questions
  for each row execute function public.touch_updated_at();

-- 2) Category taxonomy — the 40 learning domains (Arabic-first), grouped by domain.
create table if not exists public.quiz_categories (
  code        text primary key,          -- matches quiz_questions.subject
  name_ar     text not null,
  name_en     text not null,
  domain      text not null,             -- academic|tech|guidance|career|thinking|wellbeing
  icon        text,
  sort_order  smallint not null default 100,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.quiz_categories enable row level security;
drop policy if exists quiz_categories_read on public.quiz_categories;
create policy quiz_categories_read on public.quiz_categories for select using (true);
drop policy if exists quiz_categories_admin on public.quiz_categories;
create policy quiz_categories_admin on public.quiz_categories for all
  using (is_admin()) with check (is_admin());

insert into public.quiz_categories (code, name_ar, name_en, domain, icon, sort_order) values
  ('arabic','اللغة العربية','Arabic Language','academic','📖',10),
  ('english','اللغة الإنجليزية','English Language','academic','🔤',11),
  ('math','الرياضيات','Mathematics','academic','➗',12),
  ('biology','الأحياء','Biology','academic','🧬',13),
  ('chemistry','الكيمياء','Chemistry','academic','⚗️',14),
  ('physics','الفيزياء','Physics','academic','🔭',15),
  ('history','التاريخ','History','academic','🏛️',16),
  ('geography','الجغرافيا','Geography','academic','🗺️',17),
  ('economics','الاقتصاد','Economics','academic','📈',18),
  ('philosophy','الفلسفة','Philosophy','academic','🤔',19),
  ('logic','المنطق','Logic','academic','🧩',20),
  ('psychology','علم النفس','Psychology','academic','🧠',21),
  ('sociology','علم الاجتماع','Sociology','academic','👥',22),
  ('civics','التربية الوطنية','Civics','academic','⚖️',23),
  ('science','العلوم العامة','General Science','academic','🔬',24),
  ('computer_science','علوم الحاسوب','Computer Science','tech','💻',30),
  ('ai','الذكاء الاصطناعي','Artificial Intelligence','tech','🤖',31),
  ('programming','البرمجة','Programming','tech','⌨️',32),
  ('cybersecurity','الأمن السيبراني','Cybersecurity','tech','🛡️',33),
  ('digital_skills','المهارات الرقمية','Digital Skills','tech','📱',34),
  ('general_knowledge','الثقافة العامة','General Knowledge','guidance','🌍',40),
  ('general_culture','المعرفة العامة','General Culture','guidance','🧭',41),
  ('universities','الجامعات','Universities','guidance','🎓',42),
  ('scholarships','المنح الدراسية','Scholarships','guidance','💰',43),
  ('career_skills','المهارات المهنية','Career Skills','career','💼',50),
  ('entrepreneurship','ريادة الأعمال','Entrepreneurship','career','🚀',51),
  ('financial_literacy','الثقافة المالية','Financial Literacy','career','🏦',52),
  ('interview_skills','مهارات المقابلات','Interview Skills','career','🎙️',53),
  ('cv_building','كتابة السيرة الذاتية','CV Building','career','📄',54),
  ('public_speaking','التحدث أمام الجمهور','Public Speaking','career','🗣️',55),
  ('critical_thinking','التفكير النقدي','Critical Thinking','thinking','💡',60),
  ('iq','الذكاء المنطقي','IQ','thinking','🎯',61),
  ('emotional_intelligence','الذكاء العاطفي','Emotional Intelligence','thinking','❤️',62),
  ('leadership','القيادة','Leadership','thinking','🧭',63),
  ('communication_skills','مهارات التواصل','Communication Skills','thinking','💬',64),
  ('media_literacy','الثقافة الإعلامية','Media Literacy','thinking','📰',65),
  ('environmental_awareness','الوعي البيئي','Environmental Awareness','wellbeing','🌱',70),
  ('health','الصحة','Health','wellbeing','🩺',71),
  ('mental_wellbeing','الصحة النفسية','Mental Wellbeing','wellbeing','🧘',72),
  ('study_skills','مهارات الدراسة','Study Skills','wellbeing','📚',73),
  ('productivity','الإنتاجية','Productivity','wellbeing','⚡',74),
  ('time_management','إدارة الوقت','Time Management','wellbeing','⏰',75)
on conflict (code) do nothing;
