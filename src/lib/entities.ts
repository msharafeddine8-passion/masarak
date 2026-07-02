// src/lib/entities.ts — مع logo_url field
import { supabase } from '@/lib/supabase';
import { UNIVERSITIES as FALLBACK_UNIS } from '@/app/universities/data';
import { SCHOOLS as FALLBACK_SCHOOLS } from '@/app/schools/data';
import { TRACKS as FALLBACK_TRACKS, INSTITUTES as FALLBACK_INSTITUTES } from '@/app/vocational/data';

function uniFromDB(row: any) {
  return {
    id: row.id, name: row.name, short: row.short, emoji: row.emoji, region: row.region, type: row.type,
    rank: row.rank, tuitionMin: row.tuition_min, tuitionMax: row.tuition_max, lang: row.lang, url: row.url,
    majors: row.majors || [], scholarships: row.scholarships, acceptance: row.acceptance, employRate: row.employ_rate,
    desc: row.description, founded: row.founded, students: row.students, faculties: row.faculties,
    campus: row.campus, accred: row.accred, color: row.color, paths: row.paths || [], photo: row.photo,
    logo: row.logo_url,
    phone: row.phone, email: row.email, address: row.address,
    application_deadline: row.application_deadline, requirements: row.requirements, notes: row.notes,
  };
}

function uniToDB(u: any) {
  return {
    id: u.id, name: u.name, short: u.short, emoji: u.emoji, region: u.region, type: u.type,
    rank: u.rank, tuition_min: u.tuitionMin, tuition_max: u.tuitionMax, lang: u.lang, url: u.url,
    majors: u.majors, scholarships: u.scholarships, acceptance: u.acceptance, employ_rate: u.employRate,
    description: u.desc, founded: u.founded, students: u.students, faculties: u.faculties,
    campus: u.campus, accred: u.accred, color: u.color, paths: u.paths, photo: u.photo,
    logo_url: u.logo || null,
    phone: u.phone || null, email: u.email || null, address: u.address || null,
    application_deadline: u.application_deadline || null, requirements: u.requirements || null, notes: u.notes || null,
    is_active: true,
  };
}

function schoolFromDB(row: any) {
  return {
    id: row.id, name: row.name, region: row.region, area: row.area, type: row.type,
    curriculum: row.curriculum || [], lang: row.lang, feesMin: row.fees_min, feesMax: row.fees_max,
    grades: row.grades, founded: row.founded, students: row.students, rating: row.rating,
    features: row.features || [], desc: row.description, phone: row.phone, website: row.website,
    emoji: row.emoji, color: row.color, photo: row.photo,
    logo: row.logo_url,
    email: row.email, address: row.address,
    application_deadline: row.application_deadline, requirements: row.requirements, notes: row.notes,
    slug: row.slug, country_code: row.country_code,
  };
}

function schoolToDB(s: any) {
  return {
    id: s.id, name: s.name, region: s.region, area: s.area, type: s.type,
    curriculum: s.curriculum, lang: s.lang, fees_min: s.feesMin, fees_max: s.feesMax,
    grades: s.grades, founded: s.founded, students: s.students, rating: s.rating,
    features: s.features, description: s.desc, phone: s.phone, website: s.website,
    emoji: s.emoji, color: s.color, photo: s.photo || null,
    logo_url: s.logo || null,
    email: s.email || null, address: s.address || null,
    application_deadline: s.application_deadline || null, requirements: s.requirements || null, notes: s.notes || null,
    is_active: true,
  };
}

function trackFromDB(row: any) {
  return {
    id: row.id, code: row.code, name: row.name, duration: row.duration, level: row.level, sector: row.sector,
    desc: row.description, subjects: row.subjects || [], salaryLB: row.salary_lb, salaryGulf: row.salary_gulf,
    demand: row.demand, uniEquiv: row.uni_equiv, emoji: row.emoji,
    requirements: row.requirements, notes: row.notes,
  };
}
function trackToDB(t: any) {
  return {
    id: t.id, code: t.code, name: t.name, duration: t.duration, level: t.level, sector: t.sector,
    description: t.desc, subjects: t.subjects, salary_lb: t.salaryLB, salary_gulf: t.salaryGulf,
    demand: t.demand, uni_equiv: t.uniEquiv, emoji: t.emoji,
    requirements: t.requirements || null, notes: t.notes || null,
    is_active: true,
  };
}

