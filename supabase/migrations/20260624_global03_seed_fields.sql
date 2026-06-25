-- Masarak GLOBAL — seed the fields_of_study taxonomy (top-level, bilingual,
-- RIASEC-tagged). Spec Task A7. Subfields can be added later as children.
insert into fields_of_study (name_ar, name_en, slug, riasec_codes, icon) values
  ('الهندسة والتقنية','Engineering & Technology','engineering-technology', array['R','I'], '🔧'),
  ('علوم الحاسوب وتقنية المعلومات','Computer Science & IT','computer-science', array['I','R'], '💻'),
  ('إدارة الأعمال','Business & Management','business-management', array['E','C'], '📊'),
  ('الطب والعلوم الصحية','Medicine & Health','medicine-health', array['I','S'], '🩺'),
  ('العلوم الطبيعية','Natural Sciences','natural-sciences', array['I','R'], '🔬'),
  ('العلوم الاجتماعية','Social Sciences','social-sciences', array['S','I'], '🌐'),
  ('القانون','Law','law', array['E','S'], '⚖️'),
  ('الفنون والإنسانيات','Arts & Humanities','arts-humanities', array['A','S'], '🎨'),
  ('التربية والتعليم','Education','education', array['S','A'], '📚'),
  ('العمارة والتصميم','Architecture & Design','architecture-design', array['A','R'], '🏛️'),
  ('الزراعة والبيئة','Agriculture & Environment','agriculture-environment', array['R','I'], '🌱')
on conflict (slug) do nothing;
