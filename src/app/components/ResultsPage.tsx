import { useState } from "react";
import type { ApiResults } from "./App";

const NAVY   = "#0F1420";
const WHITE  = "#FFFFFF";
const GREY   = "#F8F9FA";
const BLUE   = "#1E40AF";
const TEXT   = "#111827";
const MUTED  = "#6B7280";
const SUBTLE = "rgba(0,0,0,0.07)";
const HAIR   = "rgba(0,0,0,0.09)";

const FONT_SERIF = "Georgia, 'Times New Roman', serif";
const FONT_SANS  = "'Inter', system-ui, sans-serif";
const FONT_MONO  = "'IBM Plex Mono', monospace";

const ARTICLE_COLOR: Record<string, string> = {
  "Art. 9":     "#B45309",
  "Art. 10(5)": "#6D28D9",
  "Art. 13":    "#047857",
  "Art. 15":    "#B91C1C",
  "Art. 27":    "#1E40AF",
};

type Sev = "HIGH" | "MEDIUM" | "LOW";
const SEV: Record<Sev, { color: string; bg: string; label: string }> = {
  HIGH:   { color: "#DC2626", bg: "rgba(220,38,38,0.07)",   label: "High" },
  MEDIUM: { color: "#D97706", bg: "rgba(217,119,6,0.07)",   label: "Medium" },
  LOW:    { color: "#059669", bg: "rgba(5,150,105,0.07)",   label: "Low" },
};

interface Finding {
  id: string;
  name: string;
  status: Sev;
  description: string;
  citation: string;
  mitigation: string;
}
interface Report {
  tab: number;
  article: string;
  name: string;
  description: string;
  status: Sev;
  findings: Finding[];
  recommendations: { n: number; text: string }[];
}

// ── Safe coerce to Sev ──
function toSev(s: string | undefined): Sev {
  const v = (s || "").toUpperCase();
  if (v === "HIGH" || v === "MEDIUM" || v === "LOW") return v as Sev;
  return "MEDIUM";
}

