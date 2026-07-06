import { useState } from "react";

const NAVY = "#0A0E1A";
const WHITE = "#FFFFFF";
const GREY = "#F8F9FA";
const BLUE = "#1E40AF";
const RED = "#B91C1C";
const GREEN = "#047857";
const AMBER = "#B45309";
const PURPLE = "#6D28D9";

interface Props {
  results: {
    fria: any;
    cybersecurity: any;
    xai: any;
    bias: any;
    risk: any;
  };
  onBack: () => void;
}

const TABS = [
  { key: "fria",          label: "FRIA",           article: "Art. 27",    color: BLUE   },
  { key: "cybersecurity", label: "Cybersecurity",  article: "Art. 15",    color: RED    },
  { key: "xai",           label: "Explainability", article: "Art. 13",    color: GREEN  },
  { key: "risk",          label: "Risk Scoring",   article: "Art. 9",     color: AMBER  },
  { key: "bias",          label: "Bias Detection", article: "Art. 10(5)", color: PURPLE },
];

function RiskBadge({ level }: { level: string }) {
  const color = level === "HIGH" ? RED : level === "MEDIUM" ? AMBER : GREEN;
  const bg    = level === "HIGH" ? "#FEE2E2" : level === "MEDIUM" ? "#FEF3C7" : "#D1FAE5";
  return (
    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", fontWeight:600, color, background:bg, padding:"3px 10px", letterSpacing:"0.08em" }}>
      {level}
    </span>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"0.14em", color:"rgba(10,14,26,0.4)", marginBottom:"24px", marginTop:"40px", paddingBottom:"12px", borderBottom:"1px solid rgba(10,14,26,0.08)" }}>
      {text}
    </div>
  );
}

