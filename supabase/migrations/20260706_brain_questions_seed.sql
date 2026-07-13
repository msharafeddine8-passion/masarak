-- ============================================================================
-- Brain & reasoning question seed — 55 verified Arabic cognitive MCQs.
-- ----------------------------------------------------------------------------
-- Fills the six cognitive categories (Engine v2) with a curated starter set so
-- the daily quiz's guaranteed "thinking" slot has real brain-game content:
-- number/letter patterns, numerical & verbal reasoning, deductive logic, IQ
-- puzzles, working-memory, spatial reasoning and attention/focus. Every answer
-- is hand-verified and the correct option is deliberately spread across all four
-- positions (fixing the legacy "answer is always #1" bias). grade_level = NULL so
-- they show to every student; difficulty 2-5. Idempotent via md5(stem) on the
-- UNIQUE stem_hash. NOT auto-applied — run in the SQL editor.
-- ============================================================================

-- Ensure the cognitive categories exist (idempotent — also seeded by Engine v2).
INSERT INTO public.quiz_categories (code, name_ar, name_en, domain, icon, sort_order, is_active) VALUES
  ('memory',              'الذاكرة',            'Memory',              'thinking', '🧠', 66, true),
  ('spatial_reasoning',   'التفكير المكاني',    'Spatial Reasoning',   'thinking', '🧊', 67, true),
  ('pattern_recognition', 'تمييز الأنماط',      'Pattern Recognition', 'thinking', '🔷', 68, true),
  ('verbal_reasoning',    'الاستدلال اللفظي',   'Verbal Reasoning',    'thinking', '🔤', 69, true),
  ('numerical_reasoning', 'الاستدلال العددي',   'Numerical Reasoning', 'thinking', '🔢', 76, true),
  ('attention_focus',     'التركيز والملاحظة',  'Attention & Focus',   'thinking', '👁️', 77, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.quiz_questions
  (subject, language, difficulty, grade_level, skill_code, cognitive_skill, stem, stem_hash, options, correct_index, explanation, tags, estimated_time_sec)
SELECT v.subject, 'ar', v.difficulty, NULL, v.skill_code, v.cognitive_skill,
       v.stem, md5(v.stem), v.options::jsonb, v.correct_index, v.explanation,
       ARRAY(SELECT jsonb_array_elements_text(v.tags::jsonb)), v.est
FROM (VALUES
  -- ── تمييز الأنماط (pattern_recognition) ──────────────────────────────────
  ('pattern_recognition',2,'PATTERN.MULT','application','ما الرقم التالي في التسلسل: 3، 6، 12، 24، ؟','["36","48","30","42"]',1,'كل رقم ضعف الذي قبله (×2): 24×2=48.','["brain","pattern"]',30),
  ('pattern_recognition',2,'PATTERN.SQUARE','application','أكمل التسلسل: 1، 4، 9، 16، ؟','["20","24","25","30"]',2,'مربّعات الأعداد 1²،2²،3²،4²، والتالي 5²=25.','["brain","pattern"]',30),
  ('pattern_recognition',3,'PATTERN.DIFF','analysis','ما الرقم التالي: 2، 3، 5، 8، 12، ؟','["16","15","17","18"]',2,'الفروق تتزايد +1،+2،+3،+4، ثمّ +5: 12+5=17.','["brain","pattern"]',35),
  ('pattern_recognition',4,'PATTERN.FACT','analysis','أكمل: 1، 2، 6، 24، ؟','["72","96","120","48"]',2,'نضرب ×2 ثمّ ×3 ثمّ ×4 ثمّ ×5: 24×5=120.','["brain","pattern"]',40),
  ('pattern_recognition',3,'PATTERN.SUB','application','ما الرقم التالي: 100، 95، 85، 70، ؟','["55","50","60","45"]',1,'نطرح 5 ثمّ 10 ثمّ 15 ثمّ 20: 70−20=50.','["brain","pattern"]',35),
  ('pattern_recognition',3,'PATTERN.MULT3','application','أكمل: 2، 6، 18، 54، ؟','["108","162","150","216"]',1,'نضرب ×3 كل مرّة: 54×3=162.','["brain","pattern"]',30),
  ('pattern_recognition',3,'PATTERN.FIB','analysis','ما الرقم التالي: 1، 1، 2، 3، 5، 8، 13، ؟','["18","20","21","24"]',2,'متتالية فيبوناتشي: كل حدّ مجموع الحدّين قبله: 8+13=21.','["brain","pattern"]',35),
  ('pattern_recognition',2,'PATTERN.DIV','application','أكمل: 81، 27، 9، 3، ؟','["1","0","2","3"]',0,'نقسم على 3 كل مرّة: 3÷3=1.','["brain","pattern"]',30),
  ('pattern_recognition',2,'PATTERN.SQUARE2','application','ما الرقم التالي: 4، 9، 16، 25، ؟','["30","36","49","42"]',1,'مربّعات 2،3،4،5، والتالي 6²=36.','["brain","pattern"]',30),

  -- ── الاستدلال العددي (numerical_reasoning) ───────────────────────────────
  ('numerical_reasoning',3,'NUMERIC.INVPROP','analysis','إذا بنى 3 عمّال جدارًا في 6 أيّام، فكم يومًا يحتاج 6 عمّال بنفس الوتيرة؟','["6","4","3","12"]',2,'العمل ثابت (18 عامل-يوم)؛ ضِعف العمّال = نصف الوقت = 3 أيّام.','["brain","numeric"]',40),
  ('numerical_reasoning',2,'NUMERIC.RATIO','application','ثمن 4 أقلام 12 ألف ليرة. كم ثمن 7 أقلام؟','["21 ألف","24 ألف","18 ألف","28 ألف"]',0,'ثمن القلم 3 آلاف؛ 7×3=21 ألف.','["brain","numeric"]',35),
  ('numerical_reasoning',2,'NUMERIC.EQ','application','نصف عددٍ زائد 10 يساوي 30. ما العدد؟','["20","50","40","30"]',2,'نصف العدد = 20، إذًا العدد = 40.','["brain","numeric"]',35),
  ('numerical_reasoning',3,'NUMERIC.RATE','application','ساعة تتأخّر 3 دقائق كل يوم. بعد كم يوم يبلغ التأخّر ساعة كاملة (60 دقيقة)؟','["30","20","18","15"]',1,'60 ÷ 3 = 20 يومًا.','["brain","numeric"]',35),
  ('numerical_reasoning',3,'NUMERIC.PCT','application','إذا كان 20% من عددٍ يساوي 30، فما العدد؟','["60","150","120","100"]',1,'30 تمثّل 20%؛ فالكلّ (100%) = 30×5 = 150.','["brain","numeric"]',35),
  ('numerical_reasoning',3,'NUMERIC.SQ','analysis','عددٌ إذا ضربته بنفسه ثمّ طرحت 1 كانت النتيجة 48. ما العدد؟','["6","8","7","5"]',2,'7×7 = 49، و49 − 1 = 48.','["brain","numeric"]',40),
  ('numerical_reasoning',3,'NUMERIC.AVG','analysis','متوسّط ثلاثة أعداد هو 20. عددان منها 15 و25. ما العدد الثالث؟','["25","20","18","22"]',1,'المجموع = 60؛ 60 − (15+25) = 20.','["brain","numeric"]',40),
  ('numerical_reasoning',2,'NUMERIC.SPEED','application','قطار يقطع 240 كم في 3 ساعات. كم كيلومترًا يقطع في 5 ساعات بنفس السرعة؟','["360","400","480","320"]',1,'السرعة 80 كم/س؛ 80×5 = 400 كم.','["brain","numeric"]',35),

  -- ── الاستدلال اللفظي (verbal_reasoning) ──────────────────────────────────
  ('verbal_reasoning',2,'VERBAL.ANALOGY','application','الطبيب للمستشفى كما المعلّم لـ:','["الكتاب","الطالب","المدرسة","القلم"]',2,'الطبيب يعمل في المستشفى كما المعلّم يعمل في المدرسة.','["brain","verbal"]',30),
  ('verbal_reasoning',2,'VERBAL.ODD','analysis','ما الكلمة الشاذّة: تفّاح، موز، جزر، برتقال؟','["تفّاح","جزر","موز","برتقال"]',1,'الجزر خضار، والباقي فواكه.','["brain","verbal"]',30),
  ('verbal_reasoning',2,'VERBAL.ANALOGY2','application','الجناح للطائر كما الزعنفة لـ:','["السمكة","الطائرة","الماء","العصفور"]',0,'الجناح عضو حركة الطائر، والزعنفة عضو حركة السمكة.','["brain","verbal"]',30),
  ('verbal_reasoning',3,'VERBAL.ODD2','analysis','ما الشكل الشاذّ: مثلّث، مربّع، دائرة، مستطيل؟','["مثلّث","مربّع","دائرة","مستطيل"]',2,'الدائرة بلا أضلاع أو زوايا، والباقي مضلّعات.','["brain","verbal"]',30),
  ('verbal_reasoning',2,'VERBAL.ANALOGY3','application','الحرارة للترمومتر كما الوزن لـ:','["المتر","الساعة","الميزان","البوصلة"]',2,'الترمومتر يقيس الحرارة، والميزان يقيس الوزن.','["brain","verbal"]',30),
  ('verbal_reasoning',1,'VERBAL.ODD3','comprehension','ما الشاذّ: أحمر، أزرق، سعيد، أخضر؟','["سعيد","أحمر","أزرق","أخضر"]',0,'سعيد شعور، والباقي ألوان.','["brain","verbal"]',25),
  ('verbal_reasoning',1,'VERBAL.ANALOGY4','application','الماء للعطش كما الطعام لـ:','["الأكل","الجوع","المطبخ","الصحن"]',1,'الماء يروي العطش، والطعام يسدّ الجوع.','["brain","verbal"]',25),
  ('verbal_reasoning',3,'VERBAL.ANALOGY5','application','أكمل: الكتاب : المكتبة :: النجم : ؟','["الليل","الضوء","السماء","القمر"]',2,'الكتاب يوجد في المكتبة، والنجم يوجد في السماء.','["brain","verbal"]',35),

  -- ── المنطق (logic) — استنتاج ─────────────────────────────────────────────
  ('logic',4,'LOGIC.SYLL2','analysis','إذا كان كل القطط حيوانات، وبعض الحيوانات تطير، فماذا نستنتج عن القطط؟','["كل القطط تطير","بعض القطط تطير","لا يمكن استنتاج أنّها تطير","لا قطّ يطير أبدًا"]',2,'لا رابط منطقيّ يربط القطط بالطيران من المقدّمتين.','["brain","logic"]',45),
  ('logic',2,'LOGIC.ORDER','application','أحمد أطول من سامي، وسامي أطول من خالد. من الأقصر؟','["أحمد","خالد","سامي","متساوون"]',1,'خالد أقصر من سامي الذي هو أقصر من أحمد.','["brain","logic"]',30),
  ('logic',3,'LOGIC.RACE','analysis','في سباق، تخطّيت المتسابق صاحب المركز الثاني. ما ترتيبك الآن؟','["الأوّل","الثاني","الثالث","لا يمكن معرفته"]',1,'تخطّي صاحب المركز الثاني يجعلك مكانه (الثاني)، لا الأوّل.','["brain","logic"]',40),
  ('logic',4,'LOGIC.DAYS','analysis','إذا كان اليومُ قبل يومين هو الأربعاء، فما يومُ غدٍ؟','["الجمعة","السبت","الأحد","الخميس"]',1,'اليوم = الأربعاء + يومين = الجمعة، وغدًا = السبت.','["brain","logic"]',45),
  ('logic',3,'LOGIC.SIBLING','analysis','لأحمد من الإخوة الذكور ضِعفُ ما له من الأخوات. أيّهما أكثر؟','["الأخوات","الإخوة الذكور","متساوون","لا يمكن معرفته"]',1,'الذكور ضِعف الإناث، فهم أكثر عددًا.','["brain","logic"]',35),

  -- ── الذكاء المنطقي (iq) ──────────────────────────────────────────────────
  ('iq',2,'IQ.CODE','application','إذا كان 1=3 و2=6 و3=9، فكم يساوي 5؟','["10","12","15","18"]',2,'كل عدد مضروب في 3: 5×3=15.','["brain","iq"]',30),
  ('iq',5,'IQ.CHIME','analysis','ساعة حائط تدقّ 6 دقّات في 5 ثوانٍ. كم ثانية تحتاج لـ12 دقّة؟','["10","12","11","6"]',2,'بين 6 دقّات 5 فواصل (ثانية لكلّ فاصل)؛ 12 دقّة = 11 فاصلًا = 11 ثانية.','["brain","iq"]',50),
  ('iq',4,'IQ.MOD','analysis','إذا كان اليوم الثلاثاء، فأيّ يوم يكون بعد 100 يوم؟','["الأربعاء","الخميس","الجمعة","السبت"]',1,'100 ÷ 7 يتبقّى 2؛ الثلاثاء + يومين = الخميس.','["brain","iq"]',45),
  ('iq',3,'IQ.HALF','application','ما العدد الذي إذا أضفت إليه نصفه صار 30؟','["15","25","20","18"]',2,'العدد + نصفه = 1.5×العدد = 30، إذًا العدد = 20.','["brain","iq"]',40),

  -- ── الذاكرة (memory) — العنصر داخل السؤال ────────────────────────────────
  ('memory',2,'MEMORY.MID','knowledge','احفظ هذا التسلسل جيّدًا: 7 - 2 - 9 - 4 - 1. ما الرقم الذي في المنتصف؟','["2","9","4","7"]',1,'التسلسل خمسة أرقام، والأوسط (الثالث) هو 9.','["brain","memory"]',35),
  ('memory',2,'MEMORY.ORDER','knowledge','احفظ الألوان بالترتيب: أزرق، أحمر، أخضر، أصفر. ما اللون الثالث؟','["أحمر","أصفر","أخضر","أزرق"]',2,'الترتيب: أزرق(1)، أحمر(2)، أخضر(3)، أصفر(4).','["brain","memory"]',35),
  ('memory',2,'MEMORY.COUNT','knowledge','احفظ القائمة: قلم، كتاب، مفتاح، ساعة، نظّارة. كم عدد العناصر؟','["4","6","5","3"]',2,'القائمة تحتوي خمسة عناصر.','["brain","memory"]',35),
  ('memory',3,'MEMORY.REPEAT','application','احفظ: 3 - 8 - 5 - 8 - 2. كم مرّة تكرّر الرقم 8؟','["مرّة","مرّتان","ثلاث مرّات","لم يتكرّر"]',1,'الرقم 8 ظهر في الموضعين الثاني والرابع = مرّتان.','["brain","memory"]',40),
  ('memory',2,'MEMORY.LAST','knowledge','احفظ الأسماء بالترتيب: سارة، ليلى، هدى، منى. ما الاسم الأخير؟','["سارة","هدى","ليلى","منى"]',3,'آخر اسم في القائمة هو منى.','["brain","memory"]',35),
  ('memory',3,'MEMORY.SUM','application','احفظ الأرقام: 6 - 1 - 9 - 4. ما مجموع الرقم الأوّل والأخير؟','["7","10","13","5"]',1,'الأوّل 6 والأخير 4، ومجموعهما 10.','["brain","memory"]',40),
  ('memory',2,'MEMORY.SYM','knowledge','احفظ الرموز: ★ ● ▲ ● ★. ما الرمز الأوسط؟','["★","●","▲","■"]',2,'التسلسل خمسة رموز، والأوسط هو ▲.','["brain","memory"]',35),

  -- ── التفكير المكاني (spatial_reasoning) ──────────────────────────────────
  ('spatial_reasoning',3,'SPATIAL.TURN','analysis','تتّجه شمالًا، ثمّ تنعطف يمينًا، ثمّ يمينًا مرّة أخرى. في أيّ اتّجاه أنت الآن؟','["شرقًا","غربًا","جنوبًا","شمالًا"]',2,'شمال ← يمين = شرق ← يمين = جنوب.','["brain","spatial"]',40),
  ('spatial_reasoning',3,'SPATIAL.MIRROR','analysis','إذا عكست المرآةُ عقاربَ ساعةٍ تشير إلى 3:00، فأيّ وقتٍ يظهر في المرآة؟','["9:00","6:00","3:00","12:00"]',0,'الانعكاس الأفقي لـ3:00 يعطي 9:00.','["brain","spatial"]',40),
  ('spatial_reasoning',3,'SPATIAL.CUBE','knowledge','كم حرفًا (ضلعًا) للمكعّب؟','["6","8","12","4"]',2,'للمكعّب 6 أوجه و8 رؤوس و12 حرفًا.','["brain","spatial"]',35),
  ('spatial_reasoning',4,'SPATIAL.PYTH','analysis','تسير 3 أمتار شمالًا ثمّ 4 أمتار شرقًا. كم مترًا تبعد عن نقطة البداية بخطٍّ مستقيم؟','["7","5","1","12"]',1,'مثلّث قائم 3-4-5: المسافة المستقيمة = 5 أمتار.','["brain","spatial"]',45),
  ('spatial_reasoning',3,'SPATIAL.LETTER','application','إذا نظرت إلى الحرف اللاتيني b في المرآة، أيّ حرف تراه؟','["p","d","q","b"]',1,'الانعكاس الأفقي للحرف b يعطي d.','["brain","spatial"]',35),
  ('spatial_reasoning',3,'SPATIAL.PYRAMID','knowledge','كم وجهًا للهرم ذي القاعدة المربّعة؟','["4","5","6","8"]',1,'أربعة أوجه مثلّثة زائد قاعدة مربّعة = 5 أوجه.','["brain","spatial"]',35),
  ('spatial_reasoning',2,'SPATIAL.FULL','application','تنعطف يسارًا 4 مرّات متتالية (كلّ مرّة 90°). في أيّ اتّجاه تنتهي مقارنةً بالبداية؟','["المعاكس","نفس الاتّجاه الأصلي","إلى اليمين","إلى اليسار"]',1,'4 × 90° = 360° = دورة كاملة، فتعود لنفس الاتّجاه.','["brain","spatial"]',30),

  -- ── التركيز والملاحظة (attention_focus) ──────────────────────────────────
  ('attention_focus',2,'ATTENTION.COUNT','knowledge','كم مرّة يظهر الرقم 7 في: 1 7 3 7 9 7 2؟','["2","3","4","1"]',1,'الرقم 7 ظهر ثلاث مرّات.','["brain","attention"]',30),
  ('attention_focus',2,'ATTENTION.MISS','application','ما الرقم المفقود من التسلسل من 1 إلى 7: 1، 2، 3، 5، 6، 7؟','["4","5","8","0"]',0,'الرقم 4 مفقود من التسلسل.','["brain","attention"]',30),
  ('attention_focus',2,'ATTENTION.DISTINCT','application','كم رمزًا مختلفًا في: ★ ● ★ ▲ ● ★؟','["2","3","4","5"]',1,'الرموز المختلفة ثلاثة: ★ و● و▲.','["brain","attention"]',30),
  ('attention_focus',2,'ATTENTION.ODD','application','أيّ مجموعةٍ تختلف عن البقيّة: (77) (77) (71) (77)؟','["(77)","(71)","الأولى","لا يوجد"]',1,'المجموعة (71) تختلف، فالبقيّة كلّها (77).','["brain","attention"]',30),
  ('attention_focus',2,'ATTENTION.SEQ','application','في السلسلة: أ ب ج أ ب ج أ ؟ — ما الحرف التالي؟','["أ","ب","ج","د"]',1,'النمط يتكرّر (أ ب ج)، وبعد أ يأتي ب.','["brain","attention"]',30),
  ('attention_focus',3,'ATTENTION.EVEN','application','كم عدد الأرقام الزوجيّة في: 3، 8، 5، 2، 7، 4؟','["2","3","4","5"]',1,'الأعداد الزوجيّة ثلاثة: 8 و2 و4.','["brain","attention"]',35),
  ('attention_focus',2,'ATTENTION.DUP','application','أيّ عنصرٍ يظهر مرّتين: قلم، كتاب، قلم، مفتاح؟','["كتاب","قلم","مفتاح","لا يوجد"]',1,'كلمة قلم تكرّرت مرّتين.','["brain","attention"]',30)
) AS v(subject, difficulty, skill_code, cognitive_skill, stem, options, correct_index, explanation, tags, est)
ON CONFLICT (stem_hash) DO NOTHING;
