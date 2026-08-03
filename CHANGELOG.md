# Changelog

All notable changes to the EU AI Act Compliance Tool for High-Risk Credit Scoring AI are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [2026-08-03] - Kappa Calculation and Final Documentation

### Added
- Computed actual Cohen's quadratic weighted Kappa across all six completed expert reviewer responses (previously reported as pending)
- Reported real result: mean Kappa 0.317 (Fair agreement) across all fifteen reviewer pairs, rising to 0.442 (Moderate agreement) when the one reviewer whose ratings diverge most is excluded
- Added rubric-section breakdown analysis showing agreement varies by module (overall usefulness: 0.507; module-specific technical accuracy: 0.00-0.25), consistent with a diverse panel judging their own domain of expertise more critically
- Explicitly named the defect-handling process as a five-stage Verification and Validation cycle: found, verified against source, fixed, re-tested, reconfirmed

### Changed
- Final Results Report and conference paper updated to state EC5 (expert Kappa) explicitly as not meeting the original 0.60 threshold, with the divergence explanation reported alongside rather than the result being softened or hidden
- Conference paper Abstract updated to include the Kappa result, previously omitted

### Fixed
- Corrected a cross-reference error introduced during Kappa integration (pointed to wrong internal section)
- Fixed IEEE reference formatting for Barocas et al. book citation (title was neither quoted nor italicised; now correctly italicised per IEEE convention for book titles)

---

## [2026-08-02] - Real Original Paper Discovered and Merged

### Changed
- Discovered that an earlier AI-assisted reconstruction of the conference paper was missing substantial real technical detail present in the actual previously-submitted short paper
- Rebuilt the conference paper using the real original as the base, preserving all original technical content (four bias metrics SPD/DI/EOD/AOD, six-source adaptive threshold derivation, confidence scoring mechanism, individual-level SHAP explanations, non-blocking startup implementation detail, RF-on-numpy-arrays implementation detail)
- Added new Section V.I "Expert Review and Independent Audit" integrating Type 2 (qualitative) evaluation evidence into the existing Type 1 (quantitative) paper

### Added
- Five new references to support previously uncited claims: Microsoft Fairlearn (Bird et al.), LIME (Ribeiro et al.), EU Charter of Fundamental Rights, GDPR (Regulation 2016/679), and the independent code audit (Van Asten)
- Final Results Report updated with the same missing technical details (four bias metrics, six threshold sources, confidence scoring, individual SHAP explanations, implementation details) for consistency across both documents

### Fixed
- Corrected a citation error where Microsoft Fairlearn was cited against the EU AI Act regulation itself rather than left properly attributed
- Corrected reviewer attribution: the independent code auditor was previously implied to be one of the six formal rubric respondents; corrected to show him as a separate, seventh, non-rubric reviewer in both documents
- Fixed a findings-count error (previously stated as ten combined findings; corrected to the accurate eight)
- Added explicit named findings for three previously under-described expert review issues (feature importance field mismatch, compliance status visibility, generic cybersecurity mitigation text)

---

## [2026-07-28 to 2026-08-01] - Expert Review Collection

### Added
- Structured fifteen-item Likert rubric completed by six independent domain experts spanning cybersecurity, machine learning, AI governance, data protection law, and a non-specialist perspective
- Unsolicited independent code-level audit received from a Product Lead in Credit Decisioning at a major European bank, published publicly with permission to cite by name
- Detailed written findings from one reviewer identifying five specific, verifiable defects beyond the numeric rubric scores

### Fixed
Seven verified code-level defects identified through expert review, corrected and re-tested against three independently designed test scenarios:
- Bring Your Own Model connector disconnected across three layers of the stack (frontend field, backend router registration, payload construction)
- Seven of twenty-two questionnaire fields collected but never referenced in any compliance calculation
- Bias metric labelling ambiguity: Statistical Parity Difference and Disparate Impact were combined into a single sentence, making a non-compliant SPD value appear to have passed its own threshold
- Feature importance display showing "N/A" due to a backend/frontend field name mismatch (`importance_score` vs `importance`)
- Compliance status determination embedded mid-sentence in report text rather than shown as a distinct, labelled element
- Silent module-failure mode: a failed compliance module previously displayed a falsely reassuring low-risk result instead of an explicit failure indication
- Generic cybersecurity mitigation text, traced to real threat-specific controls already retrieved from the knowledge graph but never attached to individual threat records in the API response

### Changed
- Project documentation corrected to precisely state the tool's scope (five specific mandatory articles), correcting an earlier overclaim implying broader coverage

---

## [2026-07-27] - Reliability and Validation Fixes

### Added
- Client-side required-field validation: eighteen of twenty-two questionnaire fields now block progression with visible error indicators if left empty, preventing the tool from silently generating a complete-looking but substantively meaningless report from incomplete input

### Fixed
- Cross-module explainability inconsistency: `risk.py` used a simpler check for declared explainability method than `fria.py` and `xai.py`, causing the literal string "None" to be treated as a valid explanation method in one module while correctly flagged as non-compliant in the other two. All three modules now use the same negative-keyword detection logic.

---

## [2026-07-26] - Core Module Fixes and Field Utilisation

### Added
- New questionnaire field: estimated users assessed per year (previously hardcoded to 50,000)
- Per-finding and per-section confidence indicators (0-100%) in the results interface
- Context note boxes surfacing deployment-scale and vulnerable-population findings directly in the results view

### Fixed
- Bring Your Own Model (BYOM) connector fully reconnected: frontend field added, backend router registered in the main application, external model call payload no longer hardcoded to null
- All twenty-two questionnaire payload fields wired into compliance logic:
  - `data_sources` and `estimated_users_per_year` now feed Article 9 risk proportionality and proxy-discrimination detection
  - `data_retention_period` and `affected_population` now feed Article 27 GDPR data-minimisation checks and vulnerable-population detection
  - `organisation_name`, `intended_purpose`, and `model_version` now populate report metadata across all five modules

### Changed
- Sensitivity analysis (fifteen scenarios) re-run following the above fixes; all results confirmed consistent with the pre-fix baseline

---

## [2026-07-19] - Interim Results Report Submitted

### Added
- Systematic sensitivity analysis across fifteen controlled input scenarios
- Legal requirement traceability matrix (twenty-one requirements traced to specific EU AI Act article clauses)
- XAI fidelity evaluation against the Kozodoi et al. (2022) published benchmark