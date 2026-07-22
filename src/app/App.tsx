import { useState } from "react";
import { QuestionnairePage } from "./components/QuestionnairePage";
import { ResultsPage } from "./components/ResultsPage";

export interface ApiResults {
  fria: any;
  cybersecurity: any;
  xai: any;
  risk: any;
  bias: any;
  systemName: string;
  organisationName: string;
  failedModules?: string[];
}

const NAVY  = "#0F1420";
const BLUE  = "#1E40AF";
const WHITE = "#FFFFFF";
const GREY  = "#F8F9FA";
const TEXT  = "#111827";
const MUTED = "#6B7280";
const FONT_SERIF = "Georgia, 'Times New Roman', serif";
const FONT_SANS  = "'Inter', system-ui, sans-serif";
const FONT_MONO  = "'IBM Plex Mono', monospace";

const MODULES = [
  { article: "Art. 9",     color: "#B45309", name: "Risk Management System",              description: "Continuous identification, analysis, and mitigation of known and foreseeable risks across the AI lifecycle." },
  { article: "Art. 10(5)", color: "#6D28D9", name: "Bias and Fairness Assessment",         description: "Statistical evaluation of training data for discriminatory patterns affecting protected characteristics." },
  { article: "Art. 13",    color: "#047857", name: "Transparency and Explainability",      description: "Documentation of model logic, output interpretability, and disclosure obligations to affected individuals." },
  { article: "Art. 15",    color: "#B91C1C", name: "Cybersecurity and Robustness",         description: "Resilience evaluation against adversarial inputs, model drift, and critical failure scenarios." },
  { article: "Art. 27",    color: "#1E40AF", name: "Fundamental Rights Impact Assessment", description: "Structured evaluation of material impacts on autonomy, equality, and individual rights." },
];

const STEPS = [
  { n: "01", title: "Complete the questionnaire", desc: "Answer a single structured set of questions about your AI system, its data, and its deployment context." },
  { n: "02", title: "System analysis",             desc: "Your responses are mapped against each article's requirements and scored against the regulatory standard." },
  { n: "03", title: "Reports generated",           desc: "Five independent compliance reports are produced simultaneously, each citing the relevant provisions." },
  { n: "04", title: "Export and act",              desc: "Download structured PDF, CSV, or JSON reports ready for submission to your compliance or legal team." },
];

const btnPrimary: React.CSSProperties = {
  fontFamily: FONT_SANS, fontWeight: 600, fontSize: "14px", letterSpacing: "0.01em",
  color: WHITE, background: BLUE, border: "none", borderRadius: "4px", padding: "13px 28px", cursor: "pointer",
};
const btnGhost: React.CSSProperties = {
  fontFamily: FONT_SANS, fontWeight: 500, fontSize: "14px", letterSpacing: "0.01em",
  color: "rgba(255,255,255,0.8)", background: "transparent",
  border: "1px solid rgba(255,255,255,0.3)", borderRadius: "4px", padding: "13px 28px", cursor: "pointer",
};

