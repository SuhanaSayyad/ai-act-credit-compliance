import { useState } from "react";

const API_BASE = "https://suhanasayyad-ai-act-compliance-backend.hf.space";

const NAVY  = "#0A0E1A";
const WHITE = "#FFFFFF";
const GREY  = "#F8F9FA";
const BLUE  = "#1E40AF";
const GREEN = "#047857";

interface Field {
  id: string;
  label: string;
  type: "text" | "textarea" | "toggle" | "select";
  placeholder?: string;
  help?: string;
  options?: string[];
}

interface Step {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  fields: Field[];
}

const STEPS: Step[] = [
  {
    number: 1,
    title: "System Identification",
    subtitle: "Basic identifying information about your AI system.",
    description: "System profile",
    fields: [
      { id: "1.1", label: "System name", type: "text", placeholder: "e.g. CreditScore Engine v2.3", help: "The official name of the AI system." },
      { id: "1.2", label: "Provider organisation", type: "text", placeholder: "e.g. Nordea Financial Services AB", help: "Legal entity responsible for the system." },
      { id: "1.3", label: "Model type", type: "select", options: ["Logistic Regression", "Gradient Boosted Trees", "Random Forest", "XGBoost", "Neural Network", "Other"], help: "The ML architecture used in the credit scoring system." },
      { id: "1.4", label: "Does the system make fully automated decisions without human review?", type: "toggle", help: "A decision is fully automated if no human reviews the output before it affects the subject." },
      { id: "1.5", label: "Is human oversight available to review decisions?", type: "toggle", help: "Can a human reviewer examine and override the system's decisions?" },
    ],
  },
  {
    number: 2,
    title: "Data Processing",
    subtitle: "Data sources, categories, and handling practices.",
    description: "Data inputs",
    fields: [
      { id: "2.1", label: "Primary data sources", type: "text", placeholder: "e.g. Credit bureau records, bank transaction history", help: "All data sources the system ingests at inference time." },
      { id: "2.2", label: "Data retention period", type: "text", placeholder: "e.g. 36 months from collection date", help: "Period for which training datasets are retained." },
      { id: "2.3", label: "Does the system process special category data under GDPR Article 9?", type: "toggle", help: "Special categories include health, ethnicity, religion, biometric, and genetic data." },
      { id: "2.4", label: "Does the system share data with third parties?", type: "toggle", help: "Includes data processors, analytics providers, or partner organisations." },
    ],
  },
  {
    number: 3,
    title: "Risk and Security",
    subtitle: "Known risks, security controls, and audit capabilities.",
    description: "Risk profile",
    fields: [
      { id: "3.1", label: "Has a formal security audit been conducted in the last 12 months?", type: "toggle", help: "Includes internal audits, third-party assessments, or regulatory reviews." },
      { id: "3.2", label: "Does the system expose an external API?", type: "toggle", help: "Any interface accessible outside the internal network that accepts model queries." },
      { id: "3.3", label: "Are access controls implemented on the model and API?", type: "toggle", help: "Authentication, rate limiting, and role-based access controls." },
      { id: "3.4", label: "Is audit logging enabled for all model decisions?", type: "toggle", help: "Tamper-evident logs of all predictions and data access events." },
      { id: "3.5", label: "Are there any known bias issues with this system?", type: "toggle", help: "Documented bias against any protected group or demographic." },
    ],
  },
  {
    number: 4,
    title: "Transparency",
    subtitle: "Explanation methods and disclosure obligations.",
    description: "Explainability",
    fields: [
      { id: "4.1", label: "Output explanation method", type: "text", placeholder: "e.g. SHAP feature importance values", help: "The technical method used to generate explanations for individual decisions." },
      { id: "4.2", label: "Subject notification mechanism", type: "textarea", placeholder: "e.g. Automated email with score category and key contributing factors", help: "How affected individuals are informed of decisions." },
      { id: "4.3", label: "Is the AI nature of the system disclosed to subjects before assessment?", type: "toggle", help: "Disclosure must occur before the system processes the individual's data." },
    ],
  },
  {
    number: 5,
    title: "Rights Impact",
    subtitle: "Assessment of fundamental rights implications.",
    description: "FRIA scope",
    fields: [
      { id: "5.1", label: "Vulnerable or protected groups potentially affected", type: "text", placeholder: "e.g. Minority ethnic groups, low-income households, elderly applicants", help: "Groups who may face disproportionate impact from system outputs." },
      { id: "5.2", label: "Has a Fundamental Rights Impact Assessment been previously conducted?", type: "toggle", help: "Includes assessments conducted under DPIA, ESG frameworks, or internal compliance programmes." },
      { id: "5.3", label: "Responsible person or team for rights oversight", type: "text", placeholder: "e.g. Chief Compliance Officer, Ethics Review Board", help: "Named individual or body accountable for ongoing rights monitoring." },
    ],
  },
];

