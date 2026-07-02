"use client";
// Interactive client island for /schools/[country]: hero + search + expandable
// filters + clean cards. Country-agnostic — driven entirely by the `country`
// prop and the schools passed in, so it works unchanged for future countries.
import { useState, useMemo } from "react";
import Link from "next/link";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { normalizeAr } from "@/lib/utils";

export type SchoolCardData = {
  id: number;
  slug: string | null;
  name: string;
  name_en: string | null;
  governorate: string | null;
  district: string | null;
  city_or_area: string | null;
  school_type: string | null;   // normalized (private/official/…)
  teaching_languages: string[];
  education_stages: string[];
  curriculum: string[];
  logo_url: string | null;
  emoji: string | null;
  color: string | null;
  is_verified: boolean;
  is_claimed: boolean;
};

type Country = { slug: string; name_ar: string; name_en: string | null; flag: string };

const TYPE_LABEL: Record<string, TranslationKey> = {
  official: "sch_l.type.public",
  private: "sch_l.type.private",
  international: "sch_l.type.intl",
  vocational: "sch_l.type.voc",
  religious: "sch_l.type.religious",
  semi_private: "sch_l.type.semi_private",
  unrwa: "sch_l.type.unrwa",
};
const STAGE_LABEL: Record<string, TranslationKey> = {
  kindergarten: "sch_l.stage.kg",
  primary: "sch_l.stage.primary",
  intermediate: "sch_l.stage.intermediate",
  secondary: "sch_l.stage.secondary",
};
const LANG_LABEL: Record<string, TranslationKey> = {
  Arabic: "sch_l.lang.ar",
  English: "sch_l.lang.en",
  French: "sch_l.lang.fr",
};
const TYPE_ORDER = ["official", "private", "international", "religious", "semi_private", "unrwa", "vocational"];
const STAGE_ORDER = ["kindergarten", "primary", "intermediate", "secondary"];

export default function SchoolsCountryClient({ country, schools }: { country: Country; schools: SchoolCardData[] }) {
  const { t, lang } = useI18n();
  const countryName = lang === "en" && country.name_en ? country.name_en : country.name_ar;

  const [search, setSearch] = useState("");
  const [gov, setGov] = useState("");
  const [type, setType] = useState("");
  const [stage, setStage] = useState("");
  const [tlang, setTlang] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const govs = useMemo(
    () => Array.from(new Set(schools.map((s) => (s.governorate || "").trim()).filter(Boolean))).sort(),
    [schools]
  );
  const types = useMemo(
    () => TYPE_ORDER.filter((tp) => schools.some((s) => s.school_type === tp)),
    [schools]
  );
  const stages = useMemo(
    () => STAGE_ORDER.filter((st) => schools.some((s) => s.education_stages.includes(st))),
    [schools]
  );
  const langs = useMemo(
    () => Array.from(new Set(schools.flatMap((s) => s.teaching_languages))).filter(Boolean),
    [schools]
  );
  const curricula = useMemo(
    () => Array.from(new Set(schools.flatMap((s) => s.curriculum))).filter(Boolean).sort(),
    [schools]
  );

  const filtered = useMemo(() => {
    const q = normalizeAr(search);
    return schools.filter((s) => {
      if (q) {
        const hay = normalizeAr(`${s.name} ${s.name_en || ""} ${s.governorate || ""} ${s.district || ""} ${s.city_or_area || ""}`);
        if (!hay.includes(q)) return false;
      }
      if (gov && (s.governorate || "").trim() !== gov) return false;
      if (type && s.school_type !== type) return false;
      if (stage && !s.education_stages.includes(stage)) return false;
      if (tlang && !s.teaching_languages.includes(tlang)) return false;
      if (curriculum && !s.curriculum.includes(curriculum)) return false;
      if (verifiedOnly && !s.is_verified) return false;
      return true;
    });
  }, [schools, search, gov, type, stage, tlang, curriculum, verifiedOnly]);

  const reset = () => { setSearch(""); setGov(""); setType(""); setStage(""); setTlang(""); setCurriculum(""); setVerifiedOnly(false); };

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-hero text-white pt-12 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30" />
          <div className="absolute inset-0 bg-pattern-dots opacity-10" style={{ backgroundSize: "32px 32px" }} />
          <div className="absolute top-10 left-10 text-5xl animate-float opacity-40">🏫</div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4">
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <span>{country.flag}</span> {t("sch_l.hero.badge")}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            {t("sch_l.hero.title")} {countryName}
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mb-6">{t("sch_l.hero.desc")}</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("sch_l.hero.search")}
              aria-label={t("sch_l.hero.search")}
              className="flex-1 px-5 py-3 rounded-xl text-ink outline-none shadow-lg"
            />
            <a href="#schools-list" className="px-6 py-3 rounded-xl bg-white text-primary font-extrabold text-center shadow-lg hover:bg-mint-pale transition">
              {t("sch_l.hero.cta")}
            </a>
          </div>
        </div>
      </section>

      {/* ── Filters + list ───────────────────────────────────────────────── */}
      <div id="schools-list" className="max-w-6xl mx-auto px-4 -mt-8 scroll-mt-4">
        <div className="bg-white rounded-2xl shadow-md p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <Select value={gov} onChange={setGov} label={t("sch_l.filter.all_govs")} aria="governorate"
            options={govs.map((g) => ({ v: g, l: g }))} />
          <Select value={type} onChange={setType} label={t("sch_l.filter.all_types")} aria="type"
            options={types.map((tp) => ({ v: tp, l: t(TYPE_LABEL[tp]) }))} />
          <Select value={stage} onChange={setStage} label={t("sch_l.filter.all_stages")} aria="stage"
            options={stages.map((st) => ({ v: st, l: t(STAGE_LABEL[st]) }))} />
          <Select value={tlang} onChange={setTlang} label={t("sch_l.filter.all_langs")} aria="language"
            options={langs.map((lg) => ({ v: lg, l: LANG_LABEL[lg] ? t(LANG_LABEL[lg]) : lg }))} />
          <Select value={curriculum} onChange={setCurriculum} label={t("sch_l.filter.all_curricula")} aria="curriculum"
            options={curricula.map((c) => ({ v: c, l: c }))} />
          <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white cursor-pointer select-none">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="w-4 h-4 accent-primary" />
            <span className="text-sm font-semibold text-gray-700">✓ {t("sch_l.filter.verified_only")}</span>
          </label>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">{filtered.length} {t("sch_l.count.of")} {schools.length}</div>
          <button onClick={reset} className="text-xs font-bold text-primary hover:underline">{t("sch_l.filter.reset")}</button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <SchoolCard key={s.id} s={s} countrySlug={country.slug} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-3">🔍</div>
            <p>{t("sch_l.empty")}</p>
          </div>
        )}
      </div>
    </>
  );
}