export default function App() {
  const [page, setPage] = useState<"landing" | "questionnaire" | "results">("landing");
  const [apiResults, setApiResults] = useState<ApiResults | null>(null);

  if (page === "questionnaire") {
    return (
      <QuestionnairePage
        onBack={() => setPage("landing")}
        onComplete={(results) => { setApiResults(results); setPage("results"); }}
      />
    );
  }

  if (page === "results") {
    return (
      <ResultsPage
        apiResults={apiResults}
        onBack={() => setPage("questionnaire")}
        onHome={() => setPage("landing")}
      />
    );
  }

  return (
    <div style={{ fontFamily: FONT_SANS, background: WHITE, color: TEXT, minHeight: "100vh" }}>
      <section style={{ background: NAVY, padding: "112px 56px 120px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "48px" }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.1em", fontWeight: 500, color: "#FCA5A5", background: "rgba(185,28,28,0.18)", border: "1px solid rgba(185,28,28,0.3)", borderRadius: "3px", padding: "4px 10px" }}>HIGH-RISK AI</span>
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "12px" }}>·</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>ANNEX III · POINT 5(B)</span>
        </div>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "clamp(36px, 5vw, 68px)", color: WHITE, lineHeight: 1.2, letterSpacing: "-0.01em", maxWidth: "820px", margin: "0 auto 32px" }}>
          Compliance, Automated.<br />Five Reports, One Questionnaire.
        </h1>
        <p style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: "17px", color: "rgba(255,255,255,0.52)", lineHeight: 1.8, maxWidth: "520px", margin: "0 auto 52px" }}>
          Answer one structured questionnaire about your credit scoring AI system and receive five fully drafted compliance reports. Built for providers subject to the EU AI Act Annex III obligations.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={() => setPage("questionnaire")} style={btnPrimary}>Begin Assessment</button>
          <button onClick={() => document.getElementById("coverage-section")?.scrollIntoView({ behavior: "smooth" })} style={btnGhost}>Learn More</button>
        </div>
      </section>

      <section id="coverage-section" style={{ background: WHITE, padding: "104px 56px 112px" }}>
        <div style={{ maxWidth: "880px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.16em", color: MUTED, marginBottom: "20px" }}>COMPLIANCE COVERAGE</div>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "clamp(26px, 3vw, 40px)", color: TEXT, textAlign: "center", marginBottom: "64px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
            Five mandatory assessments under EU AI Act
          </h2>
          <div>
            {MODULES.map((m, i) => (
              <div key={m.article} className="coverage-row" style={{ display: "grid", gridTemplateColumns: "112px 1fr 1fr", alignItems: "center", gap: "32px", padding: "32px 0", borderTop: i === 0 ? "1px solid rgba(0,0,0,0.08)" : "none", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: "15px", fontWeight: 500, color: m.color, letterSpacing: "0.02em" }}>{m.article}</span>
                <div style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "18px", color: TEXT, lineHeight: 1.35 }}>{m.name}</div>
                <div className="coverage-desc" style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: "13px", color: MUTED, lineHeight: 1.7, textAlign: "right" }}>{m.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: GREY, padding: "104px 56px 112px", borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "clamp(26px, 3vw, 40px)", color: TEXT, textAlign: "center", marginBottom: "80px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
            From questionnaire to report in seconds
          </h2>
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={{ padding: "0 28px", borderRight: i < STEPS.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none" }}>
                <div style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "88px", color: "rgba(0,0,0,0.1)", lineHeight: 1, marginBottom: "18px", userSelect: "none" }}>{step.n}</div>
                <div style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: "15px", color: TEXT, marginBottom: "10px", lineHeight: 1.4 }}>{step.title}</div>
                <div style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: "13px", color: MUTED, lineHeight: 1.75 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: WHITE, padding: "112px 56px 72px", textAlign: "center" }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "clamp(28px, 3.5vw, 46px)", color: TEXT, marginBottom: "20px", lineHeight: 1.25, letterSpacing: "-0.01em" }}>Ready to assess your system?</h2>
        <p style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: "15px", color: MUTED, lineHeight: 1.75, maxWidth: "440px", margin: "0 auto 44px" }}>
          Begin the assessment today and receive your five compliance reports within seconds. No account required.
        </p>
        <button onClick={() => setPage("questionnaire")} style={{ ...btnPrimary, fontSize: "15px", padding: "15px 44px", marginBottom: "56px" }}>Begin Assessment</button>
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "28px", display: "flex", justifyContent: "center", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.06em", color: "rgba(0,0,0,0.3)" }}>Regulation (EU) 2024/1689 / Annex III Point 5(b)</span>
          <span style={{ color: "rgba(0,0,0,0.15)", fontSize: "10px" }}>/</span>
          <a href="https://github.com/SuhanaSayyad/ai-act-credit-compliance" target="_blank" rel="noopener noreferrer" style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.06em", color: BLUE, textDecoration: "none", borderBottom: "1px solid rgba(30,64,175,0.3)", paddingBottom: "1px" }}>
            github.com/SuhanaSayyad/ai-act-credit-compliance
          </a>
        </div>
      </section>
    </div>
  );
}
