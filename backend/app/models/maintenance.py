from enum import StrEnum

from pydantic import BaseModel, Field


class MaintenancePriority(StrEnum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class MaintenanceStatus(StrEnum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    TECHNICIAN_ASSIGNED = "Technician Assigned"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"


class MaintenanceRequest(BaseModel):
    id: int
    asset_tag: str
    asset_name: str
    issue: str
    priority: MaintenancePriority
    raised_by: str
    technician: str | None = None
    status: MaintenanceStatus


class MaintenanceCreateRequest(BaseModel):
    asset_tag: str = Field(min_length=2, max_length=40)
    asset_name: str = Field(min_length=2, max_length=120)
    issue: str = Field(min_length=4, max_length=400)
    priority: MaintenancePriority
    raised_by: str = Field(min_length=2, max_length=120)


class MaintenanceTransitionRequest(BaseModel):
    status: MaintenanceStatus
    technician: str | None = Field(default=None, max_length=120)


class MaintenanceWorkspace(BaseModel):
    requests: list[MaintenanceRequest]
    statuses: list[MaintenanceStatus]

