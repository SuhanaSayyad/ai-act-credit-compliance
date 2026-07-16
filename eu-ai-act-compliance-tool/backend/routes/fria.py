from fastapi import APIRouter
from models import CreditScoringSystem
from database import get_driver

def compute_right_confidence(right_name: str, system) -> dict:
    criteria_map = {
        "Right to Privacy": {
            "total": 3,
            "checks": [
                system.uses_personal_data,
                not system.audit_logging_enabled,
                system.third_party_data_sharing,
            ]
        },
        "Right to Non-Discrimination": {
            "total": 2,
            "checks": [
                system.known_bias_issues,
                system.uses_special_category_data,
            ]
        },
        "Human Dignity": {
            "total": 2,
            "checks": [
                system.automated_decision_making,
                not system.human_oversight_available,
            ]
        },
        "Right to Fair Trial": {
            "total": 1,
            "checks": [
                not (lambda m: m and m.strip().lower() not in ["none","no","n/a","na","none implemented","not implemented"])(system.explainability_method),
            ]
        },
        "Right to Effective Remedy": {
            "total": 1,
            "checks": [
                not system.human_oversight_available,
            ]
        },
        "Right to Equal Treatment": {
            "total": 2,
            "checks": [
                system.known_bias_issues,
                system.uses_special_category_data,
            ]
        },
        "Right to Data Protection": {
            "total": 2,
            "checks": [
                system.third_party_data_sharing,
                not system.access_controls_implemented,
            ]
        },
    }

    config = criteria_map.get(right_name, {"total": 1, "checks": []})
    confirmed = sum(1 for c in config["checks"] if c)
    total = config["total"]
    score = round((confirmed / total) * 100) if total > 0 else 50

    if score >= 75:
        label = "HIGH CONFIDENCE"
    elif score >= 40:
        label = "MODERATE CONFIDENCE"
    else:
        label = "LOW CONFIDENCE"

    return {
        "score": score,
        "label": label,
        "basis": f"{confirmed} of {total} risk criteria confirmed by questionnaire responses",
        "note": "Confidence reflects the proportion of applicable risk criteria directly evidenced by system characteristics. Low confidence indicates the assessment is based on fewer confirmed factors."
    }

router = APIRouter()

