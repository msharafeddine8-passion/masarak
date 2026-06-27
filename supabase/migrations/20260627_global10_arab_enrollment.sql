-- global10: student_population for the 54 Arab-country universities (JO/EG/SA/AE).
-- Researched from Wikipedia infoboxes, official university "facts/statistics" pages,
-- and QS/THE profiles (4 parallel web-research passes), sanity-checked, never fabricated.
-- Marked source_confidence='aggregated'. intl_students_pct / acceptance_rate left NULL
-- for these (volatile, no reliable single source). A few figures are medium/low
-- confidence where sources conflicted (Al-Balqa, Suez Canal, Future University Egypt).
update universities_global u
set student_population = v.pop,
    source_confidence  = 'aggregated',
    last_verified_at   = now(),
    updated_at         = now()
from (values
  -- Jordan
  (23,47000),(24,30000),(44,41000),(45,30000),(46,4700),(47,5000),(48,67000),
  (49,17000),(50,17000),(51,10700),(52,8000),(53,6900),(54,8700),
  -- Egypt
  (25,207853),(26,6980),(55,189822),(56,182129),(57,185000),(58,93000),(59,197175),
  (60,163709),(61,110176),(62,21325),(63,371034),(64,12947),(65,10921),(66,9085),
  -- Saudi Arabia
  (27,61412),(28,117096),(29,13772),(67,1741),(68,28778),(69,61708),(70,75000),
  (71,33825),(72,94843),(73,51962),(74,90000),(75,22000),(76,4800),(77,6000),
  -- United Arab Emirates
  (30,19800),(31,4000),(32,6727),(78,21174),(79,7748),(80,8000),(81,6500),
  (82,2000),(83,1600),(84,3000),(85,2200),(86,5000),(87,23000)
) as v(id, pop)
where u.id = v.id;
