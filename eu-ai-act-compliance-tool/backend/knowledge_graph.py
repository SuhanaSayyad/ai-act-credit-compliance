from neo4j import GraphDatabase
from dotenv import load_dotenv
import os

load_dotenv()

URI = os.getenv("NEO4J_URI")
USERNAME = os.getenv("NEO4J_USERNAME")
PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))

# Ontology namespace prefixes (verified W3C/academic URIs)
DPV       = "https://w3id.org/dpv#"
DPV_AIACT = "https://w3id.org/dpv/legal/eu/aiact#"
DPV_RISK  = "https://w3id.org/dpv/risk#"
AIRO      = "https://w3id.org/airo#"


def setup_knowledge_graph():
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")

        articles = [
            ("ART9",  "Article 9",     "Risk Management System",
             "Providers must establish, implement, document and maintain a risk management system",
             f"{DPV_AIACT}RiskManagementSystem", f"{AIRO}RiskManagement",    f"{DPV_RISK}RiskManagement"),
            ("ART10", "Article 10(5)", "Bias Detection on Special Category Data",
             "Processing of special category data is permitted solely for bias detection with mandatory safeguards",
             f"{DPV_AIACT}DataGovernance",        f"{AIRO}BiasRisk",          f"{DPV}SpecialCategoryData"),
            ("ART13", "Article 13",    "Transparency and Explainability",
             "High-risk AI systems must provide transparency enabling correct interpretation of outputs",
             f"{DPV_AIACT}Transparency",          f"{AIRO}TransparencyRisk",  f"{DPV}Transparency"),
            ("ART15", "Article 15",    "Cybersecurity and Robustness",
             "High-risk AI systems must achieve appropriate cybersecurity levels and resilience against attacks",
             f"{DPV_AIACT}Accuracy",              f"{AIRO}SecurityRisk",      f"{DPV_RISK}SecurityBreach"),
            ("ART27", "Article 27",    "Fundamental Rights Impact Assessment",
             "Deployers must conduct and register a FRIA before first use of a high-risk AI system",
             f"{DPV_AIACT}FRIA",                  f"{AIRO}FundamentalRightsImpact", f"{DPV}ImpactAssessment"),
        ]
        for code, name, title, requirement, dpv_uri, airo_uri, dpv_risk_uri in articles:
            session.run(
                """CREATE (a:LegalArticle {
                    code: $code, name: $name, title: $title,
                    requirement: $requirement,
                    dpv_uri: $dpv_uri,
                    airo_uri: $airo_uri,
                    dpv_risk_uri: $dpv_risk_uri,
                    ontology_note: 'Annotated with DPV v2.3 EU AI Act extension and AIRO'
                })""",
                code=code, name=name, title=title, requirement=requirement,
                dpv_uri=dpv_uri, airo_uri=airo_uri, dpv_risk_uri=dpv_risk_uri
            )

        rights = [
            ("RIGHT_PRIVACY",          "Right to Privacy",            "Article 8 EU Charter",
             "Protection of personal data and private life in automated decision-making",
             f"{DPV}Privacy",                  f"{AIRO}PrivacyRisk"),
            ("RIGHT_NONDISCRIMINATION","Right to Non-Discrimination",  "Article 21 EU Charter",
             "Prohibition of discrimination based on protected characteristics including age, sex, ethnic origin",
             f"{DPV}NonDiscriminationRight",   f"{AIRO}BiasRisk"),
            ("RIGHT_DIGNITY",          "Human Dignity",               "Article 1 EU Charter",
             "Inviolability of human dignity in automated credit decisions",
             f"{DPV}HumanDignity",             f"{AIRO}HumanOversightRisk"),
            ("RIGHT_FAIR_TRIAL",       "Right to Fair Trial",         "Article 47 EU Charter",
             "Right to effective judicial protection and ability to contest automated decisions",
             f"{DPV}RightToEffectiveRemedies", f"{AIRO}AccountabilityRisk"),
            ("RIGHT_REMEDY",           "Right to Effective Remedy",   "Article 47 EU Charter",
             "Right to challenge automated decisions and obtain meaningful explanation",
             f"{DPV}RightToEffectiveRemedies", f"{AIRO}TransparencyRisk"),
            ("RIGHT_EQUAL_TREATMENT",  "Right to Equal Treatment",    "Article 20 EU Charter",
             "Equality before the law regardless of personal status",
             f"{DPV}EqualTreatment",           f"{AIRO}BiasRisk"),
            ("RIGHT_DATA_PROTECTION",  "Right to Data Protection",    "Article 8 EU Charter",
             "Protection from unlawful or disproportionate data processing",
             f"{DPV}DataProtection",           f"{AIRO}PrivacyRisk"),
        ]
        for code, name, article, description, dpv_uri, airo_uri in rights:
            session.run(
                """CREATE (r:FundamentalRight {
                    code: $code, name: $name, article: $article,
                    description: $description,
                    dpv_uri: $dpv_uri,
                    airo_uri: $airo_uri,
                    ontology_note: 'Annotated with DPV v2.3 and AIRO fundamental rights concepts'
                })""",
                code=code, name=name, article=article, description=description,
                dpv_uri=dpv_uri, airo_uri=airo_uri
            )

        threats = [
            ("THREAT_POISON",     "Data Poisoning Attack",      "HIGH",   "STRIDE_TAMPERING",
             "Malicious modification of training data to corrupt model behaviour at inference time",
             f"{AIRO}SecurityRisk", f"{DPV_RISK}MaliciousCodeAttack"),
            ("THREAT_EVASION",    "Model Evasion Attack",       "HIGH",   "STRIDE_TAMPERING",
             "Crafted adversarial inputs designed to cause incorrect predictions at inference",
             f"{AIRO}SecurityRisk", f"{DPV_RISK}MaliciousCodeAttack"),
            ("THREAT_INVERSION",  "Model Inversion Attack",     "MEDIUM", "STRIDE_INFO_DISCLOSURE",
             "Reconstructing sensitive training data from model outputs via repeated queries",
             f"{AIRO}PrivacyRisk",  f"{DPV_RISK}IdentityTheft"),
            ("THREAT_EXTRACTION", "Model Extraction Attack",    "MEDIUM", "STRIDE_INFO_DISCLOSURE",
             "Stealing the model decision boundary by querying it to train a surrogate",
             f"{AIRO}SecurityRisk", f"{DPV_RISK}UnauthorisedAccessToSystem"),
            ("THREAT_MEMBERSHIP", "Membership Inference Attack","MEDIUM", "STRIDE_INFO_DISCLOSURE",
             "Determining whether a specific individual record was used in model training",
             f"{AIRO}PrivacyRisk",  f"{DPV_RISK}DataBreach"),
            ("THREAT_BACKDOOR",   "Backdoor Attack",            "HIGH",   "STRIDE_TAMPERING",
             "Hidden triggers embedded during training causing targeted misclassification",
             f"{AIRO}SecurityRisk", f"{DPV_RISK}MaliciousCodeAttack"),
            ("THREAT_REPUDIATION","Audit Log Tampering",        "MEDIUM", "STRIDE_REPUDIATION",
             "Tampering with audit logs to conceal malicious activity or deny accountability",
             f"{AIRO}AccountabilityRisk", f"{DPV_RISK}UnauthorisedSystemModification"),
            ("THREAT_DOS",        "Denial of Service Attack",   "LOW",    "STRIDE_DOS",
             "Overloading the inference endpoint to make the system unavailable",
             f"{AIRO}SecurityRisk", f"{DPV_RISK}SystemFailure"),
        ]
        for code, name, severity, stride, description, airo_uri, dpv_risk_uri in threats:
            session.run(
                """CREATE (t:Threat {
                    code: $code, name: $name, severity: $severity,
                    stride_category: $stride, description: $description,
                    airo_uri: $airo_uri,
                    dpv_risk_uri: $dpv_risk_uri,
                    ontology_note: 'Annotated with AIRO and DPV Risk extension concepts'
                })""",
                code=code, name=name, severity=severity, stride=stride,
                description=description, airo_uri=airo_uri, dpv_risk_uri=dpv_risk_uri
            )

        controls = [
            ("CTRL_DATA_VALIDATION","Data Validation and Sanitisation",
             "Validate, sanitise and monitor all training data inputs for anomalies before use",
             "THREAT_POISON",      f"{DPV}TechnicalMeasure",   f"{AIRO}RiskControl"),
            ("CTRL_ADVERSARIAL",   "Adversarial Robustness Testing",
             "Test model against adversarial examples using FGSM and PGD before deployment",
             "THREAT_EVASION",     f"{DPV}TechnicalMeasure",   f"{AIRO}RiskControl"),
            ("CTRL_ACCESS_CONTROL","Strict API Access Controls",
             "Implement role-based access, API authentication, and query rate limiting",
             "THREAT_EXTRACTION",  f"{DPV}AccessControlMethod",f"{AIRO}RiskControl"),
            ("CTRL_DIFFERENTIAL",  "Differential Privacy",
             "Apply differential privacy to limit membership inference risk in model outputs",
             "THREAT_MEMBERSHIP",  f"{DPV}DifferentialPrivacy",f"{AIRO}RiskControl"),
            ("CTRL_AUDIT_LOGGING", "Tamper-Evident Audit Logging",
             "Implement cryptographically signed tamper-evident logs retained for six months",
             "THREAT_REPUDIATION", f"{DPV}Audit",              f"{AIRO}RiskControl"),
            ("CTRL_RATE_LIMITING", "API Rate Limiting and Query Monitoring",
             "Limit query rates and monitor for suspicious usage to prevent extraction and DoS",
             "THREAT_DOS",         f"{DPV}AccessControlMethod",f"{AIRO}RiskControl"),
            ("CTRL_MODEL_MONITORING","Continuous Model Output Monitoring",
             "Monitor model outputs in production for drift, anomalies and backdoor activation",
             "THREAT_BACKDOOR",    f"{DPV}Assessment",         f"{AIRO}RiskControl"),
            ("CTRL_ENCRYPTION",    "End-to-End Data Encryption",
             "Encrypt all personal data at rest and in transit using current cryptographic standards",
             "THREAT_INVERSION",   f"{DPV}Encryption",         f"{AIRO}RiskControl"),
        ]
        for code, name, description, mitigates, dpv_uri, airo_uri in controls:
            session.run(
                """CREATE (c:Control {
                    code: $code, name: $name, description: $description,
                    mitigates: $mitigates,
                    dpv_uri: $dpv_uri,
                    airo_uri: $airo_uri,
                    ontology_note: 'Annotated with DPV technical/organisational measures and AIRO control concepts'
                })""",
                code=code, name=name, description=description, mitigates=mitigates,
                dpv_uri=dpv_uri, airo_uri=airo_uri
            )

        risk_factors = [
            ("RISK_AUTOMATION",   "Automation Without Human Oversight",
             "System makes decisions without meaningful human review before effect",
             "ART9",  f"{DPV}AutomatedDecisionMaking",  f"{AIRO}HumanOversightRisk"),
            ("RISK_SPECIAL_DATA", "Special Category Data Processing",
             "System processes sensitive personal data increasing discrimination risk",
             "ART10", f"{DPV}SpecialCategoryData",       f"{AIRO}BiasRisk"),
            ("RISK_EXPLAINABILITY","Lack of Explainability Method",
             "System cannot explain individual decisions to affected persons",
             "ART13", f"{DPV}Transparency",               f"{AIRO}TransparencyRisk"),
            ("RISK_EXTERNAL_API", "Uncontrolled External API Exposure",
             "Model accessible externally without adequate security controls",
             "ART15", f"{DPV}AccessControlMethod",        f"{AIRO}SecurityRisk"),
            ("RISK_KNOWN_BIAS",   "Documented Bias Issues",
             "System has known or suspected bias against protected groups",
             "ART10", f"{DPV}NonDiscriminationRight",     f"{AIRO}BiasRisk"),
            ("RISK_NO_AUDIT",     "Absent or Inadequate Audit Logging",
             "System lacks tamper-evident audit trail required by Article 12",
             "ART15", f"{DPV}Audit",                      f"{AIRO}AccountabilityRisk"),
        ]
        for code, name, description, article, dpv_uri, airo_uri in risk_factors:
            session.run(
                """CREATE (rf:RiskFactor {
                    code: $code, name: $name, description: $description,
                    article: $article,
                    dpv_uri: $dpv_uri,
                    airo_uri: $airo_uri,
                    ontology_note: 'Annotated with DPV v2.3 and AIRO risk concepts'
                })""",
                code=code, name=name, description=description, article=article,
                dpv_uri=dpv_uri, airo_uri=airo_uri
            )

        # Ontology metadata node documents the alignment for this implementation
        session.run("""
            CREATE (o:OntologyAlignment {
                name: 'EU AI Act Compliance Tool Ontology Alignment',
                dpv_version: '2.3',
                dpv_namespace: 'https://w3id.org/dpv#',
                dpv_aiact_namespace: 'https://w3id.org/dpv/legal/eu/aiact#',
                dpv_risk_namespace: 'https://w3id.org/dpv/risk#',
                airo_namespace: 'https://w3id.org/airo#',
                implementation_note: 'This graph uses a Neo4j property graph with ontology URIs stored as node properties. Each node carries dpv_uri and airo_uri annotations mapping to DPV v2.3 and AIRO formal ontology concepts. This supports future migration to an RDF triple store while maintaining Cypher query performance.',
                future_work: 'Full RDF materialisation using DPV SPARQL endpoints and AIRO OWL reasoner',
                citation_dpv: 'Pandit et al. Data Privacy Vocabulary DPV Version 2.0. ISWC 2024.',
                citation_airo: 'Golpayegani, Pandit, Lewis. AIRO: An Ontology for Representing AI Risks Based on the EU AI Act. SEMANTICS 2022.'
            })
        """)

        print("Knowledge graph setup complete!")
        print("Created: 5 Legal Articles, 7 Fundamental Rights, 8 Threats, 8 Controls, 6 Risk Factors, 1 Ontology Alignment node")
        print()
        print("Ontology annotations applied:")
        print(f"  DPV v2.3:          {DPV}")
        print(f"  DPV EU AI Act ext: {DPV_AIACT}")
        print(f"  DPV Risk ext:      {DPV_RISK}")
        print(f"  AIRO:              {AIRO}")

setup_knowledge_graph()
driver.close()