@router.post("/assess")
async def assess_fria(system: CreditScoringSystem):
    try:
        driver = get_driver()
        with driver.session() as session:

            rights_result = session.run(
                """MATCH (a:LegalArticle {code: 'ART27'})-[:REQUIRES_ASSESSMENT_OF]->(r:FundamentalRight)
                   RETURN r ORDER BY r.code"""
            )
            rights = [record["r"] for record in rights_result]

            implied_threats = []
            if system.external_api_access:
                threat_result = session.run(
                    """MATCH (rf:RiskFactor {code: 'RISK_EXTERNAL_API'})-[:IMPLIES]->(t:Threat)
                             -[:GOVERNED_BY]->(a:LegalArticle)
                       RETURN t.name as threat, t.severity as severity,
                              a.name as governed_by"""
                )
                implied_threats = [dict(r) for r in threat_result]

            risk_req_result = session.run(
                """MATCH (a:LegalArticle)-[:REQUIRES_RISK_ASSESSMENT_OF]->(rf:RiskFactor)
                   WHERE a.code IN ['ART27', 'ART10', 'ART13']
                   RETURN DISTINCT rf.name as risk_name, a.name as required_by"""
            )
            required_risk_assessments = [dict(r) for r in risk_req_result]

            obligations_result = session.run(
                """MATCH (a:LegalArticle)
                   WHERE a.code IN ['ART27', 'ART10', 'ART13', 'ART9']
                   RETURN a.name as article, a.requirement as requirement
                   ORDER BY a.code"""
            )
            obligations_data = [dict(r) for r in obligations_result]

        rights_assessed = []
        for right in rights:
            impact = "LOW"
            justification = ""
            mitigation = ""
            name = right["name"]

            if name == "Right to Privacy":
                if system.uses_personal_data and not system.audit_logging_enabled:
                    impact = "HIGH"
                    justification = "Personal data processed without audit logging creates accountability gaps under Article 7 EU Charter and GDPR Article 5(1)(f)"
                    mitigation = "Implement tamper-evident audit logging and data minimisation practices"
                elif system.uses_personal_data:
                    impact = "MEDIUM"
                    justification = "Personal data processing engages Article 7 EU Charter (private life) and GDPR obligations including data subject rights"
                    mitigation = "Ensure retention policies are enforced and documented for regulatory inspection"
                else:
                    impact = "LOW"
                    justification = "Limited personal data processing reduces privacy risk"
                    mitigation = "Maintain current data minimisation approach"

            elif name == "Right to Non-Discrimination":
                if system.known_bias_issues:
                    impact = "HIGH"
                    justification = "Documented bias creates direct discrimination risk under Article 21 EU Charter"
                    mitigation = "Conduct immediate independent bias audit before any deployment"
                elif system.uses_special_category_data:
                    impact = "MEDIUM"
                    justification = "Special category data processing creates elevated discrimination risk"
                    mitigation = "Implement Article 10(5) safeguards and regular fairness audits"
                else:
                    impact = "LOW"
                    justification = "No known bias issues and no special category data"
                    mitigation = "Continue regular fairness monitoring"

            elif name == "Human Dignity":
                if system.automated_decision_making and not system.human_oversight_available:
                    impact = "HIGH"
                    justification = "Fully automated credit decisions without human oversight violate dignity obligations"
                    mitigation = "Implement mandatory human review for all decisions before effect"
                elif system.automated_decision_making:
                    impact = "MEDIUM"
                    justification = "Automated decisions with oversight partially mitigates dignity concerns"
                    mitigation = "Ensure human reviewers are genuinely empowered to override recommendations"
                else:
                    impact = "LOW"
                    justification = "Human involvement in decision process protects dignity"
                    mitigation = "Document review procedures formally"

            elif name == "Right to Fair Trial":

                _em = (system.explainability_method or "").strip().lower()
                _neg = ["none implemented", "not implemented", "not applicable", "n/a", "na", "none", "no"]
                _has_explainability = _em != "" and not any(_em.startswith(n) for n in _neg)

                if not _has_explainability:
                    impact = "HIGH"
                    justification = "No meaningful explainability method is implemented, preventing individuals from effectively understanding and challenging decisions"
                    mitigation = "Implement SHAP or LIME explainability before deployment to satisfy Article 13"
                else:
                    impact = "LOW"
                    justification = f"{system.explainability_method} supports the right to understand and effectively contest credit decisions"
                    mitigation = "Ensure explanations are provided proactively in plain language at point of decision, not only on request"

            elif name == "Right to Effective Remedy":
                if not system.human_oversight_available:
                    impact = "HIGH"
                    justification = "Without human oversight no meaningful remedy pathway exists"
                    mitigation = "Establish formal complaints process with human decision makers"
                else:
                    impact = "MEDIUM"
                    justification = "Remedy pathway exists but must be clearly communicated"
                    mitigation = "Publish a clear accessible complaints procedure"

            elif name == "Right to Equal Treatment":
                if system.known_bias_issues:
                    impact = "HIGH"
                    justification = "Known bias directly compromises equal treatment under Article 20 EU Charter"
                    mitigation = "Address all bias before deployment and implement continuous monitoring"
                else:
                    impact = "LOW"
                    justification = "No evidence of differential treatment across applicant groups"
                    mitigation = "Maintain regular equality impact assessments"

            elif name == "Right to Data Protection":
                if system.third_party_data_sharing and not system.access_controls_implemented:
                    impact = "HIGH"
                    justification = "Third party sharing without access controls creates significant data protection risk"
                    mitigation = "Implement data processing agreements and strict access controls"
                elif system.third_party_data_sharing:
                    impact = "MEDIUM"
                    justification = "Third party sharing requires GDPR Article 26 joint controller compliance"
                    mitigation = "Review and update all data sharing agreements"
                else:
                    impact = "LOW"
                    justification = "No third party data sharing limits data protection risk"
                    mitigation = "Maintain current data governance practices"

            confidence = compute_right_confidence(name, system)
            rights_assessed.append({
                "right": name,
                "article": right["article"],
                "description": right["description"],
                "dpv_uri": right.get("dpv_uri", ""),
                "airo_uri": right.get("airo_uri", ""),
                "impact_level": impact,
                "confidence": confidence,
                "impact_justification": justification,
                "mitigation": mitigation
            })

        high_count   = sum(1 for r in rights_assessed if r["impact_level"] == "HIGH")
        medium_count = sum(1 for r in rights_assessed if r["impact_level"] == "MEDIUM")

        if high_count >= 2:
            overall = "HIGH"
        elif high_count == 1 or medium_count >= 3:
            overall = "MEDIUM"
        else:
            overall = "LOW"

        recommendations = [
            "Conduct and document this FRIA before first deployment and repeat annually or after significant changes",
            "Register the FRIA in the EU database as required by Article 27(4) before deployment",
            "Make a non-confidential FRIA summary publicly available under Article 27(9)",
            "Establish a formal complaints mechanism and communicate it to affected individuals",
            "Implement human oversight measures proportionate to identified risk levels",
            "Maintain FRIA documentation for regulatory inspection for a minimum of ten years"
        ]
        _em_rec = (system.explainability_method or "").strip().lower()
        _neg_rec = ["none implemented", "not implemented", "not applicable", "n/a", "na", "none", "no"]
        _no_explainability = _em_rec == "" or any(_em_rec.startswith(n) for n in _neg_rec)
        if _no_explainability:
            recommendations.insert(0, "URGENT: Implement SHAP or LIME explainability before deployment")
        if system.known_bias_issues:
            recommendations.insert(0, "URGENT: Resolve all known bias issues before deployment")

        obligations = [
            {"article": "Article 27(1)", "requirement": "Conduct FRIA before putting high-risk AI into service"},
            {"article": "Article 27(4)", "requirement": "Register FRIA in the EU database before deployment"},
            {"article": "Article 27(9)", "requirement": "Make public summary of FRIA available"},
            {"article": "Article 26(1)", "requirement": "Implement appropriate technical and organisational measures"},
            {"article": "Article 26(5)", "requirement": "Provide affected individuals with information about the system"},
        ]

        return {
            "system_name": system.system_name,
            "article": "Article 27 - EU AI Act",
            "assessment_type": "Fundamental Rights Impact Assessment",
            "overall_risk_level": overall,
            "overall_confidence": {
                "score": round(sum(r["confidence"]["score"] for r in rights_assessed) / len(rights_assessed)) if rights_assessed else 50,
                "label": "HIGH CONFIDENCE" if round(sum(r["confidence"]["score"] for r in rights_assessed) / len(rights_assessed)) >= 75 else "MODERATE CONFIDENCE" if round(sum(r["confidence"]["score"] for r in rights_assessed) / len(rights_assessed)) >= 40 else "LOW CONFIDENCE",
                "basis": f"{sum(1 for r in rights_assessed if r['impact_level'] in ['HIGH', 'MEDIUM'])} of {len(rights_assessed)} rights flagged as requiring attention",
                "note": "Overall confidence reflects the average certainty across all fundamental rights assessments based on confirmed system characteristics."
            },
            "knowledge_graph_traversal": {
                "method": "Multi-hop Cypher traversal: LegalArticle -[REQUIRES_ASSESSMENT_OF]-> FundamentalRight",
                "rights_traversed": len(rights_assessed),
                "implied_threats_from_risk_profile": implied_threats,
                "required_risk_assessments_inferred": required_risk_assessments
            },
            "rights_assessed": rights_assessed,
            "obligations": obligations,
            "recommendations": recommendations
        }

    except Exception as e:
        return {
            "system_name": system.system_name,
            "article": "Article 27 - EU AI Act",
            "error": str(e),
            "message": "FRIA assessment encountered an error."
        }