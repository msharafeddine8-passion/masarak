"use client";
import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type Exp  = { id: number; company: string; role: string; location: string; start: string; end: string; current: boolean; bullets: string[] };
type Edu  = { id: number; school: string; degree: string; field: string; graduation: string; gpa: string; honors: string };
type Proj = { id: number; name: string; desc: string; tech: string; link: string };
type Cert = { id: number; name: string; issuer: string; year: string };
type Lang = { id: number; lang: string; level: string };

type CV = {
  firstName: string; lastName: string; title: string;
  email: string; phone: string; location: string;
  linkedin: string; github: string; website: string;
  summary: string;
  experiences: Exp[];
  educations: Edu[];
  skillGroups: string;   // pipe-separated groups: "JS, React | Python | SQL"
  languages: Lang[];
  certifications: Cert[];
  projects: Proj[];
};

type Template = "harvard" | "modern" | "clean" | "bold";
type TabKey   = "personal" | "experience" | "education" | "skills" | "projects";

// ─── UID helper ───────────────────────────────────────────────────────────────
let _uid = 100;
const uid = () => ++_uid;

// ─── Default data ─────────────────────────────────────────────────────────────
const EMPTY_CV: CV = {
  firstName: "", lastName: "", title: "",
  email: "", phone: "", location: "",
  linkedin: "", github: "", website: "",
  summary: "",
  experiences:    [{ id: uid(), company: "", role: "", location: "", start: "", end: "", current: false, bullets: ["", "", ""] }],
  educations:     [{ id: uid(), school: "", degree: "", field: "", graduation: "", gpa: "", honors: "" }],
  skillGroups:    "",
  languages:      [{ id: uid(), lang: "", level: "Fluent" }],
  certifications: [{ id: uid(), name: "", issuer: "", year: "" }],
  projects:       [{ id: uid(), name: "", desc: "", tech: "", link: "" }],
};

const SAMPLE_CV: CV = {
  firstName: "Ahmad", lastName: "Mansour",
  title: "Full-Stack Software Engineer",
  email: "ahmad.mansour@email.com", phone: "+1 (555) 234-5678",
  location: "Beirut, Lebanon",
  linkedin: "linkedin.com/in/ahmadmansour",
  github: "github.com/ahmadm",
  website: "ahmadmansour.dev",
  summary: "Results-driven Software Engineer with 3+ years building scalable web applications. Passionate about clean architecture, performance optimization, and delivering exceptional user experiences. Proven ability to lead cross-functional teams and ship production-grade products on time.",
  experiences: [
    { id: uid(), company: "TechStart Lebanon", role: "Senior Software Engineer",
      location: "Beirut, Lebanon", start: "Jan 2023", end: "", current: true,
      bullets: [
        "Led development of a B2B SaaS platform serving 5,000+ users, reducing page load time by 40%",
        "Architected microservices infrastructure using Node.js and Docker, achieving 99.9% system uptime",
        "Mentored 3 junior developers and introduced code review practices that reduced bug rate by 35%",
      ] },
    { id: uid(), company: "Digital Agency Beirut", role: "Front-End Developer",
      location: "Remote", start: "Jun 2021", end: "Dec 2022", current: false,
      bullets: [
        "Built 15+ client websites using React and Next.js, improving client NPS scores by 25 points",
        "Achieved 95+ Lighthouse performance scores across all delivered projects",
      ] },
  ],
  educations: [
    { id: uid(), school: "American University of Beirut (AUB)", degree: "B.S.",
      field: "Computer Engineering", graduation: "May 2021", gpa: "3.8 / 4.0", honors: "Dean's List" },
  ],
  skillGroups: "JavaScript, TypeScript, React, Next.js | Node.js, Python, REST APIs | AWS, Docker, PostgreSQL | Git, Agile/Scrum",
  languages: [
    { id: uid(), lang: "Arabic", level: "Native" },
    { id: uid(), lang: "English", level: "Fluent" },
    { id: uid(), lang: "French", level: "Intermediate" },
  ],
  certifications: [
    { id: uid(), name: "AWS Certified Developer – Associate", issuer: "Amazon Web Services", year: "2023" },
    { id: uid(), name: "Google Professional Cloud Architect", issuer: "Google", year: "2022" },
  ],
  projects: [
    { id: uid(), name: "MasarakLB Platform",
      desc: "Lebanese student guidance platform connecting 5,000+ students with universities and scholarships",
      tech: "Next.js, Supabase, TypeScript", link: "masaraklb.com" },
    { id: uid(), name: "AI Career Advisor",
      desc: "Chat-based career guidance using NLP to match student profiles with job opportunities",
      tech: "Python, FastAPI, OpenAI, React", link: "github.com/ahmadm/ai-career" },
  ],
};