function instituteFromDB(row: any) {
  return {
    id: row.id, name: row.name, region: row.region, type: row.type, specialties: row.specialties || [],
    website: row.website, emoji: row.emoji,
    logo: row.logo_url,
    phone: row.phone, email: row.email, address: row.address, notes: row.notes,
  };
}
function instituteToDB(i: any) {
  return {
    id: i.id, name: i.name, region: i.region, type: i.type, specialties: i.specialties,
    website: i.website, emoji: i.emoji,
    logo_url: i.logo || null,
    phone: i.phone || null, email: i.email || null, address: i.address || null, notes: i.notes || null,
    is_active: true,
  };
}

export async function fetchUniversities() {
  const { data, error } = await supabase.from('universities').select('*').eq('is_active', true).order('rank', { ascending: false });
  if (error || !data || data.length === 0) return FALLBACK_UNIS;
  return data.map(uniFromDB);
}
export async function fetchUniversityById(id: number) {
  const { data, error } = await supabase.from('universities').select('*').eq('id', id).maybeSingle();
  if (error || !data) return FALLBACK_UNIS.find((u) => u.id === id) || null;
  return uniFromDB(data);
}
export async function fetchSchools() {
  const { data, error } = await supabase.from('schools').select('*').eq('is_active', true).order('rating', { ascending: false });
  if (error || !data || data.length === 0) return FALLBACK_SCHOOLS;
  return data.map(schoolFromDB);
}
export async function fetchSchoolById(id: number) {
  const { data, error } = await supabase.from('schools').select('*').eq('id', id).maybeSingle();
  if (error || !data) return FALLBACK_SCHOOLS.find((s) => s.id === id) || null;
  return schoolFromDB(data);
}
export async function fetchTracks() {
  const { data, error } = await supabase.from('vocational_programs').select('*').eq('is_active', true);
  if (error || !data || data.length === 0) return FALLBACK_TRACKS;
  return data.map(trackFromDB);
}
export async function fetchTrackById(id: string) {
  const { data, error } = await supabase.from('vocational_programs').select('*').eq('id', id).maybeSingle();
  if (error || !data) return FALLBACK_TRACKS.find((t) => t.id === id) || null;
  return trackFromDB(data);
}
export async function fetchInstitutes() {
  const { data, error } = await supabase.from('vocational_institutes').select('*').eq('is_active', true).order('id');
  if (error || !data || data.length === 0) return FALLBACK_INSTITUTES;
  return data.map(instituteFromDB);
}
export async function fetchInstituteById(id: number) {
  const { data, error } = await supabase.from('vocational_institutes').select('*').eq('id', id).maybeSingle();
  if (error || !data) return FALLBACK_INSTITUTES.find((i) => i.id === id) || null;
  return instituteFromDB(data);
}

export async function saveUniversity(u: any) { return supabase.from('universities').upsert(uniToDB(u)).select().single(); }
export async function deleteUniversity(id: number) { return supabase.from('universities').delete().eq('id', id); }
export async function saveSchool(s: any) { return supabase.from('schools').upsert(schoolToDB(s)).select().single(); }
export async function deleteSchool(id: number) { return supabase.from('schools').delete().eq('id', id); }
export async function saveTrack(t: any) { return supabase.from('vocational_programs').upsert(trackToDB(t)).select().single(); }
export async function deleteTrack(id: string) { return supabase.from('vocational_programs').delete().eq('id', id); }
export async function saveInstitute(i: any) { return supabase.from('vocational_institutes').upsert(instituteToDB(i)).select().single(); }
export async function deleteInstitute(id: number) { return supabase.from('vocational_institutes').delete().eq('id', id); }

export async function seedUniversities() { return supabase.from('universities').upsert(FALLBACK_UNIS.map(uniToDB)); }
export async function seedSchools() { return supabase.from('schools').upsert(FALLBACK_SCHOOLS.map(schoolToDB)); }
export async function seedTracks() { return supabase.from('vocational_programs').upsert(FALLBACK_TRACKS.map(trackToDB)); }
export async function seedInstitutes() { return supabase.from('vocational_institutes').upsert(FALLBACK_INSTITUTES.map(instituteToDB)); }
