import requests, json, time, statistics, os

BASE = "https://suhanasayyad-ai-act-compliance-backend.hf.space"

BASELINE = {
    "system_name": "CreditScore Basic",
    "organisation_name": "Test Bank Ireland",
    "intended_purpose": "Automated credit scoring for personal loan applications",
    "uses_personal_data": True,
    "uses_special_category_data": False,
    "data_sources": "Credit bureau data only",
    "data_retention_period": "3 years",
    "model_type": "Logistic Regression",
    "automated_decision_making": True,
    "human_oversight_available": True,
    "explainability_method": "SHAP",
    "deployment_sector": "Banking and Financial Services",
    "affected_population": "Personal loan applicants",
    "estimated_users_per_year": 10000,
    "external_api_access": False,
    "third_party_data_sharing": False,
    "audit_logging_enabled": True,
    "access_controls_implemented": True,
    "previously_audited": True,
    "known_bias_issues": False,
    "model_version": "1.0.0",
    "model_api_endpoint": ""
}

def vary(base, **kwargs):
    p = dict(base)
    p.update(kwargs)
    return p

SCENARIOS = [
    ("S00", "Baseline (low risk, all controls)", BASELINE),
    ("S01", "Add known bias issues",
     vary(BASELINE, known_bias_issues=True)),
    ("S02", "Remove explainability method",
     vary(BASELINE, explainability_method=None)),
    ("S03", "Remove human oversight",
     vary(BASELINE, human_oversight_available=False)),
    ("S04", "Add special category data",
     vary(BASELINE, uses_special_category_data=True)),
    ("S05", "Add external API exposure",
     vary(BASELINE, external_api_access=True)),
    ("S06", "Remove access controls",
     vary(BASELINE, access_controls_implemented=False)),
    ("S07", "Remove audit logging",
     vary(BASELINE, audit_logging_enabled=False)),
    ("S08", "Known bias AND special category data",
     vary(BASELINE, known_bias_issues=True, uses_special_category_data=True)),
    ("S09", "Change model to Neural Network",
     vary(BASELINE, model_type="Neural Network")),
    ("S10", "Change model to Random Forest",
     vary(BASELINE, model_type="Random Forest")),
    ("S11", "Change model to XGBoost",
     vary(BASELINE, model_type="XGBoost")),
    ("S12", "Add third party data sharing",
     vary(BASELINE, third_party_data_sharing=True)),
    ("S13", "Remove prior security audit",
     vary(BASELINE, previously_audited=False)),
    ("S14", "All flags HIGH (worst case)",
     vary(BASELINE,
          model_type="Neural Network",
          human_oversight_available=False,
          uses_special_category_data=True,
          third_party_data_sharing=True,
          previously_audited=False,
          external_api_access=True,
          access_controls_implemented=False,
          audit_logging_enabled=False,
          known_bias_issues=True,
          explainability_method=None)),
]

def call(ep, payload):
    try:
        start = time.perf_counter()
        r = requests.post(f"{BASE}{ep}", json=payload, timeout=120)
        t = time.perf_counter() - start
        if r.status_code == 200:
            d = r.json()
            if "error" not in d:
                return d, t
            print(f"    API error: {str(d.get('error','?'))[:60]}")
        else:
            print(f"    HTTP {r.status_code}: {r.text[:60]}")
        return None, t
    except Exception as e:
        print(f"    Exception: {e}")
        return None, 0

results = []
print("EU AI Act Compliance Tool - Sensitivity Analysis")
print("=" * 65)

