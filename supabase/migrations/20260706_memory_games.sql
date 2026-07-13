-- ============================================================================
-- Interactive memory games — a new question_type that flashes content to
-- memorize, then hides it before asking (a real memory test, not re-reading).
-- ----------------------------------------------------------------------------
-- Adds question_type (default 'mcq' — every existing question is unaffected) and
-- two optional fields the player uses for the "memorize" phase: memory_show (the
-- content flashed on screen) and memory_seconds (how long). Grading is unchanged
-- (still answerIndex == correct_index), so the whole submit/scoring path is
-- reused. Seeds 7 interactive memory questions. Idempotent. NOT auto-applied.
-- ============================================================================

ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS question_type  text NOT NULL DEFAULT 'mcq',
  ADD COLUMN IF NOT EXISTS memory_show     text,
  ADD COLUMN IF NOT EXISTS memory_seconds  int;

INSERT INTO public.quiz_questions
  (subject, language, difficulty, grade_level, skill_code, cognitive_skill,
   question_type, memory_show, memory_seconds, stem, stem_hash, options, correct_index, explanation, tags)
SELECT v.subject, 'ar', v.difficulty, NULL, v.skill_code, 'application',
       'memory', v.memory_show, v.memory_seconds, v.stem, md5(v.stem), v.options::jsonb, v.correct_index, v.explanation, '["brain","memory","interactive"]'::jsonb
FROM (VALUES
  ('memory',2,'MEMORY.SEQ.MID','7 · 2 · 9 · 4 · 1',4,'ما الرقم الذي كان في المنتصف؟','["2","9","4","1"]',1,'التسلسل 7-2-9-4-1، والأوسط (الثالث) هو 9.'),
  ('memory',2,'MEMORY.SEQ.SYM','🍎 · 🚗 · ⭐ · 🌙 · 🔑',5,'ما الرمز الثالث الذي ظهر؟','["⭐","🚗","🌙","🔑"]',0,'الترتيب: تفّاحة، سيّارة، نجمة، قمر، مفتاح — والثالث نجمة ⭐.'),
  ('memory',2,'MEMORY.SEQ.LAST','أزرق - أحمر - أخضر - أصفر',4,'ما اللون الأخير الذي ظهر؟','["أحمر","أصفر","أخضر","أزرق"]',1,'آخر لون في التسلسل هو الأصفر.'),
  ('memory',3,'MEMORY.SEQ.COUNT','4 - 8 - 8 - 2 - 5',4,'كم مرّة ظهر الرقم 8؟','["مرّة","مرّتان","ثلاث مرّات","لم يظهر"]',1,'الرقم 8 ظهر مرّتين.'),
  ('memory',3,'MEMORY.SEQ.2ND','ق - ل - م - ز - ن',5,'ما الحرف الثاني الذي ظهر؟','["ل","ق","م","ز"]',0,'الترتيب ق-ل-م-ز-ن، والثاني هو ل.'),
  ('memory',3,'MEMORY.SEQ.SUM','3 - 6 - 1 - 9',4,'ما مجموع الرقم الأوّل والأخير؟','["12","9","4","10"]',0,'الأوّل 3 والأخير 9، ومجموعهما 12.'),
  ('memory',3,'MEMORY.SEQ.CNT2','🔴 🔵 🔴 🟢 🔵',5,'كم دائرة زرقاء 🔵 ظهرت؟','["1","2","3","4"]',1,'ظهرت الدائرة الزرقاء مرّتين.')
) AS v(subject, difficulty, skill_code, memory_show, memory_seconds, stem, options, correct_index, explanation)
ON CONFLICT (stem_hash) DO NOTHING;