function FRIATab({ data }: { data: any }) {
  if (!data || data.error) return <div style={{ padding:"40px", color:RED }}>Error loading FRIA data</div>;
  const rights = data.rights_assessed || [];
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"32px" }}>
        <div>
          <h2 style={{ fontFamily:"'IBM Plex Serif',serif", fontWeight:400, fontSize:"28px", color:NAVY, marginBottom:"8px" }}>Fundamental Rights Impact Assessment</h2>
          <p style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"14px", color:"rgba(10,14,26,0.5)" }}>Article 27 — EU AI Act</p>
        </div>
        <div style={{ marginLeft:"auto" }}><RiskBadge level={data.overall_risk_level || "LOW"} /></div>
      </div>
      {data.knowledge_graph_traversal && (
        <div style={{ background:"#EEF2FF", padding:"16px 20px", marginBottom:"32px", borderLeft:`3px solid ${BLUE}` }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"0.1em", color:BLUE, marginBottom:"4px" }}>KNOWLEDGE GRAPH TRAVERSAL</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"rgba(10,14,26,0.6)", lineHeight:1.6 }}>{data.knowledge_graph_traversal.method}</div>
        </div>
      )}
      <SectionLabel text="RIGHTS ASSESSMENT" />
      {rights.map((right: any, i: number) => (
        <div key={i} style={{ borderLeft:`3px solid ${right.impact_level==="HIGH"?RED:right.impact_level==="MEDIUM"?AMBER:GREEN}`, padding:"24px 24px 24px 28px", marginBottom:"16px", border:`1px solid rgba(10,14,26,0.08)`, borderLeftWidth:"3px", borderLeftColor:right.impact_level==="HIGH"?RED:right.impact_level==="MEDIUM"?AMBER:GREEN }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
            <div style={{ fontFamily:"'IBM Plex Serif',serif", fontWeight:500, fontSize:"16px", color:NAVY }}>{right.right}</div>
            <RiskBadge level={right.impact_level} />
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"rgba(10,14,26,0.4)", marginBottom:"12px" }}>{right.article}</div>
          <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"14px", color:"rgba(10,14,26,0.6)", lineHeight:1.65, marginBottom:"12px" }}>{right.impact_justification}</div>
          <div style={{ background:GREY, padding:"12px 16px" }}>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"0.1em", color:"rgba(10,14,26,0.35)", marginBottom:"4px" }}>MITIGATION</div>
            <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"13px", color:"rgba(10,14,26,0.65)", lineHeight:1.6 }}>{right.mitigation}</div>
          </div>
        </div>
      ))}
      {data.recommendations && (
        <>
          <SectionLabel text="RECOMMENDATIONS" />
          {data.recommendations.map((rec: string, i: number) => (
            <div key={i} style={{ display:"flex", gap:"16px", marginBottom:"16px", alignItems:"flex-start" }}>
              <div style={{ width:"24px", height:"24px", minWidth:"24px", background:NAVY, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:WHITE, fontWeight:600 }}>{i+1}</span>
              </div>
              <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"14px", color:"rgba(10,14,26,0.7)", lineHeight:1.7 }}>{rec}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function CybersecurityTab({ data }: { data: any }) {
  if (!data || data.error) return <div style={{ padding:"40px", color:RED }}>Error loading Cybersecurity data</div>;
  const threats = data.threats_identified || [];
  const applicable = threats.filter((t: any) => t.applicable);
  const controls = data.controls_recommended || [];
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"32px" }}>
        <div>
          <h2 style={{ fontFamily:"'IBM Plex Serif',serif", fontWeight:400, fontSize:"28px", color:NAVY, marginBottom:"8px" }}>Cybersecurity Threat Model</h2>
          <p style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"14px", color:"rgba(10,14,26,0.5)" }}>Article 15 — EU AI Act</p>
        </div>
        <div style={{ marginLeft:"auto" }}><RiskBadge level={data.overall_security_risk || "LOW"} /></div>
      </div>
      {data.knowledge_graph_traversal && (
        <div style={{ background:"#FEF2F2", padding:"16px 20px", marginBottom:"32px", borderLeft:`3px solid ${RED}` }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"0.1em", color:RED, marginBottom:"4px" }}>KNOWLEDGE GRAPH TRAVERSAL</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"rgba(10,14,26,0.6)", lineHeight:1.6 }}>{data.knowledge_graph_traversal.method}</div>
        </div>
      )}
      <SectionLabel text={`THREATS IDENTIFIED (${applicable.length} APPLICABLE)`} />
      {threats.map((threat: any, i: number) => (
        <div key={i} style={{ padding:"20px 24px", marginBottom:"12px", border:`1px solid ${threat.applicable?"rgba(185,28,28,0.2)":"rgba(10,14,26,0.07)"}`, borderLeft:`3px solid ${threat.applicable?RED:"rgba(10,14,26,0.1)"}`, opacity:threat.applicable?1:0.5 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
            <div style={{ fontFamily:"'IBM Plex Serif',serif", fontWeight:500, fontSize:"15px", color:NAVY }}>{threat.threat_name}</div>
            <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
              {threat.graph_inferred && <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"9px", background:"#EEF2FF", color:BLUE, padding:"2px 8px", letterSpacing:"0.1em" }}>GRAPH-INFERRED</span>}
              <RiskBadge level={threat.severity} />
            </div>
          </div>
          <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"13px", color:"rgba(10,14,26,0.6)", lineHeight:1.6 }}>{threat.reason}</div>
        </div>
      ))}
      {controls.length > 0 && (
        <>
          <SectionLabel text="RECOMMENDED CONTROLS" />
          {controls.map((ctrl: any, i: number) => (
            <div key={i} style={{ padding:"16px 20px", marginBottom:"8px", background:GREY, border:"1px solid rgba(10,14,26,0.07)" }}>
              <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:600, fontSize:"14px", color:NAVY, marginBottom:"4px" }}>{ctrl.control}</div>
              <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"13px", color:"rgba(10,14,26,0.6)", lineHeight:1.6 }}>{ctrl.description}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function XAITab({ data }: { data: any }) {
  if (!data || data.error) return <div style={{ padding:"40px", color:RED }}>Error loading XAI data</div>;
  const features = data.top_features || [];
  const explanations = data.individual_decision_explanations || [];
  const maxImp = features[0]?.importance_score || 1;
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"32px" }}>
        <div>
          <h2 style={{ fontFamily:"'IBM Plex Serif',serif", fontWeight:400, fontSize:"28px", color:NAVY, marginBottom:"8px" }}>Explainability Report</h2>
          <p style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"14px", color:"rgba(10,14,26,0.5)" }}>Article 13 — EU AI Act | {data.method_used}</p>
        </div>
        <div style={{ marginLeft:"auto" }}>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", fontWeight:600, color:data.compliance_status?.status?.includes("NON")?RED:GREEN, background:data.compliance_status?.status?.includes("NON")?"#FEE2E2":"#D1FAE5", padding:"3px 10px" }}>
            {data.compliance_status?.status || "N/A"}
          </span>
        </div>
      </div>
      <SectionLabel text="TOP FEATURE IMPORTANCE" />
      {features.slice(0, 8).map((f: any, i: number) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"14px" }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"12px", color:"rgba(10,14,26,0.4)", width:"20px", textAlign:"right" }}>{i+1}</div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
              <span style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:500, fontSize:"13px", color:NAVY }}>{f.feature}</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"12px", color:GREEN }}>{f.importance_score}</span>
            </div>
            <div style={{ height:"4px", background:"rgba(10,14,26,0.08)", position:"relative" }}>
              <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${Math.min((f.importance_score/maxImp)*100, 100)}%`, background:GREEN }} />
            </div>
            <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"12px", color:"rgba(10,14,26,0.45)", marginTop:"4px" }}>{f.description}</div>
          </div>
        </div>
      ))}
      {explanations.length > 0 && (
        <>
          <SectionLabel text="INDIVIDUAL DECISION EXPLANATIONS (ARTICLE 13)" />
          {explanations.map((exp: any, i: number) => (
            <div key={i} style={{ marginBottom:"20px", border:"1px solid rgba(10,14,26,0.08)", padding:"24px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                <div style={{ fontFamily:"'IBM Plex Serif',serif", fontWeight:500, fontSize:"16px", color:NAVY }}>{exp.applicant_label}</div>
                <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"rgba(10,14,26,0.5)" }}>p={exp.risk_probability}</span>
                  <RiskBadge level={exp.predicted_outcome==="BAD CREDIT"?"HIGH":exp.predicted_outcome==="BORDERLINE"?"MEDIUM":"LOW"} />
                </div>
              </div>
              <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"14px", color:"rgba(10,14,26,0.65)", lineHeight:1.7, marginBottom:"12px", fontStyle:"italic" }}>{exp.plain_language_explanation}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:GREEN, letterSpacing:"0.08em" }}>{exp.article_13_note}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function RiskTab({ data }: { data: any }) {
  if (!data || data.error) return <div style={{ padding:"40px", color:RED }}>Error loading Risk data</div>;
  const factors = data.risk_factors || [];
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"32px" }}>
        <div>
          <h2 style={{ fontFamily:"'IBM Plex Serif',serif", fontWeight:400, fontSize:"28px", color:NAVY, marginBottom:"8px" }}>Risk Scoring Dashboard</h2>
          <p style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"14px", color:"rgba(10,14,26,0.5)" }}>Article 9 — EU AI Act | ISO 31000 Framework</p>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"36px", fontWeight:700, color:AMBER }}>{data.overall_risk_score}/10</div>
          <RiskBadge level={data.overall_risk_level || "LOW"} />
        </div>
      </div>
      <SectionLabel text="RISK FACTORS" />
      {factors.map((rf: any, i: number) => (
        <div key={i} style={{ padding:"20px 24px", marginBottom:"12px", border:"1px solid rgba(10,14,26,0.08)", borderLeft:`3px solid ${rf.actual_severity==="HIGH"?RED:rf.actual_severity==="MEDIUM"?AMBER:GREEN}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
            <div style={{ fontFamily:"'IBM Plex Serif',serif", fontWeight:500, fontSize:"15px", color:NAVY }}>{rf.risk_name}</div>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"20px", fontWeight:700, color:rf.actual_severity==="HIGH"?RED:rf.actual_severity==="MEDIUM"?AMBER:GREEN }}>{rf.score}/10</span>
          </div>
          <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"13px", color:"rgba(10,14,26,0.6)", lineHeight:1.6, marginBottom:"12px" }}>{rf.description}</div>
          {rf.mitigation_status === "REQUIRED" && (
            <div style={{ background:"#FEE2E2", padding:"12px 16px" }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:RED, letterSpacing:"0.1em", marginBottom:"4px" }}>ACTION REQUIRED</div>
              <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"13px", color:RED, lineHeight:1.6 }}>{rf.mitigation_action}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BiasTab({ data }: { data: any }) {
  if (!data || data.error) return <div style={{ padding:"40px", color:RED }}>Error loading Bias data</div>;
  const compliance = data.article_10_compliance || {};
  const ageMetrics = data.fairness_analysis?.age_based || {};
  const thresholds = data.threshold_profile || {};
  const metrics = ["statistical_parity_difference","disparate_impact_ratio","equal_opportunity_difference","average_odds_difference"];
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"32px" }}>
        <div>
          <h2 style={{ fontFamily:"'IBM Plex Serif',serif", fontWeight:400, fontSize:"28px", color:NAVY, marginBottom:"8px" }}>Bias Detection Report</h2>
          <p style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"14px", color:"rgba(10,14,26,0.5)" }}>Article 10(5) — EU AI Act | Toolkit: {data.toolkit}</p>
        </div>
        <div style={{ marginLeft:"auto" }}>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", fontWeight:600, color:compliance.bias_detected?RED:GREEN, background:compliance.bias_detected?"#FEE2E2":"#D1FAE5", padding:"3px 10px" }}>
            {compliance.status || "N/A"}
          </span>
        </div>
      </div>
      {thresholds.rationale && (
        <div style={{ background:"#F5F3FF", padding:"16px 20px", marginBottom:"32px", borderLeft:`3px solid ${PURPLE}` }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"0.1em", color:PURPLE, marginBottom:"4px" }}>ADAPTIVE THRESHOLDS</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"rgba(10,14,26,0.6)" }}>
            SPD: {thresholds.spd_threshold} | DI: {thresholds.di_lower}–{thresholds.di_upper}
          </div>
          <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"12px", color:"rgba(10,14,26,0.5)", marginTop:"4px" }}>{thresholds.rationale}</div>
        </div>
      )}
      {ageMetrics.success && (
        <>
          <SectionLabel text="AGE-BASED FAIRNESS METRICS (IBM AIF360)" />
          {metrics.map((metric) => {
            const m = ageMetrics[metric];
            if (!m) return null;
            const bad = m.bias_level==="HIGH" || (m.status && m.status.includes("VIOLATION"));
            return (
              <div key={metric} style={{ display:"flex", justifyContent:"space-between", padding:"16px 0", borderBottom:"1px solid rgba(10,14,26,0.07)" }}>
                <div>
                  <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:500, fontSize:"14px", color:NAVY, marginBottom:"4px", textTransform:"capitalize" }}>
                    {metric.replace(/_/g," ")}
                  </div>
                  <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"12px", color:"rgba(10,14,26,0.45)" }}>{m.threshold}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"22px", fontWeight:700, color:bad?RED:GREEN }}>{m.value ?? m.status}</div>
                  {m.bias_level && <RiskBadge level={m.bias_level} />}
                </div>
              </div>
            );
          })}
        </>
      )}
      {data.recommendations && (
        <>
          <SectionLabel text="RECOMMENDATIONS" />
          {data.recommendations.map((rec: string, i: number) => (
            <div key={i} style={{ display:"flex", gap:"16px", marginBottom:"12px" }}>
              <div style={{ width:"24px", height:"24px", minWidth:"24px", background:PURPLE, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:WHITE }}>{i+1}</span>
              </div>
              <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"14px", color:"rgba(10,14,26,0.7)", lineHeight:1.7 }}>{rec}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export function ResultsPage({ results, onBack }: Props) {
  const [activeTab, setActiveTab] = useState("fria");

  const getStatus = (key: string) => {
    const d = results[key as keyof typeof results];
    if (!d || d.error) return "ERROR";
    if (key==="fria")          return d.overall_risk_level || "LOW";
    if (key==="cybersecurity") return d.overall_security_risk || "LOW";
    if (key==="xai")           return d.compliance_status?.status?.includes("NON") ? "NON-COMPLIANT" : "COMPLIANT";
    if (key==="risk")          return d.overall_risk_level || "LOW";
    if (key==="bias")          return d.article_10_compliance?.bias_detected ? "BIAS DETECTED" : "PASS";
    return "N/A";
  };

  return (
    <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", minHeight:"100vh", background:GREY }}>
      <div style={{ background:NAVY, padding:"0 48px", height:"56px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={onBack} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", letterSpacing:"0.08em", color:"rgba(255,255,255,0.4)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px" }}>
          <span>&#8592;</span> BACK TO ASSESSMENT
        </button>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", color:"rgba(255,255,255,0.4)", letterSpacing:"0.08em" }}>
          {results.fria?.system_name || "Compliance Report"}
        </div>
      </div>

      <div style={{ background:WHITE, borderBottom:"1px solid rgba(10,14,26,0.08)", padding:"32px 48px" }}>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", letterSpacing:"0.14em", color:"rgba(10,14,26,0.4)", marginBottom:"20px", textAlign:"center" }}>COMPLIANCE STATUS MATRIX</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"1px", background:"rgba(10,14,26,0.08)", border:"1px solid rgba(10,14,26,0.08)" }}>
          {TABS.map((tab) => {
            const status = getStatus(tab.key);
            const bad = status.includes("HIGH") || status.includes("NON") || status.includes("BIAS") || status.includes("ERROR");
            const mid = status.includes("MEDIUM");
            return (
              <div key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ background:WHITE, padding:"20px 16px", textAlign:"center", cursor:"pointer", borderBottom:`3px solid ${tab.color}` }}>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", color:tab.color, letterSpacing:"0.08em", marginBottom:"4px" }}>{tab.article}</div>
                <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:"12px", color:"rgba(10,14,26,0.6)", marginBottom:"12px" }}>{tab.label}</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px", fontWeight:700, color:bad?RED:mid?AMBER:GREEN }}>{status}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background:WHITE, borderBottom:"1px solid rgba(10,14,26,0.08)", padding:"0 48px", display:"flex", position:"sticky", top:0, zIndex:50 }}>
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:activeTab===tab.key?600:400, fontSize:"13px", color:activeTab===tab.key?tab.color:"rgba(10,14,26,0.45)", background:"none", border:"none", borderBottom:activeTab===tab.key?`2px solid ${tab.color}`:"2px solid transparent", padding:"16px 24px", cursor:"pointer" }}>
            {tab.label}
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"10px", display:"block", letterSpacing:"0.06em", marginTop:"2px" }}>{tab.article}</span>
          </button>
        ))}
      </div>

      <div style={{ padding:"48px", maxWidth:"900px", margin:"0 auto" }}>
        {activeTab==="fria"          && <FRIATab data={results.fria} />}
        {activeTab==="cybersecurity" && <CybersecurityTab data={results.cybersecurity} />}
        {activeTab==="xai"           && <XAITab data={results.xai} />}
        {activeTab==="risk"          && <RiskTab data={results.risk} />}
        {activeTab==="bias"          && <BiasTab data={results.bias} />}
      </div>
    </div>
  );
}