const LANG_LEVELS = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"];

// ─── Template: Harvard ────────────────────────────────────────────────────────
function HarvardTemplate({ cv }: { cv: CV }) {
  const name   = [cv.firstName, cv.lastName].filter(Boolean).join(" ") || "Your Name";
  const groups = cv.skillGroups.split("|").map(g => g.trim()).filter(Boolean);
  const contact = [cv.email, cv.phone, cv.location, cv.linkedin, cv.github, cv.website].filter(Boolean);

  const SectionTitle = ({ children }: { children: string }) => (
    <div style={{ fontSize: "10.5px", fontWeight: "bold", letterSpacing: "1.5px", textTransform: "uppercase",
      borderBottom: "1.5px solid #1a1a1a", paddingBottom: "2px", marginBottom: "7px", marginTop: "12px" }}>
      {children}
    </div>
  );

  return (
    <div style={{ fontFamily: "Georgia,'Times New Roman',serif", color: "#1a1a1a", fontSize: "10.5px", lineHeight: "1.45", padding: "32px 40px" }}>
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "3px", textTransform: "uppercase" }}>{name}</div>
        {cv.title && <div style={{ fontSize: "11px", color: "#555", margin: "3px 0 6px" }}>{cv.title}</div>}
        <div style={{ fontSize: "9.5px", color: "#444", display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          {contact.map((c, i) => <span key={i}>{c}</span>)}
        </div>
      </div>
      <div style={{ borderTop: "2px solid #1a1a1a" }} />

      {cv.summary && (<>
        <SectionTitle>Summary</SectionTitle>
        <p style={{ color: "#333", textAlign: "justify", margin: 0 }}>{cv.summary}</p>
      </>)}

      {cv.experiences.some(e => e.company || e.role) && (<>
        <SectionTitle>Experience</SectionTitle>
        {cv.experiences.filter(e => e.company || e.role).map(exp => (
          <div key={exp.id} style={{ marginBottom: "9px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <b style={{ fontSize: "11px" }}>{exp.role}</b>
                {exp.location && <span style={{ color: "#555" }}> · {exp.location}</span>}
              </div>
              <span style={{ color: "#555", fontSize: "9.5px", flexShrink: 0 }}>{[exp.start, exp.current ? "Present" : exp.end].filter(Boolean).join(" – ")}</span>
            </div>
            {exp.company && <div style={{ fontStyle: "italic", color: "#444", marginTop: "1px" }}>{exp.company}</div>}
            {exp.bullets.filter(b => b).length > 0 && (
              <ul style={{ margin: "3px 0 0 0", paddingLeft: "16px" }}>
                {exp.bullets.filter(b => b).map((b, i) => <li key={i} style={{ marginBottom: "2px" }}>{b}</li>)}
              </ul>
            )}
          </div>
        ))}
      </>)}

      {cv.educations.some(e => e.school || e.degree) && (<>
        <SectionTitle>Education</SectionTitle>
        {cv.educations.filter(e => e.school || e.degree).map(edu => (
          <div key={edu.id} style={{ marginBottom: "7px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <b style={{ fontSize: "11px" }}>{edu.school}</b>
              <span style={{ color: "#555", fontSize: "9.5px", flexShrink: 0 }}>{edu.graduation}</span>
            </div>
            <div style={{ color: "#333" }}>{[edu.degree, edu.field].filter(Boolean).join(" in ")}</div>
            {(edu.gpa || edu.honors) && (
              <div style={{ color: "#666", fontSize: "9.5px" }}>{[edu.gpa && `GPA: ${edu.gpa}`, edu.honors].filter(Boolean).join(" · ")}</div>
            )}
          </div>
        ))}
      </>)}

      {groups.length > 0 && (<>
        <SectionTitle>Skills</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {groups.map((g, i) => <div key={i}>{g}</div>)}
        </div>
      </>)}

      {cv.projects.some(p => p.name) && (<>
        <SectionTitle>Projects</SectionTitle>
        {cv.projects.filter(p => p.name).map(p => (
          <div key={p.id} style={{ marginBottom: "7px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <b style={{ fontSize: "11px" }}>{p.name}</b>
              {p.link && <span style={{ fontSize: "9.5px", color: "#555" }}>{p.link}</span>}
            </div>
            {p.desc && <div style={{ color: "#333", marginTop: "1px" }}>{p.desc}</div>}
            {p.tech && <div style={{ fontStyle: "italic", color: "#666", fontSize: "9.5px" }}>Technologies: {p.tech}</div>}
          </div>
        ))}
      </>)}

      {cv.certifications.some(c => c.name) && (<>
        <SectionTitle>Certifications</SectionTitle>
        {cv.certifications.filter(c => c.name).map(c => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
            <span>{c.name}{c.issuer ? ` · ${c.issuer}` : ""}</span>
            {c.year && <span style={{ color: "#666", fontSize: "9.5px", flexShrink: 0 }}>{c.year}</span>}
          </div>
        ))}
      </>)}

      {cv.languages.some(l => l.lang) && (<>
        <SectionTitle>Languages</SectionTitle>
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          {cv.languages.filter(l => l.lang).map(l => (
            <span key={l.id}><b>{l.lang}</b> <span style={{ color: "#666" }}>({l.level})</span></span>
          ))}
        </div>
      </>)}
    </div>
  );
}

// ─── Template: Modern ─────────────────────────────────────────────────────────
function ModernTemplate({ cv }: { cv: CV }) {
  const name   = [cv.firstName, cv.lastName].filter(Boolean).join(" ") || "Your Name";
  const groups = cv.skillGroups.split("|").map(g => g.trim()).filter(Boolean);

  const Sec = ({ title }: { title: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "14px 0 8px" }}>
      <div style={{ fontSize: "11px", fontWeight: "bold", color: "#1a4a9f", letterSpacing: "1px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ flex: 1, height: "1px", background: "#1a4a9f" }} />
    </div>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI',Arial,sans-serif", color: "#1a1a1a", fontSize: "10.5px", lineHeight: "1.5" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a2d5a, #1a4a9f)", color: "white", padding: "28px 36px" }}>
        <div style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "0.5px", marginBottom: "2px" }}>{name}</div>
        {cv.title && <div style={{ fontSize: "13px", opacity: 0.9, marginBottom: "10px" }}>{cv.title}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "9.5px", opacity: 0.85 }}>
          {cv.email    && <span>✉ {cv.email}</span>}
          {cv.phone    && <span>📞 {cv.phone}</span>}
          {cv.location && <span>📍 {cv.location}</span>}
          {cv.linkedin && <span>in {cv.linkedin}</span>}
          {cv.github   && <span>⌥ {cv.github}</span>}
          {cv.website  && <span>🔗 {cv.website}</span>}
        </div>
      </div>

      <div style={{ padding: "4px 36px 28px" }}>
        {cv.summary && (<>
          <Sec title="Professional Summary" />
          <p style={{ color: "#444", margin: 0, lineHeight: "1.55" }}>{cv.summary}</p>
        </>)}

        {cv.experiences.some(e => e.company || e.role) && (<>
          <Sec title="Experience" />
          {cv.experiences.filter(e => e.company || e.role).map(exp => (
            <div key={exp.id} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontWeight: "700", fontSize: "11px" }}>{exp.role}</span>
                  {exp.company && <span style={{ color: "#1a4a9f", fontWeight: "600" }}> · {exp.company}</span>}
                </div>
                <span style={{ fontSize: "9.5px", color: "#888", flexShrink: 0 }}>{[exp.start, exp.current ? "Present" : exp.end].filter(Boolean).join(" – ")}</span>
              </div>
              {exp.location && <div style={{ fontSize: "9.5px", color: "#888", marginTop: "1px" }}>📍 {exp.location}</div>}
              {exp.bullets.filter(b => b).length > 0 && (
                <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px" }}>
                  {exp.bullets.filter(b => b).map((b, i) => <li key={i} style={{ color: "#444", marginBottom: "2px" }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </>)}

        {cv.educations.some(e => e.school || e.degree) && (<>
          <Sec title="Education" />
          {cv.educations.filter(e => e.school || e.degree).map(edu => (
            <div key={edu.id} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: "700", fontSize: "11px" }}>{edu.school}</span>
                <span style={{ fontSize: "9.5px", color: "#888", flexShrink: 0 }}>{edu.graduation}</span>
              </div>
              <div style={{ color: "#444" }}>{[edu.degree, edu.field].filter(Boolean).join(" in ")}</div>
              {(edu.gpa || edu.honors) && <div style={{ fontSize: "9.5px", color: "#888" }}>{[edu.gpa && `GPA: ${edu.gpa}`, edu.honors].filter(Boolean).join(" · ")}</div>}
            </div>
          ))}
        </>)}

        {groups.length > 0 && (<>
          <Sec title="Skills" />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {groups.map((g, i) => (
              <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {g.split(",").map(s => s.trim()).filter(Boolean).map((s, j) => (
                  <span key={j} style={{ background: "#ebeffa", color: "#1a4a9f", fontSize: "9.5px", padding: "2px 8px", borderRadius: "12px", fontWeight: "600" }}>{s}</span>
                ))}
              </div>
            ))}
          </div>
        </>)}

        {cv.projects.some(p => p.name) && (<>
          <Sec title="Projects" />
          {cv.projects.filter(p => p.name).map(p => (
            <div key={p.id} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "700", fontSize: "11px", color: "#1a4a9f" }}>{p.name}</span>
                {p.link && <span style={{ fontSize: "9.5px", color: "#888" }}>{p.link}</span>}
              </div>
              {p.desc && <div style={{ color: "#444", marginTop: "1px" }}>{p.desc}</div>}
              {p.tech && <div style={{ fontSize: "9.5px", color: "#888" }}>Stack: {p.tech}</div>}
            </div>
          ))}
        </>)}

        {(cv.certifications.some(c => c.name) || cv.languages.some(l => l.lang)) && (<>
          <Sec title="Certifications & Languages" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div>
              {cv.certifications.filter(c => c.name).map(c => (
                <div key={c.id} style={{ marginBottom: "3px" }}>
                  <span style={{ fontWeight: "600" }}>{c.name}</span>
                  {(c.issuer || c.year) && <span style={{ color: "#888", fontSize: "9.5px" }}> · {[c.issuer, c.year].filter(Boolean).join(", ")}</span>}
                </div>
              ))}
            </div>
            <div>
              {cv.languages.filter(l => l.lang).map(l => (
                <div key={l.id} style={{ marginBottom: "3px" }}>
                  <span style={{ fontWeight: "600" }}>{l.lang}</span>
                  <span style={{ color: "#888", fontSize: "9.5px" }}> — {l.level}</span>
                </div>
              ))}
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}

// ─── Template: Clean ─────────────────────────────────────────────────────────
function CleanTemplate({ cv }: { cv: CV }) {
  const name   = [cv.firstName, cv.lastName].filter(Boolean).join(" ") || "Your Name";
  const groups = cv.skillGroups.split("|").map(g => g.trim()).filter(Boolean);

  return (
    <div style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", color: "#2d2d2d", fontSize: "10.5px", lineHeight: "1.5", padding: "36px 40px" }}>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "28px", fontWeight: "300", letterSpacing: "-0.5px", color: "#111" }}>
          <b style={{ fontWeight: "700" }}>{cv.firstName}</b> {cv.lastName || ""}
        </div>
        {cv.title && <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{cv.title}</div>}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "8px", fontSize: "9.5px", color: "#666" }}>
          {cv.email    && <span>{cv.email}</span>}
          {cv.phone    && <span>{cv.phone}</span>}
          {cv.location && <span>{cv.location}</span>}
          {cv.linkedin && <span>{cv.linkedin}</span>}
          {cv.github   && <span>{cv.github}</span>}
          {cv.website  && <span>{cv.website}</span>}
        </div>
        <div style={{ height: "2px", background: "#e5e7eb", marginTop: "14px", borderRadius: "1px" }} />
      </div>

      {cv.summary && (
        <div style={{ marginBottom: "14px" }}>
          <p style={{ color: "#555", margin: 0, lineHeight: "1.6" }}>{cv.summary}</p>
        </div>
      )}

      {cv.experiences.some(e => e.company || e.role) && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#888", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Experience</div>
          {cv.experiences.filter(e => e.company || e.role).map(exp => (
            <div key={exp.id} style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "8px", marginBottom: "10px" }}>
              <div style={{ color: "#888", fontSize: "9.5px", paddingTop: "1px" }}>
                <div style={{ whiteSpace: "nowrap" }}>{[exp.start, exp.current ? "Present" : exp.end].filter(Boolean).join("–")}</div>
                {exp.location && <div style={{ marginTop: "2px" }}>{exp.location}</div>}
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "11px" }}>{exp.role}</div>
                {exp.company && <div style={{ color: "#555", marginTop: "1px" }}>{exp.company}</div>}
                {exp.bullets.filter(b => b).length > 0 && (
                  <ul style={{ margin: "4px 0 0 0", paddingLeft: "14px" }}>
                    {exp.bullets.filter(b => b).map((b, i) => <li key={i} style={{ color: "#444", marginBottom: "2px" }}>{b}</li>)}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {cv.educations.some(e => e.school || e.degree) && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#888", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Education</div>
          {cv.educations.filter(e => e.school || e.degree).map(edu => (
            <div key={edu.id} style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "8px", marginBottom: "8px" }}>
              <div style={{ color: "#888", fontSize: "9.5px", paddingTop: "1px", whiteSpace: "nowrap" }}>{edu.graduation}</div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "11px" }}>{edu.school}</div>
                <div style={{ color: "#555" }}>{[edu.degree, edu.field].filter(Boolean).join(" in ")}</div>
                {(edu.gpa || edu.honors) && <div style={{ fontSize: "9.5px", color: "#888" }}>{[edu.gpa && `GPA: ${edu.gpa}`, edu.honors].filter(Boolean).join(" · ")}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {groups.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#888", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Skills</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {groups.map((g, i) => <div key={i} style={{ color: "#444" }}>{g}</div>)}
          </div>
        </div>
      )}

      {cv.projects.some(p => p.name) && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "#888", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Projects</div>
          {cv.projects.filter(p => p.name).map(p => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "8px", marginBottom: "8px" }}>
              {p.link ? <div style={{ color: "#888", fontSize: "9.5px", paddingTop: "1px" }}>{p.link}</div> : <div />}
              <div>
                <div style={{ fontWeight: "700", fontSize: "11px" }}>{p.name}</div>
                {p.desc && <div style={{ color: "#555" }}>{p.desc}</div>}
                {p.tech && <div style={{ fontSize: "9.5px", color: "#888" }}>{p.tech}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
        {cv.certifications.some(c => c.name) && (
          <div style={{ flex: 1, minWidth: "160px" }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "#888", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>Certifications</div>
            {cv.certifications.filter(c => c.name).map(c => (
              <div key={c.id} style={{ marginBottom: "3px", color: "#444" }}>{c.name}{c.year ? ` (${c.year})` : ""}</div>
            ))}
          </div>
        )}
        {cv.languages.some(l => l.lang) && (
          <div style={{ flex: 1, minWidth: "120px" }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "#888", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>Languages</div>
            {cv.languages.filter(l => l.lang).map(l => (
              <div key={l.id} style={{ marginBottom: "3px", color: "#444" }}>{l.lang} — {l.level}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Template: Bold ──────────────────────────────────────────────────────────
function BoldTemplate({ cv }: { cv: CV }) {
  const name   = [cv.firstName, cv.lastName].filter(Boolean).join(" ") || "Your Name";
  const groups = cv.skillGroups.split("|").map(g => g.trim()).filter(Boolean);
  const SIDEBAR = "#1a2d5a";

  return (
    <div style={{ fontFamily: "'Segoe UI',Arial,sans-serif", fontSize: "10px", lineHeight: "1.45", display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "100%" }}>
      {/* Sidebar */}
      <div style={{ background: SIDEBAR, color: "white", padding: "28px 18px" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "18px", fontWeight: "800", lineHeight: "1.2", marginBottom: "4px" }}>
            <div>{cv.firstName || "Your"}</div>
            <div style={{ color: "#E8A020" }}>{cv.lastName || "Name"}</div>
          </div>
          {cv.title && <div style={{ fontSize: "9.5px", opacity: 0.8, lineHeight: "1.4", marginTop: "4px" }}>{cv.title}</div>}
        </div>

        {/* Contact */}
        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "#E8A020", marginBottom: "7px" }}>Contact</div>
          {[cv.email, cv.phone, cv.location, cv.linkedin, cv.github, cv.website].filter(Boolean).map((c, i) => (
            <div key={i} style={{ fontSize: "9px", opacity: 0.85, marginBottom: "4px", wordBreak: "break-all" }}>{c}</div>
          ))}
        </div>

        {/* Skills */}
        {groups.length > 0 && (
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "#E8A020", marginBottom: "7px" }}>Skills</div>
            {groups.map((g, i) => (
              <div key={i} style={{ marginBottom: "6px" }}>
                {g.split(",").map(s => s.trim()).filter(Boolean).map((s, j) => (
                  <span key={j} style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", fontSize: "8.5px", padding: "2px 6px", borderRadius: "3px", margin: "1px 2px 1px 0" }}>{s}</span>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {cv.languages.some(l => l.lang) && (
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "#E8A020", marginBottom: "7px" }}>Languages</div>
            {cv.languages.filter(l => l.lang).map(l => (
              <div key={l.id} style={{ fontSize: "9px", opacity: 0.85, marginBottom: "4px" }}>
                <div style={{ fontWeight: "600" }}>{l.lang}</div>
                <div style={{ opacity: 0.7, fontSize: "8.5px" }}>{l.level}</div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {cv.certifications.some(c => c.name) && (
          <div>
            <div style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "#E8A020", marginBottom: "7px" }}>Certifications</div>
            {cv.certifications.filter(c => c.name).map(c => (
              <div key={c.id} style={{ fontSize: "9px", opacity: 0.85, marginBottom: "5px" }}>
                <div style={{ fontWeight: "600" }}>{c.name}</div>
                {(c.issuer ||