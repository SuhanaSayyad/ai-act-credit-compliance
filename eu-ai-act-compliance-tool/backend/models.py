from pydantic import BaseModel
from typing import Optional

class CreditScoringSystem(BaseModel):
    system_name: str
    organisation_name: str
    intended_purpose: str
    uses_personal_data: bool = True
    uses_special_category_data: bool = False
    data_sources: str = ""
    data_retention_period: str = ""
    model_type: str = ""
    automated_decision_making: bool = True
    human_oversight_available: bool = True
    explainability_method: Optional[str] = None
    deployment_sector: str = "Banking and Financial Services"
    affected_population: str = ""
    estimated_users_per_year: int = 0
    external_api_access: bool = False
    third_party_data_sharing: bool = False
    audit_logging_enabled: bool = False
    access_controls_implemented: bool = False
    previously_audited: bool = False
    known_bias_issues: bool = False
    model_version: str = "1.0.0"
