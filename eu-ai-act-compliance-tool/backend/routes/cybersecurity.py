from fastapi import APIRouter
from models import CreditScoringSystem
from database import get_driver

router = APIRouter()

@router.post("/assess")
async def assess_cybersecurity(system: CreditScoringSystem):
    try:
        driver = get_driver()
        with driver.session() as session:
            threat_result = session.run("MATCH (t:Threat) RETURN t")
            threats = [record["t"] for record in threat_result]
            control_result = session.run("MATCH (c:Control) RETURN c")
            controls = [record["c"] for record in control_result]

        threats_identified = []
        applicable_threats = []

        for threat in threats:
            code = threat["code"]
            applicable = False
            reason = ""

            if code == "THREAT_POISON":
                applicable = not system.access_controls_implemented
                reason = ("Training pipeline lacks access controls, enabling unauthorised modification of training data"
                          if applicable else
                          "Access controls reduce the risk of training data poisoning")

            elif code == "THREAT_EVASION":
                applicable = True
                reason = "All credit scoring models are susceptible to adversarial evasion attacks regardless of configuration"

            elif code == "THREAT_INVERSION":
                applicable = system.external_api_access
                reason = ("External API access enables model inversion through repeated systematic querying"
                          if applicable else
                          "Internal-only access significantly reduces model inversion risk")

            elif code == "THREAT_EXTRACTION":
                applicable = system.external_api_access
                reason = ("External API access enables model extraction by training a surrogate on query outputs"
                          if applicable else
                          "No external API access reduces model extraction risk")

            elif code == "THREAT_MEMBERSHIP":
                applicable = system.uses_personal_data
                reason = ("Personal data use enables membership inference attacks that could expose sensitive applicant information"
                          if applicable else
                          "No personal data processing reduces membership inference risk")

            elif code == "THREAT_BACKDOOR":
                applicable = not system.previously_audited
                reason = ("No prior security audit means backdoor vulnerabilities may be undetected in the model or training pipeline"
                          if applicable else
                          "Prior security audit reduces likelihood of undetected backdoor vulnerabilities")

            elif code == "THREAT_REPUDIATION":
                applicable = not system.audit_logging_enabled
                reason = ("Absence of audit logging enables repudiation of malicious actions and prevents forensic investigation"
                          if applicable else
                          "Audit logging enables accountability and reduces repudiation risk")

            elif code == "THREAT_DOS":
                applicable = system.external_api_access and not system.access_controls_implemented
                reason = ("External access without rate limiting enables denial of service attacks on the inference endpoint"
                          if applicable else
                          "Access controls and rate limiting mitigate denial of service risk")

            threat_data = {
                "threat_name": threat["name"],
                "severity": threat["severity"],
                "stride_category": threat["stride_category"],
                "description": threat["description"],
                "applicable": applicable,
                "reason": reason
            }
            threats_identified.append(threat_data)
            if applicable:
                applicable_threats.append(threat["code"])

        controls_recommended = []
        for control in controls:
            if control["mitigates"] in applicable_threats:
                controls_recommended.append({
                    "control": control["name"],
                    "description": control["description"],
                    "mitigates": control["mitigates"]
                })

        applicable_count = len(applicable_threats)
        if applicable_count >= 5:
            overall_risk = "HIGH"
        elif applicable_count >= 3:
            overall_risk = "MEDIUM"
        else:
            overall_risk = "LOW"

        stride_summary = {}
        for t in threats_identified:
            if t["applicable"]:
                cat = t["stride_category"]
                if cat not in stride_summary:
                    stride_summary[cat] = []
                stride_summary[cat].append(t["threat_name"])

        return {
            "system_name": system.system_name,
            "article": "Article 15 - EU AI Act",
            "assessment_type": "Cybersecurity Threat Model",
            "overall_security_risk": overall_risk,
            "threats_identified": threats_identified,
            "controls_recommended": controls_recommended,
            "stride_summary": stride_summary,
            "applicable_threat_count": applicable_count,
            "recommendations": [
                "Implement all ENISA FAICP Layer II controls recommended in this report before deployment",
                "Conduct independent penetration testing against identified applicable threats before deployment",
                "Establish an AI-specific incident response plan covering data poisoning, evasion and extraction scenarios",
                "Monitor model outputs continuously in production for signs of adversarial manipulation or drift",
                "Apply Article 15 cybersecurity measures proportionate to the identified overall risk level",
                "Repeat this threat assessment after any significant model update or infrastructure change"
            ]
        }

    except Exception as e:
        return {
            "system_name": system.system_name,
            "article": "Article 15 - EU AI Act",
            "error": str(e),
            "message": "Cybersecurity assessment encountered an error."
        }
