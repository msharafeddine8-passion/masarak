"use client";
// Client island for /schools — receives the SSR-fetched list as a prop and
// owns only the interactive bits: search, region/type filter, sort.
import { useState, useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { normalizeAr } from "@/lib/utils";

type School = {
  id: number;
  name: string;
  region?: string;
  area?: string;
  type?: string;
  curriculum?: string[];
  feesMin?: number;
  rating?: number;
  students?: number;
  photo?: string;
  logo?: string;
  emoji?: string;
  color?: string;
};

export default function SchoolsListClient({ items }: { items: School[] }) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "name" | "fees_asc" | "students">("rating");

  const regions = useMemo(
    () => Array.from(new Set(items.map((s) => (s.region || "").trim()).filter(Boolean))),
    [items]
  );
  const types: Array<{ value: string; label: string }> = [
    { value: "خاصة", label: t("sch_l.type.private") },
    { value: "رسمية", label: t("sch_l.type.public") },
    { value: "دولية", label: t("sch_l.type.intl") },
    { value: "مهنية", label: t("sch_l.type.voc") },
  ];

  const filtered = useMemo(() => {
    const q = normalizeAr(search);
    let arr = items.filter((s) => {
      if (q && !normalizeAr(s.name || "").includes(q) && !normalizeAr(s.area || "").includes(q)) return false;
      if (region && (s.region || "").trim() !== region.trim()) return false;
      if (type && (s.type || "").trim() !== type.trim()) return false;
      return true;
    });
    arr = [...arr].sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "fees_asc") return (a.feesMin || 0) - (b.feesMin || 0);
      if (sortBy === "students") return (b.students || 0) - (a.students || 0);
      return (b.rating || 0) - (a.rating || 0);
    });
    return arr;
  }, [items, search, region, type, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 -mt-6">
      <div className="bg-white rounded-2xl shadow-md p-4 grid md:grid-cols-4 gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("sch_l.filter.search")}
          aria-label={t("sch_l.filter.search")}
          className="md:col-span-2 px-4 py-2.5 border border-gray-200 rounded-lg"
        />
        <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="region"
          className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
          <option value="">{t("sch_l.filter.all_regions")}</option>
          {regions.map((r) => (
            <option key={r as string} value={r as string}>{r as string}</option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="type"
          className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
          <option value="">{t("sch_l.filter.all_types")}</option>
          {types.map((ti) => (
            <option key={ti.value} value={ti.value}>{ti.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm font-bold text-gray-600">{t("sch_l.sort.label")}</span>
        {(
          [
            ["rating", t("sch_l.sort.rating")],
            ["name", t("sch_l.sort.name")],
            ["fees_asc", t("sch_l.sort.cheap")],
            ["students", t("sch_l.sort.size")],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortBy(key as "rating" | "name" | "fees_asc" | "students")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
              sortBy === key ? "bg-[#1b3a6b] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-600 mb-4">
        {filtered.length} {t("sch_l.count.of")} {items.length}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s, idx) => (
          <SchoolCard key={s.id} s={s} position={idx + 1} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-6xl mb-3">🔍</div>
          <p>{t("sch_l.empty")}</p>
        </div>
      )}
    </div>
  );
}

function SchoolCard({ s, position }: { s: School; position: number }) {
  const { t } = useI18n();
  const typeColor: Record<string, string> = {
    خاصة: "bg-blue-100 text-blue-700",
    رسمية: "bg-red-100 text-red-700",
    دولية: "bg-purple-100 text-purple-700",
    مهنية: "bg-orange-100 text-orange-700",
  };
  const isTop3 = position <= 3;
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <Link
      href={`/schools/${s.id}`}
      className="bg-white rounded-2xl border border-gray-200 hover:border-[#1b3a6b] hover:shadow-lg transition overflow-hidden block group"
    >
      <div className={`relative h-32 bg-gradient-to-br ${s.color || "from-[#1b3a6b] to-[#2d5391]"} overflow-hidden`}>
        {s.photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={s.photo}
            alt={s.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div
          className={`absolute top-3 right-3 ${
            isTop3 ? "bg-yellow-400 text-[#1b3a6b]" : "bg-white/95 text-[#1b3a6b]"
          } px-2.5 py-1 rounded-full font-extrabold text-xs shadow-md`}
        >
          {medals[position] || `#${position}`}
        </div>
        <div className="absolute bottom-3 left-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor[s.type || ""] || "bg-white/95 text-[#1b3a6b]"}`}>
            {s.type}
          </span>
        </div>
        <div className="absolute -bottom-6 right-4 w-14 h-14 rounded-full bg-white shadow-lg border-4 border-white overflow-hidden flex items-center justify-center text-2xl">
          {s.logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={s.logo}
              alt={s.name}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <span>{s.emoji || "🏫"}</span>
          )}
        </div>
      </div>

      <div className="p-4 pt-8">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-extrabold text-[#1b3a6b] truncate group-hover:underline">{s.name}</h3>
          <span className="text-yellow-400 text-sm font-bold">{"★".repeat(s.rating || 0)}</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">📍 {s.region} — {s.area}</p>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-gray-400">{t("sch_l.card.curricula")}</div>
            <div className="font-bold text-gray-700 truncate">
              {(s.curriculum || []).slice(0, 2).join("، ") || "—"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-gray-400">{t("sch_l.card.fees")}</div>
            <div className="font-bold text-gray-700">{s.feesMin === 0 ? t("sch_l.card.free") : `$${s.feesMin}+`}</div>
          </div>
        </div>
        <div className="pt-3 border-t border-gray-100">
          <span className="text-[#1b3a6b] font-bold text-sm group-hover:underline">{t("sch_l.card.details")}</span>
        </div>
      </div>
    </Link>
  );
}