function Select({ value, onChange, label, aria, options }: { value: string; onChange: (v: string) => void; label: string; aria: string; options: { v: string; l: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={aria}
      className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm">
      <option value="">{label}</option>
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

function SchoolCard({ s, countrySlug }: { s: SchoolCardData; countrySlug: string }) {
  const { t } = useI18n();
  const typeChip: Record<string, string> = {
    official: "bg-red-100 text-red-700",
    private: "bg-blue-100 text-blue-700",
    international: "bg-purple-100 text-purple-700",
    vocational: "bg-orange-100 text-orange-700",
    religious: "bg-teal-100 text-teal-700",
    semi_private: "bg-indigo-100 text-indigo-700",
    unrwa: "bg-slate-100 text-slate-700",
  };
  const nt = s.school_type || "";
  const loc = [s.governorate, s.district || s.city_or_area].filter(Boolean).join(" — ");
  const stages = s.education_stages.map((st) => (STAGE_LABEL[st] ? t(STAGE_LABEL[st]) : st));
  const langs = s.teaching_languages.map((l) => (LANG_LABEL[l] ? t(LANG_LABEL[l]) : l));
  const href = s.slug ? `/schools/${countrySlug}/${s.slug}` : `/schools/${s.id}`;

  return (
    <Link href={href} className="bg-white rounded-2xl border border-gray-200 hover:border-primary hover:shadow-lg transition overflow-hidden block group">
      <div className={`relative h-24 bg-gradient-to-br ${s.color || "from-primary to-primary-dark"}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {nt && (
          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${typeChip[nt] || "bg-white/95 text-primary"}`}>
            {t(TYPE_LABEL[nt] || "sch_l.type.private")}
          </span>
        )}
        {s.is_verified && (
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow">
            ✓ {t("sch_l.badge.verified")}
          </span>
        )}
        <div className="absolute -bottom-6 right-4 w-14 h-14 rounded-full bg-white shadow-lg border-4 border-white overflow-hidden flex items-center justify-center text-2xl">
          {s.logo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={s.logo_url} alt={s.name} loading="lazy" className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <span>{s.emoji || "🏫"}</span>
          )}
        </div>
      </div>

      <div className="p-4 pt-8">
        <h3 className="font-extrabold text-primary mb-1 leading-snug group-hover:underline line-clamp-2">{s.name}</h3>
        {loc && <p className="text-xs text-gray-500 mb-3">📍 {loc}</p>}
        <div className="space-y-1.5 text-xs mb-3">
          {langs.length > 0 && (
            <div className="flex gap-1.5"><span className="text-gray-400 shrink-0">{t("sch_l.card.lang")}:</span>
              <span className="font-semibold text-gray-700 truncate">{langs.join("، ")}</span></div>
          )}
          {stages.length > 0 && (
            <div className="flex gap-1.5"><span className="text-gray-400 shrink-0">{t("sch_l.card.stages")}:</span>
              <span className="font-semibold text-gray-700 truncate">{stages.join("، ")}</span></div>
          )}
        </div>
        <div className="pt-3 border-t border-gray-100">
          <span className="text-primary font-bold text-sm group-hover:underline">{t("sch_l.card.view")} ←</span>
        </div>
      </div>
    </Link>
  );
}
