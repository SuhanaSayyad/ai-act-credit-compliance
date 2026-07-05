"""
EU AI Act Compliance Tool - Knowledge Graph Setup
Populates Neo4j with compliance knowledge annotated with:
  - DPV v2.3 (W3C Data Privacy Vocabulary) https://w3id.org/dpv#
  - DPV EU AI Act extension https://w3id.org/dpv/legal/eu/aiact#
  - DPV Risk extension https://w3id.org/dpv/risk#
  - AIRO (AI Risk Ontology) https://w3id.org/airo#

The graph includes typed relationships between nodes enabling
multi-hop inference: a single Cypher traversal can move from
a system characteristic to applicable legal obligations to
relevant threats to recommended controls. This implements
knowledge graph reasoning rather than simple lookup.
"""

from neo4j import GraphDatabase
from dotenv import load_dotenv
import os

load_dotenv()

URI      = os.getenv("NEO4J_URI")
USERNAME = os.getenv("NEO4J_USERNAME")
PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))

DPV       = "https://w3id.org/dpv#"
DPV_AIACT = "https://w3id.org/dpv/legal/eu/aiact#"
DPV_RISK  = "https://w3id.org/dpv/risk#"
AIRO      = "https://w3id.org/airo#"


def setup_knowledge_graph():
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")

        # ── Legal Articles ────────────────────────────────────────────────
        articles = [
            ("ART9",  "Article 9",     "Risk Management System",
             "Providers must establish, implement, document and maintain a risk management system",
             f"{DPV_AIACT}RiskManagementSystem", f"{AIRO}RiskManagement",          f"{DPV_RISK}RiskManagement"),
            ("ART10", "Article 10(5)", "Bias Detection on Special Category Data",
             "Processing of special category data for bias detection with mandatory safeguards",
             f"{DPV_AIACT}DataGovernance",        f"{AIRO}BiasRisk",                f"{DPV}SpecialCategoryData"),
            ("ART13", "Article 13",    "Transparency and Explainability",
             "High-risk AI systems must provide transparency enabling correct interpretation of outputs",
             f"{DPV_AIACT}Transparency",          f"{AIRO}TransparencyRisk",        f"{DPV}Transparency"),
            ("ART15", "Article 15",    "Cybersecurity and Robustness",
             "High-risk AI systems must achieve appropriate cybersecurity levels",
             f"{DPV_AIACT}Accuracy",              f"{AIRO}SecurityRisk",            f"{DPV_RISK}SecurityBreach"),
            ("ART27", "Article 27",    "Fundamental Rights Impact Assessment",
             "Deployers must conduct and register a FRIA before first use",
             f"{DPV_AIACT}FRIA",                  f"{AIRO}FundamentalRightsImpact", f"{DPV}ImpactAssessment"),
        ]
        for code, name, title, requirement, dpv_uri, airo_uri, dpv_risk_uri in articles:
            session.run(
                """CREATE (a:LegalArticle {
                    code:$code, name:$name, title:$title, requirement:$requirement,
                    dpv_uri:$dpv_uri, airo_uri:$airo_uri, dpv_risk_uri:$dpv_risk_uri,
                    ontology_note:'Annotated with DPV v2.3 EU AI Act extension and AIRO'
                })""",
                code=code, name=name, title=title, requirement=requirement,
                dpv_uri=dpv_uri, airo_uri=airo_uri, dpv_risk_uri=dpv_risk_uri
            )

        # ── Fundamental Rights ────────────────────────────────────────────
        rights = [
            ("RIGHT_PRIVACY",          "Right to Privacy",           "Article 8 EU Charter",
             "Protection of personal data and private life",
             f"{DPV}Privacy",                  f"{AIRO}PrivacyRisk",
             ["ART27", "ART10"]),
            ("RIGHT_NONDISCRIMINATION","Right to Non-Discrimination", "Article 21 EU Charter",
             "Prohibition of discrimination based on protected characteristics",
             f"{DPV}NonDiscriminationRight",   f"{AIRO}BiasRisk",
             ["ART27", "ART10"]),
            ("RIGHT_DIGNITY",          "Human Dignity",              "Article 1 EU Charter",
             "Inviolability of human dignity in automated credit decisions",
             f"{DPV}HumanDignity",             f"{AIRO}HumanOversightRisk",
             ["ART27"]),
            ("RIGHT_FAIR_TRIAL",       "Right to Fair Trial",        "Article 47 EU Charter",
             "Right to effective judicial protection and ability to contest decisions",
             f"{DPV}RightToEffectiveRemedies", f"{AIRO}AccountabilityRisk",
             ["ART27", "ART13"]),
            ("RIGHT_REMEDY",           "Right to Effective Remedy",  "Article 47 EU Charter",
             "Right to challenge automated decisions and obtain meaningful explanation",
             f"{DPV}RightToEffectiveRemedies", f"{AIRO}TransparencyRisk",
             ["ART27", "ART13"]),
            ("RIGHT_EQUAL_TREATMENT",  "Right to Equal Treatment",   "Article 20 EU Charter",
             "Equality before the law regardless of personal status",
             f"{DPV}EqualTreatment",           f"{AIRO}BiasRisk",
             ["ART27", "ART10"]),
            ("RIGHT_DATA_PROTECTION",  "Right to Data Protection",   "Article 8 EU Charter",
             "Protection from unlawful or disproportionate data processing",
             f"{DPV}DataProtection",           f"{AIRO}PrivacyRisk",
             ["ART27", "ART10"]),
        ]
        for code, name, article, description, dpv_uri, airo_uri, related_articles in rights:
            session.run(
                """CREATE (r:FundamentalRight {
                    code:$code, name:$name, article:$article, description:$description,
                    dpv_uri:$dpv_uri, airo_uri:$airo_uri,
                    ontology_note:'Annotated with DPV v2.3 and AIRO fundamental rights concepts'
                })""",
                code=code, name=name, article=article, description=description,
                dpv_uri=dpv_uri, airo_uri=airo_uri
            )

        # ── Threats ───────────────────────────────────────────────────────
        threats = [
            ("THREAT_POISON",     "Data Poisoning Attack",       "HIGH",   "STRIDE_TAMPERING",
             "Malicious modification of training data to corrupt model behaviour",
             f"{AIRO}SecurityRisk",        f"{DPV_RISK}MaliciousCodeAttack",     "ART15"),
            ("THREAT_EVASION",    "Model Evasion Attack",        "HIGH",   "STRIDE_TAMPERING",
             "Crafted adversarial inputs designed to cause incorrect predictions",
             f"{AIRO}SecurityRisk",        f"{DPV_RISK}MaliciousCodeAttack",     "ART15"),
            ("THREAT_INVERSION",  "Model Inversion Attack",      "MEDIUM", "STRIDE_INFO_DISCLOSURE",
             "Reconstructing sensitive training data from model outputs",
             f"{AIRO}PrivacyRisk",         f"{DPV_RISK}IdentityTheft",           "ART15"),
            ("THREAT_EXTRACTION", "Model Extraction Attack",     "MEDIUM", "STRIDE_INFO_DISCLOSURE",
             "Stealing the model by querying it to train a surrogate",
             f"{AIRO}SecurityRisk",        f"{DPV_RISK}UnauthorisedAccessToSystem","ART15"),
            ("THREAT_MEMBERSHIP", "Membership Inference Attack", "MEDIUM", "STRIDE_INFO_DISCLOSURE",
             "Determining if a specific record was used in model training",
             f"{AIRO}PrivacyRisk",         f"{DPV_RISK}DataBreach",              "ART15"),
            ("THREAT_BACKDOOR",   "Backdoor Attack",             "HIGH",   "STRIDE_TAMPERING",
             "Hidden triggers causing targeted misclassification",
             f"{AIRO}SecurityRisk",        f"{DPV_RISK}MaliciousCodeAttack",     "ART15"),
            ("THREAT_REPUDIATION","Audit Log Tampering",         "MEDIUM", "STRIDE_REPUDIATION",
             "Tampering with audit logs to conceal malicious activity",
             f"{AIRO}AccountabilityRisk",  f"{DPV_RISK}UnauthorisedSystemModification","ART15"),
            ("THREAT_DOS",        "Denial of Service Attack",    "LOW",    "STRIDE_DOS",
             "Overloading the inference endpoint to make it unavailable",
             f"{AIRO}SecurityRisk",        f"{DPV_RISK}SystemFailure",           "ART15"),
        ]
        for code, name, severity, stride, description, airo_uri, dpv_risk_uri, governed_by in threats:
            session.run(
                """CREATE (t:Threat {
                    code:$code, name:$name, severity:$severity,
                    stride_category:$stride, description:$description,
                    airo_uri:$airo_uri, dpv_risk_uri:$dpv_risk_uri,
                    ontology_note:'Annotated with AIRO and DPV Risk extension concepts'
                })""",
                code=code, name=name, severity=severity, stride=stride,
                description=description, airo_uri=airo_uri, dpv_risk_uri=dpv_risk_uri
            )

        # ── Controls ──────────────────────────────────────────────────────
        controls = [
            ("CTRL_DATA_VALIDATION", "Data Validation and Sanitisation",
             "Validate, sanitise and monitor all training data inputs for anomalies",
             "THREAT_POISON",      f"{DPV}TechnicalMeasure",    f"{AIRO}RiskControl"),
            ("CTRL_ADVERSARIAL",   "Adversarial Robustness Testing",
             "Test model against adversarial examples using FGSM and PGD",
             "THREAT_EVASION",     f"{DPV}TechnicalMeasure",    f"{AIRO}RiskControl"),
            ("CTRL_ACCESS_CONTROL","Strict API Access Controls",
             "Implement role-based access, authentication, and rate limiting",
             "THREAT_EXTRACTION",  f"{DPV}AccessControlMethod", f"{AIRO}RiskControl"),
            ("CTRL_DIFFERENTIAL",  "Differential Privacy",
             "Apply differential privacy to limit membership inference risk",
             "THREAT_MEMBERSHIP",  f"{DPV}DifferentialPrivacy", f"{AIRO}RiskControl"),
            ("CTRL_AUDIT_LOGGING", "Tamper-Evident Audit Logging",
             "Implement cryptographically signed logs retained for six months",
             "THREAT_REPUDIATION", f"{DPV}Audit",               f"{AIRO}RiskControl"),
            ("CTRL_RATE_LIMITING", "API Rate Limiting and Query Monitoring",
             "Limit query rates and monitor for suspicious usage",
             "THREAT_DOS",         f"{DPV}AccessControlMethod", f"{AIRO}RiskControl"),
            ("CTRL_MODEL_MONITORING","Continuous Model Output Monitoring",
             "Monitor outputs in production for drift, anomalies and backdoor activation",
             "THREAT_BACKDOOR",    f"{DPV}Assessment",          f"{AIRO}RiskControl"),
            ("CTRL_ENCRYPTION",    "End-to-End Data Encryption",
             "Encrypt all personal data at rest and in transit",
             "THREAT_INVERSION",   f"{DPV}Encryption",          f"{AIRO}RiskControl"),
        ]
        for code, name, description, mitigates, dpv_uri, airo_uri in controls:
            session.run(
                """CREATE (c:Control {
                    code:$code, name:$name, description:$description,
                    mitigates:$mitigates,
                    dpv_uri:$dpv_uri, airo_uri:$airo_uri,
                    ontology_note:'Annotated with DPV measures and AIRO control concepts'
                })""",
                code=code, name=name, description=description, mitigates=mitigates,
                dpv_uri=dpv_uri, airo_uri=airo_uri
            )

        # ── Risk Factors ──────────────────────────────────────────────────
        risk_factors = [
            ("RISK_AUTOMATION",    "Automation Without Human Oversight",
             "System makes decisions without meaningful human review",
             "ART9",  f"{DPV}AutomatedDecisionMaking",  f"{AIRO}HumanOversightRisk"),
            ("RISK_SPECIAL_DATA",  "Special Category Data Processing",
             "System processes sensitive personal data",
             "ART10", f"{DPV}SpecialCategoryData",       f"{AIRO}BiasRisk"),
            ("RISK_EXPLAINABILITY","Lack of Explainability Method",
             "System cannot explain individual decisions to affected persons",
             "ART13", f"{DPV}Transparency",               f"{AIRO}TransparencyRisk"),
            ("RISK_EXTERNAL_API",  "Uncontrolled External API Exposure",
             "Model accessible externally without adequate security controls",
             "ART15", f"{DPV}AccessControlMethod",        f"{AIRO}SecurityRisk"),
            ("RISK_KNOWN_BIAS",    "Documented Bias Issues",
             "System has known or suspected bias against protected groups",
             "ART10", f"{DPV}NonDiscriminationRight",     f"{AIRO}BiasRisk"),
            ("RISK_NO_AUDIT",      "Absent or Inadequate Audit Logging",
             "System lacks tamper-evident audit trail",
             "ART15", f"{DPV}Audit",                      f"{AIRO}AccountabilityRisk"),
        ]
        for code, name, description, article, dpv_uri, airo_uri in risk_factors:
            session.run(
                """CREATE (rf:RiskFactor {
                    code:$code, name:$name, description:$description, article:$article,
                    dpv_uri:$dpv_uri, airo_uri:$airo_uri,
                    ontology_note:'Annotated with DPV v2.3 and AIRO risk concepts'
                })""",
                code=code, name=name, description=description, article=article,
                dpv_uri=dpv_uri, airo_uri=airo_uri
            )

        # ════════════════════════════════════════════════════════════════
        # TYPED RELATIONSHIPS - enable multi-hop knowledge graph inference
        # These relationships allow a single Cypher traversal to move from
        # legal article -> fundamental rights -> threats -> controls
        # This is what distinguishes a reasoning knowledge graph from
        # a simple lookup table.
        # ════════════════════════════════════════════════════════════════

        # Articles REQUIRES_ASSESSMENT_OF FundamentalRights
        article_right_links = [
            ("ART27", "RIGHT_PRIVACY"),
            ("ART27", "RIGHT_NONDISCRIMINATION"),
            ("ART27", "RIGHT_DIGNITY"),
            ("ART27", "RIGHT_FAIR_TRIAL"),
            ("ART27", "RIGHT_REMEDY"),
            ("ART27", "RIGHT_EQUAL_TREATMENT"),
            ("ART27", "RIGHT_DATA_PROTECTION"),
            ("ART10", "RIGHT_NONDISCRIMINATION"),
            ("ART10", "RIGHT_EQUAL_TREATMENT"),
            ("ART10", "RIGHT_DATA_PROTECTION"),
            ("ART13", "RIGHT_FAIR_TRIAL"),
            ("ART13", "RIGHT_REMEDY"),
            ("ART9",  "RIGHT_DIGNITY"),
        ]
        for art_code, right_code in article_right_links:
            session.run(
                """MATCH (a:LegalArticle {code:$art}), (r:FundamentalRight {code:$right})
                   CREATE (a)-[:REQUIRES_ASSESSMENT_OF {
                       relationship_type: 'legal_obligation',
                       dpv_uri: 'https://w3id.org/dpv#hasRight',
                       note: 'DPV dpv:hasRight relationship'
                   }]->(r)""",
                art=art_code, right=right_code
            )

        # Threats GOVERNED_BY Articles
        threat_article_links = [
            ("THREAT_POISON",     "ART15"),
            ("THREAT_EVASION",    "ART15"),
            ("THREAT_INVERSION",  "ART15"),
            ("THREAT_EXTRACTION", "ART15"),
            ("THREAT_MEMBERSHIP", "ART15"),
            ("THREAT_BACKDOOR",   "ART15"),
            ("THREAT_REPUDIATION","ART15"),
            ("THREAT_DOS",        "ART15"),
            ("THREAT_MEMBERSHIP", "ART10"),
            ("THREAT_INVERSION",  "ART10"),
        ]
        for threat_code, art_code in threat_article_links:
            session.run(
                """MATCH (t:Threat {code:$threat}), (a:LegalArticle {code:$art})
                   CREATE (t)-[:GOVERNED_BY {
                       relationship_type: 'regulatory_scope',
                       dpv_uri: 'https://w3id.org/dpv#hasLegalBasis',
                       note: 'DPV dpv:hasLegalBasis relationship'
                   }]->(a)""",
                threat=threat_code, art=art_code
            )

        # Controls MITIGATES Threats
        control_threat_links = [
            ("CTRL_DATA_VALIDATION", "THREAT_POISON"),
            ("CTRL_ADVERSARIAL",     "THREAT_EVASION"),
            ("CTRL_ACCESS_CONTROL",  "THREAT_EXTRACTION"),
            ("CTRL_ACCESS_CONTROL",  "THREAT_DOS"),
            ("CTRL_DIFFERENTIAL",    "THREAT_MEMBERSHIP"),
            ("CTRL_AUDIT_LOGGING",   "THREAT_REPUDIATION"),
            ("CTRL_RATE_LIMITING",   "THREAT_DOS"),
            ("CTRL_RATE_LIMITING",   "THREAT_EXTRACTION"),
            ("CTRL_MODEL_MONITORING","THREAT_BACKDOOR"),
            ("CTRL_MODEL_MONITORING","THREAT_POISON"),
            ("CTRL_ENCRYPTION",      "THREAT_INVERSION"),
            ("CTRL_ENCRYPTION",      "THREAT_MEMBERSHIP"),
        ]
        for ctrl_code, threat_code in control_threat_links:
            session.run(
                """MATCH (c:Control {code:$ctrl}), (t:Threat {code:$threat})
                   CREATE (c)-[:MITIGATES {
                       relationship_type: 'risk_control',
                       airo_uri: 'https://w3id.org/airo#mitigates',
                       note: 'AIRO airo:mitigates relationship'
                   }]->(t)""",
                ctrl=ctrl_code, threat=threat_code
            )

        # RiskFactors IMPLY Threats (inference rules)
        # These enable the IMPLIES traversal: a system characteristic
        # implies a threat, which is governed by an article,
        # which is mitigated by a control. Full chain in one Cypher query.
        risk_threat_implications = [
            ("RISK_EXTERNAL_API",  "THREAT_EXTRACTION", "External API access implies model extraction risk"),
            ("RISK_EXTERNAL_API",  "THREAT_INVERSION",  "External API access implies model inversion risk"),
            ("RISK_EXTERNAL_API",  "THREAT_DOS",        "External API access implies denial of service risk"),
            ("RISK_NO_AUDIT",      "THREAT_REPUDIATION","No audit logging implies repudiation risk"),
            ("RISK_SPECIAL_DATA",  "THREAT_MEMBERSHIP", "Special category data implies membership inference risk"),
            ("RISK_AUTOMATION",    "THREAT_EVASION",    "Automation without oversight implies higher evasion impact"),
            ("RISK_KNOWN_BIAS",    "THREAT_POISON",     "Known bias may indicate historical data poisoning"),
        ]
        for risk_code, threat_code, reason in risk_threat_implications:
            session.run(
                """MATCH (rf:RiskFactor {code:$risk}), (t:Threat {code:$threat})
                   CREATE (rf)-[:IMPLIES {
                       relationship_type: 'risk_inference',
                       reason: $reason,
                       airo_uri: 'https://w3id.org/airo#hasRisk',
                       note: 'AIRO airo:hasRisk inference relationship'
                   }]->(t)""",
                risk=risk_code, threat=threat_code, reason=reason
            )

        # Articles REQUIRE RiskFactors to be assessed
        article_risk_links = [
            ("ART9",  "RISK_AUTOMATION"),
            ("ART9",  "RISK_EXPLAINABILITY"),
            ("ART9",  "RISK_EXTERNAL_API"),
            ("ART9",  "RISK_NO_AUDIT"),
            ("ART10", "RISK_SPECIAL_DATA"),
            ("ART10", "RISK_KNOWN_BIAS"),
            ("ART13", "RISK_EXPLAINABILITY"),
            ("ART15", "RISK_EXTERNAL_API"),
            ("ART15", "RISK_NO_AUDIT"),
        ]
        for art_code, risk_code in article_risk_links:
            session.run(
                """MATCH (a:LegalArticle {code:$art}), (rf:RiskFactor {code:$risk})
                   CREATE (a)-[:REQUIRES_RISK_ASSESSMENT_OF {
                       relationship_type: 'compliance_requirement',
                       dpv_uri: 'https://w3id.org/dpv/risk#hasRiskManagement',
                       note: 'DPV risk:hasRiskManagement relationship'
                   }]->(rf)""",
                art=art_code, risk=risk_code
            )

        # Ontology metadata node
        session.run("""
            CREATE (o:OntologyAlignment {
                name: 'EU AI Act Compliance Tool Ontology Alignment',
                dpv_version: '2.3',
                dpv_namespace: 'https://w3id.org/dpv#',
                dpv_aiact_namespace: 'https://w3id.org/dpv/legal/eu/aiact#',
                dpv_risk_namespace: 'https://w3id.org/dpv/risk#',
                airo_namespace: 'https://w3id.org/airo#',
                relationships: 'REQUIRES_ASSESSMENT_OF, GOVERNED_BY, MITIGATES, IMPLIES, REQUIRES_RISK_ASSESSMENT_OF',
                implementation_note: 'Neo4j property graph with ontology URIs as node properties and typed relationships enabling multi-hop inference. Supports future migration to RDF triple store.',
                citation_dpv: 'Pandit et al. Data Privacy Vocabulary DPV Version 2.0. ISWC 2024.',
                citation_airo: 'Golpayegani, Pandit, Lewis. AIRO: An Ontology for Representing AI Risks. SEMANTICS 2022.'
            })
        """)

        print("Knowledge graph setup complete!")
        print("Created: 5 Legal Articles, 7 Fundamental Rights, 8 Threats, 8 Controls, 6 Risk Factors")
        print("Relationships: REQUIRES_ASSESSMENT_OF, GOVERNED_BY, MITIGATES, IMPLIES, REQUIRES_RISK_ASSESSMENT_OF")
        print()
        print("Ontology annotations:")
        print(f"  DPV v2.3:          {DPV}")
        print(f"  DPV EU AI Act ext: {DPV_AIACT}")
        print(f"  DPV Risk ext:      {DPV_RISK}")
        print(f"  AIRO:              {AIRO}")

setup_knowledge_graph()
driver.close()