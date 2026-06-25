-- ════════════════════════════════════════════════════════════════════════════
-- Masarak GLOBAL — add 10 well-known international scholarships. 25 June 2026.
-- source_confidence = 'aggregated' (compiled from official program pages; NOT
-- yet human-verified like the 6 'official' CSV rows). Deadlines are intentionally
-- conservative ("annual — verify at the official source") because exact dates
-- change yearly. The UI links the official_source and tells users to verify.
-- ════════════════════════════════════════════════════════════════════════════

insert into scholarships_global
  (slug, name_en, name_ar, host_country, is_multi_country, provider_type, funding_type,
   coverage_en, language, eligibility_en, deadline_note, intake, application_link, official_source,
   description_short_ar, status, source_confidence, last_verified_at)
values
  ($q$global-korea-scholarship-gks$q$, $q$Global Korea Scholarship (GKS)$q$, $q$منحة الحكومة الكورية (GKS)$q$, 'KR', false, 'government', 'fully_funded',
   $q$Full tuition; round-trip airfare; monthly living allowance; health insurance; and a one-year Korean language course before the degree.$q$,
   'korean;english', $q$International students (non-Korean). Undergraduate (GKS-U) and graduate (GKS-G) tracks. Apply via the Korean Embassy or a Korean university. Age/GPA limits per track.$q$,
   $q$Annual — Embassy track usually ~Sep–Oct, University track varies. Verify at studyinkorea.go.kr.$q$, $q$Mar / Sep$q$,
   $q$https://www.studyinkorea.go.kr/en/sub/gks/allnew_invite.do$q$, $q$https://www.studyinkorea.go.kr/en/sub/gks/allnew_invite.do$q$,
   $q$منحة الحكومة الكورية الكاملة للبكالوريوس والدراسات العليا: رسوم + راتب + طيران + تأمين + سنة لغة كورية.$q$,
   'annual', 'aggregated', '2026-06-25'),

  ($q$chinese-government-scholarship-csc$q$, $q$Chinese Government Scholarship (CSC)$q$, $q$منحة الحكومة الصينية (CSC)$q$, 'CN', false, 'government', 'fully_funded',
   $q$Full or partial tuition; on-campus accommodation or housing allowance; monthly stipend (approx CNY 2,500 undergrad to 3,500 graduate); comprehensive medical insurance. Available at 280+ Chinese universities.$q$,
   'chinese;english', $q$Non-Chinese citizens in good health. Bachelor/Master/PhD. Apply via a Chinese university, the CSC, or your home-country authority. Age limits per level.$q$,
   $q$Annual — typically ~Dec–Apr for the following September. Verify at campuschina.org.$q$, $q$Sep$q$,
   $q$https://www.campuschina.org/$q$, $q$https://www.campuschina.org/$q$,
   $q$منحة الحكومة الصينية في أكثر من 280 جامعة: رسوم + سكن + راتب شهري + تأمين طبي.$q$,
   'annual', 'aggregated', '2026-06-25'),

  ($q$eiffel-excellence-scholarship-france$q$, $q$Eiffel Excellence Scholarship$q$, $q$منحة إيفل الفرنسية للتميّز$q$, 'FR', false, 'government', 'partial',
   $q$Monthly allowance (~EUR 1,181 Master / EUR 1,700 PhD); international travel; health insurance; cultural activities. Tuition is NOT guaranteed (depends on the institution).$q$,
   'french;english', $q$International students (non-French). Master's and PhD. Candidates are nominated by the French host institution — you cannot apply directly. Age limits apply.$q$,
   $q$Annual — institutions nominate ~Dec–Jan. Verify at campusfrance.org.$q$, $q$Sep$q$,
   $q$https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence$q$, $q$https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence$q$,
   $q$منحة إيفل الفرنسية: راتب شهري + سفر + تأمين (الرسوم حسب المؤسسة). الترشيح عبر الجامعة الفرنسية.$q$,
   'annual', 'aggregated', '2026-06-25'),

  ($q$vanier-canada-graduate-scholarship$q$, $q$Vanier Canada Graduate Scholarships$q$, $q$منحة فانييه الكندية للدكتوراه$q$, 'CA', false, 'government', 'fully_funded',
   $q$CAD 50,000 per year for three years during doctoral studies. Awarded for academic excellence, research potential, and leadership.$q$,
   'english;french', $q$Doctoral (PhD) students nominated by a Canadian university. Open to Canadian and international students. You must be nominated — apply through the institution.$q$,
   $q$Annual — universities set internal deadlines (often early fall). Verify at vanier.gc.ca.$q$, $q$Sep$q$,
   $q$https://vanier.gc.ca/en/home-accueil.html$q$, $q$https://vanier.gc.ca/en/home-accueil.html$q$,
   $q$منحة فانييه الكندية للدكتوراه: 50,000 دولار كندي سنوياً لمدة 3 سنوات. الترشيح عبر الجامعة.$q$,
   'annual', 'aggregated', '2026-06-25'),

  ($q$australia-awards-scholarships$q$, $q$Australia Awards Scholarships$q$, $q$منح أستراليا الحكومية$q$, 'AU', false, 'government', 'fully_funded',
   $q$Full tuition; return air travel; a contribution to living expenses; Overseas Student Health Cover (OSHC); and introductory academic support.$q$,
   'english', $q$Citizens of eligible (mostly developing) partner countries. Primarily Master's (some Bachelor). Must return home for 2 years after. IELTS/TOEFL required.$q$,
   $q$Annual — application window typically ~Feb–Apr. Eligibility varies by country. Verify at dfat.gov.au.$q$, $q$Varies$q$,
   $q$https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships$q$, $q$https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships$q$,
   $q$منح أستراليا الحكومية للدراسة: رسوم كاملة + معيشة + طيران + تأمين صحي (OSHC). للدول الشريكة المؤهّلة.$q$,
   'annual', 'aggregated', '2026-06-25'),

  ($q$commonwealth-scholarships-uk$q$, $q$Commonwealth Scholarships (UK)$q$, $q$منح الكومنولث البريطانية$q$, 'GB', false, 'government', 'fully_funded',
   $q$Full tuition; return airfare; monthly living stipend; and other allowances. Master's and PhD in the UK for citizens of Commonwealth countries.$q$,
   'english', $q$Citizens of eligible Commonwealth countries (with emphasis on low/middle-income). Master's and PhD. Apply via your national nominating agency or selected universities.$q$,
   $q$Annual — varies by stream; many close ~Oct–Dec. Verify at cscuk.fcdo.gov.uk.$q$, $q$Sep$q$,
   $q$https://cscuk.fcdo.gov.uk/scholarships/$q$, $q$https://cscuk.fcdo.gov.uk/scholarships/$q$,
   $q$منح الكومنولث البريطانية لطلاب دول الكومنولث: رسوم كاملة + راتب شهري + طيران.$q$,
   'annual', 'aggregated', '2026-06-25'),

  ($q$swiss-government-excellence-scholarships$q$, $q$Swiss Government Excellence Scholarships$q$, $q$منح الحكومة السويسرية للتميّز$q$, 'CH', false, 'government', 'fully_funded',
   $q$Monthly stipend; tuition fee exemption; health insurance; housing allowance. Mainly for PhD/postdoctoral research (and some research-master tracks).$q$,
   'english;german;french', $q$Researchers/graduates nominated via the Swiss Embassy in your country. PhD, postdoc, or research stays. Age and degree-recency limits apply.$q$,
   $q$Annual — applications via the Swiss Embassy, typically ~Aug–Dec. Verify at sbfi.admin.ch.$q$, $q$Sep$q$,
   $q$https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html$q$, $q$https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html$q$,
   $q$منح الحكومة السويسرية للتميّز (بحثية/دكتوراه): راتب + إعفاء رسوم + تأمين + سكن. عبر السفارة السويسرية.$q$,
   'annual', 'aggregated', '2026-06-25'),

  ($q$swedish-institute-scholarships$q$, $q$Swedish Institute Scholarships for Global Professionals$q$, $q$منح المعهد السويدي للمحترفين$q$, 'SE', false, 'government', 'fully_funded',
   $q$Full tuition; monthly living allowance; insurance; travel grant; plus access to the SI alumni network. For Master's programmes in Sweden.$q$,
   'english', $q$Citizens of eligible countries with work/leadership experience. Master's level. You must first be admitted to an eligible Swedish Master's programme.$q$,
   $q$Annual — typically a short window in ~Feb. Verify at si.se.$q$, $q$Aug$q$,
   $q$https://si.se/en/apply/scholarships/$q$, $q$https://si.se/en/apply/scholarships/$q$,
   $q$منح المعهد السويدي للماجستير: رسوم كاملة + معيشة + تأمين + سفر + شبكة خرّيجين.$q$,
   'annual', 'aggregated', '2026-06-25'),

  ($q$holland-scholarship$q$, $q$Holland Scholarship$q$, $q$منحة هولندا$q$, 'NL', false, 'government', 'partial',
   $q$A one-time EUR 5,000 grant in the first year of study (a partial award — not full funding). For Bachelor's or Master's at participating Dutch institutions.$q$,
   'english', $q$Non-EEA international students. Bachelor's or Master's. Apply directly to a participating Dutch university (each sets its own deadline).$q$,
   $q$Annual — deadlines set per university, often ~Feb–May. Verify at studyinnl.org.$q$, $q$Sep$q$,
   $q$https://www.studyinnl.org/finances/holland-scholarship$q$, $q$https://www.studyinnl.org/finances/holland-scholarship$q$,
   $q$منحة هولندا: 5,000 يورو دفعة واحدة للسنة الأولى (جزئية). عبر الجامعة الهولندية المشارِكة.$q$,
   'annual', 'aggregated', '2026-06-25'),

  ($q$kaust-fellowship-saudi$q$, $q$KAUST Fellowship$q$, $q$زمالة جامعة الملك عبدالله (كاوست)$q$, 'SA', false, 'university', 'fully_funded',
   $q$Full tuition; generous monthly living stipend; free on-campus housing; medical and dental coverage; relocation support. For Master's and PhD at KAUST.$q$,
   'english', $q$Strong students in science & engineering worldwide. Master's and PhD. No application fee. Admission and funding via a single application.$q$,
   $q$Rolling / annual — priority review for fall admission. Verify at kaust.edu.sa.$q$, $q$Aug / Jan$q$,
   $q$https://www.kaust.edu.sa/en/study/admissions$q$, $q$https://www.kaust.edu.sa/en/study/admissions$q$,
   $q$زمالة جامعة كاوست السعودية (علوم وهندسة): رسوم كاملة + راتب + سكن مجاني + تأمين. بدون رسوم تقديم.$q$,
   'annual', 'aggregated', '2026-06-25')
on conflict (slug) do nothing;

-- Degree-level junctions
insert into scholarship_degree_levels (scholarship_id, degree_code)
select s.id, d.code from scholarships_global s
join (values
  ('global-korea-scholarship-gks','bachelor'),('global-korea-scholarship-gks','master'),('global-korea-scholarship-gks','phd'),
  ('chinese-government-scholarship-csc','bachelor'),('chinese-government-scholarship-csc','master'),('chinese-government-scholarship-csc','phd'),
  ('eiffel-excellence-scholarship-france','master'),('eiffel-excellence-scholarship-france','phd'),
  ('vanier-canada-graduate-scholarship','phd'),
  ('australia-awards-scholarships','master'),
  ('commonwealth-scholarships-uk','master'),('commonwealth-scholarships-uk','phd'),
  ('swiss-government-excellence-scholarships','phd'),('swiss-government-excellence-scholarships','postdoc'),
  ('swedish-institute-scholarships','master'),
  ('holland-scholarship','bachelor'),('holland-scholarship','master'),
  ('kaust-fellowship-saudi','master'),('kaust-fellowship-saudi','phd')
) as d(slug, code) on d.slug = s.slug
on conflict do nothing;
