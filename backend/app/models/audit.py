from enum import StrEnum

from pydantic import BaseModel, Field


class AuditStatus(StrEnum):
    OPEN = "Open"
    CLOSED = "Closed"


class VerificationStatus(StrEnum):
    VERIFIED = "Verified"
    MISSING = "Missing"
    DAMAGED = "Damaged"


class AuditAsset(BaseModel):
    asset_tag: str
    asset_name: str
    expected_location: str
    verification: VerificationStatus


class AuditCycle(BaseModel):
    id: int
    name: str
    scope: str
    date_range: str
    auditors: list[str]
    status: AuditStatus
    assets: list[AuditAsset]


class AuditCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    scope: str = Field(min_length=2, max_length=120)
    date_range: str = Field(min_length=2, max_length=120)
    auditors: list[str] = Field(min_length=1)


class AuditVerificationRequest(BaseModel):
    verification: VerificationStatus


class AuditWorkspace(BaseModel):
    cycles: list[AuditCycle]
    discrepancy_count: int

