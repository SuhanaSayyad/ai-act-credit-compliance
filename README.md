# EU AI Act Compliance Tool

Automated compliance assessment for high-risk credit scoring AI systems under **EU Regulation 2024/1689 (EU AI Act)**, Annex III Point 5(b).

**Live Demo:** [ai-act-credit-compliance.vercel.app](https://ai-act-credit-compliance.vercel.app)  

---

## What It Does

Fill in one structured questionnaire about your credit scoring AI system and receive five fully drafted EU AI Act compliance reports in under two seconds.

| Module | Article | Description |
|---|---|---|
| Fundamental Rights Impact Assessment | Art. 27 | Assesses all 7 EU Charter rights with multi-hop knowledge graph traversal |
| Cybersecurity Threat Model | Art. 15 | MITRE ATLAS and STRIDE-AI with graph-inferred threat applicability |
| Explainability Report | Art. 13 | SHAP individual decision explanations, adaptive by model type |
| Risk Scoring Dashboard | Art. 9 | ISO 31000 framework, 6 risk factors scored 1-9 with confidence scores |
| Bias Detection Report | Art. 10(5) | IBM AIF360 fairness metrics with adaptive thresholds by system profile |

---

## Key Technical Features

**Knowledge Graph Reasoning**
Neo4j knowledge graph with 5 typed relationships (REQUIRES_ASSESSMENT_OF, GOVERNED_BY, MITIGATES, IMPLIES, REQUIRES_RISK_ASSESSMENT_OF) annotated with DPV v2.3, DPV EU AI Act extension, DPV Risk, and AIRO ontology namespace URIs. Multi-hop Cypher traversal enables genuine legal inference across node types.

**Adaptive XAI**
Five model types each use the correct explanation method: Logistic Regression uses coefficient-based feature weights, Neural Network uses permutation importance, Random Forest uses Gini impurity, XGBoost and Gradient Boosted Trees use SHAP TreeExplainer. Individual decision explanations are generated for three representative applicants (low, medium, high risk) using SHAP force plot data or marginal contribution analysis, fulfilling the Article 13 obligation to explain specific decisions.

**Adaptive Bias Thresholds**
IBM AIF360 fairness metrics with thresholds that tighten based on system context. Systems with known bias issues and special category data receive stricter SPD (0.02) and disparate impact (0.9 to 1.1) thresholds compared to standard systems (0.05, 0.8 to 1.25).

**Confidence Scores**
Every compliance finding includes a confidence score (0 to 100%) based on how many independent system characteristics directly confirm the risk, addressing the questionnaire-as-proxy limitation.

**BYOM Connector**
Optional model_api_endpoint field accepts a URL to a real production model. XAI and bias modules call the external model for real predictions, producing compliance reports based on actual model behaviour rather than reference dataset proxies.

---

## Evaluation Results

| Metric | Result |
|---|---|
| Legal Requirement Coverage | 100% (21/21 requirements) |
| Fundamental Rights Assessed | 7/7 EU Charter rights |
| MITRE ATLAS Threat Types | 8/8 threat categories |
| XAI Fidelity vs Kozodoi et al. 2022 | 76.7% |
| Average Response Time | 1.96 seconds |
| Test Cases Passed | 3/3 |
| Knowledge Graph Relationships | 5 typed |
| Ontology Annotations | DPV v2.3, AIRO, EU AI Act extension |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | FastAPI, Python 3.11, Docker |
| Deployment | Vercel (frontend), Hugging Face Spaces (backend) |
| Knowledge Graph | Neo4j Aura, Cypher |
| Ontologies | DPV v2.3, AIRO, DPV EU AI Act extension |
| XAI | SHAP, scikit-learn |
| Fairness | IBM AIF360 |
| Dataset | German Credit (Statlog), UCI ML Repository |

---

## Project Structure

```
eu-ai-act-compliance-tool/
  backend/
    main.py                 FastAPI application
    knowledge_graph.py      Neo4j graph setup with ontology annotations
    models.py               Pydantic request model
    routes/
      fria.py               Article 27 - FRIA
      cybersecurity.py      Article 15 - Cybersecurity
      xai.py                Article 13 - Explainability
      bias.py               Article 10(5) - Bias Detection
      risk.py               Article 9 - Risk Scoring
      demo_model.py         BYOM demo endpoint
src/
  app/
    App.tsx                 Landing page and routing
    components/
      QuestionnairePage.tsx 5-step assessment form
      ResultsPage.tsx       Tabbed compliance reports dashboard
```

---

## Academic Context

MSc Dissertation - Software Design with Cybersecurity  
Technological University of the Shannon, Athlone  
Student: Suhana Sayyad (A00336132)  
Supervisor: Dr. Amit Hirway

**Research gap addressed:** Existing literature identifies EU AI Act compliance as a critical challenge for high-risk AI deployers, yet no tool currently unifies the five mandatory assessments under Articles 9, 10(5), 13, 15, and 27 into a single automated workflow. Compliance officers must navigate fragmented tooling, manual legal interpretation, and disparate evaluation frameworks, a process estimated to require 120 to 480 minutes per system assessment. This tool reduces that to under a few seconds while maintaining full legal traceability to the applicable articles.

---

## References

- Kozodoi et al. (2022) - XAI fidelity benchmark
- Pandit et al. (2024) - DPV v2.0, W3C
- Golpayegani, Pandit, Lewis (2022) - AIRO, SEMANTICS
- MITRE ATLAS - AI threat taxonomy
- IBM AIF360 - Fairness toolkit
- EU Regulation 2024/1689 - The EU AI Act
