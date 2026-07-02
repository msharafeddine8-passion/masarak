// One-off: generate clean latin slugs + education_stages for the 30 seed schools.
// Prints an SQL UPDATE ... FROM (VALUES ...) statement to stdout.
const ROWS = [
  [1,"مدرسة الإيفانجليكال الوطنية","KG-12"],
  [2,"مدارس المقاصد الإسلامية","KG-12"],
  [3,"ثانوية الجمهور الرسمية","7-12"],
  [4,"كوليج مار يوسف — الآباء اليسوعيون","KG-12"],
  [5,"مدرسة رفيق الحريري الثانوية","7-12"],
  [6,"Collège Protestant Français","KG-12"],
  [7,"International College (IC)","KG-12"],
  [8,"American Community School (ACS)","K-12"],
  [9,"Lycée Français de Beyrouth","MS-Terminale"],
  [10,"Notre Dame de Jamhour","KG-12"],
  [11,"مدارس اللويزة - المقدسيات","KG-12"],
  [12,"Beirut Baptist School (BBS)","KG-12"],
  [13,"مدرسة الفرير — عاليه","KG-12"],
  [14,"Sagesse High School","KG-12"],
  [15,"الثانوية الرسمية — عاليه","7-12"],
  [16,"مدرسة الفرير — طرابلس","KG-12"],
  [17,"مدارس المقاصد — طرابلس","KG-12"],
  [18,"ثانوية عبد الحميد كرامي الرسمية","7-12"],
  [19,"Evangelical School — Tripoli","KG-12"],
  [20,"مدارس الإمام الخميني — صور","KG-12"],
  [21,"مدارس الأمل — صيدا","KG-12"],
  [22,"ثانوية النبطية الرسمية","7-12"],
  [23,"مدارس الأونروا — البقاع","KG-9"],
  [24,"مدرسة الفرير — زحلة","KG-12"],
  [25,"ثانوية زحلة الرسمية","7-12"],
  [26,"Lebanese American University School","KG-12"],
  [27,"Brummana High School","KG-12"],
  [28,"Hariri High School — Saida","KG-12"],
  [29,"Deir El Ahmar School (LT)","7-12"],
  [30,"مدرسة الكفاءة التقنية — بيروت","10-14"],
];

const MAP = {
  'ا':'a','أ':'a','إ':'i','آ':'a','ب':'b','ت':'t','ث':'th','ج':'j','ح':'h','خ':'kh',
  'د':'d','ذ':'th','ر':'r','ز':'z','س':'s','ش':'sh','ص':'s','ض':'d','ط':'t','ظ':'z',
  'ع':'a','غ':'gh','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w',
  'ؤ':'w','ي':'y','ى':'a','ئ':'y','ء':'','ة':'a','ّ':'','َ':'','ُ':'','ِ':'','ً':'','ٌ':'','ٍ':'','ْ':'',
};
function translit(s){ return [...s].map(ch => MAP[ch] ?? ch).join(''); }
function slugify(name){
  let s = translit(name).toLowerCase();
  s = s.replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  return s || 'school';
}
function stages(gr){
  const g = gr.toUpperCase();
  const out = [];
  const hasKG = g.includes('KG') || g.startsWith('K-') || g.includes('MS');
  const nums = (g.match(/\d+/g)||[]).map(Number);
  let start = nums.length ? nums[0] : null;
  let end   = nums.length ? nums[nums.length-1] : null;
  if (g.includes('MS')) { start = 1; end = 12; }          // Maternelle→Terminale
  if (hasKG) out.push('kindergarten');
  const lo = hasKG ? 1 : (start ?? 1);
  const hi = end ?? 12;
  if (lo <= 6) out.push('primary');
  if (lo <= 9 && hi >= 7) out.push('intermediate');
  if (hi >= 10) out.push('secondary');
  return [...new Set(out)];
}

const seen = new Set();
const vals = ROWS.map(([id,name,gr]) => {
  let base = slugify(name);
  if (seen.has(base)) base = base + '-' + id;
  seen.add(base);
  const st = JSON.stringify(stages(gr)).replace(/"/g,'\\"'); // for SQL below we JSON again
  return { id, slug: base, stages: stages(gr) };
});

const tuples = vals.map(v =>
  `(${v.id}, '${v.slug}', '${JSON.stringify(v.stages)}'::jsonb)`
).join(',\n  ');

console.log(`update public.schools as s set
  slug = v.slug,
  education_stages = v.stages
from (values
  ${tuples}
) as v(id, slug, stages)
where s.id = v.id;`);