for code, label, payload in SCENARIOS:
    print(f"\n{code}: {label}")

    fria_d, ft  = call("/api/fria/assess",         payload)
    cyber_d, ct = call("/api/cybersecurity/assess", payload)
    xai_d, xt   = call("/api/xai/assess",           payload)
    risk_d, rt  = call("/api/risk/assess",          payload)
    bias_d, bt  = call("/api/bias/assess",          payload)

    row = {"code": code, "label": label}

    if fria_d:
        rights = fria_d.get("rights_assessed", [])
        row["fria_level"]  = fria_d.get("overall_risk_level", "?")
        row["fria_high"]   = sum(1 for r in rights if r.get("impact_level") == "HIGH")
        row["fria_medium"] = sum(1 for r in rights if r.get("impact_level") == "MEDIUM")
        row["fria_total"]  = len(rights)
    else:
        row.update({"fria_level":"ERROR","fria_high":0,"fria_medium":0,"fria_total":0})

    if cyber_d:
        threats = cyber_d.get("threats_identified", [])
        row["cyber_level"]     = cyber_d.get("overall_security_risk", "?")
        row["cyber_applicable"]= sum(1 for t in threats if t.get("applicable"))
        row["cyber_inferred"]  = sum(1 for t in threats if t.get("graph_inferred"))
    else:
        row.update({"cyber_level":"ERROR","cyber_applicable":0,"cyber_inferred":0})

    if xai_d:
        cs = xai_d.get("compliance_status", {})
        status = cs.get("status", "?") if isinstance(cs, dict) else str(cs)
        row["xai_status"] = "COMPLIANT" if status == "COMPLIANT" else "NON-COMPLIANT"
        row["xai_method"]  = (xai_d.get("method_used") or "?")[:35]
    else:
        row.update({"xai_status":"ERROR","xai_method":"?"})

    if risk_d:
        row["risk_score"]  = risk_d.get("overall_risk_score", "?")
        row["risk_level"]  = risk_d.get("overall_risk_level", "?")
        row["risk_actions"]= risk_d.get("outstanding_actions", 0)
    else:
        row.update({"risk_score":"?","risk_level":"ERROR","risk_actions":0})

    if bias_d:
        art10  = bias_d.get("article_10_compliance", {})
        thresh = bias_d.get("threshold_profile", {})
        row["bias_detected"]      = "YES" if art10.get("bias_detected") else "NO"
        row["bias_spd_threshold"] = thresh.get("spd_threshold", "?")
    else:
        row.update({"bias_detected":"ERROR","bias_spd_threshold":"?"})

    row["total_time"] = round(ft + ct + xt + rt + bt, 3)

    print(f"  FRIA:{row['fria_level']} ({row['fria_high']}H/{row['fria_medium']}M) | "
          f"Cyber:{row['cyber_level']} ({row['cyber_applicable']}app,{row['cyber_inferred']}inf) | "
          f"XAI:{row['xai_status']} | "
          f"Risk:{row['risk_score']}/10 {row['risk_level']} | "
          f"Bias:{row['bias_detected']} SPD={row['bias_spd_threshold']} | "
          f"{row['total_time']}s")

    results.append(row)

print()
print("=" * 65)
print("SUMMARY TABLE")
print("=" * 65)
print(f"{'Code':<5}{'Scenario':<38}{'FRIA':<8}{'H/M':<6}{'Cyber':<8}{'App':<5}{'Inf':<5}{'XAI':<14}{'Risk':<6}{'Lv':<8}{'Bias':<5}{'SPD':<6}{'Time'}")
print("-" * 120)
for r in results:
    print(f"{r['code']:<5}{r['label'][:37]:<38}"
          f"{r['fria_level']:<8}{str(r['fria_high'])+'/'+str(r['fria_medium']):<6}"
          f"{r['cyber_level']:<8}{str(r['cyber_applicable']):<5}{str(r['cyber_inferred']):<5}"
          f"{r['xai_status']:<14}"
          f"{str(r['risk_score']):<6}{r['risk_level']:<8}"
          f"{r['bias_detected']:<5}{str(r['bias_spd_threshold']):<6}"
          f"{r['total_time']}")

times = [r["total_time"] for r in results if isinstance(r["total_time"], (int, float)) and r["total_time"] > 0]
if len(times) > 1:
    print()
    print(f"Response time statistics (n={len(times)} scenarios, 5 endpoints each):")
    print(f"  Mean = {statistics.mean(times):.3f}s")
    print(f"  Std  = {statistics.stdev(times):.3f}s")
    print(f"  Min  = {min(times):.3f}s")
    print(f"  Max  = {max(times):.3f}s")
    print(f"  95th = {sorted(times)[int(0.95*len(times))]:.3f}s")

save_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sensitivity_results.json")
with open(save_path, "w") as f:
    json.dump(results, f, indent=2, default=str)
print(f"\nResults saved to: {save_path}")