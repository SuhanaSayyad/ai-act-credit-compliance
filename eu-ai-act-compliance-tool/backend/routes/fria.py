from fastapi import APIRouter
from models import CreditScoringSystem
from database import get_driver

router = APIRouter()

@router.post("/assess")
async def assess_fria(system: CreditScoringSystem):
    try:
        driver = get_driver()
        with driver.session() as session:
            result = session.run("MATCH (r:FundamentalRight) RETURN r")
            rights = [record["r"] for record in result]

        rights_assessed = []
        for right in rights:
            impact = "LOW"
            justification = ""
            mitigation = ""
            name = right["name"]

            if name == "Right to Privacy":
                if system.uses_personal_data and not system.audit_logging_enabled:
                    impact = "HIGH"
                    justification = "System processes personal data without audit logging, creating accountability gaps under GDPR Article 5(1)(f)"
                    mitigation = "Implement tamper-evident audit logging and enforce data minimisation and purpose limitation"
                elif system.uses_personal_data:
                    impact = "MEDIUM"
                    justification = "Personal data processing triggers ongoing GDPR compliance obligations including data subject rights"
                    mitigation = "Ensure data retention policies are enforced, documented, and subject to periodic review"
                else:
                    impact = "LOW"
                    justification = "Limited personal data processing reduces privacy risk"
                    mitigation = "Maintain current data minimisation approach and document the basis for this assessment"

            elif name == "Right to Non-Discrimination":
                if system.known_bias_issues:
                    impact = "HIGH"
                    justification = "Documented bias issues create direct discrimination risk against protected groups under Article 21 EU Charter"
                    mitigation = "Conduct immediate independent bias audit and apply technical mitigation before any deployment"
                elif system.uses_special_category_data:
                    impact = "MEDIUM"
                    justification = "Processing special category data creates elevated discrimination risk requiring Article 10(5) safeguards"
                    mitigation = "Implement mandatory safeguards and conduct regular fairness audits against applicable protected attributes"
                else:
                    impact = "LOW"
                    justification = "No known bias issues and no special category data processing"
                    mitigation = "Continue regular fairness monitoring and document results for regulatory inspection"

            elif name == "Human Dignity":
                if system.automated_decision_making and not system.human_oversight_available:
                    impact = "HIGH"
                    justification = "Fully automated credit decisions without human oversight may violate dignity and GDPR Article 22 rights"
                    mitigation = "Implement mandatory human review for all credit decisions before they take legal effect"
                elif system.automated_decision_making:
                    impact = "MEDIUM"
                    justification = "Automated decisions with human oversight partially mitigates dignity concerns but oversight must be meaningful"
                    mitigation = "Ensure human reviewers are genuinely empowered to override system recommendations and are trained to do so"
                else:
                    impact = "LOW"
                    justification = "Human involvement in the decision process adequately protects dignity"
                    mitigation = "Formally document human review procedures and ensure they are consistently followed"

            elif name == "Right to Fair Trial":
                if not system.explainability_method:
                    impact = "HIGH"
                    justification = "Absence of explainability prevents individuals from effectively understanding and challenging credit decisions"
                    mitigation = "Implement SHAP or LIME explainability and ensure explanations are provided at point of decision"
                else:
                    impact = "LOW"
                    justification = f"Declared explainability method ({system.explainability_method}) supports the right to understand and contest decisions"
                    mitigation = "Ensure explanations are provided proactively in plain language at point of decision, not only on request"

            elif name == "Right to Effective Remedy":
                if not system.human_oversight_available:
                    impact = "HIGH"
                    justification = "Without human oversight no meaningful internal remedy pathway exists for individuals affected by adverse decisions"
                    mitigation = "Establish a formal complaints and review process with human decision makers empowered to reverse outcomes"
                else:
                    impact = "MEDIUM"
                    justification = "A remedy pathway exists through human oversight but must be clearly communicated to affected individuals"
                    mitigation = "Publish a clear and accessible complaints procedure and ensure it is communicated at point of decision"

            elif name == "Right to Equal Treatment":
                if system.known_bias_issues:
                    impact = "HIGH"
                    justification = "Known bias issues directly compromise equal treatment obligations under Article 20 EU Charter"
                    mitigation = "Address all identified bias before deployment and implement continuous equality monitoring in production"
                else:
                    impact = "LOW"
                    justification = "No documented evidence of differential treatment across applicant groups"
                    mitigation = "Maintain regular equality impact assessments and document results for regulatory purposes"

            elif name == "Right to Data Protection":
                if system.third_party_data_sharing and not system.access_controls_implemented:
                    impact = "HIGH"
                    justification = "Third party data sharing without access controls creates significant data protection risk under GDPR Article 28"
                    mitigation = "Implement data processing agreements, conduct transfer impact assessments, and enforce strict access controls for all third parties"
                elif system.third_party_data_sharing:
                    impact = "MEDIUM"
                    justification = "Third party data sharing requires GDPR Article 26 joint controller or Article 28 processor compliance"
                    mitigation = "Review and update all data sharing agreements to ensure full GDPR compliance and document third party relationships"
                else:
                    impact = "LOW"
                    justification = "No third party data sharing limits data protection risk"
                    mitigation = "Maintain current data governance practices and review annually"

            rights_assessed.append({
                "right": name,
                "article": right["article"],
                "description": right["description"],
                "impact_level": impact,
                "impact_justification": justification,
                "mitigation": mitigation
            })

        high_count = sum(1 for r in rights_assessed if r["impact_level"] == "HIGH")
        medium_count = sum(1 for r in rights_assessed if r["impact_level"] == "MEDIUM")

        if high_count >= 2:
            overall = "HIGH"
        elif high_count == 1 or medium_count >= 3:
            overall = "MEDIUM"
        else:
            overall = "LOW"

        recommendations = [
            "Conduct and document this FRIA before first deployment and repeat annually or after any significant system change",
            "Register the FRIA in the EU database as required by Article 27(4) before deployment",
            "Make a non-confidential summary of the FRIA available to the public under Article 27(9)",
            "Establish a formal complaints mechanism and communicate it to all affected individuals at point of decision",
            "Implement human oversight measures proportionate to the identified risk levels",
            "Maintain all FRIA documentation and evidence for regulatory inspection for a minimum of ten years"
        ]

        if not system.explainability_method:
            recommendations.insert(0, "URGENT: Implement an explainability method (SHAP or LIME) before deployment to enable meaningful contestation of decisions")
        if system.known_bias_issues:
            recommendations.insert(0, "URGENT: Resolve all known bias issues before deployment to avoid violating non-discrimination and equal treatment obligations")

        return {
            "system_name": system.system_name,
            "article": "Article 27 - EU AI Act",
            "assessment_type": "Fundamental Rights Impact Assessment",
            "overall_risk_level": overall,
            "rights_assessed": rights_assessed,
            "obligations": [
                {"article": "Article 27(1)", "requirement": "Conduct FRIA before putting high-risk AI system into service"},
                {"article": "Article 27(4)", "requirement": "Register FRIA in the EU database before deployment"},
                {"article": "Article 27(9)", "requirement": "Make a public summary of the FRIA available"},
                {"article": "Article 26(1)", "requirement": "Implement appropriate technical and organisational measures"},
                {"article": "Article 26(5)", "requirement": "Provide affected individuals with information about the system"},
            ],
            "recommendations": recommendations
        }

    except Exception as e:
        return {
            "system_name": system.system_name,
            "article": "Article 27 - EU AI Act",
            "error": str(e),
            "message": "FRIA assessment encountered an error."
        }
