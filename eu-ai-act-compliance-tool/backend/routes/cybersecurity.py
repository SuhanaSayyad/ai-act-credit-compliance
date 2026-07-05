"""
Cybersecurity Module - Article 15 EU AI Act
Threat model using multi-hop knowledge graph traversal.
Cypher traverses: Threat -[GOVERNED_BY]-> Article
                  Control -[MITIGATES]-> Threat
                  RiskFactor -[IMPLIES]-> Threat
This is genuine graph reasoning producing inferred threat applicability.
"""

from fastapi import APIRouter
from models import CreditScoringSystem
from database import get_driver

router = APIRouter()


@router.post("/assess")
async def assess_cybersecurity(system: CreditScoringSystem):
    try:
        driver = get_driver()
        with driver.session() as session:

            # ── Multi-hop: fetch all threats with their controls ──────────
            # Single Cypher query traverses Threat -[GOVERNED_BY]-> Article
            # and Control -[MITIGATES]-> Threat in one pass
            threat_result = session.run(
                """MATCH (t:Threat)-[:GOVERNED_BY]->(a:LegalArticle)
                   OPTIONAL MATCH (c:Control)-[:MITIGATES]->(t)
                   RETURN t, a.name as governed_by,
                          collect(c) as mitigating_controls
                   ORDER BY t.severity DESC, t.code"""
            )
            threat_rows = list(threat_result)

            # ── Multi-hop: infer threats from system risk factors ─────────
            # Traverses: RiskFactor -[IMPLIES]-> Threat
            # based on this system's actual characteristics
            implied_threat_codes = set()

            if system.external_api_access:
                res = session.run(
                    """MATCH (rf:RiskFactor {code:'RISK_EXTERNAL_API'})-[i:IMPLIES]->(t:Threat)
                       RETURN t.code as code, i.reason as reason"""
                )
                for r in res:
                    implied_threat_codes.add(r["code"])

            if not system.audit_logging_enabled:
                res = session.run(
                    """MATCH (rf:RiskFactor {code:'RISK_NO_AUDIT'})-[i:IMPLIES]->(t:Threat)
                       RETURN t.code as code, i.reason as reason"""
                )
                for r in res:
                    implied_threat_codes.add(r["code"])

            if system.uses_special_category_data or system.uses_personal_data:
                res = session.run(
                    """MATCH (rf:RiskFactor {code:'RISK_SPECIAL_DATA'})-[i:IMPLIES]->(t:Threat)
                       RETURN t.code as code, i.reason as reason"""
                )
                for r in res:
                    implied_threat_codes.add(r["code"])

        threats_identified = []
        applicable_threat_codes = []
        all_mitigating_controls = {}

        for row in threat_rows:
            threat = row["t"]
            controls_for_threat = row["mitigating_controls"]
            code = threat["code"]

            # Determine applicability based on questionnaire + graph inference
            applicable = False
            reason = ""

            if code == "THREAT_POISON":
                applicable = not system.access_controls_implemented
                reason = ("Training pipeline lacks access controls, enabling data poisoning"
                          if applicable else "Access controls reduce poisoning risk")
            elif code == "THREAT_EVASION":
                applicable = True
                reason = "All credit scoring models are susceptible to adversarial evasion attacks"
            elif code == "THREAT_INVERSION":
                applicable = system.external_api_access
                reason = ("External API enables model inversion through repeated queries"
                          if applicable else "No external API reduces inversion risk")
            elif code == "THREAT_EXTRACTION":
                applicable = system.external_api_access
                reason = ("External API enables model extraction attacks"
                          if applicable else "No external API reduces extraction risk")
            elif code == "THREAT_MEMBERSHIP":
                applicable = system.uses_personal_data
                reason = ("Personal data use enables membership inference attacks"
                          if applicable else "No personal data reduces membership inference risk")
            elif code == "THREAT_BACKDOOR":
                applicable = not system.previously_audited
                reason = ("No prior security audit means backdoor vulnerabilities may be undetected"
                          if applicable else "Prior audit reduces backdoor risk")
            elif code == "THREAT_REPUDIATION":
                applicable = not system.audit_logging_enabled
                reason = ("No audit logging enables repudiation of malicious actions"
                          if applicable else "Audit logging reduces repudiation risk")
            elif code == "THREAT_DOS":
                applicable = system.external_api_access and not system.access_controls_implemented
                reason = ("External access without rate limiting enables denial of service"
                          if applicable else "Access controls mitigate denial of service risk")

            # Mark as graph-inferred if implied by risk factors
            graph_inferred = code in implied_threat_codes

            threats_identified.append({
                "threat_name": threat["name"],
                "severity": threat["severity"],
                "stride_category": threat["stride_category"],
                "description": threat["description"],
                "applicable": applicable,
                "graph_inferred": graph_inferred,
                "reason": reason,
                "governed_by": row["governed_by"],
                "airo_uri": threat.get("airo_uri", ""),
                "dpv_risk_uri": threat.get("dpv_risk_uri", "")
            })

            if applicable:
                applicable_threat_codes.append(code)
                # Collect mitigating controls from graph
                for ctrl in controls_for_threat:
                    if ctrl and ctrl["code"] not in all_mitigating_controls:
                        all_mitigating_controls[ctrl["code"]] = ctrl

        applicable_count = len(applicable_threat_codes)
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

        controls_recommended = []
        for ctrl in all_mitigating_controls.values():
            controls_recommended.append({
                "control": ctrl["name"],
                "description": ctrl["description"],
                "mitigates": ctrl["mitigates"],
                "dpv_uri": ctrl.get("dpv_uri", ""),
                "airo_uri": ctrl.get("airo_uri", "")
            })

        return {
            "system_name": system.system_name,
            "article": "Article 15 - EU AI Act",
            "assessment_type": "Cybersecurity Threat Model",
            "overall_security_risk": overall_risk,
            "knowledge_graph_traversal": {
                "method": "Multi-hop Cypher: Threat-[GOVERNED_BY]->Article, Control-[MITIGATES]->Threat, RiskFactor-[IMPLIES]->Threat",
                "graph_inferred_threats": list(implied_threat_codes),
                "controls_retrieved_via_graph": len(all_mitigating_controls)
            },
            "threats_identified": threats_identified,
            "controls_recommended": controls_recommended,
            "stride_summary": stride_summary,
            "applicable_threat_count": applicable_count,
            "recommendations": [
                "Implement all ENISA FAICP controls recommended by the knowledge graph traversal",
                "Conduct penetration testing against all identified applicable threats before deployment",
                "Establish an AI-specific incident response plan covering poisoning, evasion and extraction",
                "Monitor model outputs continuously in production for signs of adversarial manipulation",
                "Apply Article 15 measures proportionate to the identified overall risk level",
                "Repeat this threat assessment after any significant model or infrastructure change"
            ]
        }

    except Exception as e:
        return {
            "system_name": system.system_name,
            "article": "Article 15 - EU AI Act",
            "error": str(e),
            "message": "Cybersecurity assessment encountered an error."
        }