import { useState } from "react";
import type { ApiResults } from "./App";

const NAVY   = "#0F1420";
const WHITE  = "#FFFFFF";
const GREY   = "#F8F9FA";
const BLUE   = "#1E40AF";
const GREEN  = "#047857";
const TEXT   = "#111827";
const MUTED  = "#6B7280";
const SUBTLE = "rgba(0,0,0,0.08)";

const FONT_SERIF = "Georgia, 'Times New Roman', serif";
const FONT_SANS  = "'Inter', system-ui, sans-serif";
const FONT_MONO  = "'IBM Plex Mono', monospace";

const BASE_URL = "https://suhanasayyad-ai-act-compliance-backend.hf.space";

interface StepMeta { color: string; dots: { color: string; label: string }[]; description: string; }
const STEP_META: Record<number, StepMeta> = {
  1: { color: BLUE,      dots: [],                                                                          description: "System profile" },
  2: { color: "#6D28D9", dots: [{ color: "#6D28D9", label: "Art. 10(5)" }],                                description: "Art. 10(5)" },
  3: { color: "#B45309", dots: [{ color: "#B45309", label: "Art. 9" }, { color: "#B91C1C", label: "Art. 15" }], description: "Art. 9 / Art. 15" },
  4: { color: "#047857", dots: [{ color: "#047857", label: "Art. 13" }],                                   description: "Art. 13" },
  5: { color: BLUE,      dots: [{ color: BLUE,      label: "Art. 27" }],                                   description: "Art. 27" },
};

type FieldType = "text" | "toggle" | "select";
interface Field { id: string; label: string; type: FieldType; placeholder?: string; options?: string[]; help?: string; }
interface Step  { number: number; title: string; subtitle: string; fields: Field[]; }

