import { readFileSync, writeFileSync } from "fs";
const P = "src/lib/i18n.tsx";
let text = readFileSync(P, "utf8");

const KEYS = {
  "sch_l.hero.badge":        ["دليل المدارس", "Schools directory"],
  "sch_l.hero.title":        ["مدارس", "Schools in"],
  "sch_l.hero.desc":         ["اكتشف المدارس حسب المنطقة، نوع المدرسة، لغة التعليم، المنهج، والمراحل التعليمية.", "Discover schools by region, type, language of instruction, curriculum, and education stages."],
  "sch_l.hero.search":       ["ابحث باسم المدرسة أو المنطقة...", "Search by school name or area..."],
  "sch_l.hero.cta":          ["استكشف المدارس", "Explore schools"],
  "sch_l.filter.all_govs":       ["كل المحافظات", "All governorates"],
  "sch_l.filter.all_stages":     ["كل المراحل", "All stages"],
  "sch_l.filter.all_langs":      ["كل اللغات", "All languages"],
  "sch_l.filter.all_curricula":  ["كل المناهج", "All curricula"],
  "sch_l.filter.verified_only":  ["موثّقة فقط", "Verified only"],
  "sch_l.filter.reset":          ["إعادة تعيين", "Reset"],
  "sch_l.type.religious":     ["دينية", "Religious"],
  "sch_l.type.semi_private":  ["شبه مجانية", "Semi-private"],
  "sch_l.type.unrwa":         ["أونروا", "UNRWA"],
  "sch_l.stage.kg":           ["روضة", "Kindergarten"],
  "sch_l.stage.primary":      ["ابتدائي", "Primary"],
  "sch_l.stage.intermediate": ["متوسط", "Intermediate"],
  "sch_l.stage.secondary":    ["ثانوي", "Secondary"],
  "sch_l.lang.ar":            ["العربية", "Arabic"],
  "sch_l.lang.en":            ["الإنجليزية", "English"],
  "sch_l.lang.fr":            ["الفرنسية", "French"],
  "sch_l.badge.verified":     ["موثّقة", "Verified"],
  "sch_l.card.lang":          ["لغة التعليم", "Language"],
  "sch_l.card.stages":        ["المراحل", "Stages"],
  "sch_l.card.view":          ["عرض التفاصيل", "View details"],
};

const already = new Set([...text.matchAll(/['"]([a-z][a-z0-9_.]+)['"]\s*:/g)].map(m => m[1]));
const arLines = [], enLines = [];
for (const [k, [ar, en]] of Object.entries(KEYS)) {
  if (already.has(k)) continue;
  arLines.push(`    '${k}': '${ar}',`);
  enLines.push(`    '${k}': '${en}',`);
}

function insertAfter(marker, lines) {
  const lineList = text.split("\n");
  const idx = lineList.findIndex(l => l.trim() === marker);
  if (idx < 0) throw new Error("marker not found: " + marker);
  lineList.splice(idx + 1, 0, ...lines);
  text = lineList.join("\n");
}
// Insert EN first then AR won't matter since we search fresh each time.
insertAfter("ar: {", arLines);
insertAfter("en: {", enLines);
writeFileSync(P, text, "utf8");
console.log(`added ${arLines.length} keys (ar+en)`);
