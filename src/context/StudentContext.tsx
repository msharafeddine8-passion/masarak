"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface StudentProfile {
  fullName: string;
  grade: string;
  school: string;
  region: string;
  interests: string[];
  goal: string;
  gpa: number;
  onboardingDone: boolean;
}

export interface CareerDNAResult {
  primaryPath: string;
  secondaryPath: string;
  scores: Record<string, number>;
  takenAt: string;
}

export interface SkillGapResult {
  role: string;
  scorePercent: number;
  strongSkills: string[];
  gapSkills: string[];
  analyzedAt: string;
}

export interface StudentContextType {
  profile: StudentProfile | null;
  setProfile: (p: Partial<StudentProfile>) => void;
  careerDNA: CareerDNAResult | null;
  setCareerDNA: (r: CareerDNAResult) => void;
  skillGap: SkillGapResult | null;
  setSkillGap: (r: SkillGapResult) => void;
  savedUniversities: number[];
  savedScholarships: number[];
  savedInternships: number[];
  toggleSaveUniversity: (id: number) => void;
  toggleSaveScholarship: (id: number) => void;
  toggleSaveInternship: (id: number) => void;
  loading: boolean;
}

const defaultProfile: StudentProfile = {
  fullName: "", grade: "", school: "", region: "",
  interests: [], goal: "", gpa: 0, onboardingDone: false,
};

const StudentContext = createContext<StudentContextType | null>(null);

export function StudentContextProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<StudentProfile | null>(null);
  const [careerDNA, setCareerDNAState] = useState<CareerDNAResult | null>(null);
  const [skillGap, setSkillGapState] = useState<SkillGapResult | null>(null);
  const [savedUniversities, setSavedUniversities] = useState<number[]>([]);
  const [savedScholarships, setSavedScholarships] = useState<number[]>([]);
  const [savedInternships, setSavedInternships] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const local = localStorage.getItem("masarak_ctx");
      if (local) {
        const p = JSON.parse(local);
        if (p.profile) setProfileState(p.profile);
        if (p.careerDNA) setCareerDNAState(p.careerDNA);
        if (p.skillGap) setSkillGapState(p.skillGap);
        if (p.savedUniversities) setSavedUniversities(p.savedUniversities);
        if (p.savedScholarships) setSavedScholarships(p.savedScholarships);
        if (p.savedInternships) setSavedInternships(p.savedInternships);
      }
    } catch {}

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return; }
      setUserId(data.user.id);
      try {
        const { data: ctx } = await supabase
          .from("student_context")
          .select("*")
          .eq("user_id", data.user.id)
          .single();
        if (ctx) {
          if (ctx.profile) setProfileState(ctx.profile);
          if (ctx.career_dna) setCareerDNAState(ctx.career_dna);
          if (ctx.skill_gap) setSkillGapState(ctx.skill_gap);
          if (ctx.saved_universities) setSavedUniversities(ctx.saved_universities);
          if (ctx.saved_scholarships) setSavedScholarships(ctx.saved_scholarships);
          if (ctx.saved_internships) setSavedInternships(ctx.saved_internships);
        }
      } catch {}
      setLoading(false);
    });
  }, []);

  const persist = useCallback((update: object) => {
    try {
      const ex = JSON.parse(localStorage.getItem("masarak_ctx") || "{}");
      localStorage.setItem("masarak_ctx", JSON.stringify({ ...ex, ...update }));
    } catch {}
  }, []);

  const syncDB = useCallback(async (payload: object) => {
    if (!userId) return;
    try {
      await supabase.from("student_context").upsert(
        { user_id: userId, updated_at: new Date().toISOString(), ...payload },
        { onConflict: "user_id" }
      );
    } catch {}
  }, [userId]);

  const setProfile = useCallback((p: Partial<StudentProfile>) => {
    setProfileState(prev => {
      const next = { ...(prev || defaultProfile), ...p };
      persist({ profile: next });
      syncDB({ profile: next });
      return next;
    });
  }, [persist, syncDB]);

  const setCareerDNA = useCallback((r: CareerDNAResult) => {
    setCareerDNAState(r);
    persist({ careerDNA: r });
    syncDB({ career_dna: r });
  }, [persist, syncDB]);

  const setSkillGap = useCallback((r: SkillGapResult) => {
    setSkillGapState(r);
    persist({ skillGap: r });
    syncDB({ skill_gap: r });
  }, [persist, syncDB]);

  const toggleSaveUniversity = useCallback((id: number) => {
    setSavedUniversities(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      persist({ savedUniversities: next });
      syncDB({ saved_universities: next });
      return next;
    });
  }, [persist, syncDB]);

  const toggleSaveScholarship = useCallback((id: number) => {
    setSavedScholarships(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      persist({ savedScholarships: next });
      syncDB({ saved_scholarships: next });
      return next;
    });
  }, [persist, syncDB]);

  const toggleSaveInternship = useCallback((id: number) => {
    setSavedInternships(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      persist({ savedInternships: next });
      syncDB({ saved_internships: next });
      return next;
    });
  }, [persist, syncDB]);

  return (
    <StudentContext.Provider value={{
      profile, setProfile, careerDNA, setCareerDNA, skillGap, setSkillGap,
      savedUniversities, savedScholarships, savedInternships,
      toggleSaveUniversity, toggleSaveScholarship, toggleSaveInternship, loading,
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudentContext() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudentContext must be inside StudentContextProvider");
  return ctx;
}
