-- ════════════════════════════════════════════════════════════════════════════
-- مسارك — Content Seed (run AFTER 20260611_content_depth.sql)
-- 11 June 2026
-- Idempotent: uses ON CONFLICT / WHERE NOT EXISTS where possible.
-- ════════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────
-- 1. GLOSSARY — 30 essential terms
-- ──────────────────────────────────────────────────────────────────────────
INSERT INTO glossary (term_en, term_ar, definition_ar, example_ar, category, display_order) VALUES
('GPA',                       'المعدل التراكمي',  'مقياس رقمي لأداء الطالب من 4.0. بيُحسب بضرب درجة كل مادة × عدد ساعاتها ÷ مجموع الساعات.', 'طالب بـ GPA 3.5 من 4.0 = ممتاز وبيستحق قيد الشرف', 'academic', 1),
('Credit Hour',               'ساعة معتمدة',      'وحدة قياس عبء المادة الدراسية. عادةً مادة واحدة = 3 ساعات معتمدة.',                          'رسوم AUB حوالي 850 دولار لكل ساعة معتمدة',    'academic', 2),
('Prerequisite',              'مادة شرطية',       'مادة لازم تنجح فيها قبل ما تاخد مادة تانية.',                                                'Calculus 1 هي prerequisite لـ Calculus 2',     'academic', 3),
('Major',                     'تخصص رئيسي',       'المجال الأساسي يلي بتدرسه وبيظهر على شهادتك.',                                              'تخصصي Computer Science من AUB',                'academic', 4),
('Minor',                     'تخصص ثانوي',       'مجال دراسي إضافي بعدد ساعات أقل من الـ Major.',                                              'Major: Engineering, Minor: Business = أقوى بالسوق', 'academic', 5),
('Elective',                  'مادة اختيارية',    'مادة بتختارها بحرية من قائمة، مش إلزامية بعينها.',                                          'ساعات الـ electives بخلّيك تكتشف مواضيع جديدة',  'academic', 6),
('Dean''s List',              'قائمة العميد',     'قائمة شرفية للطلاب المتفوقين — عادة GPA فوق 3.7.',                                          'الانضمام لـ Dean''s List بيقوّي الـ CV كتير',     'academic', 7),
('Academic Probation',        'الإنذار الأكاديمي','تحذير رسمي للطالب لأن معدله نزل تحت الحد الأدنى.',                                          'GPA تحت 2.0 عادةً بيحط الطالب على probation',  'academic', 8),
('Capstone Project',          'مشروع التخرج',     'مشروع نهائي شامل بنهاية الدراسة بيثبت فيه الطالب كفاءته.',                                  'مشروع التخرج بيبقى بالـ CV وبيأثر على التوظيف', 'academic', 9),
('Accreditation',             'الاعتماد',         'اعتراف رسمي بأن الجامعة أو البرنامج يلتزم بمعايير جودة.',                                    'اعتماد AACSB لكلية إدارة الأعمال = معيار دولي',  'academic', 10),
('Transcript',                'كشف العلامات',     'وثيقة رسمية من الجامعة بكل موادك وعلاماتك.',                                                'لازم transcripts مصدّقة لأي طلب ماجستير أو توظيف', 'academic', 11),
('IELTS',                     'آيلتس',            'امتحان اللغة الإنجليزية للدراسة والهجرة. من 1 إلى 9، معظم الجامعات بتطلب 6.0+.',           'AUB بتطلب IELTS 6.5 كحد أدنى للقبول',          'admission', 12),
('TOEFL',                     'توفل',             'امتحان إنجليزي أمريكي كبديل لـ IELTS. أونلاين، من 0 إلى 120.',                              'TOEFL 90 يعادل تقريباً IELTS 7.0',              'admission', 13),
('SAT',                       'SAT',              'امتحان قياسي أمريكي للقبول الجامعي. قسمان: رياضيات ولغة إنجليزية. من 400 إلى 1600.',         'AUB وLAU بيقبلوا SAT بدل امتحانات القبول الخاصة', 'admission', 14),
('GRE',                       'GRE',              'امتحان للقبول بالدراسات العليا في الغرب. من 130 إلى 170 بكل قسم.',                          'معظم Master programs بأمريكا بتطلب GRE',        'admission', 15),
('GMAT',                      'GMAT',             'امتحان للقبول ببرامج MBA وإدارة الأعمال تحديداً.',                                          'MBA بالجامعات الكبرى بتطلب GMAT 600+',           'admission', 16),
('Conditional Admission',     'قبول مشروط',       'قبول بشرط إتمام متطلب معين كدورة لغة أو مادة تحضيرية.',                                      'بعض الجامعات بتقبلك بشرط تنجح بـ English bridge', 'admission', 17),
('Rolling Admission',         'قبول متدحرج',      'نظام بتقدّم فيه بأي وقت والجامعة بتردّ عليك خلال أسابيع.',                                  'بعض الجامعات اللبنانية بتقبل حتى بعد بدء الفصل', 'admission', 18),
('Letter of Recommendation',  'رسالة توصية',      'رسالة من أستاذ أو رب عمل بتوصي بك للقبول أو التوظيف.',                                      '3 رسائل توصية مطلوبة لمعظم programs بالخارج',   'admission', 19),
('Statement of Purpose',      'رسالة النية',      'مقال بتكتبه بتشرح فيه ليش بدك تدرس هالتخصص وهالجامعة.',                                      'Statement of Purpose قوية = فارق كبير بالقبول',  'admission', 20),
('Full Scholarship',          'منحة كاملة',       'منحة تغطي الرسوم + السكن + بدل معيشة.',                                                     'منحة فولبرايت هي full scholarship للدراسة بأمريكا', 'financial', 21),
('Partial Scholarship',       'منحة جزئية',       'منحة تغطي جزء من الرسوم فقط.',                                                              'منحة بـ 50% تعني بتدفع نص الرسوم من جيبتك',     'financial', 22),
('Need-Based Aid',            'مساعدة على أساس الحاجة', 'دعم مالي بيعتمد على الوضع الاقتصادي للعائلة.',                                            'AUB عندها برنامج Financial Aid ضخم للعائلات بحاجة', 'financial', 23),
('Merit Scholarship',         'منحة تفوق',        'منحة بتُعطى على أساس التحصيل الأكاديمي مش الوضع المادي.',                                    'طلاب بمعدل 90%+ كتير بياخدوا merit scholarships',  'financial', 24),
('Work-Study',                'عمل-دراسة',        'برنامج بيشتغل فيه الطالب بالحرم مقابل تخفيض على الرسوم.',                                    'بتشتغل 10 ساعات بالأسبوع بالمكتبة وبتاخد تخفيض', 'financial', 25),
('Tuition Fee',               'رسوم الدراسة',     'المبلغ يلي بتدفعه للجامعة مقابل التعليم.',                                                  'رسوم الدراسة مختلفة عن رسوم السكن والمواصلات',  'financial', 26),
('Internship',                'تدريب',            'فترة عمل مؤقتة بشركة خلال أو بعد الدراسة.',                                                  'معظم شركات الخليج بتطلب خبرة internship بالـ CV',  'career', 27),
('Co-op',                     'تعاون دراسة-عمل',  'برنامج بتتبادل فيه فصول دراسية مع فترات عمل حقيقية.',                                        'NDU وبعض الجامعات عندها برنامج co-op مدفوع',       'career', 28),
('Alumni Network',            'شبكة الخريجين',    'مجتمع خريجي الجامعة يلي بيساعدوا بعضهم بالتوظيف والتواصل.',                                  'شبكة خريجي AUB من أقوى الشبكات بالشرق الأوسط',    'career', 29),
('Research Assistant',        'مساعد باحث',       'طالب بيساعد أستاذ بأبحاثه مقابل خبرة أو أجر رمزي.',                                          'RA position بتقوّي طلب الدراسات العليا كتير',     'career', 30)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────
-- 2. UNIVERSITIES — top 5 enriched (matched by short code OR name)
-- Wrap UPDATEs in DO blocks so we don't fail if a row doesn't exist
-- ──────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- AUB (id=1 in static seed)
  UPDATE universities SET
    tuition_per_credit_usd     = 850,
    tuition_per_year_usd       = 22000,
    registration_fee_usd       = 500,
    has_installment_plan       = true,
    installment_details        = 'الرسوم قابلة للتقسيط على ٣ دفعات خلال الفصل، مع برنامج Financial Aid واسع للعائلات المؤهلة',
    acceptance_rate_percent    = 30,
    min_gpa_required           = 3.00,
    ielts_min                  = 6.5,
    toefl_min                  = 90,
    sat_min                    = 1200,
    application_deadline_fall  = '15 مارس',
    application_deadline_spring= '1 نوفمبر',
    campus_city                = 'بيروت — رأس بيروت',
    has_dorms                  = true,
    dorm_cost_per_year_usd     = 8000,
    has_library_24h            = true,
    has_parking                = true,
    transport_from_beirut      = '١٠ دقايق بالسيارة من وسط بيروت — قريب من Hamra',
    graduation_rate_4yr_percent= 85,
    employment_rate_6mo_percent= 78,
    avg_salary_after_1yr_usd   = 18000,
    student_faculty_ratio      = '11:1',
    campus_vibe                = 'تنافسي وأكاديمي بامتياز، جو دولي، تنوع ثقافي عالٍ',
    strengths                  = ARRAY['الطب والهندسة', 'البحث العلمي', 'شبكة خريجين دولية قوية'],
    ideal_student_profile      = 'طالب يسعى للتميز الأكاديمي ويريد شهادة معترف بها عالمياً',
    google_maps_url            = 'https://maps.google.com/?q=AUB+Beirut',
    geo_lat                    = 33.9003, geo_lng = 35.4777,
    last_verified_at           = now()
  WHERE short = 'AUB';

  -- LAU
  UPDATE universities SET
    tuition_per_credit_usd     = 770,
    tuition_per_year_usd       = 18000,
    registration_fee_usd       = 450,
    has_installment_plan       = true,
    acceptance_rate_percent    = 35,
    min_gpa_required           = 2.80,
    ielts_min                  = 6.5,
    toefl_min                  = 88,
    application_deadline_fall  = '15 أبريل',
    campus_city                = 'بيروت + بيبلوس (حرمان)',
    has_dorms                  = true,
    dorm_cost_per_year_usd     = 6500,
    has_library_24h            = false,
    has_parking                = true,
    transport_from_beirut      = 'قريب من Hamra؛ حرم بيبلوس يبعد ٤٥ دقيقة شمالاً',
    graduation_rate_4yr_percent= 82,
    employment_rate_6mo_percent= 75,
    avg_salary_after_1yr_usd   = 16500,
    student_faculty_ratio      = '14:1',
    campus_vibe                = 'أكاديمي وطلابي حيوي، روح أمريكية حديثة',
    strengths                  = ARRAY['التمريض', 'الصيدلة', 'الهندسة', 'الإعلام'],
    ideal_student_profile      = 'طالب يبحث عن جامعة أمريكية النظام بقرب من بيروت',
    geo_lat                    = 33.8938, geo_lng = 35.4915,
    last_verified_at           = now()
  WHERE short = 'LAU';

  -- USJ
  UPDATE universities SET
    tuition_per_credit_usd     = 320,
    tuition_per_year_usd       = 7500,
    registration_fee_usd       = 200,
    has_installment_plan       = true,
    acceptance_rate_percent    = 40,
    min_gpa_required           = 2.70,
    ielts_min                  = 5.5,  -- French preferred
    application_deadline_fall  = '30 يونيو',
    campus_city                = 'بيروت — عدة حرم',
    has_dorms                  = false,
    has_library_24h            = false,
    has_parking                = true,
    transport_from_beirut      = 'حرم متعددة بكل بيروت — Mar Mikhael, Huvelin, Damas',
    employment_rate_6mo_percent= 72,
    avg_salary_after_1yr_usd   = 12500,
    student_faculty_ratio      = '15:1',
    campus_vibe                = 'جو فرنكوفوني أصيل، تركيز على القانون والطب والعلوم الإنسانية',
    strengths                  = ARRAY['القانون', 'الطب', 'علوم الترجمة', 'البحث الفرنكوفوني'],
    ideal_student_profile      = 'طالب فرنكوفوني يريد تعليماً قوياً بنفقات معقولة',
    geo_lat                    = 33.8892, geo_lng = 35.5043,
    last_verified_at           = now()
  WHERE short = 'USJ';

  -- UL (Lebanese University — public)
  UPDATE universities SET
    tuition_per_year_usd       = 200,
    registration_fee_usd       = 50,
    has_installment_plan       = false,
    acceptance_rate_percent    = 85,
    min_gpa_required           = NULL,
    application_deadline_fall  = '15 سبتمبر',
    campus_city                = 'فروع بكل المحافظات',
    has_dorms                  = false,
    has_library_24h            = false,
    has_parking                = true,
    transport_from_beirut      = 'حرم رئيسي بالحدث؛ فروع بصيدا، طرابلس، البقاع، النبطية',
    employment_rate_6mo_percent= 60,
    student_faculty_ratio      = '30:1',
    campus_vibe                = 'جامعة وطنية بالمعنى الكامل — تنوع طلابي ضخم، التحدي الأكبر هو البيروقراطية',
    strengths                  = ARRAY['الكلفة الرمزية', 'انتشار جغرافي', 'تنوع التخصصات'],
    ideal_student_profile      = 'طالب يبحث عن شهادة معتمدة بأقل تكلفة ممكنة',
    last_verified_at           = now()
  WHERE short IN ('UL','LU');

  -- USEK
  UPDATE universities SET
    tuition_per_credit_usd     = 380,
    tuition_per_year_usd       = 9000,
    registration_fee_usd       = 300,
    has_installment_plan       = true,
    acceptance_rate_percent    = 50,
    min_gpa_required           = 2.50,
    ielts_min                  = 5.5,
    application_deadline_fall  = '30 يوليو',
    campus_city                = 'الكسليك — جونية',
    has_dorms                  = true,
    dorm_cost_per_year_usd     = 4500,
    has_library_24h            = false,
    has_parking                = true,
    transport_from_beirut      = '٢٥ دقيقة شمال بيروت — جو ساحلي مريح',
    employment_rate_6mo_percent= 70,
    student_faculty_ratio      = '16:1',
    campus_vibe                = 'هادئ وعائلي، نظام جامعة كاثوليكية فرنكوفونية، التركيز على الفنون والطب والتجارة',
    strengths                  = ARRAY['الموسيقى', 'الفنون', 'العلوم الصحية'],
    ideal_student_profile      = 'طالب يبحث عن حرم هادئ خارج زحمة بيروت',
    geo_lat                    = 33.9817, geo_lng = 35.6111,
    last_verified_at           = now()
  WHERE short = 'USEK';
