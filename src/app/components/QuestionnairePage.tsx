import { useState } from "react";

const NAVY = "#0A0E1A";
const WHITE = "#FFFFFF";
const GREY = "#F8F9FA";
const BLUE = "#1E40AF";
const GREEN = "#047857";

interface Step {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  fields: Field[];
}

interface Field {
  id: string;
  label: string;
  type: "text" | "textarea" | "toggle";
  placeholder?: string;
  help?: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: "System Identification",
    subtitle: "Basic identifying information about your AI system and its provider.",
    description: "System profile",
    fields: [
      {
        id: "1.1",
        label: "System name",
        type: "text",
        placeholder: "e.g. CreditScore Automated Decision Engine v2.3",
        help: "The official name under which the system is registered internally.",
      },
      {
        id: "1.2",
        label: "Provider organisation",
        type: "text",
        placeholder: "e.g. Nordea Financial Services AB",
        help: "Legal entity responsible for placing the system on the market.",
      },
      {
        id: "1.3",
        label: "Member State of deployment",
        type: "text",
        placeholder: "e.g. Sweden, Germany, France",
        help: "All EU Member States where the system is actively deployed.",
      },
      {
        id: "1.4",
        label: "Does the system make fully automated decisions without human review?",
        type: "toggle",
        help: "A decision is fully automated if no human reviews the output before it affects the subject.",
      },
    ],
  },
  {
    number: 2,
    title: "Data Processing",
    subtitle: "Data sources, categories, and handling practices used by the system.",
    description: "Data inputs",
    fields: [
      {
        id: "2.1",
        label: "Primary data sources",
        type: "text",
        placeholder: "e.g. Credit bureau records, bank transaction history",
        help: "List all data sources the system ingests at inference time.",
      },
      {
        id: "2.2",
        label: "Personal data categories processed",
        type: "textarea",
        placeholder: "e.g. Financial history, employment status, residential address, age",
        help: "Include all categories as defined under GDPR Article 4(1).",
      },
      {
        id: "2.3",
        label: "Does the system process special category data under GDPR Article 9?",
        type: "toggle",
        help: "Special categories include health, ethnicity, religion, biometric, and genetic data.",
      },
      {
        id: "2.4",
        label: "Training data retention period",
        type: "text",
        placeholder: "e.g. 36 months from collection date",
        help: "The period for which training datasets are retained in accordance with your data policy.",
      },
    ],
  },
  {
    number: 3,
    title: "Risk Management",
    subtitle: "Known risks, mitigation measures, and incident reporting capabilities.",
    description: "Risk profile",
    fields: [
      {
        id: "3.1",
        label: "Known foreseeable risks",
        type: "textarea",
        placeholder: "e.g. Model drift causing score degradation, adversarial data inputs, feedback loops",
        help: "List all risks identified during system design and post-deployment monitoring.",
      },
      {
        id: "3.2",
        label: "Primary risk mitigation measures",
        type: "textarea",
        placeholder: "e.g. Quarterly model revalidation, anomaly detection pipeline, human escalation threshold",
        help: "Describe technical and organisational controls currently in place.",
      },
      {
        id: "3.3",
        label: "Has a formal risk assessment been conducted in the last 12 months?",
        type: "toggle",
        help: "Includes internal audits, third-party assessments, or regulatory reviews.",
      },
      {
        id: "3.4",
        label: "Incident reporting mechanism",
        type: "text",
        placeholder: "e.g. Internal JIRA board, escalation to DPO within 72 hours",
        help: "Describe how serious incidents are logged and reported internally.",
      },
    ],
  },
  {
    number: 4,
    title: "Transparency",
    subtitle: "Explanation methods, disclosure obligations, and documentation standards.",
    description: "Explainability",
    fields: [
      {
        id: "4.1",
        label: "Output explanation method",
        type: "text",
        placeholder: "e.g. SHAP feature importance values, decision tree approximation",
        help: "The technical method used to generate explanations for individual decisions.",
      },
      {
        id: "4.2",
        label: "Subject notification mechanism",
        type: "textarea",
        placeholder: "e.g. Automated email with score category and key contributing factors within 24 hours",
        help: "How affected individuals are informed of decisions and their right to explanation.",
      },
      {
        id: "4.3",
        label: "Is the AI nature of the system disclosed to subjects prior to assessment?",
        type: "toggle",
        help: "Disclosure must occur before the system processes the individual's data.",
      },
      {
        id: "4.4",
        label: "Technical documentation reference",
        type: "text",
        placeholder: "e.g. Internal doc ID TDR-2024-0047 or URL",
        help: "Reference to the technical documentation required under Article 11.",
      },
    ],
  },
  {
    number: 5,
    title: "Rights Impact",
    subtitle: "Assessment of fundamental rights implications for affected individuals.",
    description: "FRIA scope",
    fields: [
      {
        id: "5.1",
        label: "Rights categories at risk",
        type: "textarea",
        placeholder: "e.g. Right to non-discrimination, right to explanation, right to human review",
        help: "Reference the EU Charter of Fundamental Rights articles where applicable.",
      },
      {
        id: "5.2",
        label: "Vulnerable or protected groups potentially affected",
        type: "text",
        placeholder: "e.g. Individuals with disabilities, minority ethnic groups, low-income households",
        help: "Identify any groups who may face disproportionate impact from system outputs.",
      },
      {
        id: "5.3",
        label: "Has a Fundamental Rights Impact Assessment been previously conducted?",
        type: "toggle",
        help: "Includes assessments conducted under DPIA, ESG frameworks, or internal compliance programmes.",
      },
      {
        id: "5.4",
        label: "Responsible person or team for rights oversight",
        type: "text",
        placeholder: "e.g. Chief Compliance Officer, Ethics Review Board",
        help: "The named individual or body accountable for ongoing rights monitoring.",
      },
    ],
  },
];

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

