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
                {(c.issuer || c.year) && <div style={{ opacity: 0.7, fontSize: "8.5px" }}>{[c.issuer, c.year].filter(Boolean).join(" · ")}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ padding: "28px 26px", color: "#2d2d2d" }}>
        {cv.summary && (
          <div style={{ marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid #e5e7eb" }}>
            <p style={{ margin: 0, color: "#555", lineHeight: "1.6" }}>{cv.summary}</p>
          </div>
        )}

        {cv.experiences.some(e => e.company || e.role) && (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", color: SIDEBAR, marginBottom: "8px", paddingBottom: "4px", borderBottom: `2px solid ${SIDEBAR}` }}>Experience</div>
            {cv.experiences.filter(e => e.company || e.role).map(exp => (
              <div key={exp.id} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: "700", fontSize: "11px" }}>{exp.role}</span>
                  <span style={{ fontSize: "9px", color: "#888", flexShrink: 0 }}>{[exp.start, exp.current ? "Present" : exp.end].filter(Boolean).join(" – ")}</span>
                </div>
                <div style={{ color: "#1a4a9f", fontWeight: "600", fontSize: "10px" }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                {exp.bullets.filter(b => b).length > 0 && (
                  <ul style={{ margin: "4px 0 0 0", paddingLeft: "14px" }}>
                    {exp.bullets.filter(b => b).map((b, i) => <li key={i} style={{ color: "#444", marginBottom: "2px" }}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {cv.educations.some(e => e.school || e.degree) && (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", color: SIDEBAR, marginBottom: "8px", paddingBottom: "4px", borderBottom: `2px solid ${SIDEBAR}` }}>Education</div>
            {cv.educations.filter(e => e.school || e.degree).map(edu => (
              <div key={edu.id} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "700", fontSize: "11px" }}>{edu.school}</span>
                  <span style={{ fontSize: "9px", color: "#888", flexShrink: 0 }}>{edu.graduation}</span>
                </div>
                <div style={{ color: "#555" }}>{[edu.degree, edu.field].filter(Boolean).join(" in ")}</div>
                {(edu.gpa || edu.honors) && <div style={{ fontSize: "9.5px", color: "#888" }}>{[edu.gpa && `GPA: ${edu.gpa}`, edu.honors].filter(Boolean).join(" · ")}</div>}
              </div>
            ))}
          </div>
        )}

        {cv.projects.some(p => p.name) && (
          <div>
            <div style={{ fontSize: "10.5px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", color: SIDEBAR, marginBottom: "8px", paddingBottom: "4px", borderBottom: `2px solid ${SIDEBAR}` }}>Projects</div>
            {cv.projects.filter(p => p.name).map(p => (
              <div key={p.id} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "700", fontSize: "11px" }}>{p.name}</span>
                  {p.link && <span style={{ fontSize: "9px", color: "#888" }}>{p.link}</span>}
                </div>
                {p.desc && <div style={{ color: "#555", marginTop: "1px" }}>{p.desc}</div>}
                {p.tech && <div style={{ fontSize: "9.5px", color: "#888", fontStyle: "italic" }}>{p.tech}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CVPreview wrapper ────────────────────────────────────────────────────────
function CVPreview({ cv, template }: { cv: CV; template: Template }) {
  return (
    <div id="cv-preview" style={{ background: "white", minHeight: "900px" }}>
      {template === "harvard" && <HarvardTemplate cv={cv} />}
      {template === "modern"  && <ModernTemplate  cv={cv} />}
      {template === "clean"   && <CleanTemplate   cv={cv} />}
      {template === "bold"    && <BoldTemplate     cv={cv} />}
    </div>
  );
}

// ─── AI Improve Button ────────────────────────────────────────────────────────
function AIImproveBtn({ field, text, onImproved }: { field: string; text: string; onImproved: (t: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function improve() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/improve-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, text }),
      });
      const data = await res.json();
      if (data.result) onImproved(data.result);
      else setError(data.error || "Error");
    } catch {
      setError("AI not available");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button onClick={improve} disabled={loading || !text.trim()}
        title="Improve with AI"
        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        {loading ? <span className="animate-spin">⟳</span> : "✨"} AI Improve
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CVBuilderPage() {
  const [cv, setCV]           = useState<CV>(EMPTY_CV);
  const [tab, setTab]         = useState<TabKey>("personal");
  const [template, setTmpl]   = useState<Template>("modern");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (field: keyof CV, val: unknown) => setCV(p => ({ ...p, [field]: val } as CV));

  // Experience helpers
  const setExp  = (i: number, f: string, v: unknown) => {
    const a = [...cv.experiences]; a[i] = { ...a[i], [f]: v } as Exp; set("experiences", a);
  };
  const setBullet = (ei: number, bi: number, v: string) => {
    const a = cv.experiences.map((e, idx) => {
      if (idx !== ei) return e;
      const bullets = [...e.bullets]; bullets[bi] = v; return { ...e, bullets };
    });
    set("experiences", a);
  };
  const addBullet = (ei: number) => {
    const a = cv.experiences.map((e, idx) => idx !== ei ? e : { ...e, bullets: [...e.bullets, ""] });
    set("experiences", a);
  };
  const delBullet = (ei: number, bi: number) => {
    const a = cv.experiences.map((e, idx) => idx !== ei ? e : { ...e, bullets: e.bullets.filter((_, j) => j !== bi) });
    set("experiences", a);
  };
  const addExp  = () => set("experiences", [...cv.experiences, { id: uid(), company: "", role: "", location: "", start: "", end: "", current: false, bullets: ["", "", ""] }]);
  const delExp  = (i: number) => set("experiences", cv.experiences.filter((_, j) => j !== i));

  // Education helpers
  const setEdu  = (i: number, f: string, v: string) => {
    const a = [...cv.educations]; a[i] = { ...a[i], [f]: v } as Edu; set("educations", a);
  };
  const addEdu  = () => set("educations", [...cv.educations, { id: uid(), school: "", degree: "", field: "", graduation: "", gpa: "", honors: "" }]);
  const delEdu  = (i: number) => set("educations", cv.educations.filter((_, j) => j !== i));

  // Language helpers
  const setLang = (i: number, f: string, v: string) => {
    const a = [...cv.languages]; a[i] = { ...a[i], [f]: v } as Lang; set("languages", a);
  };
  const addLang = () => set("languages", [...cv.languages, { id: uid(), lang: "", level: "Fluent" }]);
  const delLang = (i: number) => set("languages", cv.languages.filter((_, j) => j !== i));

  // Cert helpers
  const setCert = (i: number, f: string, v: string) => {
    const a = [...cv.certifications]; a[i] = { ...a[i], [f]: v } as Cert; set("certifications", a);
  };
  const addCert = () => set("certifications", [...cv.certifications, { id: uid(), name: "", issuer: "", year: "" }]);
  const delCert = (i: number) => set("certifications", cv.certifications.filter((_, j) => j !== i));

  // Project helpers
  const setProj = (i: number, f: string, v: string) => {
    const a = [...cv.projects]; a[i] = { ...a[i], [f]: v } as Proj; set("projects", a);
  };
  const addProj = () => set("projects", [...cv.projects, { id: uid(), name: "", desc: "", tech: "", link: "" }]);
  const delProj = (i: number) => set("projects", cv.projects.filter((_, j) => j !== i));

  const inp  = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all bg-white";
  const lbl  = "block text-xs font-semibold text-text-sub mb-1";
  const card = "bg-white rounded-xl border border-gray-100 shadow-sm p-5";

  const TEMPLATES: { id: Template; label: string; desc: string }[] = [
    { id: "harvard", label: "Harvard", desc: "كلاسيكي — Serif" },
    { id: "modern",  label: "Modern",  desc: "أزرق — حديث" },
    { id: "clean",   label: "Clean",   desc: "نظيف — Grid" },
    { id: "bold",    label: "Bold",    desc: "عمودان — أسود" },
  ];

  const TABS: { id: TabKey; label: string }[] = [
    { id: "personal",    label: "👤 Personal" },
    { id: "experience",  label: "💼 Experience" },
    { id: "education",   label: "🎓 Education" },
    { id: "skills",      label: "⚡ Skills" },
    { id: "projects",    label: "🚀 Projects" },
  ];

  return (
    <div className="min-h-screen bg-light" dir="rtl">
      {/* Print CSS */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body * { visibility: hidden !important; }
          #cv-preview, #cv-preview * { visibility: visible !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          #cv-preview { position: fixed !important; inset: 0 !important; width: 210mm !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; box-shadow: none !important; }
        }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-extrabold">م</span>
              </div>
              <span className="text-primary font-extrabold text-lg">مسارك</span>
            </Link>
            <span className="text-gray-300">›</span>
            <Link href="/tools" className="text-text-sub text-sm hover:text-primary">الأدوات</Link>
            <span className="text-gray-300">›</span>
            <span className="text-primary text-sm font-semibold">CV Builder</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCV(SAMPLE_CV)}
              className="text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:border-primary text-text-sub hover:text-primary transition-all">
              📋 Sample CV
            </button>
            <button onClick={() => setCV(EMPTY_CV)}
              className="text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:border-red-300 text-text-sub hover:text-red-500 transition-all">
              🗑️ Clear
            </button>
            <button onClick={() => window.print()}
              className="btn-primary text-sm px-5 py-2 rounded-lg flex items-center gap-2">
              ⬇️ Export PDF
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Template selector */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <span className="text-sm font-bold text-text-sub">القالب:</span>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setTmpl(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center gap-0.5 ${
                template === t.id ? "border-primary bg-primary text-white" : "border-gray-200 text-text-sub hover:border-primary bg-white"
              }`}>
              <span>{t.label}</span>
              <span className={`text-xs font-normal ${template === t.id ? "text-white/70" : "text-text-sub/70"}`}>{t.desc}</span>
            </button>
          ))}
        </div>

        <div className="grid xl:grid-cols-2 gap-6">
          {/* ── LEFT: Form ── */}
          <div className="space-y-4">
            {/* Tab bar */}
            <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm overflow-x-auto">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    tab === t.id ? "bg-primary text-white shadow-sm" : "text-text-sub hover:text-primary"
                  }`}>{t.label}</button>
              ))}
            </div>

            {/* ── PERSONAL ── */}
            {tab === "personal" && (
              <div className={card}>
                <h3 className="font-bold text-primary mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className={lbl}>First Name *</label>
                    <input className={inp} value={cv.firstName} onChange={e => set("firstName", e.target.value)} placeholder="Ahmad" dir="ltr" /></div>
                  <div><label className={lbl}>Last Name *</label>
                    <input className={inp} value={cv.lastName} onChange={e => set("lastName", e.target.value)} placeholder="Mansour" dir="ltr" /></div>
                </div>
                <div className="mb-3"><label className={lbl}>Professional Title</label>
                  <input className={inp} value={cv.title} onChange={e => set("title", e.target.value)} placeholder="Software Engineer" dir="ltr" /></div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className={lbl}>Email</label>
                    <input className={inp} value={cv.email} onChange={e => set("email", e.target.value)} placeholder="name@email.com" dir="ltr" /></div>
                  <div><label className={lbl}>Phone</label>
                    <input className={inp} value={cv.phone} onChange={e => set("phone", e.target.value)} placeholder="+961 70 000 000" dir="ltr" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className={lbl}>Location</label>
                    <input className={inp} value={cv.location} onChange={e => set("location", e.target.value)} placeholder="Beirut, Lebanon" dir="ltr" /></div>
                  <div><label className={lbl}>LinkedIn</label>
                    <input className={inp} value={cv.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="linkedin.com/in/..." dir="ltr" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><label className={lbl}>GitHub</label>
                    <input className={inp} value={cv.github} onChange={e => set("github", e.target.value)} placeholder="github.com/..." dir="ltr" /></div>
                  <div><label className={lbl}>Website / Portfolio</label>
                    <input className={inp} value={cv.website} onChange={e => set("website", e.target.value)} placeholder="yoursite.com" dir="ltr" /></div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={lbl + " mb-0"}>Professional Summary *</label>
                    <AIImproveBtn field="summary" text={cv.summary} onImproved={t => set("summary", t)} />
                  </div>
                  <textarea className={inp + " resize-none"} rows={4} dir="ltr"
                    value={cv.summary} onChange={e => set("summary", e.target.value)}
                    placeholder="Results-driven professional with X years of experience in... Skilled in... Passionate about..." />
                  <p className="text-xs text-text-sub mt-1">💡 اكتب بالإنجليزية — الـ CV هيكون بالإنجليزي</p>
                </div>
              </div>
            )}

            {/* ── EXPERIENCE ── */}
            {tab === "experience" && (
              <div className="space-y-4">
                {cv.experiences.map((exp, ei) => (
                  <div key={exp.id} className={card + " relative"}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-primary">💼 Experience #{ei + 1}</span>
                      {cv.experiences.length > 1 && (
                        <button onClick={() => delExp(ei)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50">✕ Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div><label className={lbl}>Company *</label>
                        <input className={inp} dir="ltr" value={exp.company} onChange={e => setExp(ei, "company", e.target.value)} placeholder="Company Name" /></div>
                      <div><label className={lbl}>Job Title *</label>
                        <input className={inp} dir="ltr" value={exp.role} onChange={e => setExp(ei, "role", e.target.value)} placeholder="Software Engineer" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div><label className={lbl}>Location</label>
                        <input className={inp} dir="ltr" value={exp.location} onChange={e => setExp(ei, "location", e.target.value)} placeholder="Beirut, Lebanon" /></div>
                      <div><label className={lbl}>Start Date</label>
                        <input className={inp} dir="ltr" value={exp.start} onChange={e => setExp(ei, "start", e.target.value)} placeholder="Jan 2022" /></div>
                      <div>
                        <label className={lbl}>End Date</label>
                        <div className="relative">
                          <input className={inp} dir="ltr" value={exp.current ? "Present" : exp.end}
                            disabled={exp.current}
                            onChange={e => setExp(ei, "end", e.target.value)} placeholder="Dec 2023" />
                        </div>
                        <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                          <input type="checkbox" checked={exp.current} onChange={e => setExp(ei, "current", e.target.checked)} />
                          <span className="text-xs text-text-sub">Current</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className={lbl + " mb-0"}>Achievements / Bullets *</label>
                        <AIImproveBtn field="bullets"
                          text={exp.bullets.filter(b=>b).join("\n")}
                          onImproved={t => {
                            const lines = t.split("\n").filter(Boolean);
                            const a = [...cv.experiences]; a[ei] = { ...a[ei], bullets: lines }; set("experiences", a);
                          }} />
                      </div>
                      <p className="text-xs text-text-sub mb-2">💡 Start each bullet with a strong verb + numbers: "Led...", "Built...", "Increased X by Y%"</p>
                      {exp.bullets.map((b, bi) => (
                        <div key={bi} className="flex gap-1 mb-2">
                          <span className="text-text-sub mt-2 text-xs">▸</span>
                          <textarea className={inp + " resize-none flex-1"} rows={2} dir="ltr"
                            value={b} onChange={e => setBullet(ei, bi, e.target.value)}
                            placeholder="Led development of X feature, resulting in Y% improvement..." />
                          {exp.bullets.length > 1 && (
                            <button onClick={() => delBullet(ei, bi)} className="text-red-400 text-xs px-1 hover:bg-red-50 rounded self-start mt-1">✕</button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addBullet(ei)} className="text-xs text-primary hover:underline mt-1">+ Add bullet</button>
                    </div>
                  </div>
                ))}
                <button onClick={addExp}
                  className="w-full border-2 border-dashed border-primary/30 text-primary/70 rounded-xl py-3 text-sm font-semibold hover:border-primary hover:text-primary transition-all bg-white">
                  + Add Experience
                </button>
              </div>
            )}

            {/* ── EDUCATION ── */}
            {tab === "education" && (
              <div className="space-y-4">
                {cv.educations.map((edu, i) => (
                  <div key={edu.id} className={card}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-primary">🎓 Education #{i + 1}</span>
                      {cv.educations.length > 1 && (
                        <button onClick={() => delEdu(i)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50">✕ Remove</button>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className={lbl}>University / Institution *</label>
                      <input className={inp} dir="ltr" value={edu.school} onChange={e => setEdu(i, "school", e.target.value)} placeholder="American University of Beirut (AUB)" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div><label className={lbl}>Degree</label>
                        <input className={inp} dir="ltr" value={edu.degree} onChange={e => setEdu(i, "degree", e.target.value)} placeholder="B.S. / M.S." /></div>
                      <div><label className={lbl}>Field of Study</label>
                        <input className={inp} dir="ltr" value={edu.field} onChange={e => setEdu(i, "field", e.target.value)} placeholder="Computer Science" /></div>
                      <div><label className={lbl}>Graduation</label>
                        <input className={inp} dir="ltr" value={edu.graduation} onChange={e => setEdu(i, "graduation", e.target.value)} placeholder="May 2024" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={lbl}>GPA (optional)</label>
                        <input className={inp} dir="ltr" value={edu.gpa} onChange={e => setEdu(i, "gpa", e.target.value)} placeholder="3.8 / 4.0" /></div>
                      <div><label className={lbl}>Honors / Awards</label>
                        <input className={inp} dir="ltr" value={edu.honors} onChange={e => setEdu(i, "honors", e.target.value)} placeholder="Dean's List, Summa Cum Laude" /></div>
                    </div>
                  </div>
                ))}
                <button onClick={addEdu}
                  className="w-full border-2 border-dashed border-primary/30 text-primary/70 rounded-xl py-3 text-sm font-semibold hover:border-primary hover:text-primary transition-all bg-white">
                  + Add Education
                </button>
              </div>
            )}

            {/* ── SKILLS ── */}
            {tab === "skills" && (
              <div className="space-y-4">
                <div className={card}>
                  <h3 className="font-bold text-primary mb-1">⚡ Technical Skills</h3>
                  <p className="text-xs text-text-sub mb-3">افصل بين المجموعات بـ | — مثل: "React, Node.js | Python, ML | AWS, Docker"</p>
                  <textarea className={inp + " resize-none"} rows={4} dir="ltr"
                    value={cv.skillGroups} onChange={e => set("skillGroups", e.target.value)}
                    placeholder="JavaScript, TypeScript, React, Next.js | Node.js, Python, REST APIs | AWS, Docker, PostgreSQL | Git, Agile" />
                </div>

                <div className={card}>
                  <h3 className="font-bold text-primary mb-4">🌐 Languages</h3>
                  {cv.languages.map((lang, i) => (
                    <div key={lang.id} className="flex gap-2 mb-2 items-center">
                      <input className={inp + " flex-1"} dir="ltr" value={lang.lang} onChange={e => setLang(i, "lang", e.target.value)} placeholder="English" />
                      <select className={inp + " w-36"} value={lang.level} onChange={e => setLang(i, "level", e.target.value)}>
                        {LANG_LEVELS.map(l => <option key={l}>{l}</option>)}
                      </select>
                      {cv.languages.length > 1 && (
                        <button onClick={() => delLang(i)} className="text-red-400 text-xs px-1.5 hover:bg-red-50 rounded">✕</button>
                      )}
                    </div>
                  ))}
                  <button onClick={addLang} className="text-xs text-primary hover:underline mt-1">+ Add language</button>
                </div>

                <div className={card}>
                  <h3 className="font-bold text-primary mb-4">🏆 Certifications</h3>
                  {cv.certifications.map((cert, i) => (
                    <div key={cert.id} className="grid grid-cols-3 gap-2 mb-2 items-start">
                      <input className={inp} dir="ltr" value={cert.name} onChange={e => setCert(i, "name", e.target.value)} placeholder="Certification name" />
                      <input className={inp} dir="ltr" value={cert.issuer} onChange={e => setCert(i, "issuer", e.target.value)} placeholder="Issuing org" />
                      <div className="flex gap-1">
                        <input className={inp + " flex-1"} dir="ltr" value={cert.year} onChange={e => setCert(i, "year", e.target.value)} placeholder="2024" />
                        {cv.certifications.length > 1 && (
                          <button onClick={() => delCert(i)} className="text-red-400 text-xs px-1.5 hover:bg-red-50 rounded">✕</button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button onClick={addCert} className="text-xs text-primary hover:underline mt-1">+ Add certification</button>
                </div>
              </div>
            )}

            {/* ── PROJECTS ── */}
            {tab === "projects" && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                  💡 <b>Pro tip:</b> Projects are crucial for students and junior developers. Include 2–4 strong projects with measurable impact.
                </div>
                {cv.projects.map((proj, i) => (
                  <div key={proj.id} className={card}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-primary">🚀 Project #{i + 1}</span>
                      {cv.projects.length > 1 && (
                        <button onClick={() => delProj(i)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50">✕ Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div><label className={lbl}>Project Name *</label>
                        <input className={inp} dir="ltr" value={proj.name} onChange={e => setProj(i, "name", e.target.value)} placeholder="My Awesome Project" /></div>
                      <div><label className={lbl}>Live URL / GitHub</label>
                        <input className={inp} dir="ltr" value={proj.link} onChange={e => setProj(i, "link", e.target.value)} placeholder="github.com/user/project" /></div>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <label className={lbl + " mb-0"}>Description *</label>
                        <AIImproveBtn field="project"
                          text={proj.desc}
                          onImproved={t => { const a = [...cv.projects]; a[i] = { ...a[i], desc: t }; set("projects", a); }} />
                      </div>
                      <textarea className={inp + " resize-none"} rows={2} dir="ltr"
                        value={proj.desc} onChange={e => setProj(i, "desc", e.target.value)}
                        placeholder="Brief description of what it does, who uses it, and impact..." />
                    </div>
                    <div><label className={lbl}>Technologies Used</label>
                      <input className={inp} dir="ltr" value={proj.tech} onChange={e => setProj(i, "tech", e.target.value)} placeholder="React, Node.js, PostgreSQL, AWS" /></div>
                  </div>
                ))}
                <button onClick={addProj}
                  className="w-full border-2 border-dashed border-primary/30 text-primary/70 rounded-xl py-3 text-sm font-semibold hover:border-primary hover:text-primary transition-all bg-white">
                  + Add Project
                </button>
              </div>
            )}
          </div>

          {/* ── RIGHT: Live Preview ── */}
          <div className="xl:sticky xl:top-24 xl:h-[calc(100vh-120px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-text-sub">👁️ Live Preview</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-sub">سيُصدَّر بالإنجليزي كـ A4 PDF</span>
                <button onClick={() => window.print()}
                  className="btn-primary text-xs px-4 py-2 rounded-lg flex items-center gap-1.5">
                  ⬇️ Export PDF
                </button>
              </div>
            </div>
            <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200">
              <CVPreview cv={cv} template={template} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