// ── Transform API data into Reports ──
function buildReports(results: ApiResults): Report[] {
  const { fria, cybersecurity, xai, risk, bias } = results;

  // ── Art. 9: Risk ──
  // API fields: overall_risk_level, overall_risk_score, risk_factors[].risk_name/actual_severity/description/score/mitigation_action
  const riskLevel = toSev(risk?.overall_risk_level);
  const riskFindings: Finding[] = [];

  if (Array.isArray(risk?.risk_factors)) {
    risk.risk_factors.forEach((f: any, i: number) => {
      const sev = toSev(f.actual_severity ?? f.severity ?? f.level);
      riskFindings.push({
        id:          `R-9.${i + 1}`,
        name:        f.risk_name ?? f.factor ?? f.name ?? `Risk Factor ${i + 1}`,
        status:      sev,
        description: f.description ?? f.detail ?? "Risk factor identified.",
        citation:    `Article 9, EU Regulation 2024/1689`,
        mitigation:  f.mitigation_action ?? f.mitigation ?? "Implement risk management controls and document remediation steps.",
      });
    });
  }
  if (riskFindings.length === 0) {
    const score = risk?.overall_risk_score ?? risk?.risk_score ?? 0;
    riskFindings.push({
      id: "R-9.1", name: "Risk Score Assessment", status: riskLevel,
      description: `Overall risk score: ${score}/10 (${riskLevel}).`,
      citation: "Article 9(1), EU Regulation 2024/1689",
      mitigation: "Review flagged risk factors and implement proportionate mitigation measures.",
    });
  }
  const riskRecs = Array.isArray(risk?.recommendations)
    ? risk.recommendations.map((r: string, i: number) => ({ n: i + 1, text: r }))
    : [
        { n: 1, text: "Address all HIGH severity risks before deployment under Article 9" },
        { n: 2, text: "Assign a named responsible person for each outstanding mitigation action with a completion deadline" },
        { n: 3, text: "Document the risk management system formally including all identified risks and mitigations" },
        { n: 4, text: "Establish a schedule for regular risk re-assessment at least annually" },
        { n: 5, text: "Report risk management activities to the relevant national market surveillance authority as required" },
      ];

  // ── Art. 10(5): Bias ──
  // API fields: article_10_compliance.bias_detected, threshold_profile.spd_threshold, fairness_analysis.age_based
  const biasDetected = bias?.article_10_compliance?.bias_detected ?? bias?.bias_detected ?? false;
  const spdThreshold = bias?.threshold_profile?.spd_threshold ?? bias?.spd_threshold ?? 0.04;
  const biasSev: Sev = biasDetected ? "HIGH" : "LOW";
  const biasFindings: Finding[] = [];

  const ageMetrics   = bias?.fairness_analysis?.age_based ?? {};
  const statusMetrics = bias?.fairness_analysis?.personal_status_based ?? {};

  [[ageMetrics, "Age-based"], [statusMetrics, "Personal Status-based"]].forEach(([m, label]: any) => {
    if (!m || Object.keys(m).length === 0) return;
    const spd = m.statistical_parity_difference ?? m.demographic_parity_difference ?? {};
    const di  = m.disparate_impact_ratio ?? {};
    const sev = toSev(spd.bias_level ?? (Math.abs(spd.value ?? 0) > spdThreshold ? "HIGH" : "LOW"));
    biasFindings.push({
      id:          `B-10.${biasFindings.length + 1}`,
      name:        `${label} Disparity (SPD: ${typeof spd.value === "number" ? spd.value.toFixed(4) : "N/A"})`,
      status:      sev,
      description: `Statistical Parity Difference: ${typeof spd.value === "number" ? spd.value.toFixed(4) : "N/A"} | Disparate Impact: ${typeof di.value === "number" ? di.value.toFixed(4) : "N/A"}. Threshold applied: ${spdThreshold}. ${di.status ?? ""}`,
      citation:    "Article 10(5), EU Regulation 2024/1689 – Training data bias examination.",
      mitigation:  biasDetected ? "Apply re-weighting or re-sampling to training data for affected demographic groups." : "Continue monitoring. No immediate action required.",
    });
  });

  if (biasFindings.length === 0) {
    biasFindings.push({
      id: "B-10.1", name: "Bias Detection Result", status: biasSev,
      description: `Bias ${biasDetected ? "detected" : "not detected"} at SPD threshold ${spdThreshold}. ${biasDetected ? "Remediation is required before deployment." : "System is within acceptable fairness thresholds."}`,
      citation: "Article 10(5), EU Regulation 2024/1689 – Training data bias examination.",
      mitigation: biasDetected ? "Engage a certified fairness auditor and implement data re-balancing techniques." : "Maintain monitoring and re-evaluate at each model retraining cycle.",
    });
  }

  const biasStatus = bias?.article_10_compliance?.status ?? (biasDetected ? "BIAS DETECTED" : "NO SIGNIFICANT BIAS DETECTED");
  const biasRecs = Array.isArray(bias?.recommendations)
    ? bias.recommendations.map((r: string, i: number) => ({ n: i + 1, text: r }))
    : [
        { n: 1, text: `Current SPD threshold is ${spdThreshold}. ${biasDetected ? "Remediate identified bias before proceeding to deployment." : "Continue monitoring fairness metrics at each retraining cycle."}` },
        { n: 2, text: "Extend bias testing to cover all protected characteristics under EU Directives 2000/43/EC and 2000/78/EC." },
        { n: 3, text: "Document bias testing methodology and results in the technical file as required by Article 11." },
      ];

  // ── Art. 13: XAI ──
  // API fields: compliance_status.status, method_used, explainability_method, top_features
  const xaiStatusStr  = xai?.compliance_status?.status ?? xai?.compliance_status ?? "UNKNOWN";
  const xaiCompliant  = xaiStatusStr === "COMPLIANT";
  const xaiSev: Sev   = xaiCompliant ? "LOW" : "HIGH";
  const xaiMethod     = xai?.method_used ?? xai?.explainability_method ?? xai?.explanation_method ?? "unknown method";
  const xaiFindings: Finding[] = [];

  xaiFindings.push({
    id: "X-13.1", name: "Explanation Method Assessment", status: xaiSev,
    description: `System uses ${xaiMethod}. Status: ${xaiStatusStr}.${!xaiCompliant ? " The declared explanation method does not meet Article 13 requirements." : " Explanation method meets transparency obligations."}`,
    citation: "Article 13(1), EU Regulation 2024/1689 – Transparency and provision of information to deployers.",
    mitigation: xaiCompliant ? "Maintain explanation documentation. Ensure individual-level explanations are available." : "Implement a suitable XAI method (SHAP or LIME recommended). Document explanation outputs in the technical file.",
  });

  const topFeatures = xai?.top_features ?? [];
  if (Array.isArray(topFeatures) && topFeatures.length > 0) {
    const top = topFeatures[0];
    xaiFindings.push({
      id: "X-13.2", name: "Feature Importance Coverage", status: xaiCompliant ? "LOW" : "MEDIUM",
      description: `Top predictive feature: ${top.feature ?? top.name ?? "Unknown"} (importance: ${typeof top.importance === "number" ? top.importance.toFixed(4) : "N/A"}). ${topFeatures.length} features analysed.`,
      citation: "Article 13(3)(b), EU Regulation 2024/1689 – Performance characteristics and known limitations.",
      mitigation: "Provide feature importance documentation to deployers and enable individual decision explanations.",
    });
  }

  const xaiRecs = Array.isArray(xai?.recommendations)
    ? xai.recommendations.map((r: string, i: number) => ({ n: i + 1, text: r }))
    : [
        { n: 1, text: xaiCompliant ? "Maintain current explanation methodology and document it in the technical file." : "Implement SHAP or LIME explanations to meet Article 13 transparency requirements before deployment." },
        { n: 2, text: "Ensure individual-level explanations (not just aggregate feature importance) are available for every credit decision." },
        { n: 3, text: "Establish a process for affected individuals to request and receive explanations within a reasonable timeframe." },
      ];

  // ── Art. 15: Cybersecurity ──
  // API fields: overall_security_risk, threats_identified[].threat_name/severity/description/applicable/graph_inferred, knowledge_graph_traversal.graph_inferred_threats
  const cyberSev = toSev(cybersecurity?.overall_security_risk);
  const cyberFindings: Finding[] = [];
  const graphInferredList = cybersecurity?.knowledge_graph_traversal?.graph_inferred_threats ?? [];
  const graphInferredCount = Array.isArray(graphInferredList) ? graphInferredList.length : (cybersecurity?.graph_inferred_threats ?? 0);

  const allThreats = cybersecurity?.threats_identified ?? cybersecurity?.threats ?? [];
  const applicableThreats = Array.isArray(allThreats) ? allThreats.filter((t: any) => t.applicable !== false) : [];

  if (applicableThreats.length > 0) {
    applicableThreats.slice(0, 6).forEach((t: any, i: number) => {
      cyberFindings.push({
        id:          `C-15.${i + 1}`,
        name:        t.threat_name ?? t.name ?? `Threat ${i + 1}`,
        status:      toSev(t.severity),
        description: t.description ?? `${t.threat_name ?? "Threat"} identified.${t.graph_inferred ? " (graph-inferred from system profile)" : ""}`,
        citation:    `Article 15, EU Regulation 2024/1689 – Cybersecurity and robustness. MITRE ATLAS: ${t.governed_by ?? t.threat_id ?? "AML.T"}`,
        mitigation:  t.mitigation ?? t.control ?? "Implement appropriate technical controls and document security posture.",
      });
    });
  }

  if (cyberFindings.length === 0) {
    const cnt = cybersecurity?.applicable_threat_count ?? cybersecurity?.applicable_threats ?? 0;
    cyberFindings.push({
      id: "C-15.1", name: "Threat Coverage Assessment", status: cyberSev,
      description: `${cnt} of 8 MITRE ATLAS threat categories applicable. ${graphInferredCount} threats identified through knowledge graph inference. Overall security risk: ${cyberSev}.`,
      citation: "Article 15(1), EU Regulation 2024/1689 – Appropriate cybersecurity level.",
      mitigation: "Address identified threats with the recommended security controls before deployment.",
    });
  }

  const cyberRecs = Array.isArray(cybersecurity?.recommendations)
    ? cybersecurity.recommendations.map((r: string, i: number) => ({ n: i + 1, text: r }))
    : [
        { n: 1, text: `${graphInferredCount} threats were identified through structural inference from system configuration. Review and address each before deployment.` },
        { n: 2, text: "Implement all recommended security controls and document them in the technical file." },
        { n: 3, text: "Conduct an annual independent security audit as required by Article 15. Next scheduled: within 12 months of deployment." },
      ];

  // ── Art. 27: FRIA ──
  // API fields: overall_risk_level, rights_assessed[].right/article/impact_level/impact_justification/mitigation
  const friaLevel = toSev(fria?.overall_risk_level ?? fria?.overall_fria_level);
  const friaFindings: Finding[] = [];
  const rights = fria?.rights_assessed ?? fria?.fundamental_rights ?? [];

  if (Array.isArray(rights) && rights.length > 0) {
    rights.forEach((r: any, i: number) => {
      friaFindings.push({
        id:          `F-27.${i + 1}`,
        name:        r.right ?? r.right_name ?? `Fundamental Right ${i + 1}`,
        status:      toSev(r.impact_level ?? r.level),
        description: r.impact_justification ?? r.reason ?? r.assessment ?? r.description ?? `Impact level: ${r.impact_level ?? "assessed"}.`,
        citation:    r.article ?? `Article 27(1)(c), EU Regulation 2024/1689`,
        mitigation:  r.mitigation ?? r.measure ?? "Implement appropriate safeguards and document in the FRIA.",
      });
    });
  }

  if (friaFindings.length === 0) {
    friaFindings.push({
      id: "F-27.1", name: "Rights Impact Summary", status: friaLevel,
      description: `${fria?.knowledge_graph_traversal?.rights_traversed ?? 7} fundamental rights assessed. Overall FRIA level: ${friaLevel}.`,
      citation: "Article 27(1), EU Regulation 2024/1689 – Fundamental Rights Impact Assessment requirements.",
      mitigation: "Document the full FRIA and register it in the EU database before deployment as required by Article 27(4).",
    });
  }

  const friaRecs = Array.isArray(fria?.recommendations)
    ? fria.recommendations.map((r: string, i: number) => ({ n: i + 1, text: r }))
    : [
        { n: 1, text: "Complete the FRIA documentation and register it in the EU database before deployment as required by Article 27(4)." },
        { n: 2, text: "Involve relevant stakeholders and representatives of affected persons in the FRIA process as required by Article 27(2)." },
        { n: 3, text: "Make a non-confidential summary of the FRIA publicly available after registration as required by Article 27(9)." },
      ];

  return [
    { tab: 1, article: "Art. 9",     name: "Risk Management System",               description: "Evaluation of continuous risk identification, analysis, and mitigation across the AI system lifecycle.", status: riskLevel,  findings: riskFindings,  recommendations: riskRecs },
    { tab: 2, article: "Art. 10(5)", name: "Bias and Fairness Assessment",          description: "Statistical evaluation of training data and model outputs for discriminatory patterns affecting protected characteristics.", status: biasSev,   findings: biasFindings,  recommendations: biasRecs },
    { tab: 3, article: "Art. 13",    name: "Transparency and Explainability",       description: "Assessment of explanation quality, individual decision transparency, and disclosure obligations to affected individuals.", status: xaiSev,    findings: xaiFindings,   recommendations: xaiRecs },
    { tab: 4, article: "Art. 15",    name: "Cybersecurity and Robustness",          description: "Resilience evaluation against adversarial inputs, data poisoning, model extraction, and other MITRE ATLAS threat categories.", status: cyberSev,  findings: cyberFindings, recommendations: cyberRecs },
    { tab: 5, article: "Art. 27",    name: "Fundamental Rights Impact Assessment",  description: "Structured evaluation of material impacts on autonomy, dignity, equality, and individual rights guaranteed under the EU Charter.", status: friaLevel, findings: friaFindings,  recommendations: friaRecs },
  ];
}


