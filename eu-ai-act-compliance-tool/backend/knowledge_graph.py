from neo4j import GraphDatabase
from dotenv import load_dotenv
import os

load_dotenv()

URI = os.getenv("NEO4J_URI")
USERNAME = os.getenv("NEO4J_USERNAME")
PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))

def setup_knowledge_graph():
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")

        articles = [
            ("ART9",  "Article 9",     "Risk Management System",                  "Providers must establish, implement, document and maintain a risk management system"),
            ("ART10", "Article 10(5)", "Bias Detection on Special Category Data", "Processing of special category data for bias detection with mandatory safeguards"),
            ("ART13", "Article 13",    "Transparency and Explainability",          "High-risk AI systems must provide transparency and enable correct interpretation of outputs"),
            ("ART15", "Article 15",    "Cybersecurity and Robustness",             "High-risk AI systems must achieve appropriate levels of cybersecurity and resilience"),
            ("ART27", "Article 27",    "Fundamental Rights Impact Assessment",     "Deployers must conduct FRIA before first deployment"),
        ]
        for code, name, title, requirement in articles:
            session.run(
                "CREATE (a:LegalArticle {code: $code, name: $name, title: $title, requirement: $requirement})",
                code=code, name=name, title=title, requirement=requirement
            )

        rights = [
            ("RIGHT_PRIVACY",          "Right to Privacy",              "Article 8 EU Charter",  "Protection of personal data and private life in automated decision-making"),
            ("RIGHT_NONDISCRIMINATION","Right to Non-Discrimination",   "Article 21 EU Charter", "Prohibition of discrimination based on protected characteristics including age, sex, and origin"),
            ("RIGHT_DIGNITY",          "Human Dignity",                 "Article 1 EU Charter",  "Inviolability of human dignity in automated credit decisions"),
            ("RIGHT_FAIR_TRIAL",       "Right to Fair Trial",           "Article 47 EU Charter", "Right to effective judicial protection and ability to contest automated decisions"),
            ("RIGHT_REMEDY",           "Right to Effective Remedy",     "Article 47 EU Charter", "Right to challenge automated decisions and obtain meaningful explanation"),
            ("RIGHT_EQUAL_TREATMENT",  "Right to Equal Treatment",      "Article 20 EU Charter", "Equality before the law regardless of personal status"),
            ("RIGHT_DATA_PROTECTION",  "Right to Data Protection",      "Article 8 EU Charter",  "Protection from unlawful or disproportionate data processing"),
        ]
        for code, name, article, description in rights:
            session.run(
                "CREATE (r:FundamentalRight {code: $code, name: $name, article: $article, description: $description})",
                code=code, name=name, article=article, description=description
            )

        threats = [
            ("THREAT_POISON",      "Data Poisoning Attack",      "HIGH",   "STRIDE_TAMPERING",       "Malicious modification of training data to corrupt model behaviour at inference time"),
            ("THREAT_EVASION",     "Model Evasion Attack",       "HIGH",   "STRIDE_TAMPERING",       "Crafted adversarial inputs designed to cause incorrect predictions at inference"),
            ("THREAT_INVERSION",   "Model Inversion Attack",     "MEDIUM", "STRIDE_INFO_DISCLOSURE", "Reconstructing sensitive training data from model outputs via repeated queries"),
            ("THREAT_EXTRACTION",  "Model Extraction Attack",    "MEDIUM", "STRIDE_INFO_DISCLOSURE", "Stealing the model's decision boundary by querying it repeatedly to train a surrogate"),
            ("THREAT_MEMBERSHIP",  "Membership Inference Attack","MEDIUM", "STRIDE_INFO_DISCLOSURE", "Determining whether a specific individual's record was used in model training"),
            ("THREAT_BACKDOOR",    "Backdoor Attack",            "HIGH",   "STRIDE_TAMPERING",       "Hidden triggers embedded during training causing targeted misclassification on specific inputs"),
            ("THREAT_REPUDIATION", "Audit Log Tampering",        "MEDIUM", "STRIDE_REPUDIATION",     "Tampering with audit logs to conceal malicious activity or deny accountability"),
            ("THREAT_DOS",         "Denial of Service Attack",   "LOW",    "STRIDE_DOS",             "Overloading the inference endpoint to make the system unavailable"),
        ]
        for code, name, severity, stride, description in threats:
            session.run(
                "CREATE (t:Threat {code: $code, name: $name, severity: $severity, stride_category: $stride, description: $description})",
                code=code, name=name, severity=severity, stride=stride, description=description
            )

        controls = [
            ("CTRL_DATA_VALIDATION",    "Data Validation and Sanitisation",          "Validate, sanitise and monitor all training data inputs for anomalies before use",                    "THREAT_POISON"),
            ("CTRL_ADVERSARIAL",        "Adversarial Robustness Testing",             "Test model against adversarial examples using FGSM, PGD and other attack methods before deployment", "THREAT_EVASION"),
            ("CTRL_ACCESS_CONTROL",     "Strict API Access Controls",                 "Implement role-based access, API authentication, and query rate limiting for all endpoints",          "THREAT_EXTRACTION"),
            ("CTRL_DIFFERENTIAL",       "Differential Privacy",                       "Apply differential privacy mechanisms to limit membership inference risk in model outputs",           "THREAT_MEMBERSHIP"),
            ("CTRL_AUDIT_LOGGING",      "Tamper-Evident Audit Logging",               "Implement cryptographically signed, tamper-evident logs retained for at least six months",           "THREAT_REPUDIATION"),
            ("CTRL_RATE_LIMITING",      "API Rate Limiting and Query Monitoring",      "Limit query rates and monitor for suspicious usage patterns to prevent extraction and DoS",          "THREAT_DOS"),
            ("CTRL_MODEL_MONITORING",   "Continuous Model Output Monitoring",         "Monitor model outputs continuously in production for drift, anomalies and backdoor activation",      "THREAT_BACKDOOR"),
            ("CTRL_ENCRYPTION",         "End-to-End Data Encryption",                 "Encrypt all personal and sensitive data at rest and in transit using current cryptographic standards","THREAT_INVERSION"),
        ]
        for code, name, description, mitigates in controls:
            session.run(
                "CREATE (c:Control {code: $code, name: $name, description: $description, mitigates: $mitigates})",
                code=code, name=name, description=description, mitigates=mitigates
            )

        risk_factors = [
            ("RISK_AUTOMATION",    "Automation Without Human Oversight",   "System makes decisions without meaningful human review before effect",    "ART9"),
            ("RISK_SPECIAL_DATA",  "Special Category Data Processing",     "System processes sensitive personal data increasing discrimination risk", "ART10"),
            ("RISK_EXPLAINABILITY","Lack of Explainability Method",        "System cannot explain individual decisions to affected persons",          "ART13"),
            ("RISK_EXTERNAL_API",  "Uncontrolled External API Exposure",   "Model accessible externally without adequate security controls",          "ART15"),
            ("RISK_KNOWN_BIAS",    "Documented Bias Issues",               "System has known or suspected bias against protected groups",             "ART10"),
            ("RISK_NO_AUDIT",      "Absent or Inadequate Audit Logging",   "System lacks tamper-evident audit trail required by Article 12",         "ART15"),
        ]
        for code, name, description, article in risk_factors:
            session.run(
                "CREATE (rf:RiskFactor {code: $code, name: $name, description: $description, article: $article})",
                code=code, name=name, description=description, article=article
            )

        print("Knowledge graph setup complete!")
        print("Created: 5 Legal Articles, 7 Fundamental Rights, 8 Threats, 8 Controls, 6 Risk Factors")

setup_knowledge_graph()
driver.close()
