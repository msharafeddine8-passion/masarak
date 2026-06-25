-- ════════════════════════════════════════════════════════════════════════════
-- Masarak GLOBAL — Seed the 6 human-verified scholarships (from the seed CSV).
-- 24 June 2026. source_confidence='official', last_verified_at=2026-06-24.
-- These are the ONLY hand-loaded rows; all further data comes from the Phase-B
-- ingestion+review pipeline (no fabrication).
-- ════════════════════════════════════════════════════════════════════════════

insert into scholarships_global
  (slug, name_en, name_ar, host_country, is_multi_country, provider_type, funding_type,
   coverage_en, language, ielts_min, toefl_min, seats, eligibility_en, deadline_note, intake,
   application_link, official_source, renewal_en, description_short_en, description_short_ar,
   status, source_confidence, last_verified_at)
values
  ($q$daad-scholarships-germany$q$, $q$DAAD Scholarships (Study Scholarships, EPOS, STEM)$q$, $q$منح DAAD الألمانية (الخدمة الألمانية للتبادل الأكاديمي)$q$, 'DE', false, 'government', 'fully_funded',
   $q$Public-university tuition (largely free); monthly stipend EUR 992 (Master's) / EUR 1,300 (PhD); travel allowance; health, accident & personal liability insurance; possible rent/family subsidies and German language course.$q$,
   'english;german', null, null, $q$100000+ awarded annually (all programs)$q$,
   $q$Completed first degree (Bachelor for Master's; Master's for PhD). EPOS requires 2+ years professional experience. Must not have resided in Germany >15 months at deadline. Language proof per program.$q$,
   $q$Varies by sub-program; many fall Aug-Nov of the year before. Verify each program in funding-guide.de.$q$, $q$Usually Oct (start of academic year)$q$,
   $q$https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/$q$, $q$https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/$q$,
   $q$Continues after first year subject to satisfactory academic progress.$q$,
   $q$Germany's flagship umbrella of government-funded scholarships for Master's, PhD and research, run by the German Academic Exchange Service.$q$,
   $q$المظلة الرئيسية للمنح الحكومية الألمانية للماجستير والدكتوراه والبحث، تديرها الخدمة الألمانية للتبادل الأكاديمي.$q$,
   'open','official','2026-06-24'),

  ($q$chevening-scholarship-uk$q$, $q$Chevening Scholarship$q$, $q$منحة تشيفنينغ$q$, 'GB', false, 'government', 'fully_funded',
   $q$Full tuition; monthly living stipend (rate higher in London); return airfare; arrival allowance; departure allowance; one UK visa cost; travel grant for Chevening events.$q$,
   'english', 6.5, null, $q$~1,500 per year$q$,
   $q$Citizen of a Chevening-eligible country; ~2,800 hours (about 2 years) work experience; undergraduate degree (UK 2:1 equivalent); secure an unconditional UK master's offer by the offer deadline; return home 2 years after. Chevening itself does not require an English test, but the university does.$q$,
   $q$Annual; applications open ~August, close ~early October (2027 cycle deadline ~7 Oct 2026).$q$, $q$Sep/Oct$q$,
   $q$https://www.chevening.org/apply/$q$, $q$https://www.chevening.org/scholarships/$q$,
   $q$One-year award; not renewable.$q$,
   $q$The UK government's flagship fully-funded one-year Master's scholarship for future leaders, funded by the FCDO.$q$,
   $q$المنحة الرائدة الممولة بالكامل من الحكومة البريطانية لماجستير لمدة سنة، موجّهة للقادة المستقبليين.$q$,
   'upcoming','official','2026-06-24'),

  ($q$turkiye-burslari-scholarship$q$, $q$Turkiye Scholarships (Turkiye Burslari)$q$, $q$المنح التركية (تركيا بورسلاري)$q$, 'TR', false, 'government', 'fully_funded',
   $q$Full tuition + guaranteed university placement; monthly stipend (approx UG 4,500 TL / MA 6,500 TL / PhD 9,000 TL - rates change); free dormitory accommodation; health insurance; round-trip airfare; one free year of Turkish language course.$q$,
   'turkish;english', null, null, $q$~5,000 per year$q$,
   $q$Academic achievement: 70% (Bachelor) / 75% (Master/PhD) / 90% (medical). International students (non-Turkish citizens). Age: under 21 (Bachelor), under 30 (Master), under 35 (PhD). No IELTS required; no application fee. Scholarship and admission via one application.$q$,
   $q$Annual single window ~10 Jan - 20 Feb (2026 cycle extended to 25 Feb).$q$, $q$Fall$q$,
   $q$https://tbbs.turkiyeburslari.gov.tr/$q$, $q$https://www.turkiyeburslari.gov.tr/$q$,
   $q$Continues for program duration subject to academic standing.$q$,
   $q$Turkey's government scholarship that bundles full funding with guaranteed university placement, dorm and a Turkish language year - very popular across the Arab world.$q$,
   $q$المنحة الحكومية التركية التي تجمع التمويل الكامل مع تنسيب جامعي مضمون وسكن وسنة لغة تركية - رائجة جداً في العالم العربي.$q$,
   'annual','official','2026-06-24'),

  ($q$erasmus-mundus-joint-masters$q$, $q$Erasmus Mundus Joint Masters (EMJM)$q$, $q$منح إيراسموس موندوس (الماجستير المشترك)$q$, null, true, 'government', 'fully_funded',
   $q$Full tuition waiver; living allowance EUR 1,400/month (max 24 months); contribution to travel & installation costs; insurance. Study takes place in at least 2 European countries.$q$,
   'english', null, null, $q$Varies per program$q$,
   $q$Bachelor's degree (or final-year, graduating before start). Apply to specific joint programs in the official catalogue; max 3 EMJM programs per year. English proof (IELTS/TOEFL) per program.$q$,
   $q$Multi-country EU consortia (host country varies by program). Per-program; typically Oct-Jan for the following September.$q$, $q$Sep$q$,
   $q$https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters$q$, $q$https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters$q$,
   $q$Covers the full joint-program duration (up to 24 months).$q$,
   $q$EU-funded fully-funded joint Master's delivered by consortia of European universities, with study in multiple countries.$q$,
   $q$ماجستير مشترك ممول بالكامل من الاتحاد الأوروبي، تقدّمه تحالفات جامعات أوروبية مع دراسة في أكثر من بلد.$q$,
   'annual','official','2026-06-24'),

  ($q$fulbright-foreign-student-program$q$, $q$Fulbright Foreign Student Program$q$, $q$منحة فولبرايت للطلاب الأجانب$q$, 'US', false, 'government', 'fully_funded',
   $q$Tuition; living stipend; airfare; health insurance; funded for the duration of study. (Exact package varies by country.)$q$,
   'english', 6.5, 79, $q$~4,000 per year globally$q$,
   $q$GPA ~3.0/4.0 typical (no strict minimum). Citizen of a participating country (not US citizens/residents). Bachelor's degree. Apply through home-country Fulbright Commission / US Embassy. Graduate level only (no undergrad, no clinical medicine). Return-home requirement. Rules vary by country.$q$,
   $q$Set per country by local commission/embassy; typically Feb-Oct of the year before.$q$, $q$Fall$q$,
   $q$https://foreign.fulbrightonline.org/apply$q$, $q$https://foreign.fulbrightonline.org/about/foreign-student-program$q$,
   $q$Funded for program duration; extensions case-by-case (esp. PhD).$q$,
   $q$The US government's flagship graduate scholarship for international students, administered country-by-country via Fulbright commissions and US embassies.$q$,
   $q$المنحة الأمريكية الحكومية الرائدة للدراسات العليا للطلاب الدوليين، تُدار حسب كل بلد عبر لجان فولبرايت والسفارات الأمريكية.$q$,
   'annual','official','2026-06-24'),

  ($q$mext-japanese-government-scholarship$q$, $q$Japanese Government (MEXT) Scholarship$q$, $q$منحة الحكومة اليابانية (مونبوكاغاكوشو - MEXT)$q$, 'JP', false, 'government', 'fully_funded',
   $q$Full tuition + entrance/exam fees; monthly stipend (~JPY 117,000 for research/graduate students, with regional supplements); round-trip airfare to Japan.$q$,
   'japanese;english', null, null, $q$Varies by country/route$q$,
   $q$GPA e.g. CGPA >= 2.30/3.00 by MEXT formula for some tracks. Nationality of a country with diplomatic relations with Japan; within age limits (varies by track); not military personnel. Two routes: Embassy Recommendation (Japanese language exam often required) or University Recommendation (English B2 accepted for many programs).$q$,
   $q$Embassy route varies by country (~Feb-May; e.g. Saudi embassy ~June); University route ~autumn of the year before.$q$, $q$Sep/Oct (some Apr)$q$,
   $q$https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/$q$, $q$https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/$q$,
   $q$Funded for standard program length; no extensions.$q$,
   $q$Japan's government scholarship covering tuition, a monthly stipend and airfare for Bachelor's, Master's and PhD, via embassy or university recommendation.$q$,
   $q$المنحة الحكومية اليابانية التي تغطي الرسوم وراتباً شهرياً وتذاكر الطيران للبكالوريوس والماجستير والدكتوراه، عبر ترشيح السفارة أو الجامعة.$q$,
   'annual','official','2026-06-24')
on conflict (slug) do nothing;

-- Degree-level junctions (semicolon-separated `degree_levels` from the CSV).
insert into scholarship_degree_levels (scholarship_id, degree_code)
select s.id, d.code
from scholarships_global s
join (values
  ('daad-scholarships-germany','master'),('daad-scholarships-germany','phd'),('daad-scholarships-germany','postdoc'),
  ('chevening-scholarship-uk','master'),
  ('turkiye-burslari-scholarship','bachelor'),('turkiye-burslari-scholarship','master'),('turkiye-burslari-scholarship','phd'),
  ('erasmus-mundus-joint-masters','master'),
  ('fulbright-foreign-student-program','master'),('fulbright-foreign-student-program','phd'),
  ('mext-japanese-government-scholarship','bachelor'),('mext-japanese-government-scholarship','master'),('mext-japanese-government-scholarship','phd')
) as d(slug, code) on d.slug = s.slug
on conflict do nothing;