END $$;

-- ──────────────────────────────────────────────────────────────────────────
-- 3. UNIVERSITY FAQs — 5 questions × 5 universities = 25 rows
-- ──────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  aub_id integer; lau_id integer; usj_id integer; ul_id integer; usek_id integer;
BEGIN
  SELECT id INTO aub_id  FROM universities WHERE short = 'AUB'  LIMIT 1;
  SELECT id INTO lau_id  FROM universities WHERE short = 'LAU'  LIMIT 1;
  SELECT id INTO usj_id  FROM universities WHERE short = 'USJ'  LIMIT 1;
  SELECT id INTO ul_id   FROM universities WHERE short IN ('UL','LU') LIMIT 1;
  SELECT id INTO usek_id FROM universities WHERE short = 'USEK' LIMIT 1;

  IF aub_id IS NOT NULL THEN
    INSERT INTO university_faqs (university_id, question, answer, category, display_order) VALUES
    (aub_id, 'هل تقبل AUB بشهادة بكالوريا فرنسية؟',
            'نعم، AUB بتقبل البكالوريا الفرنسية مع تحويل معدل عبر جدول المعادلة الخاص فيها. المهم أن الفروع العلمية والرياضية بتساوي معدلاً معترفاً به.',
            'admission', 1),
    (aub_id, 'شو الفرق بين AUB Engineering وComputer Science من ناحية سوق العمل؟',
            'Engineering أوسع شغلاً بالخليج والمشاريع، Computer Science أعلى راتباً ابتدائياً مع فرصة عمل remote أكتر. CS يناسب من يحب التقنية الخالصة، Engineering لمن يحب التطبيق الفيزيائي.',
            'academic', 2),
    (aub_id, 'هل فيه curve بـ AUB؟',
            'نعم، معظم المواد فيها curve. الاعتقاد السائد إنه عشان نظام صعب، بس بالحقيقة هو معيار يقارنك بزملائك. مش معناه إنك لازم تاخد A، بل لازم تكون فوق المتوسط بصفك.',
            'academic', 3),
    (aub_id, 'كيف أحسب معدلي الـ GPA من البكالوريا اللبنانية لـ AUB؟',
            'AUB عندها جدول معادلة: ٧٠٪ = 2.7 GPA، ٨٠٪ = 3.3، ٩٠٪+ = 3.7+. بس المعدل وحده ما بكفي — كمان بياخدوا بالاعتبار امتحان القبول الخاص والـ SAT.',
            'admission', 4),
    (aub_id, 'شو أفضل سكن قريب من AUB بأسعار معقولة؟',
            'Hamra مكلف ($٧٠٠-١٢٠٠/شهر لشقة شخص واحد). البديل: Sanayeh و Mar Elias ($٤٠٠-٧٠٠). Dorms داخل الحرم ($٨٠٠٠/سنة) أرخص من الإيجار السنوي بـ Hamra.',
            'campus', 5);
  END IF;

  IF lau_id IS NOT NULL THEN
    INSERT INTO university_faqs (university_id, question, answer, category, display_order) VALUES
    (lau_id, 'شو الفرق بين حرم LAU بيروت وحرم بيبلوس؟',
            'حرم بيبلوس أصغر وأهدأ، أكثر طلاب الهندسة والصيدلة فيه. بيروت بحالها أكتر، فيه الإعلام والأعمال. التنقل بين الحرمين بالحافلة الجامعية بكل الاتجاهات يومياً.',
            'campus', 1),
    (lau_id, 'هل LAU بتقدّم منح كاملة؟',
            'نعم، Need-Based Aid قوي بـ LAU، بيغطي حتى ٧٥٪ من الرسوم للعائلات المؤهلة. الـ Merit Scholarships بيتوزّعو على الطلاب اللي معدلهم فوق ٨٥٪ بالـ BAC.',
            'fees', 2),
    (lau_id, 'كيف نظام التمريض بـ LAU وبيقولوا قوي؟',
            'برنامج التمريض بـ LAU من الأقوى بالمنطقة، معتمد دولياً ومتخرجينه شغّالين بكل دول الخليج وكندا وأمريكا. ٤ سنوات مكثفة + امتحانات سريرية مكثفة.',
            'academic', 3),
    (lau_id, 'متى بيفتح القبول وكيف أقدّم؟',
            'القبول للخريف بيفتح أكتوبر وبيسكّر ١٥ أبريل. التطبيق أونلاين عبر LAU portal، بيطلبو منك BAC results + رسالة دوافع + IELTS/TOEFL إذا متطلب.',
            'admission', 4),
    (lau_id, 'شو متوسط راتب خريج LAU بسوق لبنان؟',
            'متوسط راتب أول سنة بعد التخرج $٩٠٠-١٤٠٠ للهندسة، $٧٠٠-١٢٠٠ للأعمال، $١٠٠٠-١٦٠٠ للتمريض. بالخليج المعدل بيتضاعف ٢-٣ مرات.',
            'general', 5);
  END IF;

  IF usj_id IS NOT NULL THEN
    INSERT INTO university_faqs (university_id, question, answer, category, display_order) VALUES
    (usj_id, 'هل لازم أعرف فرنسي للدراسة بـ USJ؟',
            'لمعظم البرامج: نعم، خاصة الطب والقانون والآداب. في برامج بالإنجليزي بـ ESIB (هندسة) و IGE (إدارة دولية). إذا فرنسيك مش قوي، بيمكنك تاخد بريباراتوار سنة قبل ما تبدأ.',
            'academic', 1),
    (usj_id, 'كيف نظام كلية الطب بـ USJ؟',
            '٧ سنوات: ٢ تحضيرية (PCEM) + ٥ سريرية. القبول صعب، فيه امتحان قبول بمواد علمية. التدريب بـ Hôtel-Dieu de France و RHU (مستشفى الجامعة).',
            'academic', 2),
    (usj_id, 'هل شهادة USJ معترف فيها بفرنسا؟',
            'نعم، USJ معتمدة من وزارة التعليم الفرنسية. كتير من خريجينها بيكملو دراسات عليا بفرنسا مباشرة، خاصة بالطب والقانون.',
            'general', 3),
    (usj_id, 'وين الحرم الرئيسي وكيف الوصول؟',
            'USJ ما عندها حرم واحد كبير، بل عدة حرم بكل بيروت: Huvelin (سن الفيل — العلوم الإنسانية)، Damas Road (الطب)، Mar Mikhael (الفنون)، Sodeco (إدارة الأعمال).',
            'campus', 4),
    (usj_id, 'كم تكلفة الدراسة سنوياً بـ USJ مقارنة بـ AUB؟',
            'USJ أرخص بحوالي ٥٠٪. متوسط الرسوم السنوية $٧,٥٠٠ مقارنة بـ $٢٢,٠٠٠ بـ AUB. هاد بيخلّيها خيار قوي للعائلات اللي بدها جامعة معتمدة بميزانية معقولة.',
            'fees', 5);
  END IF;

  IF ul_id IS NOT NULL THEN
    INSERT INTO university_faqs (university_id, question, answer, category, display_order) VALUES
    (ul_id, 'هل شهادة الجامعة اللبنانية معترف فيها بالخليج؟',
            'نعم، شهادات UL معتمدة بكل دول الخليج، خاصة بالتخصصات الطبية والهندسية. التحدي ما بالاعتراف، بل بقوة الـ CV والمشاريع — لازم تكمّل بدورات وتدريبات.',
            'general', 1),
    (ul_id, 'هل بقدر أحوّل من جامعة خاصة لـ UL؟',
            'نعم، فيه نظام تحويل (إيكفالنس). بتقدّم بطلب التحويل ومعك transcripts، الجامعة بتحدد كم مادة تتعادل لك. عادة بتخسر فصل أو فصلين.',
            'admission', 2),
    (ul_id, 'كم رسوم UL سنوياً وشو تشمل؟',
            'الرسوم رمزية جداً: حوالي $١٥٠-٢٥٠ سنوياً، بيشمل تسجيل + بعض الكتب الأساسية. السكن والمواصلات والكتب الإضافية بدها ميزانية منفصلة.',
            'fees', 3),
    (ul_id, 'كيف القبول بكلية الطب بـ UL؟',
            'صعب جداً وتنافسي. لازم تنجح بامتحان مباري بعد سنة تحضيرية (PCEM). المقاعد محدودة (~٢٠٠ مقعد بكل لبنان) ومنافسة عالية جداً.',
            'admission', 4),
    (ul_id, 'هل التعليم بـ UL بالعربي ولا الإنجليزي/الفرنسي؟',
            'بيختلف بحسب الكلية: الحقوق والآداب بالعربي والفرنسي، الهندسة والطب بالفرنسي والإنجليزي. الأساتذة بيشرحوا بلغة المادة، الكتب أغلبها مرجعية أجنبية.',
            'academic', 5);
  END IF;

  IF usek_id IS NOT NULL THEN
    INSERT INTO university_faqs (university_id, question, answer, category, display_order) VALUES
    (usek_id, 'هل USEK بتقدّم منح للطلاب من خارج لبنان؟',
            'نعم، USEK عندها منح للطلاب العرب، خاصة لطلاب الفنون والموسيقى. التقديم عبر portal الجامعة مع portfolio فني.',
            'fees', 1),
    (usek_id, 'كيف برنامج الموسيقى بـ USEK؟',
            'من أعرق برامج الموسيقى بالشرق الأوسط، فيه ٤ مسارات: classical, jazz, music education, sound engineering. التدريب على آلات احترافية، حفلات سنوية.',
            'academic', 2),
    (usek_id, 'وين تقع USEK وكيف الوصول؟',
            'الحرم الرئيسي بالكسليك، جنب جونية. ٢٥ دقيقة شمال بيروت بالسيارة، فيه باص جامعي من بيروت والمتن صباحاً ومساءً.',
            'campus', 3),
    (usek_id, 'هل USEK جامعة دينية كاثوليكية؟',
            'بأسلوبها نعم — تأسست من قِبل الرهبانية المارونية، وفيها كرسي للدراسات اللاهوتية. بس البرامج الأكاديمية مستقلة ومفتوحة لكل الطلاب من كل الأديان.',
            'general', 4),
    (usek_id, 'متى آخر موعد للقبول وما المتطلبات الأساسية؟',
            'القبول للخريف بيسكّر ٣٠ يوليو. المطلوب: BAC results + transcript ثانوية + portfolio (للفنون) + IELTS 5.5 أو امتحان لغة بـ USEK.',
            'admission', 5);
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────────────────
-- 4. STUDENT STORIES — 3 day-in-life stories
-- ──────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  aub_id integer; usj_id integer; lau_id integer;
BEGIN
  SELECT id INTO aub_id FROM universities WHERE short = 'AUB' LIMIT 1;
  SELECT id INTO usj_id FROM universities WHERE short = 'USJ' LIMIT 1;
  SELECT id INTO lau_id FROM universities WHERE short = 'LAU' LIMIT 1;

  -- AUB engineering 2nd year
  IF aub_id IS NOT NULL THEN
    INSERT INTO student_stories (
      university_id, student_name, year_of_study, title,
      morning_routine, academic_life, social_life, challenges, advice,
      pros, cons, thumbnail_emoji, is_published
    ) VALUES (
      aub_id, 'كريم', 'السنة الثانية',
      'يوم بحياة طالب هندسة كهرباء بـ AUB',
      'بصحى ٧:٣٠، بمشي على Hamra لـ Starbucks للقهوة، بعدها بمشي ع الحرم. أوّل محاضرة Signals & Systems الساعة ٩.',
      'بنحضر محاضرات نظرية بالصبح، بعد الضهر بالـ lab — في hands-on باستمرار. كل أسبوع problem set لكل مادة، بمتوسط ٢٠ ساعة دراسة بالأسبوع غير المحاضرات.',
      'بعد المحاضرات بنروح Sandwich w Saj بـ Bliss Street مع الشباب، بنلعب على PlayStation بـ student lounge، أو بنطلع نحضّر للـ midterms سوا. عضو بـ Engineering Society — بنظّم events للطلاب الجدد.',
      'الـ workload صعب جداً، خاصة Calculus 3 و Differential Equations. الـ curve بيخوّف، بس بعد فصل أو اثنين بتعتاد. أحياناً بحس إنه ما عندي وقت لشي غير الدراسة.',
      'لا تحاول تكون perfect من أول يوم. خد سنة لتعتاد على النظام، استفسر من أساتذتك وزملائك. الانضمام لـ club بيعمل فرق ضخم بالـ networking.',
      ARRAY['تعليم عالمي المستوى', 'شبكة خريجين قوية', 'فرص internships بأكبر الشركات'],
      ARRAY['مكلف جداً', 'workload يومي مرهق', 'منافسة عالية'],
      '⚡', true
    );
  END IF;

  -- USJ medicine 3rd year
  IF usj_id IS NOT NULL THEN
    INSERT INTO student_stories (
      university_id, student_name, year_of_study, title,
      morning_routine, academic_life, social_life, challenges, advice,
      pros, cons, thumbnail_emoji, is_published
    ) VALUES (
      usj_id, 'ليلى', 'السنة الثالثة',
      'يوم بحياة طالبة طب بـ USJ',
      'بصحى ٦:٣٠ صبحاً عشان ابدأ بـ Hôtel-Dieu الساعة ٨. بفطر بسرعة وبركب باص الجامعة من سن الفيل.',
      'صباحاً جولة سريرية بالمستشفى مع الأستاذ — بنشوف مرضى حقيقيين، بنتعلم كيف نسأل ونفحص. بعد الضهر محاضرات Pharmacology و Pathology، وبالليل دراسة لـ ٤-٥ ساعات.',
      'وقت الفرفشة محدود جداً — مرة بالأسبوع مع زميلاتي بـ Mar Mikhael. بشارك بـ student council للطب، بنظم events لجمع تبرعات للمستشفى.',
      'التوتر النفسي. أحياناً بشك إذا اخترت التخصص الصح. الـ exams كل ٣ أسابيع تقريباً. وفي مرضى صعب نتعامل مع حالاتهم نفسياً.',
      'الطب مش رومانسي زي ما الفيديوهات بتصوّر. لازم تكون عندك stamina للدراسة الطويلة (٧+ سنوات) و emotional resilience للحالات الصعبة.',
      ARRAY['نظام أكاديمي قوي', 'تدريب سريري ممتاز بـ Hôtel-Dieu', 'شبكة طبية فرنسية-لبنانية'],
      ARRAY['الـ workload مرهق', 'الـ pace سريع جداً', 'وقت شخصي محدود'],
      '🩺', true
    );
  END IF;

  -- LAU business 1st year
  IF lau_id IS NOT NULL THEN
    INSERT INTO student_stories (
      university_id, student_name, year_of_study, title,
      morning_routine, academic_life, social_life, challenges, advice,
      pros, cons, thumbnail_emoji, is_published
    ) VALUES (
      lau_id, 'يوسف', 'السنة الأولى',
      'يوم بحياة طالب إدارة أعمال بـ LAU',
      'بصحى ٨ ع شغل لأن أول محاضرة الساعة ١٠. بفطر بالبيت، بمشي بـ Hamra، بشتري قهوة من Roastery وبدخل ع الحرم.',
      'فيه ٤ محاضرات بالأسبوع: Marketing, Accounting, Microeconomics, Statistics. الأساتذة interactive، بحبو الـ case studies. كل week project لـ group من ٤ طلاب.',
      'كتير أحلى من المدرسة. حفلات بـ student lounge، نوادي رياضية وثقافية، رحلات للجبل أحياناً. صار عندي شبكة من زملاء حلوة بسرعة.',
      'الفجوة بين الثانوية والجامعة كبيرة. الـ time management صعب أول فصل. الـ group projects أحياناً بتتأخر لأن مش كل الفريق ملتزم.',
      'انضم لـ club من أول أسبوع. شارك بـ discussions بالصف حتى لو خايف. الأساتذة هون بقدّروا الـ initiative كتير. لا تخاف تطلب help من Academic Advisor.',
      ARRAY['جو طلابي حيوي ودافئ', 'تعليم عملي بـ case studies', 'فرص club و leadership'],
      ARRAY['تكلفة عالية', 'أول فصل صعب', 'الـ exams بتزحم بنفس الأسبوع'],
      '💼', true
    );
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════
-- Done. Glossary: 30 terms. Universities: 5 enriched. FAQs: 25. Stories: 3.
-- Re-run safely — ON CONFLICT and UPDATE...WHERE handle idempotency.
-- ════════════════════════════════════════════════════════════════════════════
