from fastapi import APIRouter
from models import CreditScoringSystem
from database import get_driver

router = APIRouter()

@router.post("/assess")
async def assess_risk(system: CreditScoringSystem):
    try:
        driver = get_driver()
        with driver.session() as session:
            result = session.run("MATCH (rf:RiskFactor) RETURN rf")
            risk_factors_db = [record["rf"] for record in result]

        risk_factors = []

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
                if system.uses_special_category_data:
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
                if not system.explainability_method:
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
                if not system.audit_logging_enabled:
                    score = 6
                    severity = "HIGH"
                    mitigation_status = "REQUIRED"
                    mitigation_action = "Implement tamper-evident audit logging before deployment as required by Article 12, retained for at least six months"
                else:
                    score = 1
                    severity = "LOW"
                    mitigation_status = "ADDRESSED"
                    mitigation_action = "Ensure audit logs are retained for at least six months, reviewed regularly, and protected against tampering"

            risk_factors.append({
                "risk_name": rf["name"],
                "description": rf["description"],
                "score": score,
                "actual_severity": severity,
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
            "article_9_compliance": {
                "status": "NON-COMPLIANT - Outstanding actions required" if high_risks > 0 else "COMPLIANT",
                "outstanding_actions": outstanding,
                "next_review": "Before deployment and at least annually thereafter or after any significant system change"
            },
            "recommendations": [
                "Address all HIGH severity risks before deployment under Article 9",
                "Assign a named responsible person for each outstanding mitigation action with a completion deadline",
                "Document the risk management system formally including all identified risks and mitigations",
                "Establish a schedule for regular risk re-assessment at least annually",
                "Report risk management activities to the relevant national market surveillance authority as required"
            ]
        }

    except Exception as e:
        return {
            "system_name": system.system_name,
            "article": "Article 9 - EU AI Act",
            "error": str(e),
            "message": "Risk scoring assessment encountered an error."
        }