export function QuestionnairePage({ onBack, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [toggleValues, setToggleValues] = useState<Record<string, boolean | null>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const step = STEPS[currentStep - 1];
  const totalSteps = STEPS.length;

  function handleTextChange(fieldId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleToggle(fieldId: string, value: boolean) {
    setToggleValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleContinue() {
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
    } else {
      onComplete();
    }
  }

  function handlePrevious() {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    } else {
      onBack();
    }
  }

  function getStepState(stepNum: number): "completed" | "active" | "upcoming" {
    if (stepNum < currentStep) return "completed";
    if (stepNum === currentStep) return "active";
    return "upcoming";
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: "320px",
          minWidth: "320px",
          background: NAVY,
          display: "flex",
          flexDirection: "column",
          padding: "48px 36px",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Back link */}
        <button
          onClick={onBack}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.35)",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            padding: 0,
            marginBottom: "48px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "14px" }}>&#8592;</span>
          BACK TO OVERVIEW
        </button>

        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "16px",
            }}
          >
            ASSESSMENT FORM
          </div>
          <h2
            style={{
              fontFamily: "'IBM Plex Serif', serif",
              fontWeight: 400,
              fontSize: "22px",
              color: WHITE,
              lineHeight: 1.35,
              marginBottom: "8px",
            }}
          >
            EU AI Act Compliance
          </h2>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.04em",
            }}
          >
            Five steps to five reports
          </div>
        </div>

        {/* Step list */}
        <div style={{ flex: 1 }}>
          {STEPS.map((s, i) => {
            const state = getStepState(s.number);
            const isLast = i === STEPS.length - 1;

            return (
              <div key={s.number}>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                    padding: "20px 0",
                    cursor: state === "completed" ? "pointer" : "default",
                    opacity: state === "upcoming" ? 0.35 : 1,
                    transition: "opacity 0.15s",
                  }}
                  onClick={() => state === "completed" && setCurrentStep(s.number)}
                >
                  {/* Step indicator */}
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      minWidth: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        state === "active"
                          ? WHITE
                          : state === "completed"
                          ? GREEN
                          : "transparent",
                      border:
                        state === "upcoming"
                          ? "1px solid rgba(255,255,255,0.3)"
                          : "none",
                      marginTop: "2px",
                    }}
                  >
                    {state === "completed" ? (
                      <span
                        style={{
                          color: WHITE,
                          fontSize: "12px",
                          lineHeight: 1,
                          fontWeight: 500,
                        }}
                      >
                        ✓
                      </span>
                    ) : (
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: "11px",
                          fontWeight: 500,
                          color: state === "active" ? NAVY : "rgba(255,255,255,0.5)",
                          lineHeight: 1,
                        }}
                      >
                        {s.number}
                      </span>
                    )}
                  </div>

                  {/* Step text */}
                  <div>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontWeight: state === "active" ? 600 : 400,
                        fontSize: "14px",
                        color: state === "active" ? WHITE : "rgba(255,255,255,0.65)",
                        marginBottom: "4px",
                        lineHeight: 1.4,
                      }}
                    >
                      {s.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.3)",
                        letterSpacing: "0.04em",
                        lineHeight: 1.5,
                      }}
                    >
                      {s.description}
                    </div>
                  </div>
                </div>

                {!isLast && (
                  <div
                    style={{
                      height: "1px",
                      background: "rgba(255,255,255,0.07)",
                      marginLeft: "40px",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Privacy note */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "48px",
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              color: "rgba(255,255,255,0.22)",
              lineHeight: 1.75,
              letterSpacing: "0.03em",
            }}
          >
            Session data is stored locally in your browser only. Nothing is transmitted to external servers until you choose to export your report.
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          background: GREY,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "64px 64px 0",
          }}
        >
          {/* Card */}
          <div
            style={{
              background: WHITE,
              width: "100%",
              maxWidth: "720px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Card header */}
            <div style={{ padding: "48px 56px 0" }}>
              {/* Step tag */}
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  color: BLUE,
                  marginBottom: "16px",
                }}
              >
                STEP {currentStep} OF {totalSteps}
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: "2px",
                  background: "rgba(10,14,26,0.08)",
                  marginBottom: "40px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                    background: BLUE,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              {/* Step heading */}
              <h1
                style={{
                  fontFamily: "'IBM Plex Serif', serif",
                  fontWeight: 400,
                  fontSize: "32px",
                  color: NAVY,
                  lineHeight: 1.25,
                  marginBottom: "12px",
                  letterSpacing: "-0.01em",
                }}
              >
                {step.title}
              </h1>
              <p
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontWeight: 300,
                  fontSize: "15px",
                  color: "rgba(10,14,26,0.5)",
                  lineHeight: 1.65,
                  marginBottom: "0",
                }}
              >
                {step.subtitle}
              </p>
            </div>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: "rgba(10,14,26,0.08)",
                margin: "40px 0 0",
              }}
            />

            {/* Form fields */}
            <div style={{ padding: "48px 56px 0" }}>
              {step.fields.map((field, fi) => (
                <div
                  key={field.id}
                  style={{
                    marginBottom: fi < step.fields.length - 1 ? "48px" : "56px",
                  }}
                >
                  {/* Field header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "rgba(10,14,26,0.5)",
                        letterSpacing: "0.06em",
                        minWidth: "24px",
                      }}
                    >
                      {field.id}
                    </span>
                    <label
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: "14px",
                        color: NAVY,
                        flex: 1,
                        lineHeight: 1.4,
                      }}
                    >
                      {field.label}
                    </label>
                    {field.help && (
                      <div
                        style={{ position: "relative", flexShrink: 0 }}
                        onMouseEnter={() => setActiveTooltip(field.id)}
                        onMouseLeave={() => setActiveTooltip(null)}
                      >
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            border: "1px solid rgba(10,14,26,0.2)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "help",
                            background: activeTooltip === field.id ? "rgba(10,14,26,0.05)" : "transparent",
                            transition: "background 0.1s",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'IBM Plex Sans', sans-serif",
                              fontSize: "10px",
                              color: "rgba(10,14,26,0.4)",
                              lineHeight: 1,
                            }}
                          >
                            ?
                          </span>
                        </div>
                        {activeTooltip === field.id && (
                          <div
                            style={{
                              position: "absolute",
                              top: "calc(100% + 10px)",
                              right: 0,
                              width: "280px",
                              background: NAVY,
                              padding: "14px 16px",
                              zIndex: 50,
                            }}
                          >
                            <div
                              style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: "11px",
                                color: "rgba(255,255,255,0.7)",
                                lineHeight: 1.65,
                                letterSpacing: "0.02em",
                              }}
                            >
                              {field.help}
                            </div>
                            {/* Arrow */}
                            <div
                              style={{
                                position: "absolute",
                                top: "-6px",
                                right: "6px",
                                width: "10px",
                                height: "10px",
                                background: NAVY,
                                transform: "rotate(45deg)",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Field input */}
                  {field.type === "text" && (
                    <input
                      type="text"
                      value={(answers[field.id] as string) || ""}
                      onChange={(e) => handleTextChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontWeight: 400,
                        fontSize: "15px",
                        color: NAVY,
                        width: "100%",
                        padding: "12px 0",
                        border: "none",
                        borderBottom: "1px solid rgba(10,14,26,0.18)",
                        borderRadius: 0,
                        background: "transparent",
                        outline: "none",
                        lineHeight: 1.5,
                        boxSizing: "border-box",
                        caretColor: NAVY,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderBottomColor = NAVY;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderBottomColor = "rgba(10,14,26,0.18)";
                      }}
                    />
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      value={(answers[field.id] as string) || ""}
                      onChange={(e) => handleTextChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontWeight: 400,
                        fontSize: "15px",
                        color: NAVY,
                        width: "100%",
                        padding: "12px 0",
                        border: "none",
                        borderBottom: "1px solid rgba(10,14,26,0.18)",
                        borderRadius: 0,
                        background: "transparent",
                        outline: "none",
                        lineHeight: 1.65,
                        boxSizing: "border-box",
                        resize: "none",
                        caretColor: NAVY,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderBottomColor = NAVY;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderBottomColor = "rgba(10,14,26,0.18)";
                      }}
                    />
                  )}

                  {field.type === "toggle" && (
                    <div
                      style={{
                        display: "flex",
                        gap: "0",
                        marginTop: "4px",
                      }}
                    >
                      {[
                        { label: "Yes", value: true },
                        { label: "No", value: false },
                      ].map((option) => {
                        const selected = toggleValues[field.id] === option.value;
                        return (
                          <button
                            key={String(option.value)}
                            onClick={() => handleToggle(field.id, option.value)}
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: "12px",
                              letterSpacing: "0.08em",
                              color: selected ? WHITE : "rgba(10,14,26,0.5)",
                              background: selected ? NAVY : "transparent",
                              border: `1px solid ${selected ? NAVY : "rgba(10,14,26,0.2)"}`,
                              borderRadius: 0,
                              padding: "10px 32px",
                              cursor: "pointer",
                              transition: "all 0.15s",
                              outline: "none",
                            }}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* Card footer */}
            <div
              style={{
                background: GREY,
                borderTop: "1px solid rgba(10,14,26,0.08)",
                padding: "24px 56px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "8px",
              }}
            >
              <button
                onClick={handlePrevious}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  color: "rgba(10,14,26,0.45)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: 0,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = NAVY;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(10,14,26,0.45)";
                }}
              >
                <span style={{ fontSize: "14px" }}>&#8592;</span>
                {currentStep === 1 ? "BACK TO OVERVIEW" : "PREVIOUS"}
              </button>

              <button
                onClick={handleContinue}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  color: WHITE,
                  background: NAVY,
                  border: "none",
                  borderRadius: 0,
                  padding: "14px 36px",
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                }}
              >
                {currentStep === totalSteps ? "GENERATE REPORTS" : "CONTINUE"}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div style={{ height: "64px" }} />
      </main>
    </div>
  );
}