// ── SevChip ──
function SevChip({ status }: { status: Sev }) {
  const s = SEV[status];
  return (
    <span style={{ fontFamily: FONT_MONO, fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", color: s.color, background: s.bg, padding: "3px 8px", borderRadius: "3px" }}>
      {status}
    </span>
  );
}

// ── FindingCard ──
function FindingCard({ finding, defaultOpen }: { finding: Finding; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const s = SEV[finding.status];
  return (
    <div style={{ borderBottom: `1px solid ${SUBTLE}` }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: "14px", padding: "20px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" as const }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: "10px", fontWeight: 600, color: MUTED, minWidth: "42px", paddingTop: "1px", lineHeight: 1.5 }}>{finding.id}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: "14px", color: TEXT, flex: 1, lineHeight: 1.4 }}>{finding.name}</span>
            <SevChip status={finding.status} />
          </div>
        </div>
        <span style={{ color: MUTED, fontSize: "11px", marginTop: "2px", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0, paddingTop: "2px" }}>▾</span>
      </button>

      {open && (
        <div style={{ paddingLeft: "56px", paddingBottom: "24px" }}>
          <p style={{ fontFamily: FONT_SANS, fontWeight: 400, fontSize: "14px", color: TEXT, lineHeight: 1.7, marginBottom: "16px" }}>{finding.description}</p>
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: "9px", letterSpacing: "0.12em", color: MUTED, marginBottom: "6px" }}>CITATION</div>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: "13px", color: MUTED, lineHeight: 1.65, padding: "10px 12px", borderLeft: `2px solid ${s.color}`, background: s.bg, borderRadius: "0 3px 3px 0" }}>{finding.citation}</p>
          </div>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: "9px", letterSpacing: "0.12em", color: MUTED, marginBottom: "6px" }}>MITIGATION</div>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 400, fontSize: "13px", color: TEXT, lineHeight: 1.7 }}>{finding.mitigation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Props ──
interface Props {
  apiResults: ApiResults | null;
  onBack:   () => void;
  onHome:   () => void;
}

export function ResultsPage({ apiResults, onBack, onHome }: Props) {
  const [activeTab,  setActiveTab]  = useState(1);
  const [exportOpen, setExportOpen] = useState(false);

  // ── Empty state ──
  if (!apiResults) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: GREY }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.14em", color: MUTED, marginBottom: "16px" }}>NO RESULTS</div>
          <p style={{ fontFamily: FONT_SANS, fontSize: "14px", color: MUTED, marginBottom: "24px" }}>No assessment data available. Please complete the questionnaire first.</p>
          <button onClick={onHome} style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: "13px", color: WHITE, background: BLUE, border: "none", borderRadius: "4px", padding: "11px 24px", cursor: "pointer" }}>Return Home</button>
        </div>
      </div>
    );
  }

  const REPORTS = buildReports(apiResults);
  const report  = REPORTS[activeTab - 1];
  const articleColor = ARTICLE_COLOR[report.article] ?? BLUE;
  const counts  = { HIGH: 0, MEDIUM: 0, LOW: 0 } as Record<Sev, number>;
  REPORTS.forEach(r => { counts[r.status]++; });

  function handleExport(format: string) {
    const dataStr  = JSON.stringify(apiResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url      = URL.createObjectURL(dataBlob);
    const link     = document.createElement("a");
    link.href      = url;
    link.download  = `${apiResults.systemName}_compliance_report.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: GREY, fontFamily: FONT_SANS }} onClick={() => setExportOpen(false)}>

      {/* ── TOP BAR ── */}
      <div style={{ background: NAVY, padding: "0 48px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1240px", margin: "0 auto", height: "48px" }}>
          <button onClick={onHome} style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", padding: 0 }}>
            <span style={{ fontSize: "12px" }}>&#8592;</span> EU AI ACT COMPLIANCE
          </button>
          <div style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)" }}>
            {apiResults.systemName} · {apiResults.organisationName}
          </div>
        </div>
      </div>

      {/* ── HERO HEADER ── */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${HAIR}` }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "40px 48px 36px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" as const }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: "9px", letterSpacing: "0.16em", color: MUTED }}>COMPLIANCE ASSESSMENT</div>
            </div>
            <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "clamp(22px, 3vw, 32px)", color: TEXT, margin: "0 0 8px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
              {apiResults.systemName}
            </h1>
            <div style={{ fontFamily: FONT_SANS, fontWeight: 300, fontSize: "14px", color: MUTED }}>{apiResults.organisationName}</div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "36px", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: "28px" }}>
              {(["HIGH", "MEDIUM", "LOW"] as Sev[]).map(sv => (
                <div key={sv} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: FONT_SERIF, fontSize: "30px", color: SEV[sv].color, lineHeight: 1 }}>{counts[sv]}</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: "9px", letterSpacing: "0.1em", color: MUTED, marginTop: "8px" }}>{sv}</div>
                </div>
              ))}
            </div>

            <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setExportOpen(o => !o)} style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: "13px", color: WHITE, background: BLUE, border: "none", borderRadius: "4px", padding: "11px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                Export Report
                <span style={{ fontSize: "10px", opacity: 0.75, transform: exportOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s", display: "inline-block" }}>▾</span>
              </button>
              {exportOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: WHITE, border: `1px solid ${SUBTLE}`, borderRadius: "4px", minWidth: "230px", zIndex: 100, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                  {["Export all sections (JSON)"].map(label => (
                    <button key={label} onClick={() => handleExport("json")}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", fontFamily: FONT_SANS, fontWeight: 400, fontSize: "13px", color: TEXT, background: "none", border: "none", padding: "12px 16px", cursor: "pointer", textAlign: "left" as const }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = GREY; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}>
                      <span style={{ fontFamily: FONT_MONO, fontSize: "11px", color: BLUE }}>↓</span>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── FAILED MODULES BANNER ── */}
      {apiResults.failedModules && apiResults.failedModules.length > 0 && (
        <div style={{ background: "rgba(217,119,6,0.08)", borderBottom: "1px solid rgba(217,119,6,0.2)", padding: "10px 48px" }}>
          <div style={{ maxWidth: "1240px", margin: "0 auto", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: "9px", letterSpacing: "0.12em", color: "#D97706" }}>PARTIAL RESULTS</span>
            <span style={{ fontFamily: FONT_SANS, fontSize: "12px", color: "#92400E" }}>
              {apiResults.failedModules.length} module{apiResults.failedModules.length > 1 ? "s" : ""} could not be reached. Results shown are from available modules only.
            </span>
          </div>
        </div>
      )}

      {/* ── TWO-COLUMN BODY ── */}
      <div style={{ display: "flex", alignItems: "flex-start", maxWidth: "1240px", margin: "0 auto" }}>

        {/* LEFT RAIL */}
        <nav style={{ width: "300px", flexShrink: 0, padding: "36px 0 36px 48px", position: "sticky", top: "48px", alignSelf: "flex-start" }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.14em", color: MUTED, padding: "0 0 14px 4px" }}>SECTIONS</div>
          <div>
            {REPORTS.map(r => {
              const artColor = ARTICLE_COLOR[r.article] ?? BLUE;
              const sev      = SEV[r.status];
              const isActive = activeTab === r.tab;
              return (
                <button key={r.tab} onClick={() => setActiveTab(r.tab)} style={{ width: "100%", textAlign: "left", cursor: "pointer", background: isActive ? WHITE : "transparent", border: "none", borderLeft: `2px solid ${isActive ? artColor : "transparent"}`, borderRadius: isActive ? "0 4px 4px 0" : 0, padding: "14px 16px", display: "block", transition: "background 0.15s" }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.02)"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontFamily: FONT_MONO, fontSize: "10px", fontWeight: 500, letterSpacing: "0.06em", color: artColor }}>{r.article}</span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: "9px", fontWeight: 500, letterSpacing: "0.08em", color: sev.color }}>{r.status}</span>
                  </div>
                  <div style={{ fontFamily: FONT_SANS, fontWeight: isActive ? 600 : 400, fontSize: "13.5px", color: isActive ? TEXT : MUTED, lineHeight: 1.4 }}>{r.name}</div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* RIGHT PANE */}
        <main style={{ flex: 1, minWidth: 0, background: WHITE, borderLeft: `1px solid ${SUBTLE}`, minHeight: "calc(100vh - 48px)", padding: "44px 56px 64px" }}>

          <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: `1px solid ${HAIR}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.1em", color: articleColor }}>{report.article}</span>
              <span style={{ color: "rgba(0,0,0,0.18)", fontSize: "10px" }}>·</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.1em", color: MUTED }}>SECTION {report.tab} OF {REPORTS.length}</span>
              <SevChip status={report.status} />
            </div>
            <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: "28px", color: TEXT, lineHeight: 1.2, margin: "0 0 12px", letterSpacing: "-0.01em" }}>{report.name}</h2>
            <p style={{ fontFamily: FONT_SANS, fontWeight: 400, fontSize: "14px", color: MUTED, lineHeight: 1.7, margin: 0, maxWidth: "620px" }}>{report.description}</p>
          </div>

          <div style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.14em", color: MUTED, marginBottom: "4px" }}>FINDINGS</div>
          <div style={{ borderTop: `1px solid ${SUBTLE}`, marginBottom: "44px" }}>
            {report.findings.map((f, i) => <FindingCard key={f.id} finding={f} defaultOpen={i === 0} />)}
          </div>

          <div style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.14em", color: MUTED, marginBottom: "18px" }}>SECTION RECOMMENDATIONS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "640px" }}>
            {report.recommendations.map(rec => (
              <div key={rec.n} style={{ display: "flex", gap: "14px", alignItems: "baseline" }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: "12px", fontWeight: 600, color: BLUE, flexShrink: 0, width: "18px" }}>{String(rec.n).padStart(2, "0")}</span>
                <p style={{ fontFamily: FONT_SANS, fontWeight: 400, fontSize: "14px", color: TEXT, lineHeight: 1.7, margin: 0 }}>{rec.text}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "48px", paddingTop: "22px", borderTop: `1px solid ${SUBTLE}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={onHome} style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: "13px", color: MUTED, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", padding: 0 }}>
              <span style={{ fontSize: "14px" }}>&#8592;</span> Back to overview
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setActiveTab(t => Math.max(1, t - 1))} disabled={activeTab === 1}
                style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: "13px", color: activeTab === 1 ? "rgba(0,0,0,0.2)" : TEXT, background: "none", border: `1px solid ${SUBTLE}`, borderRadius: "4px", padding: "8px 14px", cursor: activeTab === 1 ? "default" : "pointer" }}>
                ← Previous
              </button>
              <button onClick={() => setActiveTab(t => Math.min(REPORTS.length, t + 1))} disabled={activeTab === REPORTS.length}
                style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: "13px", color: activeTab === REPORTS.length ? "rgba(0,0,0,0.2)" : TEXT, background: "none", border: `1px solid ${SUBTLE}`, borderRadius: "4px", padding: "8px 14px", cursor: activeTab === REPORTS.length ? "default" : "pointer" }}>
                Next →
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