const STEPS: Step[] = [
  {
    number: 1, title: "System Identification", subtitle: "Basic identifying information about your AI system.",
    fields: [
      { id: "1.1", label: "System name",         type: "text",   placeholder: "e.g. CreditScore Decision Engine v2.3", help: "The commercial or internal name and version of the AI system as it appears in your technical documentation." },
      { id: "1.2", label: "Provider organisation", type: "text", placeholder: "e.g. Nordea Financial Services AB",        help: "The legal entity that develops the system or has it developed and places it on the market under its own name." },
      { id: "1.3", label: "Model type", type: "select", options: ["Logistic Regression", "Gradient Boosted Trees", "Random Forest", "XGBoost", "Neural Network", "Other"],
        help: "The underlying algorithm class. This influences transparency obligations under Article 13." },
      { id: "1.4", label: "Does the system make fully automated decisions without human review?", type: "toggle", help: "Fully automated decisions trigger Article 22 GDPR safeguards and AI Act oversight requirements under Article 14." },
      { id: "1.5", label: "Is human oversight available to review decisions?",                    type: "toggle", help: "Article 14 requires high-risk systems to be designed so natural persons can effectively oversee, intervene, and override outputs." },
    ],
  },
  {
    number: 2, title: "Data Processing", subtitle: "Data sources, categories, and handling practices.",
    fields: [
      { id: "2.1", label: "Primary data sources",   type: "text",   placeholder: "e.g. Credit bureau records, bank transaction history", help: "Datasets used to train, validate, and operate the model. Article 10 requires training data to be relevant, representative, and examined for bias." },
      { id: "2.2", label: "Data retention period",  type: "text",   placeholder: "e.g. 36 months from collection date",                  help: "How long personal data is retained. Must be limited to what is necessary (GDPR Article 5(1)(e)) and documented in the technical file." },
      { id: "2.3", label: "Does the system process special category data under GDPR Article 9?", type: "toggle", help: "Special category data includes racial or ethnic origin, health, religion, and similar attributes. Requires explicit legal basis and heightened bias scrutiny under AI Act Article 10(5)." },
      { id: "2.4", label: "Does the system share data with third parties?",                      type: "toggle", help: "Any transfer to external processors or recipients must be covered by data processing agreements and disclosed in your records of processing activities." },
    ],
  },
  {
    number: 3, title: "Risk and Security", subtitle: "Known risks, security controls, and audit capabilities.",
    fields: [
      { id: "3.1", label: "Has a formal security audit been conducted in the last 12 months?", type: "toggle", help: "Article 15 requires appropriate cybersecurity and robustness. An annual independent security audit is expected evidence of an adequate testing cadence." },
      { id: "3.2", label: "Does the system expose an external API?",                           type: "toggle", help: "External interfaces expand the attack surface. Article 15(4) requires resilience against unauthorised third parties altering the system's use or performance." },
      { id: "3.3", label: "Are access controls implemented on the model and API?",             type: "toggle", help: "Authentication, authorisation, and rate limiting on the model and endpoints. Baseline controls for the cybersecurity requirement under Article 15." },
      { id: "3.4", label: "Is audit logging enabled for all model decisions?",                 type: "toggle", help: "Article 12 requires automatic logging of events over the system's lifetime to enable traceability and post-market monitoring." },
      { id: "3.5", label: "Are there any known bias issues with this system?",                 type: "toggle", help: "Disclose any identified disparities in outcomes across groups. Known bias affecting protected characteristics is a material finding under Article 10(5)." },
    ],
  },
  {
    number: 4, title: "Transparency", subtitle: "Explanation methods and disclosure obligations.",
    fields: [
      { id: "4.1", label: "Output explanation method", type: "select", options: ["SHAP Values", "LIME", "Decision Rules", "Feature Importance", "Logistic Coefficients", "Model Cards", "Other", "None"],
        help: "The technique used to explain individual outputs. Article 13 requires transparency sufficient for deployers to correctly interpret and use results." },
      { id: "4.2", label: "Subject notification mechanism",  type: "text",   placeholder: "e.g. Automated email with score category within 24 hours", help: "How affected individuals are informed of a decision and their right to explanation. Timeliness and clarity of this channel are part of the transparency obligation." },
      { id: "4.3", label: "Is the AI nature of the system disclosed to subjects before assessment?", type: "toggle", help: "Article 50 requires that people are informed when they are being assessed by an AI system, unless it is obvious from the context." },
    ],
  },
  {
    number: 5, title: "Rights Impact", subtitle: "Assessment of fundamental rights implications.",
    fields: [
      { id: "5.1", label: "Vulnerable or protected groups potentially affected", type: "text",   placeholder: "e.g. Minority ethnic groups, low-income households", help: "Groups who may be disproportionately impacted. Article 27 requires the FRIA to consider specific categories of persons likely to be affected." },
      { id: "5.2", label: "Has a Fundamental Rights Impact Assessment been previously conducted?", type: "toggle", help: "Article 27 requires certain deployers of high-risk systems to conduct a FRIA before deployment, covering rights impacts and mitigation measures envisaged." },
      { id: "5.3", label: "Responsible person or team for rights oversight", type: "text", placeholder: "e.g. Chief Compliance Officer, Ethics Review Board", help: "The named person or team accountable for implementing rights-protection measures. Article 27(2)(g) requires identifying who is responsible." },
    ],
  },
];

interface Props {
  onBack: () => void;
  onComplete: (results: ApiResults) => void;
}

