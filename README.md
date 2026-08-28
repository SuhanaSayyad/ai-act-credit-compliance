# EU AI Act Compliance Tool for High-Risk Credit Scoring AI

An automated, knowledge graph-driven compliance tool that unifies all five mandatory EU AI Act obligations for high-risk credit scoring AI systems into a single workflow: risk management (Article 9), bias detection (Article 10(5)), explainability (Article 13), cybersecurity (Article 15), and Fundamental Rights Impact Assessment (Article 27).

Built as part of an MSc dissertation in Software Design with Cybersecurity at the Technological University of the Shannon, Athlone.

**Live tool:** https://ai-act-credit-compliance.vercel.app

**Live Demo:** (https://youtu.be/o3SNR8DPZ38)

**Backend API:** https://suhanasayyad-ai-act-compliance-backend.hf.space


**Changelog:** [CHANGELOG.md](./CHANGELOG.md)

---

## The Problem

Credit scoring systems are classified as high-risk AI under Annex III Point 5(b) of Regulation (EU) 2024/1689, triggering five mandatory compliance obligations that must all be satisfied before deployment. Current practice addresses these separately, using different specialist teams and tools, with no unified methodology. A European Banking Authority case study on automated creditworthiness assessment found that manual data collection alone could take up to one week per case before automation. No existing published tool automates coverage of all five obligations in a single workflow.

## What This Tool Does

A five-step guided questionnaire captures a system's characteristics, then generates five legally grounded compliance reports simultaneously:

| Article | Assessment |
|---|---|
| Art. 9 | Risk management scoring across six ISO 31000-aligned risk factors |
| Art. 10(5) | Bias detection using IBM AIF360 (SPD, DI, EOD, AOD), with adaptive thresholds |
| Art. 13 | Architecture-appropriate explainability (SHAP, permutation importance, coefficient weights) with individual-level applicant explanations |
| Art. 15 | Cybersecurity threat assessment against the full MITRE ATLAS taxonomy |
| Art. 27 | Fundamental Rights Impact Assessment across all seven EU Charter rights |

A live "Bring Your Own Model" connector lets organisations assess their own production model instead of the built-in reference dataset.

## Key Results

- **100% legal coverage** of 21 requirements independently traced to specific EU AI Act article clauses
- **63.3% average feature overlap, 0.605 Spearman rank correlation** against a self-defined reference feature-importance ranking, evaluated across three complementary fidelity metrics (see dissertation Chapter 5)
- **Mean full assessment time of 3.085 seconds** across 75 measurements, comfortably within the ten-second success threshold and several orders of magnitude faster than the EBA's documented manual baseline of up to one week per case (no precise speedup multiplier is claimed, since the EBA figure reflects manual data collection specifically, a narrower activity than this tool's complete five-article assessment)
- **15-scenario systematic sensitivity analysis** confirming proportionate, legally consistent behaviour across the full risk spectrum
- **Six independent domain experts** completed structured review (Cohen's weighted Kappa 0.317 overall, rising to 0.442 excluding one reviewer whose independently corroborated audit found the most defects)
- **An unsolicited independent code audit** from a Product Lead in Credit Decisioning at a major European bank identified further real defects, all verified and corrected

Full methodology and results are documented in the dissertation and the accompanying conference paper (see Documentation below).

## Architecture

Three-tier cloud architecture:

- **Presentation layer** - React 18 and TypeScript, deployed on Vercel
- **Application layer** - Python 3.11 FastAPI service, deployed on Hugging Face Spaces (Docker), five compliance API endpoints
- **Knowledge layer** - Neo4j Aura graph database, 34 nodes across five types (legal articles, EU Charter rights, MITRE ATLAS threats, mitigating controls, ISO 31000 risk factors), connected by five typed relationships enabling genuine multi-hop legal reasoning, not static rule lookup

The knowledge graph carries formal ontology annotations from the Data Privacy Vocabulary (DPV) v2 and the AI Risk Ontology (AIRO).

## Repository Structure

This repository contains the frontend application. The backend (FastAPI, Neo4j integration, compliance logic) is maintained in a separate repository and deployed independently to Hugging Face Spaces.

```text
├── src/                    # React/TypeScript frontend source
├── index.html
├── package.json
├── vite.config.ts
├── postcss.config.mjs
├── default_shadcn_theme.css
├── CHANGELOG.md
├── ATTRIBUTIONS.md
└── README.md
```

## Running Locally

This repository (frontend only):

npm install

npm run dev


The frontend expects the backend API to be reachable at the URL configured in the app; by default this points to the live Hugging Face Spaces deployment. To run the backend locally instead, see the backend repository, which requires a Neo4j Aura instance (or local Neo4j) with the knowledge graph schema loaded and database connection environment variables configured.


## Independent Audit

An unsolicited independent code-level audit of the project's source code (frontend and backend) was conducted by a Product Lead in Credit Decisioning at ING, published at his own GitHub. Three substantive findings from that audit, along with five further findings from structured expert review, were verified against the source code and corrected; details are in the changelog and the dissertation's Evaluation chapter.

## Academic Context

**Student:** Suhana Sayyad (A00336132)

**Programme:** MSc Software Design with Cybersecurity

**Institution:** Technological University of the Shannon, Athlone

**Supervisor:** Dr. Amit Hirway

## Limitations

This tool relies on questionnaire-based self-reporting rather than automated technical inspection of deployed systems. The reference dataset for explainability and bias evaluation is the 1994 German Credit (Statlog) dataset; the Bring Your Own Model connector allows evaluation against a real production model instead. The 21 traced legal requirements were defined by the author from the Act's text and have not undergone independent legal review. Full limitations and threats to validity are discussed in the dissertation.

## License

See [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) for third-party libraries and data sources used in this project.