interface Props {
  onBack: () => void;
  onComplete: (results: any) => void;
}

export function QuestionnairePage({ onBack, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [toggleValues, setToggleValues] = useState<Record<string, boolean | null>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[currentStep - 1];
  const totalSteps = STEPS.length;

  function handleTextChange(fieldId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleToggle(fieldId: string, value: boolean) {
    setToggleValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function getStepState(stepNum: number): "completed" | "active" | "upcoming" {
    if (stepNum < currentStep) return "completed";
    if (stepNum === currentStep) return "active";
    return "upcoming";
  }

  function buildPayload() {
    const systemName = answers["1.1"] || "Unnamed System";
    const orgName = answers["1.2"] || "Unknown Organisation";
    const modelType = answers["1.3"] || "Gradient Boosted Trees";
    const automatedDecision = toggleValues["1.4"] !== false;
    const humanOversight = toggleValues["1.5"] !== false;
    const dataSources = answers["2.1"] || "";
    const retentionPeriod = answers["2.2"] || "";
    const specialCategoryData = toggleValues["2.3"] === true;
    const thirdPartySharing = toggleValues["2.4"] === true;
    const previouslyAudited = toggleValues["3.1"] === true;
    const externalApi = toggleValues["3.2"] === true;
    const accessControls = toggleValues["3.3"] === true;
    const auditLogging = toggleValues["3.4"] === true;
    const knownBias = toggleValues["3.5"] === true;
    const explainabilityMethod = answers["4.1"] || null;
    const aiDisclosed = toggleValues["4.3"] !== false;
    const affectedPopulation = answers["5.1"] || "";
    const friaAudited = toggleValues["5.2"] === true;
    const responsiblePerson = answers["5.3"] || "";

    return {
      system_name: systemName,
      organisation_name: orgName,
      intended_purpose: `Credit scoring and financial risk assessment by ${orgName}`,
      uses_personal_data: true,
      uses_special_category_data: specialCategoryData,
      data_sources: dataSources,
      data_retention_period: retentionPeriod,
      model_type: modelType,
      automated_decision_making: automatedDecision,
      human_oversight_available: humanOversight,
      explainability_method: explainabilityMethod,
      deployment_sector: "Banking and Financial Services",
      affected_population: affectedPopulation || "Personal loan applicants",
      estimated_users_per_year: 10000,
      external_api_access: externalApi,
      third_party_data_sharing: thirdPartySharing,
      audit_logging_enabled: auditLogging,
      access_controls_implemented: accessControls,
      previously_audited: previouslyAudited || friaAudited,
      known_bias_issues: knownBias,
      model_version: "1.0.0",
    };
  }

  async function generateReports() {
    setLoading(true);
    setError(null);

    const payload = buildPayload();

    try {
      const [friaRes, cyberRes, xaiRes, biasRes, riskRes] = await Promise.all([
        fetch(`${API_BASE}/api/fria/assess`,          { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) }),
        fetch(`${API_BASE}/api/cybersecurity/assess`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) }),
        fetch(`${API_BASE}/api/xai/assess`,           { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) }),
        fetch(`${API_BASE}/api/bias/assess`,          { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) }),
        fetch(`${API_BASE}/api/risk/assess`,          { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) }),
      ]);

      const [fria, cybersecurity, xai, bias, risk] = await Promise.all([
        friaRes.json(),
        cyberRes.json(),
        xaiRes.json(),
        biasRes.json(),
        riskRes.json(),
      ]);

      onComplete({ fria, cybersecurity, xai, bias, risk });
    } catch (err: any) {
      setError("Could not connect to backend. Make sure uvicorn is running on http://127.0.0.1:8000");
    } finally {
      setLoading(false);
    }
  }

  async function handleContinue() {
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
    } else {
      await generateReports();
    }
  }

  function handlePrevious() {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    } else {
      onBack();
    }
  }

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'IBM Plex Sans',sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{ width:"320px", minWidth:"320px", background:NAVY, display:"flex", flexDirection:"column", padding:"48px 36px", position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>
        <button onClick={onBack} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", letterSpacing:"0.08em", color:"rgba(255,255,255,0.35)", background:"none", border:"none", cursor:"pointer", textAlign:"left", padding:0, marginBottom:"48px", display:"flex", alignItems:"center", gap:"8px" }}>
          <span style={{ fontSize:"14px" }}>&#8592;</span> BACK TO OVERVIEW
        </button>
        <div style={{ marginBottom:"48px" }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"0.14em", color:"rgba(255,255,255,0.35)", marginBottom:"16px" }}>ASSESSMENT FORM</div>
          <h2 style={{ fontFamily:"'IBM Plex Serif',serif", fontWeight:400, fontSize:"22px", color:WHITE, lineHeight:1.35, marginBottom:"8px" }}>EU AI Act Compliance</h2>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"rgba(255,255,255,0.35)", letterSpacing:"0.04em" }}>Five steps to five reports</div>
        </div>
        <div style={{ flex:1 }}>
          {STEPS.map((s, i) => {
            const state = getStepState(s.number);
            return (
              <div key={s.number}>
                <div style={{ display:"flex", gap:"16px", alignItems:"flex-start", padding:"20px 0", cursor:state==="completed"?"pointer":"default", opacity:state==="upcoming"?0.35:1 }}
                  onClick={() => state==="completed" && setCurrentStep(s.number)}>
                  <div style={{ width:"24px", height:"24px", minWidth:"24px", display:"flex", alignItems:"center", justifyContent:"center", background:state==="active"?WHITE:state==="completed"?GREEN:"transparent", border:state==="upcoming"?"1px solid rgba(255,255,255,0.3)":"none", marginTop:"2px" }}>
                    {state==="completed"
                      ? <span style={{ color:WHITE, fontSize:"12px", fontWeight:500 }}>✓</span>
                      : <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", fontWeight:500, color:state==="active"?NAVY:"rgba(255,255,255,0.5)" }}>{s.number}</span>
                    }
                  </div>
                  <div>
                    <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:state==="active"?600:400, fontSize:"14px", color:state==="active"?WHITE:"rgba(255,255,255,0.65)", marginBottom:"4px" }}>{s.title}</div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"rgba(255,255,255,0.3)", letterSpacing:"0.04em" }}>{s.description}</div>
                  </div>
                </div>
                {i < STEPS.length-1 && <div style={{ height:"1px", background:"rgba(255,255,255,0.07)", marginLeft:"40px" }} />}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop:"auto", paddingTop:"48px" }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:"rgba(255,255,255,0.22)", lineHeight:1.75, letterSpacing:"0.03em" }}>
            Data is processed locally. Nothing is stored after the session ends.
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex:1, background:GREY, display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <div style={{ flex:1, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"64px 64px 0" }}>
          <div style={{ background:WHITE, width:"100%", maxWidth:"720px", display:"flex", flexDirection:"column" }}>
            {/* Card header */}
            <div style={{ padding:"48px 56px 0" }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", letterSpacing:"0.12em", color:BLUE, marginBottom:"16px" }}>
                STEP {currentStep} OF {totalSteps}
              </div>
              <div style={{ height:"2px", background:"rgba(10,14,26,0.08)", marginBottom:"40px", position:"relative" }}>
                <div style={{ position:"absolute", top:0, left:0, height:"100%", width:`${((currentStep-1)/(totalSteps-1))*100}%`, background:BLUE, transition:"width 0.3s ease" }} />
              </div>
              <h1 style={{ fontFamily:"'IBM Plex Serif',serif", fontWeight:400, fontSize:"32px", color:NAVY, lineHeight:1.25, marginBottom:"12px", letterSpacing:"-0.01em" }}>{step.title}</h1>
              <p style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:300, fontSize:"15px", color:"rgba(10,14,26,0.5)", lineHeight:1.65 }}>{step.subtitle}</p>
            </div>
            <div style={{ height:"1px", background:"rgba(10,14,26,0.08)", margin:"40px 0 0" }} />

            {/* Form fields */}
            <div style={{ padding:"48px 56px 0" }}>
              {step.fields.map((field, fi) => (
                <div key={field.id} style={{ marginBottom:fi<step.fields.length-1?"48px":"56px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"12px" }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", fontWeight:700, color:"rgba(10,14,26,0.5)", letterSpacing:"0.06em", minWidth:"24px" }}>{field.id}</span>
                    <label style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:600, fontSize:"14px", color:NAVY, flex:1, lineHeight:1.4 }}>{field.label}</label>
                    {field.help && (
                      <div style={{ position:"relative", flexShrink:0 }} onMouseEnter={() => setActiveTooltip(field.id)} onMouseLeave={() => setActiveTooltip(null)}>
                        <div style={{ width:"18px", height:"18px", border:"1px solid rgba(10,14,26,0.2)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", cursor:"help" }}>
                          <span style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"10px", color:"rgba(10,14,26,0.4)" }}>?</span>
                        </div>
                        {activeTooltip === field.id && (
                          <div style={{ position:"absolute", top:"calc(100% + 10px)", right:0, width:"280px", background:NAVY, padding:"14px 16px", zIndex:50 }}>
                            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"rgba(255,255,255,0.7)", lineHeight:1.65, letterSpacing:"0.02em" }}>{field.help}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {field.type === "text" && (
                    <input type="text" value={answers[field.id] || ""} onChange={(e) => handleTextChange(field.id, e.target.value)} placeholder={field.placeholder}
                      style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"15px", color:NAVY, width:"100%", padding:"12px 0", border:"none", borderBottom:"1px solid rgba(10,14,26,0.18)", borderRadius:0, background:"transparent", outline:"none", boxSizing:"border-box" }}
                      onFocus={(e) => { e.target.style.borderBottomColor = NAVY; }}
                      onBlur={(e) => { e.target.style.borderBottomColor = "rgba(10,14,26,0.18)"; }}
                    />
                  )}

                  {field.type === "textarea" && (
                    <textarea value={answers[field.id] || ""} onChange={(e) => handleTextChange(field.id, e.target.value)} placeholder={field.placeholder} rows={3}
                      style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"15px", color:NAVY, width:"100%", padding:"12px 0", border:"none", borderBottom:"1px solid rgba(10,14,26,0.18)", borderRadius:0, background:"transparent", outline:"none", boxSizing:"border-box", resize:"none" }}
                      onFocus={(e) => { e.target.style.borderBottomColor = NAVY; }}
                      onBlur={(e) => { e.target.style.borderBottomColor = "rgba(10,14,26,0.18)"; }}
                    />
                  )}

                  {field.type === "select" && (
                    <select value={answers[field.id] || ""} onChange={(e) => handleTextChange(field.id, e.target.value)}
                      style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"15px", color:answers[field.id]?NAVY:"rgba(10,14,26,0.4)", width:"100%", padding:"12px 0", border:"none", borderBottom:"1px solid rgba(10,14,26,0.18)", borderRadius:0, background:"transparent", outline:"none", cursor:"pointer", appearance:"none" }}>
                      <option value="" disabled>Select model type...</option>
                      {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}

                  {field.type === "toggle" && (
                    <div style={{ display:"flex", gap:"0", marginTop:"4px" }}>
                      {[{ label:"Yes", value:true }, { label:"No", value:false }].map((option) => {
                        const selected = toggleValues[field.id] === option.value;
                        return (
                          <button key={String(option.value)} onClick={() => handleToggle(field.id, option.value)}
                            style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"12px", letterSpacing:"0.08em", color:selected?WHITE:"rgba(10,14,26,0.5)", background:selected?NAVY:"transparent", border:`1px solid ${selected?NAVY:"rgba(10,14,26,0.2)"}`, borderRadius:0, padding:"10px 32px", cursor:"pointer", transition:"all 0.15s", outline:"none" }}>
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={{ margin:"0 56px", padding:"16px 20px", background:"#FEE2E2", borderLeft:"3px solid #B91C1C" }}>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"12px", color:"#B91C1C", lineHeight:1.6 }}>{error}</div>
              </div>
            )}

            {/* Card footer */}
            <div style={{ background:GREY, borderTop:"1px solid rgba(10,14,26,0.08)", padding:"24px 56px", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"8px" }}>
              <button onClick={handlePrevious} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"12px", letterSpacing:"0.08em", color:"rgba(10,14,26,0.45)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", padding:0 }}>
                <span style={{ fontSize:"14px" }}>&#8592;</span>
                {currentStep === 1 ? "BACK TO OVERVIEW" : "PREVIOUS"}
              </button>
              <button onClick={handleContinue} disabled={loading}
                style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"12px", letterSpacing:"0.1em", color:WHITE, background:loading?"rgba(10,14,26,0.4)":NAVY, border:"none", borderRadius:0, padding:"14px 36px", cursor:loading?"not-allowed":"pointer", minWidth:"200px", textAlign:"center" }}>
                {loading ? "GENERATING REPORTS..." : currentStep === totalSteps ? "GENERATE REPORTS" : "CONTINUE"}
              </button>
            </div>
          </div>
        </div>
        <div style={{ height:"64px" }} />
      </main>
    </div>
  );
}
