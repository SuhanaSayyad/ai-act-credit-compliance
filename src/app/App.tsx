import { useState } from "react";
import { QuestionnairePage } from "./components/QuestionnairePage";

const NAVY = "#0A0E1A";
const NAVY_LIGHT = "#111827";
const WHITE = "#FFFFFF";
const GREY = "#F8F9FA";

const ARTICLES = [
  { id: "art9",   label: "Art. 9",     color: "#B45309", dot: "#B45309" },
  { id: "art10",  label: "Art. 10(5)", color: "#6D28D9", dot: "#6D28D9" },
  { id: "art13",  label: "Art. 13",    color: "#047857", dot: "#047857" },
  { id: "art15",  label: "Art. 15",    color: "#B91C1C", dot: "#B91C1C" },
  { id: "art27",  label: "Art. 27",    color: "#1E40AF", dot: "#1E40AF" },
];

const MODULES = [
  {
    article: "Art. 9",
    color: "#B45309",
    name: "Risk Management System",
    description: "Continuous identification, analysis, and mitigation of known and foreseeable risks across the AI lifecycle.",
  },
  {
    article: "Art. 10(5)",
    color: "#6D28D9",
    name: "Bias and Fairness Assessment",
    description: "Statistical evaluation of training data for discriminatory patterns affecting protected characteristics.",
  },
  {
    article: "Art. 13",
    color: "#047857",
    name: "Transparency and Explainability",
    description: "Documentation of model logic, output interpretability, and disclosure obligations to affected individuals.",
  },
  {
    article: "Art. 15",
    color: "#B91C1C",
    name: "Cybersecurity and Robustness",
    description: "Resilience evaluation against adversarial inputs, model drift, and critical failure scenarios.",
  },
  {
    article: "Art. 27",
    color: "#1E40AF",
    name: "Fundamental Rights Impact Assessment",
    description: "Structured evaluation of material impacts on autonomy, equality, and individual rights.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Complete the questionnaire",
    desc: "Answer a single structured set of questions about your AI system, its data, and its deployment context.",
  },
  {
    n: "02",
    title: "System analysis",
    desc: "Your responses are mapped against each article's requirements and scored against the regulatory standard.",
  },
  {
    n: "03",
    title: "Reports generated",
    desc: "Five independent compliance reports are produced simultaneously, each citing the relevant provisions.",
  },
  {
    n: "04",
    title: "Export and act",
    desc: "Download structured PDF, CSV, or JSON reports ready for submission to your compliance or legal team.",
  },
];

