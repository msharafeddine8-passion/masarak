// Generate INSERT for CRDP-verified schools from the research report's HTML table.
// Only real, cited fields; missing fields left NULL (no fabrication).
// Duplicates already in DB (Brummana=برمانا العالية, زحلة الرسمية) excluded.
const MAP = {'ا':'a','أ':'a','إ':'i','آ':'a','ب':'b','ت':'t','ث':'th','ج':'j','ح':'h','خ':'kh','د':'d','ذ':'th','ر':'r','ز':'z','س':'s','ش':'sh','ص':'s','ض':'d','ط':'t','ظ':'z','ع':'a','غ':'gh','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w','ؤ':'w','ي':'y','ى':'a','ئ':'y','ء':'','ة':'a','ّ':'','َ':'','ُ':'','ِ':'','ً':'','ٌ':'','ٍ':'','ْ':''};
const translit = s => [...s].map(c => MAP[c] ?? c).join('');
const slugify = n => (translit(n).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'school');

// [name, governorate, qada, type(official/private/unrwa), gender(mixed/girls/boys/null),
//  foreignLangs[], stages[], phone|null, students]
const R = [
  ["الأورغواي الرسمية المختلطة - الأشرفية الأولى","بيروت","بيروت","official","mixed",["French"],["kindergarten","primary","intermediate"],"01425507",254],
  ["القلب الأقدس - الفرير","بيروت","بيروت","private",null,["French","English"],["kindergarten","primary","intermediate","secondary"],"01445600",1215],
  ["ثانوية جبيل الرسمية","جبل لبنان","جبيل","official",null,["French"],["secondary"],"09540338",583],
  ["ثانوية طرابلس الرسمية للبنات","الشمال","طرابلس","official","girls",["French"],["intermediate","secondary"],"06625181",435],
  ["ثانوية حلبا الرسمية","عكار","عكار","official",null,["French","English"],["secondary"],"06692921",723],
  ["ثانوية الهرمل الرسمية","بعلبك الهرمل","الهرمل","official",null,["French"],["intermediate","secondary"],"08200780",409],
  ["ثانوية حارة صيدا الرسمية","الجنوب","صيدا","official",null,["French","English"],["intermediate","secondary"],"07727600",315],
  ["ثانوية الأقصى المختلطة","الجنوب","صور","unrwa","mixed",["English"],["secondary"],null,587],
  ["فريحة الحاج علي المتوسطة الرسمية للبنات","النبطية","النبطية","official","girls",["French"],["primary","intermediate"],"07760579",105],
];

const TYPE_AR = { official:"رسمية", private:"خاصة", unrwa:"رسمية" };
const FLANG_AR = { French:"فرنسي", English:"إنجليزي" };
const q = s => s === null ? "null" : `'${String(s).replace(/'/g,"''")}'`;
const jb = a => `'${JSON.stringify(a)}'::jsonb`;

const rows = R.map(([name,gov,qada,type,gender,flangs,stages,phone,students]) => {
  const langs = ["Arabic", ...flangs];
  const langAr = "عربي/" + flangs.map(l => FLANG_AR[l]).join("/");
  return `(${q(name)}, 'LB', ${q(slugify(name))}, ${q(gov)}, ${q(gov)}, ${q(qada)}, ${q(qada)}, ${q(TYPE_AR[type])}, ${q(type)}, ${q(gender)}, ${jb(langs)}, ${q(langAr)}, ${jb(stages)}, ${q(phone)}, ${students}, 'المركز التربوي للبحوث والإنماء (CRDP)', 'basic', 'noindex', true, '🏫', 'from-primary to-primary-dark')`;
}).join(",\n  ");

console.log(`insert into public.schools
  (name, country_code, slug, region, governorate, district, city_or_area, type, school_type, gender_type, teaching_languages, lang, education_stages, phone, students, data_source, profile_status, seo_index_status, is_active, emoji, color)
values
  ${rows};`);
