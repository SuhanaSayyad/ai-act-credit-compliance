from fastapi import APIRouter
from models import CreditScoringSystem
from database import get_driver
import re

router = APIRouter()

def _parse_retention_months(text: str) -> int:
    if not text:
        return 0
    t = text.lower()
    m = re.search(r'(\d+)\s*(year|yr)', t)
    if m:
        return int(m.group(1)) * 12
    m = re.search(r'(\d+)\s*month', t)
    if m:
        return int(m.group(1))
    return 0

def _detect_alternative_data(text: str) -> bool:
    if not text:
        return False
    t = text.lower()
    return any(kw in t for kw in ["social media", "mobile", "browsing", "app usage", "device data", "location"])

def _scale_context(n: int) -> str:
    if n >= 50000:
        return f"Large-scale deployment ({n:,} users/year) elevates societal impact under the Article 9(2) proportionality principle."
    elif n >= 10000:
        return f"Medium-scale deployment ({n:,} users/year)."
    elif n > 0:
        return f"Limited-scale deployment ({n:,} users/year)."
    return "Deployment scale not specified."

def _compute_risk_confidence(code: str, score: int, system) -> dict:
    direct_evidence = {
        "RISK_AUTOMATION":    system.automated_decision_making and not system.human_oversight_available,
        "RISK_SPECIAL_DATA":  system.uses_special_category_data,
        "RISK_EXPLAINABILITY": (lambda em: (em or "").strip().lower() == "" or any((em or "").strip().lower().startswith(n) for n in ["none implemented", "not implemented", "not applicable", "n/a", "na", "none", "no"]))(system.explainability_method),
        "RISK_EXTERNAL_API":  system.external_api_access,
        "RISK_KNOWN_BIAS":    system.known_bias_issues,
        "RISK_NO_AUDIT":      not system.audit_logging_enabled,
    }
    secondary_evidence = {
        "RISK_AUTOMATION":    system.automated_decision_making,
        "RISK_SPECIAL_DATA":  system.uses_personal_data,
        "RISK_EXPLAINABILITY": True,
        "RISK_EXTERNAL_API":  not system.access_controls_implemented,
        "RISK_KNOWN_BIAS":    system.uses_special_category_data,
        "RISK_NO_AUDIT":      not system.previously_audited,
    }
    primary = direct_evidence.get(code, False)
    secondary = secondary_evidence.get(code, False)

    if primary and secondary:
        conf_score = 90
        basis = "Both primary and secondary risk indicators confirmed"
    elif primary:
        conf_score = 75
        basis = "Primary risk indicator directly confirmed"
    elif secondary:
        conf_score = 50
        basis = "Secondary risk indicator present, primary indicator absent"
    else:
        conf_score = 25
        basis = "Risk factor assessed from general system profile"

    label = "HIGH CONFIDENCE" if conf_score >= 75 else "MODERATE CONFIDENCE" if conf_score >= 40 else "LOW CONFIDENCE"
    return {
        "score": conf_score,
        "label": label,
        "basis": basis,
        "note": "Risk confidence reflects how directly the system's declared characteristics confirm this specific risk factor."
    }

