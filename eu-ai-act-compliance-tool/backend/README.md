---
title: AI Act Compliance Backend
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# EU AI Act Compliance Tool - Backend API

FastAPI backend for automated EU AI Act compliance assessments for high-risk credit scoring AI under Regulation 2024/1689.

## API Endpoints

| Endpoint | Module | Article |
|---|---|---|
| POST /api/fria/assess | Fundamental Rights Impact Assessment | Art. 27 |
| POST /api/cybersecurity/assess | Cybersecurity Threat Model | Art. 15 |
| POST /api/xai/assess | Explainability Report | Art. 13 |
| POST /api/bias/assess | Bias Detection Report | Art. 10(5) |
| POST /api/risk/assess | Risk Scoring Dashboard | Art. 9 |
| POST /api/demo-model/predict | BYOM Demo Model | - |

## Stack

FastAPI, Neo4j Aura, SHAP, IBM AIF360, scikit-learn, Docker

## Frontend

[ai-act-credit-compliance.vercel.app](https://ai-act-credit-compliance.vercel.app)