export function QuestionnairePage({ onBack, onComplete }: Props) {
  const [currentStep, setCurrentStep]     = useState(1);
  const [answers, setAnswers]             = useState<Record<string, string>>({});
  const [toggleValues, setToggleValues]   = useState<Record<string, boolean | null>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);
  const [loadingMsg, setLoadingMsg]       = useState("Initialising assessment...");
  const [error, setError]                 = useState<string | null>(null);

  const step        = STEPS[currentStep - 1];
  const totalSteps  = STEPS.length;
  const meta        = STEP_META[currentStep];
  const accentColor = meta.color;

  function handleText(id: string, value: string)    { setAnswers(prev => ({ ...prev, [id]: value })); }
  function handleToggle(id: string, value: boolean) { setToggleValues(prev => ({ ...prev, [id]: value })); }

  function buildPayload() {
    const systemName = (answers["1.1"] || "").trim() || "CreditAccess";
    const explainMap: Record<string, string> = {
      "SHAP Values":           "SHAP",
      "LIME":                  "LIME",
      "Decision Rules":        "Decision Rules",
      "Feature Importance":    "Feature Importance",
      "Logistic Coefficients": "Logistic Coefficients",
      "Model Cards":           "Model Cards",
      "Other":                 "Other",
      "None":                  "None",
    };
    const result = {
      system_name:                  systemName,
      organisation_name:            (answers["1.2"] || "").trim() || "Organisation",
      intended_purpose:             "Automated credit scoring for personal loan applications",
      affected_population:          (answers["5.1"] || "").trim() || "Personal loan applicants",
      estimated_users_per_year:     50000,
      model_version:                "1.0.0",
      uses_personal_data:           true,
      model_type:                   answers["1.3"] || "Neural Network",
      automated_decision_making:    toggleValues["1.4"] ?? false,
      human_oversight_available:    toggleValues["1.5"] ?? true,
      uses_special_category_data:   toggleValues["2.3"] ?? false,
      data_sources:                 (answers["2.1"] || "").trim() || "Credit bureau data",
      data_retention_period:        (answers["2.2"] || "").trim() || "36 months",
      third_party_data_sharing:     toggleValues["2.4"] ?? false,
      external_api_access:          toggleValues["3.2"] ?? false,
      access_controls_implemented:  toggleValues["3.3"] ?? true,
      audit_logging_enabled:        toggleValues["3.4"] ?? true,
      previously_audited:           toggleValues["3.1"] ?? false,
      known_bias_issues:            toggleValues["3.5"] ?? false,
      deployment_sector:            "Banking and Financial Services",
      explainability_method:        explainMap[answers["4.1"] || "None"] ?? "None",
      model_api_endpoint:           null,
    };
    return result;
  }

  async function runAssessment() {
    setLoading(true);
    setError(null);

    const payload = buildPayload();
    const systemName = payload.system_name;

    const messages = [
      "Connecting to compliance engine...",
      "Running FRIA assessment (Art. 27)...",
      "Running cybersecurity analysis (Art. 15)...",
      "Running XAI fidelity check (Art. 13)...",
      "Running risk scoring (Art. 9)...",
      "Running bias detection (Art. 10(5))...",
      "Compiling reports...",
    ];
    let msgIdx = 0;
    const ticker = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      setLoadingMsg(messages[msgIdx]);
    }, 1200);

    try {
      setLoadingMsg(messages[0]);
      const endpoints = [
        { key: "fria",          url: `${BASE_URL}/api/fria/assess` },
        { key: "cybersecurity", url: `${BASE_URL}/api/cybersecurity/assess` },
        { key: "xai",           url: `${BASE_URL}/api/xai/assess` },
        { key: "risk",          url: `${BASE_URL}/api/risk/assess` },
        { key: "bias",          url: `${BASE_URL}/api/bias/assess` },
      ];

      // Try each endpoint independently - with slash, without slash, both
      async function tryEndpoint(key: string, url: string): Promise<any> {
        const opts = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        };
        // Try with trailing slash
        const r1 = await fetch(url, opts);
        if (r1.ok) return r1.json();
        // Try without trailing slash
        const urlNoSlash = url.endsWith("/") ? url.slice(0, -1) : url + "/";
        const r2 = await fetch(urlNoSlash, opts);
        if (r2.ok) return r2.json();
        // Both failed - throw with detail from whichever gave more info
        const errText = await (r1.status === 404 ? r2 : r1).text().catch(() => "No response body");
        throw new Error(`${key}: ${r1.status} / ${r2.status} - ${errText}`);
      }

      const settled = await Promise.allSettled(
        endpoints.map(({ key, url }) => tryEndpoint(key, url))
      );

      const resultMap: Record<string, any> = {};
      const failed: string[] = [];
      settled.forEach((result, i) => {
        const key = endpoints[i].key;
        if (result.status === "fulfilled") {
          resultMap[key] = result.value;
        } else {
          failed.push(`${key}: ${result.reason?.message ?? "unknown error"}`);
          resultMap[key] = null; // graceful degradation
        }
      });

      clearInterval(ticker);

      // Only hard-fail if ALL 5 endpoints failed
      if (failed.length === 5) {
        throw new Error("All compliance modules failed to respond:\n" + failed.join("\n"));
      }

      setLoading(false);
      onComplete({
        fria:             resultMap.fria,
        cybersecurity:    resultMap.cybersecurity,
        xai:              resultMap.xai,
        risk:             resultMap.risk,
        bias:             resultMap.bias,
        systemName:       systemName,
        organisationName: payload.organisation_name,
        failedModules:    failed,
      });
    } catch (err: any) {
      clearInterval(ticker);
      setLoading(false);
      setError(err.message || "Assessment failed. Please check the system is running and try again.");
    }
  }

  function handleContinue() {
    if (currentStep < totalSteps) {
      setCurrentStep(s => s + 1);
    } else {
      runAssessment();
    }
  }

  function handlePrevious() {
    if (currentStep > 1) setCurrentStep(s => s - 1);
    else onBack();
  }

  function stepState(n: number): "completed" | "active" | "upcoming" {
    if (n < currentStep) return "completed";
    if (n === currentStep) return "active";
    return "upcoming";
  }

  const inputBase: React.CSSProperties = {
    fontFamily: FONT_SANS, fontWeight: 400, fontSize: "14px", color: TEXT,
    width: "100%", padding: "11px 0", border: "none",
    borderBottom: `1px solid ${SUBTLE}`, background: "transparent",
    outline: "none", lineHeight: 1.6, boxSizing: "border-box" as const,
    caretColor: accentColor, borderRadius: 0,
  };

  // ── LOADING SCREEN ──
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: NAVY, flexDirection: "column", gap: "28px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.25)",
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:.25;transform:scale(1)}50%{opacity:1;transform:scale(1.3)} }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginBottom: "12px" }}>ASSESSMENT IN PROGRESS</div>
          <div style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: "15px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{loadingMsg}</div>
        </div>
        <div style={{ display: "flex", gap: "3px", marginTop: "8px" }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} style={{ width: "40px", height: "2px", borderRadius: "1px", background: "rgba(255,255,255,0.2)" }} />
          ))}
        </div>
      </div>
    );
  }

  // ── ERROR SCREEN ──
  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: GREY, padding: "40px" }}>
        <div style={{ background: WHITE, maxWidth: "520px", width: "100%", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "4px", padding: "48px" }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.14em", color: "#B91C1C", marginBottom: "16px" }}>ASSESSMENT ERROR</div>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "22px", color: TEXT, marginBottom: "16px", lineHeight: 1.3 }}>Unable to complete assessment</h2>
          <p style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: "14px", color: MUTED, lineHeight: 1.7, marginBottom: "8px" }}>
            The compliance engine returned an error. This may be because the backend is starting up (Hugging Face Spaces sleep after inactivity). Please wait 30 seconds and try again.
          </p>
          <p style={{ fontFamily: FONT_MONO, fontSize: "11px", color: "#B91C1C", background: "rgba(185,28,28,0.05)", border: "1px solid rgba(185,28,28,0.15)", borderRadius: "3px", padding: "10px 12px", marginBottom: "28px", wordBreak: "break-word" as const, lineHeight: 1.6 }}>
            {error}
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={runAssessment} style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: "13px", color: WHITE, background: BLUE, border: "none", borderRadius: "4px", padding: "11px 24px", cursor: "pointer" }}>
              Try Again
            </button>
            <button onClick={() => setError(null)} style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: "13px", color: MUTED, background: "none", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "4px", padding: "11px 24px", cursor: "pointer" }}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: FONT_SANS }}>
      {/* ── SIDEBAR ── */}
      <aside style={{ width: "288px", minWidth: "288px", background: NAVY, display: "flex", flexDirection: "column", padding: "36px 28px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <button onClick={onBack} style={{ fontFamily: FONT_SANS, fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, marginBottom: "40px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px" }}>&#8592;</span> Back to overview
        </button>

        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: "9px", letterSpacing: "0.16em", color: "rgba(255,255,255,0.28)", marginBottom: "12px" }}>ASSESSMENT FORM</div>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "19px", color: WHITE, lineHeight: 1.35, margin: "0 0 6px" }}>EU AI Act Compliance</h2>
          <div style={{ fontFamily: FONT_MONO, fontSize: "10px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em" }}>Five steps to five reports</div>
        </div>

        <div style={{ flex: 1 }}>
          {STEPS.map((s, i) => {
            const state = stepState(s.number);
            const m = STEP_META[s.number];
            const isLast = i === STEPS.length - 1;
            return (
              <div key={s.number}>
                <div onClick={() => state === "completed" && setCurrentStep(s.number)} style={{ display: "flex", gap: "13px", alignItems: "flex-start", padding: "17px 0", cursor: state === "completed" ? "pointer" : "default", opacity: state === "upcoming" ? 0.3 : 1, transition: "opacity 0.15s" }}>
                  <div style={{ width: "23px", height: "23px", minWidth: "23px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", background: state === "active" ? WHITE : state === "completed" ? GREEN : "transparent", border: state === "upcoming" ? "1px solid rgba(255,255,255,0.2)" : "none", marginTop: "1px", flexShrink: 0 }}>
                    {state === "completed"
                      ? <span style={{ color: WHITE, fontSize: "11px", fontWeight: 700 }}>✓</span>
                      : <span style={{ fontFamily: FONT_MONO, fontSize: "10px", fontWeight: 600, color: state === "active" ? NAVY : "rgba(255,255,255,0.4)", lineHeight: 1 }}>{s.number}</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FONT_SANS, fontWeight: state === "active" ? 600 : 400, fontSize: "13px", color: state === "active" ? WHITE : "rgba(255,255,255,0.58)", lineHeight: 1.35, marginBottom: "4px" }}>{s.title}</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.04em", lineHeight: 1.5 }}>{m.description}</div>
                  </div>
                </div>
                {!isLast && <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginLeft: "36px" }} />}
              </div>
            );
          })}
        </div>

        <div style={{ paddingTop: "36px" }}>
          <p style={{ fontFamily: FONT_SANS, fontSize: "10px", fontWeight: 300, color: "rgba(255,255,255,0.18)", lineHeight: 1.7, margin: 0 }}>
            Your responses are sent to the EU AI Act Compliance Tool API when you click Generate Reports.
          </p>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, background: GREY, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "52px 52px 0" }}>
          <div style={{ background: WHITE, width: "100%", maxWidth: "680px", border: `1px solid ${SUBTLE}`, borderRadius: "4px", overflow: "hidden" }}>

            {/* CARD HEADER */}
            <div style={{ padding: "40px 48px 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {meta.dots.map(d => (
                    <div key={d.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: "10px", fontWeight: 500, color: d.color, letterSpacing: "0.08em" }}>{d.label}</span>
                    </div>
                  ))}
                  {meta.dots.length === 0 && <span style={{ fontFamily: FONT_MONO, fontSize: "10px", color: MUTED, letterSpacing: "0.08em" }}>SYSTEM PROFILE</span>}
                </div>
                <span style={{ fontFamily: FONT_SANS, fontSize: "12px", fontWeight: 500, color: MUTED }}>Step {currentStep} of {totalSteps}</span>
              </div>

              <div style={{ display: "flex", gap: "3px", marginBottom: "32px" }}>
                {STEPS.map(s => (
                  <div key={s.number} style={{ flex: 1, height: "3px", borderRadius: "1px", background: s.number < currentStep ? BLUE : s.number === currentStep ? accentColor : "#E5E7EB", transition: "background 0.3s" }} />
                ))}
              </div>

              <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "26px", color: TEXT, lineHeight: 1.25, margin: "0 0 8px", letterSpacing: "-0.01em" }}>{step.title}</h1>
              <p style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: "14px", color: MUTED, lineHeight: 1.6, margin: "0 0 32px" }}>{step.subtitle}</p>
            </div>

            <div style={{ height: "1px", background: SUBTLE }} />

            {/* FIELDS */}
            <div style={{ padding: "36px 48px 0" }}>
              {step.fields.map((field, fi) => (
                <div key={field.id} style={{ marginBottom: fi < step.fields.length - 1 ? "36px" : "44px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                    <span style={{ fontFamily: FONT_MONO, fontSize: "11px", fontWeight: 700, color: accentColor, letterSpacing: "0.06em", minWidth: "26px", paddingTop: "1px", lineHeight: 1.5, flexShrink: 0 }}>{field.id}</span>
                    <label style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: "13px", color: TEXT, flex: 1, lineHeight: 1.5 }}>{field.label}</label>
                    {field.help && (
                      <div style={{ position: "relative", flexShrink: 0, marginTop: "2px" }} onMouseEnter={() => setActiveTooltip(field.id)} onMouseLeave={() => setActiveTooltip(null)}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `1.5px solid ${activeTooltip === field.id ? accentColor : "#CBD5E1"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "help", background: activeTooltip === field.id ? `${accentColor}14` : "transparent", transition: "all 0.15s" }}>
                          <span style={{ fontFamily: FONT_SANS, fontSize: "10px", fontWeight: 700, color: activeTooltip === field.id ? accentColor : "#94A3B8", lineHeight: 1 }}>?</span>
                        </div>
                        {activeTooltip === field.id && (
                          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: "248px", background: "#1E293B", borderRadius: "6px", padding: "12px 14px", zIndex: 50 }}>
                            <p style={{ fontFamily: FONT_SANS, fontSize: "12px", color: "rgba(255,255,255,0.78)", lineHeight: 1.65, margin: 0 }}>{field.help}</p>
                            <div style={{ position: "absolute", top: "-5px", right: "7px", width: "10px", height: "10px", background: "#1E293B", transform: "rotate(45deg)", borderRadius: "2px" }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {field.type === "text" && (
                    <input type="text" value={answers[field.id] || ""} onChange={e => handleText(field.id, e.target.value)} placeholder={field.placeholder} style={inputBase}
                      onFocus={e => { e.target.style.borderBottomColor = accentColor; }}
                      onBlur={e => { e.target.style.borderBottomColor = SUBTLE; }} />
                  )}

                  {field.type === "select" && (
                    <div style={{ position: "relative" }}>
                      <select value={answers[field.id] || ""} onChange={e => handleText(field.id, e.target.value)}
                        style={{ ...inputBase, appearance: "none" as const, WebkitAppearance: "none" as const, paddingRight: "28px", cursor: "pointer", color: answers[field.id] ? TEXT : "#9CA3AF" }}
                        onFocus={e => { e.target.style.borderBottomColor = accentColor; }}
                        onBlur={e => { e.target.style.borderBottomColor = SUBTLE; }}>
                        <option value="" disabled>Select an option</option>
                        {field.options?.map(opt => <option key={opt} value={opt} style={{ color: TEXT }}>{opt}</option>)}
                      </select>
                      <span style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: MUTED, fontSize: "11px" }}>▾</span>
                    </div>
                  )}

                  {field.type === "toggle" && (
                    <div style={{ display: "inline-flex", background: "#F1F5F9", borderRadius: "8px", padding: "3px", gap: "2px", marginTop: "2px" }}>
                      {[{ label: "Yes", val: true }, { label: "No", val: false }].map(opt => {
                        const selected = toggleValues[field.id] === opt.val;
                        return (
                          <button key={opt.label} onClick={() => handleToggle(field.id, opt.val)}
                            style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: "13px", color: selected ? WHITE : MUTED, background: selected ? accentColor : "transparent", border: "none", borderRadius: "6px", padding: "8px 30px", cursor: "pointer", transition: "all 0.15s", outline: "none" }}>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CARD FOOTER */}
            <div style={{ background: GREY, borderTop: `1px solid ${SUBTLE}`, padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
              <button onClick={handlePrevious} style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: "13px", color: MUTED, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: 0, transition: "color 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = TEXT; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = MUTED; }}>
                <span style={{ fontSize: "14px" }}>&#8592;</span>
                {currentStep === 1 ? "Back to overview" : "Previous"}
              </button>
              <button onClick={handleContinue}
                style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: "13px", letterSpacing: "0.01em", color: WHITE, background: BLUE, border: "none", borderRadius: "4px", padding: "11px 30px", cursor: "pointer", transition: "opacity 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}>
                {currentStep === totalSteps ? "Generate Reports" : "Continue"}
              </button>
            </div>
          </div>
        </div>
        <div style={{ height: "52px" }} />
      </main>
    </div>
  );
}