@router.post("/assess")
async def assess_risk(system: CreditScoringSystem):
    try:
        driver = get_driver()
        with driver.session() as session:
            result = session.run("MATCH (rf:RiskFactor) RETURN rf")
            risk_factors_db = [record["rf"] for record in result]

        risk_factors = []
        alt_data_flag = _detect_alternative_data(system.data_sources)
        retention_months = _parse_retention_months(system.data_retention_period)

        for rf in risk_factors_db:
            code = rf["code"]
            score = 0
            severity = "LOW"
            mitigation_status = "ADDRESSED"
            mitigation_action = ""

            if code == "RISK_AUTOMATION":
                if system.automated_decision_making and not system.human_oversight_available:
                    score = 8
                    severity = "HIGH"
                    mitigation_status = "REQUIRED"
                    mitigation_action = "Implement mandatory human review for all decisions before they take legal effect under Article 14"
                elif system.automated_decision_making:
                    score = 4
                    severity = "MEDIUM"
                    mitigation_status = "PARTIAL"
                    mitigation_action = "Ensure human reviewers are genuinely empowered and trained to override system recommendations"
                else:
                    score = 1
                    severity = "LOW"
                    mitigation_status = "ADDRESSED"
                    mitigation_action = "Maintain current human oversight procedures and document them formally for regulatory inspection"

            elif code == "RISK_SPECIAL_DATA":
                if system.uses_special_category_data and alt_data_flag:
                    score = 9
                    severity = "HIGH"
                    mitigation_status = "REQUIRED"
                    mitigation_action = "Apply Article 10(5) safeguards: pseudonymisation, strict access controls, and deletion after bias correction. Non-traditional data sources (e.g. social media, mobile usage) increase proxy-discrimination risk for special category data and require additional scrutiny of derived features."
                elif system.uses_special_category_data:
                    score = 7
                    severity = "HIGH"
                    mitigation_status = "REQUIRED"
                    mitigation_action = "Apply Article 10(5) safeguards: pseudonymisation, strict access controls, and deletion after bias correction"
                else:
                    score = 1
                    severity = "LOW"
                    mitigation_status = "ADDRESSED"
                    mitigation_action = "Confirm no special category data is inadvertently collected through proxy variables in the dataset"

            elif code == "RISK_EXPLAINABILITY":
                _em_check = (system.explainability_method or "").strip().lower()
                _neg_check = ["none implemented", "not implemented", "not applicable", "n/a", "na", "none", "no"]
                _has_explainability = _em_check != "" and not any(_em_check.startswith(n) for n in _neg_check)
                if not _has_explainability:
                    score = 7
                    severity = "HIGH"
                    mitigation_status = "REQUIRED"
                    mitigation_action = "Implement SHAP or LIME explainability before deployment to satisfy Article 13 transparency obligations"
                else:
                    score = 2
                    severity = "LOW"
                    mitigation_status = "ADDRESSED"
                    mitigation_action = f"Ensure {system.explainability_method} outputs are communicated in plain language at point of decision"

            elif code == "RISK_EXTERNAL_API":
                if system.external_api_access and not system.access_controls_implemented:
                    score = 8
                    severity = "HIGH"
                    mitigation_status = "REQUIRED"
                    mitigation_action = "Implement API authentication, rate limiting, and input validation before any external exposure"
                elif system.external_api_access:
                    score = 4
                    severity = "MEDIUM"
                    mitigation_status = "PARTIAL"
                    mitigation_action = "Review and strengthen existing API security controls against AI-specific attacks identified in the cybersecurity report"
                else:
                    score = 1
                    severity = "LOW"
                    mitigation_status = "ADDRESSED"
                    mitigation_action = "Maintain internal-only access and monitor any future plans for external API exposure"

            elif code == "RISK_KNOWN_BIAS":
                if system.known_bias_issues:
                    score = 9
                    severity = "HIGH"
                    mitigation_status = "REQUIRED"
                    mitigation_action = "Halt deployment until all bias issues are resolved and independently verified through a third-party fairness audit"
                else:
                    score = 2
                    severity = "LOW"
                    mitigation_status = "ADDRESSED"
                    mitigation_action = "Implement ongoing bias monitoring in production to detect and address emerging fairness issues"

            elif code == "RISK_NO_AUDIT":
                if not system.audit_logging_enabled and retention_months >= 84:
                    score = 7
                    severity = "HIGH"
                    mitigation_status = "REQUIRED"
                    mitigation_action = f"Implement tamper-evident audit logging before deployment as required by Article 12. The declared retention period ({system.data_retention_period or 'unspecified'}) exceeds common data minimisation guidance under GDPR Article 5(1)(e), making an auditable trail of processing decisions especially important."
                elif not system.audit_logging_enabled:
                    score = 6
                    severity = "HIGH"
                    mitigation_status = "REQUIRED"
                    mitigation_action = "Implement tamper-evident audit logging before deployment as required by Article 12, retained for at least six months"
                else:
                    score = 1
                    severity = "LOW"
                    mitigation_status = "ADDRESSED"
                    mitigation_action = "Ensure audit logs are retained for at least six months, reviewed regularly, and protected against tampering"

            risk_confidence = _compute_risk_confidence(code, score, system)
            risk_factors.append({
                "risk_name": rf["name"],
                "description": rf["description"],
                "score": score,
                "actual_severity": severity,
                "confidence": risk_confidence,
                "mitigation_status": mitigation_status,
                "mitigation_action": mitigation_action
            })

        overall_score = round(sum(rf["score"] for rf in risk_factors) / len(risk_factors), 1) if risk_factors else 0
        high_risks = sum(1 for rf in risk_factors if rf["actual_severity"] == "HIGH")
        medium_risks = sum(1 for rf in risk_factors if rf["actual_severity"] == "MEDIUM")
        low_risks = sum(1 for rf in risk_factors if rf["actual_severity"] == "LOW")

        if high_risks >= 2 or overall_score >= 6:
            overall_level = "HIGH"
        elif high_risks == 1 or overall_score >= 4:
            overall_level = "MEDIUM"
        else:
            overall_level = "LOW"

        outstanding = sum(1 for rf in risk_factors if rf["mitigation_status"] == "REQUIRED")

        recommendations = [
            "Address all HIGH severity risks before deployment under Article 9",
            "Assign a named responsible person for each outstanding mitigation action with a completion deadline",
            "Document the risk management system formally including all identified risks and mitigations",
            "Establish a schedule for regular risk re-assessment at least annually",
            "Report risk management activities to the relevant national market surveillance authority as required"
        ]
        if system.estimated_users_per_year >= 50000:
            recommendations.insert(0, "Given the large deployment scale, prioritise proportionate risk controls under Article 9(2) and consider more frequent re-assessment than the annual minimum")
        if alt_data_flag and system.uses_special_category_data:
            recommendations.insert(0, "Audit non-traditional data sources (social media, mobile usage) for proxy variables correlated with special category data")

        return {
            "system_name": system.system_name,
            "article": "Article 9 - EU AI Act",
            "assessment_type": "Risk Scoring Dashboard",
            "overall_risk_score": overall_score,
            "overall_risk_level": overall_level,
            "risk_factors": risk_factors,
            "risk_summary": {
                "high_risks": high_risks,
                "medium_risks": medium_risks,
                "low_risks": low_risks
            },
            "deployment_context": {
                "estimated_users_per_year": system.estimated_users_per_year,
                "scale_note": _scale_context(system.estimated_users_per_year),
                "data_sources": system.data_sources,
                "alternative_data_detected": alt_data_flag,
                "data_retention_period": system.data_retention_period,
                "retention_months_parsed": retention_months
            },
            "overall_risk_confidence": {
                "score": round(sum(rf["confidence"]["score"] for rf in risk_factors) / len(risk_factors)) if risk_factors else 50,
                "label": "HIGH CONFIDENCE" if round(sum(rf["confidence"]["score"] for rf in risk_factors) / len(risk_factors)) >= 75 else "MODERATE CONFIDENCE",
                "basis": f"{outstanding} risk factors require immediate action based on confirmed system characteristics",
                "note": "Overall risk confidence reflects how directly the questionnaire responses confirm each identified risk factor."
            },
            "article_9_compliance": {
                "status": "NON-COMPLIANT - Outstanding actions required" if high_risks > 0 else "COMPLIANT",
                "outstanding_actions": outstanding,
                "next_review": "Before deployment and at least annually thereafter or after any significant system change"
            },
            "report_metadata": {
                "organisation_name": system.organisation_name,
                "intended_purpose": system.intended_purpose,
                "model_version": system.model_version,
                "deployment_sector": system.deployment_sector
            },
            "recommendations": recommendations
        }

    except Exception as e:
        return {
            "system_name": system.system_name,
            "article": "Article 9 - EU AI Act",
            "error": str(e),
            "message": "Risk scoring assessment encountered an error."
        }