export default function App() {
  const [page, setPage] = useState<"landing" | "questionnaire" | "results">("landing");

  if (page === "questionnaire") {
    return (
      <QuestionnairePage
        onBack={() => setPage("landing")}
        onComplete={() => setPage("results")}
      />
    );
  }

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
        background: WHITE,
        color: NAVY,
        minHeight: "100vh",
      }}
    >
      {/* 1. NAVBAR */}
      <nav
        style={{
          background: NAVY,
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "56px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "11px",
                fontWeight: 500,
                color: WHITE,
                letterSpacing: "0.02em",
              }}
            >
              EU
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                color: WHITE,
                letterSpacing: "0.01em",
                lineHeight: 1,
              }}
            >
              AI Act Compliance Tool
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "10px",
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.06em",
                lineHeight: 1,
              }}
            >
              Regulation 2024/1689
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => setPage("questionnaire")}
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 500,
            fontSize: "13px",
            color: NAVY,
            background: WHITE,
            border: "none",
            borderRadius: 0,
            padding: "8px 20px",
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          Begin Assessment
        </button>
      </nav>

      {/* 2. HERO */}
      <section
        style={{
          background: NAVY,
          padding: "120px 48px 128px",
          textAlign: "center",
        }}
      >
        {/* Tag */}
        <div
          style={{
            display: "inline-block",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.45)",
            border: "1px solid rgba(255,255,255,0.14)",
            padding: "5px 14px",
            marginBottom: "52px",
          }}
        >
          HIGH-RISK AI / ANNEX III POINT 5(B)
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "'IBM Plex Serif', serif",
            fontWeight: 400,
            fontSize: "clamp(40px, 5.5vw, 72px)",
            color: WHITE,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            maxWidth: "860px",
            margin: "0 auto 36px",
          }}
        >
          Compliance, Automated.
          <br />
          Five Reports, One Questionnaire.
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 300,
            fontSize: "18px",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.8,
            maxWidth: "560px",
            margin: "0 auto 56px",
          }}
        >
          Answer one structured questionnaire about your credit scoring AI system and receive five fully drafted compliance reports. Built for providers subject to the EU AI Act Annex III obligations.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setPage("questionnaire")}
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 500,
              fontSize: "15px",
              color: NAVY,
              background: WHITE,
              border: "none",
              borderRadius: 0,
              padding: "14px 36px",
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            Begin Assessment
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("coverage-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 400,
              fontSize: "15px",
              color: "rgba(255,255,255,0.75)",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 0,
              padding: "14px 36px",
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* 3. ARTICLE DIVIDER BAR */}
      <div
        style={{
          background: NAVY_LIGHT,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "14px 48px",
          display: "flex",
          justifyContent: "center",
          gap: "48px",
          flexWrap: "wrap",
        }}
      >
        {ARTICLES.map((a) => (
          <div
            key={a.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: a.dot,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {a.label}
            </span>
          </div>
        ))}
      </div>

      {/* 4. COMPLIANCE COVERAGE */}
      <section
        id="coverage-section"
        style={{
          background: WHITE,
          padding: "112px 48px 120px",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Section label */}
          <div
            style={{
              textAlign: "center",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.14em",
              color: "rgba(10,14,26,0.4)",
              marginBottom: "28px",
            }}
          >
            COMPLIANCE COVERAGE
          </div>

          {/* Heading */}
          <h2
            style={{
              fontFamily: "'IBM Plex Serif', serif",
              fontWeight: 400,
              fontSize: "clamp(28px, 3.5vw, 44px)",
              color: NAVY,
              lineHeight: 1.3,
              textAlign: "center",
              marginBottom: "72px",
              letterSpacing: "-0.01em",
            }}
          >
            Five mandatory assessments under EU AI Act
          </h2>

          {/* Rows */}
          <div>
            {MODULES.map((m, i) => (
              <div
                key={m.article}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr auto",
                  alignItems: "center",
                  gap: "40px",
                  padding: "36px 0",
                  borderTop: i === 0 ? "1px solid rgba(10,14,26,0.1)" : "none",
                  borderBottom: "1px solid rgba(10,14,26,0.1)",
                }}
              >
                {/* Article number */}
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: m.color,
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.article}
                </div>

                {/* Module name */}
                <div
                  style={{
                    fontFamily: "'IBM Plex Serif', serif",
                    fontWeight: 500,
                    fontSize: "20px",
                    color: NAVY,
                    lineHeight: 1.3,
                  }}
                >
                  {m.name}
                </div>

                {/* Description */}
                <div
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontWeight: 300,
                    fontSize: "14px",
                    color: "rgba(10,14,26,0.55)",
                    lineHeight: 1.7,
                    maxWidth: "340px",
                    textAlign: "right",
                  }}
                >
                  {m.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section
        style={{
          background: GREY,
          padding: "112px 48px 120px",
          borderTop: "1px solid rgba(10,14,26,0.07)",
          borderBottom: "1px solid rgba(10,14,26,0.07)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "'IBM Plex Serif', serif",
              fontWeight: 400,
              fontSize: "clamp(28px, 3.5vw, 44px)",
              color: NAVY,
              textAlign: "center",
              marginBottom: "88px",
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
            }}
          >
            From questionnaire to report in seconds
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "0",
            }}
          >
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                style={{
                  padding: "0 32px",
                  borderRight: i < STEPS.length - 1 ? "1px solid rgba(10,14,26,0.1)" : "none",
                  position: "relative",
                }}
              >
                {/* Large faded number */}
                <div
                  style={{
                    fontFamily: "'IBM Plex Serif', serif",
                    fontWeight: 600,
                    fontSize: "80px",
                    color: "rgba(10,14,26,0.05)",
                    lineHeight: 1,
                    marginBottom: "20px",
                    letterSpacing: "-0.02em",
                    userSelect: "none",
                  }}
                >
                  {step.n}
                </div>

                {/* Title */}
                <div
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "16px",
                    color: NAVY,
                    marginBottom: "14px",
                    lineHeight: 1.4,
                  }}
                >
                  {step.title}
                </div>

                {/* Description */}
                <div
                  style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontWeight: 300,
                    fontSize: "14px",
                    color: "rgba(10,14,26,0.55)",
                    lineHeight: 1.75,
                  }}
                >
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FOOTER CTA */}
      <section
        style={{
          background: WHITE,
          padding: "120px 48px 80px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'IBM Plex Serif', serif",
            fontWeight: 400,
            fontSize: "clamp(28px, 3.5vw, 48px)",
            color: NAVY,
            marginBottom: "24px",
            letterSpacing: "-0.01em",
            lineHeight: 1.25,
          }}
        >
          Ready to assess your system?
        </h2>

        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 300,
            fontSize: "16px",
            color: "rgba(10,14,26,0.55)",
            lineHeight: 1.75,
            maxWidth: "480px",
            margin: "0 auto 48px",
          }}
        >
          Begin the assessment today and receive your five compliance reports within minutes. No account required.
        </p>

        <button
          onClick={() => setPage("questionnaire")}
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 500,
            fontSize: "15px",
            color: WHITE,
            background: NAVY,
            border: "none",
            borderRadius: 0,
            padding: "16px 48px",
            cursor: "pointer",
            letterSpacing: "0.03em",
            marginBottom: "64px",
          }}
        >
          Begin Assessment
        </button>

        {/* Bottom mono line */}
        <div
          style={{
            borderTop: "1px solid rgba(10,14,26,0.1)",
            paddingTop: "32px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.06em",
              color: "rgba(10,14,26,0.35)",
            }}
          >
            Regulation (EU) 2024/1689 / Annex III Point 5(b)
          </span>
          <span style={{ color: "rgba(10,14,26,0.15)", fontSize: "11px" }}>/</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.06em",
              color: "rgba(10,14,26,0.35)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(10,14,26,0.2)",
              paddingBottom: "1px",
            }}
          >
            github.com/eu-ai-act-tool
          </a>
        </div>
      </section>
    </div>
  );
}
